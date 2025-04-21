import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Image, Table, FileDown, Mail, Lock } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { mockReport, mockReferences, topicReports } from '@/data/mockData';
import CollaborationWindow from './CollaborationWindow';
import PDFViewerDialog from './PDFViewerDialog';
import EncryptionDialog from './EncryptionDialog';
import PDFViewerContent from './research/PDFViewerContent';
import CitationsContent from './research/CitationsContent';
import TablesContent from './research/TablesContent';
import ThreadsContent from './research/ThreadsContent';
import ReportHeader from './research/ReportHeader';
import Sidebar from './research/Sidebar';
import { ResearchImagePanel } from './ResearchImagePanel';

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
    if (!state || (!state.query && !state.files?.length && !state.urls?.length)) {
      navigate('/');
      return;
    }
    
    let _query = state?.query || "Impact of AI on Mental Health Research";
    
    setTopicPDFList([]);
    setTopicImageList([]);
    setTopicCitationList([]);
    
    if (topicPDFs[_query]) {
      setTopicPDFList(topicPDFs[_query] || []);
      setTopicImageList(topicImages[_query] || []);
      setTopicCitationList(topicCitations[_query] || []);
    } else {
      setTopicPDFList([
        { id: "pdf1", title: "Neural Networks in Mental Health", author: "J. Smith", pages: 28, url: "https://www.africau.edu/images/default/sample.pdf" }
      ]);
      setTopicImageList([]);
      setTopicCitationList(mockReferences || []);
    }
    
    startGeneratingReport(state?.query || "Impact of AI on Mental Health Research");
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
      if (!imageData || !imageData.url || !imageData.title) {
        toast.error('Invalid image data');
        return;
      }
      
      setSections(prevSections => {
        if (!prevSections || !prevSections[sectionIndex]) {
          return prevSections;
        }
        
        const updatedSections = [...prevSections];
        const section = updatedSections[sectionIndex];
        const imageHtml = `<div class="my-4 w-full max-w-md mx-auto">
          <img src="${imageData.url}" alt="${imageData.title}" class="w-full rounded-lg shadow-md" />
          <p class="text-sm text-gray-500 mt-1">${imageData.title} • ${imageData.source || 'Unknown source'}</p>
        </div>`;
        
        updatedSections[sectionIndex] = {
          ...section,
          content: section.content + '\n\n' + imageHtml
        };
        
        return updatedSections;
      });
      
      if (sections && sections[sectionIndex]) {
        toast.success(`Image "${imageData.title}" added to ${sections[sectionIndex].title}`);
      }
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

  const renderSidePanel = () => {
    switch (activeSideView) {
      case 'pdf-viewer':
        return (
          <PDFViewerContent 
            selectedPdf={selectedPdf}
            isFullScreen={isFullScreen}
            setIsFullScreen={setIsFullScreen}
            setActiveSideView={setActiveSideView}
            setSelectedPdfForView={setSelectedPdfForView}
            topicPDFList={topicPDFList || []}
            setSelectedPdf={setSelectedPdf}
          />
        );
      case 'images':
        return <ResearchImagePanel />;
      case 'tables':
        return <TablesContent />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#1A1F2C] via-[#1E2330] to-[#1A1F2C] text-white overflow-hidden">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

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
                    <ReportHeader
                      title={state?.query || "Impact of AI on Mental Health Research"}
                      activeSideView={activeSideView}
                      setActiveSideView={setActiveSideView}
                      handleExportReport={handleExportReport}
                      handleEmailReport={handleEmailReport}
                      handleSecureExport={handleSecureExport}
                    />

                    <div className="space-y-12 text-gray-700">
                      {sections && sections.length > 0 ? sections.map((section, index) => (
                        <div 
                          key={index}
                          className={`p-6 rounded-lg ${dropTargetIndex === index ? 'bg-violet-50 border-2 border-dashed border-violet-300' : 'bg-white border border-gray-100 shadow-sm'}`}
                          onDragOver={(e) => handleSectionDragOver(e, index)}
                          onDragLeave={handleSectionDragLeave}
                          onDrop={(e) => handleImageDrop(e, index)}
                        >
                          <h2 className="text-2xl font-semibold mb-4 text-gray-800">{section.title}</h2>
                          <div 
                            dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br/>') }} 
                            className="prose prose-slate max-w-none"
                          />
                        </div>
                      )) : (
                        !isGenerating && (
                          <div className="text-center py-12">
                            <p className="text-gray-400">No report generated yet. Start by selecting a research topic.</p>
                          </div>
                        )
                      )}
                    </div>
                  </>
                )}

                {activeView === 'pdf-viewer' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800">Source PDFs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {topicPDFList && topicPDFList.length > 0 ? topicPDFList.map((pdf, index) => (
                        <div 
                          key={index} 
                          className="border rounded-lg p-4 cursor-pointer hover:border-violet-400 transition-colors"
                          onClick={() => setSelectedPdfForView({ title: pdf.title, url: pdf.url })}
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-violet-100 p-2 rounded-lg">
                              <FileText className="h-6 w-6 text-violet-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">{pdf.title}</h3>
                              <p className="text-sm text-gray-500">{pdf.author} • {pdf.pages} pages</p>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="col-span-2 text-center py-8 border rounded-lg">
                          <p className="text-gray-400">No PDFs available for this topic</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeView === 'citations' && (
                  <CitationsContent topicCitationList={topicCitationList || []} />
                )}

                {activeView === 'tables' && <TablesContent />}

                {activeView === 'threads' && <ThreadsContent />}
              </div>
            </div>
          </ResizablePanel>

          {collaborationMode === 'panel' && showCollaborator && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={35} minSize={25}>
                <CollaborationWindow reportSections={sections} onClose={() => setShowCollaborator(false)} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>

        {activeSideView && (
          <div className="absolute top-4 right-4 w-80 h-[calc(100vh-8rem)] z-10 shadow-xl rounded-lg overflow-hidden">
            {renderSidePanel()}
          </div>
        )}
      </div>

      {selectedPdfForView && (
        <PDFViewerDialog 
          isOpen={!!selectedPdfForView} 
          onClose={() => setSelectedPdfForView(null)}
          pdf={{
            title: selectedPdfForView.title,
            url: selectedPdfForView.url
          }}
        />
      )}

      {showEncryptionDialog && (
        <EncryptionDialog
          isOpen={showEncryptionDialog}
          onClose={() => setShowEncryptionDialog(false)}
          documentTitle={state?.query || "Research Report"}
        />
      )}

      {collaborationMode === 'drawer' && (
        <Drawer open={showCollaborator} onOpenChange={setShowCollaborator}>
          <DrawerContent className="h-[90%]">
            <div className="mt-4 px-4">
              <CollaborationWindow reportSections={sections} />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

export default ResearchDashboard;
