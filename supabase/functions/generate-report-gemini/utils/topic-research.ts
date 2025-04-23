// Research related functions
import { callGemini } from "./gemini-client.ts";

/**
 * Research a specific subtopic with search grounding
 */
export async function researchSubtopic(mainTopic: string, topicTitle: string, subtopic: string, depth = "comprehensive", includeCitations = true) {
  console.log(`Researching subtopic: "${subtopic}" under topic "${topicTitle}"`);
  
  const depthInstructions = depth === "maximum" ? 
    "Produce an EXTREMELY DETAILED, journal-quality research section of 3000-4000 words with extensive citations." :
    "Produce a comprehensive research section of at least 2000-2500 words with thorough citations.";
  
  const citationInstructions = includeCitations ?
    `
Include proper academic citations with the following guidelines:
- Use standard academic in-text citations in [Author, Year] format
- For direct quotes, include page numbers when available: [Author, Year, p. X]
- When citing multiple sources, separate them with semicolons: [Author, Year; Author2, Year2]
- When referencing specific data points or statistics, ALWAYS include the citation immediately after
- Ensure every factual claim, statistic, or specific research finding has a proper citation
- For major authors or seminal works in the field, mention author names directly in the text
` : "";

  const subtopicPrompt = `
You are an experienced academic researcher with expertise in "${mainTopic}" preparing a section for a prestigious peer-reviewed journal article on the specific subtopic: 
"${subtopic}" (which is part of the broader topic "${topicTitle}" within the main research area "${mainTopic}").

Use Google Search to find and analyze AT LEAST 15-20 high-quality, authoritative sources specifically on this subtopic, including:
- Recent peer-reviewed research papers (especially from the last 5 years)
- Meta-analyses and systematic reviews when available
- Official statistics, datasets, and government reports
- Expert analyses from authoritative organizations and research institutes
- Historical development and foundational research on this subtopic
- Real-world case studies and applications with measurable outcomes

For each source you find, extract and incorporate:
1. Key findings with specific numerical data (percentages, metrics, statistical significance)
2. Precise methodologies including sample sizes, time periods, and geographic scope
3. Author credentials, institutional affiliations, and funding sources when relevant
4. Direct quotes that provide unique expert insight (with proper citation)
5. Critical limitations acknowledged in the research
6. Contradictory or competing findings across different studies

${depthInstructions} Your section MUST include:
- A nuanced introduction to this specific subtopic with its scholarly context
- Detailed analysis with primary source quotes and paraphrasing
- NUMEROUS SPECIFIC STATISTICS AND DATA POINTS (with actual numbers, not just general trends)
- At least 3-4 tables, lists or structured presentations of key findings
- Critical evaluation of the current research landscape on this subtopic
- Identification of research gaps or methodological issues
- Future research directions

${citationInstructions}

This is for a DETAILED academic research report, so your analysis must be substantive, evidence-based, and extraordinarily detailed. 
Do not summarize or provide a general overview - this needs to be EXHAUSTIVE scholarly research with actual statistics, numbers, and quantitative data.
Include SPECIFIC URLS to key research papers, reports, and datasets mentioned.`;

  try {
    // CRITICAL: Always enable search for subtopic research
    const research = await callGemini(subtopicPrompt, true, depth === "maximum" ? 20000 : 16000);
    console.log(`Successfully researched subtopic "${subtopic}": ${research.length} chars`);
    return research;
  } catch (error) {
    console.error(`Error researching subtopic "${subtopic}":`, error);
    return `**Research Error**: Could not retrieve research for "${subtopic}" due to an error.`;
  }
}

/**
 * Get a balanced selection of subtopics to research
 */
export function getBalancedSubtopics(topic: any, maxSubtopicsPerTopic: number, includeAllSubtopics: boolean, forceDepth: boolean, improveResearchDepth: boolean) {
  // If we want to include all subtopics or are forcing depth, take as many as possible
  if (includeAllSubtopics || forceDepth || improveResearchDepth) {
    return topic.subtopics.slice(0, maxSubtopicsPerTopic);
  }
  
  // Otherwise, take a strategic sample from beginning, middle, and end
  const subtopics = [];
  const len = topic.subtopics.length;
  
  // Always take the first subtopic
  subtopics.push(topic.subtopics[0]);
  
  // Add 1-2 from beginning section
  if (len >= 5) {
    subtopics.push(topic.subtopics[1]);
    if (len >= 9) subtopics.push(topic.subtopics[2]);
  }
  
  // Add middle subtopics
  if (len >= 3) {
    const mid = Math.floor(len / 2);
    subtopics.push(topic.subtopics[mid]);
    if (len >= 7) {
      subtopics.push(topic.subtopics[mid-1]);
      if (len >= 11) subtopics.push(topic.subtopics[mid+1]);
    }
  }
  
  // Add subtopics from latter part
  if (len >= 4) {
    subtopics.push(topic.subtopics[len-2]);
    subtopics.push(topic.subtopics[len-1]); // Always include last
    if (len >= 8) subtopics.push(topic.subtopics[len-3]);
  }
  
  // Remove duplicates
  return [...new Set(subtopics)];
}
