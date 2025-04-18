import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Share2, Mail, FileDown, Send,
  FileText, Image, Table, BookOpen, MessageSquare, 
  ChevronRight, ExternalLink, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CitationPopover from './CitationPopover';
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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleExport = () => {
    const content = sections.map(s => `${s.title}\n\n${s.content}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'research-report.txt';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Report downloaded successfully!");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("Research Report: " + (state.query || "AI Impact Analysis"));
    const body = encodeURIComponent("Access the full report here: " + window.location.href);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.success("Email client opened!");
  };

  const pdfViewerContent = (
    <div className="flex flex-col h-full bg-[#1A1F2C] text-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Research Document</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      <div className="flex-1 bg-[#2A2F3C] rounded-lg p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-8 bg-[#3A3F4C] rounded w-3/4"></div>
          <div className="h-4 bg-[#3A3F4C] rounded w-full"></div>
          <div className="h-4 bg-[#3A3F4C] rounded w-5/6"></div>
          <div className="h-4 bg-[#3A3F4C] rounded w-4/5"></div>
          <div className="h-8 bg-[#3A3F4C] rounded w-2/3 mt-8"></div>
          <div className="h-4 bg-[#3A3F4C] rounded w-full"></div>
          <div className="h-4 bg-[#3A3F4C] rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );

  const extractedImagesContent = (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6 bg-[#1A1F2C] text-white rounded-lg">
      <div className="flex flex-col gap-2">
        <div className="aspect-square bg-[#2A2F3C] rounded-lg flex items-center justify-center">
          <div className="w-16 h-16 bg-[#3A3F4C] rounded-lg"></div>
        </div>
        <p className="text-sm text-gray-400">Figure 1: Data Distribution</p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="aspect-square bg-[#2A2F3C] rounded-lg flex items-center justify-center">
          <div className="w-16 h-16 bg-[#3A3F4C] rounded-lg"></div>
        </div>
        <p className="text-sm text-gray-400">Figure 2: Neural Network</p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="aspect-square bg-[#2A2F3C] rounded-lg flex items-center justify-center">
          <div className="w-16 h-16 bg-[#3A3F4C] rounded-lg"></div>
        </div>
        <p className="text-sm text-gray-400">Figure 3: Results Graph</p>
      </div>
    </div>
  );

  const citationsContent = (
    <div className="space-y-4 p-6 bg-[#1A1F2C] text-white rounded-lg">
      {mockReferences.slice(0, 5).map((reference, index) => (
        <div key={index} className="p-4 bg-[#2A2F3C] rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-white">{reference.title}</h4>
            <span className="text-xs bg-[#3A3F4C] px-2 py-1 rounded-full">{reference.year}</span>
          </div>
          <p className="text-sm text-gray-400 mb-2">{reference.authors.join(', ')}</p>
          <p className="text-xs text-gray-500">{reference.journal}</p>
        </div>
      ))}
    </div>
  );

  const tablesContent = (
    <div className="space-y-4 p-6 bg-[#1A1F2C] text-white rounded-lg">
      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-[#2A2F3C]">
            <tr>
              {['Method', 'Accuracy', 'Precision', 'Recall'].map((header) => (
                <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {[
              { method: 'Neural Network', accuracy: '89%', precision: '0.87', recall: '0.91' },
              { method: 'Random Forest', accuracy: '85%', precision: '0.84', recall: '0.86' },
              { method: 'SVM', accuracy: '82%', precision: '0.81', recall: '0.83' },
            ].map((row, i) => (
              <tr key={i} className="bg-[#2A2F3C]">
                <td className="px-4 py-3 text-sm text-white">{row.method}</td>
                <td className="px-4 py-3 text-sm text-white">{row.accuracy}</td>
                <td className="px-4 py-3 text-sm text-white">{row.precision}</td>
                <td className="px-4 py-3 text-sm text-white">{row.recall}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const threadsContent = (
    <div className="space-y-4 p-6 bg-[#1A1F2C] text-white rounded-lg">
      {[
        {
          title: 'Impact of AI on Mental Health Treatment',
          date: '2 days ago',
          content: 'Latest research suggests significant improvements in early diagnosis accuracy.',
          replies: 5
        },
        {
          title: 'Ethical Considerations in AI Healthcare',
          date: '3 days ago',
          content: 'Discussion on privacy concerns and data protection in AI-assisted diagnosis.',
          replies: 3
        },
        {
          title: 'Future of AI in Clinical Practice',
          date: '4 days ago',
          content: 'Exploring potential applications and limitations in clinical settings.',
          replies: 7
        }
      ].map((thread, i) => (
        <div key={i} className="border border-gray-800 rounded-lg overflow-hidden bg-[#2A2F3C]">
          <div className="p-4 border-b border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-white">{thread.title}</h4>
              <span className="text-xs text-gray-400">{thread.date}</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">{thread.content}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{thread.replies} replies</span>
              <Button variant="ghost" size="sm" className="text-xs text-violet-400">
                View Thread <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
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
              PDF Viewer
            </Button>
            <Button
              variant={activeView === 'images' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveView('images')}
            >
              <Image className="h-5 w-5 mr-3" />
              Extracted Images
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
              Structured Tables
            </Button>
            <Button
              variant={activeView === 'threads' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveView('threads')}
            >
              <MessageSquare className="h-5 w-5 mr-3" />
              Threads
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

        <div className="max-w-4xl mx-auto p-8">
          {activeView === 'full-report' && (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {state.query || "Impact of AI on Mental Health Research"}
              </h1>
              
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
          {activeView === 'images' && extractedImagesContent}
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
