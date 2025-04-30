
import React from 'react';

interface SuggestedPromptsProps {
  initialQuery: string;
}

export function useSuggestedPrompts(initialQuery: string): string[] {
  // Generate dynamically relevant suggested prompts based on initialQuery
  if (!initialQuery) {
    return [
      "I need help researching a topic for my academic paper",
      "Can you help me find sources for my research?",
      "I'd like to explore the latest developments in my field"
    ];
  }
  
  const query = initialQuery.toLowerCase();
  const topicKeywords = [
    { keywords: ["climate", "environment", "warming", "carbon"], topic: "climate change" },
    { keywords: ["ai", "artificial", "intelligence", "machine", "learning"], topic: "artificial intelligence" },
    { keywords: ["health", "medical", "medicine", "disease"], topic: "healthcare" },
    { keywords: ["education", "learning", "school", "teaching"], topic: "education" },
    { keywords: ["tech", "technology", "digital"], topic: "technology" }
  ];
  
  // Find matching topic or use generic research-focused prompts
  const matchedTopic = topicKeywords.find(item => 
    item.keywords.some(keyword => query.includes(keyword))
  );
  
  const topic = matchedTopic ? matchedTopic.topic : "this topic";
  
  return [
    `What are the key research questions I should explore about ${topic}?`,
    `Can you recommend the most recent academic sources on ${topic}?`,
    `What methodology would be best for researching ${topic}?`
  ];
}

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ initialQuery }) => {
  const prompts = useSuggestedPrompts(initialQuery);
  
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {prompts.map((prompt, index) => (
        <button
          key={`prompt-${index}`}
          className="px-3 py-1 text-xs bg-gray-800 text-gray-300 rounded-full hover:bg-gray-700"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
};

export default SuggestedPrompts;
