
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
}

export interface SuggestedPdf {
  title: string;
  author: string;
  description: string;
  relevance: string;
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
    console.log("Generating report for query:", query);
    
    // Use Supabase's function.invoke method
    const { data, error } = await supabase.functions.invoke('generate-report-gemini', {
      body: { query }
    });
    
    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(error.message || "Failed to generate report");
    }
    
    if (!data || !data.report) {
      console.error("Invalid response format:", data);
      throw new Error("Invalid response from Gemini API");
    }
    
    // Ensure all expected fields are present in the report
    const report: GeminiReport = {
      title: data.report.title || query,
      sections: data.report.sections || [],
      references: data.report.references || [],
      suggestedPdfs: data.report.suggestedPdfs || [],
      suggestedImages: data.report.suggestedImages || [],
      suggestedDatasets: data.report.suggestedDatasets || []
    };
    
    console.log("Report generated successfully");
    return report;
  } catch (error: any) {
    console.error("Error generating report:", error);
    throw new Error(error.message || "Failed to generate report from Gemini.");
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
