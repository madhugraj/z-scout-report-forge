
// Generate full report with Google grounding and comprehensive search
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

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

// Function to research a specific subtopic with search grounding
async function researchSubtopic(mainTopic: string, topicTitle: string, subtopic: string) {
  console.log(`Researching subtopic: "${subtopic}" under topic "${topicTitle}"`);
  
  const subtopicPrompt = `
You are a professional academic researcher conducting a thorough literature analysis on the specific subtopic: 
"${subtopic}" (which is part of the broader topic "${topicTitle}" within the main research area "${mainTopic}"). 
you have to repeat this task for all the "${subtopic} and ${topicTitle}"

Use Google Search to find and analyze AT LEAST 7-10 high-quality, authoritative sources specifically on this subtopic.
Focus on finding:
- Recent peer-reviewed research papers
- Official statistics and data
- Expert analyses from authoritative organizations
- Case studies and real-world applications
- Historical development and context

For each source you find:
1. Extract key findings, methodologies, and insights
2. Note statistics, data points, and quantitative evidence
3. Identify author credentials and institutional affiliations
4. Evaluate the significance and limitations of the research
5. Include direct quotes (with proper citation) when they provide unique value

Format your response as a thoroughly researched, academic-quality section (at least 800-1000 words) with:
- A brief introduction to this specific subtopic
- Comprehensive analysis of findings across multiple sources
- Proper in-text citations in [Author, Year] format
- Tables or lists of key statistics/findings when relevant
- Critical evaluation of the research landscape on this subtopic
- Discussion of gaps or areas for further research

This is for a comprehensive research report, so your analysis must be substantive, evidence-based, and nuanced.
Do not summarize or provide a general overview - this needs to be detailed scholarly research.`;

  try {
    // Always enable search for subtopic research to get grounded information
    const research = await callGemini(subtopicPrompt, true, 8000);
    console.log(`Successfully researched subtopic "${subtopic}": ${research.length} chars`);
    return research;
  } catch (error) {
    console.error(`Error researching subtopic "${subtopic}":`, error);
    return `**Research Error**: Unable to retrieve comprehensive research for "${subtopic}". This may be due to API limitations or connection issues. The report will continue with other sections.`;
  }
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
2. A list of **AT LEAST 10 major topics** related to this research area. Each topic should be broad and substantive enough to form a major chapter in a comprehensive research report.
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
    ...and so on for at least 10 major topics
  ]
}

Instructions:
- Ensure each major topic is distinct, substantive, and covers a unique, essential aspect of the research field.
- Each subtopic should be specific enough for focused research and designed to generate detailed, evidence-based sections in a professional report.
- Output valid JSON only, *no commentary or markdown*.
- For maximum depth, err on the side of giving *more subtopics per topic (prefer 15 where possible)*.
`;

    console.log("Stage 2: Extracting extensive topic structure...");
    const topicStructureText = await callGemini(topicsPrompt, false);
    console.log("Topic structure extracted, parsing JSON...");
    
    let topicStructure;
    try {
      const jsonMatch = topicStructureText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      if (jsonMatch) {
        topicStructure = JSON.parse(jsonMatch[1]);
      } else {
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
    
    // Create a structured collection of researched content
    const researchedContent = {};
    
    // Limit the number of topics and subtopics to research to avoid timeouts
    // For production, we'd implement a more robust approach like queuing or streaming
    const topicsToResearch = topics.slice(0, 10); // Limit to 10 topics max
    
    // Function to limit subtopics per topic while maintaining coverage
    const getBalancedSubtopics = (topic) => {
      // Calculate how many subtopics we can process per topic
      const maxSubtopicsPerTopic = 5; // Can adjust based on testing
      return topic.subtopics.slice(0, maxSubtopicsPerTopic);
    };
    
    // Research each topic and its subtopics in parallel for efficiency
    const topicResearchPromises = topicsToResearch.map(async (topic) => {
      const topicTitle = topic.title;
      console.log(`Researching major topic: ${topicTitle}`);
      
      // Get a balanced selection of subtopics
      const subtopics = getBalancedSubtopics(topic);
      
      // Research each subtopic in this topic (in parallel for efficiency)
      const subtopicResearchPromises = subtopics.map(subtopic => 
        researchSubtopic(mainTopic, topicTitle, subtopic)
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
        numberOfSubtopicsResearched: subtopics.length
      };
    });
    
    // Wait for all topic research to complete
    const topicResearchResults = await Promise.all(topicResearchPromises);
    
    // Log research completion statistics
    const totalSubtopicsResearched = topicResearchResults.reduce(
      (sum, result) => sum + result.numberOfSubtopicsResearched, 0
    );
    console.log(`Research completed for ${topicResearchResults.length} topics and ${totalSubtopicsResearched} subtopics`);

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
    if (researchContentForPrompt.length > 30000) {
      console.log(`Research content is large (${researchContentForPrompt.length} chars), truncating for final report generation`);
      researchContentForPrompt = researchContentForPrompt.substring(0, 30000) + "\n\n[Additional research content truncated due to size limitations]";
    }

    const reportPrompt = `
<<<<<<< HEAD
You are a professional research analyst. Use the below content to write a cited detailed report for 40 -50 pages.
=======
You are a distinguished research analyst creating a comprehensive, academic-quality report.
>>>>>>> 5860be8acb0a2f65219735924e83c46d19d21911

Based on the provided abstract and detailed research, create a complete, well-structured research report with the following characteristics:

Abstract:
"""
${abstract}
"""

Detailed Research Content:
"""
${researchContentForPrompt}
"""

Main Topic: "${mainTopic}"

Topic Structure:
${topics.map(t => `- ${t.title}`).join('\n')}

Your report MUST include:
1. An informative, specific title
2. An executive summary
3. A table of contents
4. Introduction section contextualizing the research
5. Main body organized by the major topics and subtopics WITH ALL THE DETAILED RESEARCH CONTENT
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

IMPORTANT: Ensure all content is properly cited, factual, and grounded in the research provided. Include only real citations and references found during the research process. DO NOT generate placeholder text - use all the detailed research that was provided to create substantial sections.`;

    console.log("Stage 4: Generating final comprehensive report...");
    const reportText = await callGemini(reportPrompt, false, 20000);
    console.log("Final report generated, parsing JSON...");
    
    let report;
    try {
      const jsonMatch = reportText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : reportText;
      report = JSON.parse(jsonStr);
      
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
        researchSample: Object.keys(researchedContent).length > 0 
          ? Object.values(researchedContent)[0].research[0]?.substring(0, 500) + "..."
          : "No research sample available"
      }
    };

    // Add statistics about the report
    const totalSections = report.sections.length;
    const totalWords = report.sections.reduce(
      (sum, section) => sum + (section.content?.split(/\s+/).length || 0), 0
    );
    
    console.log(`Research completed successfully with ${topicResearchResults.length} topics researched in depth`);
    console.log(`Final report contains ${totalSections} sections and approximately ${totalWords} words`);
    
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
