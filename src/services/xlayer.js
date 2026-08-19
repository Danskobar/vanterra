// X Layer chain configuration — kept separate from wallet.js so RPC/network
// concerns don't leak into wallet-connection UI logic.
//
// Values below are official, from OKX's own developer docs:
// https://web3.okx.com/onchainos/dev-docs/xlayer/developer/build-on-xlayer/network-information
//
// Defaults to TESTNET, per the BuildX AI Season Hackathon requirement:
// "deployed on the X Layer Testnet during the Hackathon, subsequently
// launched on the X Layer Mainnet." Set VITE_XLAYER_NETWORK=mainnet to
// switch once you're past the hackathon deploy stage.

const NETWORKS = {
  mainnet: {
    chainName: 'X Layer',
    chainIdHex: '0xc4', // 196
    chainIdDec: 196,
    rpcUrl: 'https://rpc.xlayer.tech',
    explorer: 'https://www.okx.com/web3/explorer/xlayer',
  },
  testnet: {
    chainName: 'X Layer Testnet',
    chainIdHex: '0x7a0', // 1952
    chainIdDec: 1952,
    rpcUrl: 'https://testrpc.xlayer.tech/terigon',
    explorer: 'https://www.okx.com/web3/explorer/xlayer-test',
  },
};

const NETWORK_KEY = (import.meta.env.VITE_XLAYER_NETWORK || 'testnet').toLowerCase();
const base = NETWORKS[NETWORK_KEY] || NETWORKS.testnet;

export const X_LAYER = {
  ...base,
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  // An explicit VITE_XLAYER_RPC_URL always wins (e.g. a private RPC
  // provider), otherwise fall back to the official public endpoint for
  // whichever network is selected above.
  rpcUrl: import.meta.env.VITE_XLAYER_RPC_URL || base.rpcUrl,
};

export function isNetworkConfigured() {
  return Boolean(X_LAYER.rpcUrl);
}

export async function detectNetworkMismatch(currentChainIdHex) {
  return currentChainIdHex && currentChainIdHex.toLowerCase() !== X_LAYER.chainIdHex;
}
