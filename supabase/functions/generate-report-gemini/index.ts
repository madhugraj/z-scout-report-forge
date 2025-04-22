
// Generate full report with Google grounding and comprehensive search
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-latest:generateContent";

async function callGemini(prompt: string, enableSearch = true, maxOutputTokens = 12000) {
  const requestUrl = `${GEMINI_URL}?key=${GEMINI_API_KEY}`;
  
  console.log(`Calling Gemini with prompt length: ${prompt.length} chars, search enabled: ${enableSearch}`);
  
  const requestBody: any = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: maxOutputTokens,
      topP: 0.7,
      topK: 40,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
    ]
  };
  
  // Enable Google search for grounding when requested
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
    body: JSON.stringify(requestBody),
  });
  
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Gemini API error (${response.status}): ${errorBody}`);
    throw new Error(`Gemini API returned status ${response.status}: ${errorBody}`);
  }
  
  const json = await response.json();
  if (!json.candidates || !json.candidates[0]?.content?.parts || !json.candidates[0]?.content?.parts[0]?.text) {
    console.error("Unexpected response format from Gemini:", json);
    throw new Error("Unexpected response format from Gemini API");
  }
  
  return json.candidates[0].content.parts[0].text;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    console.log("Starting comprehensive research process for query:", query);

    // Stage 1: Generate Comprehensive Abstract
    const abstractPrompt = `
Generate a comprehensive, professional 300-400 word abstract for a detailed research report on this topic:
"${query}"

The abstract should:
- Provide a clear overview of the research scope
- Highlight the significance and relevance of the topic
- Mention key methodologies, findings, and implications
- Use academic/professional language appropriate for the domain
- Be thorough enough to guide a comprehensive research report

Your abstract will form the foundation for an extensive research report with multiple major topics and subtopics.`;

    console.log("Stage 1: Generating comprehensive abstract...");
    const abstract = await callGemini(abstractPrompt, false);
    console.log("Abstract generated successfully:", abstract.substring(0, 100) + "...");

    // Stage 2: Extract Extensive Topic Structure
    const topicsPrompt = `
Based on this research abstract:
"""
${abstract}
"""

Extract:
1. A clear, concise main topic (1 line)
2. A list of AT LEAST 5 major topics related to this research area
3. For EACH major topic, provide AT LEAST 10 specific, focused subtopics that warrant detailed investigation

Return in this JSON format ONLY:
{
  "mainTopic": "The central research topic",
  "topics": [
    {
      "title": "First Major Topic",
      "subtopics": ["Subtopic 1.1", "Subtopic 1.2", ..., "Subtopic 1.10"]
    },
    {
      "title": "Second Major Topic",
      "subtopics": ["Subtopic 2.1", "Subtopic 2.2", ..., "Subtopic 2.10"]
    },
    ...and so on for at least 5 major topics
  ]
}

