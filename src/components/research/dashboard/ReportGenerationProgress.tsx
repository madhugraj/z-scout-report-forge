
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ReportGenerationProgressProps {
  isGenerating: boolean;
  progress: number;
  generationSteps: string[];
}

const ReportGenerationProgress: React.FC<ReportGenerationProgressProps> = ({
  isGenerating,
  progress,
  generationSteps,
}) => {
  if (!isGenerating) return null;

  // Determine current phase based on steps
  const getCurrentPhase = () => {
    const lastStep = generationSteps[generationSteps.length - 1] || "";
    
    if (lastStep.includes("error") || lastStep.includes("Error")) {
      return "error";
    }
    
    if (lastStep.includes("abstract")) {
      return "abstract";
    } else if (lastStep.includes("subtopic") || lastStep.includes("topic")) {
      return "topics";
    } else if (lastStep.includes("research") || lastStep.includes("gather")) {
      return "research";
    } else if (lastStep.includes("synth") || lastStep.includes("finaliz")) {
      return "finalizing";
    }
    
    return "processing";
  };
  
  const phase = getCurrentPhase();
  
  // Set color based on phase
  const getProgressColor = () => {
    switch(phase) {
      case "error": return "bg-red-600";
      case "abstract": return "bg-blue-600";
      case "topics": return "bg-purple-600";
      case "research": return "bg-green-600";
      case "finalizing": return "bg-amber-600";
      default: return "bg-violet-600";
    }
  };

  // Check if there is an error in any step
  const hasError = generationSteps.some(step => 
    step.toLowerCase().includes("error") || step.toLowerCase().includes("failed")
  );

  return (
    <div className="bg-violet-100 p-6 text-violet-700 sticky top-0 z-10">
      <div className="flex items-center gap-3 mb-3">
        {phase === "error" ? (
          <div className="h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">!</span>
          </div>
        ) : (
          <div className="animate-spin h-5 w-5 border-2 border-violet-700 border-t-transparent rounded-full" />
        )}
        <h3 className="font-medium">
          {phase === "error" 
            ? "Error generating report" 
            : "Generating comprehensive research report..."}
        </h3>
        <span className="ml-auto text-sm font-medium">{progress}%</span>
      </div>
      <Progress 
        value={progress} 
        className={`h-2 mb-3 bg-violet-200`}
        indicatorClassName={getProgressColor()}
      />
      <div className="text-sm font-medium space-y-1 max-h-24 overflow-y-auto">
        {generationSteps.map((step, index) => (
          <div key={index} className="flex items-center gap-2">
            {step.toLowerCase().includes("error") || step.toLowerCase().includes("failed") ? (
              <div className="h-2 w-2 bg-red-500 rounded-full" />
            ) : index === generationSteps.length - 1 ? (
              <div className="animate-pulse h-2 w-2 bg-violet-700 rounded-full" />
            ) : (
              <div className="h-2 w-2 bg-green-500 rounded-full" />
            )}
            <span className={step.toLowerCase().includes("error") || step.toLowerCase().includes("failed") ? "text-red-600 font-semibold" : ""}>{step}</span>
          </div>
        ))}
      </div>
      
      {hasError && (
        <Alert variant="destructive" className="mt-4 bg-red-50 border-red-200 text-red-800">
          <AlertTitle>Error Detected</AlertTitle>
          <AlertDescription>
            We encountered an issue generating your report. This might be due to API connectivity problems or configuration issues with the Gemini API key. Please check the Supabase Edge Function logs for more details.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ReportGenerationProgress;
