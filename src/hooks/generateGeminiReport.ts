
import { supabase } from "@/integrations/supabase/client";
import fallbackReport from "./fallbackGeminiReport";
import { GeminiReport } from "./types/geminiReportTypes";

export async function generateGeminiReport(query: string): Promise<GeminiReport> {
  try {
    console.log("Starting comprehensive report generation for query:", query);

    // Enhanced query with explicit instructions for comprehensive topic coverage
    const enhancedQuery = `${query} - COMPREHENSIVE ACADEMIC RESEARCH WITH COMPLETE TOPIC COVERAGE: Generate a detailed, authoritative research report with extensive coverage of ALL major topics and subtopics. Include in-depth analysis supported by specific data, statistics, scholarly references, and proper citations. Ensure comprehensive exploration of the full breadth and depth of the subject.`;

    // Call our updated edge function with enhanced parameters for more comprehensive results
    const { data, error } = await supabase.functions.invoke('generate-report-gemini', {
      body: { 
        query: enhancedQuery,
        requestDepth: "maximum", // Request maximum depth
        pageTarget: "80-100", // Target more pages for comprehensive coverage
        generateFullReport: true,
        includeAllSubtopics: true,
        forceDepth: true, // Force deeper research
        forceBreadth: true, // NEW: Force broader topic coverage
        includeCitations: true,
        useAcademicFormat: true,
        maxReferences: 100, // Increased reference count
        includeDataPoints: true,
        expandSubtopicCoverage: true,
        improveResearchDepth: true,
        ensureCompleteCoverage: true, // NEW: Explicitly request complete topic coverage
        minimumTopicsRequired: 12, // NEW: Set minimum topics to cover
        minimumSubtopicsPerTopic: 10 // NEW: Set minimum subtopics per topic
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
    const isReportTooSmall = totalContentLength < 50000; // Increased minimum size
    const hasTooFewReferences = referenceCount < 25; // Increased minimum references
    const hasInsufficientSections = sectionCount < 15; // Increased minimum sections
    const hasTooFewTopics = (data.intermediateResults?.topicStructure?.topics?.length || 0) < 10; // NEW: Check for topic coverage
    
    const needsRetry = (isReportTooSmall || hasTooFewReferences || hasInsufficientSections || hasTooFewTopics) && !data.retryAttempted;
    
    if (needsRetry) {
      console.log(`Report quality insufficient (size: ${Math.round(totalContentLength/1000)}K chars, refs: ${referenceCount}, sections: ${sectionCount}, topics: ${data.intermediateResults?.topicStructure?.topics?.length || 0}), retrying with maximum parameters...`);
      
      // Try one more time with significantly enhanced parameters
      const { data: retryData, error: retryError } = await supabase.functions.invoke('generate-report-gemini', {
        body: { 
          query: `${enhancedQuery} ENSURE MAXIMUM DEPTH AND BREADTH IN ALL TOPICS AND SUBTOPICS.`,
          requestDepth: "absolute-maximum", // Request absolute maximum depth
          pageTarget: "120-150", // Target even more pages 
          generateFullReport: true,
          includeAllSubtopics: true,
          forceDepth: true,
          forceBreadth: true,
          expandSubtopicCoverage: true,
          improveResearchDepth: true,
          maxReferences: 150, // Even more references
          includeCitations: true,
          useAcademicFormat: true,
          includeDataPoints: true,
          ensureCompleteCoverage: true,
          minimumTopicsRequired: 15,
          minimumSubtopicsPerTopic: 12,
          retryAttempt: true,
          increaseResearchBreadth: true, // NEW: Additional parameter for more breadth
          prioritizeTopicCoverage: true // NEW: Prioritize covering all topics
        }
      });
      
      if (!retryError && retryData?.report) {
        const retryReport = retryData.report;
        const retryContentLength = retryReport.sections?.reduce((sum, section) => 
          sum + (section.content?.length || 0), 0) || 0;
        const retryReferenceCount = retryReport.references?.length || 0;
        const retryPdfCount = retryReport.suggestedPdfs?.length || 0;
        const retrySectionCount = retryReport.sections?.length || 0;
          
        console.log(`Retry generated ${retrySectionCount} sections with ~${Math.round(retryContentLength/1000)}K chars and ${retryReferenceCount} references, ${retryPdfCount} PDFs`);
        
        const isRetryBetter = retryContentLength > totalContentLength * 1.2 || 
                              retryReferenceCount > referenceCount * 1.2 || 
                              retrySectionCount > sectionCount * 1.2;
        
        if (isRetryBetter) {
          console.log(`Using retry report as it has significantly better quality metrics`);
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
                retrySections: retrySectionCount,
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
