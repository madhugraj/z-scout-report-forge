
import React, { useState } from 'react';
import CitationPopover from '../CitationPopover';
import { ReportSection, Reference } from '@/hooks/useGeminiReport';

interface ResearchContentProps {
  sections: ReportSection[];
  references: Reference[];
}

const ResearchContent: React.FC<ResearchContentProps> = ({ sections, references }) => {
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>, sectionIndex: number) => {
    e.preventDefault();
    setDropTargetIndex(null);
    try {
      const imageData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      // You would update the section content to include the image here
      // This would typically involve state updates or API calls
      console.log("Image dropped:", imageData, "to section:", sectionIndex);
    } catch (err) {
      console.error("Failed to process dropped image:", err);
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
          className={`mb-8 ${dropTargetIndex === index ? 'border-2 border-dashed border-violet-400 rounded-lg p-4' : ''}`}
          onDragOver={(e) => handleSectionDragOver(e, index)}
          onDragLeave={handleSectionDragLeave}
          onDrop={(e) => handleImageDrop(e, index)}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">{section.title}</h2>
          <div className="prose max-w-none">
            {section.content.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('<div class="my-4')) {
                return (
                  <div key={idx} dangerouslySetInnerHTML={{ __html: paragraph }} />
                );
              }
              
              const citationRegex = /\[(\d+)\]/g;
              const parts: (string | JSX.Element)[] = []; // Fix: Specify correct type for parts array
              let lastIndex = 0;
              let match;
              
              while ((match = citationRegex.exec(paragraph)) !== null) {
                parts.push(paragraph.substring(lastIndex, match.index));
                const citationNumber = parseInt(match[1]); // Fix: Ensure this is a number
                const reference = references.find(ref => ref.id === citationNumber) || 
                  { id: citationNumber, title: "Reference", authors: "Unknown", journal: "Unknown", year: "Unknown", url: "#" };
                
                parts.push(
                  <CitationPopover 
                    key={`${idx}-${citationNumber}`}
                    reference={{
                      id: reference.id.toString(),
                      title: reference.title,
                      authors: reference.authors,
                      publication: reference.journal,
                      year: reference.year,
                      doi: reference.url
                    }}
                    index={citationNumber - 1}
                    inline
                  />
                );
                lastIndex = match.index + match[0].length;
              }
              parts.push(paragraph.substring(lastIndex));
              return (
                <p key={idx} className="text-gray-700 mb-4">
                  {parts}
                </p>
              );
            })}
          </div>
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
