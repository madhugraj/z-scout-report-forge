
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

// Updated to use a valid model
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subtopics } = await req.json();
    
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: "Missing Gemini API key",
          formattedInfo: ["Error: Missing API key"]
        }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate subtopics
    if (!Array.isArray(subtopics) || subtopics.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid subtopics format",
          formattedInfo: ["Error: Invalid subtopics format"] 
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Processing ${subtopics.length} subtopics`);
    
    // Process each subtopic in parallel
    const formattedInfoPromises = subtopics.map(async (topic, index) => {
      try {
        console.log(`Processing subtopic ${index + 1}/${subtopics.length}: ${topic}`);
        
        const prompt = `
Create a detailed research summary on: "${topic}"

Include:
- Key concepts and definitions
- Important research findings
- Current industry practices
- Relevant statistics and data points
- Challenges and opportunities

Format with proper headings, bullet points, and citations where appropriate.
`;

        const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 4096,
              topP: 0.8,
              topK: 40,
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
            ]
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Gemini API error for subtopic "${topic}" (${response.status}):`, errorData);
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!result) {
          console.error(`No text in Gemini response for subtopic "${topic}":`, data);
          throw new Error("Empty response from Gemini API");
        }

        console.log(`Successfully processed subtopic: ${topic}`);
        return `### ${topic}\n${result}`;
      } catch (error) {
        console.error(`Error processing subtopic "${topic}":`, error);
        return `### ${topic}\n*Error processing this subtopic: ${error.message}*\n\nUnfortunately, we couldn't retrieve detailed information for this topic. Here's some general information instead:\n\n${topic} is an important area within this field that warrants further investigation. When researching this topic, consider examining recent academic journals, industry reports, and expert opinions.`;
      }
    });

    // Wait for all subtopics to be processed
    const formattedInfo = await Promise.all(formattedInfoPromises);
    
    console.log("All subtopics processed successfully");
    return new Response(JSON.stringify({ formattedInfo }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in scrape-subtopics function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        formattedInfo: ["Error processing subtopics"] 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
