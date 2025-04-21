import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Share2, Mail, FileDown, Send, Users,
  FileText, Image, Table, BookOpen, MessageSquare, 
  ChevronRight, ExternalLink, Search, Edit, Download, Maximize2, Minimize2, X,
  FolderTree, ArrowLeft, Lock, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CitationPopover from './CitationPopover';
import { ResearchImagePanel } from './ResearchImagePanel';
import CollaborationWindow from './CollaborationWindow';
import { mockReport, mockReferences, mockImages, topicReports } from '@/data/mockData';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import PDFViewerDialog from './PDFViewerDialog';
import EncryptionDialog from './EncryptionDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const topicPDFs: Record<string, { id: string; title: string; author: string; pages: number; url: string }[]> = {
  "How is AI transforming mental health research and interventions? Provide an overview and significant trends.": [
    {
      id: "pdf1",
      title: "Neural Networks in Mental Health",
      author: "J. Smith",
      pages: 28,
      url: "https://www.africau.edu/images/default/sample.pdf"
    },
    {
      id: "pdf2",
      title: "AI Applications in Therapy",
      author: "K. Johnson",
      pages: 42,
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    }
  ],
  "Summarize the latest findings on climate change impact analysis, focusing on risk factors and adaptation.": [
    {
      id: "pdf1",
      title: "Global Climate Change 2025",
      author: "A. Martinez",
      pages: 36,
      url: "https://www.africau.edu/images/default/sample.pdf"
    },
    {
      id: "pdf2",
      title: "Sea Level Rises",
      author: "C. Thompson",
      pages: 40,
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    }
  ],
  "Explain key applications and advancements in quantum computing and their industry adoption.": [
    {
      id: "pdf1",
      title: "Quantum Computing Applications",
      author: "L. Zhang",
      pages: 30,
      url: "https://www.africau.edu/images/default/sample.pdf"
    },
    {
      id: "pdf2",
      title: "Quantum Cryptography",
      author: "D. Fischer",
      pages: 38,
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    }
  ]
};

const topicImages: Record<string, { id: string; title: string; url: string; source: string }[]> = {
  "How is AI transforming mental health research and interventions? Provide an overview and significant trends.": [
    {
      id: "ai1",
      title: "AI Chatbot Interface",
      url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      source: "Digital Psychology Review"
    }
  ],
  "Summarize the latest findings on climate change impact analysis, focusing on risk factors and adaptation.": [
    {
      id: "cl1",
      title: "Arctic Ice Recession",
      url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      source: "Environmental Science Journal"
    }
  ],
  "Explain key applications and advancements in quantum computing and their industry adoption.": [
    {
      id: "qc1",
      title: "Quantum Logic Diagram",
      url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
      source: "Quantum Computing Journal"
    }
  ]
};

const topicCitations: Record<string, typeof mockReferences> = {
  "How is AI transforming mental health research and interventions? Provide an overview and significant trends.": [
    {
      title: "Artificial Intelligence in Mental Health Care",
      authors: ["J. Smith", "L. Chen"],
      year: 2024,
      journal: "AI Psychiatry",
      url: "https://example.com/ai-mental-health",
      doi: "10.1001/aipsych.2024.001",
      abstract: "AI is reshaping diagnosis and treatment in mental health."
    }
  ],
  "Summarize the latest findings on climate change impact analysis, focusing on risk factors and adaptation.": [
    {
      title: "Climate Change Impacts: 2025 Review",
      authors: ["A. Martinez", "R. Gupta"],
      year: 2025,
      journal: "Climate Journal",
      url: "https://example.com/climate2025",
      doi: "10.1002/climate.2025.001",
      abstract: "A comprehensive analysis of climate risk factors and adaptation."
    }
  ],
  "Explain key applications and advancements in quantum computing and their industry adoption.": [
    {
      title: "Quantum Algorithms and Industry Adoption",
      authors: ["L. Zhang", "D. Fischer"],
      year: 2024,
      journal: "Quantum Science",
      url: "https://example.com/quantum-industry",
      doi: "10.1007/qc.2024.005",
      abstract: "Industry trends and applications of quantum computing."
    }
  ]
};

const ResearchDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { query?: string; files?: string[]; urls?: string[]; source?: string } || {};

  const [activeView, setActiveView] = useState('full-report');
  const [progress, setProgress] = useState(0);
  const [sections, setSections] = useState<{title: string; content: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [question, setQuestion] = useState('');
  const [report, setReport] = useState('');
  const [activeSideView, setActiveSideView] = useState<'pdf-viewer' | 'images' | 'tables' | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [showCollaborator, setShowCollaborator] = useState(false);
  const [collaborationMode, setCollaborationMode] = useState<'drawer' | 'panel'>('drawer');
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedPdfForView, setSelectedPdfForView] = useState<{title: string; url: string} | null>(null);
  const [showEncryptionDialog, setShowEncryptionDialog] = useState(false);
  const [generationSteps, setGenerationSteps] = useState<string[]>([]);
  const [topicPDFList, setTopicPDFList] = useState<{ id: string; title: string; author: string; pages: number; url: string }[]>([]);
  const [topicImageList, setTopicImageList] = useState<{ id: string; title: string; url: string; source: string }[]>([]);
  const [topicCitationList, setTopicCitationList] = useState<typeof mockReferences>([]);

  useEffect(() => {
    if (!state.query && !state.files?.length && !state.urls?.length) {
      navigate('/');
      return;
    }
    
    let _query = state.query || "Impact of AI on Mental Health Research";
    if (topicPDFs[_query]) {
      setTopicPDFList(topicPDFs[_query]);
      setTopicImageList(topicImages[_query]);
      setTopicCitationList(topicCitations[_query]);
    } else {
      setTopicPDFList([
        { id: "pdf1", title: "Neural Networks in Mental Health", author: "J. Smith", pages: 28, url: "https://www.africau.edu/images/default/sample.pdf" }
      ]);
      setTopicImageList([]);
      setTopicCitationList(mockReferences);
    }
    
    startGeneratingReport(state.query || "Impact of AI on Mental Health Research");
  }, [state, navigate]);

  const startGeneratingReport = (query: string) => {
    setReport('');
    setSections([]);
    setIsGenerating(true);
    setProgress(0);
    setGenerationSteps([]);
    
    const topicReport = topicReports[query];
    
    if (topicReport) {
      simulateRealisticGeneration(topicReport);
    } else {
      simulateRealisticGeneration({
        title: query,
        sections: [
          { title: "Executive Summary", content: mockReport.executiveSummary },
          { title: "Introduction", content: mockReport.introduction },
          { title: "Literature Review", content: mockReport.literatureReview },
          { title: "Impact Analysis", content: mockReport.impactAnalysis },
          { title: "Conclusions and Recommendations", content: mockReport.conclusions }
        ]
      });
    }
  };

  const simulateRealisticGeneration = (reportData: { title: string, sections: { title: string, content: string }[] }) => {
    const generationSteps = [
      "Analyzing research question...",
      "Retrieving relevant academic sources...",
      "Evaluating source credibility and relevance...",
      "Extracting key information from sources...",
      "Identifying major themes and patterns...",
      "Synthesizing findings across multiple sources...",
      "Generating comprehensive analysis...",
      "Creating executive summary...",
      "Adding citations and references...",
      "Formatting final report..."
    ];
    
    setGenerationSteps([generationSteps[0]]);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 5;
      });
    }, 800);
    
    let currentStep = 0;
    const stepInterval = setInterval(() => {
      currentStep++;
      
      if (currentStep < generationSteps.length) {
        setGenerationSteps(prev => [...prev, generationSteps[currentStep]]);
      } else {
        clearInterval(stepInterval);
      }
    }, 1500);
    
    let sectionIndex = 0;
    const sectionInterval = setInterval(() => {
      if (sectionIndex < reportData.sections.length) {
        setSections(prevSections => {
          const updatedSections = [...prevSections];
          const section = reportData.sections[sectionIndex];
          updatedSections[sectionIndex] = section;
          
          return updatedSections;
        });
        
        setProgress(Math.min(95, (sectionIndex + 1) / reportData.sections.length * 90));
        sectionIndex++;
      } else {
        clearInterval(sectionInterval);
        clearInterval(progressInterval);
        setProgress(100);
        setIsGenerating(false);
        
        setTimeout(() => {
          setGenerationSteps(prev => [...prev, "Report generation complete!"]);
        }, 1000);
      }
    }, reportData.sections.length <= 3 ? 2000 : 3000);
  };

  const handleShareReport = () => {
    setShowEncryptionDialog(true);
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

  const handleSecureExport = () => {
    setShowEncryptionDialog(true);
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>, sectionIndex: number) => {
    e.preventDefault();
    setDropTargetIndex(null);
    try {
      const imageData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      setSections(prevSections => {
        const updatedSections = [...prevSections];
        const section = updatedSections[sectionIndex];
        const imageHtml = `<div class="my-4 w-full max-w-md mx-auto">
          <img src="${imageData.url}" alt="${imageData.title}" class="w-full rounded-lg shadow-md" />
          <p class="text-sm text-gray-500 mt-1">${imageData.title} • ${imageData.source}</p>
        </div>`;
        
        updatedSections[sectionIndex] = {
          ...section,
          content: section.content + '\n\n' + imageHtml
        };
        
        return updatedSections;
      });
      
      toast.success(`Image "${imageData.title}" added to ${sections[sectionIndex].title}`);
    } catch (err) {
      toast.error('Failed to add image');
    }
  };
  
  const handleSectionDragOver = (e: React.DragEvent<HTMLDivElement>, sectionIndex: number) => {
    e.preventDefault();
    setDropTargetIndex(sectionIndex);
  };
  
  const handleSectionDragLeave = () => {
    setDropTargetIndex(null);
  };

  const pdfViewerContent = (
    <div className="flex flex-col h-full bg-[#1A1F2C] text-white p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Source PDFs</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setActiveSideView(null)}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 overflow-auto">
        {topicPDFList.map((pdf, index) => (
          <div 
            key={index} 
            className={`bg-[#2A2F3C] p-3 rounded-lg border ${selectedPdf === pdf.id ? 'border-violet-500' : 'border-gray-800'} cursor-pointer hover:border-violet-400 transition-colors`}
            onClick={() => setSelectedPdf(pdf.id)}
          >
            <div className="flex items-start gap-2">
              <div className="bg-gray-800 p-1.5 rounded">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white text-sm">{pdf.title}</h4>
                <p className="text-xs text-gray-400">{pdf.author} • {pdf.pages} pages</p>
                <div className="flex mt-1 gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-violet-400 h-7 text-xs px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPdfForView({ title: pdf.title, url: pdf.url });
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-violet-400 h-7 text-xs px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      const a = document.createElement('a');
                      a.href = pdf.url;
                      a.download = pdf.title.replace(/\s+/g, '_') + '.pdf';
                      a.click();
                    }}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
            {selectedPdf === pdf.id && (
              <div className="mt-3 bg-gray-900 rounded-lg overflow-hidden relative">
                <div className="absolute top-2 right-2 z-10 flex gap-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6 bg-gray-800 border-gray-700"
                    onClick={() => setIsFullScreen(!isFullScreen)}
                  >
                    {isFullScreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                  </Button>
                </div>
                <iframe 
                  src={pdf.url} 
                  className={`w-full ${isFullScreen ? 'h-[calc(100vh-400px)]' : 'h-80'}`}
                  title={pdf.title}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const citationsContent = (
    <div className="flex flex-col h-full bg-[#1A1F2C] text-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Citations</h3>
      </div>
      <div className="space-y-3">
        {topicCitationList.map((reference, index) => (
          <CitationPopover 
            key={index}
            reference={reference}
            index={index}
          />
        ))}
      </div>
    </div>
  );

  const tablesContent = (
    <div className="flex flex-col h-full bg-[#1A1F2C] text-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Data Tables</h3>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {[
          { title: "AI Adoption Rates by Sector", rows: 12, columns: 5 },
          { title: "Mental Health Indicators Study", rows: 20, columns: 8 },
          { title: "Treatment Effectiveness Comparison", rows: 15, columns: 6 },
          { title: "Clinical Trial Results Summary", rows: 32, columns: 10 }
        ].map((table, index) => (
          <div key={index} className="bg-[#2A2F3C] p-4 rounded-lg border border-gray-800">
            <div className="flex items-start gap-3">
              <div className="bg-gray-800 p-2 rounded">
                <Table className="h-8 w-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white">{table.title}</h4>
                <p className="text-sm text-gray-400">{table.rows} rows • {table.columns} columns</p>
                <Button variant="ghost" size="sm" className="mt-2 text-violet-400">
                  <FileDown className="h-4 w-4 mr-2" />
                  Export Table
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const threadsContent = (
    <div className="flex flex-col h-full bg-[#1A1F2C] text-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Discussion Threads</h3>
      </div>
      <div className="space-y-4">
        {[
          { title: "Ethical considerations of AI in mental health", replies: 12, lastUpdated: "2 hours ago" },
          { title: "Limitations of current research methods", replies: 8, lastUpdated: "1 day ago" },
          { title: "Potential future applications to explore", replies: 15, lastUpdated: "3 days ago" },
          { title: "Data privacy concerns with AI therapy", replies: 22, lastUpdated: "1 week ago" }
        ].map((thread, index) => (
          <div key={index} className="bg-[#2A2F3C] p-4 rounded-lg border border-gray-800">
            <div className="flex items-start gap-3">
              <div className="bg-gray-800 p-2 rounded">
                <MessageSquare className="h-6 w-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white">{thread.title}</h4>
                <p className="text-sm text-gray-400">{thread.replies} replies • Last updated {thread.lastUpdated}</p>
                <Button variant="ghost" size="sm" className="mt-2 text-violet-400">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Join Discussion
                </Button>
              </div>
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full mt-4 text-white">
          <MessageSquare className="h-4 w-4 mr-2" />
          Start New Discussion
        </Button>
      </div>
    </div>
  );

  const renderSidePanel = () => {
    switch (activeSideView) {
      case 'pdf-viewer':
        return pdfViewerContent;
      case 'images':
        return <ResearchImagePanel />;
      case 'tables':
        return tablesContent;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#1A1F2C] via-[#1E2330] to-[#1A1F2C] text-white overflow-hidden">
      <div className="w-64 flex flex-col border-r border-gray-800/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent">Research View</h1>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="w-full justify-start mb-4 hover:bg-white/5 text-gray-400 hover:text-white group transition-all py-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2 text-violet-400 group-hover:text-violet-300" />
            Back to Home
          </Button>
          
          <nav className="space-y-2">
            <Button
              variant={activeView === 'full-report' ? 'secondary' : 'ghost'}
              className="w-full justify-start hover:bg-white/5 transition-colors"
              onClick={() => setActiveView('full-report')}
            >
              <FileText className="h-5 w-5 mr-3 text-violet-400" />
              Full Report
            </Button>
            <Button
              variant={activeView === 'pdf-viewer' ? 'secondary' : 'ghost'}
              className="w-full justify-start hover:bg-white/5 transition-colors"
              onClick={() => setActiveView('pdf-viewer')}
            >
              <BookOpen className="h-5 w-5 mr-3 text-violet-400" />
              Source PDFs
            </Button>
            <Button
              variant={activeView === 'images' ? 'secondary' : 'ghost'}
              className="w-full justify-start hover:bg-white/5 transition-colors"
              onClick={() => setActiveView('images')}
            >
              <Image className="h-5 w-5 mr-3 text-violet-400" />
              Research Images
            </Button>
            <Button
              variant={activeView === 'citations' ? 'secondary' : 'ghost'}
              className="w-full justify-start hover:bg-white/5 transition-colors"
              onClick={() => setActiveView('citations')}
            >
              <FileText className="h-5 w-5 mr-3 text-violet-400" />
              Citations
            </Button>
            <Button
              variant={activeView === 'tables' ? 'secondary' : 'ghost'}
              className="w-full justify-start hover:bg-white/5 transition-colors"
              onClick={() => setActiveView('tables')}
            >
              <Table className="h-5 w-5 mr-3 text-violet-400" />
              Data Tables
            </Button>
            <Button
              variant={activeView === 'threads' ? 'secondary' : 'ghost'}
              className="w-full justify-start hover:bg-white/5 transition-colors"
              onClick={() => setActiveView('threads')}
            >
              <MessageSquare className="h-5 w-5 mr-3 text-violet-400" />
              Discussions
            </Button>
          </nav>
        </div>
        <div className="mt-auto p-4 border-t border-gray-800/50">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5 group transition-all py-4"
            onClick={() => navigate('/workspace')}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <FolderTree className="h-5 w-5 text-violet-400 group-hover:text-violet-300 mr-3" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Research Workspace</span>
                  <span className="text-xs text-gray-500">View all research projects</span>
                </div>
              </div>
              <div className="h-6">
                <img src="/lovable-uploads/9e72d009-982d-437d-9caa-9403a11018b8.png" alt="Yavar Logo" className="h-full" />
              </div>
            </div>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 relative flex-col">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={collaborationMode === 'panel' ? 65 : 100} minSize={50}>
            <div className="bg-white overflow-auto h-full">
              {isGenerating && (
                <div className="bg-violet-100 p-6 text-violet-700 sticky top-0 z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="animate-spin h-5 w-5 border-2 border-violet-700 border-t-transparent rounded-full" />
                    <h3 className="font-medium">Generating comprehensive research report...</h3>
                  </div>
                  
                  <div className="w-full bg-violet-200 rounded-full h-2 mb-3">
                    <div 
                      className="bg-violet-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-sm font-medium space-y-1 max-h-24 overflow-y-auto">
                    {generationSteps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {index === generationSteps.length - 1 ? (
                          <div className="animate-pulse h-2 w-2 bg-violet-700 rounded-full"></div>
                        ) : (
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        )}
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="max-w-4xl mx-auto p-8 pb-32">
                {activeView === 'full-report' && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {state.query || "Impact of AI on Mental Health Research"}
                      </h1>
                      <div className="flex items-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => setActiveSideView(prev => prev === 'pdf-viewer' ? null : 'pdf-viewer')}
                                className={`h-8 w-8 ${activeSideView === 'pdf-viewer' ? 'bg-violet-100' : ''}`}
                                aria-label="View PDFs"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>View PDFs</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => setActiveSideView(prev => prev === 'images' ? null : 'images')}
                                className={`h-8 w-8 ${activeSideView === 'images' ? 'bg-violet-100' : ''}`}
                                aria-label="View Images"
                              >
                                <Image className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>View Images</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => setActiveSideView(prev => prev === 'tables' ? null : 'tables')}
                                className={`h-8 w-8 ${activeSideView === 'tables' ? 'bg-violet-100' : ''}`}
                                aria-label="View Tables"
                              >
                                <Table className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>View Tables</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8"
                              aria-label="Export Options"
                            >
                              <FileDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56 bg-[#1A1F2C] text-white border border-gray-800">
                            <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-800" />
                            <DropdownMenuGroup>
                              <DropdownMenuItem onClick={handleExportReport} className="hover:bg-white/10 focus:bg-white/10">
                                <FileDown className="mr-2 h-4 w-4" />
                                <span>Export as PDF</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={handleEmailReport} className="hover:bg-white/10 focus:bg-white/10">
                                <Mail className="mr-2 h-4 w-4" />
                                <span>Email Report</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-800" />
                              <DropdownMenuItem onClick={handleSecureExport} className="hover:bg-white/10 focus:bg-white/10">
                                <Lock className
