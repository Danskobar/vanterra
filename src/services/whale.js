import { WHALE_EVENTS, WHALE_WALLETS } from '../data/intelligence.js';

// Whale Engine (DEMO adapter). Real implementation would subscribe to X Layer
// token-transfer logs, bucket transfers by wallet + threshold, and classify
// direction/confidence server-side.

const THRESHOLD_USD = 100000;

export async function getWhaleEvents() {
  await new Promise((r) => setTimeout(r, 300));
  return WHALE_EVENTS.filter((e) => e.amountUsd >= THRESHOLD_USD).sort((a, b) => b.timestamp - a.timestamp);
}

export async function getWhaleWallet(address) {
  await new Promise((r) => setTimeout(r, 250));
  const wallet = WHALE_WALLETS.find((w) => w.address === address);
  if (!wallet) return null;
  const events = WHALE_EVENTS.filter((e) => e.wallets.includes(address));
  return { ...wallet, events };
}

export async function getAllWallets() {
  await new Promise((r) => setTimeout(r, 200));
  return WHALE_WALLETS;
}

export function interpretEvent(event) {
  const dir = event.direction === 'BUY' ? 'accumulated' : 'distributed';
  return `${event.wallets.length} significant wallet${event.wallets.length > 1 ? 's' : ''} ${dir} ${
    '$' + (event.amountUsd / 1000).toFixed(0) + 'K'
  } of ${event.asset}. This is an onchain behavioral signal, not a guarantee of future price movement.`;
}
