import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { getStrategies } from '../services/localLog.js';
import { formatUSD } from '../utils/format.js';
import { Button, RiskBadge, EmptyState } from '../components/Primitives.jsx';
import TransactionModal from '../components/TransactionModal.jsx';
import { useNavigate } from 'react-router-dom';

const STATUS_STYLE = {
  awaiting_approval: { label: 'Awaiting approval', color: 'var(--v-warning)', bg: 'var(--v-warning-dim)' },
  executed: { label: 'Executed', color: 'var(--v-success)', bg: 'var(--v-success-dim)' },
  failed: { label: 'Failed', color: 'var(--v-danger)', bg: 'var(--v-danger-dim)' },
};

export default function Strategies() {
  const [strategies, setStrategies] = useState([]);
  const [reviewing, setReviewing] = useState(null);
  const navigate = useNavigate();

  function refresh() {
    setStrategies(getStrategies());
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-medium text-[var(--v-white)] mb-1">Strategies</h1>
        <p className="text-sm text-[var(--v-muted)]">
          Every strategy Vanterra's Agent has generated for you in this browser — nothing here is placeholder data.
        </p>
      </div>

      {strategies.length === 0 ? (
        <EmptyState
          title="No strategies yet"
          body="Ask the Agent for an allocation — e.g. “I have $1,000, keep 20% liquid, low risk above 6% APY” — and it will show up here."
        />
      ) : (
        <div className="space-y-3">
          {strategies.map((s) => {
            const style = STATUS_STYLE[s.status] || STATUS_STYLE.awaiting_approval;
            return (
              <div key={s.id} className="v-card p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sparkles size={13} className="text-[var(--v-accent)]" />
                      <span
                        className="v-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-md"
                        style={{ color: style.color, backgroundColor: style.bg }}
                      >
                        {style.label}
                      </span>
                    </div>
                    <p className="text-[var(--v-white)] font-medium">{s.prompt || 'Generated allocation'}</p>
                  </div>
                  <span className="text-[10px] text-[var(--v-muted-2)] v-mono shrink-0">
                    {new Date(s.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-3">
                  <Stat label="Capital" value={formatUSD(s.capital)} />
                  <Stat label="Expected APY" value={`${s.expectedApy}%`} />
                  <Stat label="AI Score" value={`${s.aiScore}/100`} />
                  <div>
                    <p className="text-[10px] text-[var(--v-muted-2)] uppercase tracking-wider mb-1">Risk</p>
                    <RiskBadge risk={s.risk} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {s.allocations?.map((a) => (
                    <button
                      key={a.opportunity.id}
                      onClick={() => navigate(`/markets/${a.opportunity.id}`)}
                      className="v-focus text-xs px-2 py-1 rounded-md border border-white/10 text-[var(--v-silver)] hover:text-[var(--v-white)] hover:border-white/25"
                    >
                      {a.opportunity.name} · {formatUSD(a.amount)}
                    </button>
                  ))}
                </div>

                {s.status === 'awaiting_approval' && (
                  <Button variant="primary" onClick={() => setReviewing(s)}>
                    Review &amp; Approve
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {reviewing && (
        <TransactionModal
          strategy={reviewing}
          onClose={() => {
            setReviewing(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-[var(--v-muted-2)] uppercase tracking-wider mb-1">{label}</p>
      <p className="v-mono text-[var(--v-white)] text-sm">{value}</p>
    </div>
  );
}
