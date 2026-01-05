import express from 'express';
import { verifyWalletAuth, requireRole } from '../middleware/auth.js';
import { getDatabase } from '../database/init.js';

const router = express.Router();
const db = getDatabase();

/**
 * GET /api/pharmacy/prescription/:tokenId
 * Verify and get prescription details by token ID
 */
router.get('/prescription/:tokenId', verifyWalletAuth, requireRole('pharmacist'), (req, res) => {
  try {
    const { tokenId } = req.params;

    const prescription = db.prepare(`
      SELECT 
        p.*,
        d.name as doctor_name,
        d.specialization,
        d.license_number,
        u.wallet_address as patient_address,
        pp.first_name as patient_first_name,
        pp.last_name as patient_last_name
      FROM prescriptions p
      JOIN doctor_profiles d ON p.doctor_id = d.user_id
      JOIN users u ON p.patient_id = u.id
      LEFT JOIN patient_profiles pp ON u.id = pp.user_id
      WHERE p.prescription_token_id = ?
    `).get(tokenId);

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Check if expired
    const isExpired = prescription.expiry_date && 
                     new Date(prescription.expiry_date) < new Date();

    // Check if already fulfilled
    const isFulfilled = prescription.status === 'fulfilled';

    res.json({
      prescription,
      valid: !isExpired && !isFulfilled,
      isExpired,
      isFulfilled
    });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

/**
 * POST /api/pharmacy/prescription/:tokenId/fulfill
 * Fulfill (redeem) a prescription
 */
router.post('/prescription/:tokenId/fulfill', verifyWalletAuth, requireRole('pharmacist'), (req, res) => {
  try {
    const { tokenId } = req.params;

    const prescription = db.prepare(`
      SELECT * FROM prescriptions WHERE prescription_token_id = ?
    `).get(tokenId);

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    if (prescription.status === 'fulfilled') {
      return res.status(400).json({ error: 'Prescription already fulfilled' });
    }

    if (prescription.expiry_date && new Date(prescription.expiry_date) < new Date()) {
      return res.status(400).json({ error: 'Prescription has expired' });
    }

    // Mark as fulfilled
    db.prepare(`
      UPDATE prescriptions 
      SET status = 'fulfilled', fulfilled_at = datetime('now'), fulfilled_by = ?
      WHERE prescription_token_id = ?
    `).run(req.user.id, tokenId);

    // In production, this would trigger a smart contract to burn the token
    res.json({
      success: true,
      message: 'Prescription fulfilled successfully. Token should be burned on-chain.'
    });
  } catch (error) {
    console.error('Fulfill prescription error:', error);
    res.status(500).json({ error: 'Failed to fulfill prescription' });
  }
});

/**
 * GET /api/pharmacy/inventory
 * Get pharmacy inventory
 */
router.get('/inventory', verifyWalletAuth, requireRole('pharmacist'), (req, res) => {
  try {
    const inventory = db.prepare(`
      SELECT * FROM inventory 
      WHERE pharmacy_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);

    res.json({ inventory });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

/**
 * POST /api/pharmacy/inventory
 * Add item to inventory (from supply chain)
 */
router.post('/inventory', verifyWalletAuth, requireRole('pharmacist'), (req, res) => {
  try {
    const {
      drug_name,
      batch_number,
      manufacturer,
      blockchain_tx_hash,
      qr_code,
      quantity,
      expiry_date,
      verified
    } = req.body;

    if (!drug_name || !batch_number || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = db.prepare(`
      INSERT INTO inventory 
      (pharmacy_id, drug_name, batch_number, manufacturer, blockchain_tx_hash, qr_code, quantity, expiry_date, verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      drug_name,
      batch_number,
      manufacturer || null,
      blockchain_tx_hash || null,
      qr_code || null,
      quantity,
      expiry_date || null,
      verified ? 1 : 0
    );

    res.status(201).json({
      success: true,
      inventory_id: result.lastInsertRowid,
      message: 'Inventory item added successfully'
    });
  } catch (error) {
    console.error('Add inventory error:', error);
    res.status(500).json({ error: 'Failed to add inventory item' });
  }
});

/**
 * POST /api/pharmacy/inventory/verify
 * Verify inventory item authenticity via blockchain
 */
router.post('/inventory/verify', verifyWalletAuth, requireRole('pharmacist'), (req, res) => {
  try {
    const { batch_number, blockchain_tx_hash } = req.body;

    if (!batch_number && !blockchain_tx_hash) {
      return res.status(400).json({ error: 'Batch number or transaction hash required' });
    }

    // In production, this would query the blockchain to verify
    // For now, we'll just check if the item exists in inventory
    const item = db.prepare(`
      SELECT * FROM inventory 
      WHERE (batch_number = ? OR blockchain_tx_hash = ?)
        AND pharmacy_id = ?
    `).get(batch_number || '', blockchain_tx_hash || '', req.user.id);

    if (!item) {
      return res.status(404).json({ 
        verified: false, 
        error: 'Item not found in inventory' 
      });
    }

    // Mark as verified
    if (!item.verified) {
      db.prepare('UPDATE inventory SET verified = 1 WHERE id = ?').run(item.id);
    }

    res.json({
      verified: true,
      item: {
        ...item,
        verified: true
      }
    });
  } catch (error) {
    console.error('Verify inventory error:', error);
    res.status(500).json({ error: 'Failed to verify inventory' });
  }
});

export default router;

