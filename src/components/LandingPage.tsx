
import React, { useState, useEffect } from 'react';
import { Search, Globe, GraduationCap, Mic, CloudUpload, FolderUp, HardDrive, FileText, ArrowRight, ChevronRight, ShieldCheck, FolderTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import SignInDialog from './SignInDialog';
import { cn } from '@/lib/utils';
import WhatYouCanBuildSection from './WhatYouCanBuildSection';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [showFeatureTooltip, setShowFeatureTooltip] = useState(false);
  const navigate = useNavigate();

  // Show feature tooltips after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFeatureTooltip(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    setIsGenerating(true);
    
    toast.success('Starting research on "' + searchQuery + '"');
    
    // Simulate generating research
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
    toast.info('Navigating to Research Workspace...', { duration: 1500 });
    setTimeout(() => {
      navigate('/workspace');
    }, 500);
  };

  const handleTrustSafetyClick = () => {
    toast.info('Opening Z-Grid Trust & Safety Dashboard...', { duration: 1500 });
    setTimeout(() => {
      navigate('/trust-safety');
    }, 500);
  };

  const showFeaturedResearch = (topic: string) => {
    setSearchQuery(topic);
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    }, 100);
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
            
            <TooltipProvider>
              <Tooltip open={showFeatureTooltip}>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleTrustSafetyClick} 
                    className="bg-gradient-to-r from-indigo-600/80 to-indigo-700/80 hover:from-indigo-600 hover:to-indigo-700 text-white border-none group relative"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Z-Grid (Trust & Safety)
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping duration-1000 opacity-75"></span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-indigo-900 border-indigo-700 p-3 max-w-xs">
                  <p>Ensure ethical AI use with our Trust & Safety features</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleWorkspaceClick} 
                    className="bg-gradient-to-r from-violet-600/80 to-violet-700/80 hover:from-violet-600 hover:to-violet-700 text-white border-none group"
                  >
                    <FolderTree className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                    Workspace
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>View and manage all your research projects</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button onClick={() => setShowSignIn(true)} className="bg-gradient-to-r from-violet-600/80 to-violet-700/80 hover:from-violet-600 hover:to-violet-700 text-white border-none">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-3xl mx-auto space-y-8 text-center">
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-balance bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent sm:text-3xl">
              Z Scout - The research assistant you always needed
            </h1>
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
                <Input 
                  type="text" 
                  placeholder="Ask a question or search your documents..." 
                  className="pl-12 pr-24 py-7 text-lg border-0 focus-visible:ring-0 rounded-xl bg-transparent text-white placeholder:text-gray-500" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  <Button 
                    type="button" 
                    size="icon" 
                    variant="ghost" 
                    className="hover:bg-white/5 text-gray-400 hover:text-violet-400 relative"
                    onClick={e => {
                      e.stopPropagation();
                      setShowUploadOptions(!showUploadOptions);
                    }}
                  >
                    <CloudUpload className="h-5 w-5" />
                    {!showUploadOptions && showFeatureTooltip && (
                      <span className="absolute -top-10 whitespace-nowrap bg-violet-900 text-white text-xs py-1 px-2 rounded animate-bounce">
                        Upload documents here
                      </span>
                    )}
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
          
          {/* Featured Research Topics */}
          <div className="pt-8">
            <h3 className="text-lg font-medium text-gray-300 mb-4">Popular Research Topics</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button 
                variant="outline"
                className="bg-white/5 border-gray-700 hover:border-violet-500 hover:bg-white/10"
                onClick={() => showFeaturedResearch("AI in mental health research")}
              >
                <span>AI in Mental Health</span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                className="bg-white/5 border-gray-700 hover:border-violet-500 hover:bg-white/10"
                onClick={() => showFeaturedResearch("Climate change impact analysis")}
              >
                <span>Climate Change</span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                className="bg-white/5 border-gray-700 hover:border-violet-500 hover:bg-white/10"
                onClick={() => showFeaturedResearch("Quantum computing applications")}
              >
                <span>Quantum Computing</span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick Navigation Buttons */}
          <div className="pt-6 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
              <Button 
                className="flex items-center justify-between p-4 h-auto bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-700/30"
                onClick={handleTrustSafetyClick}
              >
                <div className="flex items-center">
                  <div className="bg-indigo-900/70 p-2 rounded-full mr-3">
                    <ShieldCheck className="h-5 w-5 text-indigo-300" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Z-Grid Dashboard</p>
                    <p className="text-xs text-gray-400">Trust & Safety Controls</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-indigo-300" />
              </Button>
              
              <Button 
                className="flex items-center justify-between p-4 h-auto bg-violet-900/40 hover:bg-violet-900/60 border border-violet-700/30"
                onClick={handleWorkspaceClick}
              >
                <div className="flex items-center">
                  <div className="bg-violet-900/70 p-2 rounded-full mr-3">
                    <FolderTree className="h-5 w-5 text-violet-300" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Research Workspace</p>
                    <p className="text-xs text-gray-400">All Your Projects</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-violet-300" />
              </Button>
            </div>
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
