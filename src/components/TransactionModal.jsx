import { useState } from 'react';
import { CheckCircle2, CircleDashed, Loader2, XCircle, X, ExternalLink } from 'lucide-react';
import { Button } from './Primitives.jsx';
import { executeTransactionPlan } from '../services/transaction.js';
import { canExecuteOnchain, approveUsdc, depositToVault, explorerTxUrl } from '../services/onchain.js';
import { useWallet } from '../hooks/useWallet.jsx';
import { formatUSD } from '../utils/format.js';
import { saveTransaction, updateStrategyStatus } from '../services/localLog.js';

export default function TransactionModal({ strategy, onClose }) {
  const { isDemo } = useWallet();
  const [stepStates, setStepStates] = useState({});
  const [phase, setPhase] = useState('review'); // review | executing | done | failed
  const [results, setResults] = useState(null);
  const onchainReady = canExecuteOnchain();

  async function handleExecute() {
    setPhase('executing');

    if (onchainReady) {
      // Real X Layer execution: an "approve" step calls the ERC20 approve()
      // signed by the connected wallet; a "deposit" step sends a real
      // transaction to the configured vault address. Both return the
      // actual onchain transaction hash — nothing here is simulated.
      const outcomeResults = [];
      let allOk = true;
      for (const s of strategy.transactionPlan) {
        setStepStates((prev) => ({ ...prev, [s.step]: { status: 'pending' } }));
        try {
          const isApprove = s.label.startsWith('Approve');
          const amount = Number(s.detail.match(/\$([\d,]+)/)?.[1]?.replace(/,/g, '') || 0);
          const result = isApprove ? await approveUsdc(amount) : await depositToVault(amount);
          setStepStates((prev) => ({ ...prev, [s.step]: { status: 'confirmed', hash: result.hash } }));
          outcomeResults.push({ step: s.step, status: 'confirmed', hash: result.hash, explorerUrl: explorerTxUrl(result.hash) });
        } catch (err) {
          setStepStates((prev) => ({ ...prev, [s.step]: { status: 'failed' } }));
          outcomeResults.push({ step: s.step, status: 'failed', error: err.message });
          allOk = false;
          break;
        }
      }
      setResults({ success: allOk, results: outcomeResults, isDemo: false });
      setPhase(allOk ? 'done' : 'failed');
      logOutcome(outcomeResults, allOk, false);
      return;
    }

    const outcome = await executeTransactionPlan(strategy.transactionPlan, {
      isDemo,
      onStepUpdate: (step, status, hash) =>
        setStepStates((prev) => ({ ...prev, [step]: { status, hash } })),
    });
    setResults(outcome);
    setPhase(outcome.success ? 'done' : 'failed');
    logOutcome(outcome.results, outcome.success, isDemo);
  }

  function logOutcome(stepResults, success, demoFlag) {
    for (const r of stepResults) {
      const planStep = strategy.transactionPlan.find((p) => p.step === r.step);
      saveTransaction({
        timestamp: r.timestamp || Date.now(),
        action: planStep?.label || 'Transaction',
        protocol: planStep?.detail || '',
        network: onchainReady ? 'X Layer' : demoFlag ? 'X Layer (DEMO)' : 'X Layer',
        status: r.status,
        hash: r.hash || null,
        explorerUrl: r.explorerUrl || null,
        error: r.error || null,
        isDemo: !onchainReady && demoFlag,
      });
    }
    if (strategy.id) {
      updateStrategyStatus(strategy.id, success ? 'executed' : 'failed');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/70 backdrop-blur-sm px-0 lg:px-4">
      <div className="v-card w-full lg:max-w-lg max-h-[88vh] overflow-y-auto rounded-b-none lg:rounded-2xl p-6 v-rise">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs v-mono uppercase tracking-wider text-[var(--v-muted)]">
              {phase === 'review' ? 'Proposed Strategy' : 'Transaction Plan'}
            </p>
            <p className="text-[var(--v-white)] font-medium mt-0.5">
              {onchainReady ? 'Real X Layer execution' : isDemo ? 'DEMO MODE — no real funds move' : 'X Layer execution'}
            </p>
          </div>
          <button onClick={onClose} className="v-focus text-[var(--v-muted)] hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {phase === 'review' && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <Stat label="Capital" value={formatUSD(strategy.capital)} />
              <Stat label="Expected APY" value={`${strategy.expectedApy}%`} />
              <Stat label="Risk" value={strategy.risk} />
              <Stat label="AI Score" value={`${strategy.aiScore}/100`} />
            </div>

            <p className="text-xs text-[var(--v-muted-2)] uppercase tracking-wider mb-2">Allocation</p>
            <div className="space-y-2 mb-5">
              {strategy.allocations.map((a) => (
                <div key={a.opportunity.id} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--v-white)]">{a.opportunity.name}</span>
                  <span className="v-mono text-[var(--v-accent)]">{formatUSD(a.amount)}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-[var(--v-muted-2)] uppercase tracking-wider mb-2">Transaction Plan</p>
            <div className="space-y-2 mb-6">
              {strategy.transactionPlan.map((s) => (
                <div key={s.step} className="flex items-start gap-3 text-sm">
                  <CircleDashed size={15} className="mt-0.5 text-[var(--v-muted-2)] shrink-0" />
                  <div>
                    <p className="text-[var(--v-white)]">{s.label}</p>
                    <p className="text-xs text-[var(--v-muted)]">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleExecute}>
                Simulate &amp; Execute
              </Button>
            </div>
          </>
        )}

        {(phase === 'executing' || phase === 'done' || phase === 'failed') && (
          <div className="space-y-3">
            {strategy.transactionPlan.map((s) => {
              const state = stepStates[s.step]?.status || 'waiting';
              return (
                <div key={s.step} className="flex items-start gap-3 text-sm">
                  {state === 'confirmed' && <CheckCircle2 size={16} className="mt-0.5 text-[var(--v-success)] shrink-0" />}
                  {state === 'pending' && <Loader2 size={16} className="mt-0.5 text-[var(--v-accent)] shrink-0 animate-spin" />}
                  {state === 'failed' && <XCircle size={16} className="mt-0.5 text-[var(--v-danger)] shrink-0" />}
                  {state === 'waiting' && <CircleDashed size={16} className="mt-0.5 text-[var(--v-muted-2)] shrink-0" />}
                  <div className="flex-1">
                    <p className="text-[var(--v-white)]">{s.label}</p>
                    {stepStates[s.step]?.hash && (
                      onchainReady ? (
                        <a
                          href={explorerTxUrl(stepStates[s.step].hash)}
                          target="_blank"
                          rel="noreferrer"
                          className="v-focus v-mono text-[10px] text-[var(--v-silver)] hover:text-[var(--v-white)] break-all mt-0.5 inline-flex items-center gap-1"
                        >
                          {stepStates[s.step].hash} <ExternalLink size={10} />
                        </a>
                      ) : (
                        <p className="v-mono text-[10px] text-[var(--v-muted-2)] break-all mt-0.5">
                          {stepStates[s.step].hash}
                        </p>
                      )
                    )}
                  </div>
                </div>
              );
            })}

            {phase === 'done' && (
              <div className="mt-5 v-card p-4 border-[rgba(111,174,140,0.25)]">
                <p className="text-[var(--v-success)] text-sm font-medium mb-1">Strategy executed</p>
                <p className="text-xs text-[var(--v-muted)]">
                  {onchainReady
                    ? 'All steps confirmed onchain. Tap a transaction hash above to view it on the X Layer explorer.'
                    : isDemo
                    ? 'All steps confirmed in DEMO MODE. No real assets were moved.'
                    : 'All steps confirmed on X Layer.'}
                </p>
              </div>
            )}
            {phase === 'failed' && (
              <div className="mt-5 v-card p-4 border-[rgba(180,106,106,0.25)]">
                <p className="text-[var(--v-danger)] text-sm font-medium mb-1">Transaction failed</p>
                <p className="text-xs text-[var(--v-muted)]">
                  {results?.results?.find((r) => r.status === 'failed')?.error || 'The transaction was rejected.'}
                </p>
              </div>
            )}

            {(phase === 'done' || phase === 'failed') && (
              <Button variant="secondary" className="w-full mt-4" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="v-card p-3">
      <p className="text-[10px] text-[var(--v-muted-2)] uppercase tracking-wider mb-1">{label}</p>
      <p className="v-mono text-[var(--v-white)] text-sm">{value}</p>
    </div>
  );
}
