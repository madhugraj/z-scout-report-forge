import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import PDFViewerDialog from "../../PDFViewerDialog";
import EncryptionDialog from "../../EncryptionDialog";
import { useGeminiReport, GeminiReport } from "@/hooks/useGeminiReport";
import DashboardSidebar from "./DashboardSidebar";
import ReportGenerationProgress from "./ReportGenerationProgress";
import DashboardContentSwitcher from "./DashboardContentSwitcher";

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

    // Enhanced mock progress with unique steps
    const mockProgress = () => {
      let currentProgress = 0;
      const progressSteps = [
        { threshold: 20, message: "Analyzing research query..." },
        { threshold: 35, message: "Gathering scientific literature..." },
        { threshold: 50, message: "Processing research data..." },
        { threshold: 65, message: "Synthesizing findings..." },
        { threshold: 80, message: "Creating visualizations and references..." },
        { threshold: 90, message: "Finalizing research report..." }
      ];
      
      let currentStepIndex = 0;
      
      const interval = setInterval(() => {
        currentProgress += Math.random() * 10;
        if (currentProgress > 95) {
          clearInterval(interval);
          return;
        }
        
        setProgress(Math.min(Math.round(currentProgress), 95));
        
        // Add next step message when threshold is crossed
        while (currentStepIndex < progressSteps.length && 
               currentProgress > progressSteps[currentStepIndex].threshold) {
          const step = progressSteps[currentStepIndex];
          setGenerationSteps(prev => {
            // Only add the step if it's not already in the list
            if (!prev.includes(step.message)) {
              return [...prev, step.message];
            }
            return prev;
          });
          currentStepIndex++;
        }
      }, 800);
      
      // Store interval ID for cleanup
      return interval;
    };

    const progressInterval = mockProgress();

    geminiReport.mutate(query, {
      onSuccess: (result: GeminiReport) => {
        clearInterval(progressInterval);
        setReport(result);
        setProgress(100);
        setGenerationSteps((steps) => [...steps.filter(step => step !== "Finalizing research report..."), "Report generation complete!"]);
        setIsGenerating(false);
        toast.success("Research report generated successfully!");
      },
      onError: (err: any) => {
        clearInterval(progressInterval);
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
          <ResizablePanel defaultSize={100} minSize={50}>
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
                {/* Side panel content is handled in DashboardContentSwitcher */}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>

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
