
import React, { useState } from 'react';
import CitationPopover from '../CitationPopover';
import { ReportSection, Reference, SuggestedImage } from '@/hooks/useGeminiReport';
import ImagePopover from '../ImagePopover';
import { toast } from '@/components/ui/sonner';

interface ResearchContentProps {
  sections: ReportSection[];
  references: Reference[];
}

const ResearchContent: React.FC<ResearchContentProps> = ({ sections, references }) => {
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [sectionImages, setSectionImages] = useState<{[key: number]: SuggestedImage[]}>({});

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>, sectionIndex: number) => {
    e.preventDefault();
    setDropTargetIndex(null);
    try {
      const imageData = JSON.parse(e.dataTransfer.getData('application/json'));
      console.log("Image dropped:", imageData, "to section:", sectionIndex);
      
      // Update state to include the image in this section
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

  const handleSectionDragOver = (e: React.DragEvent<HTMLDivElement>, sectionIndex: number) => {
    e.preventDefault();
    setDropTargetIndex(sectionIndex);
  };

  const handleSectionDragLeave = () => {
    setDropTargetIndex(null);
  };

  return (
    <div className="research-content">
      {sections.map((section, index) => (
        <div
          key={index}
          className={`mb-8 ${dropTargetIndex === index ? 'border-2 border-dashed border-violet-400 bg-violet-50/20 rounded-lg p-4' : ''}`}
          onDragOver={(e) => handleSectionDragOver(e, index)}
          onDragLeave={handleSectionDragLeave}
          onDrop={(e) => handleImageDrop(e, index)}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">{section.title}</h2>
          
          <div className="prose max-w-none">
            {typeof section.content === 'string' && section.content.split('\n\n').map((paragraph: string, idx: number) => {
              if (paragraph.startsWith('<div class="my-4')) {
                return (
                  <div key={idx} dangerouslySetInnerHTML={{ __html: paragraph }} />
                );
              }

              // Citation regex matches [digit]
              const citationRegex = /\[(\d+)\]/g;
              const parts: React.ReactNode[] = [];
              let lastIndex = 0;
              let match: RegExpExecArray | null;

              while ((match = citationRegex.exec(paragraph)) !== null) {
                parts.push(<React.Fragment key={`text-${match.index}`}>{paragraph.substring(lastIndex, match.index)}</React.Fragment>);
                
                const citationNumber = parseInt(match[1], 10);
                // Find reference by ID or use a fallback
                const reference = references.find(ref => ref.id === citationNumber) || {
                  title: "Reference",
                  authors: "Unknown",
                  journal: "Unknown",
                  year: "Unknown",
                  url: "",
                  doi: "" // Added the doi property to the fallback object
                };

                parts.push(
                  <CitationPopover
                    key={`citation-${idx}-${citationNumber}`}
                    reference={{
                      id: citationNumber,
                      title: reference.title,
                      authors: reference.authors,
                      year: reference.year,
                      journal: reference.journal,
                      url: reference.url,
                      doi: reference.doi
                    }}
                    index={citationNumber - 1} // Index for display purposes
                    inline={true}
                  />
                );
                lastIndex = match.index + match[0].length;
              }

              parts.push(<React.Fragment key={`text-end-${idx}`}>{paragraph.substring(lastIndex)}</React.Fragment>);
              
              return (
                <p key={idx} className="text-gray-700 mb-4">
                  {parts}
                </p>
              );
            })}
          </div>
          
          {/* Display images dropped into this section */}
          {sectionImages[index] && sectionImages[index].length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sectionImages[index].map((image, imageIdx) => (
                <ImagePopover
                  key={`${index}-${imageIdx}`}
                  image={{
                    src: image.title.includes('AI') 
                      ? 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b' 
                      : image.title.includes('Data') 
                        ? 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5'
                        : 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
                    caption: image.title,
                    source: image.source,
                    description: image.description
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {references.length > 0 && (
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">References</h2>
          <div className="space-y-4">
            {references.map((reference, index) => (
              <div key={index} className="text-gray-700">
                <p className="text-sm">
                  [{reference.id}] {reference.authors} ({reference.year}). <strong>{reference.title}</strong>. <em>{reference.journal}</em>.
                  {reference.url && (
                    <span> <a href={reference.url} className="text-violet-600 hover:underline" target="_blank" rel="noopener noreferrer">Link</a></span>
                  )}
                  {reference.doi && !reference.url && (
                    <span> <a href={`https://doi.org/${reference.doi}`} className="text-violet-600 hover:underline" target="_blank" rel="noopener noreferrer">DOI: {reference.doi}</a></span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchContent;
