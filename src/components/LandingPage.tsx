import React, { useState } from 'react';
import { Search, Globe, GraduationCap, Mic, CloudUpload, FolderUp, HardDrive, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import SignInDialog from './SignInDialog';
import { cn } from '@/lib/utils';
import WhatYouCanBuildSection from './WhatYouCanBuildSection';

const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      navigate('/dashboard', {
        state: {
          query: searchQuery,
          source: 'search'
        }
      });
    }, 1500);
  };
  const handleUpload = (type: 'drive' | 'computer' | 'url') => {
    navigate('/upload', {
      state: {
        uploadType: type
      }
    });
  };
  const handleWorkspaceClick = () => {
    navigate('/workspace');
  };
  const handleTrustSafetyClick = () => {
    navigate('/trust-safety');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#1E2330] to-[#1A1F2C] text-white flex flex-col">
      <header className="w-full border-b border-gray-800/50 bg-black/10 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8">
              <img src="/lovable-uploads/9e72d009-982d-437d-9caa-9403a11018b8.png" alt="Yavar Logo" className="h-full" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              Pro
            </Button>
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              About
            </Button>
            <Button onClick={handleTrustSafetyClick} className="bg-gradient-to-r from-violet-600/80 to-violet-700/80 hover:from-violet-600 hover:to-violet-700 text-white border-none">
              Trust & Safety
            </Button>
            <Button onClick={handleWorkspaceClick} className="bg-gradient-to-r from-violet-600/80 to-violet-700/80 hover:from-violet-600 hover:to-violet-700 text-white border-none">
              Workspace
            </Button>
            <Button onClick={() => setShowSignIn(true)} className="bg-gradient-to-r from-violet-600/80 to-violet-700/80 hover:from-violet-600 hover:to-violet-700 text-white border-none">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start px-4">
        <div className="w-full max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-balance bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent sm:text-3xl">Z Scout -
The research assistant you always needed</h1>
            <p className="max-w-2xl mx-auto text-balance text-md font-light text-gray-300">
              Just upload documents or reference live links, or ask, and get intelligent, cited answers grounded in your documents and trusted sources.
            </p>
          </div>

          <div className="relative animate-fade-in">
            <div className={cn("absolute right-14 top-full mt-2 z-50 w-64 rounded-lg border border-gray-800 bg-[#2A2F3C] shadow-lg", showUploadOptions ? "block" : "hidden")}>
              <div className="p-1">
                <Button variant="ghost" className="w-full flex items-center gap-3 p-4 h-auto hover:bg-white/5 text-gray-300 hover:text-white justify-start" onClick={() => handleUpload('drive')}>
                  <HardDrive className="h-5 w-5 text-blue-400" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Cloud Storage</span>
                    <span className="text-xs text-gray-500">Access your cloud documents</span>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full flex items-center gap-3 p-4 h-auto hover:bg-white/5 text-gray-300 hover:text-white justify-start" onClick={() => handleUpload('computer')}>
                  <FolderUp className="h-5 w-5 text-orange-400" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Local Files</span>
                    <span className="text-xs text-gray-500">PDF, Word, or text files</span>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full flex items-center gap-3 p-4 h-auto hover:bg-white/5 text-gray-300 hover:text-white justify-start" onClick={() => handleUpload('url')}>
                  <Globe className="h-5 w-5 text-green-400" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Web Reference</span>
                    <span className="text-xs text-gray-500">Import from web pages</span>
                  </div>
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="w-full" onClick={() => setShowUploadOptions(false)}>
              <div className="relative rounded-xl border border-gray-800 bg-[#2A2F3C]/80 backdrop-blur-sm shadow-lg transition-colors focus-within:border-violet-500">
                <Input type="text" placeholder="Ask a question or search your documents..." className="pl-12 pr-24 py-7 text-lg border-0 focus-visible:ring-0 rounded-xl bg-transparent text-white placeholder:text-gray-500" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  <Button type="button" size="icon" variant="ghost" className="hover:bg-white/5 text-gray-400 hover:text-violet-400" onClick={e => {
                  e.stopPropagation();
                  setShowUploadOptions(!showUploadOptions);
                }}>
                    <CloudUpload className="h-5 w-5" />
                  </Button>
                  <Button type="button" size="icon" disabled={isGenerating} className="bg-gradient-to-r from-violet-600/80 to-violet-700/80 hover:from-violet-600 hover:to-violet-700 text-white border-none">
                    <Mic className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm" className="rounded-full border-gray-700 text-gray-300 hover:text-white hover:border-violet-500 hover:bg-white/5">
                  <Search className="h-4 w-4 mr-2 text-violet-400" />
                  Research
                </Button>
                <Button variant="outline" size="sm" className="rounded-full border-gray-700 text-gray-300 hover:text-white hover:border-violet-500 hover:bg-white/5">
                  <GraduationCap className="h-4 w-4 mr-2 text-violet-400" />
                  Academic Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <WhatYouCanBuildSection />

      <footer className="border-t border-gray-800/50 bg-black/10 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 h-16 flex items-center justify-end text-sm text-gray-400">
          <div className="text-right">
            <div className="text-sm text-gray-400">
              Copyright © 2025 Yavar techworks Pte Ltd., All rights reserved.
              <a href="https://www.yavar.ai/privacy-policy/" className="mx-2 text-violet-300 hover:text-violet-200 transition-colors" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
              •
              <a href="https://www.yavar.ai/terms-and-conditions/" className="mx-2 text-violet-300 hover:text-violet-200 transition-colors" target="_blank" rel="noopener noreferrer">
                Terms & Conditions
              </a>
            </div>
          </div>
        </div>
      </footer>

      <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
    </div>
  );
};

export default LandingPage;
