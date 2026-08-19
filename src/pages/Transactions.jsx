import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';
import { getTransactions } from '../services/localLog.js';
import { EmptyState } from '../components/Primitives.jsx';
import { timeAgo } from '../utils/format.js';

const STATUS_ICON = {
  confirmed: { Icon: CheckCircle2, color: 'var(--v-success)' },
  pending: { Icon: Clock, color: 'var(--v-platinum)' },
  failed: { Icon: XCircle, color: 'var(--v-danger)' },
};

export default function Transactions() {
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    setTxs(getTransactions());
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium text-[var(--v-white)] mb-1">Transactions</h1>
        <p className="text-sm text-[var(--v-muted)]">
          Every transaction step this browser has actually attempted — real onchain hashes when connected to a live
          wallet, or clearly marked DEMO entries otherwise. Never a fabricated confirmation.
        </p>
      </div>

      {txs.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          body="Approve a strategy from the Agent or Strategies page to see real execution history here."
        />
      ) : (
        <div className="v-card overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_1fr_100px_120px] gap-4 px-5 py-3 text-[10px] text-[var(--v-muted-2)] uppercase tracking-wider border-b border-white/10">
            <span>Action</span>
            <span>Network</span>
            <span>Status</span>
            <span>Time</span>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {txs.map((tx) => {
              const { Icon, color } = STATUS_ICON[tx.status] || STATUS_ICON.pending;
              return (
                <div key={tx.id} className="flex flex-col md:grid md:grid-cols-[1fr_1fr_100px_120px] gap-1.5 md:gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <div>
                    <p className="text-[var(--v-white)] text-sm">{tx.action}</p>
                    {tx.error && <p className="text-xs text-[var(--v-danger)] mt-0.5">{tx.error}</p>}
                    {tx.hash && (
                      tx.explorerUrl ? (
                        <a
                          href={tx.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="v-focus v-mono text-[10px] text-[var(--v-silver)] hover:text-[var(--v-white)] break-all inline-flex items-center gap-1 mt-0.5"
                        >
                          {tx.hash} <ExternalLink size={9} />
                        </a>
                      ) : (
                        <p className="v-mono text-[10px] text-[var(--v-muted-2)] break-all mt-0.5">{tx.hash}</p>
                      )
                    )}
                  </div>
                  <span className="text-xs text-[var(--v-muted)]">
                    {tx.network}
                    {tx.isDemo && ' · DEMO'}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs" style={{ color }}>
                    <Icon size={13} /> {tx.status}
                  </span>
                  <span className="text-xs text-[var(--v-muted-2)] v-mono">{timeAgo(tx.timestamp)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
