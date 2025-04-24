import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiWithRetry } from "./utils/geminiApiHandler.ts";

// Define CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function schemas remain the same
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

async function callGeminiWithFunctionCall(message: string, history: Array<any>) {
  const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent";
  
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history = [], functionResults = null } = await req.json();
    
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
    
    // Get response from Gemini with enhanced error handling
    const response = await callGeminiWithFunctionCall(message, updatedHistory);
    
    // Add response to history for context
    updatedHistory.push(response);
    
    // Return response with updated history
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
