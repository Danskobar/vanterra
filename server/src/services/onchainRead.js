import { JsonRpcProvider, formatEther, getAddress, isAddress, Contract, formatUnits, zeroPadValue, id as topicId } from 'ethers';

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

const ERC20_METADATA_ABI = [
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];
const TRANSFER_TOPIC = topicId('Transfer(address,address,uint256)');
const tokenMetaCache = new Map(); // tokenAddress -> { symbol, decimals }

async function getTokenMeta(tokenAddress) {
  if (tokenMetaCache.has(tokenAddress)) return tokenMetaCache.get(tokenAddress);
  try {
    const contract = new Contract(tokenAddress, ERC20_METADATA_ABI, getProvider());
    const [symbol, decimals] = await Promise.all([contract.symbol(), contract.decimals()]);
    const meta = { symbol, decimals };
    tokenMetaCache.set(tokenAddress, meta);
    return meta;
  } catch {
    const meta = { symbol: 'TOKEN', decimals: 18 };
    tokenMetaCache.set(tokenAddress, meta);
    return meta;
  }
}

// Real ERC20 token transfers involving `address`, found via eth_getLogs on
// the standard Transfer(address,address,uint256) event topic — this works
// for ANY token contract, not just ones we know about in advance, since we
// filter by the address appearing as sender or receiver in the log itself.
export async function getTokenActivity(address) {
  const checksummed = normalizeAddress(address);
  const p = getProvider();
  const latest = await p.getBlockNumber();
  const from = Math.max(0, latest - ACTIVITY_BLOCK_RANGE);
  const paddedAddress = zeroPadValue(checksummed, 32);

  const [outgoing, incoming] = await Promise.all([
    p.getLogs({ fromBlock: from, toBlock: latest, topics: [TRANSFER_TOPIC, paddedAddress, null] }),
    p.getLogs({ fromBlock: from, toBlock: latest, topics: [TRANSFER_TOPIC, null, paddedAddress] }),
  ]);

  const logs = [...outgoing, ...incoming]
    .sort((a, b) => b.blockNumber - a.blockNumber)
    .slice(0, 25);

  const blocksByNumber = new Map();
  for (const log of logs) {
    if (!blocksByNumber.has(log.blockNumber)) {
      blocksByNumber.set(log.blockNumber, p.getBlock(log.blockNumber).catch(() => null));
    }
  }
  await Promise.all(blocksByNumber.values());

  const events = [];
  for (const log of logs) {
    const meta = await getTokenMeta(log.address);
    const from = '0x' + log.topics[1].slice(26);
    const to = '0x' + log.topics[2].slice(26);
    const rawValue = BigInt(log.data === '0x' ? 0 : log.data);
    const block = await blocksByNumber.get(log.blockNumber);
    events.push({
      hash: log.transactionHash,
      tokenAddress: log.address,
      tokenSymbol: meta.symbol,
      from,
      to,
      value: Number(formatUnits(rawValue, meta.decimals)),
      blockNumber: log.blockNumber,
      timestamp: block ? block.timestamp * 1000 : null,
      direction: to.toLowerCase() === checksummed.toLowerCase() ? 'IN' : 'OUT',
    });
  }

  return events.sort((a, b) => b.blockNumber - a.blockNumber);
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

  const target = checksummed.toLowerCase();
  const step = 50;
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
    if (events.length >= 25) break;
  }

  return events.sort((a, b) => b.blockNumber - a.blockNumber).slice(0, 25);
}