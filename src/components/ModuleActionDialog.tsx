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
      "Review": {
        title: "Biased Language Review",
        description: "Detected language that may introduce bias or personal opinion.",
        location: "Executive Summary, Paragraph 2",
        context: "\"...the revolutionary impact of AI in medicine has transformed healthcare delivery across all sectors...\""
      },
      "Accept Revision": {
        title: "Suggested Language Change",
        description: "Review and accept the proposed neutral alternative:",
        suggestions: [
          "significant impact",
          "measurable impact",
          "documented impact",
          "substantial impact"
        ],
        context: "Changes will be applied to Executive Summary, Paragraph 2"
      }
    },
    "hallucination-detection": {
      "Review": {
        title: "Unsupported Claim Analysis",
        description: "Statistical claim requires academic citation or data source.",
        location: "Results Section, Key Findings",
        context: "\"AI solutions have reduced patient anxiety levels by 70% in clinical trials...\""
      },
      "Add Citation": {
        title: "Available Citations",
        description: "Select a relevant peer-reviewed source to support this claim:",
        suggestions: [
          "Zhang et al. (2024) - 'AI-Assisted Therapy: Clinical Outcomes' - Reports 65% anxiety reduction",
          "Miller & Chen (2023) - 'Digital Mental Health Interventions' - Shows 72% improvement",
          "Park et al. (2024) - 'Meta-analysis: AI in Psychology' - Average 68% reduction"
        ],
        context: "Citation will be added to Results Section, Key Findings"
      }
    },
    "citation-integrity": {
      "View Citation Tree": {
        title: "Citation Network Analysis",
        description: "Review of citation interconnections and validity:",
        location: "Full Document",
        suggestions: [
          "17 Primary Sources - All Valid",
          "4 Cross-References - Verified",
          "3 Meta-Analyses - Current",
          "2 Conference Proceedings - Accessible"
        ],
        context: "All citations follow APA 7th Edition guidelines"
      }
    },
    "factual-consistency": {
      "Review": {
        title: "Timeline Inconsistency",
        description: "Detected date conflict in research timeline.",
        location: "Methods Section",
        context: "Study references 2019 dataset but claims implementation in 2021"
      },
      "Resolve Conflict": {
        title: "Timeline Resolution Options",
        description: "Select the correct timeline:",
        suggestions: [
          "Update to 2021 implementation with 2019 baseline data",
          "Clarify as retrospective analysis of 2019 data",
          "Add note about data collection period",
          "Split into two separate study phases"
        ]
      }
    },
    "sensitive-data": {
      "Review": {
        title: "PII Detection Alert",
        description: "Potentially identifiable information found:",
        location: "Case Studies Section",
        context: "Multiple references to specific healthcare provider and location"
      },
      "Mask Entity": {
        title: "Entity Masking Options",
        description: "Choose anonymization approach:",
        suggestions: [
          "Replace with 'A healthcare professional in South Asia'",
          "Use pseudonym 'Dr. S.J.'",
          "Reference as 'The attending physician'",
          "Use role-based reference only"
        ]
      }
    },
    "toxicity-check": {
      "Module Logs": {
        title: "Content Safety Analysis",
        description: "Complete toxicity scan results:",
        suggestions: [
          "Professional tone maintained throughout",
          "No discriminatory language detected",
          "Inclusive terminology verified",
          "Cultural sensitivity confirmed"
        ],
        context: "Full document scan completed in 3.2 seconds"
      }
    },
    "tone-detection": {
      "Review": {
        title: "Tone Analysis Results",
        description: "Identified potentially assertive language patterns",
        location: "Conclusion",
        context: "Current: \"This undoubtedly proves that AI is the future of healthcare\""
      },
      "Suggest Softer Tone": {
        title: "Tone Revision Suggestions",
        description: "Consider these more balanced alternatives:",
        suggestions: [
          "The evidence suggests that AI may play a significant role in healthcare's future",
          "These findings indicate potential benefits of AI in healthcare",
          "Research points to promising applications of AI in healthcare",
          "The data supports AI's potential contribution to healthcare"
        ]
      }
    },
    "external-source": {
      "Review": {
        title: "Source Credibility Check",
        description: "Domain authority assessment for cited sources",
        location: "References Section",
        context: "Non-academic source detected: healthhacks.xyz"
      },
      "Replace Source": {
        title: "Alternative Sources",
        description: "Verified academic alternatives:",
        suggestions: [
          "BMJ Digital Health (Impact Factor: 4.5)",
          "Nature Digital Medicine (Impact Factor: 11.653)",
          "JMIR Medical Informatics (Impact Factor: 3.2)",
          "Digital Health Journal (Peer-reviewed)"
        ]
      }
    }
  };

  return contentMap[moduleId]?.[actionType] || {
    title: "Action Details",
    description: "Processing action details...",
    context: "Please wait while we gather the necessary information."
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
