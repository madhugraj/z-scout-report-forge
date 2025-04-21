import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

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

2. 🔍 *Planning & Research Agent*: Breaks down the requirement into subtopics and questions, and retrieves relevant web content using grounded search.

<Collected Web-Based Research>
${formattedInfo || "N/A"}
</Collected Web-Based Research>

---

### 🔖 Important Guidelines:
- The collected research includes citations with source URLs. Use these citations exactly as they appear in the provided content.
  - Format inline citations in Markdown, like: [⁴](https://example.com).
  - Do **not create new citations** or modify URLs.

- If any **PDFs** are referenced in the collected content:
  - Identify them clearly and list them under `suggestedPdfs`.
  - Include: title, author(s), description, and a `referenceId` linking to the corresponding entry in `references`.

- If any **images, charts, or tables** appear and are sourced **from within those PDFs**, list them under `suggestedImages` and:
  - Include: title, description, the original source URL (usually a link to the PDF or DOI), and which section of the report it is relevant to.
  - Use the `referenceId` field to link each image to the PDF it originated from.

- Do not fabricate any PDFs or visuals. Only include them if they are explicitly mentioned in the collected data or answers.

- If any gaps are found in the collected data, **initiate real-time grounded Google search** to fill them.

### 🏗️ Report Structure Requirements:
- Start with a clear **Title** and a **Table of Contents**.
- Use proper **Markdown formatting**: include headings, subheadings, bullet points, and tables where needed.
- Address all relevant dimensions explicitly mentioned in the user requirement, such as:
  - Infrastructure
  - Demographics
  - Economic indicators
  - Sector-specific insights
- Provide an **executive summary**, followed by detailed sections with actionable insights.
- Conclude with a well-thought-out **Conclusion** summarizing findings and implications.
- The final report should have the **professional tone and depth** of a formal market or policy report, targeting **8+ pages** in printed form.

### 📌 Output Format (JSON):
{
  "title": "...",
  "sections": [...],
  "references": [...],
  "suggestedPdfs": [...],
  "suggestedImages": [...],
  "suggestedDatasets": [...]
}

If no relevant PDFs, images, or datasets were found in the provided content, **leave those fields empty**. Do not fabricate any entries.
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
