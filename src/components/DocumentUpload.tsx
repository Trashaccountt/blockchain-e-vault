
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { FileUp, Loader2 } from "lucide-react";
import { isBackendRunning } from "@/services/backendService";
import GlassCard from "@/components/ui/GlassCard";

const DocumentUpload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isBackendRunning()) {
      toast({
        variant: "destructive",
        title: "Server not running",
        description: "Please start the blockchain server before uploading documents."
      });
      return;
    }
    
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a file to upload."
      });
      return;
    }
    
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Title required",
        description: "Please provide a title for your document."
      });
      return;
    }
    
    setUploading(true);
    
    // Create form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("isPublic", isPublic.toString());
    
    try {
      // In a real implementation, this would call your backend API
      // const response = await fetch("http://localhost:5000/api/documents/upload", {
      //   method: "POST",
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      //   },
      //   body: formData,
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful upload
      toast({
        title: "Document uploaded",
        description: `"${title}" has been successfully uploaded to the blockchain network.`
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setFile(null);
      setIsPublic(false);
      
      // Reset file input
      const fileInput = document.getElementById("document-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your document. Please try again."
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <GlassCard variant="blockchain" className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FileUp className="h-5 w-5" />
        Upload Document to Blockchain
      </h2>
      
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="document-title">Document Title</Label>
          <Input
            id="document-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
            disabled={uploading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="document-description">Description (Optional)</Label>
          <Textarea
            id="document-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter document description"
            disabled={uploading}
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="document-file">Select Document</Label>
          <Input
            id="document-file"
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
            className="cursor-pointer"
          />
          {file && (
            <p className="text-xs text-blue-200">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="public-switch"
            checked={isPublic}
            onCheckedChange={setIsPublic}
            disabled={uploading}
          />
          <Label htmlFor="public-switch">Make document public</Label>
        </div>
        
        <Button 
          type="submit" 
          disabled={uploading || !file || !title.trim()} 
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading to Blockchain...
            </>
          ) : (
            "Upload Document"
          )}
        </Button>
        
        <p className="text-xs text-blue-200 mt-2">
          Your document will be encrypted and stored on IPFS with metadata registered on the Ethereum blockchain.
        </p>
      </form>
    </GlassCard>
  );
};

export default DocumentUpload;
