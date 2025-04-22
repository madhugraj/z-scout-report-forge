
import { useState, useEffect } from "react";
import { useGeminiReport, GeminiReport } from "@/hooks/useGeminiReport";
import { toast } from "@/components/ui/sonner";
import { Progress } from "@/components/ui/progress";

interface ReportGeneratorProps {
  onProgress: (progress: number) => void;
  onGenerationStep: (step: string) => void;
  onReportGenerated: (report: GeminiReport) => void;
  query: string;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  onProgress,
  onGenerationStep,
  onReportGenerated,
  query,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const geminiReport = useGeminiReport();

  useEffect(() => {
    if (query.trim()) {
      startGeneratingReport(query);
    }
  }, [query]);

  const startGeneratingReport = (query: string) => {
    setIsGenerating(true);
    onProgress(0);
    onGenerationStep("Initializing research pipeline...");

    const progressSteps = [
      { threshold: 5, message: "Sending request to Gemini..." },
      { threshold: 10, message: "Generating comprehensive abstract..." },
      { threshold: 20, message: "Abstract generated! Analyzing research scope..." },
      { threshold: 30, message: "Identifying key research topics..." },
      { threshold: 40, message: "Extracting main topic and subtopics..." },
      { threshold: 50, message: "Beginning subtopic research..." },
      { threshold: 60, message: "Gathering scientific literature..." },
      { threshold: 70, message: "Collecting relevant citations..." },
      { threshold: 80, message: "Synthesizing findings..." },
      { threshold: 90, message: "Creating visualizations and references..." },
      { threshold: 95, message: "Finalizing research report..." }
    ];
    
    let currentProgress = 0;
    let currentStepIndex = 0;
    let completedSteps = new Set();
    
    const interval = setInterval(() => {
      // Increment faster at the beginning, slower towards the end
      const incrementAmount = currentProgress < 60 ? Math.random() * 3 + 1 : Math.random() * 1.5 + 0.5;
      currentProgress += incrementAmount;
      
      if (currentProgress > 95) {
        clearInterval(interval);
        return;
      }
      
      onProgress(Math.min(Math.round(currentProgress), 95));
      
      while (currentStepIndex < progressSteps.length && 
             currentProgress > progressSteps[currentStepIndex].threshold) {
        const step = progressSteps[currentStepIndex];
        
        if (!completedSteps.has(step.message)) {
          onGenerationStep(step.message);
          completedSteps.add(step.message);
        }
        
        currentStepIndex++;
      }
    }, 1000);

    geminiReport.mutate(query, {
      onSuccess: (result: GeminiReport) => {
        clearInterval(interval);
        onProgress(100);
        onGenerationStep("Report generation complete!");
        setIsGenerating(false);
        onReportGenerated(result);
        toast.success("Research report generated successfully!");
      },
      onError: (err: any) => {
        clearInterval(interval);
        console.error("Report generation error:", err);
        onGenerationStep(`Error: ${err.message || "Unable to generate report"}`);
        setIsGenerating(false);
        toast.error(err.message || "Failed to generate report from Gemini.");
      }
    });
  };

  return (
    <div className="hidden">
      {/* This is a non-visual component that manages the report generation process */}
    </div>
  );
};

export default ReportGenerator;
