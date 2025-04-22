
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GeminiReport } from "@/hooks/useGeminiReport";
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
  const [showCollaborator, setShowCollaborator] = useState<boolean>(false);
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
    if (!state.query && !state.files?.length && !state.urls?.length) {
      navigate('/');
      return;
    }
    // Start report generation when component mounts
    setIsGenerating(true);
    // eslint-disable-next-line
  }, [state, navigate]);

  const handleReportGenerated = (newReport: GeminiReport) => {
    setReport(newReport);
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

  return (
    <>
      <ReportGenerator
        onProgress={setProgress}
        onGenerationStep={(step) => setGenerationSteps(prev => [...prev, step])}
        onReportGenerated={handleReportGenerated}
        query={state.query || "Impact of AI on Mental Health Research"}
      />
      
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
      />
    </>
  );
};

export default ResearchDashboardShell;
