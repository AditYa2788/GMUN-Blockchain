import express from 'express';
import { verifyWalletAuth, requireRole } from '../middleware/auth.js';
import { getDatabase } from '../database/init.js';
import { uploadToIPFS } from '../services/ipfs.js';

const router = express.Router();
const db = getDatabase();

/**
 * POST /api/lab/results
 * Upload lab results (creates NFT)
 */
router.post('/results', verifyWalletAuth, requireRole('lab'), async (req, res) => {
  try {
    const {
      patient_id,
      test_type,
      result_data
    } = req.body;

    if (!patient_id || !test_type || !result_data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify patient exists
    const patient = db.prepare('SELECT * FROM users WHERE id = ? AND role = ?')
      .get(patient_id, 'patient');

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Create lab result data
    const labResult = {
      lab_id: req.user.id,
      lab_wallet: req.user.wallet_address,
      patient_id,
      patient_wallet: patient.wallet_address,
      test_type,
      result_data,
      created_at: new Date().toISOString()
    };

    // Upload to IPFS
    let ipfsHash = null;
    try {
      ipfsHash = await uploadToIPFS(labResult);
    } catch (error) {
      console.warn('IPFS upload failed:', error.message);
      return res.status(500).json({ error: 'Failed to upload to IPFS' });
    }

    // Create lab result record
    // In production, this would trigger a smart contract to mint an NFT
    const nftTokenId = `LAB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const result = db.prepare(`
      INSERT INTO lab_results 
      (patient_id, lab_id, test_type, result_data, ipfs_hash, nft_token_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      patient_id,
      req.user.id,
      test_type,
      JSON.stringify(result_data),
      ipfsHash,
      nftTokenId
    );

    // Also create EHR record
    db.prepare(`
      INSERT INTO ehr_records 
      (patient_id, record_type, title, description, ipfs_hash, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      patient_id,
      'lab_result',
      test_type,
      `Lab test result: ${test_type}`,
      ipfsHash,
      req.user.id
    );

    res.status(201).json({
      success: true,
      lab_result: {
        id: result.lastInsertRowid,
        nft_token_id: nftTokenId,
        ipfs_hash: ipfsHash
      },
      message: 'Lab result uploaded successfully. NFT minting should be triggered via smart contract.'
    });
  } catch (error) {
    console.error('Upload lab result error:', error);
    res.status(500).json({ error: 'Failed to upload lab result' });
  }
});

/**
 * GET /api/lab/results
 * Get lab results (for the lab)
 */
router.get('/results', verifyWalletAuth, requireRole('lab'), (req, res) => {
  try {
    const results = db.prepare(`
      SELECT 
        lr.*,
        u.wallet_address as patient_address,
        pp.first_name as patient_first_name,
        pp.last_name as patient_last_name
      FROM lab_results lr
      JOIN users u ON lr.patient_id = u.id
      LEFT JOIN patient_profiles pp ON u.id = pp.user_id
      WHERE lr.lab_id = ?
      ORDER BY lr.created_at DESC
    `).all(req.user.id);

    res.json({ results });
  } catch (error) {
    console.error('Get lab results error:', error);
    res.status(500).json({ error: 'Failed to fetch lab results' });
  }
});

export default router;

