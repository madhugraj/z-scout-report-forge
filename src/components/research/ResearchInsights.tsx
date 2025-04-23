
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

interface ResearchInsightsProps {
  totalWords: number;
  sections: { title: string; content: string }[];
  intermediateResults?: {
    abstract?: string;
    mainTopic?: string;
    subtopics?: string[];
    researchData?: string[];
    retryStats?: {
      originalSize: number;
      originalRefs: number;
      originalSections: number;
      retrySize: number;
      retryRefs: number;
      retrySections: number;
      contentImprovement: string;
      refImprovement: string;
    };
  };
}

const ResearchInsights: React.FC<ResearchInsightsProps> = ({ 
  totalWords, 
  sections,
  intermediateResults 
}) => {
  const estimatedPages = Math.max(1, Math.round(totalWords / 400));
  const academicPages = Math.max(1, Math.round(totalWords / 250));

  return (
    <>
      <div className="mb-6 bg-violet-50 p-4 rounded-lg border border-violet-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <InfoIcon className="text-violet-600" size={20} />
          <div>
            <h3 className="text-sm font-medium text-violet-700">Comprehensive Research Report</h3>
            <p className="text-xs text-violet-600">
              {sections.length} sections • ~{totalWords.toLocaleString()} words • ~{estimatedPages} pages (standard) / ~{academicPages} pages (academic)
            </p>
          </div>
        </div>
      </div>

      {intermediateResults?.retryStats && (
        <div className="mb-6 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
          <div className="flex items-center gap-2">
            <InfoIcon className="text-emerald-600" size={16} />
            <h3 className="text-sm font-medium text-emerald-700">Enhanced Report Generated</h3>
          </div>
          <p className="text-xs text-emerald-600 mt-1">
            The initial report was enhanced through a retry process that improved content by {intermediateResults.retryStats.contentImprovement} and 
            references by {intermediateResults.retryStats.refImprovement}. The final report contains {intermediateResults.retryStats.retrySections} sections 
            instead of the initial {intermediateResults.retryStats.originalSections}.
          </p>
        </div>
      )}

      {sections.length > 0 && sections.length < 5 && (
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertTitle className="text-amber-800 flex items-center gap-2">
            <InfoIcon className="h-4 w-4" />
            Limited Report Content
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            The generated report appears to have limited coverage of the expected topics. This may be due to API limitations or model constraints. 
            To get more comprehensive results, try regenerating the report or modifying your query to be more specific.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default ResearchInsights;
