
import React from 'react';
import { Reference } from '@/hooks/useGeminiReport';
import CitationRenderer from "./CitationRenderer";

interface SectionContentRendererProps {
  content: string;
  references: Reference[];
}

const SectionContentRenderer: React.FC<SectionContentRendererProps> = ({ content, references }) => {
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

  return (
    <div className="prose max-w-none">
      {typeof content === 'string' && formatSectionContent(content)}
    </div>
  );
};

export default SectionContentRenderer;
