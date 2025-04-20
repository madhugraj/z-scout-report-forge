
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ActionContent {
  title: string;
  description: string;
  suggestions?: string[];
  context?: string;
  location?: string;
}

interface ModuleActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: string;
  moduleId: string;
}

const getActionContent = (moduleId: string, actionType: string): ActionContent => {
  const contentMap: Record<string, Record<string, ActionContent>> = {
    "bias-detection": {
      "View Phrase": {
        title: "Flagged Phrase Review",
        description: "The phrase \"revolutionary impact\" implies strong opinion.",
        location: "Executive Summary",
        context: "...the revolutionary impact of AI in medicine has transformed..."
      },
      "Edit Suggestion": {
        title: "Suggested Revisions",
        description: "Consider these neutral alternatives to avoid opinionated framing:",
        suggestions: [
          "significant impact",
          "notable impact",
          "measured impact",
          "documented impact"
        ]
      },
      "Accept Revision": {
        title: "Confirm Revision",
        description: "Replace \"revolutionary impact\" with \"significant impact\"?",
        context: "This will update the text in the Executive Summary section."
      }
    },
    "hallucination-detection": {
      "Review Insight": {
        title: "Missing Citation Review",
        description: "\"AI has reduced anxiety levels by 70%\" requires citation.",
        location: "Results Section",
        context: "Statistical claims must be supported by peer-reviewed sources."
      },
      "Add Citation": {
        title: "Add Citation",
        description: "Recent studies that might support this claim:",
        suggestions: [
          "Smith et al. (2024) - AI-Assisted Therapy Outcomes",
          "Chen & Patel (2023) - Digital Interventions in Mental Health",
          "Rodriguez-Kim (2024) - Meta-analysis of AI in Psychology"
        ]
      }
    },
    // ... Add more modules as needed
  };

  return contentMap[moduleId]?.[actionType] || {
    title: "Action Details",
    description: "Details not available for this action.",
  };
};

const ModuleActionDialog = ({ isOpen, onClose, actionType, moduleId }: ModuleActionDialogProps) => {
  const content = getActionContent(moduleId, actionType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#2A2F3C] text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">
            {content.title}
          </DialogTitle>
          {content.location && (
            <DialogDescription className="text-gray-400">
              Location: {content.location}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-gray-300">{content.description}</p>
          
          {content.context && (
            <div className="bg-gray-800/50 p-3 rounded-md text-gray-300">
              <p className="text-sm text-gray-400">Context:</p>
              <p className="mt-1">{content.context}</p>
            </div>
          )}
          
          {content.suggestions && (
            <div className="space-y-2">
              {content.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Button 
                    variant="secondary" 
                    className="w-full text-left justify-start"
                    onClick={() => {
                      console.log('Selected suggestion:', suggestion);
                      onClose();
                    }}
                  >
                    {suggestion}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleActionDialog;
