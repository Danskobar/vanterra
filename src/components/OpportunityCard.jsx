import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { RiskBadge, LiquidityBadge, ScorePill, SampleDataTag } from './Primitives.jsx';
import { formatUSD, formatPct } from '../utils/format.js';

const WHALE_LABEL = {
  ACCUMULATING: { text: 'Whales accumulating', tone: 'var(--v-success)' },
  DISTRIBUTING: { text: 'Whales distributing', tone: 'var(--v-danger)' },
  NEUTRAL: { text: 'Whale activity neutral', tone: 'var(--v-muted)' },
};

export default function OpportunityCard({ opportunity }) {
  const navigate = useNavigate();
  const whale = WHALE_LABEL[opportunity.whaleActivity];
  const TrendIcon = opportunity.change24h > 0 ? TrendingUp : opportunity.change24h < 0 ? TrendingDown : Minus;

  return (
    <button
      onClick={() => navigate(`/markets/${opportunity.id}`)}
      className="v-card v-focus v-rise text-left p-5 w-full hover:-translate-y-0.5 transition-transform duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[var(--v-white)] font-medium">{opportunity.name}</p>
          <p className="text-xs text-[var(--v-muted)] v-mono">
            {opportunity.symbol} · {opportunity.category}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <ScorePill score={opportunity.aiScore} />
          <SampleDataTag />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-[10px] text-[var(--v-muted-2)] uppercase tracking-wider mb-1">APY</p>
          <p className="v-mono text-[var(--v-accent)] text-sm">{opportunity.apy}%</p>
        </div>
        <div>
          <p className="text-[10px] text-[var(--v-muted-2)] uppercase tracking-wider mb-1">TVL</p>
          <p className="v-mono text-[var(--v-white)] text-sm">{formatUSD(opportunity.tvl, { compact: true })}</p>
        </div>
        <div>
          <p className="text-[10px] text-[var(--v-muted-2)] uppercase tracking-wider mb-1">24h</p>
          <p
            className="v-mono text-sm flex items-center gap-1"
            style={{ color: opportunity.change24h >= 0 ? 'var(--v-success)' : 'var(--v-danger)' }}
          >
            <TrendIcon size={12} /> {formatPct(opportunity.change24h)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <RiskBadge risk={opportunity.risk} />
        <LiquidityBadge liquidity={opportunity.liquidity} />
      </div>

      <p className="text-xs" style={{ color: whale.tone }}>
        {whale.text}
      </p>
    </button>
  );
}
