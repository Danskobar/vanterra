import { useWallet } from '../hooks/useWallet.jsx';
import { shortenAddress } from '../utils/format.js';
import { Button, ModeBadge } from './Primitives.jsx';

export default function WalletButton({ compact = false }) {
  const { address, isDemo, status, connect, disconnect, error } = useWallet();

  if (status === 'connected' && address) {
    return (
      <div className="flex items-center gap-2">
        {!compact && <ModeBadge isDemo={isDemo} />}
        <button
          onClick={disconnect}
          className="v-focus v-mono text-xs px-3 py-2 rounded-lg border border-white/10 bg-[var(--v-surface-raised)] text-[var(--v-white)] hover:border-white/25 transition-colors flex items-center gap-2"
          title="Disconnect wallet"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--v-success)]" />
          {shortenAddress(address)}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="primary" onClick={connect} disabled={status === 'connecting'}>
        {status === 'connecting' ? 'Connecting…' : 'Connect Wallet'}
      </Button>
      {error && <span className="text-[10px] text-[var(--v-danger)]">{error}</span>}
    </div>
  );
}
