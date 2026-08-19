import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Send } from 'lucide-react';
import { getOpportunityById, generateSeries } from '../data/opportunities.js';
import { RiskBadge, LiquidityBadge, ScorePill, Button, ErrorState, SampleDataTag } from '../components/Primitives.jsx';
import PerformanceChart from '../components/PerformanceChart.jsx';
import { formatUSD } from '../utils/format.js';
import { AIService } from '../services/ai.js';
import { WHALE_EVENTS } from '../data/intelligence.js';
import { scoreOpportunityRisk } from '../services/risk.js';

export default function AssetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const opportunity = getOpportunityById(id);
  const [aiSummary, setAiSummary] = useState('');
  const [aiError, setAiError] = useState(null);
  const [loadingAi, setLoadingAi] = useState(true);
  const [question, setQuestion] = useState('');
  const [qa, setQa] = useState([]);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (!opportunity) return;
    setLoadingAi(true);
    setAiError(null);
    AIService.analyzeOpportunity(opportunity)
      .then((res) => setAiSummary(res))
      .catch((err) => setAiError(err.message))
      .finally(() => setLoadingAi(false));
  }, [id]);

  if (!opportunity) {
    return (
      <ErrorState
        title="Opportunity not found"
        body="This asset may have been removed or the link is incorrect."
        onRetry={() => navigate('/markets')}
      />
    );
  }

  const series = generateSeries(opportunity.id, 60, 100);
  const relatedWhaleEvents = WHALE_EVENTS.filter((e) => e.assetId === opportunity.id);
  const riskScore = scoreOpportunityRisk(opportunity);

  async function handleAsk(e) {
    e.preventDefault();
    if (!question.trim()) return;
    const q = question.trim();
    setQuestion('');
    setAsking(true);
    setQa((prev) => [...prev, { role: 'user', text: q }]);
    try {
      const answer = await AIService.chat(q, { opportunity });
      setQa((prev) => [...prev, { role: 'ai', text: answer }]);
    } catch (err) {
      setQa((prev) => [...prev, { role: 'ai', text: err.message, isError: true }]);
    }
    setAsking(false);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="v-focus inline-flex items-center gap-1.5 text-sm text-[var(--v-muted)] hover:text-[var(--v-white)] transition-colors"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="v-mono text-xs text-[var(--v-muted)] uppercase tracking-wider mb-1">
            {opportunity.category} · {opportunity.subtype} · {opportunity.network}
          </p>
          <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--v-white)]">{opportunity.name}</h1>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <ScorePill score={opportunity.aiScore} />
          <SampleDataTag />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <RiskBadge risk={opportunity.risk} />
        <LiquidityBadge liquidity={opportunity.liquidity} />
        <span className="v-mono text-[10px] px-2 py-1 rounded-md border border-white/10 text-[var(--v-muted)]">
          RISK SCORE {riskScore.toFixed(0)}/100
        </span>
      </div>

      <div className="v-card p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs v-mono uppercase tracking-wider text-[var(--v-muted-2)]">Performance</p>
          <SampleDataTag />
        </div>
        <p className="text-[11px] text-[var(--v-muted-2)] mb-3">
          No vault contract or price oracle is deployed for this product yet — this chart is a synthetic illustration,
          not a real price feed.
        </p>
        <PerformanceChart data={series} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label="APY" value={`${opportunity.apy}%`} />
        <Metric label="TVL" value={formatUSD(opportunity.tvl, { compact: true })} />
        <Metric label="24h Volume" value={formatUSD(opportunity.volume24h, { compact: true })} />
        <Metric label="Protocol" value={opportunity.protocol} mono={false} />
      </div>
      <p className="text-[11px] text-[var(--v-muted-2)] -mt-4">
        Figures above are example listing data — see README "X Layer Setup" for wiring in a real data feed.
      </p>

      <div className="v-card p-5">
        <p className="text-sm text-[var(--v-white)] leading-relaxed">{opportunity.description}</p>
      </div>

      <div className="v-card p-5">
        <div className="flex items-center gap-2 mb-3 text-[var(--v-muted)]">
          <Sparkles size={14} />
          <span className="text-xs v-mono uppercase tracking-wider">AI Analysis</span>
        </div>
        {loadingAi ? (
          <div className="space-y-2">
            <div className="v-shimmer h-3 rounded bg-white/5 w-full" />
            <div className="v-shimmer h-3 rounded bg-white/5 w-4/5" />
          </div>
        ) : aiError ? (
          <p className="text-sm text-[var(--v-danger)] leading-relaxed">AI unavailable: {aiError}</p>
        ) : (
          <p className="text-sm text-[var(--v-white)] leading-relaxed">{aiSummary}</p>
        )}
      </div>

      {relatedWhaleEvents.length > 0 && (
        <div className="v-card p-5">
          <p className="text-xs v-mono uppercase tracking-wider text-[var(--v-muted)] mb-3">Whale Activity</p>
          <div className="space-y-3">
            {relatedWhaleEvents.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <span className="text-[var(--v-white)]">{e.signal}</span>
                <span className="v-mono" style={{ color: e.direction === 'BUY' ? 'var(--v-success)' : 'var(--v-danger)' }}>
                  {e.direction === 'BUY' ? '+' : '-'}
                  {formatUSD(e.amountUsd, { compact: true })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="v-card p-5">
        <div className="flex items-center gap-2 mb-4 text-[var(--v-muted)]">
          <Sparkles size={14} />
          <span className="text-xs v-mono uppercase tracking-wider">Ask Vanterra</span>
        </div>

        {qa.length > 0 && (
          <div className="space-y-3 mb-4">
            {qa.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
                <p
                  className={`inline-block text-sm px-3 py-2 rounded-lg max-w-md text-left ${
                    m.role === 'user'
                      ? 'bg-white/[0.06] text-[var(--v-white)]'
                      : m.isError
                      ? 'bg-[var(--v-danger-dim)] text-[var(--v-danger)] border border-[rgba(180,106,106,0.3)]'
                      : 'bg-[var(--v-surface-raised)] text-[var(--v-white)] border border-white/10'
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ))}
            {asking && <div className="v-shimmer h-6 w-32 rounded-md bg-white/5" />}
          </div>
        )}

        <form onSubmit={handleAsk} className="flex items-center gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`Why is this rated ${opportunity.aiScore}?`}
            className="v-focus flex-1 v-card px-3 py-2.5 text-sm bg-transparent outline-none text-[var(--v-white)] placeholder:text-[var(--v-muted-2)]"
          />
          <Button type="submit" variant="secondary" disabled={asking}>
            <Send size={14} />
          </Button>
        </form>
      </div>

      <div className="flex gap-3">
        <Button variant="primary" onClick={() => navigate('/agent', { state: { prefill: `Simulate a strategy using ${opportunity.name}` } })}>
          Simulate Strategy
        </Button>
        <Button variant="secondary" onClick={() => navigate('/markets')}>
          Compare Opportunities
        </Button>
      </div>
    </div>
  );
}

function Metric({ label, value, mono = true }) {
  return (
    <div className="v-card p-4">
      <p className="text-[10px] text-[var(--v-muted-2)] uppercase tracking-wider mb-1">{label}</p>
      <p className={`${mono ? 'v-mono' : ''} text-[var(--v-white)] text-sm truncate`}>{value}</p>
    </div>
  );
}
