
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface Topic {
  title: string;
  query: string;
}

export interface PopularResearchTopicsProps {
  onSelectTopic: (query: string) => void;
}

const topics: Topic[] = [
  {
    title: "AI in Mental Health",
    query: "How is AI transforming mental health research and interventions? Provide an overview and significant trends.",
  },
  {
    title: "Climate Change",
    query: "Summarize the latest findings on climate change impact analysis, focusing on risk factors and adaptation.",
  },
  {
    title: "Quantum Computing",
    query: "Explain key applications and advancements in quantum computing and their industry adoption.",
  },
];

const PopularResearchTopics: React.FC<PopularResearchTopicsProps> = ({
  onSelectTopic,
}) => {
  return (
    <div className="pt-8">
      <h3 className="text-lg font-medium text-gray-300 mb-4">Popular Research Topics</h3>
      <div className="flex flex-wrap gap-3 justify-center">
        {topics.map((topic, idx) => (
          <Button
            key={topic.title}
            variant="outline"
            className="bg-white/5 border-gray-700 hover:border-violet-500 hover:bg-white/10"
            onClick={() => onSelectTopic(topic.query)}
          >
            <span>{topic.title}</span>
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PopularResearchTopics;
