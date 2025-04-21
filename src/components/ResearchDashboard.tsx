
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
  const [topicSpecificData, setTopicSpecificData] = useState<{
    pdfs: {id: string; title: string; author: string; pages: number; url: string}[];
    tables: {title: string; rows: number; columns: number}[];
    images: {id: string; title: string; url: string; source: string}[];
    threads: {title: string; replies: number; lastUpdated: string}[];
  }>({
    pdfs: [],
    tables: [],
    images: [],
    threads: []
  });

  useEffect(() => {
    if (!state.query && !state.files?.length && !state.urls?.length) {
      navigate('/');
      return;
    }
    
    startGeneratingReport(state.query || "Impact of AI on Mental Health Research");
    updateTopicSpecificData(state.query || "Impact of AI on Mental Health Research");
  }, [state, navigate]);

  const updateTopicSpecificData = (query: string) => {
    // Set default data
    let topicData = {
      pdfs: [],
      tables: [],
      images: [],
      threads: []
    };

    // Define data for each topic
    if (query.includes("AI") && query.includes("mental health")) {
      topicData = {
        pdfs: [
          { id: "pdf1", title: "Neural Networks in Mental Health Treatment", author: "J. Smith et al.", pages: 28, url: "https://www.africau.edu/images/default/sample.pdf" },
          { id: "pdf2", title: "AI Applications in Therapeutic Interventions", author: "K. Johnson & L. Chen", pages: 42, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
          { id: "pdf3", title: "Ethics of AI in Psychological Care", author: "M. Williams", pages: 36, url: "https://www.africau.edu/images/default/sample.pdf" },
          { id: "pdf4", title: "Machine Learning for Mental Health Diagnosis", author: "T. Roberts & P. Singh", pages: 54, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
        ],
        tables: [
          { title: "AI Adoption Rates in Mental Health Clinics (2023-2025)", rows: 15, columns: 5 },
          { title: "Therapeutic Outcomes Comparison: AI vs. Traditional Methods", rows: 20, columns: 8 },
          { title: "Patient Satisfaction Metrics for AI-Assisted Therapy", rows: 18, columns: 6 },
          { title: "Cost-Efficiency Analysis of AI Mental Health Interventions", rows: 32, columns: 7 }
        ],
        images: [
          { id: "img1", title: "Neural Network Architecture for Mood Prediction", url: "/lovable-uploads/9e72d009-982d-437d-9caa-9403a11018b8.png", source: "Journal of AI in Healthcare" },
          { id: "img2", title: "AI Chatbot Interface for Mental Health Support", url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b", source: "Digital Psychology Review" },
          { id: "img3", title: "Brain Activity Patterns During AI-Assisted Therapy", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5", source: "Neuropsychology Today" },
          { id: "img4", title: "Sentiment Analysis Dashboard for Patient Progress", url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6", source: "AI Medical Journal" }
        ],
        threads: [
          { title: "Ethical considerations of AI in mental health treatment", replies: 12, lastUpdated: "2 hours ago" },
          { title: "Privacy concerns with patient data in AI systems", replies: 8, lastUpdated: "1 day ago" },
          { title: "Integration challenges in clinical settings", replies: 15, lastUpdated: "3 days ago" },
          { title: "Comparative effectiveness of different AI approaches", replies: 22, lastUpdated: "1 week ago" }
        ]
      };
    } else if (query.includes("climate change")) {
      topicData = {
        pdfs: [
          { id: "pdf1", title: "Global Climate Change Mitigation Strategies", author: "A. Martinez et al.", pages: 42, url: "https://www.africau.edu/images/default/sample.pdf" },
          { id: "pdf2", title: "Sea Level Rise Projections 2025-2100", author: "C. Thompson & J. Wong", pages: 38, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
          { id: "pdf3", title: "Economic Impact of Climate Change on Agriculture", author: "R. Gupta", pages: 56, url: "https://www.africau.edu/images/default/sample.pdf" },
          { id: "pdf4", title: "Carbon Capture Technologies: A Comprehensive Review", author: "S. Lee & B. Patel", pages: 64, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
        ],
        tables: [
          { title: "Global Temperature Increase by Region (2000-2025)", rows: 25, columns: 6 },
          { title: "Greenhouse Gas Emissions by Sector and Country", rows: 30, columns: 8 },
          { title: "Climate Adaptation Funding Allocation", rows: 22, columns: 5 },
          { title: "Projected Species Loss Due to Climate Change", rows: 40, columns: 7 }
        ],
        images: [
          { id: "img1", title: "Arctic Ice Sheet Recession (1980-2025)", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085", source: "Environmental Science Journal" },
          { id: "img2", title: "Global Temperature Anomaly Map", url: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7", source: "IPCC Report 2025" },
          { id: "img3", title: "Flooding Impact in Coastal Communities", url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b", source: "Climate Disasters Archive" },
          { id: "img4", title: "Sustainable Energy Transition Models", url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6", source: "Renewable Energy Foundation" }
        ],
        threads: [
          { title: "Effectiveness of current carbon reduction policies", replies: 18, lastUpdated: "5 hours ago" },
          { title: "Social equity in climate change adaptation", replies: 14, lastUpdated: "2 days ago" },
          { title: "Technological breakthroughs needed for 1.5°C target", replies: 26, lastUpdated: "1 week ago" },
          { title: "Climate refugee crisis projections and solutions", replies: 32, lastUpdated: "2 weeks ago" }
        ]
      };
    } else if (query.includes("quantum computing")) {
      topicData = {
        pdfs: [
          { id: "pdf1", title: "Quantum Algorithm Advances for Optimization Problems", author: "L. Zhang et al.", pages: 34, url: "https://www.africau.edu/images/default/sample.pdf" },
          { id: "pdf2", title: "Quantum Supremacy: Practical Applications", author: "D. Fischer & M. Gupta", pages: 47, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
          { id: "pdf3", title: "Error Correction in Quantum Computing Systems", author: "E. Nakamura", pages: 52, url: "https://www.africau.edu/images/default/sample.pdf" },
          { id: "pdf4", title: "Quantum Computing for Drug Discovery", author: "H. Anderson & V. Rodriguez", pages: 58, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
        ],
        tables: [
          { title: "Quantum Computing Market Growth by Industry (2022-2025)", rows: 18, columns: 5 },
          { title: "Qubit Stability Comparison Across Different Quantum Architectures", rows: 24, columns: 9 },
          { title: "Quantum vs. Classical Computing Performance Benchmarks", rows: 30, columns: 7 },
          { title: "Quantum Encryption Standards Development Timeline", rows: 22, columns: 6 }
        ],
        images: [
          { id: "img1", title: "Quantum Circuit Diagram for Shor's Algorithm", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5", source: "Quantum Computing Journal" },
          { id: "img2", title: "Superconducting Quantum Processor Architecture", url: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7", source: "IBM Quantum Research" },
          { id: "img3", title: "Quantum Entanglement Visualization", url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6", source: "Physics Today" },
          { id: "img4", title: "Quantum Cloud Services Infrastructure", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085", source: "Quantum Industry Report" }
        ],
        threads: [
          { title: "Post-quantum cryptography implementation challenges", replies: 16, lastUpdated: "3 hours ago" },
          { title: "Commercial viability of quantum computing applications", replies: 22, lastUpdated: "1 day ago" },
          { title: "Quantum machine learning breakthrough potential", replies: 29, lastUpdated: "4 days ago" },
          { title: "Talent shortage in quantum computing industry", replies: 18, lastUpdated: "1 week ago" }
        ]
      };
    }

    setTopicSpecificData(topicData);
  };

  const startGeneratingReport = (query: string) => {
    // Reset state
    setReport('');
    setSections([]);
    setIsGenerating(true);
    setProgress(0);
    setGenerationSteps([]);
    
    // If we have a predefined topic report, use it
    const topicReport = topicReports[query];
    
    if (topicReport) {
      // Simulate realistic generation with predefined report
      simulateRealisticGeneration(topicReport);
    } else {
      // Fallback to default report if query doesn't match predefined topics
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
    
    // Update topic-specific data based on the query
    updateTopicSpecificData(query);
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
    
    // Initial progress update
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 5;
      });
    }, 800);
    
    // Simulate the steps of generating a report
    let currentStep = 0;
    const stepInterval = setInterval(() => {
      currentStep++;
      
      if (currentStep < generationSteps.length) {
        setGenerationSteps(prev => [...prev, generationSteps[currentStep]]);
      } else {
        clearInterval(stepInterval);
      }
    }, 1500);
    
    // Generate each section with a realistic delay
    let sectionIndex = 0;
    const sectionInterval = setInterval(() => {
      if (sectionIndex < reportData.sections.length) {
        setSections(prev => [...prev, reportData.sections[sectionIndex]]);
        setProgress(Math.min(95, (sectionIndex + 1) / reportData.sections.length * 90));
        sectionIndex++;
      } else {
        // All sections added, complete the process
        clearInterval(sectionInterval);
        clearInterval(progressInterval);
        setProgress(100);
        setIsGenerating(false);
        
        // Add a small delay before marking as complete
        setTimeout(() => {
          setGenerationSteps(prev => [...prev, "Report generation complete!"]);
        }, 1000);
      }
    }, reportData.sections.length <= 3 ? 2000 : 3000); // Adjust timing based on number of sections
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
      
      // Update the section content to include the image
      setSections(prevSections => {
        const updatedSections = [...prevSections];
        const section = updatedSections[sectionIndex];
        const imageHtml = `<div class="my-4 w-full max-w-md mx-auto">
          <img src="${imageData.url}" alt="${imageData.title}" class="w-full rounded-lg shadow-md" />
          <p class="text-sm text-gray-500 mt-1">${imageData.title} • ${imageData.source}</p>
        </div>`;
        
        // Split the content at the drop position or append at the end
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
        {topicSpecificData.pdfs.map((pdf, index) => (
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
        {mockReferences.map((reference, index) => (
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
        {topicSpecificData.tables.map((table, index) => (
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
        {topicSpecificData.threads.map((thread, index) => (
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
                        <div className="h-2 w-2 rounded-full bg-violet-500"></div>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeView === 'full-report' && (
                <div className="max-w-4xl mx-auto p-8 text-gray-800">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{state.query || "Impact of AI on Mental Health Research"}</h1>
                      <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleShareReport}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleEmailReport}>
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleExportReport}>
                        <FileDown className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleSecureExport}>
                        <Lock className="h-4 w-4 mr-2" />
                        Secure Export
                      </Button>
                    </div>
                  </div>
                  
                  {sections.length === 0 && !isGenerating ? (
                    <div className="text-center p-12 border border-dashed border-gray-300 rounded-lg">
                      <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="text-xl font-medium text-gray-500 mb-2">No report generated yet</h3>
                      <p className="text-gray-400 mb-4">Enter a research question to generate a comprehensive report</p>
                      
                      <div className="flex gap-2 justify-center">
                        <Input 
                          placeholder="Enter research question..." 
                          className="max-w-md"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                        />
                        <Button onClick={() => startGeneratingReport(question)}>
                          <Search className="h-4 w-4 mr-2" />
                          Generate
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 space-y-8">
                      {sections.map((section, index) => (
                        <div 
                          key={index}
                          className={`p-6 rounded-lg ${dropTargetIndex === index ? 'bg-violet-50 border border-dashed border-violet-300' : 'bg-white shadow-md'}`}
                          onDragOver={(e) => handleSectionDragOver(e, index)}
                          onDragLeave={handleSectionDragLeave}
                          onDrop={(e) => handleImageDrop(e, index)}
                        >
                          <h2 className="text-xl font-bold mb-3 flex items-center justify-between">
                            {section.title}
                            <Button variant="ghost" size="sm" className="text-gray-500">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </h2>
                          <div 
                            className="prose prose-gray max-w-none"
                            dangerouslySetInnerHTML={{ __html: section.content }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {activeView === 'pdf-viewer' && (
                <div className="p-8">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Research Sources</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {topicSpecificData.pdfs.map((pdf, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className="bg-violet-100 p-2 rounded">
                              <FileText className="h-6 w-6 text-violet-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{pdf.title}</h4>
                              <p className="text-sm text-gray-500">{pdf.author} • {pdf.pages} pages</p>
                              <div className="flex mt-2 gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedPdfForView({ title: pdf.title, url: pdf.url })}
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    const a = document.createElement('a');
                                    a.href = pdf.url;
                                    a.download = pdf.title.replace(/\s+/g, '_') + '.pdf';
                                    a.click();
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {activeView === 'images' && (
                <div className="p-8">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Research Images</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {topicSpecificData.images.map((image, index) => (
                        <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                          <img src={image.url} alt={image.title} className="w-full h-48 object-cover" />
                          <div className="p-4">
                            <h4 className="font-medium text-gray-800">{image.title}</h4>
                            <p className="text-sm text-gray-500">Source: {image.source}</p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-2 text-violet-600"
                              onClick={() => {
                                // Handle image drag to report
                                const imageData = {
                                  title: image.title,
                                  url: image.url,
                                  source: image.source
                                };
                                toast.info("Drag this image to a report section to add it");
                              }}
                            >
                              <Share2 className="h-4 w-4 mr-1" />
                              Use in Report
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {activeView === 'citations' && (
                <div className="p-8">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Citations</h2>
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <div className="space-y-4">
                        {mockReferences.map((reference, index) => (
                          <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                            <p className="text-gray-800">{reference.authors} ({reference.year}). <em>{reference.title}</em>. {reference.journal}, {reference.volume}({reference.issue}), {reference.pages}.</p>
                            <div className="flex gap-2 mt-2">
                              <Button variant="ghost" size="sm" className="text-violet-600">
                                <FileDown className="h-4 w-4 mr-1" />
                                Cite
                              </Button>
                              <Button variant="ghost" size="sm" className="text-violet-600">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View Source
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeView === 'tables' && (
                <div className="p-8">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Data Tables</h2>
                    <div className="space-y-6">
                      {topicSpecificData.tables.map((table, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="bg-violet-100 p-2 rounded">
                              <Table className="h-6 w-6 text-violet-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800 text-lg">{table.title}</h4>
                              <p className="text-sm text-gray-500 mb-3">{table.rows} rows • {table.columns} columns</p>
                              <div className="border rounded overflow-hidden">
                                <div className="bg-gray-50 p-3 border-b text-sm font-medium text-gray-600">
                                  Sample data preview
                                </div>
                                <div className="p-3 text-sm text-gray-500">
                                  (Table visualization would appear here)
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="mt-3">
                                <FileDown className="h-4 w-4 mr-1" />
                                Export Table
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {activeView === 'threads' && (
                <div className="p-8">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Discussion Threads</h2>
                    <div className="space-y-4">
                      {topicSpecificData.threads.map((thread, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="bg-violet-100 p-2 rounded">
                              <MessageSquare className="h-6 w-6 text-violet-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800 text-lg">{thread.title}</h4>
                              <p className="text-sm text-gray-500">{thread.replies} replies • Last updated {thread.lastUpdated}</p>
                              <Button variant="outline" size="sm" className="mt-3">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Join Discussion
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Start New Discussion
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
          
          {activeSideView && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={35} minSize={25}>
                {renderSidePanel()}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
      
      {selectedPdfForView && (
        <PDFViewerDialog 
          isOpen={!!selectedPdfForView} 
          onClose={() => setSelectedPdfForView(null)} 
          pdf={selectedPdfForView} 
        />
      )}
      
      {showEncryptionDialog && (
        <EncryptionDialog
          isOpen={showEncryptionDialog}
          onClose={() => setShowEncryptionDialog(false)}
          title={state.query || "AI Research Report"}
        />
      )}
      
      {showCollaborator && collaborationMode === 'drawer' && (
        <Drawer open={showCollaborator} onOpenChange={setShowCollaborator}>
          <DrawerContent className="h-[80vh]">
            <DrawerHeader>
              <DrawerTitle>Collaboration</DrawerTitle>
              <DrawerDescription>
                Work with your team in real-time on this research report.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 py-2 flex-1 overflow-auto">
              <CollaborationWindow />
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

export default ResearchDashboard;
