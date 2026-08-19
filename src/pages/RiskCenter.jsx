import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { getRiskAlerts, currentPortfolioRiskLevel } from '../services/risk.js';
import { PORTFOLIO } from '../data/intelligence.js';
import { Skeleton, Button, RiskBadge } from '../components/Primitives.jsx';
import { timeAgo } from '../utils/format.js';
import { AIService } from '../services/ai.js';

export default function RiskCenter() {
  const [alerts, setAlerts] = useState(null);
  const [explaining, setExplaining] = useState(null);
  const [explanation, setExplanation] = useState({});

  useEffect(() => {
    getRiskAlerts().then(setAlerts);
  }, []);

  const level = currentPortfolioRiskLevel(PORTFOLIO.healthFactors);

  async function handleExplain(alert) {
    setExplaining(alert.id);
    try {
      const text = await AIService.explainRisk(alert);
      setExplanation((prev) => ({ ...prev, [alert.id]: { text, error: false } }));
    } catch (err) {
      setExplanation((prev) => ({ ...prev, [alert.id]: { text: err.message, error: true } }));
    }
    setExplaining(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-medium text-[var(--v-white)] mb-1">Risk Center</h1>
          <p className="text-sm text-[var(--v-muted)]">Portfolio, position, market, and whale risk in one place.</p>
        </div>
        <RiskBadge risk={level} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <RiskTile label="Portfolio Risk" value={level} />
        <RiskTile label="Liquidity Risk" value="LOW" />
        <RiskTile label="Market Risk" value="MEDIUM" />
        <RiskTile label="Whale Risk" value="MEDIUM" />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3 text-[var(--v-muted)]">
          <AlertTriangle size={14} />
          <span className="text-xs v-mono uppercase tracking-wider">Active Alerts</span>
        </div>

        {!alerts ? (
          <Skeleton className="h-40" />
        ) : (
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="v-card p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <RiskBadge risk={a.level} />
                      {a.previousLevel !== a.level && (
                        <span className="text-[10px] v-mono text-[var(--v-muted-2)]">
                          {a.previousLevel} → {a.level}
                        </span>
                      )}
                    </div>
                    <p className="text-[var(--v-white)] font-medium">{a.title}</p>
                  </div>
                  <span className="text-[10px] text-[var(--v-muted-2)] v-mono shrink-0">{timeAgo(a.timestamp)}</span>
                </div>
                <p className="text-sm text-[var(--v-white)] leading-relaxed mb-3">{a.detail}</p>
                {explanation[a.id] && (
                  <p
                    className={`text-sm leading-relaxed mb-3 border-t border-white/10 pt-3 ${
                      explanation[a.id].error ? 'text-[var(--v-danger)]' : 'text-[var(--v-accent)]'
                    }`}
                  >
                    {explanation[a.id].error ? `AI unavailable: ${explanation[a.id].text}` : explanation[a.id].text}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => handleExplain(a)} disabled={explaining === a.id}>
                    {explaining === a.id ? 'Analyzing…' : 'Explain'}
                  </Button>
                  <Button variant="ghost">Dismiss</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RiskTile({ label, value }) {
  return (
    <div className="v-card p-4">
      <p className="text-[10px] text-[var(--v-muted-2)] uppercase tracking-wider mb-2">{label}</p>
      <RiskBadge risk={value} />
    </div>
  );
}
