import { supabase } from "@/integrations/supabase/client";
import fallbackReport from "./fallbackGeminiReport";
import { GeminiReport } from "./types/geminiReportTypes";
import { toast } from "@/components/ui/sonner";

export async function generateGeminiReport(query: string): Promise<GeminiReport> {
  try {
    // First, explicitly test if the Gemini API key is configured and valid
    console.log("Testing Gemini API key before attempting report generation");
    const { data: apiKeyTest, error: apiKeyError } = await supabase.functions.invoke('test-gemini-key', {
      body: { test: true }
    });
    
    if (apiKeyError) {
      console.error("Failed to test Gemini API key:", apiKeyError);
      throw new Error(`Gemini API key test failed: ${apiKeyError.message}. Please check Edge Function logs and verify your API key.`);
    }
    
    if (apiKeyTest && apiKeyTest.error) {
      console.error("Gemini API key is invalid:", apiKeyTest.error, apiKeyTest.details);
      throw new Error(`Invalid Gemini API key: ${apiKeyTest.error}. ${apiKeyTest.resolution || ''}`);
    }
    
    if (!apiKeyTest || !apiKeyTest.success) {
      console.error("Unknown error while testing Gemini API key:", apiKeyTest);
      throw new Error("Failed to verify Gemini API key. Please check Edge Function logs for details.");
    }
    
    console.log("Gemini API key is valid. Proceeding with report generation for query:", query);

    // Enhanced query with explicit grounding instructions
    const enhancedQuery = `${query} - COMPREHENSIVE ACADEMIC RESEARCH WITH WEB-BASED GROUNDING: Generate a detailed, authoritative research report using web search grounding for current information. Include in-depth analysis supported by specific data, statistics, scholarly references with dates, and proper citations. Ensure up-to-date information by utilizing your internet search capabilities to access current information.`;

    // Call our updated edge function with enhanced parameters for grounding and search
    const { data, error } = await supabase.functions.invoke('generate-report-gemini', {
      body: { 
        query: enhancedQuery,
        requestDepth: "maximum",
        pageTarget: "80-100",
        generateFullReport: true,
        includeAllSubtopics: true,
        forceDepth: true,
        forceBreadth: true,
        includeCitations: true,
        useAcademicFormat: true,
        maxReferences: 100,
        includeDataPoints: true,
        expandSubtopicCoverage: true,
        improveResearchDepth: true,
        ensureCompleteCoverage: true,
        minimumTopicsRequired: 12,
        minimumSubtopicsPerTopic: 10,
        retryOnFailure: true,
        enableGrounding: true, // Enable grounding explicitly
        useWebSearch: true,    // Use web search for up-to-date information
        enableMixedSearch: true // Mix web search with model knowledge
      }
    });

    if (error) {
      console.error("Error invoking generate-report-gemini function:", error);
      
      // More detailed error information to help with debugging
      const errorDetails = {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack,
        details: "See Edge Function logs for more information"
      };
      
      console.error("Error details:", errorDetails);
      toast.error("Failed to generate report", { 
        description: `Error code: ${error.code}. Check the Gemini API key in Supabase Edge Function Secrets.`,
        duration: 10000
      });
      
      throw new Error(`Failed to generate report: ${error.message}`);
    }

    if (!data) {
      console.error("No data returned from generate-report-gemini function");
      throw new Error("Failed to generate report: No data returned from edge function");
    }

    if (data.error) {
      console.error("Error from generate-report-gemini function:", data.error);
      throw Object.assign(
        new Error(`Gemini API error: ${data.error}`),
        { details: data.intermediateResults || {} }
      );
    }

    // Check if we actually got a proper report structure
    if (!data.report || !data.report.sections || !Array.isArray(data.report.sections) || data.report.sections.length === 0) {
      console.error("Invalid or empty report structure received:", data);
      throw new Error("Invalid report structure received from Gemini API");
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
    const hasTooFewTopics = (data.intermediateResults?.topicStructure?.topics?.length || 0) < 10; // Check for topic coverage
    
    const needsRetry = (isReportTooSmall || hasTooFewReferences || hasInsufficientSections || hasTooFewTopics) && !data.retryAttempted;
    
    if (needsRetry) {
      console.log(`Report quality insufficient (size: ${Math.round(totalContentLength/1000)}K chars, refs: ${referenceCount}, sections: ${sectionCount}, topics: ${data.intermediateResults?.topicStructure?.topics?.length || 0}), retrying with maximum parameters...`);
      
      toast.info("Initial report was insufficient, generating enhanced report...", {
        duration: 5000
      });
      
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
          increaseResearchBreadth: true, // Additional parameter for more breadth
          prioritizeTopicCoverage: true, // Prioritize covering all topics
          useEnhancedPrompt: true, // Use an enhanced prompt with more detailed instructions
          bypassTokenLimit: true // Try to bypass token limits by chunking report generation
        }
      });
      
      if (retryError) {
        console.error("Error in retry attempt:", retryError);
        // Continue with the original report even if retry fails
      } else if (retryData?.report) {
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
          toast.success("Enhanced report generated successfully", { duration: 3000 });
          
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
      ...data.report,
      sections: data.report.sections || [],
      references: data.report.references || [],
      suggestedPdfs: data.report.suggestedPdfs || [],
      suggestedImages: data.report.suggestedImages || [],
      suggestedDatasets: data.report.suggestedDatasets || [],
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

    // If the error is related to the edge function, provide a clearer error message
    if (error.message && error.message.includes('Edge Function returned a non-2xx status code')) {
      console.error("Edge Function returned an error status. This typically indicates an issue with the API key configuration or model access.");
      
      // Try to extract the status code for more specific guidance
      const statusMatch = error.message.match(/status code (\d+)/i);
      const statusCode = statusMatch ? statusMatch[1] : 'unknown';
      
      let errorGuide = '';
      if (statusCode === '400') {
        errorGuide = 'This typically indicates a problem with the request format or the API key format.';
      } else if (statusCode === '401' || statusCode === '403') {
        errorGuide = 'This typically indicates an authentication problem. Your API key may be invalid or doesn\'t have permission to access the gemini-1.5-pro-002 model.';
      } else if (statusCode === '404') {
        errorGuide = 'This typically indicates that the requested model (gemini-1.5-pro-002) was not found. Verify your API key has access to this model.';
      } else if (statusCode === '429') {
        errorGuide = 'You have exceeded your rate limit or quota. Check your Google AI Studio quota settings.';
      } else if (statusCode.startsWith('5')) {
        errorGuide = 'There is a server-side issue with the Gemini API. Please try again later.';
      }
      
      const enhancedError = new Error(`Gemini API error (status ${statusCode}): ${errorGuide || error.message}`);
      Object.assign(enhancedError, { details: error.details || {} });
      throw enhancedError;
    }

    const details = error.details || {};

    // Create a more informative error report with better troubleshooting guidance
    const errorReport = {
      ...fallbackReport,
      title: `Error Report for "${query}"`,
      sections: [{
        title: "Error Details",
        content: `We encountered an error while generating your research report: "${error.message}". This may be due to issues with the Gemini API connection or configuration.\n\nTroubleshooting steps:\n1. Check that your Gemini API key is valid and correctly set up in the Supabase Edge Function Secrets.\n2. Verify that the API key has access to the gemini-1.5-pro model.\n3. Check the Edge Function logs for more detailed error information.\n4. Try testing your API key using the "Test API Key" button below.\n\nIf you continue to experience issues, try modifying your query to be more specific or shorter, or try again later as the Gemini API may be experiencing temporary limitations.`
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
