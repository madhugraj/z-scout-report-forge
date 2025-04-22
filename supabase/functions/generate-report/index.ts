
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-latest:generateContent";

async function callGemini(prompt: string) {
  const requestUrl = `${GEMINI_URL}?key=${GEMINI_API_KEY}`;
  const response = await fetch(requestUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 12000,
        topP: 0.7,
        topK: 40,
      },
      // Removing search tools configuration as it's causing issues
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
      ]
    }),
  });
  const json = await response.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text || "";
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
- Structure report with: Title, Executive Summary, Table of Contents, Sectioned Chapters, and Conclusion.
- Include citations in Markdown format.
- Identify referenced PDFs and assign unique referenceId.
- From referenced PDFs, extract tables/images as suggestedImages.
- Format output in JSON only:
{
  "title": "...",
  "sections": [...],
  "references": [...],
  "suggestedPdfs": [...],
  "suggestedImages": [...],
  "suggestedDatasets": [...]
}`;

    const reportText = await callGemini(reportPrompt + `\n\n<Abstract>\n${abstract}\n</Abstract>\n<Research>\n${Array.isArray(formattedInfo) ? formattedInfo.join("\n\n") : formattedInfo}\n</Research>`);
    const match = reportText.match(/```json\s*([\s\S]+?)\s*```/);
    const jsonStr = match ? match[1] : reportText;
    const report = JSON.parse(jsonStr);
    
    console.log("Generated report with sections:", report.sections.length);

    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Report generation error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
