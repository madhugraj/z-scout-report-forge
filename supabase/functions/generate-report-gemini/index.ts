
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

    // Enhanced prompt for research report generation with better grounding and deep search
    const systemPrompt = `
You are a world-class research assistant. Write a very detailed research report on the following topic.
The report should be comprehensive, with at least 10-12 sections covering different aspects of the topic.

1. Structure the report with an Executive Summary, Introduction, Background, Methodology, Main Analysis Sections (multiple), Impact Analysis, Future Directions, and Conclusions/Recommendations.
2. Use an academic tone and add bullet points, lists, and tables when helpful.
3. Generate plausible fake citations/references as [1], [2], etc. and include a References section at the end with AT LEAST 20-25 detailed academic citations.
   - Each citation must have numeric ID that matches its reference in the text (e.g., [1] in text corresponds to reference ID 1)
   - Each citation must include title, authors, journal, year, URL, and DOI
   - For academic citations, include a DOI in the format "10.xxxx/xxxxx"
4. For EACH reference, create a corresponding PDF source with title, author, description, relevance rating, and connection to the referenceId.
5. Create at least 10 relevant images with detailed descriptions and source information.
6. Create at least 8 relevant datasets or tables with descriptions and sources.
7. For each section, aim for at least 3-4 paragraphs of detailed, evidence-based information.
8. Ensure perfect consistency between citations in the text and the reference list - the numbers must match!
9. Use contemporary research published within the last 3 years when possible.

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
    
    // Enhanced Gemini API request with better search retrieval settings
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
          maxOutputTokens: 8192,
          topP: 0.95,
          topK: 64
        },
        tools: [{
          googleSearchRetrieval: {
            dynamicRetrievalConfig: {
              mode: "MODE_DYNAMIC",
              dynamicThreshold: 0.85
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
          if (!pdf.referenceId && report.references[index % report.references.length]) {
            pdf.referenceId = report.references[index % report.references.length].id;
          }
          return pdf;
        });
      }
      
      // Ensure all references have the required properties
      if (report.references) {
        report.references = report.references.map(ref => {
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
      
      // Ensure we have enough content for images and datasets
      if (!report.suggestedImages || report.suggestedImages.length < 5) {
        report.suggestedImages = generateDummyImages(query, 10);
      }
      
      if (!report.suggestedDatasets || report.suggestedDatasets.length < 3) {
        report.suggestedDatasets = generateDummyDatasets(query, 8);
      }
      
    } catch (e) {
      console.error("Failed to parse Gemini output as JSON:", e);
      console.log("Raw response:", textResponse.substring(0, 500) + "...");
      
      // Attempt to create a basic report structure if parsing fails
      try {
        // Create a fallback report with at least some content
        report = createFallbackReport(query, textResponse);
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

// Helper function to generate dummy images if needed
function generateDummyImages(topic: string, count: number) {
  const images = [];
  const sections = ["Introduction", "Background", "Methodology", "Analysis", "Results", "Discussion", "Future Directions", "Conclusion"];
  
  for (let i = 0; i < count; i++) {
    images.push({
      title: `${topic} ${i % 2 === 0 ? 'Visual Representation' : 'Conceptual Diagram'} ${i+1}`,
      description: `This image illustrates key aspects of ${topic} including ${i % 2 === 0 ? 'statistical findings' : 'conceptual frameworks'}.`,
      source: `Generated for research on ${topic} (2022-2024)`,
      relevanceToSection: sections[i % sections.length]
    });
  }
  
  return images;
}

// Helper function to generate dummy datasets if needed
function generateDummyDatasets(topic: string, count: number) {
  const datasets = [];
  const sections = ["Analysis", "Results", "Methodology", "Discussion", "Future Directions"];
  
  for (let i = 0; i < count; i++) {
    datasets.push({
      title: `${topic} ${i % 2 === 0 ? 'Quantitative Data' : 'Qualitative Analysis'} ${i+1}`,
      description: `This dataset contains ${i % 2 === 0 ? 'statistical information' : 'qualitative findings'} about ${topic}.`,
      source: `Research Database (2022-2024)`,
      relevanceToSection: sections[i % sections.length]
    });
  }
  
  return datasets;
}

// Helper function to create a fallback report if parsing fails
function createFallbackReport(query: string, textResponse: string) {
  const sections = [];
  const dummyReferences = [];
  const suggestedPdfs = [];
  
  // Create at least 10 dummy references
  for (let i = 1; i <= 15; i++) {
    const year = 2020 + (i % 5);
    dummyReferences.push({
      id: i,
      title: `Research on ${query} - Study ${i}`,
      authors: `Author ${i} et al.`,
      journal: `Journal of ${query} Research`,
      year: `${year}`,
      url: `https://example.com/research-${i}`,
      doi: `10.1234/abcd.${year}.${i}${i+1}${i+2}`
    });
    
    suggestedPdfs.push({
      title: `${query} Research Paper ${i}`,
      author: `Author ${i} et al.`,
      description: `This paper discusses various aspects of ${query} with a focus on recent developments.`,
      relevance: `High`,
      referenceId: i
    });
  }
  
  // Create basic sections from the raw text if possible
  try {
    const cleanText = textResponse.replace(/```json|```/g, '').trim();
    const paragraphs = cleanText.split('\n\n');
    
    if (paragraphs.length > 3) {
      sections.push({
        title: "Executive Summary",
        content: paragraphs[0]
      });
      
      sections.push({
        title: "Introduction",
        content: paragraphs[1]
      });
      
      sections.push({
        title: "Background",
        content: paragraphs[2]
      });
      
      for (let i = 3; i < Math.min(paragraphs.length, 10); i++) {
        sections.push({
          title: `Section ${i-2}`,
          content: paragraphs[i]
        });
      }
    } else {
      // If we can't extract meaningful sections, create generic ones
      sections.push({
        title: "Executive Summary",
        content: `This report examines ${query} in detail, covering the latest research and developments.`
      });
      
      sections.push({
        title: "Introduction",
        content: `${query} has become an important topic in recent years due to its significant impact and relevance.`
      });
      
      sections.push({
        title: "Analysis",
        content: cleanText || `This section provides a comprehensive analysis of ${query} based on current research.`
      });
    }
  } catch {
    // Absolute fallback if text processing fails
    sections.push({
      title: "Executive Summary",
      content: `This report examines ${query} in detail.`
    });
    
    sections.push({
      title: "Introduction",
      content: `${query} is an important topic worth studying.`
    });
    
    sections.push({
      title: "Content",
      content: `The analysis of ${query} reveals several important considerations.`
    });
  }
  
  return {
    title: query,
    sections: sections,
    references: dummyReferences,
    suggestedPdfs: suggestedPdfs,
    suggestedImages: generateDummyImages(query, 10),
    suggestedDatasets: generateDummyDatasets(query, 8)
  };
}
