
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
// Updated to use gemini-1.5-pro-002 model as requested
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent";

async function callGemini(prompt: string) {
  console.log("Calling Gemini API with model gemini-1.5-pro-002");
  console.log(`Prompt length: ${prompt.length} characters`);
  const requestUrl = `${GEMINI_URL}?key=${GEMINI_API_KEY}`;
  const response = await fetch(requestUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1, // Lower temperature for more deterministic responses
        maxOutputTokens: 24000, // Increased token limit for more content
        topP: 0.9,
        topK: 40,
      },
      // Enable search tools for better research capabilities
      tools: [{
        googleSearchRetrieval: {
          disableAttribution: false,
          searchQueriesPerRequest: 8
        }
      }],
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
      ]
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    console.error("Gemini API error:", errorData);
    throw new Error(`Gemini API returned ${response.status}: ${errorData}`);
  }
  
  const json = await response.json();
  if (!json.candidates || json.candidates.length === 0) {
    console.error("No candidates returned from Gemini:", json);
    throw new Error("No candidates returned from Gemini API");
  }
  
  const candidate = json.candidates[0];
  if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
    console.error("Invalid candidate structure from Gemini:", candidate);
    throw new Error("Invalid candidate structure from Gemini API");
  }
  
  const result = candidate.content.parts[0].text;
  if (!result) {
    console.error("Empty text content from Gemini:", json);
    throw new Error("Empty text content from Gemini API");
  }
  
  console.log(`Received response from Gemini (${result.length} characters)`);
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { abstract, formattedInfo } = await req.json();
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const reportPrompt = `You are a senior analyst creating a comprehensive, structured survey report.

Instructions:
- Use the abstract and research info provided.
- Create a COMPLETE report with comprehensive content including:
  * Title (descriptive and specific)
  * Executive Summary (concise overview of key findings)
  * Table of Contents (detailed with all sections and subsections)
  * Introduction (context, significance, and scope)
  * COMPLETE SECTIONS FOR EVERY MAJOR TOPIC with substantive content
  * Conclusion (implications and future directions)
  * References (at least 20-30 properly formatted citations)

- For each section and subsection:
  * Include SPECIFIC data, statistics, and research findings
  * Each section must have substantial content (minimum 2-3 paragraphs)
  * Use evidence-based writing with citations

- Format ALL content in proper Markdown
- Include citations in Markdown format
- From referenced PDFs, extract tables/images as suggestedImages
- Format output in JSON only:
{
  "title": "...",
  "sections": [
    {"title": "Section Title", "content": "COMPLETE markdown content with all data and information"}
  ],
  "references": [...],
  "suggestedPdfs": [...],
  "suggestedImages": [...],
  "suggestedDatasets": [...]
}

IMPORTANT: 
- CREATE FULL SECTIONS FOR EACH TOPIC AND SUBTOPIC
- INCLUDE SUBSTANTIAL CONTENT FOR EACH SECTION (not just headings)
- Include SPECIFIC statistics, data points, and factual information
- NEVER return a report with just section titles and minimal content`;

    console.log("Sending comprehensive report prompt to Gemini API...");
    const reportText = await callGemini(reportPrompt + `\n\n<Abstract>\n${abstract}\n</Abstract>\n<Research>\n${Array.isArray(formattedInfo) ? formattedInfo.join("\n\n") : formattedInfo}\n</Research>`);
    console.log("Received response from Gemini API, parsing JSON");
    
    // Parse the response - improved handling for various JSON formats
    let report;
    try {
      // Try to extract JSON from potential markdown formatting
      const match = reportText.match(/```json\s*([\s\S]+?)\s*```/) || 
                    reportText.match(/({[\s\S]+?})/) || 
                    reportText.match(/({[\s\S]+$)/);
      
      const jsonStr = match ? match[1] : reportText;
      report = JSON.parse(jsonStr);
      
      // Ensure all expected arrays exist even if they're empty
      report.sections = report.sections || [];
      report.references = report.references || [];
      report.suggestedPdfs = report.suggestedPdfs || [];
      report.suggestedImages = report.suggestedImages || [];
      report.suggestedDatasets = report.suggestedDatasets || [];
      
      // Log report statistics for debugging
      console.log(`Report parsed successfully with ${report.sections.length} sections and ${report.references.length} references`);
      
      const totalWords = report.sections.reduce(
        (acc, section) => acc + (section.content?.split(/\s+/).length || 0), 0
      );
      console.log(`Total content: ~${totalWords} words`);
      
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", parseError);
      console.log("Raw response text (first 1000 chars):", reportText.substring(0, 1000));
      
      // Provide a fallback response with more detailed error information
      return new Response(JSON.stringify({ 
        error: "Failed to parse Gemini response", 
        report: {
          title: "Error Generating Report",
          sections: [{
            title: "Error",
            content: "Failed to parse Gemini response. The API returned data in an unexpected format. Please try again or modify your query."
          }],
          references: [],
          suggestedPdfs: [],
          suggestedImages: [],
          suggestedDatasets: []
        },
        rawResponsePreview: reportText.substring(0, 500) + "..." // Include part of the raw response for debugging
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Report generation error:", err);
    // Return a properly structured error response with empty arrays
    return new Response(JSON.stringify({ 
      error: err.message,
      report: {
        title: "Error Generating Report",
        sections: [{
          title: "Error",
          content: "An error occurred while generating the report: " + err.message + 
                  "\n\nPlease check your query and try again. If the problem persists, verify that your Gemini API key has sufficient permissions and quota for the gemini-1.5-pro-002 model."
        }],
        references: [],
        suggestedPdfs: [],
        suggestedImages: [],
        suggestedDatasets: []
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
