
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { Document, getDocumentsFromBlockchain, formatFileSize, shareDocument, revokeAccess } from '@/utils/blockchain';
import GlassCard from '@/components/ui/GlassCard';
import { FileText, Search, Share2, Eye, Download, Link2, Shield, User, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Documents = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const loadDocuments = async () => {
      if (user?.walletAddress) {
        try {
          setIsLoadingDocs(true);
          const docs = await getDocumentsFromBlockchain(user.walletAddress);
          setDocuments(docs);
        } catch (error) {
          console.error('Error loading documents:', error);
          toast({
            variant: "destructive",
            title: "Failed to load documents",
            description: "There was an error loading your documents. Please try again.",
          });
        } finally {
          setIsLoadingDocs(false);
        }
      } else {
        setIsLoadingDocs(false);
      }
    };

    if (isAuthenticated && !isLoading) {
      loadDocuments();
    }
  }, [user, isAuthenticated, isLoading]);

  // If not authenticated, redirect to login
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Filter documents based on search query
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.fileType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle share document
  const handleShareDocument = async () => {
    if (!selectedDocument || !shareEmail) return;

    try {
      setIsSharing(true);
      // Mock recipient address - in a real app, you would resolve the email to a blockchain address
      const recipientAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      await shareDocument(selectedDocument.id, recipientAddress);
      
      // Update documents state
      setDocuments(docs => docs.map(doc => {
        if (doc.id === selectedDocument.id) {
          return {
            ...doc,
            sharedWith: [...doc.sharedWith, recipientAddress]
          };
        }
        return doc;
      }));
      
      toast({
        title: "Document shared",
        description: `Document "${selectedDocument.name}" has been shared successfully.`,
      });
      
      setShareEmail('');
    } catch (error) {
      console.error('Error sharing document:', error);
      toast({
        variant: "destructive",
        title: "Failed to share document",
        description: "There was an error sharing your document. Please try again.",
      });
    } finally {
      setIsSharing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-grow pt-24 pb-16">
        <div className="container-custom">
          {/* Header Section */}
          <section className="mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">My Documents</h1>
                <p className="text-gray-600">
                  View, manage, and share your secure documents
                </p>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search documents..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Documents Section */}
          <section>
            {isLoadingDocs ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your documents...</p>
              </div>
            ) : filteredDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map((doc, index) => (
                  <GlassCard
                    key={doc.id}
                    className="animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg bg-${['blue', 'green', 'purple', 'amber', 'pink'][index % 5]}-50`}>
                          <FileText className={`h-6 w-6 text-${['blue', 'green', 'purple', 'amber', 'pink'][index % 5]}-500`} />
                        </div>
                        <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded uppercase">
                          {doc.fileType}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mb-1 truncate" title={doc.name}>
                        {doc.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-3 truncate" title={doc.description}>
                        {doc.description}
                      </p>
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open(`https://ipfs.io/ipfs/${doc.fileHash.replace('0x', '')}`, '_blank')}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => setSelectedDocument(doc)}
                            >
                              <Share2 className="h-4 w-4 mr-1" />
                              Share
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Share Document</DialogTitle>
                              <DialogDescription>
                                Share this document securely with others.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label>Document</Label>
                                <div className="flex items-center gap-2 p-2 border rounded-md">
                                  <FileText className="h-5 w-5 text-blue-500" />
                                  <span className="font-medium">{selectedDocument?.name}</span>
                                </div>
                              </div>
                              <div className="grid gap-2">
                                <Label>Share with (Email)</Label>
                                <Input
                                  placeholder="email@example.com"
                                  value={shareEmail}
                                  onChange={(e) => setShareEmail(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter className="sm:justify-between">
                              <Button 
                                variant="outline"
                                className="hidden sm:flex"
                                onClick={() => {
                                  navigator.clipboard.writeText(`https://ipfs.io/ipfs/${selectedDocument?.fileHash.replace('0x', '')}`);
                                  toast({
                                    title: "Link copied",
                                    description: "Document link has been copied to clipboard.",
                                  });
                                }}
                              >
                                <Link2 className="h-4 w-4 mr-2" />
                                Copy Link
                              </Button>
                              <Button 
                                type="submit" 
                                onClick={handleShareDocument}
                                disabled={isSharing || !shareEmail}
                              >
                                {isSharing ? (
                                  <>
                                    <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></div>
                                    Sharing...
                                  </>
                                ) : (
                                  <>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share Document
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => setSelectedDocument(doc)}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Document Details</DialogTitle>
                              <DialogDescription>
                                Blockchain verification and document metadata
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="grid gap-4 py-4">
                              <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Shield className="h-5 w-5 text-blue-500" />
                                  <span className="font-semibold">Blockchain Verified</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  This document is verified on the blockchain and cannot be tampered with.
                                </p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <DetailItem label="Name" value={selectedDocument?.name} />
                                <DetailItem label="Type" value={selectedDocument?.fileType.toUpperCase()} />
                                <DetailItem label="Size" value={selectedDocument ? formatFileSize(selectedDocument.fileSize) : ""} />
                                <DetailItem label="Uploaded" value={selectedDocument ? new Date(selectedDocument.uploadDate).toLocaleString() : ""} />
                                <DetailItem 
                                  label="Contract Address" 
                                  value={selectedDocument?.contractAddress} 
                                  isHash 
                                />
                                <DetailItem 
                                  label="Transaction Hash" 
                                  value={selectedDocument?.transactionHash} 
                                  isHash 
                                />
                                <DetailItem 
                                  label="IPFS Hash" 
                                  value={selectedDocument?.fileHash} 
                                  isHash 
                                />
                                <DetailItem 
                                  label="Block Number" 
                                  value={selectedDocument?.blockNumber?.toString()} 
                                />
                              </div>
                              
                              {selectedDocument?.sharedWith && selectedDocument.sharedWith.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Shared With</h4>
                                  <div className="space-y-2">
                                    {selectedDocument.sharedWith.map((address, idx) => (
                                      <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                                        <div className="flex items-center gap-2">
                                          <User className="h-4 w-4 text-gray-500" />
                                          <span className="text-sm">
                                            {`${address.slice(0, 6)}...${address.slice(-4)}`}
                                          </span>
                                        </div>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                          onClick={async () => {
                                            await revokeAccess(selectedDocument.id, address);
                                            toast({
                                              title: "Access revoked",
                                              description: "Access to this document has been revoked.",
                                            });
                                            // Update documents state
                                            setDocuments(docs => docs.map(doc => {
                                              if (doc.id === selectedDocument.id) {
                                                return {
                                                  ...doc,
                                                  sharedWith: doc.sharedWith.filter(a => a !== address)
                                                };
                                              }
                                              return doc;
                                            }));
                                          }}
                                        >
                                          Revoke
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <DialogFooter>
                              <Button 
                                onClick={() => window.open(`https://ipfs.io/ipfs/${selectedDocument?.fileHash.replace('0x', '')}`, '_blank')}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Document
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard className="animate-fade-in">
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchQuery ? 'No matching documents found' : 'No documents yet'}
                  </h3>
                  <p className="text-center text-gray-600 mb-6 max-w-md">
                    {searchQuery 
                      ? `Couldn't find any documents matching "${searchQuery}". Try a different search term.` 
                      : "You haven't uploaded any documents to your vault yet."}
                  </p>
                  {!searchQuery && (
                    <Button asChild>
                      <Link to="/upload">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Your First Document
                      </Link>
                    </Button>
                  )}
                </div>
              </GlassCard>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Helper component for document details
const DetailItem = ({ label, value, isHash = false }: { label: string; value?: string; isHash?: boolean }) => {
  if (!value) return null;
  
  return (
    <div>
      <span className="text-sm text-gray-500 block mb-1">{label}</span>
      <div className="flex items-center gap-1">
        <span className={`text-sm font-medium ${isHash ? "truncate" : ""}`}>
          {isHash ? `${value.slice(0, 6)}...${value.slice(-4)}` : value}
        </span>
        {isHash && (
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => {
              navigator.clipboard.writeText(value);
              toast({
                title: "Copied",
                description: `${label} copied to clipboard`,
              });
            }}
            title="Copy to clipboard"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

// Copy icon component
const Copy = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

// Label component
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-sm font-medium text-gray-700">{children}</label>
);

export default Documents;
