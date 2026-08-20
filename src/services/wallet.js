// Wallet service abstraction.
//
// REAL MODE: this module is where an X Layer-compatible EIP-1193 provider
// (e.g. window.ethereum via wagmi/viem) would be wired in. VANTERRA never
// requests seed phrases or private keys — only a standard connect/sign flow.
//
// DEMO MODE: no injected provider is available in this environment, so
// connection is simulated with a realistic async flow and a synthetic
// address/balance. This is clearly surfaced to the user via isDemo=true.

import { JsonRpcProvider, Contract, formatEther, formatUnits } from 'ethers';
import { X_LAYER } from './xlayer.js';

// Wallet service abstraction.
//
// REAL MODE: connects via any injected EIP-1193 provider (MetaMask, etc.)
// and reads REAL onchain balances from X Layer once VITE_XLAYER_RPC_URL is
// configured. VANTERRA never requests seed phrases or private keys.
//
// Important honesty note: the RWA/DeFi products in this app (Tokenized
// Treasury, Stablecoin Strategy, X Layer Restaking Vault, etc.) are example
// marketplace listings — no vault contracts for them are deployed yet, so
// there is no real onchain position to read for them. Real balance fetching
// here covers native currency and any ERC20 token address you configure
// (e.g. real USDC on X Layer) — not the fictional demo products.
//
// DEMO MODE: no injected provider is available, so connection is simulated
// with a synthetic address. This is always clearly surfaced via isDemo=true.

const DEMO_ADDRESS = '0x4f2A9c7B1d3E5f6A8b0C1d2E3f4A5b6C7d8E9f0A';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

// Optional: comma-separated "symbol:address" pairs of REAL deployed tokens
// you want balances for, e.g. VITE_TRACKED_TOKENS="USDC:0xabc...,WOKB:0xdef..."
function trackedTokens() {
  const raw = import.meta.env.VITE_TRACKED_TOKENS || '';
  return raw
    .split(',')
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [symbol, address] = pair.split(':');
      return { symbol: symbol?.trim(), address: address?.trim() };
    })
    .filter((t) => t.symbol && t.address);
}

function hasInjectedProvider() {
  return typeof window !== 'undefined' && Boolean(window.ethereum);
}

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

export async function connectWallet() {
  if (hasInjectedProvider()) {
    try {
      const accounts = await withTimeout(
        window.ethereum.request({ method: 'eth_requestAccounts' }),
        15000,
        'Wallet did not respond in time. Make sure your wallet extension is unlocked, then try again.'
      );
      if (!accounts || accounts.length === 0) {
        throw new Error('No account was returned by the wallet.');
      }
      return {
        address: accounts[0],
        chainId: await window.ethereum.request({ method: 'eth_chainId' }),
        isDemo: false,
      };
    } catch (err) {
      throw new Error(err?.message || 'Wallet connection rejected.');
    }
  }

  // DEMO MODE fallback
  await new Promise((r) => setTimeout(r, 900));
  return { address: DEMO_ADDRESS, chainId: X_LAYER.chainIdHex, isDemo: true };
}