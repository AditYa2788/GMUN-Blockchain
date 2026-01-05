import express from 'express';
import { verifyWalletAuth, optionalAuth } from '../middleware/auth.js';
import { getDatabase } from '../database/init.js';
import { uploadToIPFS, getIPFSGatewayURL } from '../services/ipfs.js';

const router = express.Router();
const db = getDatabase();

/**
 * GET /api/patient/profile
 * Get patient profile
 */
router.get('/profile', verifyWalletAuth, (req, res) => {
  try {
    const profile = db.prepare(`
      SELECT * FROM patient_profiles 
      WHERE user_id = ?
    `).get(req.user.id);

    if (!profile) {
      return res.json({ profile: null });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/patient/profile
 * Update patient profile
 */
router.put('/profile', verifyWalletAuth, (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, date_of_birth, gender, address,
      blood_type, height, weight, allergies, chronic_conditions, current_medications,
      emergency_name, emergency_relation, emergency_phone
    } = req.body;

    // Check if profile exists
    const existing = db.prepare('SELECT id FROM patient_profiles WHERE user_id = ?')
      .get(req.user.id);

    if (existing) {
      // Update
      db.prepare(`
        UPDATE patient_profiles SET
          first_name = ?, last_name = ?, email = ?, phone = ?,
          date_of_birth = ?, gender = ?, address = ?,
          blood_type = ?, height = ?, weight = ?,
          allergies = ?, chronic_conditions = ?, current_medications = ?,
          emergency_name = ?, emergency_relation = ?, emergency_phone = ?
        WHERE user_id = ?
      `).run(
        first_name, last_name, email, phone, date_of_birth, gender, address,
        blood_type, height, weight, allergies, chronic_conditions, current_medications,
        emergency_name, emergency_relation, emergency_phone,
        req.user.id
      );
    } else {
      // Insert
      db.prepare(`
        INSERT INTO patient_profiles (
          user_id, first_name, last_name, email, phone, date_of_birth, gender, address,
          blood_type, height, weight, allergies, chronic_conditions, current_medications,
          emergency_name, emergency_relation, emergency_phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user.id, first_name, last_name, email, phone, date_of_birth, gender, address,
        blood_type, height, weight, allergies, chronic_conditions, current_medications,
        emergency_name, emergency_relation, emergency_phone
      );
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * GET /api/patient/appointments
 * Get patient appointments
 */
router.get('/appointments', verifyWalletAuth, (req, res) => {
  try {
    const appointments = db.prepare(`
      SELECT 
        a.*,
        d.name as doctor_name,
        d.specialization,
        d.department
      FROM appointments a
      JOIN doctor_profiles d ON a.doctor_id = d.user_id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `).all(req.user.id);

    res.json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

/**
 * POST /api/patient/appointments
 * Book a new appointment
 */
router.post('/appointments', verifyWalletAuth, (req, res) => {
  try {
    const { doctor_id, department, appointment_date, appointment_time, reason, escrow_amount } = req.body;

    if (!doctor_id || !department || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify doctor exists
    const doctor = db.prepare('SELECT user_id FROM doctor_profiles WHERE user_id = ?')
      .get(doctor_id);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Create appointment
    const result = db.prepare(`
      INSERT INTO appointments 
      (patient_id, doctor_id, department, appointment_date, appointment_time, reason, escrow_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      doctor_id,
      department,
      appointment_date,
      appointment_time,
      reason || null,
      escrow_amount || null
    );

    res.status(201).json({
      success: true,
      appointment_id: result.lastInsertRowid,
      message: 'Appointment booked successfully'
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

/**
 * GET /api/patient/prescriptions
 * Get patient prescriptions
 */
router.get('/prescriptions', verifyWalletAuth, (req, res) => {
  try {
    const prescriptions = db.prepare(`
      SELECT 
        p.*,
        d.name as doctor_name,
        d.specialization
      FROM prescriptions p
      JOIN doctor_profiles d ON p.doctor_id = d.user_id
      WHERE p.patient_id = ?
      ORDER BY p.issue_date DESC
    `).all(req.user.id);

    res.json({ prescriptions });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

/**
 * GET /api/patient/ehr
 * Get patient EHR records
 */
router.get('/ehr', verifyWalletAuth, (req, res) => {
  try {
    const records = db.prepare(`
      SELECT 
        e.*,
        u.wallet_address as created_by_address
      FROM ehr_records e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.patient_id = ?
      ORDER BY e.created_at DESC
    `).all(req.user.id);

    // Add IPFS gateway URLs
    const recordsWithURLs = records.map(record => ({
      ...record,
      ipfs_url: record.ipfs_hash ? getIPFSGatewayURL(record.ipfs_hash) : null
    }));

    res.json({ records: recordsWithURLs });
  } catch (error) {
    console.error('Get EHR error:', error);
    res.status(500).json({ error: 'Failed to fetch EHR records' });
  }
});

/**
 * GET /api/patient/access-permissions
 * Get access permissions granted by patient
 */
router.get('/access-permissions', verifyWalletAuth, (req, res) => {
  try {
    const permissions = db.prepare(`
      SELECT 
        ap.*,
        u.wallet_address as granted_to_address
      FROM access_permissions ap
      JOIN users u ON ap.granted_to = u.id
      WHERE ap.patient_id = ?
      ORDER BY ap.created_at DESC
    `).all(req.user.id);

    res.json({ permissions });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

/**
 * POST /api/patient/grant-access
 * Grant access to patient data
 */
router.post('/grant-access', verifyWalletAuth, (req, res) => {
  try {
    const { granted_to_address, record_type, expires_at } = req.body;

    // Find user by wallet address
    const grantedUser = db.prepare('SELECT id FROM users WHERE wallet_address = ?')
      .get(granted_to_address);

    if (!grantedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate access key (in production, use proper encryption)
    const accessKey = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);

    db.prepare(`
      INSERT INTO access_permissions 
      (patient_id, granted_to, record_type, access_key, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      grantedUser.id,
      record_type || null,
      accessKey,
      expires_at || null
    );

    res.json({
      success: true,
      access_key: accessKey,
      message: 'Access granted successfully'
    });
  } catch (error) {
    console.error('Grant access error:', error);
    res.status(500).json({ error: 'Failed to grant access' });
  }
});

export default router;

