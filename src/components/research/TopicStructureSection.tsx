
import React from "react";
import { BarChart } from "lucide-react";

interface TopicStructure {
  mainTopic: string;
  topics: Array<{
    title: string;
    subtopics: string[];
  }>;
}

interface TopicStructureSectionProps {
  structure: TopicStructure;
  onClose: () => void;
}

const TopicStructureSection: React.FC<TopicStructureSectionProps> = ({ structure }) => (
  <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
    <h3 className="text-lg font-medium text-slate-700 mb-2 flex items-center gap-2">
      <BarChart size={18} className="text-violet-600" /> Complete Topic Structure
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {structure.topics.map((topic, index) => (
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
      <p>This structure shows the full scope with all topics and subtopics. The report should address all major topics and detailed analysis.</p>
    </div>
  </div>
);

export default TopicStructureSection;
