
import { supabase } from "@/integrations/supabase/client";
import fallbackReport from "./fallbackGeminiReport";
import { GeminiReport } from "./types/geminiReportTypes";

export async function generateGeminiReport(query: string): Promise<GeminiReport> {
  try {
    console.log("Starting comprehensive report generation for query:", query);

    // Enhanced query with more specific academic research instructions
    const enhancedQuery = `${query} - COMPREHENSIVE ANALYSIS: Produce a detailed 40-50 page academic research report with in-depth analysis of all topics and subtopics, extensive data, statistics, scholarly references, and proper citations. Include clear methodology and literature review sections.`;

    const { data, error } = await supabase.functions.invoke('generate-report-gemini', {
      body: { 
        query: enhancedQuery,
        requestDepth: "comprehensive", 
        pageTarget: "40-50",
        generateFullReport: true,
        includeAllSubtopics: true,
        includeCitations: true,
        useAcademicFormat: true,
        maxReferences: 75, // Increased reference count
        includeDataPoints: true // Ensure data and statistics are included
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

    // Log detailed report statistics for debugging
    const sectionCount = report.sections?.length || 0;
    const referenceCount = report.references?.length || 0;
    const totalContentLength = report.sections?.reduce((sum, section) => 
      sum + (section.content?.length || 0), 0) || 0;
    const pdfCount = report.suggestedPdfs?.length || 0;
    const imageCount = report.suggestedImages?.length || 0;
    const datasetCount = report.suggestedDatasets?.length || 0;
    
    console.log(`Report statistics: ${sectionCount} sections, ${referenceCount} references, ${pdfCount} PDFs, ${imageCount} images, ${datasetCount} datasets, ~${Math.round(totalContentLength/1000)}K chars content`);

    // If the report is too small or has too few references, retry with stronger parameters
    const isReportTooSmall = totalContentLength < 25000;
    const hasTooFewReferences = referenceCount < 15;
    const hasInsufficientSections = sectionCount < 8;
    
    if ((isReportTooSmall || hasTooFewReferences || hasInsufficientSections) && !data.retryAttempted) {
      console.log(`Report quality insufficient (size: ${Math.round(totalContentLength/1000)}K chars, refs: ${referenceCount}, sections: ${sectionCount}), retrying with enhanced parameters...`);
      
      const { data: retryData, error: retryError } = await supabase.functions.invoke('generate-report-gemini', {
        body: { 
          query: enhancedQuery,
          requestDepth: "maximum",
          pageTarget: "60-80", 
          generateFullReport: true,
          includeAllSubtopics: true,
          forceDepth: true,
          maxReferences: 100, // Even more references on retry
          expandSubtopicCoverage: true, // New parameter to ensure broader coverage
          improveResearchDepth: true, // New parameter to increase depth
          includeCitations: true,
          useAcademicFormat: true,
          includeDataPoints: true,
          retryAttempt: true
        }
      });
      
      if (!retryError && retryData?.report) {
        const retryReport = retryData.report;
        const retryContentLength = retryReport.sections?.reduce((sum, section) => 
          sum + (section.content?.length || 0), 0) || 0;
        const retryReferenceCount = retryReport.references?.length || 0;
        const retryPdfCount = retryReport.suggestedPdfs?.length || 0;
          
        console.log(`Retry generated ${retryReport.sections?.length} sections with ~${Math.round(retryContentLength/1000)}K chars and ${retryReferenceCount} references, ${retryPdfCount} PDFs`);
        
        const isRetryBetter = retryContentLength > totalContentLength || retryReferenceCount > referenceCount;
        
        if (isRetryBetter) {
          console.log(`Using retry report as it has ${isRetryBetter ? 'more content and/or references' : 'better quality'}`);
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
                originalRefs: referenceCount,
                originalSections: sectionCount,
                retrySize: retryContentLength,
                retryRefs: retryReferenceCount,
                retrySections: retryReport.sections?.length || 0,
                contentImprovement: `${Math.round((retryContentLength - totalContentLength) / Math.max(1, totalContentLength) * 100)}%`,
                refImprovement: `${Math.round((retryReferenceCount - referenceCount) / Math.max(1, referenceCount) * 100)}%`
              }
            }
          };
        }
      }
    }

    // Normalize and process the report structure to ensure all fields are present
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

    // Create a more informative error report
    const errorReport = {
      ...fallbackReport,
      title: `Error Report for "${query}"`,
      sections: [{
        title: "Error Details",
        content: `We encountered an error while generating your research report: "${error.message}". This may be due to issues with the Gemini API connection or configuration.\n\nTroubleshooting steps:\n1. Check that your Gemini API key is valid and correctly set up in the Supabase Edge Function Secrets.\n2. Verify that the API key has access to the Gemini model specified in the edge functions.\n3. Check the Edge Function logs for more detailed error information.`
      }],
      intermediateResults: details
    } as GeminiReport;

    // Append any partial results if available
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

    if (details.topicStructure) {
      errorReport.sections.push({
        title: "Topic Structure",
        content: `**Research Structure**:\n\n${JSON.stringify(details.topicStructure, null, 2)}`
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
