
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

  // Format section content with proper HTML and markdown handling
  const formatSectionContent = (content: string) => {
    // Handle potential JSON content
    if ((content.trim().startsWith('{') || content.trim().startsWith('[')) && 
        (content.trim().endsWith('}') || content.trim().endsWith(']'))) {
      try {
        const parsed = JSON.parse(content);
        return JSON.stringify(parsed, null, 2);
      } catch (e) {
        // If it's not valid JSON, continue with normal formatting
      }
    }
    
    // Process markdown-like formats
    const formattedContent = content
      .replace(/#{3}\s+(.*?)(?=\n|$)/g, '<h3 class="text-xl font-semibold text-gray-800 mt-5 mb-3">$1</h3>')
      .replace(/#{2}\s+(.*?)(?=\n|$)/g, '<h2 class="text-2xl font-semibold text-gray-800 mt-6 mb-3">$1</h2>')
      .replace(/#{1}\s+(.*?)(?=\n|$)/g, '<h1 class="text-3xl font-bold text-gray-800 mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-100 rounded text-gray-800">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-violet-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Split by paragraphs and handle each one
    return formattedContent.split('\n\n').map((paragraph: string, idx: number) => {
      // If paragraph has HTML, render it directly
      if (paragraph.startsWith('<h') || paragraph.startsWith('<div') || paragraph.includes('<table')) {
        return (
          <div key={idx} dangerouslySetInnerHTML={{ __html: paragraph }} />
        );
      }

      // Handle bullet points and numbered lists
      if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
        const listItems = paragraph.split(/[\r\n]+/).map(item => 
          item.trim().replace(/^[-*]\s+/, '')
        );
        return (
          <ul key={idx} className="list-disc pl-6 mb-4 text-gray-700">
            {listItems.map((item, i) => (
              <li key={i} className="mb-1">{processCitations(item, references)}</li>
            ))}
          </ul>
        );
      }

      if (paragraph.trim().match(/^\d+\.\s+/)) {
        const listItems = paragraph.split(/[\r\n]+/).map(item => 
          item.trim().replace(/^\d+\.\s+/, '')
        );
        return (
          <ol key={idx} className="list-decimal pl-6 mb-4 text-gray-700">
            {listItems.map((item, i) => (
              <li key={i} className="mb-1">{processCitations(item, references)}</li>
            ))}
          </ol>
        );
      }

      // Handle tables
      if (paragraph.includes('|') && paragraph.includes('\n') && paragraph.split('\n').every(line => line.includes('|'))) {
        try {
          const tableRows = paragraph.trim().split('\n');
          const headers = tableRows[0].split('|').map(col => col.trim()).filter(Boolean);
          
          let startIndex = 1;
          // Skip separator row if it exists (contains --- or ===)
          if (tableRows[1] && (tableRows[1].includes('---') || tableRows[1].includes('==='))) {
            startIndex = 2;
          }
          
          const rows = tableRows.slice(startIndex).map(row => 
            row.split('|').map(col => col.trim()).filter(Boolean)
          );
          
          return (
            <div key={idx} className="overflow-x-auto mb-6">
              <table className="min-w-full border-collapse border border-gray-200 rounded-lg mb-4">
                <thead className="bg-gray-50">
                  <tr>
                    {headers.map((header, i) => (
                      <th key={i} className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="py-3 px-4 text-sm text-gray-700 border-b">
                          {processCitations(cell, references)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        } catch (e) {
          // If table parsing fails, render as normal paragraph
        }
      }
      
      // Regular paragraph with citation processing
      return (
        <p key={idx} className="text-gray-700 mb-4">
          {processCitations(paragraph, references)}
        </p>
      );
    });
  };

  // Process citations in text
  const processCitations = (text: string, references: Reference[]) => {
    // Citation regex matches [digit]
    const citationRegex = /\[(\d+)\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // Split text by citation references
    while ((match = citationRegex.exec(text)) !== null) {
      parts.push(<React.Fragment key={`text-${match.index}`}>{text.substring(lastIndex, match.index)}</React.Fragment>);
      
      const citationNumber = parseInt(match[1], 10);
      // Find reference by ID or use a fallback
      const reference = references.find(ref => ref.id === citationNumber) || {
        title: "Reference",
        authors: "Unknown",
        journal: "Unknown",
        year: "Unknown",
        url: "",
        doi: ""
      };

      parts.push(
        <CitationPopover
          key={`citation-${citationNumber}`}
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

    parts.push(<React.Fragment key={`text-end`}>{text.substring(lastIndex)}</React.Fragment>);
    return parts;
  };

  if (sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px] bg-gray-50 p-6 rounded-lg text-gray-500">
        <p>No report content available. Please generate a report first.</p>
      </div>
    );
  }

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
            {typeof section.content === 'string' && formatSectionContent(section.content)}
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
