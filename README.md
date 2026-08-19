# VANTERRA

**Intelligence. Insight. Edge.**

An AI-powered onchain financial operating system built for X Layer, built for
the **X Layer BuildX AI Season Hackathon** (AI-RWA track).

## Overview

VANTERRA helps users discover RWA and DeFi opportunities, analyze them with a
real LLM, monitor whale wallets and portfolio risk, build and simulate
investment strategies, and execute approved transactions on X Layer — from
the web app or from their own Telegram account. Funds stay in the user's own
wallet at every step.

## Problem

Onchain opportunity discovery is fragmented across dashboards that show raw
numbers without judgment. Retail users have no continuous signal on whale
behavior, no unified risk view across their positions, and no assistant that
can turn a plain-language goal into a concrete, reviewable transaction plan.

## Solution

VANTERRA combines a real AI agent, RWA/DeFi opportunity discovery, whale
intelligence, a risk guardian, portfolio management, strategy simulation, and
X Layer execution into one product loop:

```
DISCOVER → ANALYZE → CHECK WHALES → CHECK RISK → BUILD STRATEGY →
SIMULATE → USER APPROVES → EXECUTE → MONITOR → ALERT → MANAGE
```

## Why this is AI-native, not a chatbot bolted onto a dApp

Every reasoning step — interpreting a free-text investment goal, analyzing an
opportunity, explaining a risk alert, explaining a portfolio health score —
is a real call to an LLM on the backend (`server/src/services/aiProvider.js`).
There is **no keyword or regex parser** anywhere in the request path: when a
user types "I have $5,000, keep 30% liquid, low-risk above 6% APY", the model
itself reads that sentence and returns structured JSON
(`extractStrategyIntent`), which the strategy engine then turns into a
concrete, approvable transaction plan.

## Architecture

VANTERRA ships as two parts:

```
vanterra/                  # React frontend (Vite)
  src/
    pages/          Explore, Markets, AssetDetails, Agent, Portfolio,
                     Whales, WhaleProfile, RiskCenter, Activity, Alerts,
                     Telegram, Settings, Landing
    components/      OpportunityCard, AICommandBar, WalletButton,
                     TransactionModal, PerformanceChart, Primitives, Logo
    layout/          Sidebar, TopBar, MainLayout
    mobile/          MobileBottomNav
    services/        ai (backend client), apiClient, wallet, xlayer,
                     onchain, telegram (backend client), whale, risk,
                     portfolio, transaction, notification
    hooks/           useWallet (wallet connection context)
    data/            demo opportunity/whale/risk/portfolio seed data
    utils/           formatting helpers

vanterra/server/            # Node/Express backend
  src/
    index.js         Express app entrypoint
    routes/           ai.js, telegram.js
    services/
      aiProvider.js   Real LLM calls (Anthropic or OpenAI-compatible).
                      No fallback text — errors surface as config errors.
      strategy.js     Deterministic allocation math over AI-extracted intent
      telegramBot.js  Real Telegram bot (long polling) + per-user account
                      linking
      opportunities.js  Server-side mirror of the seed opportunity data
      store.js        Small JSON-backed store for Telegram account links
```

The frontend never talks to an LLM or the Telegram Bot API directly — it
only calls the backend, which holds the actual API keys. This is also why
running VANTERRA requires **both** the frontend and the backend (see below).

## Key Features

- **Explore & Markets** — AI command bar plus a searchable, filterable
  opportunity marketplace across RWA and DeFi on X Layer.
- **Asset Details** — interactive charts, real AI analysis, whale activity,
  and an "Ask Vanterra" chat scoped to that asset.
- **Agent** — a conversational AI that reads a goal in plain language,
  extracts structured intent itself (no rule-based parsing), builds an
  allocation, and requires explicit approval before anything executes.
- **Portfolio** — value, P&L, allocation, and an AI-generated Portfolio
  Health explanation.
- **Whale Intelligence** — accumulation/distribution signals with wallet
  profiles, always framed as a behavioral signal, never a guarantee.
- **Risk Guardian / Risk Center** — risk scoring across liquidity,
  concentration, whale exposure, and market conditions, with AI-explained
  recommended actions.
- **Activity & Alerts** — a live stream and a notification center.
- **Telegram** — every user connects *their own* Telegram account to *their
  own* wallet with a one-time link code (`t.me/<bot>?start=<code>`); the same
  AI agent answers there.
- **Autonomous Mode** — off by default; when enabled, bounded by
  user-defined capital, approval-threshold, and risk limits (Settings page).
- **Real onchain execution (optional)** — when `VITE_USDC_ADDRESS` /
  `VITE_VAULT_ADDRESS` are set and a wallet is connected, approving and
  depositing in the Agent's transaction modal submits real signed
  transactions to X Layer via ethers.js, with a link to the explorer.
  Without those set, the same flow runs through the clearly labeled DEMO
  simulator instead — never a silently faked confirmation.

## Technology Stack

**Frontend:** React 19, Vite, React Router 7, Tailwind CSS 4, Recharts,
lucide-react, ethers.js.
**Backend:** Node.js, Express 5, node-telegram-bot-api, lowdb.

