
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GeminiReport } from "@/hooks/useGeminiReport";
import { toast } from "@/components/ui/sonner"; // Add this import for toast
import ReportGenerator from "./components/ReportGenerator";
import ViewStateManager from "./components/ViewStateManager";

const ResearchDashboardShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { query?: string; files?: string[]; urls?: string[]; source?: string } || {};

  const [activeView, setActiveView] = useState('full-report');
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSideView, setActiveSideView] = useState<'pdf-viewer' | 'images' | 'tables' | null>(null);
  const [showCollaborator, setShowCollaborator] = useState<boolean>(true); // Show collaborator by default
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

  useEffect(() => {
    // Do not auto-start report generation even if query is provided
    // We'll let the chat interface handle this now
    if (state.query) {
      console.log("Query provided but waiting for user confirmation through chat interface:", state.query);
    }
  }, [state, navigate]);

  const handleReportGenerated = (newReport: GeminiReport) => {
    console.log("Report generated:", newReport.title);
    
    // Ensure all arrays are defined even if they're not in the response
    const safeReport = {
      ...newReport,
      sections: newReport.sections || [],
      references: newReport.references || [],
      suggestedPdfs: newReport.suggestedPdfs || [],
      suggestedImages: newReport.suggestedImages || [],
      suggestedDatasets: newReport.suggestedDatasets || []
    };
    
    // Update the title if it's not present
    if (!safeReport.title || safeReport.title.trim() === "") {
      safeReport.title = "Research Report: " + (state.query || "Topic Analysis");
    }
    
    setReport(safeReport);
    setIsGenerating(false);
  };

  const handleShareReport = () => {
    setShowEncryptionDialog(true);
  };

  const toggleSideView = (view: 'pdf-viewer' | 'images' | 'tables' | null) => {
    setActiveSideView(prev => prev === view ? null : view);
  };

  const toggleCollaborator = () => {
    setShowCollaborator(prev => !prev);
  };

  // Handle generating report from the chat interface
  const handleGenerateReportFromChat = (query: string) => {
    console.log("Starting report generation from chat with query:", query);
    
    if (!query || query.trim().length === 0) {
      toast.error("Invalid query for report generation");
      return;
    }
    
    // Update state with the new query
    navigate(location.pathname, { 
      state: { ...state, query },
      replace: true 
    });
    
    // Start the generation process
    setIsGenerating(true);
    setGenerationSteps([]);
    setProgress(0);
    
    // Add initial step
    setGenerationSteps(prev => [...prev, 
      "Starting research report generation based on our conversation..."
    ]);
  };

  return (
    <>
      {isGenerating && (
        <ReportGenerator
          onProgress={setProgress}
          onGenerationStep={(step) => setGenerationSteps(prev => [...prev, step])}
          onReportGenerated={handleReportGenerated}
          query={state.query || ""}
        />
      )}
      
      <ViewStateManager
        activeView={activeView}
        setActiveView={setActiveView}
        progress={progress}
        generationSteps={generationSteps}
        isGenerating={isGenerating}
        report={report}
        showCollaborator={showCollaborator}
        activeSideView={activeSideView}
        selectedPdfForView={selectedPdfForView}
        showEncryptionDialog={showEncryptionDialog}
        query={state.query || ""}
        onToggleSideView={toggleSideView}
        onToggleCollaborator={toggleCollaborator}
        onShareReport={handleShareReport}
        onClosePdfViewer={() => setSelectedPdfForView(null)}
        onCloseEncryptionDialog={() => setShowEncryptionDialog(false)}
        onSelectPdfForView={setSelectedPdfForView}
        onGenerateReportFromChat={handleGenerateReportFromChat}
      />
    </>
  );
};

export default ResearchDashboardShell;
