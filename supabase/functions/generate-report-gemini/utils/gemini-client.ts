
// Gemini API client utility

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get the API key from environment variables
export const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

// Updated model name to use the correct Gemini model that's available
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
      temperature: 0.2, // Lower temperature for more factual, structured responses
      maxOutputTokens: maxOutputTokens,
      topP: 0.95,
      topK: 64, // Increased for better coverage
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
    ]
  };

  // CRITICAL: Enable Google Search grounding with expanded options
  if (enableSearch) {
    console.log("Enabling Google Search grounding with enhanced coverage for comprehensive research");
    requestBody.tools = [
      {
        googleSearchRetrieval: {
          disableAttribution: false // Ensure proper attributions for better references
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
    const result = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!result) {
      console.error("Unexpected response format from Gemini:", json);
      throw new Error("Unexpected response format from Gemini API");
    }

    return result;
  } catch (error) {
    console.error("Error calling Gemini API:", error.message);
    throw error;
  }
}
