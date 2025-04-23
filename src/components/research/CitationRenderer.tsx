
import React from "react";
import CitationPopover from "../CitationPopover";
import { Reference } from "@/hooks/useGeminiReport";

interface CitationRendererProps {
  text: string;
  references: Reference[];
}

/**
 * Handles Markdown-style citation processing and renders with CitationPopover.
 * Used for both section content and table cells.
 */
const CitationRenderer: React.FC<CitationRendererProps> = ({ text, references }) => {
  // Same citation matching as before, exported for reuse.
  const citationRegexes = [
    { regex: /\[(\d+)\]/g, type: 'numeric' },
    { regex: /\[([\w\s]+),?\s+(\d{4})\]/g, type: 'author-year-bracket' },
    { regex: /\(([\w\s]+)(?:\set\sal\.?)?,?\s+(\d{4})\)/g, type: 'author-year-paren' }
  ];

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const allMatches: {index: number; length: number; reference: Reference; type: string}[] = [];

  citationRegexes.forEach(({ regex, type }) => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      let reference: Reference | undefined;
      if (type === 'numeric') {
        const citationNumber = parseInt(match[1], 10);
        reference = references.find(ref => ref.id === citationNumber);
      } else {
        const authorName = match[1];
        const year = match[2];
        reference = references.find(ref =>
          ref.authors.toLowerCase().includes(authorName.toLowerCase()) &&
          ref.year.toString() === year
        );
      }
      if (reference) {
        allMatches.push({
          index: match.index,
          length: match[0].length,
          reference,
          type
        });
      }
    }
  });

  allMatches.sort((a, b) => a.index - b.index);

  for (const match of allMatches) {
    if (lastIndex < match.index) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <CitationPopover
        key={`citation-${match.index}`}
        reference={match.reference}
        index={match.reference.id - 1}
        inline={true}
      />
    );
    lastIndex = match.index + match.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
};

export default CitationRenderer;
