
import { ResearchChatData } from './useResearchData';

type SetResearchDataFunction = (prev: ResearchChatData) => ResearchChatData;

export const processFunctionResults = (
  functionName: string, 
  results: any,
  setResearchData: (fn: SetResearchDataFunction) => void,
  setCurrentPhase: (phase: 'initial' | 'sources' | 'scope' | 'report') => void,
  setReadyForReport: (ready: boolean) => void
) => {
  switch (functionName) {
    case 'researchQuestion':
      setResearchData(prev => ({ 
        ...prev, 
        researchQuestion: results 
      }));
      setCurrentPhase('sources');
      break;
    
    case 'suggestSources':
      setResearchData(prev => ({ 
        ...prev, 
        recommendedSources: results.recommendedSources 
      }));
      setCurrentPhase('scope');
      break;
    
    case 'defineResearchScope':
      setResearchData(prev => ({ 
        ...prev, 
        researchScope: results 
      }));
      setReadyForReport(true);
      setCurrentPhase('report');
      break;
      
    case 'generateReportStructure':
      setResearchData(prev => ({ 
        ...prev, 
        reportStructure: results 
      }));
      break;
      
    default:
      console.log("Unknown function result:", functionName, results);
  }
};
