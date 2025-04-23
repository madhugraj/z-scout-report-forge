
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get the API key from environment variables or use a fallback
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

// Updated to use a valid model
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing Gemini API key" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Write a professional 200-300 word abstract from this research intent:\n"${query}"`;
    
    console.log("Calling Gemini API for abstract generation");
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
          maxOutputTokens: 1024,
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
    const abstract = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!abstract) {
      console.error("No abstract text in Gemini response:", data);
      throw new Error("No text content in Gemini response");
    }

    console.log("Abstract generated successfully");
    return new Response(JSON.stringify({ abstract }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in abstract generation:", error);
    // Create a fallback abstract for robustness
    const fallbackAbstract = "This is a fallback abstract generated due to API issues. Please try again later or check your API key configuration. The abstract would normally contain a summary of your research query.";
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        abstract: fallbackAbstract
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
