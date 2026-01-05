import express from 'express';
import { generateAuthMessage } from '../services/web3.js';
import { getDatabase } from '../database/init.js';
import { verifyWalletAuth } from '../middleware/auth.js';

const router = express.Router();
const db = getDatabase();

/**
 * GET /api/auth/nonce
 * Generate a nonce for wallet authentication
 */
router.get('/nonce', (req, res) => {
  const { address } = req.query;
  
  if (!address) {
    return res.status(400).json({ error: 'Wallet address required' });
  }

  // Generate nonce (in production, store this temporarily)
  const nonce = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  
  const message = generateAuthMessage(address, nonce);
  
  res.json({ 
    nonce,
    message,
    address 
  });
});

/**
 * POST /api/auth/verify
 * Verify wallet signature and authenticate
 */
router.post('/verify', async (req, res) => {
  try {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({ error: 'Address, signature, and message required' });
    }

    // Verify signature (this would be done in middleware in production)
    const { verifySignature } = await import('../services/web3.js');
    const isValid = verifySignature(address, message, signature);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Get or create user
    let user = db.prepare('SELECT * FROM users WHERE wallet_address = ?').get(address);
    
    if (!user) {
      const result = db.prepare('INSERT INTO users (wallet_address, role) VALUES (?, ?)')
        .run(address, 'patient');
      user = { 
        id: result.lastInsertRowid, 
        wallet_address: address, 
        role: 'patient' 
      };
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        wallet_address: user.wallet_address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Auth verify error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', verifyWalletAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      wallet_address: req.user.wallet_address,
      role: req.user.role
    }
  });
});

export default router;

