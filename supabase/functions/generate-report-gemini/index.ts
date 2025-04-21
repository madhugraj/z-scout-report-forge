import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
// Use the latest Gemini 2.0 Flash alias
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-latest:generateContent";

serve(async (req) => {
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

    const systemPrompt = `
You are a senior research and survey analyst responsible for generating professional, industry-grade research reports. Based on the collected information below—gathered by agents in a modular workflow—produce a comprehensive, data-grounded survey report.

Current date: ${new Date().toLocaleDateString()}

<User and AI Agent Conversation History>
${chatHistory || "N/A"}
</User and AI Agent Conversation History>

<Current Workflow Agents>
1. 📌 *Requirement Agent*: Collects high-level user needs and goals.
   - User requirement: ${JSON.stringify(topic || query)}.

2. 🔍 *Planning & Research Agent*: Breaks down the requirement into subtopics and questions, and retrieves relevant web content using grounded search. If gaps exist in the provided data, you must perform real-time Google Search to fill them.

<Collected Web-Based Research>
${formattedInfo || "N/A"}
</Collected Web-Based Research>

---

### 🔖 Important Guidelines:
- Use citations exactly as provided, formatted inline in Markdown (e.g., [⁴](https://example.com)).
- Identify referenced PDFs under `suggestedPdfs` (title, author(s), description, `referenceId`).
- Extract any tables or images from those PDFs into `suggestedImages` (title, description, source URL, `relevanceToSection`, `referenceId`).
- Do not fabricate any content; only use data explicitly provided or retrieved.

### 🏗️ Report Structure Requirements:
- Title and Table of Contents.
- Proper Markdown: headings, subheadings, bullet points, tables.
- Cover dimensions from user requirement (infrastructure, demographics, economics, etc.).
- Executive summary, detailed sections, conclusion.
- Professional tone and depth equivalent to an 8+ page printed report.

### 📌 Output Format (JSON):
{
  "title": "...",
  "sections": [...],
  "references": [...],
  "suggestedPdfs": [...],
  "suggestedImages": [...],
  "suggestedDatasets": [...]
}

If no relevant PDFs, images, or datasets are found, leave those arrays empty.
`.trim();

    console.log("Sending request to Gemini API for query:", query);

    const requestUrl = `${GEMINI_URL}?key=${GEMINI_API_KEY}`;
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] }
        ],
        generationConfig: {
          temperature: 0.0,      // enforce factual grounding
          maxOutputTokens: 12000,
          topP: 0.0,             // strict model pruning
          topK: 1
        },
        tools: [
          {
            // Always perform grounded Google Search
            google_search: {
              dynamicRetrievalConfig: {
                mode: "MODE_ALWAYS"
              }
            }
          }
        ],
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
        ]
      }),
    });

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let report;

    try {
      let jsonString = textResponse;
      const jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1];
      }

      report = JSON.parse(jsonString);

      // Validate arrays
      report.suggestedPdfs = Array.isArray(report.suggestedPdfs) ? report.suggestedPdfs : [];
      report.suggestedImages = Array.isArray(report.suggestedImages) ? report.suggestedImages : [];
      report.suggestedDatasets = Array.isArray(report.suggestedDatasets) ? report.suggestedDatasets : [];
      report.sections = Array.isArray(report.sections) ? report.sections : [];
      report.references = Array.isArray(report.references) ? report.references : [];

    } catch (e) {
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
