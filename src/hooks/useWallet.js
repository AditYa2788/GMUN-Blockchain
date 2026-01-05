import { useState, useEffect } from 'react';
import { 
  connectWallet, 
  getCurrentAccount, 
  isMetaMaskInstalled,
  authenticateWallet,
  disconnectWallet as disconnect,
  isAuthenticated,
  getAuthInfo
} from '../services/wallet.js';

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAuthenticated, setIsAuth] = useState(false);
  const [error, setError] = useState(null);

  // Check for existing connection on mount
  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (isMetaMaskInstalled()) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (isMetaMaskInstalled()) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setIsAuth(false);
      disconnect();
    } else {
      setAccount(accounts[0]);
      checkAuth(accounts[0]);
    }
  };

  const checkConnection = async () => {
    try {
      const currentAccount = await getCurrentAccount();
      if (currentAccount) {
        setAccount(currentAccount);
        checkAuth(currentAccount);
      } else {
        // Check if we have stored auth
        const auth = getAuthInfo();
        if (auth) {
          setIsAuth(true);
        }
      }
    } catch (error) {
      console.error('Check connection error:', error);
    }
  };

  const checkAuth = async (address) => {
    try {
      const auth = getAuthInfo();
      if (auth && auth.address?.toLowerCase() === address?.toLowerCase()) {
        setIsAuth(true);
      } else {
        setIsAuth(false);
      }
    } catch (error) {
      setIsAuth(false);
    }
  };

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const address = await connectWallet();
      setAccount(address);
      
      // Authenticate with backend
      await authenticateWallet(address);
      setIsAuth(true);
      
      return address;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsAuth(false);
    disconnect();
  };

  return {
    account,
    isConnecting,
    isAuthenticated,
    error,
    connect,
    disconnectWallet,
    isMetaMaskInstalled: isMetaMaskInstalled()
  };
}

