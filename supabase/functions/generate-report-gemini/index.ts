
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Google Gemini API endpoint
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return new Response(JSON.stringify({ error: "API key configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Compose a more comprehensive prompt for research report generation with grounding
    const systemPrompt = `
You are a world-class research assistant. Write a very detailed research report on the following topic.
The report should be comprehensive, with at least 10-12 sections covering different aspects of the topic.

1. Structure the report with an Executive Summary, Introduction, Background, Methodology, Main Analysis Sections (multiple), Impact Analysis, Future Directions, and Conclusions/Recommendations.
2. Use an academic tone and add bullet points, lists, and tables when helpful.
3. Generate plausible fake citations/references as [1], [2], etc. and include a References section at the end with 15-20 detailed academic citations.
   - Each citation must have numeric ID that matches its reference in the text (e.g., [1] in text corresponds to reference ID 1)
   - Each citation must include title, authors, journal, year, and URL
   - If appropriate, include a DOI for academic citations in the format "10.xxxx/xxxxx"
4. For each reference, include a corresponding PDF source that would be valuable for that citation.
5. Create rich content with mentions of relevant images, datasets, and PDF sources that would be valuable for the report.
6. For each section, aim for at least 2-3 paragraphs of detailed information.
7. Ensure consistency between citations in the text and the reference list - the numbers must match!

Output as a JSON object with this shape:
{
  "title": "...",
  "sections": [
    {"title": "Executive Summary", "content": "..."},
    {"title": "Introduction", "content": "..."},
    ...
  ],
  "references": [
    {"id": 1, "title": "...", "authors": "...", "journal": "...", "year": "...", "url": "...", "doi": "..."},
    ...
  ],
  "suggestedPdfs": [
    {"title": "...", "author": "...", "description": "...", "relevance": "...", "referenceId": 1},
    ...
  ],
  "suggestedImages": [
    {"title": "...", "description": "...", "source": "...", "relevanceToSection": "..."},
    ...
  ],
  "suggestedDatasets": [
    {"title": "...", "description": "...", "source": "...", "relevanceToSection": "..."},
    ...
  ]
}

Topic: "${query}"
    `.trim();

    console.log("Sending request to Gemini API for query:", query);
    
    // Prepare and send request to Gemini
    const requestUrl = `${GEMINI_URL}?key=${GEMINI_API_KEY}`;
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192  // Increased token limit for more detailed reports
        },
        tools: [{
          googleSearchRetrieval: {
            dynamicRetrievalConfig: {
              mode: "MODE_DYNAMIC",
              dynamicThreshold: 0.6
            }
          }
        }]
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", errText);
      return new Response(JSON.stringify({ error: `Gemini API error: ${errText}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const data = await response.json();
    console.log("Received response from Gemini API");

    // Expecting a structured JSON object in the text response
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let report;
    
    try {
      // Extract JSON from code block if present
      let jsonString = textResponse;
      // Check if the response is wrapped in code blocks
      const jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1];
        console.log("Extracted JSON from code block");
      }
      
      report = JSON.parse(jsonString);
      console.log("Successfully parsed report JSON");
      
      // Process the report to ensure PDFs are linked to references
      if (report.suggestedPdfs && report.references) {
        report.suggestedPdfs = report.suggestedPdfs.map((pdf, index) => {
          // If PDF doesn't have a referenceId, assign one
          if (!pdf.referenceId && report.references[index]) {
            pdf.referenceId = report.references[index].id;
          }
          return pdf;
        });
      }
      
      // Ensure all references have the required properties
      if (report.references) {
        report.references = report.references.map(ref => {
          // Ensure all references have the required properties
          return {
            id: ref.id || 0,
            title: ref.title || "Unknown Title",
            authors: ref.authors || "Unknown Authors",
            journal: ref.journal || "Unknown Journal",
            year: ref.year || "Unknown Year",
            url: ref.url || "",
            doi: ref.doi || ""
          };
        });
      }
    } catch (e) {
      console.error("Failed to parse Gemini output as JSON:", e);
      console.log("Raw response:", textResponse.substring(0, 500) + "...");
      
      // Attempt to create a basic report structure if parsing fails
      try {
        // Create a fallback report with at least some content
        report = {
          title: query,
          sections: [
            {
              title: "Generated Content",
              content: textResponse.replace(/```json|```/g, '').trim()
            }
          ],
          references: [],
          suggestedPdfs: [],
          suggestedImages: [],
          suggestedDatasets: []
        };
        console.log("Created fallback report structure");
      } catch (fallbackError) {
        return new Response(JSON.stringify({ 
          error: "Could not parse or create report from Gemini output.", 
          raw: textResponse.substring(0, 500) + "..." 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Unexpected error in generate-report-gemini:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
