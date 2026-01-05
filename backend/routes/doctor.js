import express from 'express';
import { verifyWalletAuth, requireRole } from '../middleware/auth.js';
import { getDatabase } from '../database/init.js';
import { uploadToIPFS } from '../services/ipfs.js';

const router = express.Router();
const db = getDatabase();

/**
 * GET /api/doctor/profile
 * Get doctor profile
 */
router.get('/profile', verifyWalletAuth, requireRole('doctor'), (req, res) => {
  try {
    const profile = db.prepare(`
      SELECT * FROM doctor_profiles 
      WHERE user_id = ?
    `).get(req.user.id);

    res.json({ profile });
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * GET /api/doctor/patients
 * Get list of patients (with access permission)
 */
router.get('/patients', verifyWalletAuth, requireRole('doctor'), (req, res) => {
  try {
    const patients = db.prepare(`
      SELECT DISTINCT
        u.id,
        u.wallet_address,
        pp.first_name,
        pp.last_name,
        pp.email,
        pp.phone
      FROM access_permissions ap
      JOIN users u ON ap.patient_id = u.id
      LEFT JOIN patient_profiles pp ON u.id = pp.user_id
      WHERE ap.granted_to = ? 
        AND (ap.expires_at IS NULL OR ap.expires_at > datetime('now'))
    `).all(req.user.id);

    res.json({ patients });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

/**
 * GET /api/doctor/appointments
 * Get doctor's appointments
 */
router.get('/appointments', verifyWalletAuth, requireRole('doctor'), (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT 
        a.*,
        u.wallet_address as patient_address,
        pp.first_name as patient_first_name,
        pp.last_name as patient_last_name
      FROM appointments a
      JOIN users u ON a.patient_id = u.id
      LEFT JOIN patient_profiles pp ON u.id = pp.user_id
      WHERE a.doctor_id = ?
    `;

    const params = [req.user.id];
    
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const appointments = db.prepare(query).all(...params);

    res.json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

/**
 * PUT /api/doctor/appointments/:id/status
 * Update appointment status
 */
router.put('/appointments/:id/status', verifyWalletAuth, requireRole('doctor'), (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify appointment belongs to doctor
    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ? AND doctor_id = ?')
      .get(id, req.user.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, id);

    res.json({ success: true, message: 'Appointment status updated' });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

/**
 * POST /api/doctor/prescriptions
 * Create a new prescription (mint prescription token)
 */
router.post('/prescriptions', verifyWalletAuth, requireRole('doctor'), async (req, res) => {
  try {
    const {
      patient_id,
      drug_name,
      dosage,
      instructions,
      type,
      expiry_days = 30
    } = req.body;

    if (!patient_id || !drug_name || !dosage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify patient exists
    const patient = db.prepare('SELECT * FROM users WHERE id = ? AND role = ?')
      .get(patient_id, 'patient');

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Create prescription metadata
    const prescriptionData = {
      doctor_id: req.user.id,
      doctor_wallet: req.user.wallet_address,
      patient_id,
      patient_wallet: patient.wallet_address,
      drug_name,
      dosage,
      instructions,
      type,
      issue_date: new Date().toISOString(),
      expiry_date: new Date(Date.now() + expiry_days * 24 * 60 * 60 * 1000).toISOString()
    };

    // Upload to IPFS
    let ipfsHash = null;
    try {
      ipfsHash = await uploadToIPFS(prescriptionData);
    } catch (error) {
      console.warn('IPFS upload failed, continuing without IPFS:', error.message);
    }

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiry_days);

    // Create prescription record
    // In production, this would trigger a smart contract to mint the token
    const prescriptionTokenId = `RX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const result = db.prepare(`
      INSERT INTO prescriptions 
      (prescription_token_id, patient_id, doctor_id, drug_name, dosage, instructions, type, issue_date, expiry_date, ipfs_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      prescriptionTokenId,
      patient_id,
      req.user.id,
      drug_name,
      dosage,
      instructions || null,
      type || null,
      new Date().toISOString().split('T')[0],
      expiryDate.toISOString().split('T')[0],
      ipfsHash
    );

    res.status(201).json({
      success: true,
      prescription: {
        id: result.lastInsertRowid,
        prescription_token_id: prescriptionTokenId,
        ipfs_hash: ipfsHash,
        ...prescriptionData
      },
      message: 'Prescription created successfully. Token minting should be triggered via smart contract.'
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

/**
 * GET /api/doctor/doctors
 * Get list of all doctors (public endpoint)
 */
router.get('/doctors', optionalAuth, (req, res) => {
  try {
    const { department, specialization } = req.query;

    let query = `
      SELECT 
        dp.*,
        u.wallet_address
      FROM doctor_profiles dp
      JOIN users u ON dp.user_id = u.id
      WHERE dp.license_verified = 1
    `;

    const params = [];

    if (department) {
      query += ' AND dp.department = ?';
      params.push(department);
    }

    if (specialization) {
      query += ' AND dp.specialization = ?';
      params.push(specialization);
    }

    query += ' ORDER BY dp.name';

    const doctors = db.prepare(query).all(...params);

    res.json({ doctors });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

/**
 * GET /api/doctor/departments
 * Get list of departments
 */
router.get('/departments', (req, res) => {
  try {
    const departments = db.prepare(`
      SELECT DISTINCT department 
      FROM doctor_profiles 
      WHERE license_verified = 1
      ORDER BY department
    `).all();

    res.json({ departments: departments.map(d => d.department) });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

export default router;

