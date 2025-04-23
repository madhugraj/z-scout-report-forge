
import { supabase } from "@/integrations/supabase/client";
import fallbackReport from "./fallbackGeminiReport";
import { GeminiReport } from "./types/geminiReportTypes";

export async function generateGeminiReport(query: string): Promise<GeminiReport> {
  try {
    console.log("Starting comprehensive report generation for query:", query);

    // First, enhance the query with specific instructions for depth
    const enhancedQuery = `${query} - COMPREHENSIVE ANALYSIS: Produce a detailed 40-50 page research report with in-depth analysis of all topics and subtopics, extensive data, statistics, and academic references`;

    const { data, error } = await supabase.functions.invoke('generate-report-gemini', {
      body: { 
        query: enhancedQuery,
        requestDepth: "comprehensive", 
        pageTarget: "40-50",
        generateFullReport: true,
        includeAllSubtopics: true
      }
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

    // Log report statistics to help with debugging
    const sectionCount = report.sections?.length || 0;
    const referenceCount = report.references?.length || 0;
    const totalContentLength = report.sections?.reduce((sum, section) => 
      sum + (section.content?.length || 0), 0) || 0;
    
    console.log(`Report statistics: ${sectionCount} sections, ${referenceCount} references, ~${Math.round(totalContentLength/1000)}K chars content`);

    // If the report is too small, we should retry with stronger parameters
    if (totalContentLength < 10000 && !data.retryAttempted) {
      console.log("Report content is too small, retrying with enhanced parameters...");
      const { data: retryData, error: retryError } = await supabase.functions.invoke('generate-report-gemini', {
        body: { 
          query: enhancedQuery,
          requestDepth: "maximum",
          pageTarget: "60-80", 
          generateFullReport: true,
          includeAllSubtopics: true,
          forceDepth: true,
          retryAttempt: true
        }
      });
      
      if (!retryError && retryData?.report) {
        const retryReport = retryData.report;
        const retryContentLength = retryReport.sections?.reduce((sum, section) => 
          sum + (section.content?.length || 0), 0) || 0;
          
        console.log(`Retry generated ${retryReport.sections?.length} sections with ~${Math.round(retryContentLength/1000)}K chars`);
        
        if (retryContentLength > totalContentLength) {
          console.log("Using retry report as it has more content");
          return {
            ...retryReport,
            sections: retryReport.sections || [],
            references: retryReport.references || [],
            suggestedPdfs: retryReport.suggestedPdfs || [],
            suggestedImages: retryReport.suggestedImages || [],
            suggestedDatasets: retryReport.suggestedDatasets || [],
            intermediateResults: {
              ...data.intermediateResults,
              retryStats: {
                originalSize: totalContentLength,
                retrySize: retryContentLength,
                improvement: `${Math.round((retryContentLength - totalContentLength) / totalContentLength * 100)}%`
              }
            }
          };
        }
      }
    }

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
