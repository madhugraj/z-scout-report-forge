
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
      { threshold: 5, message: "Sending request to Gemini for comprehensive analysis..." },
      { threshold: 8, message: "Generating detailed 40-50 page research abstract..." },
      { threshold: 12, message: "Abstract generated! Analyzing comprehensive research scope..." },
      { threshold: 15, message: "Extracting main research topics and all subtopics..." },
      { threshold: 20, message: "Identifying 10+ major topic areas with 10-15 subtopics each..." },
      { threshold: 25, message: "Building extensive subtopic hierarchy..." },
      { threshold: 30, message: "Topic structure established, beginning deep research..." },
      { threshold: 35, message: "Researching Topics 1-3 with Google Search grounding..." },
      { threshold: 40, message: "Researching Topics 4-6 with Google Search grounding..." },
      { threshold: 45, message: "Researching Topics 7-10 with Google Search grounding..." },
      { threshold: 50, message: "Conducting subtopic analysis (5-10 pages per major topic)..." },
      { threshold: 55, message: "Analyzing scholarly literature and primary sources..." },
      { threshold: 60, message: "Gathering and validating extensive citations (50+ sources)..." },
      { threshold: 65, message: "Extracting key data points and visualizations..." },
      { threshold: 70, message: "Identifying relevant datasets and research papers..." },
      { threshold: 75, message: "Synthesizing comprehensive findings (40-50 pages total)..." },
      { threshold: 80, message: "Structuring extensive final research report..." },
      { threshold: 85, message: "Optimizing content depth across all sections..." },
      { threshold: 90, message: "Finalizing citations and references..." },
      { threshold: 95, message: "Performing quality check on comprehensive report..." }
    ];
    
    let currentProgress = 0;
    let currentStepIndex = 0;
    let completedSteps = new Set();
    
    const interval = setInterval(() => {
      // Increment progress at an appropriate pace for the comprehensive research
      const incrementAmount = currentProgress < 60 ? Math.random() * 1.5 + 0.5 : Math.random() * 1 + 0.2;
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
    }, 1500); // Slower interval for a more realistic research pace

    // Use the all-in-one Gemini function instead of the multi-step process
    const startTime = Date.now();
    geminiReport.mutate(query, {
      onSuccess: (result: GeminiReport & {intermediateResults?: any}) => {
        clearInterval(interval);
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        onProgress(100);
        onGenerationStep(`Comprehensive report generation complete in ${duration}s! (40-50 pages of content)`);
        setIsGenerating(false);
        
        // Check if the report has sufficient depth
        const totalContent = result.sections.reduce(
          (acc, section) => acc + (section.content?.length || 0), 0
        );
        
        // Log information about the report depth
        const numTopics = result.intermediateResults?.topicStructure?.topics?.length || 0;
        const numSubtopics = result.intermediateResults?.topicStructure?.topics?.reduce(
          (acc: number, topic: any) => acc + (topic.subtopics?.length || 0), 0
        ) || 0;
        
        const contentSizeInPages = Math.round(totalContent / 3000); // Rough estimate of characters per page
        
        console.log(`Generated report with ${numTopics} topics and ${numSubtopics} subtopics`);
        console.log(`Report contains ${result.sections.length} sections, ${result.references.length} references`);
        console.log(`Report content size: ~${Math.round(totalContent/1000)}K characters (~${contentSizeInPages} pages)`);
        
        onReportGenerated(result);
        toast.success(`Comprehensive research report generated with ${result.sections.length} sections across ${numTopics} major topics and ${numSubtopics} subtopics!`);
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
