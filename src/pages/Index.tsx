
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import GlassCard from "@/components/ui/GlassCard";
import { Shield, FileText, Database, Key } from "lucide-react";
import ServerControls from "@/components/ServerControls";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 text-white">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-100">
            Blockchain Document Sharing System
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Secure document storage and sharing with blockchain verification,
            end-to-end encryption, and decentralized storage
          </p>
        </header>

        {/* Server Control Panel */}
        <ServerControls />

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <GlassCard variant="blockchain" className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 mr-2 text-blue-400" />
                <h2 className="text-xl font-semibold">Blockchain Security</h2>
              </div>
              <p className="mb-6 text-blue-100">
                Document ownership and access rights are securely recorded on the
                Ethereum blockchain. Every access is verified on-chain ensuring
                complete security and transparency.
              </p>
              <div className="mt-auto">
                <Button variant="outline" className="text-blue-100 border-blue-400 hover:bg-blue-800 hover:text-white w-full">
                  Learn About Blockchain Security
                </Button>
              </div>
            </div>
          </GlassCard>

          <GlassCard variant="blockchain" className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 mr-2 text-blue-400" />
                <h2 className="text-xl font-semibold">End-to-End Encryption</h2>
              </div>
              <p className="mb-6 text-blue-100">
                All documents are encrypted with AES-256 before being stored on IPFS.
                Only authorized users with the correct decryption keys can access
                the content, ensuring maximum privacy.
              </p>
              <div className="mt-auto">
                <Button variant="outline" className="text-blue-100 border-blue-400 hover:bg-blue-800 hover:text-white w-full">
                  Encryption Details
                </Button>
              </div>
            </div>
          </GlassCard>

          <GlassCard variant="blockchain" className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-center mb-4">
                <Database className="h-6 w-6 mr-2 text-blue-400" />
                <h2 className="text-xl font-semibold">Decentralized Storage</h2>
              </div>
              <p className="mb-6 text-blue-100">
                Your documents are stored on IPFS (InterPlanetary File System),
                a distributed network that ensures your data is always available
                and resistant to censorship.
              </p>
              <div className="mt-auto">
                <Button variant="outline" className="text-blue-100 border-blue-400 hover:bg-blue-800 hover:text-white w-full">
                  Explore IPFS Technology
                </Button>
              </div>
            </div>
          </GlassCard>

          <GlassCard variant="blockchain" className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-center mb-4">
                <Key className="h-6 w-6 mr-2 text-blue-400" />
                <h2 className="text-xl font-semibold">Gasless Transactions</h2>
              </div>
              <p className="mb-6 text-blue-100">
                Share documents on the blockchain without worrying about gas fees.
                Our integration with OpenGSN allows for fee-free blockchain
                transactions, making the system accessible to everyone.
              </p>
              <div className="mt-auto">
                <Button variant="outline" className="text-blue-100 border-blue-400 hover:bg-blue-800 hover:text-white w-full">
                  How Gasless Works
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="text-center">
          <Link to="/dashboard">
            <Button size="lg" className="blockchain-gradient text-white px-8 py-6 text-lg">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
