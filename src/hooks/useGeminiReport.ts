
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";

export async function generateGeminiReport(query: string) {
  const response = await fetch(
    "https://jtdwgpqfratkepiwtmud.functions.supabase.co/generate-report-gemini",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to generate report.");
  }
  return data.report;
}

export function useGeminiReport() {
  return useMutation({
    mutationFn: (query: string) => generateGeminiReport(query),
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate report from Gemini.");
    }
  });
}
