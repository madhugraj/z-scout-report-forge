
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
    onGenerationStep("Initializing enhanced comprehensive research pipeline with Gemini 1.5 Flash...");

    const progressSteps = [
      { threshold: 5, message: "Sending request to Gemini 1.5 Flash model for advanced academic research analysis..." },
      { threshold: 8, message: "Generating detailed research abstract with expanded scope..." },
      { threshold: 12, message: "Abstract generated! Analyzing comprehensive research domains..." },
      { threshold: 15, message: "Extracting 12-15 main topics and 10-15 subtopics per topic for comprehensive coverage..." },
      { threshold: 20, message: "Building detailed topic and subtopic hierarchy with enhanced breadth..." },
      { threshold: 25, message: "Enabling advanced Google Search grounding for scholarly research..." },
      { threshold: 30, message: "Comprehensive topic structure established, beginning detailed research phase..." },
      { threshold: 35, message: "Conducting in-depth research on Topics 1-4 with enhanced depth..." },
      { threshold: 40, message: "Conducting in-depth research on Topics 5-8 with enhanced depth..." },
      { threshold: 45, message: "Gathering extensive scholarly data for all major topics..." },
      { threshold: 50, message: "Analyzing academic publications and extracting key findings..." },
      { threshold: 55, message: "Extracting quantitative data and statistics from research literature..." },
      { threshold: 60, message: "Gathering citations and academic references for all topics..." },
      { threshold: 65, message: "Cross-referencing scholarly sources for comprehensive coverage..." },
      { threshold: 70, message: "Compiling research findings with detailed citations..." },
      { threshold: 75, message: "Synthesizing content across all research topics and subtopics..." },
      { threshold: 80, message: "Structuring comprehensive academic research report..." },
      { threshold: 85, message: "Generating detailed content sections with citations..." },
      { threshold: 90, message: "Finalizing all research sections with comprehensive content..." },
      { threshold: 95, message: "Performing quality assurance on comprehensive research report..." }
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
        const totalReferences = result.references?.length || 0;
        const totalTopics = result.sections?.filter(s => !s.title.toLowerCase().includes('introduction') && 
                                                         !s.title.toLowerCase().includes('conclusion') &&
                                                         !s.title.toLowerCase().includes('references') &&
                                                         !s.title.toLowerCase().includes('appendix')).length || 0;
        
        onGenerationStep(`Comprehensive research report complete in ${duration}s! (${estimatedPages} pages, ${totalReferences} citations, ${totalTopics} topic sections)`);
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
        
        console.log(`Generated comprehensive report with ${numTopics} topics and ${numSubtopics} subtopics`);
        console.log(`Report contains ${result.sections.length} sections, ${citationCount} references`);
        console.log(`Report content size: ~${Math.round(totalContent/1000)}K characters (~${contentSizeInPages} pages)`);
        
        onReportGenerated(result);
        
        // Provide more accurate toast message with improved metrics
        toast.success(`Research report generated with ${result.sections.length} sections and ${citationCount} citations!`, {
          duration: 5000
        });
      },
      onError: (err: any) => {
        clearInterval(interval);
        console.error("Report generation error:", err);
        onProgress(100);
        
        const errorMessage = err.message || "Unable to generate report";
        const errorDetails = err.details || {};
        
        onGenerationStep(`Error: ${errorMessage}. Please check your API key in Supabase Edge Function Secrets.`);
        
        setIsGenerating(false);
        toast.error(`Report generation failed: ${errorMessage}`, {
          description: "Check your Gemini API key and edge function logs for details.",
          duration: 5000
        });
        
        onReportGenerated({
          title: "Error Generating Research Report",
          sections: [{
            title: "Error Details",
            content: `We encountered an error while generating your research report: "${errorMessage}". This may be due to an issue with the Gemini API connection or configuration.\n\nPlease check that your Gemini API key is correctly set up in the Supabase Edge Function Secrets.`
          }],
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
