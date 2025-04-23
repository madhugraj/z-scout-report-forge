
// Gemini API client utility

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

  // Enhanced Google Search grounding with expanded options
  if (enableSearch) {
    console.log("Enabling Google Search grounding with enhanced coverage for comprehensive research");
    requestBody.tools = [
      {
        googleSearchRetrieval: {
          disableAttribution: false, // Ensure proper attributions
          searchQueriesPerRequest: 15 // Increase search queries per request for broader research
        }
      }
    ];
  }

  try {
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Gemini API error (${response.status}): ${errorBody}`);
      throw new Error(`Gemini API returned status ${response.status}: ${errorBody}`);
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
