import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_KEY_2 = Deno.env.get("GEMINI_API_KEY_2");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";
// Alternate models that can be used: "gemini-2.0-pro", "gemini-2.0-pro-exp-02-05", "gemini-2.0-flash", "gemini-1.5-pro"

// Track API key usage and implement simple rate limiting
const apiKeyTracker = {
  keys: {} as Record<string, {
    lastUsed: number,
    usageCount: number,
    cooldownUntil: number
  }>,
  
  getNextKey() {
    const now = Date.now();
    const availableKeys = [];
    
    // Use primary key if available
    if (GEMINI_API_KEY) {
      const keyData = this.keys[GEMINI_API_KEY] || { lastUsed: 0, usageCount: 0, cooldownUntil: 0 };
      if (now > keyData.cooldownUntil) {
        availableKeys.push(GEMINI_API_KEY);
      }
    }
    
    // Use secondary key if available
    if (GEMINI_API_KEY_2) {
      const keyData = this.keys[GEMINI_API_KEY_2] || { lastUsed: 0, usageCount: 0, cooldownUntil: 0 };
      if (now > keyData.cooldownUntil) {
        availableKeys.push(GEMINI_API_KEY_2);
      }
    }
    
    if (availableKeys.length === 0) {
      throw new Error("All API keys are currently on cooldown. Please try again in a few minutes.");
    }
    
    // Prefer the key with less usage
    if (availableKeys.length > 1) {
      availableKeys.sort((a, b) => 
        (this.keys[a]?.usageCount || 0) - (this.keys[b]?.usageCount || 0)
      );
    }
    
    return availableKeys[0];
  },
  
  recordUsage(key: string) {
    const now = Date.now();
    if (!this.keys[key]) {
      this.keys[key] = { lastUsed: now, usageCount: 1, cooldownUntil: 0 };
    } else {
      this.keys[key].lastUsed = now;
      this.keys[key].usageCount++;
      
      // Reset usage count every minute
      if (now - this.keys[key].lastUsed > 60000) {
        this.keys[key].usageCount = 1;
      }
    }
  },
  
  setCooldown(key: string, durationMs: number) {
    const now = Date.now();
    if (!this.keys[key]) {
      this.keys[key] = { lastUsed: now, usageCount: 0, cooldownUntil: now + durationMs };
    } else {
      this.keys[key].cooldownUntil = now + durationMs;
    }
    console.log(`Set cooldown for key ending in ...${key.substring(key.length-4)} until ${new Date(now + durationMs).toLocaleTimeString()}`);
  }
};

// Function schemas for the research assistant
const functionSchemas = [
  {
    name: "researchQuestion",
    description: "Extract the main research question and sub-questions from user input",
    parameters: {
      type: "object",
      properties: {
        mainQuestion: {
          type: "string",
          description: "The primary research question"
        },
        subQuestions: {
          type: "array",
          description: "List of sub-questions that help explore the main research question",
          items: {
            type: "string"
          }
        },
        researchContext: {
          type: "string",
          description: "Brief context about the research topic"
        }
      },
      required: ["mainQuestion"]
    }
  },
  {
    name: "suggestSources",
    description: "Suggest academic sources that would be relevant to the research topic",
    parameters: {
      type: "object",
      properties: {
        recommendedSources: {
          type: "array",
          description: "List of recommended sources for the research",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              authors: { type: "string" },
              year: { type: "string" },
              description: { type: "string" },
              relevance: { type: "string" }
            }
          }
        }
      },
      required: ["recommendedSources"]
    }
  },
  {
    name: "defineResearchScope",
    description: "Define the scope and limitations of the research",
    parameters: {
      type: "object",
      properties: {
        scope: {
          type: "array",
          description: "What aspects should be included in the research scope",
          items: { type: "string" }
        },
        limitations: {
          type: "array",
          description: "What aspects should be excluded from the research scope",
          items: { type: "string" }
        },
        timeframe: {
          type: "string",
          description: "Relevant timeframe for the research"
        }
      },
      required: ["scope"]
    }
  }
];

