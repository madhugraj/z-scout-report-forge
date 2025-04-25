
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, history = [] } = await req.json();

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: query }]
          },
          ...history
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        },
        tools: [{
          functionDeclarations: [{
            name: "ResearchAgent",
            description: "Initiates the research process based on gathered requirements",
            parameters: {
              type: "object",
              properties: {
                topic: {
                  type: "string",
                  description: "The subject or topic"
                },
                research_scope: {
                  type: "string",
                  description: "Detailed description of the research requirements"
                },
                location: {
                  type: "string",
                  description: "Location where the research is to be conducted"
                },
                user_summary: {
                  type: "string",
                  description: "Brief summary of user requirements (3-5 lines)"
                }
              },
              required: ["topic", "research_scope", "location", "user_summary"]
            }
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Check for function calls
    if (data.candidates?.[0]?.content?.parts?.[0]?.functionCall) {
      return new Response(JSON.stringify({
        isFunctioncall: true,
        content: data.candidates[0].content.parts[0].functionCall,
        debugInfo: data
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Return regular response
    return new Response(JSON.stringify({
      isFunctioncall: false,
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated",
      debugInfo: data
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in research-requirements function:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
