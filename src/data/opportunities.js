// DEMO DATA — centralized so it can be swapped for real X Layer / RWA & DeFi
// aggregator feeds without touching any UI component. See services/xlayer.js.

export const OPPORTUNITIES = [
  {
    id: 'tokenized-treasury',
    name: 'Tokenized Treasury',
    symbol: 'T-BILL',
    category: 'RWA',
    subtype: 'Short-Term Treasury',
    aiScore: 94,
    apy: 7.4,
    tvl: 7420000,
    liquidity: 'HIGH',
    risk: 'LOW',
    volume24h: 612000,
    whaleActivity: 'ACCUMULATING',
    change24h: 0.12,
    protocol: 'Vanterra Treasury Vault',
    network: 'X Layer',
    description:
      'Onchain-wrapped exposure to short-duration U.S. Treasury bills, redeemable against a regulated custodian and streamed to holders as accruing yield.',
  },
  {
    id: 'private-credit-note',
    name: 'Private Credit Note',
    symbol: 'PCN',
    category: 'RWA',
    subtype: 'Private Credit',
    aiScore: 81,
    apy: 11.2,
    tvl: 2140000,
    liquidity: 'MEDIUM',
    risk: 'MEDIUM',
    volume24h: 98000,
    whaleActivity: 'NEUTRAL',
    change24h: -0.4,
    protocol: 'Meridian Credit',
    network: 'X Layer',
    description:
      'Senior-secured private credit facility tokenized against a diversified small-business lending pool with quarterly redemption windows.',
  },
  {
    id: 'stablecoin-strategy',
    name: 'Stablecoin Strategy',
    symbol: 'sUSD-V',
    category: 'DeFi',
    subtype: 'Stable Yield',
    aiScore: 88,
    apy: 6.1,
    tvl: 5310000,
    liquidity: 'HIGH',
    risk: 'LOW',
    volume24h: 441000,
    whaleActivity: 'ACCUMULATING',
    change24h: 0.02,
    protocol: 'Vanterra Stable Vault',
    network: 'X Layer',
    description:
      'Delta-neutral stablecoin strategy routing liquidity across the deepest X Layer money markets, rebalanced continuously by the risk engine.',
  },
  {
    id: 'xlp-liquidity-pool',
    name: 'XLP Liquidity Pool',
    symbol: 'XLP',
    category: 'DeFi',
    subtype: 'AMM Liquidity',
    aiScore: 72,
    apy: 18.6,
    tvl: 1870000,
    liquidity: 'MEDIUM',
    risk: 'HIGH',
    volume24h: 356000,
    whaleActivity: 'DISTRIBUTING',
    change24h: -3.8,
    protocol: 'XSwap',
    network: 'X Layer',
    description:
      'Concentrated liquidity position on the primary XLP/USDC pair. Elevated impermanent-loss exposure during volatility.',
  },
  {
    id: 'tokenized-real-estate',
    name: 'Tokenized Real Estate Income',
    symbol: 'REI',
    category: 'RWA',
    subtype: 'Real Estate',
    aiScore: 78,
    apy: 8.9,
    tvl: 3260000,
    liquidity: 'LOW',
    risk: 'MEDIUM',
    volume24h: 54000,
    whaleActivity: 'NEUTRAL',
    change24h: 0.31,
    protocol: 'Meridian Real Assets',
    network: 'X Layer',
    description:
      'Fractionalized income stream from a diversified commercial real estate portfolio, distributed monthly to token holders.',
  },
  {
    id: 'perp-basis-vault',
    name: 'Perp Basis Vault',
    symbol: 'BASIS-V',
    category: 'DeFi',
    subtype: 'Funding Rate Arbitrage',
    aiScore: 65,
    apy: 22.4,
    tvl: 940000,
    liquidity: 'MEDIUM',
    risk: 'HIGH',
    volume24h: 187000,
    whaleActivity: 'ACCUMULATING',
    change24h: 1.9,
    protocol: 'Vanterra Basis Vault',
    network: 'X Layer',
    description:
      'Captures perpetual funding-rate spread by holding spot and short-perp legs simultaneously. Sensitive to funding compression.',
  },
  {
    id: 'green-infra-bond',
    name: 'Green Infrastructure Bond',
    symbol: 'GIB',
    category: 'RWA',
    subtype: 'Infrastructure Debt',
    aiScore: 86,
    apy: 6.8,
    tvl: 4180000,
    liquidity: 'MEDIUM',
    risk: 'LOW',
    volume24h: 71000,
    whaleActivity: 'NEUTRAL',
    change24h: 0.05,
    protocol: 'Meridian Infra',
    network: 'X Layer',
    description:
      'Tokenized senior tranche of renewable-energy infrastructure debt, backed by contracted revenue from operating solar and wind assets.',
  },
  {
    id: 'x-restaking-vault',
    name: 'X Layer Restaking Vault',
    symbol: 'rXL',
    category: 'DeFi',
    subtype: 'Restaking',
    aiScore: 74,
    apy: 13.7,
    tvl: 2680000,
    liquidity: 'MEDIUM',
    risk: 'MEDIUM',
    volume24h: 132000,
    whaleActivity: 'ACCUMULATING',
    change24h: 2.6,
    protocol: 'XRestake',
    network: 'X Layer',
    description:
      'Restakes bridged security deposits across X Layer validator sets and adjacent actively-validated services for compounding yield.',
  },
];

export function getOpportunityById(id) {
  return OPPORTUNITIES.find((o) => o.id === id) || null;
}

// Deterministic pseudo-random series generator so charts are stable per asset
export function generateSeries(seedKey, points = 60, base = 100) {
  let seed = 0;
  for (let i = 0; i < seedKey.length; i++) seed += seedKey.charCodeAt(i) * (i + 1);
  let value = base;
  const out = [];
  for (let i = 0; i < points; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const rnd = seed / 233280 - 0.5;
    value = Math.max(base * 0.6, value + rnd * base * 0.03);
    out.push({ t: i, v: Number(value.toFixed(2)) });
  }
  return out;
}
