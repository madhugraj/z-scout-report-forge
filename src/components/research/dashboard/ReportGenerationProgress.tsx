
import React from "react";

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

  return (
    <div className="bg-violet-100 p-6 text-violet-700 sticky top-0 z-10">
      <div className="flex items-center gap-3 mb-3">
        <div className="animate-spin h-5 w-5 border-2 border-violet-700 border-t-transparent rounded-full" />
        <h3 className="font-medium">Generating comprehensive research report...</h3>
      </div>
      <div className="w-full bg-violet-200 rounded-full h-2 mb-3">
        <div 
          className="bg-violet-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-sm font-medium space-y-1 max-h-24 overflow-y-auto">
        {generationSteps.map((step, index) => (
          <div key={index} className="flex items-center gap-2">
            {index === generationSteps.length - 1 ? (
              <div className="animate-pulse h-2 w-2 bg-violet-700 rounded-full" />
            ) : (
              <div className="h-2 w-2 bg-green-500 rounded-full" />
            )}
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
};

export default ReportGenerationProgress;
