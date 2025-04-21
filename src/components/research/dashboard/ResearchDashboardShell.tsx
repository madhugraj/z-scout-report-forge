
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import PDFViewerDialog from "../../PDFViewerDialog";
import EncryptionDialog from "../../EncryptionDialog";
import CollaborationWindow from "../../CollaborationWindow";
import { useGeminiReport, GeminiReport } from "@/hooks/useGeminiReport";
import DashboardSidebar from "./DashboardSidebar";
import ReportGenerationProgress from "./ReportGenerationProgress";
import DashboardContentSwitcher from "./DashboardContentSwitcher";
import { ResearchImagePanel } from "../../ResearchImagePanel";
import PDFsPanel from "../PDFsPanel";
import DataTablesPanel from "../DataTablesPanel";

const ResearchDashboardShell: React.FC = () => {
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

  useEffect(() => {
    if (!state.query && !state.files?.length && !state.urls?.length) {
      navigate('/');
      return;
    }
    startGeneratingReport(state.query || "Impact of AI on Mental Health Research");
    // eslint-disable-next-line
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
      <DashboardSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        toggleSideView={toggleSideView}
        activeSideView={activeSideView}
      />

      <div className="flex flex-1 relative flex-col">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={collaborationMode === 'panel' ? 65 : 100} minSize={50}>
            <div className="bg-white overflow-auto h-full">
              <ReportGenerationProgress
                isGenerating={isGenerating}
                progress={progress}
                generationSteps={generationSteps}
              />

              <DashboardContentSwitcher
                activeView={activeView}
                toggleSideView={toggleSideView}
                activeSideView={activeSideView}
                report={report}
                stateQuery={state.query || ""}
                handleShareReport={handleShareReport}
                setActiveView={setActiveView}
                setSelectedPdfForView={setSelectedPdfForView}
              />
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
          <div>
            <Button 
              className="fixed bottom-4 right-4 rounded-full shadow-lg bg-violet-600 hover:bg-violet-700 z-50"
              size="icon"
              onClick={() => {}}
            >
              <Users className="h-5 w-5" />
            </Button>
            {/* Drawer UI kept in existing ResearchDashboard */}
          </div>
        )}

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
    </div>
  );
};

export default ResearchDashboardShell;
