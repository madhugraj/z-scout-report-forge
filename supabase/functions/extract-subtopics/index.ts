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
      tools: [
        {
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
  const json = await response.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { abstract } = await req.json();
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const subtopicsPrompt = `Analyze this abstract:
${abstract}

Extract:
- Main topic (one sentence summary)
- 5 to 10 diverse subtopics that comprehensively cover the domain (e.g. infrastructure needs, regional health statistics, economic viability, stakeholder analysis, regulatory landscape, etc.)
Return strictly in this format:
{
  "mainTopic": "...",
  "subtopics": ["...", "..."]
}`;

    const subtopicText = await callGemini(subtopicsPrompt);
    const match = subtopicText.match(/```json\s*([\s\S]+?)\s*```/);
    const jsonStr = match ? match[1] : subtopicText;
    const { mainTopic, subtopics } = JSON.parse(jsonStr);
    
    console.log("Extracted subtopics:", { mainTopic, subtopics });

    return new Response(JSON.stringify({ mainTopic, subtopics }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Subtopic extraction error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