Ensure each major topic is distinct and substantive, and each subtopic is specific enough for focused research.`;

    console.log("Stage 2: Extracting extensive topic structure...");
    const topicStructureText = await callGemini(topicsPrompt, false);
    console.log("Topic structure extracted, parsing JSON...");
    
    let topicStructure;
    try {
      // First try to find JSON in markdown code block
      const jsonMatch = topicStructureText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        topicStructure = JSON.parse(jsonMatch[1]);
      } else {
        // If no code block, try parsing the entire response
        topicStructure = JSON.parse(topicStructureText);
      }
    } catch (err) {
      console.error("Failed to parse topic structure JSON:", err);
      console.log("Raw topic structure response:", topicStructureText);
      throw new Error("Failed to parse topic structure JSON");
    }
    
    const { mainTopic, topics } = topicStructure;
    
    console.log(`Extracted ${topics.length} major topics with subtopics`);

    // Stage 3: Research Each Subtopic with Google Search Grounding
    console.log("Stage 3: Researching subtopics with Google Search grounding...");
    
    const topicResearch = [];
    
    for (const topic of topics) {
      console.log(`Researching major topic: ${topic.title}`);
      const topicContent = [`## ${topic.title}\n`];
      
      // For each subtopic, get deep research with Google Search grounding
      for (const subtopic of topic.subtopics) {
        console.log(`  - Researching subtopic: ${subtopic}`);
        
        const subtopicPrompt = `
You are a professional researcher conducting a comprehensive literature search on: "${subtopic}" 
(which is part of the broader topic "${topic.title}" within the main research area of "${mainTopic}").

Use Google Search to find and analyze AT LEAST 5-7 high-quality, relevant sources on this specific subtopic.

For each source:
1. Extract key findings, statistics, methodologies, and insights
2. Identify author(s), publication venue, and date where available
3. Evaluate the credibility and significance of the source
4. Note any limitations or areas for further research

Format your response as a well-structured, detailed section with:
- Clear subheadings for the subtopic
- Properly cited information (use format [Author, Year](URL))
- Direct quotes when appropriate (with proper citation)
- Synthesized insights across multiple sources
- Tables or lists of key statistics/findings when relevant

Your research should be thorough, academic in tone, and provide substantive, factual information with proper citations.`;

        try {
          const subtopicResearch = await callGemini(subtopicPrompt, true, 8000);
          topicContent.push(`### ${subtopic}\n${subtopicResearch}\n`);
        } catch (error) {
          console.error(`Error researching subtopic "${subtopic}":`, error);
          topicContent.push(`### ${subtopic}\n*Error retrieving research for this subtopic. Please see the main report for information related to this area.*\n`);
        }
      }
      
      topicResearch.push(topicContent.join("\n"));
    }

    // Stage 4: Generate Final Comprehensive Report
    const reportPrompt = `
You are a distinguished research analyst creating a comprehensive, academic-quality report.

Based on the provided abstract and detailed research, create a complete, well-structured research report with the following characteristics:

Abstract:
"""
${abstract}
"""

Detailed Research Content:
"""
${topicResearch.join("\n\n")}
"""

Your report MUST include:
1. An informative, specific title
2. An executive summary
3. A table of contents
4. Introduction section contextualizing the research
5. Main body organized by the major topics and subtopics
6. Conclusion summarizing key findings
7. Extensive references section with ALL cited sources
8. Appendices with relevant supplementary material

Additionally, extract and include:
- At least 10 specific PDF documents mentioned in the research (with title, author, URL where available)
- At least 5 data visualizations or images mentioned (with detailed captions and source information)
- At least 3 datasets mentioned in the research

Format your response as a single JSON object with this structure:
{
  "title": "Specific and descriptive title",
  "sections": [
    {"title": "Section Title", "content": "Fully formatted markdown content"},
    ...more sections
  ],
  "references": [
    {"id": 1, "title": "Source Title", "authors": "Author Names", "year": "Year", "journal": "Journal/Publisher", "url": "URL", "doi": "DOI if available"},
    ...more references
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

Ensure all content is properly cited, factual, and grounded in the research provided. Include only real citations and references found during the research process.`;

    console.log("Stage 4: Generating final comprehensive report...");
    const reportText = await callGemini(reportPrompt, false, 20000);
    console.log("Final report generated, parsing JSON...");
    
    let report;
    try {
      // Attempt to extract JSON from the response
      const jsonMatch = reportText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : reportText;
      report = JSON.parse(jsonStr);
      
      // Ensure all expected report sections exist
      report.sections = report.sections || [];
      report.references = report.references || [];
      report.suggestedPdfs = report.suggestedPdfs || [];
      report.suggestedImages = report.suggestedImages || [];
      report.suggestedDatasets = report.suggestedDatasets || [];
    } catch (err) {
      console.error("Failed to parse final report JSON:", err);
      throw new Error("Failed to parse final report JSON");
    }

    const results = {
      report,
      abstract,
      mainTopic,
      topics: topics.map(t => t.title),
      subtopics: topics.flatMap(t => t.subtopics),
      intermediateResults: {
        topicStructure,
        researchSample: topicResearch[0]?.substring(0, 500) + "..." // Just a sample for debugging
      }
    };

    console.log(`Research completed successfully with ${topics.length} topics and ${results.subtopics.length} subtopics`);
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Comprehensive research error:", err);
    return new Response(JSON.stringify({ 
      error: err.message,
      stack: err.stack,
      intermediateResults: err.intermediateResults || {} 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
