
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, AlertCircleIcon, CheckCircle2Icon, ExternalLinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

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
  
  // Detect error state
  const isErrorReport = sections.length === 1 && sections[0].title.includes('Error');
  const hasContentError = sections.length < 5 || totalWords < 1000;
  
  // Check for specific error keywords
  const isApiKeyError = isErrorReport && (
    sections[0].content.toLowerCase().includes('api key') ||
    sections[0].content.toLowerCase().includes('gemini api')
  );
  
  // Function to copy troubleshooting tips to clipboard
  const copyTroubleshootingTips = () => {
    navigator.clipboard.writeText(`
Gemini API Troubleshooting Guide:

1. API Key Issues:
   - Verify your Gemini API key is valid and not expired
   - Check that your API key has sufficient quota
   - Ensure your API key has access to the Gemini 1.5 Flash model
   - Make sure the key is correctly set in Supabase Edge Function Secrets

2. Technical Issues:
   - Check Edge Function logs for detailed error information
   - Verify your Edge Function can access the internet
   - Check for any rate limiting or quota issues

3. Content Issues:
   - Try a different or shorter research query
   - Simplify complex queries into more focused topics
   - Try again later if the service is experiencing high load

For more help, visit the Google AI Studio documentation: https://ai.google.dev/tutorials/setup
    `);
    
    toast.success("Troubleshooting guide copied to clipboard", {
      description: "A detailed guide has been copied that you can reference to fix the issue."
    });
  };

  return (
    <>
      <div className="mb-6 bg-violet-50 p-4 rounded-lg border border-violet-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <InfoIcon className="text-violet-600" size={20} />
          <div>
            <h3 className="text-sm font-medium text-violet-700">
              {isErrorReport ? "Research Report Error" : "Comprehensive Research Report"}
            </h3>
            <p className="text-xs text-violet-600">
              {sections.length} sections • ~{totalWords.toLocaleString()} words • ~{estimatedPages} pages (standard) / ~{academicPages} pages (academic)
            </p>
          </div>
        </div>
      </div>

      {isErrorReport && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertCircleIcon className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Error Generating Report</AlertTitle>
          <AlertDescription className="text-red-700">
            There was an error with the Gemini API. Please check that your API key is correctly configured
            in the Supabase Edge Function Secrets and has access to the Gemini-1.5-Flash model.
            <br /><br />
            <strong>Possible solutions:</strong>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Verify your Gemini API key is valid and has sufficient quota</li>
              <li>Check that the API key has access to the Gemini 1.5 Flash model</li>
              <li>Try a different or shorter research query</li>
              <li>Check the Edge Function logs for detailed error information</li>
            </ul>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-white text-red-700 border-red-200 hover:bg-red-50"
                onClick={copyTroubleshootingTips}
              >
                Copy Troubleshooting Guide
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-white text-red-700 border-red-200 hover:bg-red-50"
                onClick={() => window.open("https://ai.google.dev/tutorials/setup", "_blank")}
              >
                <span>Gemini API Docs</span>
                <ExternalLinkIcon className="ml-1 h-3 w-3" />
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-white text-red-700 border-red-200 hover:bg-red-50"
                onClick={() => window.open("https://supabase.com/dashboard/project/jtdwgpqfratkepiwtmud/settings/functions", "_blank")}
              >
                <span>Edge Function Secrets</span>
                <ExternalLinkIcon className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

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

      {!isErrorReport && hasContentError && (
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertTitle className="text-amber-800 flex items-center gap-2">
            <InfoIcon className="h-4 w-4" />
            Limited Report Content
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            The generated report appears to have limited coverage of the expected topics. This may be due to API limitations or model constraints. 
            To get more comprehensive results, try regenerating the report or modifying your query to be more specific.
            <br /><br />
            <strong>Try these steps:</strong>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Make your query more specific and detailed</li>
              <li>Check that your Gemini API key has proper permissions</li>
              <li>Try generating the report again</li>
              <li>If problems persist, check the edge function logs</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {isApiKeyError && (
        <div className="mb-6 p-4 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-blue-800 text-sm font-medium flex items-center gap-2 mb-2">
            <CheckCircle2Icon className="h-4 w-4 text-blue-600" />
            Gemini API Key Configuration
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            The error suggests there might be an issue with your Gemini API key. Here's a quick guide to verify your setup:
          </p>
          <ol className="list-decimal ml-5 space-y-1 text-sm text-blue-700 mb-3">
            <li>Go to <a href="https://makersuite.google.com/app/apikeys" target="_blank" className="underline hover:text-blue-900">Google AI Studio</a> and create or view your API keys</li>
            <li>Copy your API key and ensure it has access to Gemini 1.5 Flash</li>
            <li>Add or update the GEMINI_API_KEY in your Supabase Edge Function Secrets</li>
            <li>Check your Edge Function logs for detailed error messages</li>
          </ol>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="secondary" 
              className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
              onClick={() => window.open("https://supabase.com/dashboard/project/jtdwgpqfratkepiwtmud/settings/functions", "_blank")}
            >
              <span>Check Edge Function Secrets</span>
              <ExternalLinkIcon className="ml-1 h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              className="bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
              onClick={() => window.open("https://makersuite.google.com/app/apikeys", "_blank")}
            >
              <span>Google AI Studio</span>
              <ExternalLinkIcon className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ResearchInsights;
