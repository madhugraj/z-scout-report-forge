
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
      { threshold: 5, message: "Sending request to Gemini for academic research analysis..." },
      { threshold: 8, message: "Generating comprehensive research abstract..." },
      { threshold: 12, message: "Abstract generated! Analyzing research scope..." },
      { threshold: 15, message: "Extracting main topics and subtopics for in-depth research..." },
      { threshold: 20, message: "Building detailed topic and subtopic hierarchy..." },
      { threshold: 25, message: "Enabling Google Search grounding for academic research..." },
      { threshold: 30, message: "Topic structure established, beginning in-depth research..." },
      { threshold: 35, message: "Researching Topics 1-3 with academic sources and citations..." },
      { threshold: 40, message: "Researching Topics 4-6 with academic sources and citations..." },
      { threshold: 45, message: "Researching Topics 7-10 with academic sources and citations..." },
      { threshold: 50, message: "Gathering verified scholarly citations for each topic..." },
      { threshold: 55, message: "Analyzing academic literature and primary sources..." },
      { threshold: 60, message: "Validating and incorporating scholarly references..." },
      { threshold: 65, message: "Extracting key data points from research literature..." },
      { threshold: 70, message: "Identifying relevant datasets and research papers..." },
      { threshold: 75, message: "Synthesizing research findings with proper citations..." },
      { threshold: 80, message: "Structuring academic research report with citations..." },
      { threshold: 85, message: "Optimizing content depth across all sections..." },
      { threshold: 90, message: "Finalizing citations and academic references..." },
      { threshold: 95, message: "Performing quality check on research report..." }
    ];
    
    let currentProgress = 0;
    let currentStepIndex = 0;
    let completedSteps = new Set();
    
    const interval = setInterval(() => {
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
    }, 1500);

    const startTime = Date.now();
    geminiReport.mutate(query, {
      onSuccess: (result: GeminiReport & {intermediateResults?: any}) => {
        clearInterval(interval);
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        onProgress(100);
        
        // Update this message to be more accurate about what was actually generated
        const totalWords = result.sections.reduce(
          (acc, section) => acc + (section.content?.split(/\s+/).length || 0), 0
        );
        const estimatedPages = Math.max(1, Math.round(totalWords / 300));
        
        onGenerationStep(`Research report generation complete in ${duration}s! (${estimatedPages} pages, ${result.references.length} citations)`);
        setIsGenerating(false);
        
        // Check if the report has sufficient depth
        const totalContent = result.sections.reduce(
          (acc, section) => acc + (section.content?.length || 0), 0
        );
        
        const numTopics = result.intermediateResults?.topicStructure?.topics?.length || 0;
        const numSubtopics = result.intermediateResults?.topicStructure?.topics?.reduce(
          (acc: number, topic: any) => acc + (topic.subtopics?.length || 0), 0
        ) || 0;
        
        const contentSizeInPages = Math.round(totalContent / 3000);
        const citationCount = result.references.length;
        
        console.log(`Generated report with ${numTopics} topics and ${numSubtopics} subtopics`);
        console.log(`Report contains ${result.sections.length} sections, ${citationCount} references`);
        console.log(`Report content size: ~${Math.round(totalContent/1000)}K characters (~${contentSizeInPages} pages)`);
        
        onReportGenerated(result);
        
        // Provide more accurate toast message
        toast.success(`Research report generated with ${result.sections.length} sections and ${citationCount} citations across ${numTopics} topics!`);
      },
      onError: (err: any) => {
        clearInterval(interval);
        console.error("Report generation error:", err);
        onProgress(100);
        
        const errorMessage = err.message || "Unable to generate report";
        const errorDetails = err.details || {};
        
        onGenerationStep(`Error: ${errorMessage}. This appears to be an issue with the Gemini API. Please check your API key in Supabase Edge Function Secrets.`);
        
        setIsGenerating(false);
        toast.error(`Report generation failed: ${errorMessage}`, {
          description: "Check your Gemini API key and edge function logs for details.",
          duration: 5000
        });
        
        // Create a basic error report so the UI can still display something
        onReportGenerated({
          title: "Error Generating Research Report",
          sections: [{
            title: "Error Details",
            content: `We encountered an error while generating your research report: "${errorMessage}". This may be due to an issue with the Gemini API connection or configuration.\n\nPlease check that your Gemini API key is correctly set up in the Supabase Edge Function Secrets. You may also need to verify that the API key has access to the Gemini model specified in the edge functions.`
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
