
// Generate full report with Google grounding and comprehensive search
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, callGemini, GEMINI_API_KEY } from "./utils/gemini-client.ts";
import { researchSubtopic, getBalancedSubtopics } from "./utils/topic-research.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { 
      query, 
      requestDepth = "comprehensive", 
      pageTarget = "40-50",
      generateFullReport = true,
      includeAllSubtopics = true,
      forceDepth = false,
      retryAttempt = false
    } = await req.json();
    
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 500,
        headers: corsHeaders
      });
    }

    console.log(`Starting research process for query: "${query}"`);
    console.log(`Generation parameters: depth=${requestDepth}, pages=${pageTarget}, fullReport=${generateFullReport}`);

    // Step 1: Generate a comprehensive abstract
    const abstractPrompt = `
Generate a comprehensive, professional 500-word abstract for a detailed research report on:
"${query}"

The abstract should:
- Provide a clear overview of the research scope and significance
- Highlight key methodological approaches
- Identify major themes and findings
- Use formal academic language
- Be thorough enough to guide a comprehensive research report

Your abstract will form the foundation for an extensive research report with multiple major topics and subtopics.`;

    console.log("Step 1: Generating abstract...");
    const abstract = await callGemini(abstractPrompt, false);
    console.log(`Abstract generated (${abstract.length} chars)`);

    // Step 2: Extract topic structure with more detailed guidance
    const topicsPrompt = `
Based on this abstract:
"""
${abstract}
"""

Extract:
1. A clear, concise main topic (1 line)
2. A list of AT LEAST 10-12 major topics related to this research area. Each topic should be broad and substantive enough to form a major chapter in a comprehensive ${pageTarget}-page research report.
3. For EACH major topic, provide 8-12 specific, focused subtopics that warrant detailed investigation.

Return in this JSON format ONLY:
{
  "mainTopic": "The central research topic",
  "topics": [
    {
      "title": "First Major Topic",
      "subtopics": ["Subtopic 1.1", "Subtopic 1.2", "Subtopic 1.3", ...]
    },
    {
      "title": "Second Major Topic", 
      "subtopics": ["Subtopic 2.1", "Subtopic 2.2", "Subtopic 2.3", ...]
    }
  ]
}

Instructions:
- Ensure each major topic is distinct and substantive
- Each subtopic should be specific enough for focused research
- Output valid JSON only, no commentary or markdown
- For maximum depth, err on the side of giving more subtopics per topic (10-12)
`;

    console.log("Step 2: Extracting topic structure...");
    const topicStructureText = await callGemini(topicsPrompt, false);
    
    let topicStructure;
    let mainTopic;
    let topics = [];
    
    try {
      // Handle potential JSON formatting issues
      const jsonMatch = topicStructureText.match(/```(?:json)?\s*([\s\S]+?)\s*```/) || 
                      topicStructureText.match(/({[\s\S]+})/);
      
      const jsonText = jsonMatch ? jsonMatch[1] : topicStructureText;
      topicStructure = JSON.parse(jsonText);
      
      mainTopic = topicStructure.mainTopic;
      topics = topicStructure.topics || [];
      
      console.log(`Successfully parsed topic structure with ${topics.length} topics`);
      
      // Log topic and subtopic counts to help diagnose issues
      const subtopicCounts = topics.map(t => t.subtopics?.length || 0);
      const totalSubtopics = subtopicCounts.reduce((a, b) => a + b, 0);
      console.log(`Topic breakdown: ${topics.length} topics with ${totalSubtopics} total subtopics`);
      console.log(`Subtopics per topic: ${subtopicCounts.join(', ')}`);
      
    } catch (e) {
      console.error("Failed to parse topic structure JSON:", e);
      console.log("Raw topic structure text:", topicStructureText.substring(0, 500) + "...");
      throw new Error("Topic structure parsing failed. Check Gemini API response format.");
    }

    // Skip research phase if not generating full report
    if (!generateFullReport) {
      console.log("Skipping research phase, returning topic structure only...");
      return new Response(JSON.stringify({
        abstract,
        mainTopic,
        topics: topics.map(t => t.title),
        subtopics: topics.flatMap(t => t.subtopics),
        intermediateResults: { topicStructure },
        report: {
          title: `Research Structure: ${mainTopic}`,
          sections: [
            { title: "Abstract", content: abstract },
            { title: "Main Topics", content: topics.map(t => `## ${t.title}\n\n${t.subtopics.map(s => `- ${s}`).join('\n')}`).join('\n\n') }
          ],
          references: [],
          suggestedPdfs: [],
          suggestedImages: [],
          suggestedDatasets: []
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Step 3: Generate the full report directly using the topic structure
    // This is a major change - instead of researching each topic separately,
    // we'll have Gemini generate a complete report in one go based on the topic structure
    console.log("Step 3: Generating full comprehensive report...");
    
    // Format the topic structure for the prompt
    const topicStructureForPrompt = topics.map(topic => {
      return `## ${topic.title}\n${topic.subtopics.map(st => `- ${st}`).join('\n')}`;
    }).join('\n\n');
    
    const fullReportPrompt = `
You are a distinguished academic researcher creating a comprehensive scholarly report.

RESEARCH TOPIC: "${mainTopic}"

DETAILED TOPIC STRUCTURE:
${topicStructureForPrompt}

Your task is to create a complete, in-depth research report covering ALL of these topics and subtopics. The report must be:
- Comprehensive (approximately ${pageTarget} pages when printed)
- Well-structured with clear sections and subsections
- Evidence-based with specific statistics, data points, and facts
- Properly referenced with at least 30-40 academic citations

Include the following sections:
1. Title (descriptive and specific)
2. Executive Summary (concise overview of key findings)
3. Table of Contents (detailed with all sections and subsections)
4. Introduction (context, significance, and scope)
5. COMPLETE SECTIONS FOR EVERY MAJOR TOPIC listed above
   - Each major topic should be its own section with proper heading
   - Each subtopic should be thoroughly covered as a subsection
   - Include SPECIFIC data, statistics, and research findings for each subtopic
6. Synthesis of Key Findings (cross-cutting themes and insights)
7. Conclusion (implications and future directions)
8. References (at least 30-40 properly formatted citations)

CRITICAL REQUIREMENTS:
- INCLUDE ALL topics and subtopics from the structure above
- Each topic section must be at least 2-3 pages of substantive content
- Each subtopic must have at least 1-2 paragraphs of specific information
- Include specific statistics, percentages, dates, and quantitative data
- DO NOT use placeholders or mention "beyond the scope of this report"
- Format ALL content in proper Markdown
- Include at least 30-40 academic references with proper citations
- Format your response as valid JSON with this structure:
{
  "title": "Complete report title",
  "sections": [
    {"title": "Section Title", "content": "Full markdown content with all data and information"},
    ...more sections with ALL content
  ],
  "references": [
    {"id": 1, "title": "Source Title", "authors": "Author Names", "year": "Year", "journal": "Journal/Publisher"},
    ...more references
  ],
  "suggestedPdfs": [
    {"title": "PDF Title", "author": "Author", "description": "Brief description", "relevance": "Relevance to research"},
    ...more PDFs
  ],
  "suggestedImages": [
    {"title": "Image Title", "description": "Description", "source": "Source"},
    ...more images
  ],
  "suggestedDatasets": [
    {"title": "Dataset Title", "description": "Brief description", "source": "Source organization"},
    ...more datasets
  ]
}

Begin with research on the provided topic structure and create a COMPREHENSIVE report with SUBSTANTIAL CONTENT for each section.`;

    // Set a higher token limit for the comprehensive report
    const reportText = await callGemini(fullReportPrompt, true, 32000);
    console.log(`Report generated (${reportText.length} chars), parsing JSON...`);
    
    let report;
    try {
      // Improved JSON extraction with better error handling
      const jsonMatch = reportText.match(/```(?:json)?\s*([\s\S]+?)\s*```/) || 
                      reportText.match(/({[\s\S]+})/);
      
      if (!jsonMatch) {
        console.error("Could not find JSON in the response. Raw response:", reportText.substring(0, 1000) + "...");
        throw new Error("Could not extract JSON from Gemini response");
      }
      
      const jsonText = jsonMatch[1];
      report = JSON.parse(jsonText);
      
      // Validate the report structure
      if (!report.title || !report.sections || !Array.isArray(report.sections) || report.sections.length === 0) {
        console.error("Invalid report structure:", report);
        throw new Error("Invalid report structure from Gemini API");
      }
      
      // Log detailed report statistics for better debugging
      console.log(`Report parsed successfully. Title: "${report.title}"`);
      console.log(`Report contains ${report.sections.length} sections and ${report.references?.length || 0} references`);
      
      const totalWords = report.sections.reduce(
        (sum, section) => sum + (section.content?.split(/\s+/).length || 0), 0
      );
      const totalChars = report.sections.reduce(
        (sum, section) => sum + (section.content?.length || 0), 0
      );
      
      console.log(`Total content: ~${totalWords} words, ~${totalChars} characters`);
      
      // Check if we need to retry with enhanced parameters
      const isReportTooSmall = report.sections.length < 10 || totalChars < 50000;
      if (isReportTooSmall && !retryAttempt) {
        console.log("Report seems too small, will retry with enhanced parameters");
        
        // Call this function again with retryAttempt=true
        const retryBody = {
          query,
          requestDepth: "maximum",
          pageTarget: "80-100",
          generateFullReport: true,
          includeAllSubtopics: true,
          forceDepth: true,
          retryAttempt: true
        };
        
        const { data: retryData, error: retryError } = await fetch(req.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(retryBody)
        }).then(r => r.json());
        
        if (!retryError && retryData?.report) {
          return new Response(JSON.stringify(retryData), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }
    } catch (e) {
      console.error("Failed to parse report JSON:", e);
      console.log("Raw report text (first 1000 chars):", reportText.substring(0, 1000) + "...");
      throw new Error(`Report parsing failed: ${e.message}`);
    }

    // Ensure all collections in the report are properly initialized
    report.references = report.references || [];
    report.suggestedPdfs = report.suggestedPdfs || [];
    report.suggestedImages = report.suggestedImages || [];
    report.suggestedDatasets = report.suggestedDatasets || [];
    
    // Final response with complete research data
    const result = {
      report,
      abstract,
      mainTopic,
      topics: topics.map(t => t.title),
      subtopics: topics.flatMap(t => t.subtopics),
      retryAttempted: retryAttempt,
      intermediateResults: {
        topicStructure
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Error during research process:", err);
    return new Response(JSON.stringify({ 
      error: err.message,
      stack: err.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
