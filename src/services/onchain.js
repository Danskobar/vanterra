import { BrowserProvider, Contract, parseUnits } from 'ethers';
import { X_LAYER } from './xlayer.js';

// Real onchain execution via ethers.js. When a browser wallet provider is
// present AND a vault/token address is configured, this submits an actual
// signed transaction to X Layer and returns the real transaction hash and
// receipt. When either is missing, callers fall back to the DEMO simulator
// in services/transaction.js — that fallback is explicit and labeled, never
// silently substituted for a claimed real confirmation.

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address owner) view returns (uint256)',
];

const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS || null;
const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS || null;

export function canExecuteOnchain() {
  return typeof window !== 'undefined' && Boolean(window.ethereum) && Boolean(VAULT_ADDRESS);
}

async function getSigner() {
  const provider = new BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  return provider.getSigner();
}

export async function ensureXLayerNetwork() {
  if (!window.ethereum) throw new Error('No wallet provider found.');
  const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (currentChainId === X_LAYER.chainIdHex) return true;
  try {
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: X_LAYER.chainIdHex }] });
    return true;
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: X_LAYER.chainIdHex,
            chainName: X_LAYER.chainName,
            nativeCurrency: X_LAYER.nativeCurrency,
            rpcUrls: X_LAYER.rpcUrl ? [X_LAYER.rpcUrl] : [],
            blockExplorerUrls: [X_LAYER.explorer],
          },
        ],
      });
      return true;
    }
    throw err;
  }
}

// Approves the configured USDC contract to let the vault spend `amountUsd`.
export async function approveUsdc(amountUsd) {
  if (!USDC_ADDRESS) throw new Error('VITE_USDC_ADDRESS is not configured.');
  await ensureXLayerNetwork();
  const signer = await getSigner();
  const token = new Contract(USDC_ADDRESS, ERC20_ABI, signer);
  const decimals = await token.decimals().catch(() => 6);
  const amount = parseUnits(String(amountUsd), decimals);
  const tx = await token.approve(VAULT_ADDRESS, amount);
  const receipt = await tx.wait();
  return { hash: tx.hash, blockNumber: receipt.blockNumber, status: receipt.status === 1 ? 'confirmed' : 'failed' };
}

// Deposits by sending value directly to the configured vault address. This
// intentionally uses a plain native-currency transfer rather than assuming a
// specific vault ABI, since no VANTERRA vault contract ships with this
// starter — replace with a real `vault.deposit(amount)` call once your
// contract is deployed (see README "X Layer Setup").
export async function depositToVault(amountUsd, nativePricePerUsd = 1) {
  if (!VAULT_ADDRESS) throw new Error('VITE_VAULT_ADDRESS is not configured.');
  await ensureXLayerNetwork();
  const signer = await getSigner();
  const value = parseUnits((amountUsd * nativePricePerUsd).toFixed(6), 'ether');
  const tx = await signer.sendTransaction({ to: VAULT_ADDRESS, value });
  const receipt = await tx.wait();
  return { hash: tx.hash, blockNumber: receipt.blockNumber, status: receipt.status === 1 ? 'confirmed' : 'failed' };
}

export function explorerTxUrl(hash) {
  return `${X_LAYER.explorer}/tx/${hash}`;
}
