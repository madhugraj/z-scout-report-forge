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
    const { subtopics } = await req.json();
    if (!GEMINI_API_KEY || !Array.isArray(subtopics)) {
      return new Response(JSON.stringify({ error: "Missing API key or invalid subtopics" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const formattedInfo: string[] = [];
    for (const topic of subtopics) {
      const scrapingPrompt = `Perform a deep industry-grade search on the following subtopic: \"${topic}\".
Conduct 5–10 distinct research scrapes and return:
- Concrete, grounded insights.
- Include inline citations with original source URLs in Markdown (e.g. [¹](https://...)).
- Avoid repetition, only use verifiable and high-quality sources.`;

      const result = await callGemini(scrapingPrompt);
      formattedInfo.push(`### ${topic}\n${result}`);
      console.log(`Scraped data for topic: ${topic}`);
    }

    return new Response(JSON.stringify({ formattedInfo }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Subtopic scraping error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
