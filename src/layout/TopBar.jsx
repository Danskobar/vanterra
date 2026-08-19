import { useNavigate } from 'react-router-dom';
import { Bell, Search, ArrowRight } from 'lucide-react';
import WalletButton from '../components/WalletButton.jsx';
import Logo from '../components/Logo.jsx';
import { useEffect, useState } from 'react';
import { getAlerts } from '../services/notification.js';
import { X_LAYER } from '../services/xlayer.js';

export default function TopBar() {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    getAlerts().then((alerts) => setUnread(alerts.filter((a) => !a.read).length));
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate('/agent', { state: { prefill: q } });
    setQuery('');
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-4 lg:px-8 h-16 border-b border-white/[0.06] bg-[var(--v-bg-0)]/85 backdrop-blur-md">
      <div className="lg:hidden">
        <Logo size={24} />
      </div>

      <form onSubmit={handleSubmit} className="hidden md:flex flex-1 max-w-xl items-center gap-2.5 v-card px-3.5 py-2 focus-within:border-white/25 transition-colors">
        <Search size={14} className="text-[var(--v-muted-2)] shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search assets, wallets, protocols or ask Vanterra..."
          className="v-focus flex-1 bg-transparent outline-none text-sm text-[var(--v-white)] placeholder:text-[var(--v-muted-2)]"
        />
        {query && (
          <button type="submit" className="v-focus shrink-0 text-[var(--v-muted-2)] hover:text-[var(--v-white)]">
            <ArrowRight size={14} />
          </button>
        )}
      </form>

      <div className="flex-1 md:hidden" />

      <div className="flex items-center gap-3">
        <span className="hidden lg:inline v-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border border-white/10 text-[var(--v-muted)]">
          {X_LAYER.chainName}
        </span>
        <button
          onClick={() => navigate('/alerts')}
          className="v-focus relative p-2 rounded-lg text-[var(--v-muted)] hover:text-[var(--v-white)] hover:bg-white/5 transition-colors"
          aria-label="Alerts"
        >
          <Bell size={18} strokeWidth={1.6} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--v-warning)]" />
          )}
        </button>
        <WalletButton />
      </div>
    </header>
  );
}
