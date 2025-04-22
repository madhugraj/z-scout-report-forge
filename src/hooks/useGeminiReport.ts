
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
  doi?: string; // Adding optional doi property
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
    
    // Step 1: Generate Abstract
    console.log("Step 1: Generating abstract...");
    const { data: abstractData, error: abstractError } = await supabase.functions.invoke('generate-abstract', {
      body: { query }
    });
    
    if (abstractError) {
      console.error("Abstract generation error:", abstractError);
      throw new Error(`Failed to generate abstract: ${abstractError.message}`);
    }
    
    if (!abstractData) {
      console.error("No data returned from abstract generation");
      throw new Error("Failed to generate abstract: No data returned");
    }
    
    // Even if there's an error generating the abstract, the function now returns a fallback one
    const abstract = abstractData.abstract;
    if (!abstract || abstract.trim() === "") {
      console.error("Empty abstract received:", abstractData);
      throw new Error("Failed to generate abstract: Empty abstract received");
    }
    
    console.log("Abstract generated successfully:", abstract.substring(0, 100) + "...");
    
    // Step 2: Extract Subtopics
    console.log("Step 2: Extracting subtopics...");
    const { data: subtopicsData, error: subtopicsError } = await supabase.functions.invoke('extract-subtopics', {
      body: { abstract }
    });
    
    if (subtopicsError) {
      console.error("Subtopics extraction error:", subtopicsError);
      throw new Error(`Failed to extract subtopics: ${subtopicsError.message}`);
    }
    
    if (!subtopicsData || !subtopicsData.mainTopic || !Array.isArray(subtopicsData.subtopics)) {
      console.error("Invalid subtopics data:", subtopicsData);
      throw new Error("Failed to extract subtopics: Received invalid response");
    }
    
    const { mainTopic, subtopics } = subtopicsData;
    console.log("Extracted subtopics:", subtopics);
    
    // Step 3: Research Subtopics
    console.log("Step 3: Researching subtopics...");
    const { data: researchData, error: researchError } = await supabase.functions.invoke('scrape-subtopics', {
      body: { subtopics }
    });
    
    if (researchError) {
      console.error("Subtopic research error:", researchError);
      throw new Error(`Failed to research subtopics: ${researchError.message}`);
    }
    
    if (!researchData || !Array.isArray(researchData.formattedInfo)) {
      console.error("Invalid research data:", researchData);
      throw new Error("Failed to research subtopics: Received invalid response");
    }
    
    const { formattedInfo } = researchData;
    console.log("Subtopic research completed successfully");
    
    // Step 4: Generate Final Report
    console.log("Step 4: Generating final report...");
    const { data: reportData, error: reportError } = await supabase.functions.invoke('generate-report', {
      body: { abstract, formattedInfo }
    });
    
    if (reportError) {
      console.error("Report generation error:", reportError);
      throw new Error(`Failed to generate final report: ${reportError.message}`);
    }
    
    if (!reportData || !reportData.report) {
      console.error("Invalid report data:", reportData);
      throw new Error("Failed to generate final report: Received invalid response");
    }
    
    console.log("Report generation completed successfully");
    return reportData.report;
  } catch (error: any) {
    console.error("Error in report generation pipeline:", error);
    
    // Creating a fallback report with error information
    const errorReport = {
      ...fallbackReport,
      title: `Error Report for "${query}"`,
      sections: [{
        title: "Error Information",
        content: `We encountered an error while generating your research report: "${error.message}". This may be due to issues with the Gemini API connection or configuration. Please check that your API key is valid and try again.`
      }]
    };
    
    throw new Error(error.message || "Failed to generate report");
  }
}

export function useGeminiReport() {
  return useMutation({
    mutationFn: (query: string) => generateGeminiReport(query),
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast.error(error.message || "Failed to generate report from Gemini.");
    }
  });
}
