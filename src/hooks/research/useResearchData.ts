
import { useState } from 'react';

interface ResearchQuestion {
  mainQuestion: string;
  subQuestions?: string[];
  researchContext?: string;
}

interface ResearchSource {
  title: string;
  authors: string;
  year: string;
  description: string;
  relevance: string;
}

interface ResearchScope {
  scope: string[];
  limitations?: string[];
  timeframe?: string;
}

interface ReportStructure {
  abstract: string;
  mainTopic: string;
  subtopics: string[];
  reportStructure?: {
    title: string;
    sections: {
      title: string;
      subsections: string[];
    }[];
  };
}

export interface ResearchChatData {
  researchQuestion?: ResearchQuestion;
  recommendedSources?: ResearchSource[];
  researchScope?: ResearchScope;
  reportStructure?: ReportStructure;
}

export function useResearchData() {
  const [researchData, setResearchData] = useState<ResearchChatData>({});
  const [currentPhase, setCurrentPhase] = useState<'initial' | 'sources' | 'scope' | 'report'>('initial');
  const [readyForReport, setReadyForReport] = useState(false);
  
  return {
    researchData,
    setResearchData,
    currentPhase,
    setCurrentPhase,
    readyForReport,
    setReadyForReport
  };
}
