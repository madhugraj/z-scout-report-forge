import React, { useState } from 'react';
import { Search, Upload, Globe, GraduationCap, FileText, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import SignInDialog from './SignInDialog';

const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b">
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              What do you want to know?
            </h1>
            <p className="text-xl text-muted-foreground">
              Ask anything. Get comprehensive research insights instantly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="relative">
              <div className="relative rounded-xl border bg-background shadow-sm transition-colors focus-within:border-primary">
                <Input
                  type="text"
                  placeholder="Ask anything..."
                  className="pl-12 pr-16 py-6 text-lg border-0 focus-visible:ring-0 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  disabled={isGenerating}
                >
                  <Mic className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm" className="rounded-full">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" size="sm" className="rounded-full">
                  <Globe className="h-4 w-4 mr-2" />
                  Research
                </Button>
                <Button variant="outline" size="sm" className="rounded-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Documents
                </Button>
              </div>
            </div>
          </form>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <Button variant="link" size="sm" className="text-muted-foreground">
              <GraduationCap className="h-4 w-4 mr-2" />
              Academic Search
            </Button>
            <span>•</span>
            <Button variant="link" size="sm" className="text-muted-foreground">
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t">
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

      {/* Sign In Dialog */}
      <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
    </div>
  );
};

export default LandingPage;
