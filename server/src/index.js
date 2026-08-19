import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './services/store.js';
import { startBot, isTelegramConfigured } from './services/telegramBot.js';
import { aiRouter } from './routes/ai.js';
import { telegramRouter } from './routes/telegram.js';
import { walletRouter } from './routes/wallet.js';
import { isConfigured as aiConfigured } from './services/aiProvider.js';
import { isRpcConfigured } from './services/onchainRead.js';

const PORT = process.env.PORT || 8787;

async function main() {
  await initDb();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, ai: aiConfigured, telegram: isTelegramConfigured, rpc: isRpcConfigured });
  });

  app.use('/api/ai', aiRouter);
  app.use('/api/telegram', telegramRouter);
  app.use('/api/wallet', walletRouter);

  app.listen(PORT, () => {
    console.log(`[vanterra-server] listening on :${PORT}`);
    console.log(`[vanterra-server] AI provider configured: ${aiConfigured}`);
    console.log(`[vanterra-server] Telegram bot configured: ${isTelegramConfigured}`);
    console.log(`[vanterra-server] X Layer RPC configured: ${isRpcConfigured}`);
  });

  if (isTelegramConfigured) startBot();
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
