import React, { useState } from 'react';
import CitationPopover from '../CitationPopover';
import { ReportSection, Reference, SuggestedImage } from '@/hooks/useGeminiReport';
import ImagePopover from '../ImagePopover';
import { toast } from '@/components/ui/sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, FileText, BarChart } from 'lucide-react';

interface ResearchContentProps {
  sections: ReportSection[];
  references: Reference[];
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
  };
}

const ResearchContent: React.FC<ResearchContentProps> = ({ 
  sections, 
  references,
  intermediateResults 
}) => {
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [sectionImages, setSectionImages] = useState<{[key: number]: SuggestedImage[]}>({});
  const [showRawData, setShowRawData] = useState(false);
  const [showTopicStructure, setShowTopicStructure] = useState(false);

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

  const formatSectionContent = (content: string) => {
    let formattedContent = content;
    formattedContent = formattedContent
      .replace(/^#{3} (.*)$/gm, '<h3 class="text-xl font-semibold text-gray-800 mt-5 mb-3">$1</h3>')
      .replace(/^#{2} (.*)$/gm, '<h2 class="text-2xl font-semibold text-gray-800 mt-6 mb-3">$1</h2>')
      .replace(/^#{1} (.*)$/gm, '<h1 class="text-3xl font-bold text-gray-800 mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-100 rounded text-gray-800">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-violet-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

    const blocks = formattedContent.split(/\n{2,}/g);

    return blocks.map((block, idx) => {
      if (block.match(/^<h[1-3]/)) {
        return <div key={idx} dangerouslySetInnerHTML={{ __html: block }} />;
      }

      if (block.trim().startsWith('- ') || block.trim().startsWith('* ')) {
        const items = block.split(/[\n\r]+/).map(i => i.replace(/^[-*]\s+/, ''));
        return (
          <ul key={idx} className="list-disc pl-6 mb-4 text-gray-700">
            {items.map((item, i) => (
              <li key={i}>{processCitations(item, references)}</li>
            ))}
          </ul>
        );
      }

      if (block.trim().match(/^\d+\.\s+/)) {
        const items = block.split(/[\n\r]+/).map(i => i.replace(/^\d+\.\s+/, ''));
        return (
          <ol key={idx} className="list-decimal pl-6 mb-4 text-gray-700">
            {items.map((item, i) => (
              <li key={i}>{processCitations(item, references)}</li>
            ))}
          </ol>
        );
      }

      if (block.includes('|') && block.split('\n').length > 1 && block.indexOf('\n') !== -1) {
        try {
          const rows = block.split('\n').filter(Boolean);
          const headers = rows[0].split('|').map(s => s.trim()).filter(Boolean);
          let startIdx = 1;
          if (rows[1] && rows[1].includes('--')) startIdx = 2;
          const dataRows = rows.slice(startIdx).map(r => r.split('|').map(s => s.trim()).filter(Boolean));
          return (
            <div key={idx} className="overflow-x-auto mb-6">
              <table className="min-w-full border-collapse border border-gray-200 rounded-lg mb-4">
                <thead className="bg-gray-50">
                  <tr>{headers.map((h, i) => (
                    <th key={i} className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {dataRows.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="py-3 px-4 text-sm text-gray-700 border-b">{processCitations(cell, references)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        } catch (e) {
          return <p key={idx} className="text-gray-700 mb-4">{processCitations(block, references)}</p>;
        }
      }

      return (
        <p key={idx} className="text-gray-700 mb-4">{processCitations(block, references)}</p>
      );
    });
  };

  const processCitations = (text: string, references: Reference[]) => {
    const citationRegex = /\[(\d+)\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = citationRegex.exec(text)) !== null) {
      if (lastIndex < match.index) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      const citationNumber = parseInt(match[1], 10);
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
          key={`citation-${match.index}`}
          reference={{
            id: citationNumber,
            title: reference.title,
            authors: reference.authors,
            year: reference.year,
            journal: reference.journal,
            url: reference.url,
            doi: reference.doi
          }}
          index={citationNumber - 1}
          inline={true}
        />
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts;
  };

  const totalWords = sections.reduce((count, section) => {
    const wordCount = section.content?.split(/\s+/).length || 0;
    return count + wordCount;
  }, 0);
  
  const estimatedPages = Math.max(1, Math.round(totalWords / 400)); // ~400 words per page

  if (sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px] bg-gray-50 p-6 rounded-lg text-gray-500">
        <p>No report content available. Please generate a report first.</p>
      </div>
    );
  }

  return (
    <div className="research-content">
      <div className="mb-6 bg-violet-50 p-4 rounded-lg border border-violet-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="text-violet-600" size={20} />
          <div>
            <h3 className="text-sm font-medium text-violet-700">Comprehensive Research Report</h3>
            <p className="text-xs text-violet-600">
              {sections.length} sections • {references.length} references • ~{totalWords.toLocaleString()} words • ~{estimatedPages} pages
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowRawData(!showRawData)}
            className="flex items-center gap-1 text-violet-600 hover:text-violet-700 text-xs font-medium bg-violet-100 px-2 py-1 rounded-md"
          >
            <InfoIcon size={14} />
            {showRawData ? "Hide" : "Show"} Agent Data
          </button>
          
          {intermediateResults?.topicStructure && (
            <button 
              onClick={() => setShowTopicStructure(!showTopicStructure)}
              className="flex items-center gap-1 text-violet-600 hover:text-violet-700 text-xs font-medium bg-violet-100 px-2 py-1 rounded-md"
            >
              <BarChart size={14} />
              {showTopicStructure ? "Hide" : "Show"} Topic Structure
            </button>
          )}
        </div>
      </div>

      {showTopicStructure && intermediateResults?.topicStructure && (
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="text-lg font-medium text-slate-700 mb-2">Complete Topic Structure</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {intermediateResults.topicStructure.topics.map((topic, index) => (
              <div key={index} className="bg-white p-3 rounded border border-slate-200">
                <h4 className="text-sm font-medium text-violet-700 mb-2">{topic.title}</h4>
                <ul className="text-xs text-slate-600 list-disc pl-5 space-y-0.5">
                  {topic.subtopics.map((subtopic, i) => (
                    <li key={i}>{subtopic}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-slate-500">
            <p>This structure shows the full scope of the research report with all topics and subtopics to be covered. 
            The generated report should address all major topics and relevant subtopics with detailed analysis.</p>
          </div>
        </div>
      )}

      {showRawData && intermediateResults && (
        <div className="mb-6 space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="text-lg font-medium text-slate-700">Agent Outputs</h3>
          
          {intermediateResults.abstract && (
            <div className="bg-white p-3 rounded border border-slate-200">
              <h4 className="text-sm font-medium text-slate-700 mb-1">Abstract Generator</h4>
              <div className="text-sm text-slate-600 max-h-32 overflow-y-auto">
                {intermediateResults.abstract.split('\n').map((line, i) => (
                  <p key={i} className="mb-1">{line}</p>
                ))}
              </div>
            </div>
          )}
          
          {intermediateResults.mainTopic && intermediateResults.subtopics && (
            <div className="bg-white p-3 rounded border border-slate-200">
              <h4 className="text-sm font-medium text-slate-700 mb-1">Topic Extractor</h4>
              <div className="text-sm text-slate-600">
                <p className="font-medium">Main Topic:</p>
                <p className="mb-2">{intermediateResults.mainTopic}</p>
                <p className="font-medium">Subtopics:</p>
                <ul className="list-disc pl-5">
                  {intermediateResults.subtopics.map((topic, i) => (
                    <li key={i}>{topic}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {intermediateResults.researchData && intermediateResults.researchData.length > 0 && (
            <div className="bg-white p-3 rounded border border-slate-200">
              <h4 className="text-sm font-medium text-slate-700 mb-1">Research Agent ({intermediateResults.researchData.length} topics)</h4>
              <div className="text-xs text-slate-600 max-h-32 overflow-y-auto">
                <p className="italic">First research output excerpt:</p>
                {intermediateResults.researchData[0].substring(0, 150) + "..."}
              </div>
            </div>
          )}
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
          {sectionImages[index] && sectionImages[index].length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sectionImages[index].map((image, imageIdx) => (
                <ImagePopover
                  key={`${index}-${imageIdx}`}
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
