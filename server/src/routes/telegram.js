import { Router } from 'express';
import { createLinkCode, getLinkStatus, unlinkWallet, isTelegramConfigured, botUsername } from '../services/telegramBot.js';

export const telegramRouter = Router();

telegramRouter.get('/status', (req, res) => {
  res.json({ configured: isTelegramConfigured, botUsername: botUsername() });
});

telegramRouter.post('/link-code', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) return res.status(400).json({ error: 'walletAddress is required' });
    if (!isTelegramConfigured) return res.status(503).json({ error: 'Telegram bot is not configured on this server.' });
    const code = await createLinkCode(walletAddress);
    res.json({ code, deepLink: `https://t.me/${botUsername()}?start=${code}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

telegramRouter.get('/link-status/:walletAddress', async (req, res) => {
  try {
    const status = await getLinkStatus(req.params.walletAddress);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

telegramRouter.delete('/link/:walletAddress', async (req, res) => {
  try {
    await unlinkWallet(req.params.walletAddress);
    res.json({ unlinked: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
