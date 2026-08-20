import { JsonRpcProvider, formatEther, getAddress, isAddress } from 'ethers';

// Server-side read-only access to X Layer — used by the Telegram bot and
// the whale watchlist, neither of which has a browser wallet of its own.
//
// Defaults to the official public X Layer TESTNET RPC per the BuildX AI
// Season Hackathon requirement (testnet during the hackathon, mainnet
// after). Set XLAYER_RPC_URL in server/.env to override — e.g. to point at
// mainnet (https://rpc.xlayer.tech) once you've moved past the hackathon
// deploy stage, or at a private RPC provider for reliability.

const DEFAULT_TESTNET_RPC = 'https://testrpc.xlayer.tech/terigon';
const RPC_URL = process.env.XLAYER_RPC_URL || DEFAULT_TESTNET_RPC;
const ACTIVITY_BLOCK_RANGE = Number(process.env.ACTIVITY_BLOCK_RANGE || 2000);

export const isRpcConfigured = true; // always at least the public testnet default

let provider = null;
function getProvider() {
  if (!provider) provider = new JsonRpcProvider(RPC_URL);
  return provider;
}

// ethers enforces EIP-55 checksum casing strictly — a pasted or typed
// address with even one letter's case wrong throws "bad address checksum"
// instead of just working. Normalize to lowercase (always valid, no
// checksum required) so any casing a user pastes in works, and only
// genuinely malformed addresses (wrong length, non-hex) get rejected.
function normalizeAddress(address) {
  const trimmed = (address || '').trim().toLowerCase();
  if (!isAddress(trimmed)) {
    throw new Error(`"${address}" is not a valid wallet address.`);
  }
  return getAddress(trimmed);
}

export async function getNativeBalance(address) {
  const checksummed = normalizeAddress(address);
  const bal = await getProvider().getBalance(checksummed);
  return Number(formatEther(bal));
}

// Scans the last ACTIVITY_BLOCK_RANGE blocks for native-currency transfers
// into or out of `address`. This is a lightweight, on-demand scan (no
// background indexer) — real data, but bounded to a recent window, so very
// old or very quiet wallets may show nothing. For production-grade whale
// tracking across full history, replace this with a proper indexer
// (e.g. an X Layer-compatible subgraph or a paid archive-node provider).
export async function getRecentActivity(address) {
  const checksummed = normalizeAddress(address);
  const p = getProvider();
  const latest = await p.getBlockNumber();
  const from = Math.max(0, latest - ACTIVITY_BLOCK_RANGE);
  const events = [];

  // Native transfers don't emit logs, so we walk recent blocks directly.
  // Bounded and best-effort: skips a block on read failure rather than
  // aborting the whole scan.
  const target = checksummed.toLowerCase();
  const step = 50; // batch to keep this responsive
  for (let b = latest; b > from; b -= step) {
    const blockNumbers = Array.from({ length: Math.min(step, b - from) }, (_, i) => b - i);
    const blocks = await Promise.allSettled(blockNumbers.map((n) => p.getBlock(n, true)));
    for (const result of blocks) {
      if (result.status !== 'fulfilled' || !result.value) continue;
      const block = result.value;
      for (const tx of block.prefetchedTransactions || []) {
        if (tx.to?.toLowerCase() === target || tx.from?.toLowerCase() === target) {
          events.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            valueNative: Number(formatEther(tx.value || 0n)),
            blockNumber: block.number,
            timestamp: block.timestamp * 1000,
            direction: tx.to?.toLowerCase() === target ? 'IN' : 'OUT',
          });
        }
      }
    }
    if (events.length >= 25) break; // enough for a UI list
  }

  return events.sort((a, b) => b.blockNumber - a.blockNumber).slice(0, 25);
}