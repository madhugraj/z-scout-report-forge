
// Import existing required Deno modules
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

// New version of callGemini with grounding support
export async function callGemini(prompt: string, enableGrounding = true, maxTokens = 8000): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }

  // Determine which model and config to use based on grounding needs
  const model = enableGrounding ? 
    "gemini-1.5-pro-002" : 
    "gemini-1.5-flash-002";

  const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const apiUrl = `${baseUrl}?key=${GEMINI_API_KEY}`;

  try {
    console.log(`Calling Gemini API (model: ${model}, grounding: ${enableGrounding ? "enabled" : "disabled"})`);
    
    const payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: maxTokens,
        topP: 0.95,
        topK: 40
      }
    };

    // Add grounding configurations if enabled
    if (enableGrounding) {
      // @ts-ignore - Add tools for web search grounding
      payload.tools = [
        {
          googleSearchRetrieval: {}
        }
      ];
      
      // @ts-ignore - Add system instructions for grounding
      payload.systemInstruction = {
        parts: [{
          text: "You are a research assistant with access to the latest information via web search. Use this capability to provide accurate, up-to-date information when answering queries. Include specific dates, statistics, and factual information from reliable sources. When discussing current topics, always reference the most recent available data and explicitly mention the publication dates of your sources."
        }]
      };
    }
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API Error (${response.status}): ${errorText}`);
      
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
      throw new Error("Invalid response format from Gemini API");
    }

    const textContent = result.candidates[0].content.parts[0].text;
    
    // Log some metrics about the response
    console.log(`Received response from Gemini (${textContent.length} chars, model: ${model})`);
    
    return textContent;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    
    if (error.message?.includes("Too many tokens") || error.message?.includes("quota exceeded")) {
      console.log("Retrying with reduced context...");
      const shortenedPrompt = prompt.substring(0, Math.floor(prompt.length * 0.7));
      return await callGemini(shortenedPrompt, enableGrounding, Math.floor(maxTokens * 0.7));
    }
    
    throw error;
  }
}
