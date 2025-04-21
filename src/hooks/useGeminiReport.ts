
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export async function generateGeminiReport(query: string) {
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
    
    console.log("Report generated successfully");
    return data.report;
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
