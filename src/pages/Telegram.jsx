import { useEffect, useRef, useState } from 'react';
import { Send, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getTelegramStatus, requestLinkCode, getLinkStatus, unlinkTelegram } from '../services/telegram.js';
import { Button, ModeBadge, Skeleton } from '../components/Primitives.jsx';
import { useWallet } from '../hooks/useWallet.jsx';

export default function Telegram() {
  const { address, status: walletStatus } = useWallet();
  const [botStatus, setBotStatus] = useState(null);
  const [link, setLink] = useState(null);
  const [deepLink, setDeepLink] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    getTelegramStatus().then(setBotStatus);
  }, []);

  useEffect(() => {
    if (address) refreshLinkStatus();
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  async function refreshLinkStatus() {
    try {
      const res = await getLinkStatus(address);
      setLink(res);
      if (res.linked) {
        clearInterval(pollRef.current);
        setDeepLink(null);
      }
    } catch (err) {
      // no link yet is not an error state
    }
  }

  async function handleConnect() {
    setError(null);
    setConnecting(true);
    try {
      const { deepLink: url } = await requestLinkCode(address);
      setDeepLink(url);
      window.open(url, '_blank', 'noopener');
      pollRef.current = setInterval(refreshLinkStatus, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  }

  async function handleUnlink() {
    await unlinkTelegram(address);
    setLink({ linked: false });
  }

  if (!botStatus) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-medium text-[var(--v-white)] mb-1">Telegram</h1>
          <p className="text-sm text-[var(--v-muted)]">
            A second control surface for Vanterra — check your portfolio, opportunities, whales, and risk, and
            approve transactions, right from your own Telegram.
          </p>
        </div>
        <ModeBadge isDemo={!botStatus.configured} />
      </div>

      {!botStatus.configured && (
        <div className="v-card p-5 border-[rgba(180,106,106,0.25)] flex items-start gap-3">
          <AlertTriangle size={16} className="text-[var(--v-danger)] mt-0.5 shrink-0" />
          <p className="text-xs text-[var(--v-muted)] leading-relaxed">
            No Telegram bot is connected to this backend yet. Create one with{' '}
            <a
              href="https://core.telegram.org/bots#botfather"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--v-silver)] underline"
            >
              @BotFather
            </a>
            , then set <span className="v-mono">TELEGRAM_BOT_TOKEN</span> and{' '}
            <span className="v-mono">TELEGRAM_BOT_USERNAME</span> in{' '}
            <span className="v-mono text-[var(--v-silver)]">server/.env</span> and restart the backend.
          </p>
        </div>
      )}

      {botStatus.configured && walletStatus !== 'connected' && (
        <div className="v-card p-5">
          <p className="text-sm text-[var(--v-white)]">Connect your wallet first to link your own Telegram account.</p>
        </div>
      )}

      {botStatus.configured && walletStatus === 'connected' && (
        <div className="v-card p-5">
          {link?.linked ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={16} className="text-[var(--v-success)]" />
                <p className="text-sm text-[var(--v-white)]">
                  Connected as <span className="v-mono">{link.telegramUsername}</span>
                </p>
              </div>
              <Button variant="secondary" onClick={handleUnlink}>
                Disconnect Telegram
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-[var(--v-white)] mb-1">Connect your own Telegram account</p>
              <p className="text-xs text-[var(--v-muted)] leading-relaxed mb-4">
                This opens Telegram with a one-time code tied to your wallet. Only you can link your own chat.
              </p>
              <Button variant="primary" onClick={handleConnect} disabled={connecting}>
                <Send size={14} /> {connecting ? 'Generating link…' : 'Connect Telegram'}
              </Button>
              {deepLink && (
                <p className="text-xs text-[var(--v-muted)] mt-3">
                  Waiting for confirmation —{' '}
                  <a href={deepLink} target="_blank" rel="noreferrer" className="text-[var(--v-silver)] underline">
                    reopen the chat
                  </a>{' '}
                  if it didn't launch automatically.
                </p>
              )}
              {error && <p className="text-xs text-[var(--v-danger)] mt-3">{error}</p>}
            </div>
          )}
        </div>
      )}

      <div className="v-card p-5">
        <p className="text-xs v-mono uppercase tracking-wider text-[var(--v-muted)] mb-3">Capabilities</p>
        <ul className="space-y-2 text-sm text-[var(--v-white)]">
          {[
            'Ask the AI questions about opportunities, whales, or risk',
            'Check portfolio value and P&L',
            'Review proposed strategies (final approval still happens in the app)',
            'Receive whale, risk, and transaction alerts',
          ].map((c) => (
            <li key={c} className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-[var(--v-silver)] mt-2 shrink-0" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      <a
        href="https://core.telegram.org/bots"
        target="_blank"
        rel="noreferrer"
        className="v-focus inline-flex items-center gap-1.5 text-xs text-[var(--v-muted)] hover:text-[var(--v-white)]"
      >
        Telegram Bot API docs <ExternalLink size={12} />
      </a>
    </div>
  );
}
