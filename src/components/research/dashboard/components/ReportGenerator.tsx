
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
    onGenerationStep("Initializing comprehensive research pipeline...");

    const progressSteps = [
      { threshold: 5, message: "Sending request to Gemini..." },
      { threshold: 10, message: "Generating comprehensive research abstract..." },
      { threshold: 15, message: "Abstract generated! Analyzing research scope..." },
      { threshold: 20, message: "Extracting main research topics..." },
      { threshold: 25, message: "Identifying at least 5 major topic areas..." },
      { threshold: 30, message: "Building subtopic hierarchy (10+ per topic)..." },
      { threshold: 35, message: "Topic structure established, beginning deep research..." },
      { threshold: 40, message: "Researching Topic 1 with Google Search grounding..." },
      { threshold: 45, message: "Researching Topic 2 with Google Search grounding..." },
      { threshold: 50, message: "Researching Topic 3 with Google Search grounding..." },
      { threshold: 55, message: "Researching Topic 4 with Google Search grounding..." },
      { threshold: 60, message: "Researching Topic 5 with Google Search grounding..." },
      { threshold: 65, message: "Analyzing scholarly literature and primary sources..." },
      { threshold: 70, message: "Gathering and validating citations..." },
      { threshold: 75, message: "Extracting key data points and visualizations..." },
      { threshold: 80, message: "Identifying relevant datasets and research papers..." },
      { threshold: 85, message: "Synthesizing comprehensive findings..." },
      { threshold: 90, message: "Structuring final research report..." },
      { threshold: 95, message: "Finalizing citations and references..." }
    ];
    
    let currentProgress = 0;
    let currentStepIndex = 0;
    let completedSteps = new Set();
    
    const interval = setInterval(() => {
      // Increment progress at an appropriate pace for the comprehensive research
      const incrementAmount = currentProgress < 60 ? Math.random() * 2 + 0.5 : Math.random() * 1 + 0.3;
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
    }, 1200); // Slower interval for a more realistic research pace

    // Use the all-in-one Gemini function instead of the multi-step process
    const startTime = Date.now();
    geminiReport.mutate(query, {
      onSuccess: (result: GeminiReport & {intermediateResults?: any}) => {
        clearInterval(interval);
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        onProgress(100);
        onGenerationStep(`Comprehensive report generation complete in ${duration}s!`);
        setIsGenerating(false);
        
        // Log information about the report depth
        const numTopics = result.intermediateResults?.topicStructure?.topics?.length || 0;
        const numSubtopics = result.intermediateResults?.topicStructure?.topics?.reduce(
          (acc: number, topic: any) => acc + (topic.subtopics?.length || 0), 0
        ) || 0;
        
        console.log(`Generated report with ${numTopics} topics and ${numSubtopics} subtopics`);
        console.log(`Report contains ${result.sections.length} sections, ${result.references.length} references`);
        
        onReportGenerated(result);
        toast.success(`Comprehensive research report generated with ${numTopics} major topics and ${numSubtopics} subtopics!`);
      },
      onError: (err: any) => {
        clearInterval(interval);
        console.error("Report generation error:", err);
        onProgress(100);
        
        // More informative error message
        const errorMessage = err.message || "Unable to generate report";
        const errorDetails = err.details || {};
        
        onGenerationStep(`Error: ${errorMessage}. This appears to be an issue with the Gemini API. Please try again or check your API key in Supabase Edge Function Secrets.`);
        
        setIsGenerating(false);
        toast.error(`Report generation failed: ${errorMessage}`, {
          description: "Check your Gemini API key and edge function logs for details.",
          duration: 5000
        });
        
        // Create a basic error report so the UI can still display something
        onReportGenerated({
          title: "Error Generating Comprehensive Report",
          sections: [{
            title: "Error Details",
            content: `We encountered an error while generating your comprehensive research report: "${errorMessage}". This may be due to an issue with the Gemini API connection or configuration.\n\nPlease check that your Gemini API key is correctly set up in the Supabase Edge Function Secrets. You may also need to verify that the API key has access to the Gemini model specified in the edge functions.`
          }, 
          ...(errorDetails.abstract ? [{
            title: "Generated Abstract",
            content: errorDetails.abstract
          }] : []),
          ...(errorDetails.mainTopic ? [{
            title: "Main Topic",
            content: errorDetails.mainTopic
          }] : [])],
          references: [],
          suggestedPdfs: [],
          suggestedImages: [],
          suggestedDatasets: [],
          // Include any debug information we have
          intermediateResults: errorDetails
        });
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
