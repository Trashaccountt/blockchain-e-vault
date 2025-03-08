
const express = require('express');
const multer = require('multer');
const { auth, adminAuth } = require('../middleware/auth');
const Document = require('../models/Document');
const ActivityLog = require('../models/ActivityLog');
const ipfsService = require('../services/ipfsService');
const blockchainService = require('../services/blockchainService');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Log activity function
const logActivity = async (userId, documentId, action, req, details = {}) => {
  try {
    await ActivityLog.create({
      user: userId,
      document: documentId,
      action,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details
    });
  } catch (error) {
    console.error('Activity logging error:', error);
  }
};

// Upload document
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, isPublic } = req.body;
    
    // Generate encryption key
    const encryptionKey = ipfsService.generateEncryptionKey();
    
    // Upload to IPFS
    const ipfsHash = await ipfsService.uploadFile(req.file.buffer, encryptionKey);
    
    // Register on blockchain
    const tx = await blockchainService.registerDocument(ipfsHash, req.user.walletAddress || process.env.CONTRACT_ADDRESS);
    
    // Create document in MongoDB
    const document = new Document({
      title,
      description,
      ipfsHash,
      encryptionKey,
      owner: req.user._id,
      transactionHash: tx.transactionHash,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      isPublic: isPublic === 'true'
    });
    
    await document.save();
    
    // Log activity
    await logActivity(req.user._id, document._id, 'upload', req);
    
    res.status(201).json({
      document: {
        id: document._id,
        title: document.title,
        description: document.description,
        ipfsHash: document.ipfsHash,
        createdAt: document.createdAt,
        fileType: document.fileType,
        fileSize: document.fileSize,
        isPublic: document.isPublic,
        transactionHash: document.transactionHash
      }
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all documents for current user
router.get('/', auth, async (req, res) => {
  try {
    // Find user's documents
    const ownedDocuments = await Document.find({ owner: req.user._id })
      .select('-encryptionKey')
      .sort({ createdAt: -1 });
    
    // Find documents shared with user
    const sharedDocuments = await Document.find({
      'accessList.user': req.user._id,
      'accessList.expiresAt': { $gt: new Date() }
    })
    .select('-encryptionKey')
    .sort({ 'accessList.grantedAt': -1 });
    
    // Find public documents
    const publicDocuments = await Document.find({
      isPublic: true,
      owner: { $ne: req.user._id }
    })
    .select('-encryptionKey')
    .sort({ createdAt: -1 })
    .limit(10);
    
    res.json({
      ownedDocuments,
      sharedDocuments,
      publicDocuments
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific document by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('accessList.user', 'username email');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user has access
    const isOwner = document.owner._id.toString() === req.user._id.toString();
    const hasAccess = isOwner || 
                      document.isPublic || 
                      document.accessList.some(access => 
                        access.user._id.toString() === req.user._id.toString() && 
                        access.expiresAt > new Date()
                      );
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Log view activity
    await logActivity(req.user._id, document._id, 'view', req);
    
    // Remove encryption key if not owner
    const documentData = document.toObject();
    if (!isOwner) {
      delete documentData.encryptionKey;
    }
    
    res.json({ document: documentData });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download document
router.get('/:id/download', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user has access
    const isOwner = document.owner.toString() === req.user._id.toString();
    const hasAccess = isOwner || 
                      document.isPublic || 
                      document.accessList.some(access => 
                        access.user.toString() === req.user._id.toString() && 
                        access.expiresAt > new Date()
                      );
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get file from IPFS and decrypt
    const fileBuffer = await ipfsService.getFile(document.ipfsHash, document.encryptionKey);
    
    // Log download activity
    await logActivity(req.user._id, document._id, 'download', req);
    
    // Set response headers
    res.setHeader('Content-Type', document.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${document.title}"`);
    
    // Send file
    res.send(fileBuffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share document with another user
router.post('/:id/share', auth, async (req, res) => {
  try {
    const { userId, expiresIn } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user is the owner
    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can share this document' });
    }
    
    // Calculate expiration date (default: 7 days)
    const days = parseInt(expiresIn, 10) || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    
    // Check if already shared with this user
    const existingAccess = document.accessList.find(
      access => access.user.toString() === userId
    );
    
    if (existingAccess) {
      // Update existing access
      existingAccess.expiresAt = expiresAt;
      existingAccess.grantedAt = new Date();
    } else {
      // Add new access
      document.accessList.push({
        user: userId,
        expiresAt,
        grantedAt: new Date()
      });
      
      // Register on blockchain
      // First, get the shared user's wallet address
      const sharedUser = await User.findById(userId);
      if (sharedUser && sharedUser.walletAddress) {
        try {
          await blockchainService.grantAccess(
            document.transactionHash,
            sharedUser.walletAddress
          );
        } catch (error) {
          console.error('Blockchain grant access error:', error);
          // Continue even if blockchain fails
        }
      }
    }
    
    await document.save();
    
    // Log share activity
    await logActivity(req.user._id, document._id, 'share', req, { 
      sharedWith: userId, 
      expiresAt 
    });
    
    res.json({ 
      message: 'Document shared successfully',
      accessList: document.accessList
    });
  } catch (error) {
    console.error('Share document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Revoke access
router.post('/:id/revoke', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user is the owner
    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can revoke access' });
    }
    
    // Remove access
    document.accessList = document.accessList.filter(
      access => access.user.toString() !== userId
    );
    
    await document.save();
    
    // Revoke on blockchain
    const sharedUser = await User.findById(userId);
    if (sharedUser && sharedUser.walletAddress) {
      try {
        await blockchainService.revokeAccess(
          document.transactionHash,
          sharedUser.walletAddress
        );
      } catch (error) {
        console.error('Blockchain revoke access error:', error);
        // Continue even if blockchain fails
      }
    }
    
    // Log revoke activity
    await logActivity(req.user._id, document._id, 'revoke', req, { 
      revokedFrom: userId 
    });
    
    res.json({ 
      message: 'Access revoked successfully',
      accessList: document.accessList
    });
  } catch (error) {
    console.error('Revoke access error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete document (admin or owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user is the owner or an admin
    const isOwner = document.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only the owner or an admin can delete this document' });
    }
    
    await Document.deleteOne({ _id: document._id });
    
    // Log delete activity
    await logActivity(req.user._id, document._id, 'delete', req);
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get activity logs for a document (owner or admin only)
router.get('/:id/logs', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user is the owner or an admin
    const isOwner = document.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only the owner or an admin can view activity logs' });
    }
    
    const logs = await ActivityLog.find({ document: document._id })
      .populate('user', 'username email')
      .sort({ timestamp: -1 });
    
    res.json({ logs });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
