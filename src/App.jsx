import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './hooks/useWallet.jsx';
import MainLayout from './layout/MainLayout.jsx';
import Landing from './pages/Landing.jsx';
import Overview from './pages/Overview.jsx';
import Explore from './pages/Explore.jsx';
import Markets from './pages/Markets.jsx';
import AssetDetails from './pages/AssetDetails.jsx';
import Agent from './pages/Agent.jsx';
import Strategies from './pages/Strategies.jsx';
import Portfolio from './pages/Portfolio.jsx';
import Transactions from './pages/Transactions.jsx';
import Whales from './pages/Whales.jsx';
import WhaleProfile from './pages/WhaleProfile.jsx';
import RiskCenter from './pages/RiskCenter.jsx';
import Activity from './pages/Activity.jsx';
import Alerts from './pages/Alerts.jsx';
import Telegram from './pages/Telegram.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<MainLayout />}>
            <Route path="/overview" element={<Overview />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/markets/:id" element={<AssetDetails />} />
            <Route path="/agent" element={<Agent />} />
            <Route path="/strategies" element={<Strategies />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/whales" element={<Whales />} />
            <Route path="/whales/:address" element={<WhaleProfile />} />
            <Route path="/risk" element={<RiskCenter />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/telegram" element={<Telegram />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
}
