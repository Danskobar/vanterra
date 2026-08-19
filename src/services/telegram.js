// Telegram service — real per-user account linking against the backend
// (server/src/routes/telegram.js + services/telegramBot.js). Each user
// generates their own one-time link code, opens it in their own Telegram
// app, and the bot on the server links that specific chat to that specific
// wallet. There is no shared or demo chat ID here.

import { api } from './apiClient.js';

export async function getTelegramStatus() {
  return api.get('/api/telegram/status').catch(() => ({ configured: false, botUsername: null }));
}

export async function requestLinkCode(walletAddress) {
  return api.post('/api/telegram/link-code', { walletAddress });
}

export async function getLinkStatus(walletAddress) {
  return api.get(`/api/telegram/link-status/${encodeURIComponent(walletAddress)}`);
}

export async function unlinkTelegram(walletAddress) {
  return api.delete(`/api/telegram/link/${encodeURIComponent(walletAddress)}`);
}
