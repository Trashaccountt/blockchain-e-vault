
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Lock, Share2, Clock, FileCheck, Database } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white pointer-events-none" />
        <div className="container-custom relative pt-16 pb-8 md:pt-24 md:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-block mb-4 px-4 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                Secure Document Management
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Blockchain-Powered <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                  E-Vault System
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-md">
                Store, manage, and share your important documents securely using decentralized blockchain technology with our cutting-edge E-Vault platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="group">
                  <Link to="/signup" className="flex items-center">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </div>
            
            <div className="relative animate-scale-in">
              <div className="relative z-10 p-4">
                <img 
                  src="https://images.unsplash.com/photo-1639322537504-6427a16b0a28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Blockchain Document Security" 
                  className="rounded-2xl shadow-xl w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-blue-100 rounded-full" />
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-blue-50 rounded-full" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-xl text-gray-600">
              Our platform combines blockchain security with intuitive design to deliver a seamless document management experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-10 w-10 text-blue-500" />,
                title: "Enhanced Security",
                description: "Military-grade encryption combined with blockchain immutability ensures your documents are protected against unauthorized access."
              },
              {
                icon: <Lock className="h-10 w-10 text-blue-500" />,
                title: "Access Control",
                description: "Grant and revoke access to specific individuals, maintaining complete control over who can view your documents."
              },
              {
                icon: <Share2 className="h-10 w-10 text-blue-500" />,
                title: "Secure Sharing",
                description: "Share documents securely with role-based permissions, ensuring recipients can only access what you allow them to."
              },
              {
                icon: <Clock className="h-10 w-10 text-blue-500" />,
                title: "Immutable Audit Trail",
                description: "Every action is recorded on the blockchain, creating a tamper-proof audit trail for complete transparency."
              },
              {
                icon: <FileCheck className="h-10 w-10 text-blue-500" />,
                title: "Document Verification",
                description: "Instantly verify the authenticity and integrity of any document stored in your vault."
              },
              {
                icon: <Database className="h-10 w-10 text-blue-500" />,
                title: "Decentralized Storage",
                description: "Documents are stored on a decentralized network, eliminating single points of failure and ensuring availability."
              }
            ].map((feature, index) => (
              <GlassCard 
                key={index} 
                className="p-8 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-blue-50 rounded-2xl p-4 inline-block mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">
              Our platform simplifies secure document management without compromising on security or usability.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                number: "01",
                title: "Upload Documents",
                description: "Securely upload your documents to our platform. Each document is encrypted and assigned a unique digital signature."
              },
              {
                number: "02",
                title: "Store on Blockchain",
                description: "Document metadata is stored on the blockchain while the encrypted file is stored on secure decentralized storage."
              },
              {
                number: "03",
                title: "Manage & Share",
                description: "Easily manage your documents, control access permissions, and securely share with specific individuals."
              }
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="bg-blue-100 text-blue-800 text-2xl font-bold rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
        <div className="container-custom text-center">
          <div className="max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to secure your documents?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of users who trust our blockchain-powered E-Vault for their sensitive documents.
            </p>
            <Button asChild size="lg" variant="secondary" className="group">
              <Link to="/signup" className="flex items-center">
                Get Started For Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">About E-Vault</h2>
              <p className="text-lg text-gray-600 mb-6">
                E-Vault was created with a vision to revolutionize document security using blockchain technology. 
                Our team of security experts and blockchain developers has built a platform that combines 
                enterprise-grade security with user-friendly design.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                We believe that everyone deserves access to secure document storage and sharing solutions. 
                That's why we've made our platform accessible to individuals and organizations of all sizes.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-gray-100 px-6 py-4 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">100%</p>
                  <p className="text-gray-600">Secure Storage</p>
                </div>
                <div className="bg-gray-100 px-6 py-4 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">24/7</p>
                  <p className="text-gray-600">Availability</p>
                </div>
                <div className="bg-gray-100 px-6 py-4 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">10,000+</p>
                  <p className="text-gray-600">Happy Users</p>
                </div>
              </div>
            </div>
            
            <div className="relative animate-scale-in">
              <div className="relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Blockchain Technology" 
                  className="rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
