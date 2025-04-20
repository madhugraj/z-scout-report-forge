
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Edit, Eye, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        context: "\"...the revolutionary impact of AI in medicine has transformed healthcare delivery across all sectors...\"",
        suggestions: [
          "significant impact",
          "measurable impact",
          "documented impact",
          "substantial impact"
        ]
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
      "View Tree": {
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
      "View Log": {
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
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState(false);

  const handleApplyChange = () => {
    if (!selectedSuggestion) return;
    setIsApplied(true);
    // In a real app, this would update the actual content
    setTimeout(() => {
      // Simulate success and close dialog
      onClose();
    }, 1500);
  };

  const resetState = () => {
    setSelectedSuggestion(null);
    setIsApplied(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetState();
        onClose();
      }
    }}>
      <DialogContent className="bg-[#2A2F3C] text-white border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white flex items-center">
            {moduleId === "bias-detection" && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mr-2">Warning</Badge>}
            {moduleId === "factual-consistency" && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 mr-2">Failed</Badge>}
            {moduleId === "citation-integrity" && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mr-2">Passed</Badge>}
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
            <div className="bg-gray-800/50 p-3 rounded-md text-gray-300 relative">
              <p className="text-sm text-gray-400 mb-2">Context:</p>
              <p className="font-mono text-sm">{content.context}</p>
            </div>
          )}
          
          {content.suggestions && (
            <div className="space-y-2">
              <Tabs defaultValue="suggestions">
                <TabsList className="bg-gray-800/50 mb-2">
                  <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                  <TabsTrigger value="preview">Preview Changes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="suggestions" className="mt-0">
                  <div className="space-y-2">
                    {content.suggestions.map((suggestion, index) => (
                      <Button 
                        key={index}
                        variant={selectedSuggestion === suggestion ? "default" : "secondary"}
                        className={`w-full text-left justify-start ${selectedSuggestion === suggestion ? 'border-violet-500' : ''}`}
                        onClick={() => setSelectedSuggestion(suggestion)}
                      >
                        {selectedSuggestion === suggestion && (
                          <CheckCircle className="h-4 w-4 mr-2 text-white" />
                        )}
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="preview" className="mt-0">
                  <div className="bg-gray-800/50 p-3 rounded-md text-gray-300">
                    <p className="text-sm text-gray-400 mb-2">Preview with changes:</p>
                    <p className="font-mono text-sm">
                      {moduleId === "bias-detection" && (
                        <>...the {selectedSuggestion || "___________"} of AI in medicine has transformed healthcare delivery across all sectors...</>
                      )}
                      {moduleId === "hallucination-detection" && (
                        <>AI solutions have reduced patient anxiety levels by 70% in clinical trials... <span className="text-amber-400">[Citation: {selectedSuggestion ? selectedSuggestion.split(' - ')[0] : "Required"}]</span></>
                      )}
                      {moduleId === "tone-detection" && (
                        <>{selectedSuggestion || "This undoubtedly proves that AI is the future of healthcare"}</>
                      )}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit Manually
            </Button>
          </div>
          
          <Button 
            disabled={!selectedSuggestion || isApplied} 
            onClick={handleApplyChange}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isApplied ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Applied
              </>
            ) : (
              'Accept Revision'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleActionDialog;
