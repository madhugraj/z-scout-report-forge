
import React, { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { ReportSection, Reference, SuggestedImage, SuggestedPdf } from '@/hooks/useGeminiReport';
import ResearchInsights from './ResearchInsights';
import TopicStructureSection from './TopicStructureSection';
import ReferencesSection from './ReferencesSection';
import ResearchSection from './ResearchSection';

interface ResearchContentProps {
  sections: ReportSection[];
  references: Reference[];
  suggestedPdfs?: SuggestedPdf[];
  suggestedImages?: SuggestedImage[];
  intermediateResults?: {
    abstract?: string;
    mainTopic?: string;
    subtopics?: string[];
    researchData?: string[];
    topicStructure?: {
      mainTopic: string;
      topics: Array<{
        title: string;
        subtopics: string[];
      }>;
    };
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

const ResearchContent: React.FC<ResearchContentProps> = ({
  sections,
  references,
  suggestedPdfs,
  suggestedImages,
  intermediateResults
}) => {
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [sectionImages, setSectionImages] = useState<{[key: number]: SuggestedImage[]}>({});
  const [showRawData, setShowRawData] = useState(false);
  const [showTopicStructure, setShowTopicStructure] = useState(false);
  const [showReferences, setShowReferences] = useState(true);
  const [showPdfs, setShowPdfs] = useState(false);

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>, sectionIndex: number) => {
    e.preventDefault();
    setDropTargetIndex(null);
    try {
      const imageData = JSON.parse(e.dataTransfer.getData('application/json'));
      setSectionImages(prev => {
        const currentSectionImages = prev[sectionIndex] || [];
        return {
          ...prev,
          [sectionIndex]: [...currentSectionImages, {
            title: imageData.title,
            description: imageData.description || '',
            source: imageData.source,
            relevanceToSection: imageData.relevanceToSection || 'Related content'
          }]
        };
      });
      toast.success(`Added image "${imageData.title}" to section`);
    } catch (err) {
      console.error("Failed to process dropped image:", err);
      toast.error("Failed to add image to section");
    }
  };

  const totalWords = sections.reduce((count, section) => {
    return count + (section.content?.split(/\s+/).length || 0);
  }, 0);

  if (sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px] bg-gray-50 p-6 rounded-lg text-gray-500">
        <p>No report content available. Please generate a report first.</p>
      </div>
    );
  }

  return (
    <div className="research-content">
      <ResearchInsights
        totalWords={totalWords}
        sections={sections}
        intermediateResults={intermediateResults}
      />

      {showTopicStructure && intermediateResults?.topicStructure && (
        <TopicStructureSection 
          structure={intermediateResults.topicStructure} 
          onClose={() => setShowTopicStructure(false)} 
        />
      )}

      {sections.map((section, index) => (
        <ResearchSection
          key={index}
          title={section.title}
          content={section.content}
          references={references}
          sectionImages={sectionImages[index] || []}
          isDropTarget={dropTargetIndex === index}
          onDragOver={(e) => {
            e.preventDefault();
            setDropTargetIndex(index);
          }}
          onDragLeave={() => setDropTargetIndex(null)}
          onDrop={(e) => handleImageDrop(e, index)}
        />
      ))}

      {showReferences && references.length > 0 && (
        <ReferencesSection
          references={references}
          show={showReferences && references.length > 0}
          onToggle={() => setShowReferences(!showReferences)}
        />
      )}
    </div>
  );
};

export default ResearchContent;
