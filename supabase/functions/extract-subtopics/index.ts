
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-latest:generateContent";

async function callGemini(prompt: string): Promise<string> {
  console.log(`Calling Gemini with prompt: ${prompt.substring(0, 100)}...`);
  
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
      // Removing search tools configuration as it's causing issues
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
      ]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gemini API error: ${response.status} - ${errorText}`);
    throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
  }

  const json = await response.json();
  console.log("Gemini response structure:", Object.keys(json));
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
  console.log(`Gemini response text (first 100 chars): ${text.substring(0, 100)}...`);
  return text;
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

    console.log(`Processing abstract of length: ${abstract.length}`);
    console.log(`Abstract excerpt: ${abstract.substring(0, 100)}...`);

    const subtopicsPrompt = `
Analyze the following abstract and identify the core domain and components:

<ABSTRACT>
${abstract}
</ABSTRACT>

Your task:
- Determine the **main topic**: A single sentence summarizing the research/report scope.
- Extract **5 to 10 diverse, insightful subtopics** that fully cover the scope for deeper exploration (e.g., infrastructure, economic viability, regulatory compliance, demographic impact, etc.).

Return only a valid JSON object with this structure:
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

DO NOT include any explanatory text, commentary, or code blocks around the JSON.
    `.trim();

    const subtopicText = await callGemini(subtopicsPrompt);
    console.log("Raw Gemini output:", subtopicText);

    // Simpler approach: find anything that looks like JSON
    let jsonString = subtopicText.trim();
    
    // If there are backticks, extract content between them
    const backtickMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (backtickMatch && backtickMatch[1]) {
      jsonString = backtickMatch[1].trim();
      console.log("Extracted JSON from code block:", jsonString.substring(0, 100));
    }
    
    // Fallback: look for opening and closing braces
    else {
      const braceMatch = jsonString.match(/\{\s*"[\s\S]+\}/);
      if (braceMatch) {
        jsonString = braceMatch[0].trim();
        console.log("Extracted JSON using brace matching:", jsonString.substring(0, 100));
      }
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
      console.log("Successfully parsed JSON with keys:", Object.keys(parsed));
    } catch (e) {
      console.error("Failed to parse JSON:", e.message);
      console.error("JSON string attempted to parse:", jsonString);
      
      // Fallback response with default values
      return new Response(JSON.stringify({ 
        mainTopic: "Analysis of " + abstract.substring(0, 50) + "...",
        subtopics: [
          "Overview and Introduction",
          "Key Findings and Analysis",
          "Methodological Approach",
          "Practical Implications",
          "Future Directions"
        ],
        error: "Failed to parse Gemini output, using default subtopics"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { mainTopic, subtopics } = parsed;
    if (!mainTopic || !Array.isArray(subtopics)) {
      console.error("Invalid structure in extracted content:", parsed);
      
      // Another fallback with more specific error
      return new Response(JSON.stringify({ 
        mainTopic: "Analysis of " + abstract.substring(0, 50) + "...",
        subtopics: [
          "Overview and Introduction",
          "Key Findings and Analysis", 
          "Methodological Approach",
          "Practical Implications",
          "Future Directions"
        ],
        error: "Invalid structure in Gemini response"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`Successfully extracted main topic: "${mainTopic}" and ${subtopics.length} subtopics`);
    return new Response(JSON.stringify({ mainTopic, subtopics }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Subtopic extraction error:", err);
    return new Response(JSON.stringify({ 
      error: err.message,
      mainTopic: "Research Report Analysis",
      subtopics: [
        "Overview and Introduction",
        "Key Findings and Analysis",
        "Methodological Approach", 
        "Practical Implications",
        "Future Directions"
      ]
    }), {
      status: 200, // Changed to 200 to prevent pipeline stopping
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
