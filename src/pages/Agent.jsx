import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Send, Loader2, AlertTriangle } from 'lucide-react';
import { Button, ModeBadge } from '../components/Primitives.jsx';
import { AIService, getAIStatus } from '../services/ai.js';
import { saveStrategy } from '../services/localLog.js';
import TransactionModal from '../components/TransactionModal.jsx';
import { useWallet } from '../hooks/useWallet.jsx';
import { formatUSD } from '../utils/format.js';

const STAGES = ['Sending to Vanterra AI', 'Interpreting your goal', 'Scoring opportunities', 'Building allocation'];

export default function Agent() {
  const { state } = useLocation();
  const { isDemo } = useWallet();
  const [aiStatus, setAiStatus] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      text: "I'm the VANTERRA Agent. Tell me a goal — capital, how much to keep liquid, and your risk tolerance — and I'll build a strategy for you to review.",
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [strategy, setStrategy] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const endRef = useRef(null);
  const prefillHandled = useRef(false);

  useEffect(() => {
    getAIStatus().then(setAiStatus);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  useEffect(() => {
    if (state?.prefill && !prefillHandled.current) {
      prefillHandled.current = true;
      handleSend(state.prefill);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  async function handleSend(text) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setBusy(true);
    setStrategy(null);

    let stageTimer;
    let i = 0;
    setStage(0);
    stageTimer = setInterval(() => {
      i = Math.min(i + 1, STAGES.length - 1);
      setStage(i);
    }, 500);

    try {
      const result = await AIService.buildStrategy(q);
      clearInterval(stageTimer);

      if (!result.isStrategyRequest) {
        const reply = await AIService.chat(q, { totalValue: 8420, dailyPnlPct: 2.23, healthScore: 87 });
        setMessages((prev) => [...prev, { role: 'agent', text: reply }]);
      } else if (result.allocations?.length) {
        const saved = saveStrategy({ ...result, source: 'agent', prompt: q });
        setStrategy(saved);
        setMessages((prev) => [...prev, { role: 'agent', text: result.reasoning, strategy: saved }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'agent', text: result.reasoning || 'No opportunities matched that request.' },
        ]);
      }
    } catch (err) {
      clearInterval(stageTimer);
      setMessages((prev) => [
        ...prev,
        { role: 'agent', text: err.message, isError: true },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-104px)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[var(--v-accent)]" />
          <h1 className="text-[var(--v-white)] font-medium">Vanterra Agent</h1>
        </div>
        <div className="flex items-center gap-2">
          {aiStatus && !aiStatus.configured && (
            <span className="v-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border border-[rgba(180,106,106,0.3)] text-[var(--v-danger)] bg-[var(--v-danger-dim)]">
              AI unavailable
            </span>
          )}
          <ModeBadge isDemo={isDemo} />
        </div>
      </div>

      {aiStatus && !aiStatus.configured && (
        <div className="v-card p-4 mb-4 border-[rgba(180,106,106,0.25)] flex items-start gap-3">
          <AlertTriangle size={16} className="text-[var(--v-danger)] mt-0.5 shrink-0" />
          <p className="text-xs text-[var(--v-muted)] leading-relaxed">
            The Vanterra backend has no AI provider configured, so the Agent can't reason yet. Set{' '}
            <span className="v-mono text-[var(--v-silver)]">AI_PROVIDER_KEY</span> in{' '}
            <span className="v-mono text-[var(--v-silver)]">server/.env</span> and restart the backend.
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-white/[0.07] text-[var(--v-white)]'
                  : m.isError
                  ? 'v-card border-[rgba(180,106,106,0.25)] text-[var(--v-danger)]'
                  : 'v-card text-[var(--v-white)]'
              }`}
            >
              <p>{m.text}</p>
              {m.strategy && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--v-muted)]">Expected APY</span>
                    <span className="v-mono text-[var(--v-accent)]">{m.strategy.expectedApy}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--v-muted)]">Risk</span>
                    <span className="v-mono">{m.strategy.risk}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--v-muted)]">Liquid kept</span>
                    <span className="v-mono">{formatUSD(m.strategy.liquidAmount)}</span>
                  </div>
                  <Button
                    variant="primary"
                    className="w-full mt-2"
                    onClick={() => {
                      setStrategy(m.strategy);
                      setShowModal(true);
                    }}
                  >
                    Review &amp; Simulate
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex justify-start">
            <div className="v-card px-4 py-3 text-sm text-[var(--v-muted)] flex items-center gap-2">
              <Loader2 size={13} className="animate-spin" />
              {STAGES[stage]}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-4 v-card flex items-center gap-2 px-3 py-2.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="I have $5,000. Keep 30% liquid, allocate the rest to low-risk opportunities above 6% APY."
          className="v-focus flex-1 bg-transparent outline-none text-sm text-[var(--v-white)] placeholder:text-[var(--v-muted-2)]"
        />
        <button
          type="submit"
          disabled={busy}
          className="v-focus w-9 h-9 shrink-0 rounded-full bg-gradient-to-b from-[var(--v-platinum)] to-[var(--v-silver)] flex items-center justify-center disabled:opacity-40"
        >
          <Send size={14} className="text-black" />
        </button>
      </form>

      {showModal && strategy && (
        <TransactionModal strategy={strategy} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
