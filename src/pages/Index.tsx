
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ServerControls from "@/components/ServerControls";
import { FileText } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          Blockchain Document Sharing Platform
        </h1>
        <p className="text-xl mb-8">
          Securely share and manage documents with blockchain-backed encryption and access control
        </p>
        
        <Button 
          size="lg" 
          onClick={() => navigate('/documents')}
          className="mb-8"
        >
          <FileText className="mr-2 h-5 w-5" />
          Manage Documents
        </Button>
      </div>
      
      <ServerControls />
    </main>
  );
};

export default Index;
