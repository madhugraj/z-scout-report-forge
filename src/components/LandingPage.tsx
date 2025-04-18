
import React, { useState } from 'react';
import { Search, Upload, FileText, BarChart4, Globe, GraduationCap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate processing
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

  const handleUploadClick = () => {
    navigate('/upload');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-accent p-4">
      <div className="w-full max-w-6xl mx-auto text-center space-y-8 animate-fade-in">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
            <span className="mr-1">✨</span> Research Reimagined
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="text-primary">Z-Scout</span> Research Agent
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start with your question — let Research Agent guide your journey through sources, insights, and knowledge.
          </p>
        </div>

        <div className="w-full max-w-3xl mx-auto rounded-xl bg-white shadow-lg p-4 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4 grid grid-cols-3 w-full max-w-sm mx-auto">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Globe size={16} />
                  <span>All</span>
                </TabsTrigger>
                <TabsTrigger value="academic" className="flex items-center gap-2">
                  <GraduationCap size={16} />
                  <span>Academic</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText size={16} />
                  <span>Documents</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <div className="flex items-center gap-2 rounded-lg border bg-background p-1 relative">
                  <Search className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter your research question..."
                    className="flex-1 border-0 bg-transparent px-2 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button 
                    type="submit"
                    size="sm" 
                    className="ml-auto"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span>Generate Report</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="academic" className="mt-0">
                <div className="flex items-center gap-2 rounded-lg border bg-background p-1">
                  <GraduationCap className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search academic sources..."
                    className="flex-1 border-0 bg-transparent px-2 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" size="sm" className="ml-auto">Generate Report</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="mt-0">
                <div className="flex items-center gap-2 rounded-lg border bg-background p-1">
                  <FileText className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search your documents..."
                    className="flex-1 border-0 bg-transparent px-2 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" size="sm" className="ml-auto">Generate Report</Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-center pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleUploadClick}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <Upload size={16} />
                <span>Upload documents or add references</span>
              </Button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-2 p-4">
            <div className="rounded-full bg-primary/10 p-3 mb-2">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium">Comprehensive Reports</h3>
            <p className="text-muted-foreground">Generate fully cited reports with structured sections and traceable sources.</p>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-2 p-4">
            <div className="rounded-full bg-primary/10 p-3 mb-2">
              <BarChart4 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium">Visual Insights</h3>
            <p className="text-muted-foreground">Extract and analyze charts, figures, and tables from your documents.</p>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-2 p-4">
            <div className="rounded-full bg-primary/10 p-3 mb-2">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium">Interactive Research</h3>
            <p className="text-muted-foreground">Ask follow-up questions and explore sources in a conversational interface.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
