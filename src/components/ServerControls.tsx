
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { startBackendServer, testBackendConnection, isBackendRunning } from "@/services/backendService";
import GlassCard from "@/components/ui/GlassCard";
import { Loader2, Server, Wifi } from "lucide-react";

const ServerControls = () => {
  const [isStarting, setIsStarting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  const handleStartServer = async () => {
    setIsStarting(true);
    await startBackendServer();
    setIsStarting(false);
  };
  
  const handleTestConnection = async () => {
    setIsTesting(true);
    await testBackendConnection();
    setIsTesting(false);
  };
  
  return (
    <GlassCard variant="blockchain" className="p-6 max-w-md mx-auto mb-8">
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Server className="h-5 w-5" />
          Blockchain Document Server
        </h2>
        
        <div className="flex items-center space-x-2 mt-2">
          <div className={`h-3 w-3 rounded-full ${isBackendRunning() ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">
            Status: {isBackendRunning() ? 'Running' : 'Stopped'}
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button 
            className="flex-1" 
            variant={isBackendRunning() ? "outline" : "default"}
            disabled={isStarting || isBackendRunning()}
            onClick={handleStartServer}
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Server...
              </>
            ) : (
              isBackendRunning() ? "Server Running" : "Start Server"
            )}
          </Button>
          
          <Button 
            className="flex-1" 
            variant="outline" 
            disabled={isTesting || !isBackendRunning()}
            onClick={handleTestConnection}
          >
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Wifi className="mr-2 h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>
        </div>
        
        <p className="text-xs text-blue-200 mt-2">
          The server runs on localhost:5000 and connects to IPFS, MongoDB, and Ethereum Sepolia testnet
        </p>
      </div>
    </GlassCard>
  );
};

export default ServerControls;
