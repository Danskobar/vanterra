// Client for the backend's real onchain read endpoints (server/src/routes/wallet.js).
// Used to track a user-supplied wallet address with actual X Layer transaction
// data, separate from the seeded example whale signals in data/intelligence.js.

import { api } from './apiClient.js';

export async function getTrackerStatus() {
  return api.get('/api/wallet/status').catch(() => ({ rpcConfigured: false }));
}

export async function getWalletBalance(address) {
  return api.get(`/api/wallet/${encodeURIComponent(address)}/balance`);
}

export async function getWalletActivity(address) {
  return api.get(`/api/wallet/${encodeURIComponent(address)}/activity`);
}
