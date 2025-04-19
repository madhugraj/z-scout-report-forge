
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Share2, Mail, FileDown, Send, Users,
  FileText, Image, Table, BookOpen, MessageSquare, 
  ChevronRight, ExternalLink, Search, Edit, Download, Maximize2, Minimize2, X,
  FolderTree
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CitationPopover from './CitationPopover';
import { ResearchImagePanel } from './ResearchImagePanel';
import CollaborationWindow from './CollaborationWindow';
import { mockReport, mockReferences } from '@/data/mockData';
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
  const [activeSideView, setActiveSideView] = useState<'pdf-viewer' | 'images' | 'tables' | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [showCollaborator, setShowCollaborator] = useState(false);
  const [collaborationMode, setCollaborationMode] = useState<'drawer' | 'panel'>('drawer');
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

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
        {[
          { id: "pdf1", title: "Neural Networks in Mental Health", author: "J. Smith", pages: 28, url: "https://www.africau.edu/images/default/sample.pdf" },
          { id: "pdf2", title: "AI Applications in Therapy", author: "K. Johnson", pages: 42, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
          { id: "pdf3", title: "Ethics of AI in Healthcare", author: "M. Williams", pages: 36, url: "https://www.africau.edu/images/default/sample.pdf" },
          { id: "pdf4", title: "Digital Interventions Review", author: "T. Roberts", pages: 54, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
        ].map((pdf, index) => (
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
                      window.open(pdf.url, '_blank');
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
        <div className="mt-auto p-4 border-t border-gray-800/50">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5"
            onClick={() => navigate('/workspace')}
          >
            <FolderTree className="h-5 w-5 mr-3" />
            Research Workspace
          </Button>
        </div>
      </div>

      <div className="flex flex-1 relative flex-col">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={collaborationMode === 'panel' ? 65 : 100} minSize={50}>
            <div className="bg-white overflow-auto h-full">
              {isGenerating && (
                <div className="bg-violet-100 p-4 flex items-center gap-2 text-violet-700">
                  <div className="animate-spin h-4 w-4 border-2 border-violet-700 border-t-transparent rounded-full" />
                  Generating comprehensive research report...
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
                              >
                                <Table className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>View Tables</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleShareReport}
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>Share Report</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleExportReport}
                              >
                                <FileDown className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>Export Report</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleEmailReport}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>Email Report</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    
                    {sections.map((section, index) => (
                      <div 
                        key={index} 
                        className={`mb-8 ${dropTargetIndex === index ? 'border-2 border-dashed border-violet-400 rounded-lg p-4' : ''}`}
                        onDragOver={(e) => handleSectionDragOver(e, index)}
                        onDragLeave={handleSectionDragLeave}
                        onDrop={(e) => handleImageDrop(e, index)}
                      >
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{section.title}</h2>
                        <div className="prose max-w-none">
                          {section.content.split('\n\n').map((paragraph, idx) => {
                            if (paragraph.startsWith('<div class="my-4')) {
                              return (
                                <div key={idx} dangerouslySetInnerHTML={{ __html: paragraph }} />
                              );
                            }
                            
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
          </ResizablePanel>

          {activeSideView && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={35} minSize={25}>
                {renderSidePanel()}
              </ResizablePanel>
            </>
          )}
          
          {collaborationMode === 'panel' && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={30} minSize={25}>
                <div className="h-full bg-[#1A1F2C] relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-2 right-2 z-10 text-gray-400 hover:text-white"
                    onClick={() => setCollaborationMode('drawer')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CollaborationWindow
                    reportSections={sections}
                    isFloating={false}
                    onClose={() => setCollaborationMode('drawer')}
                  />
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>

        {collaborationMode === 'drawer' && (
          <Drawer>
            <DrawerTrigger asChild>
              <Button 
                className="fixed bottom-4 right-4 rounded-full shadow-lg"
                size="icon"
                onClick={() => setShowCollaborator(true)}
              >
                <Users className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[60vh] bg-[#1A1F2C] p-0">
              <div className="h-1 w-12 rounded-full bg-gray-600 mx-auto my-2" />
              <div className="flex justify-between px-4">
                <span className="text-sm text-gray-400 font-medium">Collaboration</span>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-gray-400 hover:text-white"
                    onClick={() => {
                      setCollaborationMode('panel');
                      setShowCollaborator(false);
                    }}
                  >
                    <Maximize2 className="h-3 w-3 mr-1" />
                    Dock to Panel
                  </Button>
                  <DrawerClose asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Close
                    </Button>
                  </DrawerClose>
                </div>
              </div>
              <CollaborationWindow 
                reportSections={sections}
                onClose={() => setShowCollaborator(false)} 
              />
            </DrawerContent>
          </Drawer>
        )}
      </div>

      <div className="fixed bottom-4 left-4 right-4 flex justify-center">
        <div className="text-xs text-gray-500 text-center">
          Copyright © 2025 Yavar techworks Pte Ltd., All rights reserved. 
          <a href="https://www.yavar.ai/privacy-policy/" className="mx-2 hover:text-violet-400" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
          •
          <a href="https://www.yavar.ai/terms-and-conditions/" className="mx-2 hover:text-violet-400" target="_blank" rel="noopener noreferrer">
            Terms & Conditions
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResearchDashboard;
