
// Gemini API client utility with improved error handling and diagnostics

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get the API key from environment variables
export const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
export const GEMINI_API_KEY_2 = Deno.env.get("GEMINI_API_KEY_2");

// Using the specific Gemini models as requested
export const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent";
// Alternate models that can be used: "gemini-2.0-pro", "gemini-2.0-pro-exp-02-05", "gemini-2.0-flash", "gemini-1.5-pro"

// Track rate limit information
const rateLimitTracker = {
  lastCallTime: 0,
  callsInWindow: 0,
  windowSize: 60000, // 1 minute window
  maxCallsPerWindow: 20, // Conservative limit (actual limit is higher)
  
  canMakeCall() {
    const now = Date.now();
    if (now - this.lastCallTime > this.windowSize) {
      // Reset if window has passed
      this.callsInWindow = 0;
    }
    return this.callsInWindow < this.maxCallsPerWindow;
  },
  
  recordCall() {
    const now = Date.now();
    if (now - this.lastCallTime > this.windowSize) {
      // Reset if window has passed
      this.callsInWindow = 0;
    }
    this.lastCallTime = now;
    this.callsInWindow++;
  }
};

/**
 * Make a call to the Gemini API with enhanced options for more comprehensive results
 */
export async function callGemini(prompt: string, enableSearch = true, maxOutputTokens = 30000) {
  if (!GEMINI_API_KEY && !GEMINI_API_KEY_2) {
    console.error("Missing GEMINI_API_KEY environment variable");
    throw new Error("Gemini API key is not configured. Please set the GEMINI_API_KEY or GEMINI_API_KEY_2 secret in the Supabase Edge Function Secrets.");
  }

  // Select API key (try to rotate if both are available)
  let useApiKey = GEMINI_API_KEY;
  if (!useApiKey && GEMINI_API_KEY_2) {
    useApiKey = GEMINI_API_KEY_2;
  } else if (GEMINI_API_KEY && GEMINI_API_KEY_2) {
    // Simple load balancing - use the second key every other request
    useApiKey = Math.random() > 0.5 ? GEMINI_API_KEY : GEMINI_API_KEY_2;
  }

  // Check API key format for basic validation
  if (!useApiKey.startsWith('AI')) {
    console.warn("Warning: Gemini API key format appears incorrect. Keys typically start with 'AI'");
  }

  const requestUrl = `${GEMINI_URL}?key=${useApiKey}`;
  
  console.log(`Calling Gemini model with prompt length: ${prompt.length} chars, search enabled: ${enableSearch}, maxOutputTokens: ${maxOutputTokens}`);
  
  const requestBody: any = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.05, // Lower temperature for more deterministic, factual responses
      maxOutputTokens: maxOutputTokens,
      topP: 1.0,
      topK: 40, // Keep at 40 (the maximum allowed by API)
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

  // Check if we should rate limit ourselves
  if (!rateLimitTracker.canMakeCall()) {
    const waitTime = 5000; // Wait 5 seconds
    console.log(`Self-imposed rate limit reached, waiting ${waitTime}ms before continuing`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  rateLimitTracker.recordCall();

  try {
    // Add retry mechanism for API resilience
    let retries = 3;
    let response = null;
    let errorBody = null;
    let currentRetry = 0;
    
    while (retries > currentRetry) {
      try {
        const retryAttempt = currentRetry > 0 ? ` (retry ${currentRetry}/${retries})` : '';
        console.log(`Making request to Gemini API${retryAttempt}...`);
        
        // Add exponential backoff for retries
        if (currentRetry > 0) {
          const backoffTime = Math.min(Math.pow(2, currentRetry) * 1000, 10000);
          console.log(`Backing off for ${backoffTime}ms before retry`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
        
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
            // Try to parse error for more details
            try {
              const errorJson = JSON.parse(errorBody);
              if (errorJson.error && errorJson.error.message) {
                console.error("Error message:", errorJson.error.message);
              }
            } catch (e) {}
          } else if (statusCode === 401) {
            console.error("Authentication error. API key is invalid, revoked, or expired.");
            console.error("Please verify your API key in Google AI Studio: https://makersuite.google.com/app/apikeys");
          } else if (statusCode === 403) {
            console.error("Permission denied. API key may not have access to Gemini model or has been rate limited.");
            console.error("Please check model permissions in Google AI Studio: https://makersuite.google.com/app/apikeys");
          } else if (statusCode === 404) {
            console.error("Resource not found. The model may not be available to your API key.");
          } else if (statusCode === 429) {
            console.error("Rate limit exceeded or quota exceeded. Check your Google AI Studio quota.");
            console.error("You may need to upgrade your API tier or request a quota increase.");
            
            // Try to extract retry delay from response
            try {
              const errorJson = JSON.parse(errorBody);
              if (errorJson.error?.details) {
                for (const detail of errorJson.error.details) {
                  if (detail["@type"] === "type.googleapis.com/google.rpc.RetryInfo" && detail.retryDelay) {
                    console.log(`Server suggested retry delay: ${detail.retryDelay}`);
                    const retrySeconds = parseInt(detail.retryDelay.replace(/\D/g, '')) || 60;
                    const backoffTime = Math.max(retrySeconds * 1000, 30000); // At least 30s
                    console.log(`Backing off for ${backoffTime}ms before retry due to rate limit`);
                    await new Promise(resolve => setTimeout(resolve, backoffTime));
                  }
                }
              }
            } catch (e) {}
          } else if (statusCode >= 500) {
            console.error("Gemini API server error. The service might be temporarily unavailable.");
          }
          
          currentRetry++;
          
          // Only retry certain status codes
          if (statusCode === 429 || statusCode === 500 || statusCode === 502 || statusCode === 503 || statusCode === 504) {
            continue;
          } else {
            // Don't retry client errors (except rate limits)
            break;
          }
        } else {
          break; // Success - exit retry loop
        }
      } catch (fetchError) {
        console.error(`Fetch error: ${fetchError.message}. Retries left: ${retries - currentRetry - 1}`);
        currentRetry++;
      }
    }

    if (!response || !response.ok) {
      // Enhanced error message with more specific information
      const statusCode = response?.status || 'Unknown';
      let errorMessage = errorBody || 'Unknown error';
      let errorDetails = null;
      
      // Try to parse the error body as JSON for more details
      try {
        const errorJson = JSON.parse(errorBody || '{}');
        if (errorJson.error) {
          errorMessage = errorJson.error.message || errorMessage;
          errorDetails = errorJson.error;
        }
      } catch (e) {
        // Use raw error body if not valid JSON
      }
      
      console.error(`Gemini API failed after retries: Status: ${statusCode}, Error: ${errorMessage}`);
      
      if (statusCode === 429) {
        throw new Error(`Gemini API rate limit exceeded. Please try again in a few minutes. Details: ${errorMessage}`);
      } else {
        throw new Error(`Gemini API error (${statusCode}): ${errorMessage}. Check your API key configuration and permissions. Details: ${JSON.stringify(errorDetails || {})}`);
      }
    }

    const json = await response.json();
    
    // Improve error handling for response parsing
    if (!json.candidates || json.candidates.length === 0) {
      console.error("No candidates returned from Gemini:", json);
      throw new Error("No candidates returned from Gemini API. This may indicate content filtering or an empty response.");
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
    
    // Add details about the environment to help with debugging
    console.error("Environment information:");
    console.error(`- Runtime: ${Deno.version.deno}`);
    console.error(`- API URL: ${GEMINI_URL}`);
    console.error(`- API key format valid: ${useApiKey?.startsWith('AI') ? 'Yes' : 'No'}`);
    console.error(`- API key length: ${useApiKey?.length || 0} characters`);
    
    throw error;
  }
}
