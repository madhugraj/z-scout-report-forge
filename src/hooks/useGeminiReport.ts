
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { generateGeminiReport } from "./generateGeminiReport";
import { GeminiReport } from "./types/geminiReportTypes";

export * from "./types/geminiReportTypes";

export function useGeminiReport() {
  return useMutation({
    mutationFn: (query: string) => generateGeminiReport(query),
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast.error(error.message || "Failed to generate comprehensive report from Gemini.", {
        description: "Check your Gemini API key in Supabase Edge Function Secrets.",
        duration: 6000
      });

      if (error.errorReport) {
        return error.errorReport;
      }
    }
  });
}
