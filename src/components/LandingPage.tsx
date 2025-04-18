import React, { useState } from 'react';
import { Search, Globe, GraduationCap, Mic, CloudUpload, FolderUp, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import SignInDialog from './SignInDialog';
import { cn } from '@/lib/utils';

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Z-Scout</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Pro
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              About
            </Button>
            <Button onClick={() => setShowSignIn(true)}>Sign In</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-2xl">
              The research assistant you always needed
            </h1>
            <p className="max-w-2xl mx-auto text-balance text-xs font-thin text-gray-900">
              Just upload documents or reference live links, or ask, and get intelligent, cited answers grounded in your documents and trusted sources.
            </p>
          </div>

          <div className="relative">
            <div
              className={cn(
                "absolute right-14 top-full mt-2 z-50 w-64 rounded-lg border bg-white shadow-lg",
                showUploadOptions ? "block" : "hidden"
              )}
            >
              <div className="p-1">
                <Button
                  variant="ghost"
                  className="w-full flex items-center gap-3 p-4 h-auto hover:bg-accent justify-start"
                  onClick={() => handleUpload('drive')}
                >
                  <HardDrive className="h-5 w-5 text-blue-500" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Cloud Storage</span>
                    <span className="text-xs text-muted-foreground">Access your cloud documents</span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full flex items-center gap-3 p-4 h-auto hover:bg-accent justify-start"
                  onClick={() => handleUpload('computer')}
                >
                  <FolderUp className="h-5 w-5 text-orange-500" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Local Files</span>
                    <span className="text-xs text-muted-foreground">PDF, Word, or text files</span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full flex items-center gap-3 p-4 h-auto hover:bg-accent justify-start"
                  onClick={() => handleUpload('url')}
                >
                  <Globe className="h-5 w-5 text-green-500" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Web Reference</span>
                    <span className="text-xs text-muted-foreground">Import from web pages</span>
                  </div>
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="w-full" onClick={() => setShowUploadOptions(false)}>
              <div className="relative rounded-xl border bg-background shadow-lg transition-colors focus-within:border-primary">
                <Input
                  type="text"
                  placeholder="Ask a question or search your documents..."
                  className="pl-12 pr-24 py-7 text-lg border-0 focus-visible:ring-0 rounded-xl"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="hover:bg-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUploadOptions(!showUploadOptions);
                    }}
                  >
                    <CloudUpload className="h-5 w-5" />
                  </Button>
                  <Button type="button" size="icon" disabled={isGenerating}>
                    <Mic className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm" className="rounded-full">
                  <Search className="h-4 w-4 mr-2" />
                  Research
                </Button>
                <Button variant="outline" size="sm" className="rounded-full">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Academic Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>© 2025 Z-Scout</span>
            <Button variant="link" size="sm" className="text-muted-foreground">Terms</Button>
            <Button variant="link" size="sm" className="text-muted-foreground">Privacy</Button>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">English</Button>
          </div>
        </div>
      </footer>

      <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
    </div>
  );
};

export default LandingPage;
