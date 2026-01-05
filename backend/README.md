# MedChain Backend API

Decentralized Healthcare & Pharmacy Ecosystem Backend

## Features

- 🔐 Wallet-based authentication (MetaMask, etc.)
- 📋 Patient Portal (EHR, appointments, prescriptions)
- 👨‍⚕️ Doctor Portal (credential verification, prescribing)
- 💊 Pharmacy Management (inventory, prescription redemption)
- 🧪 Lab Results (IPFS storage, NFT minting)
- ⛓️ Blockchain integration (Polygon/Ethereum)
- 📦 IPFS for decentralized storage

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `PORT` - Server port (default: 3001)
- `RPC_URL` - Blockchain RPC endpoint (Polygon/Ethereum)
- `PRIVATE_KEY` - Private key for contract interactions (optional)
- `IPFS_API_URL` - IPFS node URL (default: local IPFS daemon)
- `JWT_SECRET` - Secret for JWT tokens
- `DB_PATH` - SQLite database path

### 3. Start IPFS (Optional but Recommended)

For IPFS functionality, you need an IPFS node running:

```bash
# Install IPFS
# macOS: brew install ipfs
# Linux: https://docs.ipfs.io/install/command-line/

# Initialize and start
ipfs init
ipfs daemon
```

Or use a service like Pinata or Infura IPFS.

### 4. Initialize Database

The database will be automatically initialized on first server start.

### 5. Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `GET /api/auth/nonce` - Get nonce for wallet signing
- `POST /api/auth/verify` - Verify wallet signature
- `GET /api/auth/me` - Get current user

### Patient Routes
- `GET /api/patient/profile` - Get patient profile
- `PUT /api/patient/profile` - Update patient profile
- `GET /api/patient/appointments` - Get appointments
- `POST /api/patient/appointments` - Book appointment
- `GET /api/patient/prescriptions` - Get prescriptions
- `GET /api/patient/ehr` - Get EHR records
- `GET /api/patient/access-permissions` - Get access permissions
- `POST /api/patient/grant-access` - Grant access to data

### Doctor Routes
- `GET /api/doctor/profile` - Get doctor profile
- `GET /api/doctor/patients` - Get patients (with access)
- `GET /api/doctor/appointments` - Get appointments
- `PUT /api/doctor/appointments/:id/status` - Update appointment status
- `POST /api/doctor/prescriptions` - Create prescription
- `GET /api/doctor/doctors` - Get all doctors (public)
- `GET /api/doctor/departments` - Get departments

### Pharmacy Routes
- `GET /api/pharmacy/prescription/:tokenId` - Verify prescription
- `POST /api/pharmacy/prescription/:tokenId/fulfill` - Fulfill prescription
- `GET /api/pharmacy/inventory` - Get inventory
- `POST /api/pharmacy/inventory` - Add inventory item
- `POST /api/pharmacy/inventory/verify` - Verify inventory

### Lab Routes
- `POST /api/lab/results` - Upload lab result
- `GET /api/lab/results` - Get lab results

### Blockchain Routes
- `GET /api/blockchain/network` - Get network info
- `GET /api/blockchain/address/:address` - Get address balance
- `POST /api/blockchain/verify-contract` - Verify contract

## Authentication

All protected routes require wallet authentication via headers:

```
address: 0x...
signature: 0x...
message: Welcome to MedChain!...
```

The frontend should:
1. Request a nonce from `/api/auth/nonce`
2. Sign the message with the user's wallet
3. Include the signature in subsequent API calls

## Database Schema

The backend uses SQLite with the following main tables:
- `users` - Wallet addresses and roles
- `patient_profiles` - Patient information
- `doctor_profiles` - Doctor credentials
- `appointments` - Appointment bookings
- `prescriptions` - Prescription tokens
- `ehr_records` - Electronic health records (IPFS)
- `access_permissions` - Data access control
- `inventory` - Pharmacy inventory
- `lab_results` - Lab test results

## Smart Contracts

This backend is designed to work with smart contracts for:
- Prescription NFTs (ERC-721)
- Appointment escrow
- Supply chain tracking
- Doctor credential verification (Soulbound Tokens)

Smart contract deployment and interaction scripts should be added separately.

## Development

### Project Structure

```
backend/
├── database/
│   └── init.js          # Database initialization
├── middleware/
│   └── auth.js          # Authentication middleware
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── patient.js       # Patient routes
│   ├── doctor.js        # Doctor routes
│   ├── pharmacy.js      # Pharmacy routes
│   ├── lab.js           # Lab routes
│   └── blockchain.js    # Blockchain info routes
├── services/
│   ├── ipfs.js          # IPFS client
│   └── web3.js           # Web3 provider
├── server.js             # Express server
└── package.json
```

## Notes

- The backend currently uses SQLite for simplicity. For production, consider PostgreSQL or MongoDB.
- IPFS integration requires a running IPFS node or service.
- Smart contract interactions are stubbed - implement actual contract calls based on your deployed contracts.
- All sensitive operations should be verified on-chain via smart contracts.

