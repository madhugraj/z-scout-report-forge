
// Test Gemini API key validity
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the API key from environment variables
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      console.error("Missing GEMINI_API_KEY environment variable");
      return new Response(
        JSON.stringify({
          error: "Gemini API key is not configured",
          resolution: "Please set the GEMINI_API_KEY secret in the Supabase Edge Function Secrets."
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Make a simple test call to the Gemini API - updated to use gemini-1.5-pro-002
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent?key=${GEMINI_API_KEY}`;
    
    const testBody = {
      contents: [{ role: "user", parts: [{ text: "Hello, this is a test prompt. Please respond with 'API key is valid'." }] }],
      generationConfig: {
        maxOutputTokens: 20,
        temperature: 0.0,
      }
    };

    const response = await fetch(testUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testBody)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Gemini API test failed (${response.status}): ${errorBody}`);
      return new Response(
        JSON.stringify({
          error: "Gemini API key is invalid or API is unavailable",
          status: response.status,
          details: errorBody,
          resolution: "Please check your API key or try again later if the service is experiencing issues. Make sure your API key has access to the gemini-1.5-pro-002 model."
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Gemini API key is valid for gemini-1.5-pro-002 model"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error testing Gemini API key:", error);
    return new Response(
      JSON.stringify({
        error: `Failed to test Gemini API key: ${error.message}`,
        details: error.stack || "No stack trace available"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
