
import { GeminiError } from "./GeminiError.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const MAX_RETRIES = 3;
const BASE_DELAY = 2000; // 2 seconds

export async function callGeminiWithRetry(url: string, payload: any, retries = MAX_RETRIES): Promise<any> {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY. Please set this in the Edge Function Secrets.");
  }
  
  // Always enable web search capabilities for research tasks
  if (payload.tools) {
    // Make sure Google Search grounding is enabled
    if (!payload.tools.some((tool: any) => tool.googleSearchRetrieval !== undefined)) {
      payload.tools.push({
        googleSearchRetrieval: {}
      });
    }
  }
  
  // Add system instruction for grounding if not present
  if (!payload.systemInstruction) {
    payload.systemInstruction = {
      role: "system",
      parts: [{
        text: "You are a research assistant capable of providing accurate and up-to-date information. Use web search and grounding to answer questions about current events, statistics, and factual information. You should provide comprehensive, detailed, and well-referenced answers based on reliable sources."
      }]
    };
  }
  
  // Try all possible model endpoints if we encounter specific errors
  const modelEndpoints = [
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
  ];
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // For the first attempt, use the provided URL
      // For subsequent attempts, try backup model endpoints
      const currentUrl = attempt === 0 ? url : modelEndpoints[attempt % modelEndpoints.length];
      
      console.log(`Attempt ${attempt + 1} with API key ending in ...${GEMINI_API_KEY.slice(-4)}`);
      
      // Add apiVersion parameter to ensure we're using the latest API version with grounding support
      // Add enableSearch parameter explicitly to enable web search
      const requestUrl = `${currentUrl}?key=${GEMINI_API_KEY}&apiVersion=v1beta&enableSearch=true`;
      
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error with API key ending in ...${GEMINI_API_KEY.slice(-4)}:`, errorData);
        
        const statusCode = response.status;
        const errorMessage = errorData.error?.message || "Unknown Gemini API error";
        
        // Throw formatted error
        throw new GeminiError(`Gemini API error (${statusCode}): ${JSON.stringify(errorData)}`, statusCode, errorData);
      }

      const data = await response.json();
      
      // Log if web search was actually used
      if (data.candidates && data.candidates[0]?.citationMetadata?.citations) {
        console.log("Web search was used with citations:", 
          data.candidates[0].citationMetadata.citations.length);
      }
      
      return data;
      
    } catch (error) {
      lastError = error;
      
      // If this is the last attempt, throw the error
      if (attempt === retries - 1) {
        throw error;
      }
      
      // For 404 errors (model not found), immediately try the next model endpoint
      if (error instanceof GeminiError && error.statusCode === 404) {
        console.log("Model not found, trying alternative model");
        continue;
      }
      
      // For other errors, implement exponential backoff
      const delay = BASE_DELAY * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1} of ${retries}, backing off for ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never be reached as the last attempt would throw
  throw lastError || new Error("Failed to call Gemini API after exhausting all retries");
}