async function callGeminiWithRetry(url: string, payload: any) {
  const maxRetries = 3;
  let attempt = 0;
  let lastError = null;
  
  while (attempt < maxRetries) {
    attempt++;
    try {
      // Get the next available API key
      const apiKey = apiKeyTracker.getNextKey();
      const requestUrl = `${url}?key=${apiKey}`;
      
      console.log(`Calling Gemini API (attempt ${attempt}/${maxRetries})...`);
      apiKeyTracker.recordUsage(apiKey);
      
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      // Handle rate limiting
      if (response.status === 429) {
        const cooldownDuration = 60000; // 1 minute cooldown
        apiKeyTracker.setCooldown(apiKey, cooldownDuration);
        
        const responseText = await response.text();
        console.error(`Rate limit hit (429): ${responseText}`);
        
        if (attempt < maxRetries) {
          // Try with a different key on next attempt
          const backoff = Math.pow(2, attempt) * 1000;
          console.log(`Rate limit reached, backing off for ${backoff}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, backoff));
          continue;
        } else {
          throw new Error("API rate limit reached. Please try again in a minute.");
        }
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error ${response.status}: ${errorText}`);
        
        if (response.status >= 500) {
          // Server error, retry
          if (attempt < maxRetries) {
            const backoff = Math.pow(2, attempt) * 1000;
            console.log(`Server error, backing off for ${backoff}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, backoff));
            continue;
          }
        }
        
        throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      lastError = error;
      console.error(`Error on attempt ${attempt}:`, error);
      
      if (attempt >= maxRetries) {
        break;
      }
      
      // Exponential backoff
      const backoff = Math.pow(2, attempt) * 1000;
      console.log(`Backing off for ${backoff}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }
  
  throw lastError || new Error("Failed after multiple retries");
}

async function callGeminiWithFunctionCall(message: string, history: Array<any>) {
  try {
    console.log("Calling Gemini API with function calling capabilities...");
    
    // Build messages with history
    const messages = history.map(msg => {
      if (msg.role === "assistant" && msg.functionCall) {
        return {
          role: "model",
          parts: [{
            functionCall: {
              name: msg.functionCall.name,
              args: msg.functionCall.arguments
            }
          }]
        };
      } else if (msg.role === "function") {
        return {
          role: "function",
          parts: [{
            functionResponse: {
              name: msg.name,
              response: msg.content
            }
          }]
        };
      } else {
        return {
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        };
      }
    });
    
    // Add current message
    messages.push({
      role: "user",
      parts: [{ text: message }]
    });
    
    const payload = {
      contents: messages,
      tools: [{
        functionDeclarations: functionSchemas
      }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
        maxOutputTokens: 8000
      }
    };

    console.log("Sending request to Gemini API...");
    const responseData = await callGeminiWithRetry(GEMINI_URL, payload);
    
    console.log("Received response from Gemini API:", JSON.stringify(responseData).substring(0, 300) + "...");
    
    // Parse the response for function calls
    const candidate = responseData.candidates && responseData.candidates[0];
    
    if (!candidate || !candidate.content) {
      throw new Error("Invalid response structure from Gemini API");
    }
    
    const content = candidate.content;
    
    // Check for function calls
    let functionCall = null;
    if (content.parts && content.parts[0].functionCall) {
      functionCall = {
        name: content.parts[0].functionCall.name,
        arguments: content.parts[0].functionCall.args
      };
      
      console.log(`Function call detected: ${functionCall.name}`);
      return {
        role: "assistant",
        content: null,
        functionCall: functionCall
      };
    }
    
    // Return regular text response
    return {
      role: "assistant",
      content: content.parts[0].text,
      functionCall: null
    };
    
  } catch (error) {
    // Enhanced error logging for better debugging
    console.error("Error calling Gemini API:", error);
    
    if (error.message.includes("rate limit") || error.message.includes("quota exceeded")) {
      throw new Error("API rate limit reached. Please try again in a minute.");
    }
    
    throw error;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history = [], functionResults = null, phase = 'initial' } = await req.json();
    
    // Update history with function results if provided
    let updatedHistory = [...history];
    
    if (functionResults) {
      const lastMessage = updatedHistory[updatedHistory.length - 1];
      
      if (lastMessage?.functionCall) {
        // Add function result to history
        updatedHistory.push({
          role: "function",
          name: lastMessage.functionCall.name,
          content: JSON.stringify(functionResults)
        });
      }
    }
    
    const payload = {
      contents: updatedHistory.map(msg => {
        if (msg.role === "assistant" && msg.functionCall) {
          return {
            role: "model",
            parts: [{
              functionCall: {
                name: msg.functionCall.name,
                args: msg.functionCall.arguments
              }
            }]
          };
        } else if (msg.role === "function") {
          return {
            role: "function",
            parts: [{
              functionResponse: {
                name: msg.name,
                response: msg.content
              }
            }]
          };
        } else {
          return {
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
          };
        }
      }),
      tools: [{
        functionDeclarations: functionSchemas.filter(schema => {
          switch (phase) {
            case 'initial':
              return schema.name === 'researchQuestion';
            case 'sources':
              return schema.name === 'suggestSources';
            case 'scope':
              return schema.name === 'defineResearchScope';
            default:
              return true;
          }
        })
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8000,
        topP: 0.95,
        model: "gemini-2.0-pro"
      }
    };

    console.log("Sending request to Gemini API...");
    const responseData = await callGeminiWithRetry(GEMINI_URL, payload);
    
    console.log("Received response from Gemini API:", JSON.stringify(responseData).substring(0, 300) + "...");
    
    // Parse the response for function calls
    const candidate = responseData.candidates && responseData.candidates[0];
    
    if (!candidate || !candidate.content) {
      throw new Error("Invalid response structure from Gemini API");
    }
    
    const content = candidate.content;
    
    // Check for function calls
    let functionCall = null;
    if (content.parts && content.parts[0].functionCall) {
      functionCall = {
        name: content.parts[0].functionCall.name,
        arguments: content.parts[0].functionCall.args
      };
      
      console.log(`Function call detected: ${functionCall.name}`);
      return {
        role: "assistant",
        content: null,
        functionCall: functionCall
      };
    }
    
    // Return regular text response
    return new Response(JSON.stringify({ 
      response, 
      history: updatedHistory 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Error in research-chat function:", error);
    
    return new Response(JSON.stringify({
      error: error.message,
      details: error.stack || "No stack trace available"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
