
export interface Reference {
  id: number;
  title: string;
  authors: string;
  journal: string;
  year: string;
  url: string;
  doi?: string;
}

export interface SuggestedPdf {
  title: string;
  author: string;
  description: string;
  relevance: string;
  referenceId?: number;
  url?: string;
}

export interface SuggestedImage {
  title: string;
  description: string;
  source: string;
  relevanceToSection: string;
  url?: string;
}

export interface SuggestedDataset {
  title: string;
  description: string;
  source: string;
  relevanceToSection: string;
  url?: string;
}

export interface ReportSection {
  title: string;
  content: string;
}

export interface GeminiReport {
  title: string;
  sections: ReportSection[];
  references: Reference[];
  suggestedPdfs: SuggestedPdf[];
  suggestedImages: SuggestedImage[];
  suggestedDatasets: SuggestedDataset[];
  intermediateResults?: {
    abstract?: string;
    mainTopic?: string;
    subtopics?: string[];
    topicStructure?: {
      mainTopic: string;
      topics: Array<{
        title: string;
        subtopics: string[];
      }>;
    };
    researchSample?: string;
  };
}
