
const { create } = require('ipfs-http-client');
const crypto = require('crypto-js');

class IPFSService {
  constructor() {
    this.ipfs = create({
      host: new URL(process.env.VITE_INFURA_IPFS_ENDPOINT).hostname,
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: 'Basic ' + Buffer.from(
          process.env.VITE_INFURA_IPFS_PROJECT_ID + ':' + process.env.VITE_INFURA_IPFS_PROJECT_SECRET
        ).toString('base64')
      }
    });
  }

  // Encrypt file data using AES-256
  encryptData(data, secretKey) {
    return crypto.AES.encrypt(data, secretKey).toString();
  }

  // Decrypt file data
  decryptData(encryptedData, secretKey) {
    const bytes = crypto.AES.decrypt(encryptedData, secretKey);
    return bytes.toString(crypto.enc.Utf8);
  }

  // Generate a random encryption key
  generateEncryptionKey() {
    return crypto.lib.WordArray.random(32).toString();
  }

  // Upload encrypted file to IPFS
  async uploadFile(fileBuffer, encryptionKey) {
    try {
      // Convert Buffer to string for encryption
      const fileString = fileBuffer.toString('base64');
      
      // Encrypt the file
      const encryptedData = this.encryptData(fileString, encryptionKey);
      
      // Upload to IPFS
      const { cid } = await this.ipfs.add(Buffer.from(encryptedData));
      
      return cid.toString();
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw error;
    }
  }

  // Get file from IPFS and decrypt
  async getFile(ipfsHash, encryptionKey) {
    try {
      // Fetch from IPFS
      const chunks = [];
      for await (const chunk of this.ipfs.cat(ipfsHash)) {
        chunks.push(chunk);
      }
      
      // Combine chunks
      const encryptedData = Buffer.concat(chunks).toString();
      
      // Decrypt the data
      const decryptedData = this.decryptData(encryptedData, encryptionKey);
      
      // Convert back to Buffer
      return Buffer.from(decryptedData, 'base64');
    } catch (error) {
      console.error('IPFS download error:', error);
      throw error;
    }
  }
}

module.exports = new IPFSService();
