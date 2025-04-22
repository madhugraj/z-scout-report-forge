
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
    
    if (!abstractData || !abstractData.abstract) {
      console.error("Invalid abstract data:", abstractData);
      throw new Error("Failed to generate abstract: Received invalid response");
    }
    
    const abstract = abstractData.abstract;
    console.log("Abstract generated successfully");
    
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
