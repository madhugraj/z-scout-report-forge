
// Test Gemini API key validity with enhanced error diagnostics
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

    console.log("Testing Gemini API key validity...");
    console.log("API Key format check: " + (GEMINI_API_KEY.startsWith('AI') ? "Appears to be valid format" : "Incorrect format - should start with 'AI'"));
    console.log("API Key length: " + GEMINI_API_KEY.length + " characters");

    // Make a simple test call to the Gemini API using gemini-1.5-pro-002
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent?key=${GEMINI_API_KEY}`;
    
    // Include function calling capabilities in test
    const testBody = {
      contents: [{ role: "user", parts: [{ text: "Hello, this is a test prompt. Please respond with 'API key is valid'." }] }],
      tools: [{
        functionDeclarations: [{
          name: "testFunction",
          description: "This is a test function for API validation",
          parameters: {
            type: "object",
            properties: {
              response: {
                type: "string",
                description: "Test response"
              }
            },
            required: ["response"]
          }
        }]
      }],
      generationConfig: {
        maxOutputTokens: 20,
        temperature: 0.0,
      }
    };

    console.log("Sending test request to Gemini API...");
    const response = await fetch(testUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testBody)
    });

    const statusCode = response.status;
    console.log(`Gemini API test response status: ${statusCode}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Gemini API test failed (${statusCode}): ${errorBody}`);
      
      // Parse error for more detailed diagnostics
      let detailedError = errorBody;
      try {
        const errorJson = JSON.parse(errorBody);
        if (errorJson.error) {
          detailedError = errorJson.error;
          
          // Check for specific error conditions
          if (errorJson.error.status === "PERMISSION_DENIED") {
            console.error("Permission denied error detected. This typically means the API key doesn't have access to the requested model.");
          } else if (errorJson.error.status === "INVALID_ARGUMENT") {
            console.error("Invalid argument error detected. This could be due to an incorrect API format or a problem with the request.");
          } else if (errorJson.error.status === "UNAUTHENTICATED") {
            console.error("Authentication error detected. The API key is likely invalid or expired.");
          }
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }
      
      return new Response(
        JSON.stringify({
          error: "Gemini API key is invalid or API is unavailable",
          status: statusCode,
          details: detailedError,
          resolution: "Please check your API key or try again later if the service is experiencing issues. Make sure your API key has access to the gemini-1.5-pro-002 model and supports function calling."
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const responseData = await response.json();
    console.log("Gemini API test successful. Response:", JSON.stringify(responseData).substring(0, 300) + "...");
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Gemini API key is valid for gemini-1.5-pro-002 model with function calling support",
        modelInfo: {
          model: "gemini-1.5-pro-002",
          capabilities: ["text generation", "web search grounding", "image analysis", "function calling"]
        }
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
        details: error.stack || "No stack trace available",
        resolution: "Please verify your internet connection, API key format, and try again."
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
