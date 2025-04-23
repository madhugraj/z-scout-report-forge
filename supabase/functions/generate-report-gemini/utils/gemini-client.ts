
// Gemini API client utility with improved error handling

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get the API key from environment variables
export const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

// Using gemini-1.5-flash-latest which is available and supported
export const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

/**
 * Make a call to the Gemini API with enhanced options for more comprehensive results
 */
export async function callGemini(prompt: string, enableSearch = true, maxOutputTokens = 30000) {
  if (!GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY environment variable");
    throw new Error("Gemini API key is not configured. Please set the GEMINI_API_KEY secret in the Supabase Edge Function Secrets.");
  }

  const requestUrl = `${GEMINI_URL}?key=${GEMINI_API_KEY}`;
  
  console.log(`Calling Gemini 1.5 Flash model with prompt length: ${prompt.length} chars, search enabled: ${enableSearch}, maxOutputTokens: ${maxOutputTokens}`);
  
  const requestBody: any = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.05, // Lower temperature for more deterministic, factual responses
      maxOutputTokens: maxOutputTokens,
      topP: 1.0,
      topK: 64, // Increased for better coverage
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
    ]
  };

  // Fix for the Google Search grounding - using correct parameter names according to API docs
  if (enableSearch) {
    console.log("Enabling Google Search grounding for research");
    requestBody.tools = [{ 
      googleSearchRetrieval: {} 
    }];
  }

  try {
    // Add retry mechanism for API resilience
    let retries = 3;
    let response = null;
    let errorBody = null;
    
    while (retries > 0) {
      try {
        response = await fetch(requestUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        });
        
        // Detailed logging for API errors
        if (!response.ok) {
          const statusCode = response.status;
          errorBody = await response.text();
          
          console.error(`Gemini API error (${statusCode}): ${errorBody}`);
          
          // Additional diagnostics for common error codes
          if (statusCode === 400) {
            console.error("Bad request error. Check API key format and request payload format.");
          } else if (statusCode === 401) {
            console.error("Authentication error. API key is invalid, revoked, or expired.");
          } else if (statusCode === 403) {
            console.error("Permission denied. API key may not have access to Gemini 1.5 Flash model or has been rate limited.");
          } else if (statusCode === 429) {
            console.error("Rate limit exceeded or quota exceeded. Check your Google AI Studio quota.");
          } else if (statusCode >= 500) {
            console.error("Gemini API server error. The service might be temporarily unavailable.");
          }
          
          retries--;
          
          // Add exponential backoff
          if (retries > 0) {
            const backoffTime = Math.pow(2, 4-retries) * 1000;
            console.log(`Retrying in ${backoffTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
          }
        } else {
          break; // Success - exit retry loop
        }
      } catch (fetchError) {
        console.error(`Fetch error: ${fetchError.message}. Retries left: ${retries-1}`);
        retries--;
        
        if (retries > 0) {
          const backoffTime = Math.pow(2, 4-retries) * 1000;
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }
    }

    if (!response || !response.ok) {
      // Enhanced error message with more specific information
      const statusCode = response?.status || 'Unknown';
      let errorMessage = errorBody || 'Unknown error';
      
      // Try to parse the error body as JSON for more details
      try {
        const errorJson = JSON.parse(errorBody || '{}');
        if (errorJson.error && errorJson.error.message) {
          errorMessage = errorJson.error.message;
        }
      } catch (e) {
        // Use raw error body if not valid JSON
      }
      
      console.error(`Gemini API failed after retries: Status: ${statusCode}, Error: ${errorMessage}`);
      
      throw new Error(`Gemini API error (${statusCode}): ${errorMessage}. Check your API key configuration and permissions.`);
    }

    const json = await response.json();
    
    // Improve error handling for response parsing
    if (!json.candidates || json.candidates.length === 0) {
      console.error("No candidates returned from Gemini:", json);
      throw new Error("No candidates returned from Gemini API");
    }
    
    const candidate = json.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      console.error("Invalid candidate structure from Gemini:", candidate);
      throw new Error("Invalid candidate structure from Gemini API");
    }
    
    const result = candidate.content.parts[0].text;
    if (!result) {
      console.error("Empty text content from Gemini:", json);
      throw new Error("Empty text content from Gemini API");
    }

    console.log(`Successfully received response from Gemini (${result.length} chars)`);
    return result;
  } catch (error) {
    console.error("Error calling Gemini API:", error.message);
    throw error;
  }
}
