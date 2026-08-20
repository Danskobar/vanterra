import { Router } from 'express';
import { getNativeBalance, getRecentActivity, getTokenActivity, isRpcConfigured } from '../services/onchainRead.js';

export const walletRouter = Router();

function withTimeout(promise, ms, fallback) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

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
    const [nativeActivity, tokenActivity] = await Promise.all([
      withTimeout(getRecentActivity(req.params.address), 25000, { timedOut: true, results: [] }),
      withTimeout(getTokenActivity(req.params.address).catch(() => []), 25000, []),
    ]);
    const activityTimedOut = nativeActivity?.timedOut;
    res.json({
      address: req.params.address,
      activity: activityTimedOut ? [] : nativeActivity,
      tokenActivity,
      note: activityTimedOut
        ? 'The scan took too long and was stopped early — results may be incomplete. Try again or use a smaller ACTIVITY_BLOCK_RANGE.'
        : undefined,
    });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});