
const { ethers } = require('ethers');
const { RelayProvider } = require('@opengsn/provider');

// ABI of our Document Registry Contract (simplified)
const contractABI = [
  "function registerDocument(string memory documentHash, address owner) public returns (uint256)",
  "function grantAccess(uint256 documentId, address user) public",
  "function revokeAccess(uint256 documentId, address user) public",
  "function hasAccess(uint256 documentId, address user) public view returns (bool)",
  "function getDocumentOwner(uint256 documentId) public view returns (address)",
  "function getDocumentsByOwner(address owner) public view returns (uint256[] memory)",
];

class BlockchainService {
  constructor() {
    this.initializeProvider();
  }

  async initializeProvider() {
    try {
      // Standard provider
      this.provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_RPC_URL);
      
      // Initialize wallet with private key
      this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
      
      // Initialize contract instance
      this.contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        contractABI,
        this.wallet
      );

      // Initialize OpenGSN (for gasless transactions)
      await this.initializeGSN();
    } catch (error) {
      console.error('Blockchain service initialization error:', error);
    }
  }

  async initializeGSN() {
    try {
      // GSN Configuration
      const gsnConfig = {
        paymasterAddress: process.env.OPEN_GSN_PAYMASTER,
        loggerConfiguration: {
          logLevel: 'error'
        }
      };

      // Create a GSN provider
      const gsnProvider = await RelayProvider.newProvider({
        provider: this.provider,
        config: gsnConfig
      }).init();

      // Create an ethers provider using the GSN provider
      this.gsnProvider = new ethers.providers.Web3Provider(gsnProvider);
      
      // Connect the contract to the GSN provider
      this.gsnContract = this.contract.connect(this.gsnProvider.getSigner());
    } catch (error) {
      console.error('GSN initialization error:', error);
    }
  }

  async registerDocument(documentHash, ownerAddress) {
    try {
      const tx = await this.contract.registerDocument(documentHash, ownerAddress);
      return await tx.wait();
    } catch (error) {
      console.error('Document registration error:', error);
      throw error;
    }
  }

  async grantAccess(documentId, userAddress) {
    try {
      // Using GSN provider for gasless transactions
      const tx = await this.gsnContract.grantAccess(documentId, userAddress);
      return await tx.wait();
    } catch (error) {
      console.error('Grant access error:', error);
      throw error;
    }
  }

  async revokeAccess(documentId, userAddress) {
    try {
      const tx = await this.gsnContract.revokeAccess(documentId, userAddress);
      return await tx.wait();
    } catch (error) {
      console.error('Revoke access error:', error);
      throw error;
    }
  }

  async hasAccess(documentId, userAddress) {
    try {
      return await this.contract.hasAccess(documentId, userAddress);
    } catch (error) {
      console.error('Access check error:', error);
      throw error;
    }
  }

  async getDocumentsByOwner(ownerAddress) {
    try {
      return await this.contract.getDocumentsByOwner(ownerAddress);
    } catch (error) {
      console.error('Get documents error:', error);
      throw error;
    }
  }
}

module.exports = new BlockchainService();
