// Generate full report with Google grounding and comprehensive search
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function callGemini(prompt, enableSearch = true, maxOutputTokens = 12000) {
  const requestUrl = `${GEMINI_URL}?key=${GEMINI_API_KEY}`;
  
  console.log(`Calling Gemini with prompt length: ${prompt.length} chars, search enabled: ${enableSearch}, maxOutputTokens: ${maxOutputTokens}`);
  
  const requestBody: any = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1, // Lower temperature for more structured, scholarly responses
      maxOutputTokens: maxOutputTokens,
      topP: 0.9,
      topK: 40,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
    ]
  };

  if (enableSearch) {
    requestBody.tools = [
      {
        google_search: {
          dynamicRetrievalConfig: {
            mode: "MODE_ALWAYS"
          }
        }
      }
    ];
  }

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Gemini API error (${response.status}): ${errorBody}`);
    throw new Error(`Gemini API returned status ${response.status}: ${errorBody}`);
  }

  const json = await response.json();
  const result = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!result) {
    console.error("Unexpected response format from Gemini:", json);
    throw new Error("Unexpected response format from Gemini API");
  }

  return result;
}

// Enhanced function to research a specific subtopic with search grounding
// Now with improved academic citation prompting and statistical data focus
async function researchSubtopic(mainTopic: string, topicTitle: string, subtopic: string, depth = "comprehensive", includeCitations = true) {
  console.log(`Researching subtopic: "${subtopic}" under topic "${topicTitle}"`);
  
  const depthInstructions = depth === "maximum" ? 
    "Produce an EXTREMELY DETAILED, journal-quality research section of 3000-4000 words with extensive citations." :
    "Produce a comprehensive research section of at least 2000-2500 words with thorough citations.";
  
  const citationInstructions = includeCitations ?
    `
Include proper academic citations with the following guidelines:
- Use standard academic in-text citations in [Author, Year] format
- For direct quotes, include page numbers when available: [Author, Year, p. X]
- When citing multiple sources, separate them with semicolons: [Author, Year; Author2, Year2]
- When referencing specific data points or statistics, ALWAYS include the citation immediately after
- Ensure every factual claim, statistic, or specific research finding has a proper citation
- For major authors or seminal works in the field, mention author names directly in the text
` : "";

  const subtopicPrompt = `
You are an experienced academic researcher with expertise in "${mainTopic}" preparing a section for a prestigious peer-reviewed journal article on the specific subtopic: 
"${subtopic}" (which is part of the broader topic "${topicTitle}" within the main research area "${mainTopic}").

Use Google Search to find and analyze AT LEAST 15-20 high-quality, authoritative sources specifically on this subtopic, including:
- Recent peer-reviewed research papers (especially from the last 5 years)
- Meta-analyses and systematic reviews when available
- Official statistics, datasets, and government reports
- Expert analyses from authoritative organizations and research institutes
- Historical development and foundational research on this subtopic
- Real-world case studies and applications with measurable outcomes

For each source you find, extract and incorporate:
1. Key findings with specific numerical data (percentages, metrics, statistical significance)
2. Precise methodologies including sample sizes, time periods, and geographic scope
3. Author credentials, institutional affiliations, and funding sources when relevant
4. Direct quotes that provide unique expert insight (with proper citation)
5. Critical limitations acknowledged in the research
6. Contradictory or competing findings across different studies

${depthInstructions} Your section MUST include:
- A nuanced introduction to this specific subtopic with its scholarly context
- Detailed analysis with primary source quotes and paraphrasing
- NUMEROUS SPECIFIC STATISTICS AND DATA POINTS (with actual numbers, not just general trends)
- At least 3-4 tables, lists or structured presentations of key findings
- Critical evaluation of the current research landscape on this subtopic
- Identification of research gaps or methodological issues
- Future research directions

${citationInstructions}

This is for a DETAILED academic research report of ${depth === "maximum" ? "60-80" : "40-50"} PAGES, so your analysis must be substantive, evidence-based, and extraordinarily detailed. 
Do not summarize or provide a general overview - this needs to be EXHAUSTIVE scholarly research with actual statistics, numbers, and quantitative data.
Include SPECIFIC URLS to key research papers, reports, and datasets mentioned.`;

  try {
    // Always enable search for subtopic research to get grounded information
    const research = await callGemini(subtopicPrompt, true, depth === "maximum" ? 20000 : 16000);
    console.log(`Successfully researched subtopic "${subtopic}": ${research.length} chars`);
    return research;
  } catch (error) {
    console.error(`Error researching subtopic \"${subtopic}\":`, error);
    return `**Research Error**: Could not retrieve research for \"${subtopic}\" due to an error.`;
  }
}

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
      improveResearchDepth = false
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

    const topicsPrompt = `Based on this abstract: \"\"\"${abstract}\"\"\" Extract main topic, 10+ major topics and 10-15 subtopics each. Return ONLY valid JSON.`;
    const topicsText = await callGemini(topicsPrompt, false);

