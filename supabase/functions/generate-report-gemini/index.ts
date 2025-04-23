
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
      retryAttempt = false,
      includeCitations = true,
      useAcademicFormat = true,
      maxReferences = 50,
      includeDataPoints = true,
      expandSubtopicCoverage = false,
      improveResearchDepth = false,
      minimumTopicsRequired = 10,
      minimumSubtopicsPerTopic = 8
    } = await req.json();
    
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 500,
        headers: corsHeaders
      });
    }

    console.log(`Starting ${requestDepth} research process for query:`, query);
    console.log(`Target: ${pageTarget} pages, Full report: ${generateFullReport}, Include all subtopics: ${includeAllSubtopics}, Force depth: ${forceDepth}`);
    console.log(`Academic format: ${useAcademicFormat}, Citations: ${includeCitations}, Max references: ${maxReferences}`);

    // Stage 1: Generate Comprehensive Abstract
    const abstractPrompt = `
Generate a comprehensive, professional 500-600 word abstract for a detailed research report on this topic:
"${query}"

The abstract should:
- Provide a clear overview of the research scope and significance
- Highlight key methodological approaches and academic relevance
- Identify major themes, findings, and implications
- Use formal academic language appropriate for scholarly publication
- Be thorough enough to guide a comprehensive research report of ${pageTarget} pages
${useAcademicFormat ? "- Follow formal academic writing conventions throughout" : ""}

Your abstract will form the foundation for an extensive research report with multiple major topics and subtopics.`;

    console.log("Stage 1: Generating comprehensive abstract...");
    const abstract = await callGemini(abstractPrompt, false);

    // Stage 2: Extract Topic Structure
    console.log("Stage 2: Extracting topic structure...");
    const topicsPrompt = `
Based on this abstract:
"""
${abstract}
"""

Extract:
1. A clear, concise main topic (1 line)
2. A list of **AT LEAST ${minimumTopicsRequired}-${minimumTopicsRequired + 2} major topics** related to this research area. Each topic should be broad and substantive enough to form a major chapter in a comprehensive ${pageTarget}-page research report.
3. For EACH major topic, provide **${minimumSubtopicsPerTopic} to ${minimumSubtopicsPerTopic + 5} specific, focused subtopics** that warrant detailed investigation.

Return in this JSON format ONLY:
{
  "mainTopic": "The central research topic",
  "topics": [
    {
      "title": "First Major Topic",
      "subtopics": ["Subtopic 1.1", "Subtopic 1.2", ..., "Subtopic 1.${minimumSubtopicsPerTopic + 5}"]
    },
    {
      "title": "Second Major Topic",
      "subtopics": ["Subtopic 2.1", "Subtopic 2.2", ..., "Subtopic 2.${minimumSubtopicsPerTopic + 5}"]
    },
    ...and so on for at least ${minimumTopicsRequired}-${minimumTopicsRequired + 2} major topics
  ]
}

Instructions:
- Ensure each major topic is distinct, substantive, and covers a unique, essential aspect of the research field.
- Each subtopic should be specific enough for focused research and designed to generate detailed, evidence-based sections in a professional report.
- Output valid JSON only, *no commentary or markdown*.
- For maximum depth, err on the side of giving *more subtopics per topic (prefer ${minimumSubtopicsPerTopic + 5} where possible)*.
- IMPORTANT: The final report will be ${pageTarget} pages, so ensure ALL topics and subtopics are substantive enough to support this length.
${expandSubtopicCoverage ? "- Ensure comprehensive coverage of the field with NO MAJOR SUBTOPICS OMITTED." : ""}
`;

    const topicStructureText = await callGemini(topicsPrompt, false);
    console.log("Topic structure extracted, parsing JSON...");
    
    let topicStructure;
    let mainTopic;
    let topics = [];
    
    try {
      // Try to parse the JSON response - handle potential formatting issues
      const jsonMatch = topicStructureText.match(/```(?:json)?\s*([\s\S]+?)\s*```/) || 
                        topicStructureText.match(/({[\s\S]+})/);
      
      const jsonText = jsonMatch ? jsonMatch[1] : topicStructureText;
      topicStructure = JSON.parse(jsonText);
      
      mainTopic = topicStructure.mainTopic;
      topics = topicStructure.topics || [];
      
      console.log(`Successfully parsed topic structure: Main topic: "${mainTopic}", ${topics.length} topics extracted`);
    } catch (e) {
      console.error("Failed to parse topic structure:", e);
      console.log("Raw topic structure text:", topicStructureText);
      throw new Error("Topic structure JSON parsing failed");
    }

    // Skip research if not generating full report
    if (!generateFullReport) {
      console.log("Skipping research phase as per request, returning topic structure only...");
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

    // Stage 3: Research Selected Topics with Google Search Grounding
    console.log(`Stage 3: Researching ${forceDepth ? "ALL" : "selected"} topics with Google Search grounding...`);
    
    // Create a structured collection of researched content
    const researchedContent = {};
    
    // Determine how many topics to research based on available time and capacity
    const maxTopicsToResearch = forceDepth || improveResearchDepth ? 
      Math.min(Math.max(6, Math.min(topics.length, minimumTopicsRequired)), topics.length) : 
      Math.min(Math.max(4, Math.min(topics.length, minimumTopicsRequired / 2)), topics.length);
      
    const maxSubtopicsPerTopic = forceDepth || improveResearchDepth ? 
      Math.min(Math.max(6, Math.min(12, minimumSubtopicsPerTopic)), Math.max(...topics.map(t => t.subtopics.length))) : 
      Math.min(Math.max(4, Math.min(8, minimumSubtopicsPerTopic / 2)), Math.max(...topics.map(t => t.subtopics.length)));
    
    const topicsToResearch = topics.slice(0, maxTopicsToResearch);
    console.log(`Will research ${maxTopicsToResearch} topics with up to ${maxSubtopicsPerTopic} subtopics each`);
    
    // Research each topic and its subtopics in parallel for efficiency
    const topicResearchPromises = topicsToResearch.map(async (topic) => {
      const topicTitle = topic.title;
      console.log(`Researching major topic: ${topicTitle}`);
      
      // Get a balanced selection of subtopics
      const subtopics = getBalancedSubtopics(
        topic, 
        maxSubtopicsPerTopic, 
        includeAllSubtopics, 
        forceDepth, 
        improveResearchDepth
      );
      
      // Research each subtopic in this topic (in parallel for efficiency)
      const subtopicResearchPromises = subtopics.map(subtopic => 
        researchSubtopic(mainTopic, topicTitle, subtopic, requestDepth, includeCitations)
      );
      
      // Wait for all subtopic research to complete
      const subtopicResearchResults = await Promise.all(subtopicResearchPromises);
      
      // Store the research results in our structured content object
      researchedContent[topicTitle] = {
        subtopics: subtopics,
        research: subtopicResearchResults
      };
      
      return {
        topic: topicTitle,
        numberOfSubtopicsResearched: subtopics.length,
        totalResearchSize: subtopicResearchResults.reduce((sum, r) => sum + r.length, 0)
      };
    });
    
    // Wait for all topic research to complete
    const topicResearchResults = await Promise.all(topicResearchPromises);
    
    // Log research completion statistics
    const totalSubtopicsResearched = topicResearchResults.reduce(
      (sum, result) => sum + result.numberOfSubtopicsResearched, 0
    );
    const totalResearchSize = topicResearchResults.reduce(
      (sum, result) => sum + result.totalResearchSize, 0
    );
    
    console.log(`Research completed for ${topicResearchResults.length} topics and ${totalSubtopicsResearched} subtopics`);
    console.log(`Total research content: ~${Math.round(totalResearchSize/1000)}K characters`);

    // Stage 4: Generate Final Comprehensive Report using the research
    // Prepare the research content for the final report generation
    let researchContentForPrompt = "";
    
    Object.keys(researchedContent).forEach(topicTitle => {
      researchContentForPrompt += `## ${topicTitle}\n\n`;
      
      const topic = researchedContent[topicTitle];
      topic.subtopics.forEach((subtopic, index) => {
        researchContentForPrompt += `### ${subtopic}\n${topic.research[index]}\n\n`;
      });
    });
    
    // If the research is very large, truncate it to avoid token limits
    const maxResearchLength = requestDepth === "maximum" ? 100000 : 80000;
    if (researchContentForPrompt.length > maxResearchLength) {
      console.log(`Research content is large (${researchContentForPrompt.length} chars), truncating for final report generation`);
      researchContentForPrompt = researchContentForPrompt.substring(0, maxResearchLength) + "\n\n[Additional research content truncated due to size limitations]";
    }

    // Enhanced report generation prompt
    const reportPrompt = `
You are a distinguished academic researcher creating a comprehensive, ${useAcademicFormat ? "scholarly" : "professional"} research report.

Detailed Research Content:
"""
${researchContentForPrompt}
"""

Main Topic: "${mainTopic}"

Topic Structure:
${topics.map(t => `- ${t.title}`).join('\n')}

Your task is to compile this research into a comprehensive, well-structured report with the following elements:

1. An informative, specific title that clearly represents the academic scope
2. An executive summary that highlights key findings and implications 
3. A detailed table of contents with hierarchical structure
4. Introduction section contextualizing the research within the academic literature
5. Main body organized by the major topics and subtopics WITH ALL THE DETAILED RESEARCH CONTENT
6. Conclusion synthesizing key findings and identifying future research directions  
7. Extensive references section with ALL cited sources (${maxReferences} references minimum)
8. Appendices with relevant supplementary material

${useAcademicFormat ? `
The report MUST follow formal academic conventions:
- Use scholarly language and third-person perspective
- Include proper in-text citations for ALL factual claims
- Maintain consistent citation format throughout 
- Present balanced viewpoints with evidence
- Organize content logically with clear transitions
- Include specific data tables and statistics throughout
` : ""}

${includeDataPoints ? "CRITICAL: Include SPECIFIC statistics, numbers, percentages and data points throughout the report." : ""}

Additionally, extract and include:
- At least 15-20 specific PDF documents mentioned in the research (with title, author, URL where available) - INCLUDE REAL URLS WHEN MENTIONED IN RESEARCH
- At least 8-12 data visualizations or images mentioned (with detailed captions and source information)
- At least 8 datasets mentioned in the research (with access information where available)

Format your response as a single JSON object with this structure:
{
  "title": "Specific and descriptive title",
  "sections": [
    {"title": "Section Title", "content": "Fully formatted markdown content with citations"},
    ...more sections
  ],
  "references": [
    {"id": 1, "title": "Source Title", "authors": "Author Names", "year": "Year", "journal": "Journal/Publisher", "url": "URL", "doi": "DOI if available"},
    ...more references (${maxReferences}+ minimum)
  ],
  "suggestedPdfs": [
    {"title": "PDF Title", "author": "Author", "description": "Brief description", "relevance": "Relevance to research", "url": "URL if available"},
    ...more PDFs
  ],
  "suggestedImages": [
    {"title": "Image Title", "description": "Description", "source": "Source", "relevanceToSection": "Related section"},
    ...more images
  ],
  "suggestedDatasets": [
    {"title": "Dataset Title", "description": "Brief description", "source": "Source organization", "relevanceToSection": "Related section"},
    ...more datasets
  ]
}

IMPORTANT: 
1. CREATE FULL SECTIONS FOR EACH TOPIC AND SUBTOPIC based on the research content
2. USE ALL THE DETAILED RESEARCH to create substantial body sections
3. Include ALL the statistics, data points, and specific information from the research
4. NEVER create a report with just section titles and minimal content
5. The report should be at least ${pageTarget} pages equivalent in length
6. Include at least ${maxReferences} properly formatted references`;

    console.log(`Stage 4: Generating final ${requestDepth} report with ${useAcademicFormat ? 'academic' : 'standard'} formatting...`);
    // Use a larger token limit for the final report
    const reportText = await callGemini(reportPrompt, false, requestDepth === "maximum" ? 32000 : 28000);
    console.log(`Final report generated (${reportText.length} chars), parsing JSON...`);
    
    let report;
    try {
      const jsonMatch = reportText.match(/```(?:json)?\s*([\s\S]+?)\s*```/) || 
                        reportText.match(/({[\s\S]+})/);
      report = JSON.parse(jsonMatch ? jsonMatch[1] : reportText);
    } catch (e) {
      console.error("Failed to parse report JSON:", e);
      console.log("Raw report text (first 500 chars):", reportText.substring(0, 500));
      throw new Error("Report JSON parsing failed");
    }

    const result = {
      report,
      abstract,
      mainTopic,
      topics: topics.map(t => t.title),
      subtopics: topics.flatMap(t => t.subtopics),
      retryAttempted: retryAttempt,
      intermediateResults: {
        topicStructure,
        researchSample: researchedContent?.[topics[0].title]?.research?.[0]?.slice(0, 1000) || "No sample"
      }
    };

    // Add statistics about the report
    const totalSections = report.sections.length;
    const totalWords = report.sections.reduce(
      (sum, section) => sum + (section.content?.split(/\s+/).length || 0), 0
    );
    const totalChars = report.sections.reduce(
      (sum, section) => sum + (section.content?.length || 0), 0
    );
    const totalRefs = report.references.length;
    const totalPdfs = report.suggestedPdfs?.length || 0;
    const standardEstimatedPages = Math.round(totalWords / 400); // ~400 words per page
    const academicEstimatedPages = Math.round(totalWords / 250); // ~250 words per academic page
    
    console.log(`Research completed successfully with ${topicResearchResults.length} topics researched in depth`);
    console.log(`Final report contains ${totalSections} sections, ~${totalWords} words, ~${Math.round(totalChars/1000)}K chars`);
    console.log(`References: ${totalRefs}, PDFs: ${totalPdfs}, estimated pages: ${standardEstimatedPages} (standard) / ${academicEstimatedPages} (academic)`);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Error during research process:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
