
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

// Updated to use a valid model
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Default fallback values if API fails
const DEFAULT_MAIN_TOPIC = "Research Analysis";
const DEFAULT_SUBTOPICS = [
  "Introduction and Background",
  "Methodology and Approach",
  "Key Findings and Insights",
  "Analysis and Discussion",
  "Conclusion and Recommendations"
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { abstract } = await req.json();
    
    if (!GEMINI_API_KEY) {
      console.error("Missing Gemini API key");
      return new Response(
        JSON.stringify({ 
          error: "Missing Gemini API key",
          mainTopic: DEFAULT_MAIN_TOPIC,
          subtopics: DEFAULT_SUBTOPICS
        }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const prompt = `
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

    console.log("Calling Gemini API for subtopic extraction");
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
          topP: 0.8,
          topK: 40,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Gemini API error (${response.status}):`, errorData);
      throw new Error(`Gemini API returned ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      console.error("No text in Gemini response:", data);
      throw new Error("No text content in Gemini response");
    }

    console.log("Subtopics extracted successfully, parsing JSON response");
    
    // Extract JSON from response, handling both JSON blocks and raw JSON
    let jsonData;
    try {
      // Check if the response has a JSON code block
      const jsonMatch = resultText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
      
      if (jsonMatch) {
        // Parse JSON from code block
        jsonData = JSON.parse(jsonMatch[1]);
      } else {
        // Try parsing the whole text as JSON
        jsonData = JSON.parse(resultText);
      }
    } catch (jsonError) {
      console.error("Failed to parse JSON from Gemini response:", jsonError);
      console.log("Raw response was:", resultText);
      
      // Create a fallback response based on the abstract
      return new Response(
        JSON.stringify({
          error: "Failed to parse JSON from Gemini response",
          mainTopic: DEFAULT_MAIN_TOPIC,
          subtopics: DEFAULT_SUBTOPICS
        }),
        {
          status: 200, // Still return 200 to avoid cascading failures
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Validate the JSON structure
    if (!jsonData.mainTopic || !Array.isArray(jsonData.subtopics)) {
      console.error("Invalid JSON structure from Gemini:", jsonData);
      throw new Error("Invalid JSON structure from Gemini response");
    }
    
    console.log("Successfully extracted:", jsonData);
    return new Response(
      JSON.stringify({
        mainTopic: jsonData.mainTopic,
        subtopics: jsonData.subtopics
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in subtopic extraction:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        mainTopic: DEFAULT_MAIN_TOPIC,
        subtopics: DEFAULT_SUBTOPICS
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
