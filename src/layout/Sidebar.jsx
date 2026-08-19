import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Wallet as WalletIcon,
  LineChart,
  Waves,
  Compass,
  Sparkles,
  ListChecks,
  ShieldAlert,
  Activity as ActivityIcon,
  Receipt,
  Send,
  Settings,
  HelpCircle,
} from 'lucide-react';
import Logo from '../components/Logo.jsx';

const PRIMARY = [
  { to: '/overview', label: 'Overview', icon: LayoutGrid },
  { to: '/portfolio', label: 'Portfolio', icon: WalletIcon },
  { to: '/markets', label: 'Markets', icon: LineChart },
  { to: '/whales', label: 'Whale Scout', icon: Waves },
  { to: '/explore', label: 'Opportunities', icon: Compass },
  { to: '/agent', label: 'AI Agent', icon: Sparkles },
  { to: '/strategies', label: 'Strategies', icon: ListChecks },
  { to: '/risk', label: 'Risk Guardian', icon: ShieldAlert },
  { to: '/activity', label: 'Activity', icon: ActivityIcon },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
];

const CONNECT = [{ to: '/telegram', label: 'Telegram', icon: Send }];

const FOOTER = [
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: 'https://web3.okx.com/xlayer/docs', label: 'Help', icon: HelpCircle, external: true },
];

function NavItem({ to, label, icon: Icon, external }) {
  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noreferrer"
        className="v-focus group flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--v-muted)] border border-transparent hover:text-[var(--v-white)] hover:bg-white/[0.03] transition-colors"
      >
        <Icon size={16} strokeWidth={1.6} />
        <span>{label}</span>
      </a>
    );
  }
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `v-focus group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-[var(--v-accent-dim)] text-[var(--v-white)] border border-[rgba(224,160,90,0.25)]'
            : 'text-[var(--v-muted)] border border-transparent hover:text-[var(--v-white)] hover:bg-white/[0.03]'
        }`
      }
    >
      <Icon size={16} strokeWidth={1.6} />
      <span>{label}</span>
    </NavLink>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="px-3 text-[9px] v-mono uppercase tracking-[0.15em] text-[var(--v-muted-2)] mb-1.5 mt-4 first:mt-0">
      {children}
    </p>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-white/[0.06] bg-[var(--v-bg-1)]/60 backdrop-blur-sm px-3 py-5">
      <div className="px-2 mb-6">
        <Logo size={26} />
      </div>

      <nav className="flex flex-col gap-0.5 overflow-y-auto">
        {PRIMARY.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="h-px bg-white/[0.06] my-4" />

      <div>
        <SectionLabel>Connect</SectionLabel>
        <nav className="flex flex-col gap-0.5">
          {CONNECT.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
      </div>

      <div className="mt-auto pt-4">
        <nav className="flex flex-col gap-0.5 mb-4">
          {FOOTER.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
        <div className="v-card px-3 py-3">
          <p className="text-[10px] text-[var(--v-muted)] leading-relaxed">
            Your funds stay in your own wallet. Vanterra recommends, you approve, X Layer executes.
          </p>
        </div>
      </div>
    </aside>
  );
}
