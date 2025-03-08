// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@opengsn/contracts/src/BaseRelayRecipient.sol";

/**
 * @title DocumentRegistry
 * @dev A secure smart contract for decentralized document storage and sharing
 * @author Blockchain Document Sharing System
 * @notice This contract integrates with IPFS for document storage and provides advanced access control
 */
contract DocumentRegistry is AccessControl, ReentrancyGuard, BaseRelayRecipient {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Document metadata structure
    struct Document {
        string ipfsCid;           // IPFS Content Identifier
        string encryptionKey;     // Encrypted symmetric key (AES-256) for the document
        address owner;            // Document owner
        uint256 uploadedAt;       // Timestamp when document was uploaded
        string metadataHash;      // Hash of additional metadata (stored off-chain)
        bool exists;              // Flag to check if document exists
    }
    
    // Access permission structure
    struct Permission {
        bool hasAccess;           // Whether the user has access
        uint256 expiresAt;        // When access expires (0 for no expiration)
    }
    
    // Document ID to Document mapping
    mapping(bytes32 => Document) private documents;
    
    // Document ID to user address to Permission mapping
    mapping(bytes32 => mapping(address => Permission)) private documentPermissions;
    
    // User address to array of document IDs they have access to
    mapping(address => bytes32[]) private userDocuments;
    
    // Counter for total documents in the system
    uint256 private totalDocuments;
    
    // Events
    event DocumentUploaded(bytes32 indexed documentId, address indexed owner, string ipfsCid, uint256 timestamp);
    event DocumentAccessGranted(bytes32 indexed documentId, address indexed owner, address indexed grantedTo, uint256 expiresAt);
    event DocumentAccessRevoked(bytes32 indexed documentId, address indexed owner, address indexed revokedFrom);
    event DocumentDeleted(bytes32 indexed documentId, address indexed owner);
    
    /**
     * @dev Constructor for the DocumentRegistry contract
     * @param _trustedForwarder address of the OpenGSN trusted forwarder
     * @param _admin address that will be granted admin role
     */
    constructor(address _trustedForwarder, address _admin) {
        _setTrustedForwarder(_trustedForwarder);
        
        _setupRole(DEFAULT_ADMIN_ROLE, _admin);
        _setupRole(ADMIN_ROLE, _admin);
        
        totalDocuments = 0;
    }
    
    /**
     * @dev Returns the version of the contract for OpenGSN
     * @return string representing the version of the contract
     */
    function versionRecipient() external pure override returns (string memory) {
        return "1.0.0";
    }
    
    /**
     * @dev Get the actual message sender, taking into account OpenGSN meta-tx
     * @return address of the actual sender
     */
    function _msgSender() internal view override(Context, BaseRelayRecipient) returns (address) {
        return BaseRelayRecipient._msgSender();
    }
    
    /**
     * @dev Get the actual message data, taking into account OpenGSN meta-tx
     * @return bytes of the actual message data
     */
    function _msgData() internal view override(Context, BaseRelayRecipient) returns (bytes calldata) {
        return BaseRelayRecipient._msgData();
    }
    
    /**
     * @dev Upload a new document to the registry
     * @param _documentId unique identifier for the document
     * @param _ipfsCid IPFS Content Identifier of the encrypted document
     * @param _encryptionKey encrypted symmetric key for the document
     * @param _metadataHash hash of additional metadata about the document
     */
    function uploadDocument(
        bytes32 _documentId,
        string calldata _ipfsCid,
        string calldata _encryptionKey,
        string calldata _metadataHash
    ) external nonReentrant {
        require(!documents[_documentId].exists, "Document already exists");
        
        // Create the document
        documents[_documentId] = Document({
            ipfsCid: _ipfsCid,
            encryptionKey: _encryptionKey,
            owner: _msgSender(),
            uploadedAt: block.timestamp,
            metadataHash: _metadataHash,
            exists: true
        });
        
        // Grant access to the owner
        documentPermissions[_documentId][_msgSender()] = Permission({
            hasAccess: true,
            expiresAt: 0  // Never expires for owner
        });
        
        // Add document to owner's list
        userDocuments[_msgSender()].push(_documentId);
        
        // Increment total documents
        totalDocuments++;
        
        // Emit event
        emit DocumentUploaded(_documentId, _msgSender(), _ipfsCid, block.timestamp);
    }
    
    /**
     * @dev Grant access to a document to another user
     * @param _documentId unique identifier for the document
     * @param _user address of the user to grant access to
     * @param _expiresAt timestamp when access expires (0 for no expiration)
     */
    function grantAccess(
        bytes32 _documentId,
        address _user,
        uint256 _expiresAt
    ) external nonReentrant {
        require(documents[_documentId].exists, "Document does not exist");
        require(_user != address(0), "Invalid user address");
        require(_msgSender() == documents[_documentId].owner || hasRole(ADMIN_ROLE, _msgSender()), "Not authorized");
        
        // Grant access
        documentPermissions[_documentId][_user] = Permission({
            hasAccess: true,
            expiresAt: _expiresAt
        });
        
        // Add document to user's list if not already there
        bool userHasDocument = false;
        for (uint256 i = 0; i < userDocuments[_user].length; i++) {
            if (userDocuments[_user][i] == _documentId) {
                userHasDocument = true;
                break;
            }
        }
        
        if (!userHasDocument) {
            userDocuments[_user].push(_documentId);
        }
        
        // Emit event
        emit DocumentAccessGranted(_documentId, _msgSender(), _user, _expiresAt);
    }
    
    /**
     * @dev Revoke access to a document from a user
     * @param _documentId unique identifier for the document
     * @param _user address of the user to revoke access from
     */
    function revokeAccess(
        bytes32 _documentId,
        address _user
    ) external nonReentrant {
        require(documents[_documentId].exists, "Document does not exist");
        require(_msgSender() == documents[_documentId].owner || hasRole(ADMIN_ROLE, _msgSender()), "Not authorized");
        require(_user != documents[_documentId].owner, "Cannot revoke owner access");
        
        // Revoke access
        documentPermissions[_documentId][_user].hasAccess = false;
        
        // Emit event
        emit DocumentAccessRevoked(_documentId, _msgSender(), _user);
    }
    
    /**
     * @dev Delete a document from the registry
     * @param _documentId unique identifier for the document
     */
    function deleteDocument(bytes32 _documentId) external nonReentrant {
        require(documents[_documentId].exists, "Document does not exist");
        require(_msgSender() == documents[_documentId].owner || hasRole(ADMIN_ROLE, _msgSender()), "Not authorized");
        
        // Mark as deleted (we keep the record for audit purposes, but clear sensitive data)
        documents[_documentId].exists = false;
        documents[_documentId].ipfsCid = "";
        documents[_documentId].encryptionKey = "";
        
        // Emit event
        emit DocumentDeleted(_documentId, _msgSender());
    }
    
    /**
     * @dev Check if a user has access to a document
     * @param _documentId unique identifier for the document
     * @param _user address of the user to check
     * @return bool indicating whether user has access
     */
    function hasAccess(bytes32 _documentId, address _user) external view returns (bool) {
        if (!documents[_documentId].exists) {
            return false;
        }
        
        // Owner always has access
        if (_user == documents[_documentId].owner) {
            return true;
        }
        
        // Admin always has access
        if (hasRole(ADMIN_ROLE, _user)) {
            return true;
        }
        
        // Check specific permissions
        Permission memory permission = documentPermissions[_documentId][_user];
        
        if (!permission.hasAccess) {
            return false;
        }
        
        // Check if access has expired
        if (permission.expiresAt != 0 && block.timestamp > permission.expiresAt) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Get document metadata
     * @param _documentId unique identifier for the document
     * @return ipfsCid, owner, uploadedAt, metadataHash, exists
     */
    function getDocumentMetadata(bytes32 _documentId) external view returns (
        string memory ipfsCid,
        address owner,
        uint256 uploadedAt,
        string memory metadataHash,
        bool exists
    ) {
        Document memory doc = documents[_documentId];
        require(
            doc.exists && 
            (hasAccess(_documentId, _msgSender()) || hasRole(ADMIN_ROLE, _msgSender())), 
            "Not authorized to view this document"
        );
        
        return (
            doc.ipfsCid,
            doc.owner,
            doc.uploadedAt,
            doc.metadataHash,
            doc.exists
        );
    }
    
    /**
     * @dev Get document encryption key
     * @param _documentId unique identifier for the document
     * @return encryptionKey for the document
     */
    function getDocumentEncryptionKey(bytes32 _documentId) external view returns (string memory) {
        Document memory doc = documents[_documentId];
        require(doc.exists, "Document does not exist");
        require(hasAccess(_documentId, _msgSender()), "Not authorized to decrypt this document");
        
        return doc.encryptionKey;
    }
    
    /**
     * @dev Get list of document IDs a user has access to
     * @param _user address of the user
     * @return array of document IDs the user has access to
     */
    function getUserDocuments(address _user) external view returns (bytes32[] memory) {
        return userDocuments[_user];
    }
    
    /**
     * @dev Get total number of documents in the registry
     * @return total number of documents
     */
    function getTotalDocuments() external view returns (uint256) {
        return totalDocuments;
    }
    
    /**
     * @dev Grant admin role to a user
     * @param _user address of the user to grant admin role to
     */
    function grantAdminRole(address _user) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ADMIN_ROLE, _user);
    }
    
    /**
     * @dev Revoke admin role from a user
     * @param _user address of the user to revoke admin role from
     */
    function revokeAdminRole(address _user) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ADMIN_ROLE, _user);
    }
}
