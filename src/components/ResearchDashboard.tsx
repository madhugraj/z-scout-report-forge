import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Share2, Mail, FileDown, Send, Users,
  FileText, Image, Table, BookOpen, MessageSquare, 
  ChevronRight, ExternalLink, Search, Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CitationPopover from './CitationPopover';
import { ResearchImagePanel } from './ResearchImagePanel';
import { mockReport, mockReferences } from '@/data/mockData';

interface DashboardState {
  query?: string;
  files?: string[];
  urls?: string[];
  useDocuments?: boolean;
  useWebSources?: boolean;
  useAcademic?: boolean;
  source?: string;
}

const ResearchDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as DashboardState || {};
  
  const [activeView, setActiveView] = useState('full-report');
  const [progress, setProgress] = useState(0);
  const [sections, setSections] = useState<{title: string; content: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [question, setQuestion] = useState('');
  const [report, setReport] = useState('');

  useEffect(() => {
    if (!state.query && !state.files?.length && !state.urls?.length) {
      navigate('/');
      return;
    }
    
    startGeneratingReport(state.query || "Impact of AI on Mental Health Research");
  }, [state, navigate]);

  const startGeneratingReport = (query: string) => {
    setReport('');
    setSections([]);
    setIsGenerating(true);
    setProgress(0);
    
    const totalSteps = 5;
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 800);
    
    setTimeout(() => {
      setSections(prev => [...prev, {
        title: "Executive Summary",
        content: mockReport.executiveSummary
      }]);
      setProgress(20);
    }, 2000);
    
    setTimeout(() => {
      setSections(prev => [...prev, {
        title: "Introduction",
        content: mockReport.introduction
      }]);
      setProgress(40);
    }, 4000);
    
    setTimeout(() => {
      setSections(prev => [...prev, {
        title: "Literature Review",
        content: mockReport.literatureReview
      }]);
      setProgress(60);
    }, 6000);
    
    setTimeout(() => {
      setSections(prev => [...prev, {
        title: "Impact Analysis",
        content: mockReport.impactAnalysis
      }]);
      setProgress(80);
    }, 8000);
    
    setTimeout(() => {
      setSections(prev => [...prev, {
        title: "Conclusions and Recommendations",
        content: mockReport.conclusions
      }]);
      setProgress(100);
      setIsGenerating(false);
      clearInterval(progressInterval);
    }, 10000);
  };

  const handleShareReport = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Report link copied to clipboard!");
  };

  const handleExportReport = () => {
    const content = sections.map(s => `${s.title}\n\n${s.content}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'research-report.txt';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Research report downloaded successfully!");
  };

  const handleEmailReport = () => {
    const subject = encodeURIComponent("Research Report: " + (state.query || "AI Impact Analysis"));
    const body = encodeURIComponent("Access the full research report here: " + window.location.href);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.success("Email client opened with report link!");
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      const imageData = JSON.parse(e.dataTransfer.getData('application/json'));
      toast.success('Image added to report');
      // Here you would handle adding the image to the report content
    } catch (err) {
      toast.error('Failed to add image');
    }
  };

  const handleCollaborate = () => {
    toast.success('Collaboration invite sent!');
  };

  const pdfViewerContent = (
    <div className="flex flex-col h-full bg-[#1A1F2C] text-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Source PDFs</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "Neural Networks in Mental Health", author: "J. Smith", pages: 28 },
          { title: "AI Applications in Therapy", author: "K. Johnson", pages: 42 },
          { title: "Ethics of AI in Healthcare", author: "M. Williams", pages: 36 },
          { title: "Digital Interventions Review", author: "T. Roberts", pages: 54 }
        ].map((pdf, index) => (
          <div key={index} className="bg-[#2A2F3C] p-4 rounded-lg border border-gray-800">
            <div className="flex items-start gap-3">
              <div className="bg-gray-800 p-2 rounded">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white">{pdf.title}</h4>
                <p className="text-sm text-gray-400">{pdf.author} • {pdf.pages} pages</p>
                <Button variant="ghost" size="sm" className="mt-2 text-violet-400">
                  <FileDown className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#1A1F2C] text-white overflow-hidden">
      <div className="w-64 flex flex-col bg-[#1A1F2C] border-r border-gray-800">
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-6">Research View</h1>
          <nav className="space-y-2">
            <Button
              variant={activeView === 'full-report' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveView('full-report')}
            >
              <FileText className="h-5 w-5 mr-3" />
              Full Report
            </Button>
            <Button
              variant={activeView === 'pdf-viewer' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveView('pdf-viewer')}
            >
              <BookOpen className="h-5 w-5 mr-3" />
              Source PDFs
            </Button>
            <Button
              variant={activeView === 'images' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveView('images')}
            >
              <Image className="h-5 w-5 mr-3" />
              Research Images
            </Button>
            <Button
              variant={activeView === 'citations' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveView('citations')}
            >
              <FileText className="h-5 w-5 mr-3" />
              Citations
            </Button>
            <Button
              variant={activeView === 'tables' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveView('tables')}
            >
              <Table className="h-5 w-5 mr-3" />
              Data Tables
            </Button>
            <Button
              variant={activeView === 'threads' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveView('threads')}
            >
              <MessageSquare className="h-5 w-5 mr-3" />
              Discussions
            </Button>
          </nav>
        </div>
      </div>

      <div className="flex-1 bg-white overflow-auto">
        {isGenerating && (
          <div className="bg-violet-100 p-4 flex items-center gap-2 text-violet-700">
            <div className="animate-spin h-4 w-4 border-2 border-violet-700 border-t-transparent rounded-full" />
            Generating comprehensive research report...
          </div>
        )}

        <div 
          className="max-w-4xl mx-auto p-8"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleImageDrop}
        >
          {activeView === 'full-report' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  {state.query || "Impact of AI on Mental Health Research"}
                </h1>
                <div className="flex gap-2">
                  <Button onClick={handleCollaborate} variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Collaborate
                  </Button>
                  <Button onClick={handleShareReport} variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button onClick={handleExportReport} variant="outline" size="sm">
                    <FileDown className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={handleEmailReport} variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
              
              {sections.map((section, index) => (
                <div key={index} className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">{section.title}</h2>
                  <div className="prose max-w-none">
                    {section.content.split('\n\n').map((paragraph, idx) => {
                      const citationRegex = /\[(\d+)\]/g;
                      const parts = [];
                      let lastIndex = 0;
                      let match;
                      
                      while ((match = citationRegex.exec(paragraph)) !== null) {
                        parts.push(paragraph.substring(lastIndex, match.index));
                        const citationNumber = parseInt(match[1]);
                        parts.push(
                          <CitationPopover 
                            key={`${idx}-${citationNumber}`}
                            reference={mockReferences[citationNumber - 1] || mockReferences[0]} 
                            index={citationNumber - 1}
                            inline
                          />
                        );
                        lastIndex = match.index + match[0].length;
                      }
                      parts.push(paragraph.substring(lastIndex));
                      return (
                        <p key={idx} className="text-gray-700 mb-4">
                          {parts}
                        </p>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}

          {activeView === 'pdf-viewer' && pdfViewerContent}
          {activeView === 'images' && <ResearchImagePanel />}
          {activeView === 'citations' && citationsContent}
          {activeView === 'tables' && tablesContent}
          {activeView === 'threads' && threadsContent}
        </div>
      </div>

      <div className="w-80 bg-[#1A1F2C] border-l border-gray-800 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Follow-up Questions</h2>
          <div className="space-y-4 mb-6">
            <Button variant="ghost" className="w-full justify-start text-left">
              What are the most promising AI applications in mental health?
            </Button>
            <Button variant="ghost" className="w-full justify-start text-left">
              Compare effectiveness of AI vs. traditional therapy approaches
            </Button>
            <Button variant="ghost" className="w-full justify-start text-left">
              What ethical concerns have been raised in recent studies?
            </Button>
          </div>
          
          <div className="mt-auto pt-4">
            <div className="space-y-4">
              <h3 className="font-medium">Ask a question</h3>
              <div className="flex gap-2">
                <Input 
                  placeholder="Type your question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
                <Button size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchDashboard;
