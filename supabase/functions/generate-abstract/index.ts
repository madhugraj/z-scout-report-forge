
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "AIzaSyATvHiL-3EA3Dt8zGZBNaAUYJkA-xcUYTU";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent";

async function callGemini(prompt: string): Promise<string> {
  console.log("Calling Gemini with prompt:", prompt.substring(0, 100) + "...");
  
  try {
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
        tools: [{
          google_search: {
            dynamicRetrievalConfig: {
              mode: "MODE_ALWAYS"
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

    const json = await response.json();
    console.log("Gemini API response structure:", Object.keys(json));

    if (!response.ok) {
      console.error("Gemini API error:", json);
      throw new Error(`Gemini API error: ${json.error?.message || JSON.stringify(json)}`);
    }

    if (!json.candidates || !json.candidates[0]?.content?.parts?.[0]?.text) {
      console.error("Invalid Gemini response structure:", JSON.stringify(json, null, 2));
      throw new Error("Gemini did not return a valid response structure");
    }

    const text = json.candidates[0].content.parts[0].text;
    console.log("Gemini response text (first 100 chars):", text.substring(0, 100) + "...");
    return text;
  } catch (error) {
    console.error("Error making Gemini API call:", error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    console.log("Received abstract generation request for query:", query);

    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const abstractPrompt = `
You are a domain-specific research assistant.

Convert the following project intent into a detailed 200–300 word professional abstract suitable for an industry-grade feasibility or market report.

Ensure your output covers:
- Context and background
- Key goals of the project
- Challenges or considerations
- Expected outcomes or deliverables

Avoid bullet points and return only a continuous, coherent abstract.

Query: "${query}"
    `.trim();

    try {
      const abstract = await callGemini(abstractPrompt);
      console.log("Successfully generated abstract of length:", abstract.length);
      
      return new Response(JSON.stringify({ abstract }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (geminiError) {
      console.error("Error calling Gemini API:", geminiError);
      
      // Try with fallback API key if first key failed
      if (GEMINI_API_KEY !== "AIzaSyATvHiL-3EA3Dt8zGZBNaAUYJkA-xcUYTU") {
        console.log("Trying with fallback API key...");
        try {
          const fallbackApiKey = "AIzaSyATvHiL-3EA3Dt8zGZBNaAUYJkA-xcUYTU";
          const fallbackUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent";
          
          const fallbackResponse = await fetch(`${fallbackUrl}?key=${fallbackApiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: abstractPrompt }] }],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 12000,
                topP: 0.7,
                topK: 40,
              },
              tools: [{
                google_search: {
                  dynamicRetrievalConfig: {
                    mode: "MODE_ALWAYS"
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
          
          const fallbackJson = await fallbackResponse.json();
          if (!fallbackJson.candidates || !fallbackJson.candidates[0]?.content?.parts?.[0]?.text) {
            throw new Error("Fallback API key also failed");
          }
          
          const fallbackAbstract = fallbackJson.candidates[0].content.parts[0].text;
          console.log("Successfully generated abstract with fallback key, length:", fallbackAbstract.length);
          
          return new Response(JSON.stringify({ abstract: fallbackAbstract }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        } catch (fallbackError) {
          console.error("Fallback API key also failed:", fallbackError);
        }
      }
      
      return new Response(JSON.stringify({ 
        error: `Error from Gemini API: ${geminiError.message}`,
        abstract: `We were unable to generate an abstract for "${query}" due to an API error. This may be due to temporary issues with the Gemini service or API key configuration.` 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  } catch (err) {
    console.error("Abstract generation function error:", err);
    return new Response(JSON.stringify({ 
      error: err.message,
      abstract: "An error occurred during abstract generation. Please check the logs for details."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
