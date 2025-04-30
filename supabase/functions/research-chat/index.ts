
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiWithRetry } from "./utils/geminiApiHandler.ts";

// Define CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

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
  },
  {
    name: "generateReportStructure",
    description: "Generate a structured report outline based on the research topic",
    parameters: {
      type: "object",
      properties: {
        abstract: {
          type: "string",
          description: "A comprehensive abstract summarizing the research topic"
        },
        mainTopic: {
          type: "string",
          description: "The main topic of the research"
        },
        subtopics: {
          type: "array",
          description: "List of subtopics to cover in the research report",
          items: { type: "string" }
        },
        reportStructure: {
          type: "object",
          description: "The structured outline of the research report",
          properties: {
            title: { type: "string" },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  subsections: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            }
          }
        }
      },
      required: ["abstract", "mainTopic", "subtopics"]
    }
  }
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history = [], functionResults = null, phase = 'initial', forceReport = false } = await req.json();
    
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
    
    // Build messages with history
    const messages = updatedHistory.map(msg => {
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
    
    // Add current message if provided
    if (message) {
      messages.push({
        role: "user",
        parts: [{ text: message }]
      });
    }
    
    // Auto advance to next phase if we've reached the conversation limit
    let currentPhase = phase;
    const userMessageCount = updatedHistory.filter(msg => msg.role === 'user').length;
    
    // If we have 5 or more messages and still in early phases, try to advance
    if (userMessageCount >= 5 && (currentPhase === 'initial' || currentPhase === 'sources')) {
      console.log(`Auto-advancing from ${currentPhase} due to message count: ${userMessageCount}`);
      
      if (currentPhase === 'initial') {
        currentPhase = 'sources';
      } else if (currentPhase === 'sources') {
        currentPhase = 'scope';
      }
    }
    
    // If explicitly forcing report generation
    if (forceReport && currentPhase !== 'report') {
      console.log("Forcing advancement to report phase");
      currentPhase = 'report';
    }
    
    // Define which functions to include based on the research phase
    const availableFunctions = functionSchemas.filter(schema => {
      switch (currentPhase) {
        case 'initial':
          return schema.name === 'researchQuestion';
        case 'sources':
          return schema.name === 'suggestSources';
        case 'scope':
          return schema.name === 'defineResearchScope';
        case 'report':
          return schema.name === 'generateReportStructure';
        default:
          return true;
      }
    });
    
    // Configure payload with grounding enabled - this is the key change
    const payload = {
      contents: messages,
      tools: [{
        functionDeclarations: availableFunctions
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8000,
        topP: 0.95
      },
      // Enable grounding through web search capabilities
      systemInstruction: {
        role: "system",
        parts: [{
          text: "You are a research assistant capable of providing accurate and up-to-date information. Use web search and grounding to answer questions about current events, statistics, and factual information. You should provide comprehensive, detailed, and well-referenced answers based on reliable sources. When discussing healthcare technology systems in countries like India, provide specific facts, statistics, and recent developments based on your search capabilities."
        }]
      },
      // Enable Google search-based grounding
      safetySettings: [
        {
          category: "HARM_CATEGORY_DANGEROUS",
          threshold: "BLOCK_NONE"
        }
      ],
      // Enable Google Search grounding
      tools: [
        {
          functionDeclarations: availableFunctions
        },
        {
          googleSearchRetrieval: {}
        }
      ]
    };

    console.log(`Processing request in phase: ${currentPhase}`);
    console.log("Sending request to Gemini API with grounding enabled...");
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
    let responseText = null;
    
    if (content.parts && content.parts[0].functionCall) {
      functionCall = {
        name: content.parts[0].functionCall.name,
        arguments: content.parts[0].functionCall.args
      };
      
      console.log(`Function call detected: ${functionCall.name}`);

      // If the function call is generateReportStructure, we're ready to generate a full report
      if (functionCall.name === 'generateReportStructure') {
        console.log("Report structure generated, ready for full report generation");
      }
    } else if (content.parts && content.parts[0].text) {
      responseText = content.parts[0].text;
    }
    
    // Create the response message
    const response = {
      role: "assistant",
      content: responseText,
      functionCall: functionCall
    };
    
    // Add this response to the history
    if (response.content || response.functionCall) {
      updatedHistory.push(response);
    }
    
    // Determine if we're ready to generate a report
    const isReadyForReport = updatedHistory.some(msg => 
      msg.role === "assistant" && 
      msg.functionCall &&
      msg.functionCall.name === "defineResearchScope"
    ) || userMessageCount >= 5;
    
    return new Response(JSON.stringify({ 
      response, 
      history: updatedHistory,
      readyForReport: isReadyForReport,
      currentPhase
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