Extract:
1. A clear, concise main topic (1 line)
2. A list of **AT LEAST 10-12 major topics** related to this research area. Each topic should be broad and substantive enough to form a major chapter in a comprehensive ${pageTarget}-page research report.
3. For EACH major topic, provide **10 to 15 specific, focused subtopics** that warrant detailed investigation.

Return in this JSON format ONLY:
{
  "mainTopic": "The central research topic",
  "topics": [
    {
      "title": "First Major Topic",
      "subtopics": ["Subtopic 1.1", "Subtopic 1.2", ..., "Subtopic 1.15"]
    },
    {
      "title": "Second Major Topic",
      "subtopics": ["Subtopic 2.1", "Subtopic 2.2", ..., "Subtopic 2.15"]
    },
    ...and so on for at least 10-12 major topics
  ]
}

Instructions:
- Ensure each major topic is distinct, substantive, and covers a unique, essential aspect of the research field.
- Each subtopic should be specific enough for focused research and designed to generate detailed, evidence-based sections in a professional report.
- Output valid JSON only, *no commentary or markdown*.
- For maximum depth, err on the side of giving *more subtopics per topic (prefer 15 where possible)*.
- IMPORTANT: The final report will be ${pageTarget} pages, so ensure ALL topics and subtopics are substantive enough to support this length.
${expandSubtopicCoverage ? "- Ensure comprehensive coverage of the field with NO MAJOR SUBTOPICS OMITTED." : ""}
`;

    console.log("Stage 2: Extracting extensive topic structure...");
    const topicStructureText = await callGemini(topicsPrompt, false);
    console.log("Topic structure extracted, parsing JSON...");
    
    let topicStructure;
    try {
      const jsonMatch = topicsText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      topicStructure = JSON.parse(jsonMatch ? jsonMatch[1] : topicsText);
    } catch (e) {
      console.error("Failed to parse topic structure:", e);
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
    // Expand coverage when specifically requested
    const maxTopicsToResearch = forceDepth || improveResearchDepth ? 
      Math.min(12, topics.length) : 
      Math.min(8, topics.length);
      
    const maxSubtopicsPerTopic = forceDepth || improveResearchDepth ? 
      Math.min(12, Math.max(...topics.map(t => t.subtopics.length))) : 
      Math.min(6, Math.max(...topics.map(t => t.subtopics.length)));
    
    const topicsToResearch = topics.slice(0, maxTopicsToResearch);
    console.log(`Will research ${maxTopicsToResearch} topics with up to ${maxSubtopicsPerTopic} subtopics each`);
    
    // Function to select which subtopics to research - improved to ensure better coverage
    const getBalancedSubtopics = (topic) => {
      // If we want to include all subtopics or are forcing depth, take as many as possible
      if (includeAllSubtopics || forceDepth || improveResearchDepth) {
        return topic.subtopics.slice(0, maxSubtopicsPerTopic);
      }
      
      // Otherwise, take a strategic sample from beginning, middle, and end
      const subtopics = [];
      const len = topic.subtopics.length;
      
      // Always take the first subtopic
      subtopics.push(topic.subtopics[0]);
      
      // Add 1-2 from beginning section
      if (len >= 5) {
        subtopics.push(topic.subtopics[1]);
        if (len >= 9) subtopics.push(topic.subtopics[2]);
      }
      
      // Add middle subtopics
      if (len >= 3) {
        const mid = Math.floor(len / 2);
        subtopics.push(topic.subtopics[mid]);
        if (len >= 7) {
          subtopics.push(topic.subtopics[mid-1]);
          if (len >= 11) subtopics.push(topic.subtopics[mid+1]);
        }
      }
      
      // Add subtopics from latter part
      if (len >= 4) {
        subtopics.push(topic.subtopics[len-2]);
        subtopics.push(topic.subtopics[len-1]); // Always include last
        if (len >= 8) subtopics.push(topic.subtopics[len-3]);
      }
      
      // Remove duplicates
      return [...new Set(subtopics)];
    };
    
    // Research each topic and its subtopics in parallel for efficiency
    const topicResearchPromises = topicsToResearch.map(async (topic) => {
      const topicTitle = topic.title;
      console.log(`Researching major topic: ${topicTitle}`);
      
      // Get a balanced selection of subtopics
      const subtopics = getBalancedSubtopics(topic);
      
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
    // But allow for larger research data when generating maximum depth reports
    const maxResearchLength = requestDepth === "maximum" ? 70000 : 50000;
    if (researchContentForPrompt.length > maxResearchLength) {
      console.log(`Research content is large (${researchContentForPrompt.length} chars), truncating for final report generation`);
      researchContentForPrompt = researchContentForPrompt.substring(0, maxResearchLength) + "\n\n[Additional research content truncated due to size limitations]";
    }

    // Enhanced report generation prompt with improved academic formatting and citation requirements
    const reportPrompt = `
