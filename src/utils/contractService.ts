
import { ethers } from "ethers";
import DocumentRegistryABI from "../contracts/DocumentRegistry.json";
import { toast } from "@/hooks/use-toast";

// OpenGSN configurations
import { RelayProvider } from "@opengsn/provider";

// Contract address from .env or fallback to a placeholder for frontend
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

// Initialize contract instance
let provider: ethers.providers.Web3Provider | null = null;
let contract: ethers.Contract | null = null;
let signer: ethers.Signer | null = null;

// OpenGSN Configuration
const gsnConfig = {
  relayHubAddress: import.meta.env.VITE_RELAY_HUB_ADDRESS,
  paymasterAddress: import.meta.env.VITE_OPEN_GSN_PAYMASTER,
  forwarderAddress: import.meta.env.VITE_FORWARDER_ADDRESS,
  loggerConfiguration: { logLevel: "error" }
};

/**
 * Initialize the contract with a provider
 */
export const initializeContract = async (): Promise<boolean> => {
  try {
    // Check if MetaMask is installed
    if (window.ethereum) {
      // Connect to the Ethereum network with OpenGSN RelayProvider for gasless transactions
      const gsnProvider = await RelayProvider.newProvider({ 
        provider: window.ethereum, 
        config: gsnConfig 
      }).init();
      
      // Wrap with ethers
      provider = new ethers.providers.Web3Provider(gsnProvider);
      
      // Get signer from provider
      signer = provider.getSigner();
      
      // Create contract instance
      contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        DocumentRegistryABI.abi,
        signer
      );
      
      // Get network to ensure we're connected to the right chain (Sepolia)
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111) { // Sepolia chainId
        toast({
          variant: "destructive",
          title: "Wrong network",
          description: "Please connect to Ethereum Sepolia testnet."
        });
        return false;
      }
      
      toast({
        title: "Blockchain connected",
        description: "Successfully connected to the document registry smart contract."
      });
      
      return true;
    } else {
      toast({
        variant: "destructive",
        title: "MetaMask not installed",
        description: "Please install MetaMask to use this application."
      });
      return false;
    }
  } catch (error) {
    console.error("Contract initialization error:", error);
    toast({
      variant: "destructive",
      title: "Contract initialization failed",
      description: "Failed to connect to the blockchain. Please check your connection."
    });
    return false;
  }
};

/**
 * Generate a unique document ID from file metadata
 */
export const generateDocumentId = (
  fileHash: string,
  ownerAddress: string,
  timestamp: number
): string => {
  const combinedString = `${fileHash}:${ownerAddress}:${timestamp}`;
  return ethers.utils.id(combinedString); // keccak256 hash
};

/**
 * Upload document metadata to the blockchain
 */
export const uploadDocumentToBlockchain = async (
  documentId: string,
  ipfsCid: string,
  encryptedKey: string,
  metadataHash: string
): Promise<boolean> => {
  try {
    if (!contract || !signer) {
      await initializeContract();
      if (!contract || !signer) {
        throw new Error("Contract not initialized");
      }
    }
    
    // Convert string documentId to bytes32
    const documentIdBytes = ethers.utils.id(documentId);
    
    // Upload document to blockchain
    const tx = await contract.uploadDocument(
      documentIdBytes,
      ipfsCid,
      encryptedKey,
      metadataHash
    );
    
    // Wait for transaction to be mined
    await tx.wait();
    
    toast({
      title: "Document registered",
      description: "Document successfully registered on the blockchain."
    });
    
    return true;
  } catch (error) {
    console.error("Upload to blockchain error:", error);
    toast({
      variant: "destructive",
      title: "Blockchain registration failed",
      description: "Failed to register document on the blockchain."
    });
    return false;
  }
};

/**
 * Grant access to a document
 */
export const grantDocumentAccess = async (
  documentId: string,
  userAddress: string,
  expiresInDays: number = 0
): Promise<boolean> => {
  try {
    if (!contract || !signer) {
      await initializeContract();
      if (!contract || !signer) {
        throw new Error("Contract not initialized");
      }
    }
    
    // Convert string documentId to bytes32
    const documentIdBytes = ethers.utils.id(documentId);
    
    // Calculate expiration timestamp (0 means no expiration)
    const expiresAt = expiresInDays > 0 
      ? Math.floor(Date.now() / 1000) + (expiresInDays * 24 * 60 * 60)
      : 0;
    
    // Grant access
    const tx = await contract.grantAccess(
      documentIdBytes,
      userAddress,
      expiresAt
    );
    
    // Wait for transaction to be mined
    await tx.wait();
    
    toast({
      title: "Access granted",
      description: `Access granted to ${userAddress.substring(0, 6)}...${userAddress.substring(38)}`
    });
    
    return true;
  } catch (error) {
    console.error("Grant access error:", error);
    toast({
      variant: "destructive",
      title: "Grant access failed",
      description: "Failed to grant access to the document."
    });
    return false;
  }
};

