import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, FileText, MessageSquare, FolderTree, ArrowLeft, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import PDFViewerDialog from './PDFViewerDialog';
import EncryptionDialog from './EncryptionDialog';
import CollaborationWindow from './CollaborationWindow';
import { useGeminiReport, GeminiReport } from "@/hooks/useGeminiReport";
import ResearchHeader from './research/ResearchHeader';
import ResearchContent from './research/ResearchContent';
import PDFsPanel from './research/PDFsPanel';
import DataTablesPanel from './research/DataTablesPanel';
import { ResearchImagePanel } from './ResearchImagePanel';

const ResearchDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { query?: string; files?: string[]; urls?: string[]; source?: string } || {};

  const [activeView, setActiveView] = useState('full-report');
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSideView, setActiveSideView] = useState<'pdf-viewer' | 'images' | 'tables' | null>(null);
  const [selectedPdfForView, setSelectedPdfForView] = useState<{title: string; url: string} | null>(null);
  const [showEncryptionDialog, setShowEncryptionDialog] = useState(false);
  const [generationSteps, setGenerationSteps] = useState<string[]>([]);
  const [report, setReport] = useState<GeminiReport>({
    title: "",
    sections: [],
    references: [],
    suggestedPdfs: [],
    suggestedImages: [],
    suggestedDatasets: []
  });
  const [showCollaborator, setShowCollaborator] = useState(false);
  const [collaborationMode, setCollaborationMode] = useState<'drawer' | 'panel'>('drawer');

  const geminiReport = useGeminiReport();
  const isPending = geminiReport.isPending;

  useEffect(() => {
    if (!state.query && !state.files?.length && !state.urls?.length) {
      navigate('/');
      return;
    }
    
    startGeneratingReport(state.query || "Impact of AI on Mental Health Research");
  }, [state, navigate]);

  const startGeneratingReport = (query: string) => {
    setReport({
      title: "",
      sections: [],
      references: [],
      suggestedPdfs: [],
      suggestedImages: [],
      suggestedDatasets: []
    });
    setIsGenerating(true);
    setProgress(0);
    setGenerationSteps(["Sending request to Gemini..."]);

    geminiReport.mutate(query, {
      onSuccess: (result: GeminiReport) => {
        setReport(result);
        setProgress(100);
        setGenerationSteps((steps) => [...steps, "Report generation complete!"]);
        setIsGenerating(false);
      },
      onError: (err: any) => {
        setGenerationSteps((steps) => [...steps, "Error: Unable to generate report"]);
        setIsGenerating(false);
        toast.error(err.message || "Failed to generate report from Gemini.");
      }
    });
  };

  const handleShareReport = () => {
    setShowEncryptionDialog(true);
  };

  const toggleSideView = (view: 'pdf-viewer' | 'images' | 'tables' | null) => {
    setActiveSideView(prev => prev === view ? null : view);
  };

  const renderSidePanel = () => {
    switch (activeSideView) {
      case 'pdf-viewer':
        return (
          <PDFsPanel 
            pdfs={report.suggestedPdfs}
            onClose={() => toggleSideView(null)}
            onViewPDF={setSelectedPdfForView}
          />
        );
      case 'images':
        return <ResearchImagePanel images={report.suggestedImages} onClose={() => toggleSideView(null)} />;
      case 'tables':
        return (
          <DataTablesPanel 
            datasets={report.suggestedDatasets}
            onClose={() => toggleSideView(null)}
          />
        );
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
              onClick={() => {
                setActiveView('pdf-viewer');
                toggleSideView('pdf-viewer');
              }}
            >
              <FileText className="h-5 w-5 mr-3 text-violet-400" />
              Source PDFs
            </Button>
            <Button
              variant={activeView === 'images' ? 'secondary' : 'ghost'}
              className="w-full justify-start hover:bg-white/5 transition-colors"
              onClick={() => {
                setActiveView('images');
                toggleSideView('images');
              }}
            >
              <img src="/placeholder.svg" alt="Images" className="h-5 w-5 mr-3 text-violet-400" />
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
              onClick={() => {
                setActiveView('tables');
                toggleSideView('tables');
              }}
            >
              <img src="/placeholder.svg" alt="Tables" className="h-5 w-5 mr-3 text-violet-400" />
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
                    <ResearchHeader 
                      title={report.title || state.query || "Research Report"}
                      onToggleSideView={toggleSideView}
                      activeSideView={activeSideView}
                      onShare={handleShareReport}
                    />
                    
                    <ResearchContent 
                      sections={report.sections} 
                      references={report.references}
                    />
                  </>
                )}

                {activeView === 'pdf-viewer' && (
                  <PDFsPanel 
                    pdfs={report.suggestedPdfs}
                    onClose={() => setActiveView('full-report')}
                    onViewPDF={setSelectedPdfForView}
                  />
                )}
                
                {activeView === 'images' && (
                  <ResearchImagePanel 
                    images={report.suggestedImages}
                    onClose={() => setActiveView('full-report')} 
                  />
                )}
                
                {activeView === 'tables' && (
                  <DataTablesPanel 
                    datasets={report.suggestedDatasets}
                    onClose={() => setActiveView('full-report')}
                  />
                )}
                
                {activeView === 'citations' && (
                  <div className="mt-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Citations</h2>
                    <div className="space-y-4">
                      {report.references.map((reference, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-800">
                            [{reference.id}] {reference.authors} ({reference.year}). <strong>{reference.title}</strong>. <em>{reference.journal}</em>.
                            {reference.url && (
                              <span> <a href={reference.url} className="text-violet-600 hover:underline" target="_blank" rel="noopener noreferrer">Link</a></span>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                    reportSections={report.sections}
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
                className="fixed bottom-4 right-4 rounded-full shadow-lg bg-violet-600 hover:bg-violet-700 z-50"
                size="icon"
                onClick={() => setShowCollaborator(true)}
              >
                <Users className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[60vh] bg-[#1A1F2C] p-0">
              <div className="h-1 w-12 rounded-full bg-gray-600 mx-auto my-2" />
              <DrawerHeader>
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
              </DrawerHeader>
              <CollaborationWindow 
                reportSections={report.sections}
                onClose={() => setShowCollaborator(false)} 
              />
            </DrawerContent>
          </Drawer>
        )}
      </div>
      {selectedPdfForView && (
        <PDFViewerDialog
          isOpen={!!selectedPdfForView}
          onClose={() => setSelectedPdfForView(null)}
          pdf={selectedPdfForView}
        />
      )}
      <EncryptionDialog 
        isOpen={showEncryptionDialog}
        onClose={() => setShowEncryptionDialog(false)}
        documentTitle={report.title || state.query || "Research Report"}
      />
    </div>
  );
};

export default ResearchDashboard;
