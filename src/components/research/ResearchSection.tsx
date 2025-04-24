
import React from 'react';
import { SuggestedImage } from '@/hooks/useGeminiReport';
import ImagePopover from '../ImagePopover';
import SectionContentRenderer from './SectionContentRenderer';
import { AlertCircleIcon, InfoIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from '@/components/ui/sonner';

interface ResearchSectionProps {
  title: string;
  content: string;
  references: any[];
  sectionImages: SuggestedImage[];
  isDropTarget: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

const ResearchSection: React.FC<ResearchSectionProps> = ({
  title,
  content,
  references,
  sectionImages,
  isDropTarget,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  // Check if this is an error section
  const isErrorSection = title.includes('Error') && content.includes('error');
  
  // Check if this is specifically a Gemini API error
  const isGeminiApiError = isErrorSection && 
    (content.toLowerCase().includes('gemini api') || 
     content.toLowerCase().includes('api key'));

  // Function to copy troubleshooting tips to clipboard
  const copyTroubleshootingTips = () => {
    navigator.clipboard.writeText(`
Gemini API Troubleshooting:
1. Verify your Gemini API key is valid and has sufficient quota
2. Check that the API key has access to the Gemini 1.5 Pro model
3. Make sure the API key is correctly set in Supabase Edge Function Secrets
4. Check the Edge Function logs for detailed error information
5. Try a different or shorter research query
    `);
    
    toast.success("Troubleshooting tips copied to clipboard");
  };
  
  return (
    <div
      className={`mb-8 ${isDropTarget ? 'border-2 border-dashed border-violet-400 bg-violet-50/20 rounded-lg p-4' : ''} ${isErrorSection ? 'border border-red-200 bg-red-50/20 rounded-lg p-4' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <h2 className={`text-2xl font-semibold ${isErrorSection ? 'text-red-700 flex items-center gap-2' : 'text-gray-800'} mb-4`}>
        {isErrorSection && <AlertCircleIcon className="h-6 w-6" />}
        {title}
      </h2>
      
      <SectionContentRenderer content={content} references={references} />
      
      {isGeminiApiError && (
        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-2 text-blue-700">
            <InfoIcon className="h-5 w-5" />
            <h3 className="font-medium">Gemini API Troubleshooting</h3>
          </div>
          <p className="text-sm text-blue-600 mb-4">
            To resolve this error, check your Edge Function logs and verify your Gemini API key configuration.
            The most common issues are related to API key validity, permissions, or quota limits for the gemini-1.5-pro-002 model.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
              onClick={copyTroubleshootingTips}
            >
              Copy Troubleshooting Tips
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-200"
              onClick={() => window.open("https://ai.google.dev/tutorials/setup", "_blank")}
            >
              Gemini API Documentation
            </Button>
          </div>
        </div>
      )}
      
      {sectionImages && sectionImages.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sectionImages.map((image, imageIdx) => (
            <ImagePopover
              key={`${imageIdx}`}
              image={{
                src: image.source,
                caption: image.title,
                source: image.source,
                description: image.description
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResearchSection;
