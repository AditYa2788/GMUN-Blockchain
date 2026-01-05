// Wallet connection and authentication utilities

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled() {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

/**
 * Connect to MetaMask wallet
 */
export async function connectWallet() {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    return accounts[0];
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
}

/**
 * Get current connected account
 */
export async function getCurrentAccount() {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts'
    });
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Get account error:', error);
    return null;
  }
}

/**
 * Sign a message with the connected wallet
 */
export async function signMessage(message) {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  const accounts = await window.ethereum.request({
    method: 'eth_accounts'
  });

  if (accounts.length === 0) {
    throw new Error('No account connected');
  }

  try {
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, accounts[0]]
    });

    return signature;
  } catch (error) {
    console.error('Sign message error:', error);
    throw error;
  }
}

/**
 * Authenticate with wallet (get nonce, sign, verify)
 */
export async function authenticateWallet(address) {
  try {
    // Get nonce from backend
    const { authAPI } = await import('./api.js');
    const { nonce, message } = await authAPI.getNonce(address);

    // Sign message
    const signature = await signMessage(message);

    // Verify with backend
    const result = await authAPI.verify(address, signature, message);

    // Store auth in localStorage
    localStorage.setItem('medchain_auth', JSON.stringify({
      address,
      signature,
      message
    }));

    return result;
  } catch (error) {
    console.error('Wallet authentication error:', error);
    throw error;
  }
}

/**
 * Disconnect wallet (clear auth)
 */
export function disconnectWallet() {
  localStorage.removeItem('medchain_auth');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return localStorage.getItem('medchain_auth') !== null;
}

/**
 * Get stored auth info
 */
export function getAuthInfo() {
  const auth = localStorage.getItem('medchain_auth');
  if (!auth) return null;

  try {
    return JSON.parse(auth);
  } catch {
    return null;
  }
}

/**
 * Format address for display
 */
export function formatAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

