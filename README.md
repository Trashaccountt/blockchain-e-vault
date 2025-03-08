
# Blockchain Document Sharing System

This project enables secure document sharing using blockchain, IPFS, and MongoDB with a focus on security.

## Features

- **Blockchain-Based Document Ownership & Sharing**
  - Store document metadata and ownership on Ethereum (Sepolia testnet)
  - Grant, track and revoke document access via smart contracts
  - Document authenticity verification

- **End-to-End Encrypted Document Storage**
  - AES-256 encryption for all documents
  - IPFS decentralized storage
  - Secure key management

- **Comprehensive Security**
  - JWT-based authentication
  - Role-based access control (User/Admin)
  - Access expiration & revocation
  - Activity logging for security auditing

- **Gasless Transactions via OpenGSN**
  - Fee-free document sharing on blockchain
  - Transparent to end users

## Setup & Running

### Environment Variables

Create a `.env` file in your root directory with the following values:

```
# Blockchain Configuration
PRIVATE_KEY=your_private_key
INFURA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
CONTRACT_ADDRESS=your_deployed_contract_address
OPEN_GSN_PAYMASTER=your_paymaster_address

# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# IPFS (Infura) Configuration
VITE_INFURA_IPFS_PROJECT_ID=your_ipfs_project_id
VITE_INFURA_IPFS_PROJECT_SECRET=your_ipfs_project_secret
VITE_INFURA_IPFS_ENDPOINT=https://ipfs.infura.io:5001

# JWT Secret (Authentication)
JWT_SECRET=your_jwt_secret
```

### Running the Backend

```bash
# Install dependencies
npm install

# Start the Express server (typically runs on port 5000)
node src/server/index.js

# In a separate terminal, start the frontend
npm run dev
```

### API Endpoints

**Authentication**
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

**Documents**
- `POST /api/documents/upload` - Upload a document
- `GET /api/documents` - Get all documents for current user
- `GET /api/documents/:id` - Get specific document
- `GET /api/documents/:id/download` - Download document
- `POST /api/documents/:id/share` - Share document with another user
- `POST /api/documents/:id/revoke` - Revoke access
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/:id/logs` - Get activity logs for document

## Smart Contract Architecture

The system interacts with a document registry smart contract deployed on the Ethereum Sepolia testnet. The contract maintains:

- Document ownership records
- Access control permissions
- Document metadata hashes

## Security Considerations

- All documents are encrypted before being stored on IPFS
- Encryption keys are stored securely in MongoDB
- JWT tokens are used for authentication
- Role-based permissions protect sensitive operations
