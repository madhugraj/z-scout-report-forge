
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { generateGeminiReport } from "./generateGeminiReport";
import { GeminiReport } from "./types/geminiReportTypes";

export * from "./types/geminiReportTypes";

export function useGeminiReport() {
  return useMutation({
    mutationFn: (query: string) => generateGeminiReport(query),
    onMutate: () => {
      toast.info("Starting comprehensive research report generation", {
        description: "This may take 1-2 minutes to complete. We'll notify you when it's ready.",
        duration: 5000
      });
    },
    onError: (error: any) => {
      console.error("Mutation error in research report generation:", error);
      
      // Create a more detailed error toast with clearer instructions
      toast.error("Failed to generate comprehensive research report", {
        description: `${error.message || "Unknown error"}. Check the Gemini API key in Supabase Edge Function Secrets.`,
        duration: 10000
      });

      // Log any additional error details for debugging
      if (error.details) {
        console.error("Additional error details:", error.details);
      }
      
      // If we have a pre-formatted error report (e.g., from a partial generation),
      // return it so the UI can still display something useful
      if (error.errorReport) {
        return error.errorReport;
      }
      
      // Otherwise return a basic error report
      return {
        title: "Research Report Generation Failed",
        sections: [
          {
            title: "Error Information",
            content: `We encountered an error: ${error.message || "Unknown error"}. Please try again or check your Gemini API configuration.`
          },
          {
            title: "Troubleshooting Steps",
            content: `
1. Verify that your Gemini API key is correctly set up in the Supabase Edge Function Secrets.
2. Check that the API key has proper permissions to access the Gemini model (gemini-1.5-flash-latest).
3. Examine the Edge Function logs in your Supabase dashboard for more detailed error information.
4. Consider simplifying your research query if it's very complex or long.
5. Try again later as the service might be experiencing temporary issues.`
          }
        ],
        references: [],
        suggestedPdfs: [],
        suggestedImages: [],
        suggestedDatasets: []
      };
    },
    onSuccess: (data) => {
      // Check if the report has sufficient content
      const sectionCount = data.sections.length;
      const referenceCount = data.references?.length || 0;
      const totalWords = data.sections.reduce((count, section) => 
        count + (section.content?.split(/\s+/).length || 0), 0);
      
      // Determine if the report is high quality based on metrics
      const isHighQuality = sectionCount > 10 && referenceCount > 20 && totalWords > 5000;
      
      if (isHighQuality) {
        toast.success(`Comprehensive research report generated successfully`, {
          description: `${sectionCount} sections, ${referenceCount} references, ~${totalWords} words`,
          duration: 5000
        });
      } else {
        toast.warning(`Research report generated with limited content`, {
          description: "The report has fewer sections or references than expected. Try refining your query.",
          duration: 8000
        });
      }
      
      return data;
    }
  });
}
