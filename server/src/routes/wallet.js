import { Router } from 'express';
import { getNativeBalance, getRecentActivity, isRpcConfigured } from '../services/onchainRead.js';

export const walletRouter = Router();

walletRouter.get('/status', (req, res) => {
  res.json({ rpcConfigured: isRpcConfigured });
});

walletRouter.get('/:address/balance', async (req, res) => {
  try {
    const native = await getNativeBalance(req.params.address);
    res.json({ address: req.params.address, native, nativeSymbol: 'OKB' });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

walletRouter.get('/:address/activity', async (req, res) => {
  try {
    const activity = await getRecentActivity(req.params.address);
    res.json({ address: req.params.address, activity });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});
