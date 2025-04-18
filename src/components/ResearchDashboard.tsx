
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, Image, Table, BookOpen, MessageSquare, 
  ChevronRight, ExternalLink, Search, Send 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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

  // Mock data for different views
  const pdfViewerContent = (
    <div className="flex flex-col h-full">
      <div className="bg-violet-100 p-4 mb-4 rounded-lg">
        <h3 className="font-semibold text-violet-800">Document Viewer</h3>
        <p className="text-sm text-violet-700">This is a preview of the PDF viewer. In a real implementation, this would show the actual document.</p>
      </div>
      <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">PDF document would be rendered here</p>
          <Button className="mt-4" variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in full view
          </Button>
        </div>
      </div>
    </div>
  );

  const extractedImagesContent = (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="h-32 bg-gray-200 flex items-center justify-center">
            <Image className="h-8 w-8 text-gray-400" />
          </div>
          <div className="p-2">
            <p className="text-xs text-gray-600">Image {i + 1}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const citationsContent = (
    <div className="space-y-4 p-4">
      <div className="bg-violet-100 p-4 rounded-lg">
        <h3 className="font-semibold text-violet-800">Citations</h3>
        <p className="text-sm text-violet-700">References extracted from the research materials.</p>
      </div>
      {mockReferences.slice(0, 5).map((reference, index) => (
        <div key={index} className="p-4 border rounded-lg bg-white shadow-sm">
          <div className="flex justify-between items-start">
            <h4 className="font-medium">{reference.title}</h4>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{reference.year}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{reference.authors.join(', ')}</p>
          <p className="text-xs text-gray-500 mt-2">{reference.publication}</p>
        </div>
      ))}
    </div>
  );

  const tablesContent = (
    <div className="space-y-4 p-4">
      <div className="bg-violet-100 p-4 rounded-lg">
        <h3 className="font-semibold text-violet-800">Data Tables</h3>
        <p className="text-sm text-violet-700">Structured tables extracted from research materials.</p>
      </div>
      <div className="overflow-auto border rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Study</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Participants</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Method</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-3 text-sm text-gray-900">Study {i + 1}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{Math.floor(Math.random() * 500)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{['Survey', 'Interview', 'Experiment', 'Case Study'][i]}</td>
                <td className="px-4 py-3 text-sm text-gray-900">p {Math.random().toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const threadsContent = (
    <div className="space-y-4 p-4">
      <div className="bg-violet-100 p-4 rounded-lg">
        <h3 className="font-semibold text-violet-800">Discussion Threads</h3>
        <p className="text-sm text-violet-700">Related discussions and insights from various sources.</p>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="bg-gray-50 py-3 px-4 border-b">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-900">Thread topic {i + 1}</h4>
              <span className="text-xs text-gray-500">2 days ago</span>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-700 mb-3">This is a sample discussion related to the research topic, highlighting key insights and perspectives.</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{3 + i} replies</span>
              <Button variant="ghost" size="sm" className="text-xs">
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
      {/* Left Sidebar */}
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

      {/* Main Content Area */}
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

      {/* Right Sidebar - Follow-up Questions */}
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
