
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Zap, Clock, Server, FileCheck, Users, Lock, Briefcase, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#1E2330] to-[#1A1F2C] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="mb-8 hover:bg-white/5 text-gray-400 hover:text-white group transition-all"
          >
            <ChevronLeft className="h-4 w-4 mr-2 text-violet-400 group-hover:text-violet-300" />
            Back to Home
          </Button>

          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent">
              Z Scout Pro
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Unlock the full potential of your research with advanced features, deeper analysis, and enhanced collaboration tools.
            </p>
            <div className="mt-8 inline-block">
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-violet-600/20 text-violet-300 text-sm font-medium">
                Coming Soon — Join the Waitlist
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Zap className="h-6 w-6 text-violet-400" />
                <h3 className="text-xl font-medium ml-3">Advanced Analytics</h3>
              </div>
              <p className="text-gray-300">
                Get deeper insights with detailed data analysis, custom visualizations, and in-depth trend analysis across your research topics.
              </p>
            </div>
            
            <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-violet-400" />
                <h3 className="text-xl font-medium ml-3">Priority Processing</h3>
              </div>
              <p className="text-gray-300">
                Skip the queue with faster report generation and priority access to new features and capabilities as they roll out.
              </p>
            </div>
            
            <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Server className="h-6 w-6 text-violet-400" />
                <h3 className="text-xl font-medium ml-3">Extended Storage</h3>
              </div>
              <p className="text-gray-300">
                Store unlimited research reports, source documents, and project materials with our expanded cloud storage capacity.
              </p>
            </div>
            
            <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <FileCheck className="h-6 w-6 text-violet-400" />
                <h3 className="text-xl font-medium ml-3">Advanced Document Analysis</h3>
              </div>
              <p className="text-gray-300">
                Upload larger documents and analyze more complex materials with enhanced document processing capabilities.
              </p>
            </div>
            
            <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-violet-400" />
                <h3 className="text-xl font-medium ml-3">Team Collaboration</h3>
              </div>
              <p className="text-gray-300">
                Work seamlessly with your team with shared workspaces, role-based permissions, and real-time collaborative editing.
              </p>
            </div>
            
            <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Lock className="h-6 w-6 text-violet-400" />
                <h3 className="text-xl font-medium ml-3">Enhanced Security</h3>
              </div>
              <p className="text-gray-300">
                Get additional security features including custom encryption keys, access controls, and detailed audit logs.
              </p>
            </div>
            
            <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Briefcase className="h-6 w-6 text-violet-400" />
                <h3 className="text-xl font-medium ml-3">Custom Branding</h3>
              </div>
              <p className="text-gray-300">
                Apply your organization's branding to reports and shared research, perfect for client presentations and publications.
              </p>
            </div>
            
            <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Sparkles className="h-6 w-6 text-violet-400" />
                <h3 className="text-xl font-medium ml-3">API Access</h3>
              </div>
              <p className="text-gray-300">
                Integrate Z Scout's powerful research capabilities directly into your applications and workflows with our developer API.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-violet-900/30 to-violet-800/30 rounded-xl p-8 border border-violet-700/30">
            <h2 className="text-2xl font-semibold mb-4">Join the Waitlist</h2>
            <p className="text-gray-300 mb-6">
              Be among the first to experience Z Scout Pro when it launches. Early access members will receive special pricing and exclusive features.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="px-4 py-2 bg-black/20 border border-violet-800/50 rounded-lg flex-grow text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <Button className="bg-violet-600 hover:bg-violet-700 transition-colors">
                Join Waitlist
              </Button>
            </div>
          </div>

          <div className="mt-16 pt-6 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>For enterprise inquiries or early access opportunities, contact us at <a href="mailto:enterprise@zscout.ai" className="text-violet-400 hover:underline">enterprise@zscout.ai</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProPage;
