
// Gemini API client utility

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get the API key from environment variables
export const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

// Unified model name for consistency
export const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent";

/**
 * Make a call to the Gemini API
 */
export async function callGemini(prompt: string, enableSearch = true, maxOutputTokens = 12000) {
  const requestUrl = `${GEMINI_URL}?key=${GEMINI_API_KEY}`;
  
  console.log(`Calling Gemini with prompt length: ${prompt.length} chars, search enabled: ${enableSearch}, maxOutputTokens: ${maxOutputTokens}`);
  
  const requestBody: any = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1, // Lower temperature for more structured, scholarly responses
      maxOutputTokens: maxOutputTokens,
      topP: 0.9,
      topK: 40,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
    ]
  };

  // CRITICAL: This is what enables Google Search grounding
  if (enableSearch) {
    console.log("Enabling Google Search grounding for detailed research");
    requestBody.tools = [
      {
        googleSearchRetrieval: {} // Format for Gemini 2.0
      }
    ];
  }

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
}
