import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { generateGeminiReport } from "./generateGeminiReport";
import { GeminiReport } from "./types/geminiReportTypes";

export * from "./types/geminiReportTypes";

export function useGeminiReport() {
  return useMutation({
    mutationFn: (query: string) => generateGeminiReport(query),
    onError: (error: any) => {
      console.error("Mutation error in research report generation:", error);
      
      // Create a more detailed error toast with clearer instructions
      toast.error("Failed to generate comprehensive research report", {
        description: `${error.message || "Unknown error"}. Check the Gemini API key in Supabase Edge Function Secrets.`,
        duration: 8000
      });

      // If we have a pre-formatted error report (e.g., from a partial generation),
      // return it so the UI can still display something useful
      if (error.errorReport) {
        return error.errorReport;
      }
      
      // Otherwise return a basic error report
      return {
        title: "Research Report Generation Failed",
        sections: [{
          title: "Error Information",
          content: `We encountered an error: ${error.message || "Unknown error"}. Please try again or check your Gemini API configuration.`
        }],
        references: [],
        suggestedPdfs: [],
        suggestedImages: [],
        suggestedDatasets: []
      };
    }
  });
}
