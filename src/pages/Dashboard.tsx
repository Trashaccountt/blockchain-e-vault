
import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { FileText, Upload, Share2, ShieldCheck, Users, Activity } from 'lucide-react';
import { formatAddress, getDocumentsFromBlockchain, Document } from '@/utils/blockchain';
import GlassCard from '@/components/ui/GlassCard';

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  useEffect(() => {
    const loadDocuments = async () => {
      if (user?.walletAddress) {
        try {
          setIsLoadingDocs(true);
          const docs = await getDocumentsFromBlockchain(user.walletAddress);
          setDocuments(docs);
        } catch (error) {
          console.error('Error loading documents:', error);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-grow pt-24 pb-16">
        <div className="container-custom">
          {/* Welcome Section */}
          <section className="mb-12 animate-fade-in">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-3xl p-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
                  <p className="text-gray-600 mb-4">
                    Wallet Address: {user?.walletAddress ? formatAddress(user.walletAddress) : 'Not connected'}
                  </p>
                  <p className="text-gray-600">
                    Manage and secure your documents with blockchain technology.
                  </p>
                </div>
                <div className="mt-6 md:mt-0">
                  <Button asChild size="lg" className="animate-fade-in">
                    <Link to="/upload" className="flex items-center">
                      <Upload className="mr-2 h-5 w-5" />
                      Upload New Document
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Total Documents",
                  value: documents.length,
                  icon: <FileText className="h-8 w-8 text-blue-500" />,
                  color: "bg-blue-50"
                },
                {
                  title: "Shared Documents",
                  value: documents.filter(doc => doc.sharedWith.length > 0).length,
                  icon: <Share2 className="h-8 w-8 text-green-500" />,
                  color: "bg-green-50"
                },
                {
                  title: "Secured Storage",
                  value: "100%",
                  icon: <ShieldCheck className="h-8 w-8 text-purple-500" />,
                  color: "bg-purple-50"
                },
                {
                  title: user?.role === 'admin' ? "User Accounts" : "Access Level",
                  value: user?.role === 'admin' ? "24" : user?.role.toUpperCase(),
                  icon: <Users className="h-8 w-8 text-amber-500" />,
                  color: "bg-amber-50"
                }
              ].map((stat, index) => (
                <GlassCard
                  key={index}
                  className="p-6 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`${stat.color} rounded-full p-3 inline-block mb-4`}>
                    {stat.icon}
                  </div>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <p className="text-gray-600">{stat.title}</p>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* Recent Documents */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Recent Documents</h2>
              <Button asChild variant="outline">
                <Link to="/documents">View All</Link>
              </Button>
            </div>

            {isLoadingDocs ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your documents...</p>
              </div>
            ) : documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.slice(0, 3).map((doc, index) => (
                  <GlassCard
                    key={doc.id}
                    className="p-6 animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
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
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Share2 className="h-4 w-4 mr-1" />
                        {doc.sharedWith.length}
                      </span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mb-4" />
                  <CardTitle className="text-xl mb-2">No documents yet</CardTitle>
                  <CardDescription className="text-center mb-6">
                    You haven't uploaded any documents to your vault yet.
                  </CardDescription>
                  <Button asChild>
                    <Link to="/upload" className="flex items-center">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Your First Document
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Activity Feed */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Recent Activity</h2>
              <Button variant="ghost" className="text-primary" disabled>
                View All
              </Button>
            </div>

            <GlassCard className="animate-scale-in">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Activity className="h-5 w-5 text-primary mr-2" />
                  <h3 className="text-lg font-semibold">Activity Feed</h3>
                </div>

                <div className="space-y-4">
                  {documents.length > 0 ? (
                    [...documents]
                      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
                      .slice(0, 5)
                      .map((doc, index) => (
                        <div
                          key={`activity-${doc.id}`}
                          className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className={`p-2 rounded-full bg-${['blue', 'green', 'purple', 'amber', 'pink'][index % 5]}-50`}>
                            <FileText className={`h-5 w-5 text-${['blue', 'green', 'purple', 'amber', 'pink'][index % 5]}-500`} />
                          </div>
                          <div>
                            <p className="font-medium">
                              Document "{doc.name}" was uploaded
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(doc.uploadDate).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No recent activity to display.</p>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
