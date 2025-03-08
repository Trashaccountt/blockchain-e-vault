
// This is a simplified version for the first iteration
// In a real implementation this would connect to a smart contract

export interface Document {
  id: string;
  name: string;
  description: string;
  fileHash: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  owner: string;
  sharedWith: string[];
  contractAddress?: string;
  transactionHash?: string;
  blockNumber?: number;
}

// Mock blockchain connection
export const connectWallet = async (): Promise<string> => {
  // In a real implementation, this would use ethers.js to connect to MetaMask or other wallets
  console.log('Connecting wallet...');
  
  // Simulate wallet connection delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a mock wallet address
  return '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
};

// Mock document upload to blockchain
export const uploadDocumentToBlockchain = async (document: Omit<Document, 'id' | 'uploadDate' | 'contractAddress' | 'transactionHash' | 'blockNumber'>): Promise<Document> => {
  console.log('Uploading document to blockchain...', document);
  
  // Simulate blockchain transaction delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Create a mock document with blockchain details
  const newDocument: Document = {
    ...document,
    id: Math.random().toString(36).substr(2, 9),
    uploadDate: new Date(),
    sharedWith: document.sharedWith || [],
    contractAddress: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
    transactionHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
    blockNumber: Math.floor(Math.random() * 10000000),
  };
  
  return newDocument;
};

// Mock function to get documents from blockchain
export const getDocumentsFromBlockchain = async (ownerAddress: string): Promise<Document[]> => {
  console.log('Fetching documents for owner:', ownerAddress);
  
  // Simulate blockchain data fetch delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate 5 mock documents
  const mockDocuments: Document[] = Array(5).fill(0).map((_, index) => ({
    id: Math.random().toString(36).substr(2, 9),
    name: `Document ${index + 1}`,
    description: `This is a sample document ${index + 1} description`,
    fileHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
    fileType: ['pdf', 'docx', 'jpg', 'png', 'txt'][Math.floor(Math.random() * 5)],
    fileSize: Math.floor(Math.random() * 10000000),
    uploadDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
    owner: ownerAddress,
    sharedWith: [],
    contractAddress: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
    transactionHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
    blockNumber: Math.floor(Math.random() * 10000000),
  }));
  
  return mockDocuments;
};

// Mock function to share document
export const shareDocument = async (documentId: string, recipientAddress: string): Promise<boolean> => {
  console.log(`Sharing document ${documentId} with ${recipientAddress}`);
  
  // Simulate blockchain transaction delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Always return success in this mock
  return true;
};

// Mock function to revoke access
export const revokeAccess = async (documentId: string, recipientAddress: string): Promise<boolean> => {
  console.log(`Revoking access to document ${documentId} from ${recipientAddress}`);
  
  // Simulate blockchain transaction delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Always return success in this mock
  return true;
};

// Mock function to verify document on blockchain
export const verifyDocument = async (fileHash: string): Promise<boolean> => {
  console.log(`Verifying document with hash ${fileHash}`);
  
  // Simulate blockchain verification delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Always return success in this mock
  return true;
};

// Helper function to format wallet address for display
export const formatAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
