
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  
  if (!GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "Missing API key",
        details: "The GEMINI_API_KEY is not set in the Edge Function secrets",
        resolution: "Please set the GEMINI_API_KEY in the Supabase dashboard under Edge Functions > Secrets"
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  try {
    const modelToTest = "gemini-1.5-pro-002"; // Using the most advanced model for testing
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelToTest}:generateContent?key=${GEMINI_API_KEY}`;
    
    // Include a test for grounding capabilities
    const payload = {
      contents: [{ 
        parts: [{ 
          text: "Generate a brief response to test the API connection and grounding capabilities: What year is it now?"
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 100
      },
      // Test grounding capabilities
      tools: [
        {
          googleSearchRetrieval: {}
        }
      ]
    };
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const errorDetails = data.error || {};
      
      // More detailed error categorization
      let resolution = "";
      
      if (response.status === 400) {
        resolution = "The request format may be incorrect. Check if your API key is properly formatted.";
      } else if (response.status === 401 || response.status === 403) {
        resolution = "Authentication failed. Your API key may be invalid or doesn't have permission to access this model.";
      } else if (response.status === 404) {
        resolution = `Model '${modelToTest}' not found. You might need to request access to this model in Google AI Studio.`;
      } else if (response.status === 429) {
        resolution = "You've exceeded your rate limit or quota. Check your Google AI Studio quota settings.";
      } else {
        resolution = "There may be an issue with the Gemini API. Please try again later.";
      }
      
      return new Response(
        JSON.stringify({
          error: errorDetails.message || "API key validation failed",
          details: errorDetails,
          status: response.status,
          resolution
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if the response has content and test for grounding capabilities
    const hasValidResponse = data.candidates && 
                            data.candidates[0] && 
                            data.candidates[0].content && 
                            data.candidates[0].content.parts && 
                            data.candidates[0].content.parts[0].text;
                            
    const responseText = hasValidResponse ? data.candidates[0].content.parts[0].text : "";
    
    // Check if the response contains the current year, which would indicate grounding is working
    const currentYear = new Date().getFullYear().toString();
    const hasGroundingCapability = responseText.includes(currentYear);
    
    return new Response(
      JSON.stringify({
        success: true,
        model: modelToTest,
        hasGroundingCapability,
        testResponse: responseText.substring(0, 100) + (responseText.length > 100 ? "..." : "")
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "API key validation failed",
        details: error.message,
        resolution: "Please check your network connection and try again"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