You are a distinguished academic researcher creating a comprehensive, ${useAcademicFormat ? "scholarly" : "professional"} research report.

    let content = Object.entries(researchedContent).map(([title, data]) => {
      const sections = data.subtopics.map((sub, i) => `### ${sub}\n${data.research[i]}`).join("\n\n");
      return `## ${title}\n\n${sections}`;
    }).join("\n\n");

    if (content.length > 30000) content = content.slice(0, 30000);

Detailed Research Content:
"""
${researchContentForPrompt}
"""

Main Topic: "${mainTopic}"

Topic Structure:
${topics.map(t => `- ${t.title}`).join('\n')}

Your report MUST include:
1. An informative, specific title that clearly represents the academic scope
2. An executive summary that highlights key findings and implications
3. A detailed table of contents with hierarchical structure
4. Introduction section contextualizing the research within the academic literature
5. Main body organized by the major topics and subtopics WITH ALL THE DETAILED RESEARCH CONTENT
6. Conclusion synthesizing key findings and identifying future research directions
7. Extensive references section with ALL cited sources (${maxReferences} references minimum)
8. Appendices with relevant supplementary material

${useAcademicFormat ? `
The report should follow formal academic conventions:
- Use scholarly language and third-person perspective
- Include proper in-text citations for ALL factual claims
- Maintain consistent citation format throughout
- Present balanced viewpoints with evidence
- Organize content logically with clear transitions
- Include specific data tables and statistics where relevant
` : ""}

The report should be ${pageTarget} pages in length with extremely detailed content and analysis.
${requestDepth === "maximum" ? "IMPORTANT: This must be an exhaustive, journal-quality report with exceptional depth and detail." : ""}
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

IMPORTANT: Ensure all content is properly cited, factual, and grounded in the research provided. Include only real citations and references found during the research process. DO NOT generate placeholder text - use all the detailed research that was provided to create substantial sections with extensive evidence and specific data points.`;

    console.log(`Stage 4: Generating final ${requestDepth} report with ${useAcademicFormat ? 'academic' : 'standard'} formatting...`);
    // Use a larger token limit for the final report
    const reportText = await callGemini(reportPrompt, false, requestDepth === "maximum" ? 32000 : 28000);
    console.log(`Final report generated (${reportText.length} chars), parsing JSON...`);
    
    let report;
    try {
      const jsonMatch = reportText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      report = JSON.parse(jsonMatch ? jsonMatch[1] : reportText);
    } catch (e) {
      console.error("Failed to parse report JSON:", e);
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
        researchSample: researchedContent?.[topics[0].title]?.research?.[0]?.slice(0, 500) || "No sample"
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
    const totalPdfs = report.suggestedPdfs.length;
    const standardEstimatedPages = Math.round(totalWords / 400); // ~400 words per page
    const academicEstimatedPages = Math.round(totalWords / 250); // ~250 words per academic page
    
    console.log(`Research completed successfully with ${topicResearchResults.length} topics researched in depth`);
    console.log(`Final report contains ${totalSections} sections, ~${totalWords} words, ~${Math.round(totalChars/1000)}K chars`);
    console.log(`References: ${totalRefs}, PDFs: ${totalPdfs}, estimated pages: ${standardEstimatedPages} (standard) / ${academicEstimatedPages} (academic)`);
    
    return new Response(JSON.stringify(results), {
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
