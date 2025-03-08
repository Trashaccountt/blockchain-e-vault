
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { isBackendRunning } from "@/services/backendService";
import { 
  Download, 
  Eye, 
  FileText, 
  Lock, 
  Share2, 
  Shield, 
  Clock, 
  Loader2,
  Search
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock document type
interface Document {
  id: string;
  title: string;
  description: string;
  fileType: string;
  fileSize: number;
  ipfsHash: string;
  createdAt: string;
  isPublic: boolean;
  transactionHash: string;
}

const DocumentList = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sharingEmail, setSharingEmail] = useState("");
  const [sharingDays, setSharingDays] = useState(7);
  const [sharingDoc, setSharingDoc] = useState<Document | null>(null);
  const [sharingLoading, setSharingLoading] = useState(false);
  
  useEffect(() => {
    fetchDocuments();
  }, []);
  
  const fetchDocuments = async () => {
    if (!isBackendRunning()) {
      setLoading(false);
      setDocuments([]);
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real implementation, this would call your backend API
      // const response = await fetch("http://localhost:5000/api/documents", {
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      //   },
      // });
      // const data = await response.json();
      // setDocuments(data.ownedDocuments);
      
      // Mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockDocuments: Document[] = [
        {
          id: "doc1",
          title: "Project Proposal",
          description: "Detailed blockchain project proposal for Q2",
          fileType: "application/pdf",
          fileSize: 1254000,
          ipfsHash: "QmXs5NmV1bDC12jywgKzv1z7ufFpVJ6cXiQqA9ykhmhTde",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          isPublic: true,
          transactionHash: "0x2e8da6ad47fd25006cb8cefa7e0a3c65f137d2a2978fc4627669b87b57250d4e"
        },
        {
          id: "doc2",
          title: "Legal Agreement",
          description: "NDA for the blockchain integration project",
          fileType: "application/docx",
          fileSize: 385000,
          ipfsHash: "QmUGcUFr4AdFvrLJu23KufNPwM7pVZZ3gY5jtA9Wj1TY1x",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          isPublic: false,
          transactionHash: "0x9d3e1f4b63db9c9bc40eb82e56438556ad4a9389567ef998ee3d93504a42d52f"
        },
        {
          id: "doc3",
          title: "Technical Specifications",
          description: "Technical details for the smart contract implementation",
          fileType: "application/pdf",
          fileSize: 2150000,
          ipfsHash: "QmR9MzJvA8xc9vZX1mJxXTJLdABjVZd9Uw2z7w4oMjgFch",
          createdAt: new Date().toISOString(),
          isPublic: false,
          transactionHash: "0x3de667d499a4d5d8e447ca7b028e1bad9a2c4e62a793877951ee355ab3dc80c5"
        }
      ];
      
      setDocuments(mockDocuments);
    } catch (error) {
      console.error("Fetch documents error:", error);
      toast({
        variant: "destructive",
        title: "Failed to load documents",
        description: "Could not retrieve your documents. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownload = async (doc: Document) => {
    if (!isBackendRunning()) {
      toast({
        variant: "destructive",
        title: "Server not running",
        description: "Please start the blockchain server to download documents."
      });
      return;
    }
    
    toast({
      title: "Downloading document",
      description: "Retrieving from IPFS and decrypting..."
    });
    
    try {
      // In a real implementation, this would call your backend API
      // window.location.href = `http://localhost:5000/api/documents/${doc.id}/download`;
      
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Download complete",
        description: `"${doc.title}" has been successfully downloaded.`
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "There was an error downloading your document."
      });
    }
  };
  
  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sharingDoc) return;
    
    if (!isBackendRunning()) {
      toast({
        variant: "destructive",
        title: "Server not running",
        description: "Please start the blockchain server to share documents."
      });
      return;
    }
    
    setSharingLoading(true);
    
    try {
      // In a real implementation, this would call your backend API
      // const response = await fetch(`http://localhost:5000/api/documents/${sharingDoc.id}/share`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      //   },
      //   body: JSON.stringify({
      //     email: sharingEmail,
      //     expiresIn: sharingDays,
      //   }),
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Document shared",
        description: `"${sharingDoc.title}" has been shared with ${sharingEmail}.`
      });
      
      // Reset form and close dialog
      setSharingEmail("");
      setSharingDays(7);
      setSharingDoc(null);
    } catch (error) {
      console.error("Share error:", error);
      toast({
        variant: "destructive",
        title: "Sharing failed",
        description: "There was an error sharing your document."
      });
    } finally {
      setSharingLoading(false);
    }
  };
  
  const filteredDocuments = documents.filter(
    doc => doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           doc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <GlassCard variant="blockchain" className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Your Blockchain Documents
        </h2>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="pl-8 w-[200px]"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : !isBackendRunning() ? (
        <div className="text-center py-8">
          <Shield className="h-10 w-10 mx-auto mb-4 text-blue-300" />
          <p className="mb-2">Start the blockchain server to view your documents</p>
          <p className="text-sm text-blue-200">
            Your documents are securely stored on the blockchain network
          </p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-10 w-10 mx-auto mb-4 text-blue-300" />
          <p className="mb-2">No documents found</p>
          <p className="text-sm text-blue-200">
            Upload your first document to get started
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
            <div 
              key={doc.id} 
              className="border border-blue-500/30 rounded-lg p-4 bg-blue-900/10 hover:bg-blue-900/20 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="font-medium">{doc.title}</h3>
                    {doc.isPublic ? (
                      <Shield className="h-4 w-4 text-green-400" />
                    ) : (
                      <Lock className="h-4 w-4 text-blue-400" />
                    )}
                  </div>
                  <p className="text-sm text-blue-200 mt-1">{doc.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(doc.createdAt)}
                    </span>
                    <span className="text-xs">{formatBytes(doc.fileSize)}</span>
                    <span className="text-xs">{doc.fileType.split('/')[1].toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSharingDoc(doc)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    {sharingDoc && (
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Share Document</DialogTitle>
                          <DialogDescription>
                            Share "{sharingDoc.title}" with another user
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleShare}>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Recipient Email</label>
                              <Input
                                value={sharingEmail}
                                onChange={(e) => setSharingEmail(e.target.value)}
                                placeholder="Enter recipient's email"
                                required
                                type="email"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Access Duration (days)</label>
                              <Input
                                value={sharingDays}
                                onChange={(e) => setSharingDays(Number(e.target.value))}
                                type="number"
                                min="1"
                                max="90"
                              />
                            </div>
                            <p className="text-xs text-blue-200">
                              The recipient will have access to view and download this document for the specified period.
                              All access is recorded on the blockchain for audit purposes.
                            </p>
                          </div>
                          <DialogFooter>
                            <Button 
                              type="submit" 
                              className="w-full"
                              disabled={sharingLoading || !sharingEmail}
                            >
                              {sharingLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Sharing...
                                </>
                              ) : (
                                "Share Document"
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    )}
                  </Dialog>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      window.open(`https://sepolia.etherscan.io/tx/${doc.transactionHash}`, '_blank');
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <p className="text-xs text-blue-200 mt-6">
        All documents are encrypted with AES-256 and stored on IPFS. Metadata and access rights
        are securely recorded on the Ethereum Sepolia testnet blockchain.
      </p>
    </GlassCard>
  );
};

export default DocumentList;
