
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export interface Reference {
  id: number;
  title: string;
  authors: string;
  journal: string;
  year: string;
  url: string;
  doi?: string;
}

export interface SuggestedPdf {
  title: string;
  author: string;
  description: string;
  relevance: string;
  referenceId?: number;
  url?: string;
}

export interface SuggestedImage {
  title: string;
  description: string;
  source: string;
  relevanceToSection: string;
  url?: string;
}

export interface SuggestedDataset {
  title: string;
  description: string;
  source: string;
  relevanceToSection: string;
  url?: string;
}

export interface ReportSection {
  title: string;
  content: string;
}

export interface GeminiReport {
  title: string;
  sections: ReportSection[];
  references: Reference[];
  suggestedPdfs: SuggestedPdf[];
  suggestedImages: SuggestedImage[];
  suggestedDatasets: SuggestedDataset[];
  intermediateResults?: {
    abstract?: string;
    mainTopic?: string;
    subtopics?: string[];
    topicStructure?: {
      mainTopic: string;
      topics: Array<{
        title: string;
        subtopics: string[];
      }>;
    };
    researchSample?: string;
  };
}

// Default empty report structure to use when there's an error
const fallbackReport: GeminiReport = {
  title: "Error Generating Report",
  sections: [{
    title: "Error Information",
    content: "We encountered an error while generating your research report. Please check the error details and try again."
  }],
  references: [],
  suggestedPdfs: [],
  suggestedImages: [],
  suggestedDatasets: []
};

export async function generateGeminiReport(query: string): Promise<GeminiReport> {
  try {
    console.log("Starting report generation for query:", query);
    
    // Use the all-in-one edge function approach
    const { data, error } = await supabase.functions.invoke('generate-report-gemini', {
      body: { query }
    });
    
    if (error) {
      console.error("Error invoking generate-report-gemini function:", error);
      throw new Error(`Failed to generate report: ${error.message}`);
    }
    
    if (!data) {
      console.error("No data returned from generate-report-gemini function");
      throw new Error("Failed to generate report: No data returned");
    }
    
    if (data.error) {
      console.error("Error from generate-report-gemini function:", data.error);
      throw Object.assign(
        new Error(`Gemini API error: ${data.error}`),
        { details: data.intermediateResults || {} }
      );
    }
    
    // Extract the report from the response
    const report = data.report;
    
    // Ensure all the expected arrays exist
    const processedReport = {
      ...report,
      sections: report.sections || [],
      references: report.references || [],
      suggestedPdfs: report.suggestedPdfs || [],
      suggestedImages: report.suggestedImages || [],
      suggestedDatasets: report.suggestedDatasets || [],
      // Include any intermediate results for debugging
      intermediateResults: {
        abstract: data.abstract,
        mainTopic: data.mainTopic,
        subtopics: data.subtopics,
        topicStructure: data.intermediateResults?.topicStructure,
        researchSample: data.intermediateResults?.researchSample
      }
    };
    
    return processedReport;
  } catch (error: any) {
    console.error("Error in report generation pipeline:", error);
    
    // Try to extract any details if available
    const details = error.details || {};
    
    // Creating a fallback report with error information
    const errorReport = {
      ...fallbackReport,
      title: `Error Report for "${query}"`,
      sections: [{
        title: "Error Details",
        content: `We encountered an error while generating your research report: "${error.message}". This may be due to issues with the Gemini API connection or configuration.\n\nTroubleshooting steps:\n1. Check that your Gemini API key is valid and correctly set up in the Supabase Edge Function Secrets.\n2. Verify that the API key has access to the Gemini model specified in the edge functions.\n3. Check the Edge Function logs for more detailed error information.`
      }],
      intermediateResults: details
    };
    
    // If we have any intermediate results, add them to the error report
    if (details.abstract) {
      errorReport.sections.push({
        title: "Generated Abstract",
        content: details.abstract
      });
    }
    
    if (details.mainTopic && details.subtopics) {
      errorReport.sections.push({
        title: "Extracted Topics",
        content: `**Main Topic**: ${details.mainTopic}\n\n**Subtopics**:\n${details.subtopics.map((sub: string) => `- ${sub}`).join('\n')}`
      });
    }
    
    // Re-throw with details
    const enhancedError = new Error(error.message || "Failed to generate report");
    Object.assign(enhancedError, {
      details: details,
      errorReport: errorReport
    });
    throw enhancedError;
  }
}

export function useGeminiReport() {
  return useMutation({
    mutationFn: (query: string) => generateGeminiReport(query),
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast.error(error.message || "Failed to generate comprehensive report from Gemini.", {
        description: "Check your Gemini API key in Supabase Edge Function Secrets.",
        duration: 6000
      });
      
      // If the error contains an errorReport object, return it as a fallback
      if (error.errorReport) {
        return error.errorReport;
      }
    }
  });
}
