
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Google Gemini API endpoint
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return new Response(JSON.stringify({ error: "API key configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Compose a precise prompt for research report generation
    const systemPrompt = `
You are a world-class research assistant. Write a detailed research report on the following topic.
1. Structure the report with an Executive Summary, Introduction, Literature Review, Impact Analysis, and Conclusions/Recommendations.
2. Use an academic tone and add bullet points, lists, or tables when helpful.
3. If relevant, generate plausible fake citations as [1], [2], ...
4. Output as a JSON object with this shape:
{
  "title": "...",
  "sections": [
    {"title": "Executive Summary", "content": "..."},
    ...
  ]
}
Topic: "${query}"
    `.trim();

    console.log("Sending request to Gemini API for query:", query);
    
    // Prepare and send request to Gemini
    const requestUrl = `${GEMINI_URL}?key=${GEMINI_API_KEY}`;
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096
        }
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", errText);
      return new Response(JSON.stringify({ error: `Gemini API error: ${errText}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const data = await response.json();
    console.log("Received response from Gemini API");

    // Expecting a structured JSON object in the text response
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let report;
    
    try {
      // Extract JSON from code block if present
      let jsonString = textResponse;
      // Check if the response is wrapped in code blocks
      const jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1];
        console.log("Extracted JSON from code block");
      }
      
      report = JSON.parse(jsonString);
      console.log("Successfully parsed report JSON");
    } catch (e) {
      console.error("Failed to parse Gemini output as JSON:", e);
      console.log("Raw response:", textResponse);
      
      // Attempt to create a basic report structure if parsing fails
      try {
        // Create a fallback report with at least some content
        report = {
          title: query,
          sections: [
            {
              title: "Generated Content",
              content: textResponse.replace(/```json|```/g, '').trim()
            }
          ]
        };
        console.log("Created fallback report structure");
      } catch (fallbackError) {
        return new Response(JSON.stringify({ 
          error: "Could not parse or create report from Gemini output.", 
          raw: textResponse 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
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
