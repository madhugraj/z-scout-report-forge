
import { supabase } from "@/integrations/supabase/client";
import fallbackReport from "./fallbackGeminiReport";
import { GeminiReport } from "./types/geminiReportTypes";

export async function generateGeminiReport(query: string): Promise<GeminiReport> {
  try {
    console.log("Starting report generation for query:", query);

    const { data, error } = await supabase.functions.invoke('generate-report-gemini', {
      body: { query }
    });

    if (error) {
      console.error("Error invoking generate-report-gemini function:", error);
      throw new Error(`Failed to generate report: ${error.message}`);
    }

    if (!data) {
      console.error("No data returned from generate-report-gemini function");
      throw new Error("Failed to generate report: No data returned");
    }

    if (data.error) {
      console.error("Error from generate-report-gemini function:", data.error);
      throw Object.assign(
        new Error(`Gemini API error: ${data.error}`),
        { details: data.intermediateResults || {} }
      );
    }

    const report = data.report;

    const processedReport = {
      ...report,
      sections: report.sections || [],
      references: report.references || [],
      suggestedPdfs: report.suggestedPdfs || [],
      suggestedImages: report.suggestedImages || [],
      suggestedDatasets: report.suggestedDatasets || [],
      intermediateResults: {
        abstract: data.abstract,
        mainTopic: data.mainTopic,
        subtopics: data.subtopics,
        topicStructure: data.intermediateResults?.topicStructure,
        researchSample: data.intermediateResults?.researchSample
      }
    };

    return processedReport;
  } catch (error: any) {
    console.error("Error in report generation pipeline:", error);

    const details = error.details || {};

    const errorReport = {
      ...fallbackReport,
      title: `Error Report for "${query}"`,
      sections: [{
        title: "Error Details",
        content: `We encountered an error while generating your research report: "${error.message}". This may be due to issues with the Gemini API connection or configuration.\n\nTroubleshooting steps:\n1. Check that your Gemini API key is valid and correctly set up in the Supabase Edge Function Secrets.\n2. Verify that the API key has access to the Gemini model specified in the edge functions.\n3. Check the Edge Function logs for more detailed error information.`
      }],
      intermediateResults: details
    } as GeminiReport;

    // Optionally append additional info if present
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

    const enhancedError = new Error(error.message || "Failed to generate report");
    Object.assign(enhancedError, {
      details: details,
      errorReport: errorReport
    });
    throw enhancedError;
  }
}
