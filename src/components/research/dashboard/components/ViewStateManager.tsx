
import React from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import PDFViewerDialog from "../../../PDFViewerDialog";
import EncryptionDialog from "../../../EncryptionDialog";
import CollaborationWindow from "../../../collaboration/CollaborationWindow";
import DashboardSidebar from "../DashboardSidebar";
import ReportGenerationProgress from "../ReportGenerationProgress";
import DashboardContentSwitcher from "../DashboardContentSwitcher";
import { GeminiReport } from "@/hooks/useGeminiReport";

interface ViewStateManagerProps {
  activeView: string;
  setActiveView: (view: string) => void;
  progress: number;
  generationSteps: string[];
  isGenerating: boolean;
  report: GeminiReport;
  showCollaborator: boolean;
  activeSideView: 'pdf-viewer' | 'images' | 'tables' | null;
  selectedPdfForView: { title: string; url: string } | null;
  showEncryptionDialog: boolean;
  query: string;
  onToggleSideView: (view: 'pdf-viewer' | 'images' | 'tables' | null) => void;
  onToggleCollaborator: () => void;
  onShareReport: () => void;
  onClosePdfViewer: () => void;
  onCloseEncryptionDialog: () => void;
  onSelectPdfForView: (pdf: { title: string; url: string } | null) => void;
  onGenerateReportFromChat?: (query: string) => void;
}

const ViewStateManager: React.FC<ViewStateManagerProps> = ({
  activeView,
  setActiveView,
  progress,
  generationSteps,
  isGenerating,
  report,
  showCollaborator,
  activeSideView,
  selectedPdfForView,
  showEncryptionDialog,
  query,
  onToggleSideView,
  onToggleCollaborator,
  onShareReport,
  onClosePdfViewer,
  onCloseEncryptionDialog,
  onSelectPdfForView,
  onGenerateReportFromChat
}) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-[#1A1F2C] via-[#1E2330] to-[#1A1F2C] text-white overflow-hidden">
      <DashboardSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        toggleSideView={onToggleSideView}
        activeSideView={activeSideView}
        onToggleCollaborator={onToggleCollaborator}
        showCollaborator={showCollaborator}
      />

      <div className="flex flex-1 relative flex-col">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={showCollaborator ? 60 : 100} minSize={40}>
            <div className="bg-white overflow-auto h-full">
              <ReportGenerationProgress
                isGenerating={isGenerating}
                progress={progress}
                generationSteps={generationSteps}
              />

              <DashboardContentSwitcher
                activeView={activeView}
                toggleSideView={onToggleSideView}
                activeSideView={activeSideView}
                report={report}
                stateQuery={query}
                handleShareReport={onShareReport}
                setActiveView={setActiveView}
                setSelectedPdfForView={onSelectPdfForView}
              />
            </div>
          </ResizablePanel>

          {showCollaborator && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={40} minSize={30}>
                <CollaborationWindow 
                  reportSections={report.sections} 
                  isFloating={false}
                  onGenerateReport={onGenerateReportFromChat}
                />
              </ResizablePanel>
            </>
          )}

          {activeSideView && !showCollaborator && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={35} minSize={25}>
                {/* Side panel content is handled in DashboardContentSwitcher */}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>

        {selectedPdfForView && (
          <PDFViewerDialog
            isOpen={!!selectedPdfForView}
            onClose={onClosePdfViewer}
            pdf={selectedPdfForView}
          />
        )}
        <EncryptionDialog 
          isOpen={showEncryptionDialog}
          onClose={onCloseEncryptionDialog}
          documentTitle={report.title || query || "Research Report"}
        />
      </div>
    </div>
  );
};

export default ViewStateManager;
