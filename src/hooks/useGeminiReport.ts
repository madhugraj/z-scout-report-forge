
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
    const { data: abstractData, error: abstractError } = await supabase.functions.invoke('generate-abstract', {
      body: { query }
    });
    if (abstractError) throw new Error("Failed to generate abstract");
    const abstract = abstractData.abstract;
    
    // Step 2: Extract Subtopics
    const { data: subtopicsData, error: subtopicsError } = await supabase.functions.invoke('extract-subtopics', {
      body: { abstract }
    });
    if (subtopicsError) throw new Error("Failed to extract subtopics");
    const { mainTopic, subtopics } = subtopicsData;
    
    // Step 3: Research Subtopics
    const { data: researchData, error: researchError } = await supabase.functions.invoke('scrape-subtopics', {
      body: { subtopics }
    });
    if (researchError) throw new Error("Failed to research subtopics");
    const { formattedInfo } = researchData;
    
    // Step 4: Generate Final Report
    const { data: reportData, error: reportError } = await supabase.functions.invoke('generate-report', {
      body: { abstract, formattedInfo }
    });
    if (reportError) throw new Error("Failed to generate final report");
    
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
