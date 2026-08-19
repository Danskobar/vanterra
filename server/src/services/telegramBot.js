import TelegramBot from 'node-telegram-bot-api';
import { nanoid } from 'nanoid';
import { db } from './store.js';
import { chat as aiChat } from './aiProvider.js';
import { getNativeBalance, isRpcConfigured } from './onchainRead.js';
import { buildStrategyFromMessage } from './strategy.js';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export const isTelegramConfigured = Boolean(TOKEN);

let bot = null;

// Each app user gets a unique, short-lived link code. They open
// t.me/<bot>?start=<code> from the VANTERRA web app (their own account,
// their own Telegram) — the bot reads the /start payload and links that
// specific chat to that specific wallet address server-side. No shared or
// hardcoded chat ID is ever used.
export async function createLinkCode(walletAddress) {
  const code = nanoid(10);
  await db.read();
  db.data.linkCodes[code] = { walletAddress, createdAt: Date.now(), status: 'pending' };
  await db.write();
  return code;
}

export async function getLinkStatus(walletAddress) {
  await db.read();
  const link = db.data.walletLinks[walletAddress];
  return link ? { linked: true, ...link } : { linked: false };
}

export async function unlinkWallet(walletAddress) {
  await db.read();
  const link = db.data.walletLinks[walletAddress];
  if (link?.telegramChatId) delete db.data.chatLinks[link.telegramChatId];
  delete db.data.walletLinks[walletAddress];
  await db.write();
}

export function botUsername() {
  return process.env.TELEGRAM_BOT_USERNAME || null;
}

// Gives the AI a real number to work with instead of guessing. If the
// server has no RPC configured, this says so explicitly in the context so
// the model tells the user the truth rather than inventing a figure.
async function buildWalletContext(walletAddress) {
  const context = { walletAddress, channel: 'telegram' };
  if (!isRpcConfigured) {
    context.balanceNote = 'XLAYER_RPC_URL is not configured on the server — no real balance is available.';
    return context;
  }
  try {
    context.nativeBalance = await getNativeBalance(walletAddress);
    context.nativeSymbol = 'OKB';
  } catch (err) {
    context.balanceNote = `Balance lookup failed: ${err.message}`;
  }
  return context;
}

export function startBot() {
  if (!TOKEN) return null;
  if (bot) return bot;

  bot = new TelegramBot(TOKEN, { polling: true });

  bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const code = match?.[1]?.trim();

    if (!code) {
      await bot.sendMessage(
        chatId,
        "Welcome to VANTERRA. Open the VANTERRA web app, go to Telegram, and tap Connect Telegram to link this chat to your own wallet."
      );
      return;
    }

    await db.read();
    const entry = db.data.linkCodes[code];
    if (!entry || Date.now() - entry.createdAt > 1000 * 60 * 15) {
      await bot.sendMessage(chatId, 'That connection code is invalid or has expired. Generate a new one from the VANTERRA app.');
      return;
    }

    db.data.walletLinks[entry.walletAddress] = {
      telegramChatId: chatId,
      telegramUsername: msg.chat.username || msg.chat.first_name || 'Telegram user',
      linkedAt: Date.now(),
    };
    db.data.chatLinks[chatId] = entry.walletAddress;
    entry.status = 'linked';
    await db.write();

    await bot.sendMessage(
      chatId,
      `Connected. This Telegram account is now linked to wallet ${entry.walletAddress.slice(0, 6)}...${entry.walletAddress.slice(-4)}.\n\nTry:\n"What's my portfolio worth?"\n"Find me a lower-risk opportunity."\n"Reduce my exposure by 20%."`
    );
  });

  bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/start')) return;
    const chatId = msg.chat.id;

    await db.read();
    const walletAddress = db.data.chatLinks[chatId];
    if (!walletAddress) {
      await bot.sendMessage(chatId, "This chat isn't linked to a VANTERRA account yet. Connect it from the app's Telegram page first.");
      return;
    }

    try {
      const intentCheck = /\$|allocat|strategy|invest|reduce|exposure|rebalance/i.test(msg.text);
      if (intentCheck) {
        const strategy = await buildStrategyFromMessage(msg.text);
        if (strategy.isStrategyRequest && strategy.allocations?.length) {
          const lines = strategy.allocations.map((a) => `${a.opportunity.name}: $${a.amount.toLocaleString()}`);
          await bot.sendMessage(
            chatId,
            `Strategy prepared.\n\n${lines.join('\n')}\n\nExpected APY: ${strategy.expectedApy}%\nRisk: ${strategy.risk}\n\nReview and approve this in the VANTERRA web app to execute — nothing moves from Telegram alone.`
          );
          return;
        }
      }
      const reply = await aiChat(msg.text, await buildWalletContext(walletAddress));
      await bot.sendMessage(chatId, reply);
    } catch (err) {
      await bot.sendMessage(chatId, `Vanterra AI is unavailable right now (${err.message.slice(0, 120)}).`);
    }
  });

  bot.on('polling_error', (err) => {
    console.error('[telegram] polling error:', err.message);
  });

  console.log('[telegram] bot polling started');
  return bot;
}

export async function sendAlertToWallet(walletAddress, text) {
  if (!bot) return false;
  await db.read();
  const link = db.data.walletLinks[walletAddress];
  if (!link) return false;
  await bot.sendMessage(link.telegramChatId, text);
  return true;
}
