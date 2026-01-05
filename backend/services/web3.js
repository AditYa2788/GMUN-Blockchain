import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Web3 provider
let provider = null;
let signer = null;

try {
  const rpcUrl = process.env.RPC_URL || 'https://polygon-rpc.com';
  provider = new ethers.JsonRpcProvider(rpcUrl);
  
  if (process.env.PRIVATE_KEY) {
    signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log('✅ Web3 provider initialized with signer');
  } else {
    console.log('✅ Web3 provider initialized (read-only)');
  }
} catch (error) {
  console.error('❌ Failed to initialize Web3 provider:', error.message);
}

/**
 * Get provider instance
 */
export function getProvider() {
  if (!provider) {
    throw new Error('Web3 provider not initialized. Set RPC_URL in .env');
  }
  return provider;
}

/**
 * Get signer instance
 */
export function getSigner() {
  if (!signer) {
    throw new Error('Signer not initialized. Set PRIVATE_KEY in .env');
  }
  return signer;
}

/**
 * Verify wallet signature
 * @param {string} address - Wallet address
 * @param {string} message - Original message
 * @param {string} signature - Signature to verify
 * @returns {boolean} True if signature is valid
 */
export function verifySignature(address, message, signature) {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Generate a message for wallet signing
 * @param {string} address - Wallet address
 * @param {string} nonce - Nonce for replay protection
 * @returns {string} Message to sign
 */
export function generateAuthMessage(address, nonce) {
  return `Welcome to MedChain!\n\nSign this message to authenticate.\n\nAddress: ${address}\nNonce: ${nonce}`;
}

/**
 * Format address for display
 * @param {string} address - Full address
 * @returns {string} Formatted address (0x123...456)
 */
export function formatAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Check if address is valid
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid
 */
export function isValidAddress(address) {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

export { provider, signer };

