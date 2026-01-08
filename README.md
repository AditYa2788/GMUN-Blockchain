# MedChain: Decentralized Healthcare & Pharmacy Ecosystem

A Web 3.0-enabled healthcare platform that eliminates data silos, prevents counterfeit medication, and gives patients sovereign ownership of their medical data using Blockchain, Smart Contracts, and IPFS.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask browser extension
- IPFS (optional, for file storage)

### Installation

1. **Clone and install dependencies:**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   ```

2. **Configure environment:**
   ```bash
   # Backend
   cd backend
   cp env.example .env
   # Edit .env with your settings
   
   # Frontend (from root)
   cp .env.example .env
   # Edit .env if needed
   ```

3. **Start services:**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev
   
   # Terminal 2: Frontend
   npm run dev
   ```

4. **Connect wallet:**
   - Open http://localhost:5173
   - Click "Connect Wallet" in navbar
   - Sign the authentication message

## 📋 Features

### ✅ Implemented

- **Wallet Authentication** - MetaMask integration, no passwords needed
- **Patient Portal**
  - Profile management
  - Appointment booking
  - Prescription viewing
  - EHR access
- **Doctor Portal**
  - Doctor listing
  - Appointment management
  - Prescription creation
- **Backend API** - Complete REST API with wallet auth
- **Database** - SQLite with full schema
- **IPFS Integration** - Decentralized file storage

### 🚧 Coming Soon

- Smart Contracts (Prescription NFTs, Escrow, Supply Chain)
- Pharmacy Portal UI
- Lab Portal UI
- Full blockchain integration

## 🏗️ Architecture

```
Frontend (React) → Backend API (Express) → Database (SQLite)
                                      ↓
                                  IPFS (Storage)
                                      ↓
                              Blockchain (Smart Contracts)
```

## 📁 Project Structure

```
.
├── backend/              # Node.js/Express API
│   ├── database/        # Database schema & init
│   ├── routes/          # API endpoints
│   ├── services/        # IPFS, Web3 services
│   └── middleware/      # Auth middleware
├── src/                 # React frontend
│   ├── components/      # UI components
│   ├── services/        # API client, wallet utils
│   └── hooks/           # React hooks
└── SETUP.md            # Detailed setup guide
```

## 🔌 API Endpoints

- `GET /api/auth/nonce` - Get nonce for wallet signing
- `POST /api/auth/verify` - Verify wallet signature
- `GET /api/patient/appointments` - Get appointments
- `POST /api/patient/appointments` - Book appointment
- `GET /api/doctor/doctors` - List doctors
- `POST /api/doctor/prescriptions` - Create prescription
- And more... (see `backend/README.md`)

## 🔐 Authentication

All protected routes use wallet signature authentication:
1. Request nonce from backend
2. Sign message with MetaMask
3. Include signature in API headers

## 📚 Documentation

- [SETUP.md](SETUP.md) - Detailed setup instructions
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Project overview
- [backend/README.md](backend/README.md) - Backend API documentation

## 🛠️ Tech Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS
- Ethers.js
- Lucide Icons

**Backend:**
- Node.js
- Express
- SQLite
- IPFS
- Ethers.js

**Blockchain:**
- Polygon/Ethereum
- Solidity (to be implemented)
- Smart Contracts (to be implemented)

## 🎯 Core Modules

1. **Patient Portal** - Book appointments, view prescriptions, manage EHR
2. **Doctor Portal** - Manage patients, create prescriptions, verify credentials
3. **Pharmacy** - Verify prescriptions, track inventory, prevent counterfeits
4. **Laboratory** - Upload results, mint NFT reports

## 🔄 Data Flow

### Prescription Lifecycle
1. Doctor creates prescription → Backend → IPFS
2. Smart contract mints Prescription NFT
3. NFT transferred to patient wallet
4. Patient presents at pharmacy
5. Pharmacy verifies on-chain
6. Token burned after fulfillment

## 📝 Environment Variables

### Backend (.env)
```env
PORT=3001
RPC_URL=https://polygon-rpc.com
IPFS_API_URL=/ip4/127.0.0.1/tcp/5001
JWT_SECRET=your_secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

## 🧪 Testing

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Connect MetaMask wallet
4. Test booking appointments, viewing prescriptions, etc.

## 🚀 Deployment

1. Build frontend: `npm run build`
2. Set production environment variables
3. Deploy backend to server
4. Deploy smart contracts to blockchain
5. Configure IPFS service (Pinata/Infura)

## 🤝 Contributing

This is a workshop project. For production use:
- Add comprehensive error handling
- Implement rate limiting
- Add input validation
- Write tests
- Deploy smart contracts
- Set up monitoring

## 📄 License

Workshop project - GMUN

## 🔗 Links

- [Setup Guide](SETUP.md)
- [Project Summary](PROJECT_SUMMARY.md)
- [Backend API Docs](backend/README.md)

---

**Note**: Smart contracts are not yet deployed. The backend is ready for contract integration. See `backend/contracts/README.md` for contract requirements.
