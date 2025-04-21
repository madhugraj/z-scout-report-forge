
import React from 'react';
import CitationPopover from '../CitationPopover';
import { mockReferences } from '@/data/mockData';

interface CitationsContentProps {
  topicCitationList: typeof mockReferences;
}

const CitationsContent: React.FC<CitationsContentProps> = ({ topicCitationList }) => {
  return (
    <div className="flex flex-col h-full bg-[#1A1F2C] text-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Citations</h3>
      </div>
      <div className="space-y-3">
        {topicCitationList.map((reference, index) => (
          <CitationPopover 
            key={index}
            reference={reference}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default CitationsContent;
