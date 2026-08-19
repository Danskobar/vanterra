import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import WalletButton from '../components/WalletButton.jsx';
import { useWallet } from '../hooks/useWallet.jsx';
import { useEffect } from 'react';
import { Search, Brain, Zap, Radar } from 'lucide-react';

const STEPS = [
  { icon: Search, label: 'Discover', body: 'Surface RWA and DeFi opportunities across X Layer, ranked by AI Score.' },
  { icon: Brain, label: 'Analyze', body: 'Check risk, whale activity, and liquidity before you ever commit capital.' },
  { icon: Zap, label: 'Execute', body: 'Approve a simulated strategy — your wallet signs, X Layer settles.' },
  { icon: Radar, label: 'Monitor', body: 'Risk Guardian and Whale Intelligence watch your positions continuously.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { status } = useWallet();

  useEffect(() => {
    if (status === 'connected') navigate('/overview');
  }, [status, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 lg:px-10 py-6">
        <Logo size={28} />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <p className="v-mono text-xs uppercase tracking-[0.3em] text-[var(--v-muted)] mb-6 v-rise">
          Onchain financial operating system for X Layer
        </p>
        <h1 className="text-4xl lg:text-6xl font-semibold text-[var(--v-white)] max-w-3xl leading-[1.1] v-rise">
          Intelligence. Insight. Edge.
        </h1>
        <p className="text-[var(--v-muted)] max-w-xl mt-6 text-base lg:text-lg v-rise">
          VANTERRA discovers opportunities, reads onchain whale behavior, guards your risk, and
          executes only what you approve — directly from your own wallet.
        </p>

        <div className="mt-10 v-rise">
          <WalletButton />
        </div>
        <button
          onClick={() => navigate('/overview')}
          className="v-focus mt-4 text-xs text-[var(--v-muted-2)] hover:text-[var(--v-muted)] underline underline-offset-4"
        >
          Explore without connecting
        </button>
      </main>

      <section className="px-6 lg:px-10 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map(({ icon: Icon, label, body }) => (
            <div key={label} className="v-card p-5 text-left">
              <Icon size={18} className="text-[var(--v-accent)] mb-4" strokeWidth={1.5} />
              <p className="text-[var(--v-white)] font-medium mb-1.5">{label}</p>
              <p className="text-xs text-[var(--v-muted)] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 lg:px-10 py-6 text-center">
        <p className="text-[10px] v-mono text-[var(--v-muted-2)] uppercase tracking-widest">
          Your funds never leave your wallet · Nothing executes without your approval
        </p>
      </footer>
    </div>
  );
}
