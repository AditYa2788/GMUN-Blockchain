import { verifySignature, isValidAddress } from '../services/web3.js';
import { getDatabase } from '../database/init.js';

const db = getDatabase();

/**
 * Middleware to verify wallet signature authentication
 */
export async function verifyWalletAuth(req, res, next) {
  try {
    const { address, signature, message } = req.headers;

    if (!address || !signature || !message) {
      return res.status(401).json({ 
        error: 'Missing authentication headers. Provide: address, signature, message' 
      });
    }

    // Validate address format
    if (!isValidAddress(address)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Verify signature
    const isValid = verifySignature(address, message, signature);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Check if user exists, create if not
    let user = db.prepare('SELECT * FROM users WHERE wallet_address = ?').get(address);
    
    if (!user) {
      // Create new user
      const result = db.prepare('INSERT INTO users (wallet_address, role) VALUES (?, ?)')
        .run(address, 'patient');
      user = { id: result.lastInsertRowid, wallet_address: address, role: 'patient' };
    }

    // Attach user to request
    req.user = user;
    req.walletAddress = address.toLowerCase();
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware to check user role
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }

    next();
  };
}

/**
 * Optional auth - doesn't fail if no auth provided
 */
export async function optionalAuth(req, res, next) {
  try {
    const { address, signature, message } = req.headers;

    if (address && signature && message && isValidAddress(address)) {
      const isValid = verifySignature(address, message, signature);
      if (isValid) {
        let user = db.prepare('SELECT * FROM users WHERE wallet_address = ?').get(address);
        if (user) {
          req.user = user;
          req.walletAddress = address.toLowerCase();
        }
      }
    }

    next();
  } catch (error) {
    // Continue without auth
    next();
  }
}

