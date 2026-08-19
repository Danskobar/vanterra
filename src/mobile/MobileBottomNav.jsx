import { NavLink } from 'react-router-dom';
import { LayoutGrid, LineChart, Wallet as WalletIcon, Sparkles, Activity as ActivityIcon } from 'lucide-react';

const ITEMS = [
  { to: '/overview', label: 'Home', icon: LayoutGrid },
  { to: '/markets', label: 'Markets', icon: LineChart },
  { to: '/portfolio', label: 'Portfolio', icon: WalletIcon },
  { to: '/agent', label: 'Agent', icon: Sparkles },
  { to: '/activity', label: 'Activity', icon: ActivityIcon },
];

export default function MobileBottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-white/[0.08] bg-[var(--v-bg-0)]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-between px-1">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `v-focus flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] transition-colors ${
                isActive ? 'text-[var(--v-white)]' : 'text-[var(--v-muted-2)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={19} strokeWidth={isActive ? 2 : 1.5} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
