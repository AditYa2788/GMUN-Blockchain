# MedChain Setup Guide

Complete setup instructions for the MedChain decentralized healthcare platform.

## Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension (for wallet connection)
- IPFS node (optional, for file storage)

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env and configure:
# - RPC_URL (Polygon/Ethereum RPC endpoint)
# - IPFS_API_URL (if using local IPFS)
# - JWT_SECRET (random secret key)

# Start the server
npm run dev
```

The backend will run on `http://localhost:3001`

### 2. Frontend Setup

```bash
# From project root
npm install

# Copy environment file
cp .env.example .env

# Edit .env if backend is on different port
# VITE_API_URL=http://localhost:3001/api

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 3. IPFS Setup (Optional but Recommended)

For prescription and EHR storage:

```bash
# Install IPFS
# macOS: brew install ipfs
# Linux: https://docs.ipfs.io/install/command-line/

# Initialize IPFS
ipfs init

# Start IPFS daemon
ipfs daemon
```

Or use a service like [Pinata](https://pinata.cloud) or [Infura IPFS](https://infura.io).

## Configuration

### Backend Environment Variables

```env
PORT=3001
NODE_ENV=development
RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_private_key_here
IPFS_API_URL=/ip4/127.0.0.1/tcp/5001
IPFS_GATEWAY=https://ipfs.io/ipfs/
JWT_SECRET=your_jwt_secret_key_here
DB_PATH=./data/medchain.db
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:3001/api
```

## Features

### ✅ Implemented

- **Wallet Authentication**: Connect with MetaMask
- **Patient Portal**: 
  - Profile management
  - Appointment booking
  - Prescription viewing
  - EHR access
- **Doctor Portal**: 
  - Doctor listing
  - Appointment management
  - Prescription creation
- **Backend API**: Complete REST API
- **Database**: SQLite with full schema
- **IPFS Integration**: For decentralized storage

### 🚧 To Be Implemented

- **Smart Contracts**: 
  - Prescription NFT minting
  - Appointment escrow
  - Supply chain tracking
  - Doctor credential verification (Soulbound Tokens)
- **Pharmacy Portal**: Full implementation
- **Lab Portal**: Full implementation
- **Blockchain Integration**: Actual contract calls

## Project Structure

```
.
├── backend/
│   ├── database/          # Database initialization
│   ├── middleware/        # Auth middleware
│   ├── routes/            # API routes
│   ├── services/          # IPFS, Web3 services
│   └── server.js         # Express server
├── src/
│   ├── components/        # React components
│   ├── services/          # API client, wallet utils
│   └── hooks/             # React hooks
└── package.json
```

## API Endpoints

### Authentication
- `GET /api/auth/nonce` - Get nonce for signing
- `POST /api/auth/verify` - Verify signature
- `GET /api/auth/me` - Get current user

### Patient
- `GET /api/patient/profile` - Get profile
- `PUT /api/patient/profile` - Update profile
- `GET /api/patient/appointments` - Get appointments
- `POST /api/patient/appointments` - Book appointment
- `GET /api/patient/prescriptions` - Get prescriptions
- `GET /api/patient/ehr` - Get EHR records

### Doctor
- `GET /api/doctor/doctors` - List doctors
- `GET /api/doctor/departments` - List departments
- `POST /api/doctor/prescriptions` - Create prescription
- `GET /api/doctor/appointments` - Get appointments

See `backend/README.md` for complete API documentation.

## Wallet Connection

1. Install MetaMask browser extension
2. Click "Connect Wallet" in the navbar
3. Sign the authentication message
4. You're now authenticated!

## Database

The backend uses SQLite by default. The database is automatically initialized on first run with:
- User accounts
- Sample doctors
- Full schema for all modules

Database file: `backend/data/medchain.db`

## Development

### Backend
```bash
cd backend
npm run dev  # Auto-reload on changes
```

### Frontend
```bash
npm run dev  # Vite dev server with HMR
```

## Production Deployment

1. Build frontend: `npm run build`
2. Set production environment variables
3. Use process manager (PM2) for backend
4. Configure reverse proxy (nginx)
5. Set up IPFS service (Pinata/Infura)
6. Deploy smart contracts to blockchain

## Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify .env file exists and is configured
- Check database directory permissions

### Wallet connection fails
- Ensure MetaMask is installed
- Check if you're on the correct network
- Try refreshing the page

### IPFS errors
- Ensure IPFS daemon is running (if using local)
- Or configure IPFS service in .env
- Some features work without IPFS (with warnings)

### API connection errors
- Verify backend is running
- Check CORS settings
- Verify VITE_API_URL in frontend .env

## Next Steps

1. **Deploy Smart Contracts**: 
   - Prescription NFT contract
   - Appointment escrow contract
   - Supply chain tracking contract

2. **Add More Features**:
   - Pharmacy portal UI
   - Lab portal UI
   - Real-time notifications

3. **Security**:
   - Add rate limiting
   - Implement proper encryption
   - Add input validation

4. **Testing**:
   - Unit tests
   - Integration tests
   - E2E tests

## Support

For issues or questions, refer to the project documentation or create an issue.

