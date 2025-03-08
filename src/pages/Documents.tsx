
import ServerControls from "@/components/ServerControls";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentList from "@/components/DocumentList";

const Documents = () => {
  return (
    <main className="container mx-auto py-8 px-4 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Blockchain Document Manager
      </h1>
      
      <ServerControls />
      
      <div className="grid md:grid-cols-2 gap-8">
        <DocumentUpload />
        <DocumentList />
      </div>
    </main>
  );
};

export default Documents;
