import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-latest:generateContent";

async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { abstract } = await req.json();

    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const subtopicsPrompt = `
Analyze the following abstract and identify the core domain and components:

<ABSTRACT>
${abstract}
</ABSTRACT>

Your task:
- Determine the **main topic**: A single sentence summarizing the research/report scope.
- Extract **5 to 10 diverse, insightful subtopics** that fully cover the scope for deeper exploration (e.g., infrastructure, economic viability, regulatory compliance, demographic impact, etc.).

Return only a valid JSON object **inside a triple backtick block**, exactly like this:

\`\`\`json
{
  "mainTopic": "Summarized main topic here",
  "subtopics": [
    "Subtopic 1",
    "Subtopic 2",
    "Subtopic 3",
    "Subtopic 4",
    "Subtopic 5"
  ]
}
\`\`\`

Avoid commentary or natural language outside this format.
    `.trim();

    const subtopicText = await callGemini(subtopicsPrompt);
    console.log("Gemini raw response:", subtopicText);

    // Robust JSON extraction
    let jsonStr = subtopicText;
    const codeBlockMatch = subtopicText.match(/```json\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      jsonStr = codeBlockMatch[1];
    } else {
      const fallbackMatch = subtopicText.match(/{[\s\S]+}/);
      if (fallbackMatch) jsonStr = fallbackMatch[0];
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      console.error("Raw Gemini output:", subtopicText);
      return new Response(JSON.stringify({ error: "Failed to parse Gemini output", raw: subtopicText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { mainTopic, subtopics } = parsed;
    if (!mainTopic || !Array.isArray(subtopics)) {
      return new Response(JSON.stringify({ error: "Invalid structure in extracted content", raw: parsed }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

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
