
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
}

export interface SuggestedImage {
  title: string;
  description: string;
  source: string;
  relevanceToSection: string;
}

export interface SuggestedDataset {
  title: string;
  description: string;
  source: string;
  relevanceToSection: string;
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
    researchData?: string[];
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
    
    // Collect intermediate results to display in case of errors
    const intermediateResults: any = {};
    
    // Step 1: Generate Abstract
    console.log("Step 1: Generating abstract...");
    const { data: abstractData, error: abstractError } = await supabase.functions.invoke('generate-abstract', {
      body: { query }
    });
    
    if (abstractError) {
      console.error("Abstract generation error:", abstractError);
      const error = new Error(`Failed to generate abstract: ${abstractError.message}`);
      Object.assign(error, { details: intermediateResults });
      throw error;
    }
    
    if (!abstractData) {
      console.error("No data returned from abstract generation");
      const error = new Error("Failed to generate abstract: No data returned");
      Object.assign(error, { details: intermediateResults });
      throw error;
    }
    
    // Check if there's an error coming back from the function
    if (abstractData.error) {
      console.error("Error from generate-abstract function:", abstractData.error);
      const error = new Error(`Gemini API error: ${abstractData.error}`);
      Object.assign(error, { details: intermediateResults });
      throw error;
    }
    
    // Even if there's an error generating the abstract, the function now returns a fallback one
    const abstract = abstractData.abstract;
    intermediateResults.abstract = abstract;
    
    if (!abstract || abstract.trim() === "") {
      console.error("Empty abstract received:", abstractData);
      const error = new Error("Failed to generate abstract: Empty abstract received");
      Object.assign(error, { details: intermediateResults });
      throw error;
    }
    
    console.log("Abstract generated successfully:", abstract.substring(0, 100) + "...");
    
    // Step 2: Extract Subtopics
    console.log("Step 2: Extracting subtopics...");
    const { data: subtopicsData, error: subtopicsError } = await supabase.functions.invoke('extract-subtopics', {
      body: { abstract }
    });
    
    if (subtopicsError) {
      console.error("Subtopics extraction error:", subtopicsError);
      const error = new Error(`Failed to extract subtopics: ${subtopicsError.message}`);
      Object.assign(error, { details: intermediateResults });
      throw error;
    }
    
    if (!subtopicsData) {
      console.error("No data returned from subtopics extraction");
      const error = new Error("Failed to extract subtopics: No data returned");
      Object.assign(error, { details: intermediateResults });
      throw error;
    }
    
    // If there's an error in the response but we got fallback data
    if (subtopicsData.error) {
      console.warn("Warning from extract-subtopics function:", subtopicsData.error);
      toast.warning("Using fallback topics due to extraction issues", {
        description: subtopicsData.error,
        duration: 5000
      });
    }
    
    const { mainTopic, subtopics } = subtopicsData;
    intermediateResults.mainTopic = mainTopic;
    intermediateResults.subtopics = subtopics;
    
    if (!mainTopic || !Array.isArray(subtopics) || subtopics.length === 0) {
      console.error("Invalid subtopics data:", subtopicsData);
      const error = new Error("Failed to extract subtopics: Received invalid response");
      Object.assign(error, { details: intermediateResults });
      throw error;
    }
    
    console.log("Extracted subtopics:", subtopics);
    
    // Step 3: Research Subtopics
    console.log("Step 3: Researching subtopics...");
    const { data: researchData, error: researchError } = await supabase.functions.invoke('scrape-subtopics', {
      body: { subtopics }
    });
    
    if (researchError) {
      console.error("Subtopic research error:", researchError);
      const error = new Error(`Failed to research subtopics: ${researchError.message}`);
      Object.assign(error, { details: intermediateResults });
      throw error;
    }
    
    if (!researchData || !Array.isArray(researchData.formattedInfo)) {
      console.error("Invalid research data:", researchData);
      const error = new Error("Failed to research subtopics: Received invalid response");
      Object.assign(error, { details: intermediateResults });
      throw error;
    }
    
    const { formattedInfo } = researchData;
    intermediateResults.researchData = formattedInfo;
    console.log("Subtopic research completed successfully");
    
    // Step 4: Generate Final Report
    console.log("Step 4: Generating final report...");
    const { data: reportData, error: reportError } = await supabase.functions.invoke('generate-report', {
      body: { abstract, formattedInfo }
    });
    
    if (reportError) {
      console.error("Report generation error:", reportError);
      const error = new Error(`Failed to generate final report: ${reportError.message}`);
      Object.assign(error, { details: intermediateResults });
      throw error;
    }
    
    if (!reportData || !reportData.report) {
      console.error("Invalid report data:", reportData);
      const error = new Error("Failed to generate final report: Received invalid response");
      Object.assign(error, { details: intermediateResults });
      throw error;
    }
    
    console.log("Report generation completed successfully");
    
    // Include intermediate results in the final report
    return {
      ...reportData.report,
      intermediateResults
    };
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
      toast.error(error.message || "Failed to generate report from Gemini.", {
        description: "Check your Gemini API key in Supabase Edge Function Secrets.",
        duration: 6000
      });
    }
  });
}
