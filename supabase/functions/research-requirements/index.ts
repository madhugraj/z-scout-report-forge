
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function callGeminiAPI(query: string, history: any[] = [], retryCount = 0) {
  try {
    console.log(`Attempting Gemini API call for query: ${query}`);
    
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "system",
            parts: [{ 
              text: `You are a research requirements gathering assistant. Your goal is to help users define their research topic, scope, and requirements clearly. Follow these steps:

1. Understand the main research question
2. Help identify key areas to explore
3. Define the scope of research
4. Suggest relevant sources and methodologies

Always be thorough but concise in your responses.`
            }]
          },
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
                  description: "The main research topic or question"
                },
                research_scope: {
                  type: "string",
                  description: "Detailed description of research scope and limitations"
                },
                location: {
                  type: "string",
                  description: "Geographic or contextual scope of the research"
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
    console.log('Gemini API response received successfully');
    
    return data;
  } catch (error) {
    console.error(`Error in Gemini API call (attempt ${retryCount + 1}):`, error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return callGeminiAPI(query, history, retryCount + 1);
    }
    
    throw error;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, history = [] } = await req.json();
    console.log('Received request with query:', query);

    if (!query?.trim()) {
      throw new Error('Query is required');
    }

    const data = await callGeminiAPI(query, history);
    
    // Check for function calls
    if (data.candidates?.[0]?.content?.parts?.[0]?.functionCall) {
      console.log('Function call detected in response');
      return new Response(JSON.stringify({
        isFunctioncall: true,
        content: data.candidates[0].content.parts[0].functionCall,
        debugInfo: data
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Return regular response
    console.log('Returning regular response');
    return new Response(JSON.stringify({
      isFunctioncall: false,
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated",
      debugInfo: data
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in research-requirements function:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(JSON.stringify({
      error: errorMessage,
      details: {
        timestamp: new Date().toISOString(),
        errorType: error.constructor.name,
        stack: error.stack
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
