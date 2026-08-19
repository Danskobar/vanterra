import { createContext, useCallback, useContext, useState } from 'react';
import { connectWallet, disconnectWallet, fetchBalances } from '../services/wallet.js';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [isDemo, setIsDemo] = useState(true);
  const [balances, setBalances] = useState(null);
  const [balanceError, setBalanceError] = useState(null);
  const [status, setStatus] = useState('disconnected'); // disconnected | connecting | connected | error
  const [error, setError] = useState(null);

  const connect = useCallback(async () => {
    setStatus('connecting');
    setError(null);
    setBalanceError(null);
    try {
      const result = await connectWallet();
      setAddress(result.address);
      setIsDemo(result.isDemo);
      setStatus('connected');
      // A balance-fetch problem (e.g. no RPC configured) should not undo a
      // successful wallet connection — surface it separately.
      try {
        const bal = await fetchBalances(result.address, result.isDemo);
        setBalances(bal);
      } catch (balErr) {
        setBalances(null);
        setBalanceError(balErr.message || 'Could not read balances.');
      }
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Connection failed.');
    }
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectWallet();
    setAddress(null);
    setBalances(null);
    setBalanceError(null);
    setStatus('disconnected');
  }, []);

  return (
    <WalletContext.Provider value={{ address, isDemo, balances, balanceError, status, error, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
