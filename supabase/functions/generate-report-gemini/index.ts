// /generate-full-report.ts (Monolithic chained approach)
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
    const { query } = await req.json();
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Stage 1: Generate Abstract
    const abstractPrompt = `Write a professional 200-300 word abstract from this research intent:\n"${query}"`;
    const abstract = await callGemini(abstractPrompt);

    // Stage 2: Extract Subtopics
    const subtopicsPrompt = `
From this abstract:
${abstract}

Extract:
- A main topic (1 line)
- A list of 5–10 well-defined subtopics
Return in this JSON format:
{
  "mainTopic": "...",
  "subtopics": ["...", "..."]
}`;
    const subtopicText = await callGemini(subtopicsPrompt);
    const { mainTopic, subtopics } = JSON.parse(subtopicText.match(/```json\s*([\s\S]+?)\s*```/)?.[1] || subtopicText);

    // Stage 3: Scrape each subtopic deeply
    const formattedInfo: string[] = [];
    for (const topic of subtopics) {
      const scrapingPrompt = `
Use Google Search to collect professional, cited information about:
"${topic}"
Return at least 5-10 distinct, cited points with original URLs in Markdown format. Use only real, grounded sources.`;
      const result = await callGemini(scrapingPrompt);
      formattedInfo.push(`### ${topic}\n${result}`);
    }

    // Stage 4: Full Report Generation
    const reportPrompt = `
You are a professional research analyst. Use the below content to write a cited research report.

<Abstract>
${abstract}
</Abstract>

<Collected Research Info>
${formattedInfo.join("\n\n")}
</Collected Research Info>

Report must be formatted in JSON:
{
  "title": "...",
  "sections": [...],
  "references": [...],
  "suggestedPdfs": [...],
  "suggestedImages": [...],
  "suggestedDatasets": [...]
}

Ensure:
- Only grounded citations are used [¹](url)
- suggestedPdfs refer only to PDFs mentioned
- suggestedImages must only come from suggestedPdfs with proper relevance tags.
`;
    const reportText = await callGemini(reportPrompt);
    let jsonStr = reportText;
    const match = reportText.match(/```json\s*([\s\S]+?)\s*```/);
    if (match) jsonStr = match[1];
    const report = JSON.parse(jsonStr);

    return new Response(JSON.stringify({ report, abstract, mainTopic, subtopics }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