## Installation

```bash
# frontend
npm install

# backend
cd server && npm install
```

## Environment Variables

### Frontend (`.env`, copy from `.env.example`)

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend URL (default `http://localhost:8787`) |
| `VITE_XLAYER_RPC_URL` | X Layer RPC endpoint |
| `VITE_USDC_ADDRESS` | USDC (or stable) token address for real approvals |
| `VITE_VAULT_ADDRESS` | Destination vault/treasury address for real deposits |

### Backend (`server/.env`, copy from `server/.env.example`)

| Variable | Purpose |
|---|---|
| `AI_PROVIDER` | `anthropic` (default) or `openai`-compatible |
| `AI_PROVIDER_URL` | Chat-completions endpoint (only needed for non-Anthropic) |
| `AI_PROVIDER_KEY` | API key — **required** for the Agent to reason at all |
| `AI_MODEL` | Model name (default `claude-sonnet-4-6`) |
| `TELEGRAM_BOT_TOKEN` | Token from [@BotFather](https://core.telegram.org/bots#botfather) |
| `TELEGRAM_BOT_USERNAME` | Your bot's `@username`, used to build the deep link |

Every variable is optional in the sense that VANTERRA never crashes without
it — but AI and Telegram features are genuinely unavailable (with a clear
message) until they're set. Nothing is faked in their place.

## Running Locally

Run both processes (from the project root):

```bash
npm run dev:full
```

Or separately, in two terminals:

```bash
npm run dev            # frontend → http://localhost:5173
npm run server          # backend  → http://localhost:8787
```

## Testing

```bash
npm run build            # production frontend build
npm run preview          # serve the build locally
npx oxlint src           # static checks
node -c server/src/index.js   # backend syntax check
```

## Demo Mode vs. Real Mode

Every integration degrades independently and honestly:

- **AI** — real without a configured key: the Agent, Ask Vanterra, and
  health/risk explanations show an "AI unavailable" state with setup
  instructions, never a scripted response.
- **Telegram** — the Telegram page shows connection setup instructions
  until `TELEGRAM_BOT_TOKEN`/`TELEGRAM_BOT_USERNAME` are set; once they are,
  each user links their own account with their own one-time code.
- **Onchain execution** — real (ethers.js, signed by the connected wallet)
  once `VITE_USDC_ADDRESS`/`VITE_VAULT_ADDRESS` are set; otherwise the
  transaction modal runs a clearly labeled DEMO simulation with the same UI.
- **Wallet** — real EIP-1193 connection (`eth_requestAccounts`) if a browser
  wallet is injected; otherwise a labeled DEMO address.

## X Layer BuildX AI Season Hackathon — submission checklist

This project targets the **AI-RWA track**. Per the official rules
(`web3.okx.com/xlayer/build-x-series`):

- [x] AI is built into the core product (LLM-driven intent extraction,
      opportunity/portfolio/risk analysis) — not a chatbot bolted on top.
- [x] AI-RWA focus — Tokenized Treasury, Private Credit Note, Tokenized
      Real Estate Income, and Green Infrastructure Bond are RWA
      opportunities in the marketplace.
- [ ] Deploy independently on X Layer — Testnet during the hackathon,
      Mainnet afterward. Set `VITE_XLAYER_RPC_URL`, deploy/point
      `VITE_VAULT_ADDRESS` at a real vault contract, and host the frontend +
      backend (e.g. Vercel + Render).
- [ ] Maintain a dedicated X account for the project.
- [ ] Tag `@XLayerOfficial` when submitting.
- [ ] Submit via the official Google Form before **August 21, 2026, 23:59 UTC**.

### X Layer Setup
Set `VITE_XLAYER_RPC_URL` to an X Layer RPC endpoint. `services/xlayer.js`
centralizes chain config (chain ID `0x2b1` / `195`, explorer, native
currency). To enable real deposits/approvals, deploy a vault contract (or
use a treasury address for the hackathon) and set `VITE_VAULT_ADDRESS` +
`VITE_USDC_ADDRESS`.

### Wallet Setup
No seed phrase or private key is ever requested. `services/wallet.js` uses
the standard `eth_requestAccounts` flow against any injected EIP-1193
provider; `services/onchain.js` uses ethers.js for real transaction
submission once contract addresses are configured.

### AI Setup
Set `AI_PROVIDER_KEY` in `server/.env` (Anthropic by default). To use an
OpenAI-compatible endpoint instead, set `AI_PROVIDER=openai` and
`AI_PROVIDER_URL`.

### Telegram Setup
Register a bot with [@BotFather](https://core.telegram.org/bots#botfather),
set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_BOT_USERNAME` in `server/.env`, and
restart the backend. Each user then connects their own account from the
app's Telegram page — no shared or hardcoded chat ID.

## Deployment

- **Frontend:** any static host that serves a Vite SPA (Vercel, etc.). Set
  the frontend env vars in your host's dashboard.
- **Backend:** any Node host (Render, etc.) that can run a persistent
  process for Telegram long polling. Set the backend env vars there.

## License

MIT — see [LICENSE](./LICENSE).
