import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DB_PATH || join(__dirname, '../data/medchain.db');
const dbDir = dirname(dbPath);

// Ensure data directory exists
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

export function initDatabase() {
  console.log('📦 Initializing database...');

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Users table (stores wallet addresses and basic info)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wallet_address TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('patient', 'doctor', 'pharmacist', 'lab', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Patient profiles
  db.exec(`
    CREATE TABLE IF NOT EXISTS patient_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      phone TEXT,
      date_of_birth DATE,
      gender TEXT,
      address TEXT,
      blood_type TEXT,
      height TEXT,
      weight TEXT,
      allergies TEXT,
      chronic_conditions TEXT,
      current_medications TEXT,
      emergency_name TEXT,
      emergency_relation TEXT,
      emergency_phone TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Doctor profiles and credentials
  db.exec(`
    CREATE TABLE IF NOT EXISTS doctor_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      specialization TEXT NOT NULL,
      license_number TEXT UNIQUE,
      license_verified BOOLEAN DEFAULT 0,
      verified_by TEXT,
      experience_years INTEGER,
      availability TEXT,
      department TEXT,
      soulbound_token_id TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Appointments
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      department TEXT NOT NULL,
      appointment_date DATE NOT NULL,
      appointment_time TEXT NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')),
      escrow_amount TEXT,
      escrow_tx_hash TEXT,
      payment_released BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Prescriptions (on-chain tokens)
  db.exec(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prescription_token_id TEXT UNIQUE,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      drug_name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      instructions TEXT,
      type TEXT,
      issue_date DATE NOT NULL,
      expiry_date DATE,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'fulfilled', 'expired', 'cancelled')),
      ipfs_hash TEXT,
      metadata_uri TEXT,
      fulfilled_at DATETIME,
      fulfilled_by INTEGER,
      FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (fulfilled_by) REFERENCES users(id)
    )
  `);

  // EHR Records (IPFS stored)
  db.exec(`
    CREATE TABLE IF NOT EXISTS ehr_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      record_type TEXT NOT NULL,
      title TEXT,
      description TEXT,
      ipfs_hash TEXT NOT NULL,
      encrypted_key TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Access permissions (who can view patient data)
  db.exec(`
    CREATE TABLE IF NOT EXISTS access_permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      granted_to INTEGER NOT NULL,
      record_type TEXT,
      access_key TEXT,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (granted_to) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Pharmacy inventory (supply chain tracking)
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pharmacy_id INTEGER,
      drug_name TEXT NOT NULL,
      batch_number TEXT NOT NULL,
      manufacturer TEXT,
      blockchain_tx_hash TEXT,
      qr_code TEXT,
      quantity INTEGER NOT NULL,
      expiry_date DATE,
      verified BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pharmacy_id) REFERENCES users(id)
    )
  `);

  // Lab results
  db.exec(`
    CREATE TABLE IF NOT EXISTS lab_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      lab_id INTEGER NOT NULL,
      test_type TEXT NOT NULL,
      result_data TEXT,
      ipfs_hash TEXT NOT NULL,
      nft_token_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lab_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Insert sample doctors
  const existingDoctors = db.prepare('SELECT COUNT(*) as count FROM doctor_profiles').get();
  if (existingDoctors.count === 0) {
    console.log('📝 Seeding sample data...');
    
    // Create sample doctor users
    const insertUser = db.prepare('INSERT INTO users (wallet_address, role) VALUES (?, ?)');
    const insertDoctor = db.prepare(`
      INSERT INTO doctor_profiles 
      (user_id, name, specialization, license_number, license_verified, experience_years, availability, department)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const doctors = [
      { name: 'Dr. Smith', specialization: 'Cardiology', dept: 'Cardiology', exp: 15, avail: 'Mon-Fri, 9 AM - 5 PM' },
      { name: 'Dr. Johnson', specialization: 'Cardiology', dept: 'Cardiology', exp: 10, avail: 'Mon-Fri, 10 AM - 6 PM' },
      { name: 'Dr. Williams', specialization: 'Neurology', dept: 'Neurology', exp: 20, avail: 'Tue-Sat, 9 AM - 4 PM' }
    ];

    doctors.forEach((doc, idx) => {
      const wallet = `0x${'0'.repeat(40)}${idx + 1}`; // Mock wallet
      const userId = insertUser.run(wallet, 'doctor').lastInsertRowid;
      insertDoctor.run(
        userId,
        doc.name,
        doc.specialization,
        `LIC-${1000 + idx}`,
        1,
        doc.exp,
        doc.avail,
        doc.dept
      );
    });
  }

  console.log('✅ Database initialized successfully');
  return db;
}

export function getDatabase() {
  return db;
}

export default db;

