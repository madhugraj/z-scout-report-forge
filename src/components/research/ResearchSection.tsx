
import React from 'react';
import { SuggestedImage } from '@/hooks/useGeminiReport';
import ImagePopover from '../ImagePopover';
import SectionContentRenderer from './SectionContentRenderer';
import { AlertCircleIcon } from 'lucide-react';

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
