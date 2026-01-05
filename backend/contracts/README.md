# Smart Contracts

This directory should contain Solidity smart contracts for MedChain.

## Required Contracts

### 1. PrescriptionNFT.sol
ERC-721 token for prescriptions
- Mint prescription tokens
- Transfer to patients
- Burn on redemption
- Store metadata on IPFS

### 2. AppointmentEscrow.sol
Handle appointment payments
- Accept deposits from patients
- Release payment after consultation
- Refund on cancellation
- Prevent no-shows

### 3. SupplyChain.sol
Track medicine batches
- Register batches from manufacturers
- Verify authenticity via QR codes
- Update inventory on-chain
- Prevent counterfeits

### 4. DoctorCredential.sol
Soulbound Token (SBT) for doctor verification
- Non-transferable identity tokens
- Minted by DAO/authority
- Verify doctor credentials
- Revoke if needed

## Contract Structure

```
contracts/
├── PrescriptionNFT.sol
├── AppointmentEscrow.sol
├── SupplyChain.sol
├── DoctorCredential.sol
└── interfaces/
    ├── IPrescriptionNFT.sol
    └── IAppointmentEscrow.sol
```

## Deployment

1. Compile contracts
2. Deploy to Polygon/Ethereum
3. Update contract addresses in backend .env
4. Update frontend with contract ABIs

## Integration

Backend services are ready to interact with contracts:
- `services/web3.js` - Provider and signer setup
- Routes can be extended to call contract methods

See backend README for integration examples.