/**
 * Revoke access to a document
 */
export const revokeDocumentAccess = async (
  documentId: string,
  userAddress: string
): Promise<boolean> => {
  try {
    if (!contract || !signer) {
      await initializeContract();
      if (!contract || !signer) {
        throw new Error("Contract not initialized");
      }
    }
    
    // Convert string documentId to bytes32
    const documentIdBytes = ethers.utils.id(documentId);
    
    // Revoke access
    const tx = await contract.revokeAccess(
      documentIdBytes,
      userAddress
    );
    
    // Wait for transaction to be mined
    await tx.wait();
    
    toast({
      title: "Access revoked",
      description: `Access revoked from ${userAddress.substring(0, 6)}...${userAddress.substring(38)}`
    });
    
    return true;
  } catch (error) {
    console.error("Revoke access error:", error);
    toast({
      variant: "destructive",
      title: "Revoke access failed",
      description: "Failed to revoke access to the document."
    });
    return false;
  }
};

/**
 * Check if a user has access to a document
 */
export const checkDocumentAccess = async (
  documentId: string,
  userAddress: string
): Promise<boolean> => {
  try {
    if (!contract || !signer) {
      await initializeContract();
      if (!contract || !signer) {
        throw new Error("Contract not initialized");
      }
    }
    
    // Convert string documentId to bytes32
    const documentIdBytes = ethers.utils.id(documentId);
    
    // Check access
    return await contract.hasAccess(documentIdBytes, userAddress);
  } catch (error) {
    console.error("Check access error:", error);
    return false;
  }
};

/**
 * Get document metadata from the blockchain
 */
export const getDocumentMetadata = async (
  documentId: string
): Promise<any> => {
  try {
    if (!contract || !signer) {
      await initializeContract();
      if (!contract || !signer) {
        throw new Error("Contract not initialized");
      }
    }
    
    // Convert string documentId to bytes32
    const documentIdBytes = ethers.utils.id(documentId);
    
    // Get document metadata
    const metadata = await contract.getDocumentMetadata(documentIdBytes);
    
    return {
      ipfsCid: metadata.ipfsCid,
      owner: metadata.owner,
      uploadedAt: new Date(metadata.uploadedAt.toNumber() * 1000),
      metadataHash: metadata.metadataHash,
      exists: metadata.exists
    };
  } catch (error) {
    console.error("Get metadata error:", error);
    return null;
  }
};

/**
 * Get document encryption key from the blockchain
 */
export const getDocumentEncryptionKey = async (
  documentId: string
): Promise<string | null> => {
  try {
    if (!contract || !signer) {
      await initializeContract();
      if (!contract || !signer) {
        throw new Error("Contract not initialized");
      }
    }
    
    // Convert string documentId to bytes32
    const documentIdBytes = ethers.utils.id(documentId);
    
    // Get document encryption key
    return await contract.getDocumentEncryptionKey(documentIdBytes);
  } catch (error) {
    console.error("Get encryption key error:", error);
    return null;
  }
};

/**
 * Get list of document IDs a user has access to
 */
export const getUserDocuments = async (
  userAddress: string
): Promise<string[]> => {
  try {
    if (!contract || !signer) {
      await initializeContract();
      if (!contract || !signer) {
        throw new Error("Contract not initialized");
      }
    }
    
    // Get user documents
    const documentIds = await contract.getUserDocuments(userAddress);
    
    // Convert bytes32 to strings
    return documentIds.map((id: any) => ethers.utils.parseBytes32String(id));
  } catch (error) {
    console.error("Get user documents error:", error);
    return [];
  }
};

/**
 * Get the wallet address of the connected user
 */
export const getConnectedWalletAddress = async (): Promise<string | null> => {
  try {
    if (!provider) {
      await initializeContract();
      if (!provider) {
        throw new Error("Provider not initialized");
      }
    }
    
    const accounts = await provider.listAccounts();
    return accounts[0] || null;
  } catch (error) {
    console.error("Get wallet address error:", error);
    return null;
  }
};

/**
 * Connect wallet to the application
 */
export const connectWallet = async (): Promise<string | null> => {
  try {
    if (!provider) {
      await initializeContract();
      if (!provider) {
        throw new Error("Provider not initialized");
      }
    }
    
    // Request accounts access
    await provider.send("eth_requestAccounts", []);
    
    // Get the connected wallet address
    return await getConnectedWalletAddress();
  } catch (error) {
    console.error("Connect wallet error:", error);
    toast({
      variant: "destructive",
      title: "Wallet connection failed",
      description: "Failed to connect to your wallet."
    });
    return null;
  }
};
