import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Google Gemini API endpoint
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// --- UPDATED PROMPT AND FUNCTION ---
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, chatHistory, topic, formattedInfo } = await req.json();

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return new Response(JSON.stringify({ error: "API key configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // INDUSTRY STANDARD PROMPT from user
    const systemPrompt = `
You are a senior research and survey analyst for generate industry level standard report/survey. Based on the following collected information by the sub-agent in the workflow, create a detailed survey report for the research.
current date : ${new Date().toLocaleDateString()}

<User and AI Agent conversation history>:
${chatHistory || "N/A"}
</User and AI Agent conversation history>

current workflow agents:
1. Requierment_agent that gather requierment from the user
user requierment: '${JSON.stringify(topic ? topic : query)}'.

2. Planning and Research agent that break down the requierment into sub-topics and questions and research through internet for all the question under the topic.

Collected Information from internet by the research agent:
<Collected Information from internet>:
${formattedInfo || "N/A"}
</Collected Information from internet>

Note: The collected information have a citation in every question and answer, so please make sure to include the citation whenever using the context. In the report, reuse the citation as per the same context in a markdown format. Example: [⁴](https://www.example.com/) in between the content.
- Consider key aspects like infrastructure, demographics, economics, based on requirements.
- The report should be industry level, engaging, detailed, and actionable. Use only collected data from the web to support even images/figures and tables.
- All images/tables in your report must have explicitly corresponding citations and origins from the collected data. DO NOT include random images or tables.
- The report must be well-structured with a clear Table of Contents, headings, subheadings (use Markdown), and includes a conclusion. DO NOT output any raw JSON/JS structures in content.
- The tone should be professional, and depth equivalent to 8+ printed pages.

You must output a single valid JSON using this structure:
{
  "title": "...",
  "sections": [
    {"title": "...", "content": "..."}
  ],
  "references": [
    {"id": 1, "title": "...", "authors": "...", "journal": "...", "year": "...", "url": "...", "doi": "..."}
  ],
  "suggestedPdfs": [
    {"title": "...", "author": "...", "description": "...", "relevance": "...", "referenceId": 1}
  ],
  "suggestedImages": [
    {"title": "...", "description": "...", "source": "...", "relevanceToSection": "..."}
  ],
  "suggestedDatasets": [
    {"title": "...", "description": "...", "source": "...", "relevanceToSection": "..."}
  ]
}
If you cannot find a PDF or image grounded in the collected data, do not invent one.
    `.trim();

    console.log("Sending request to Gemini API for query:", query);
    
    // Enhanced Gemini API request with better search retrieval settings
    const requestUrl = `${GEMINI_URL}?key=${GEMINI_API_KEY}`;
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 12000,
          topP: 0.95,
          topK: 64
        },
        tools: [{
          googleSearchRetrieval: {
            dynamicRetrievalConfig: {
              mode: "MODE_DYNAMIC", 
              dynamicThreshold: 0.8
            }
          }
        }],
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH"
          }
        ]
      }),
    });

    // --- ENFORCE NO FALLBACK, NO RANDOM DATA ---
    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let report;

    try {
      // Extract JSON from code block (if present)
      let jsonString = textResponse;
      const jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1];
      }

      report = JSON.parse(jsonString);

      // No random/fallback PDFs, images: only use what Gemini gave. No auto-generated PDFs/images/datasets!
      report.suggestedPdfs = Array.isArray(report.suggestedPdfs) ? report.suggestedPdfs : [];
      report.suggestedImages = Array.isArray(report.suggestedImages) ? report.suggestedImages : [];
      report.suggestedDatasets = Array.isArray(report.suggestedDatasets) ? report.suggestedDatasets : [];

      // Basic fields validation (ensure arrays)
      report.sections = Array.isArray(report.sections) ? report.sections : [];
      report.references = Array.isArray(report.references) ? report.references : [];

    } catch (e) {
      // Failed to parse JSON from Gemini: do not create a dummy report anymore!
      console.error("Failed to parse Gemini output as JSON:", e);
      return new Response(JSON.stringify({
        error: "Could not parse or create report from Gemini output.",
        raw: textResponse.substring(0, 500) + "..."
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Unexpected error in generate-report-gemini:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

// --- End file ---
