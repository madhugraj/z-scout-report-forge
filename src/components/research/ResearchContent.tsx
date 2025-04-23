import React, { useState } from 'react';
import CitationPopover from '../CitationPopover';
import { ReportSection, Reference, SuggestedImage, SuggestedPdf } from '@/hooks/useGeminiReport';
import ImagePopover from '../ImagePopover';
import { toast } from '@/components/ui/sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, FileText, BarChart, Book, FileCheck, Database, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CitationRenderer from "./CitationRenderer";
import TopicStructureSection from "./TopicStructureSection";
import ReferencesSection from "./ReferencesSection";

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
              <li key={i}>
                <CitationRenderer text={item} references={references} />
              </li>
            ))}
          </ul>
        );
      }

      if (block.trim().match(/^\d+\.\s+/)) {
        const items = block.split(/[\n\r]+/).map(i => i.replace(/^\d+\.\s+/, ''));
        return (
          <ol key={idx} className="list-decimal pl-6 mb-4 text-gray-700">
            {items.map((item, i) => (
              <li key={i}>
                <CitationRenderer text={item} references={references} />
              </li>
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
                        <td key={ci} className="py-3 px-4 text-sm text-gray-700 border-b">
                          <CitationRenderer text={cell} references={references} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        } catch (e) {
          return <p key={idx} className="text-gray-700 mb-4">
            <CitationRenderer text={block} references={references} />
          </p>;
        }
      }

      return (
        <p key={idx} className="text-gray-700 mb-4">
          <CitationRenderer text={block} references={references} />
        </p>
      );
    });
  };

  const totalWords = sections.reduce((count, section) => {
    const wordCount = section.content?.split(/\s+/).length || 0;
    return count + wordCount;
  }, 0);
  
  const estimatedPages = Math.max(1, Math.round(totalWords / 400)); // ~400 words per page
  const academicPages = Math.max(1, Math.round(totalWords / 250)); // ~250 words for academic format

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
              {sections.length} sections • {references.length} references • ~{totalWords.toLocaleString()} words • ~{estimatedPages} pages (standard) / ~{academicPages} pages (academic)
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
          
          {suggestedPdfs && suggestedPdfs.length > 0 && (
            <button 
              onClick={() => setShowPdfs(!showPdfs)}
              className="flex items-center gap-1 text-violet-600 hover:text-violet-700 text-xs font-medium bg-violet-100 px-2 py-1 rounded-md"
            >
              <Book size={14} />
              {showPdfs ? "Hide" : "Show"} PDF Resources
            </button>
          )}
        </div>
      </div>

      {intermediateResults?.retryStats && (
        <div className="mb-6 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
          <div className="flex items-center gap-2">
            <FileCheck className="text-emerald-600" size={16} />
            <h3 className="text-sm font-medium text-emerald-700">Enhanced Report Generated</h3>
          </div>
          <p className="text-xs text-emerald-600 mt-1">
            The initial report was enhanced through a retry process that improved content by {intermediateResults.retryStats.contentImprovement} and 
            references by {intermediateResults.retryStats.refImprovement}. The final report contains {intermediateResults.retryStats.retrySections} sections 
            instead of the initial {intermediateResults.retryStats.originalSections}.
          </p>
        </div>
      )}

      {showTopicStructure && intermediateResults?.topicStructure && (
        <TopicStructureSection structure={intermediateResults.topicStructure} onClose={() => setShowTopicStructure(false)} />
      )}

      {showPdfs && suggestedPdfs && suggestedPdfs.length > 0 && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-blue-700 flex items-center gap-2">
              <Database size={16} />
              Recommended Research Resources
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedPdfs.slice(0, 8).map((pdf, index) => (
              <div key={index} className="bg-white p-3 rounded border border-blue-200 flex flex-col">
                <h4 className="text-sm font-medium text-blue-700 mb-1">{pdf.title}</h4>
                <p className="text-xs text-gray-600 mb-1">By {pdf.author || "Various Authors"}</p>
                <p className="text-xs text-gray-500 mb-2 flex-grow">{pdf.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-violet-600">{pdf.relevance}</span>
                  {pdf.url && (
                    <a 
                      href={pdf.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Link size={12} /> View Source
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          {suggestedPdfs.length > 8 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => setShowPdfs(false)}
            >
              Show fewer resources
            </Button>
          )}
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
