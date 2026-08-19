// Single source of truth for demo/seed opportunity data, shared by the
// strategy engine and the AI provider's context. Mirrors src/data/opportunities.js
// on the frontend. Replace with a real X Layer / RWA-DeFi aggregator feed
// by swapping this module — nothing else in server/ needs to change.

export const OPPORTUNITIES = [
  { id: 'tokenized-treasury', name: 'Tokenized Treasury', symbol: 'T-BILL', category: 'RWA', subtype: 'Short-Term Treasury', aiScore: 94, apy: 7.4, tvl: 7420000, liquidity: 'HIGH', risk: 'LOW', whaleActivity: 'ACCUMULATING', protocol: 'Vanterra Treasury Vault', network: 'X Layer' },
  { id: 'private-credit-note', name: 'Private Credit Note', symbol: 'PCN', category: 'RWA', subtype: 'Private Credit', aiScore: 81, apy: 11.2, tvl: 2140000, liquidity: 'MEDIUM', risk: 'MEDIUM', whaleActivity: 'NEUTRAL', protocol: 'Meridian Credit', network: 'X Layer' },
  { id: 'stablecoin-strategy', name: 'Stablecoin Strategy', symbol: 'sUSD-V', category: 'DeFi', subtype: 'Stable Yield', aiScore: 88, apy: 6.1, tvl: 5310000, liquidity: 'HIGH', risk: 'LOW', whaleActivity: 'ACCUMULATING', protocol: 'Vanterra Stable Vault', network: 'X Layer' },
  { id: 'xlp-liquidity-pool', name: 'XLP Liquidity Pool', symbol: 'XLP', category: 'DeFi', subtype: 'AMM Liquidity', aiScore: 72, apy: 18.6, tvl: 1870000, liquidity: 'MEDIUM', risk: 'HIGH', whaleActivity: 'DISTRIBUTING', protocol: 'XSwap', network: 'X Layer' },
  { id: 'tokenized-real-estate', name: 'Tokenized Real Estate Income', symbol: 'REI', category: 'RWA', subtype: 'Real Estate', aiScore: 78, apy: 8.9, tvl: 3260000, liquidity: 'LOW', risk: 'MEDIUM', whaleActivity: 'NEUTRAL', protocol: 'Meridian Real Assets', network: 'X Layer' },
  { id: 'perp-basis-vault', name: 'Perp Basis Vault', symbol: 'BASIS-V', category: 'DeFi', subtype: 'Funding Rate Arbitrage', aiScore: 65, apy: 22.4, tvl: 940000, liquidity: 'MEDIUM', risk: 'HIGH', whaleActivity: 'ACCUMULATING', protocol: 'Vanterra Basis Vault', network: 'X Layer' },
  { id: 'green-infra-bond', name: 'Green Infrastructure Bond', symbol: 'GIB', category: 'RWA', subtype: 'Infrastructure Debt', aiScore: 86, apy: 6.8, tvl: 4180000, liquidity: 'MEDIUM', risk: 'LOW', whaleActivity: 'NEUTRAL', protocol: 'Meridian Infra', network: 'X Layer' },
  { id: 'x-restaking-vault', name: 'X Layer Restaking Vault', symbol: 'rXL', category: 'DeFi', subtype: 'Restaking', aiScore: 74, apy: 13.7, tvl: 2680000, liquidity: 'MEDIUM', risk: 'MEDIUM', whaleActivity: 'ACCUMULATING', protocol: 'XRestake', network: 'X Layer' },
];

export function getOpportunityById(id) {
  return OPPORTUNITIES.find((o) => o.id === id) || null;
}
