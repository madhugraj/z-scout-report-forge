
import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import CollaborationHeader from './CollaborationHeader';
import CollaboratorsList from './CollaboratorsList';
import MessageList from './MessageList';
import EditPanel from './EditPanel';
import InviteDialog from './InviteDialog';
import ChatInput from './ChatInput';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useResearchChat } from '@/hooks/useResearchChat';
import { useCollaborationUtils } from './hooks/useCollaborationUtils';
import EditorManager from './EditorManager';
import ReportGenerator from './ReportGenerator';

interface CollaborationWindowProps {
  onEditRequest?: (sectionIndex: number) => void;
  currentUser?: string;
  reportSections?: {title: string; content: string}[];
  onClose?: () => void;
  isFloating?: boolean;
  onGenerateReport?: (requirements: any) => void;
  initialQuery?: string;
}

const CollaborationWindow: React.FC<CollaborationWindowProps> = ({ 
  onEditRequest, 
  currentUser = 'You',
  reportSections = [],
  onClose,
  isFloating = false,
  onGenerateReport,
  initialQuery = ''
}) => {
  const navigate = useNavigate();
  
  // Custom hooks
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    readyForReport,
    generateReport,
    researchData 
  } = useResearchChat();
  
  const {
    inviteEmail,
    setInviteEmail,
    collaborators,
    showInviteDialog,
    setShowInviteDialog,
    handleInvite,
    formatTime
  } = useCollaborationUtils();

  // Editor state management
  const editorData = EditorManager({ reportSections, onEditRequest });

  // Report generator state management
  const reportGeneratorData = ReportGenerator({ 
    onGenerateReport, 
    researchData,
    sendMessage 
  });

  // Handle initial query
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      sendMessage(initialQuery);
    }
  }, [initialQuery, messages.length, sendMessage]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Handle report confirmation if we're in that state
    if (reportGeneratorData.confirmingReport) {
      const handled = reportGeneratorData.handleConfirmReportGeneration(message);
      if (handled) return;
    }

    // Check if this is an edit command
    const wasEditCommand = editorData.processEditCommand(message);
    if (wasEditCommand) return;

    // Otherwise, send to the research chat
    sendMessage(message);
  };

  // Generate dynamically relevant suggested prompts based on initialQuery
  const generateSuggestedPrompts = () => {
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
  };

  const suggestedPrompts = generateSuggestedPrompts();

  return (
    <div className={`flex flex-col ${isFloating ? 'h-full rounded-lg border border-gray-700 shadow-lg overflow-hidden' : 'h-full'}`}>
      {isFloating && (
        <div className="absolute top-2 right-2 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <CollaborationHeader
        showInviteDialog={showInviteDialog}
        setShowInviteDialog={setShowInviteDialog}
        editorMode={editorData.editorMode}
        setEditorMode={editorData.setEditorMode}
      />

      <div className="flex flex-row flex-1 overflow-hidden">
        <CollaboratorsList 
          collaborators={collaborators} 
          currentUser={currentUser} 
        />

        <div className="flex-1 flex flex-col overflow-hidden border-l border-gray-800/50">
          {editorData.editSection !== null ? (
            <EditPanel
              sectionTitle={reportSections[editorData.editSection]?.title}
              editTitle={editorData.editTitle}
              editText={editorData.editText}
              setEditText={editorData.setEditText}
              setEditTitle={editorData.setEditTitle}
              handleCancelEdit={editorData.handleCancelEdit}
              handleSubmitEdit={editorData.handleSubmitEdit}
              editorMode={editorData.editorMode}
            />
          ) : (
            <>
              <MessageList 
                messages={messages} 
                formatTime={formatTime} 
              />
              <ChatInput 
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                placeholder={reportGeneratorData.confirmingReport 
                  ? "Type 'yes' to confirm report generation or provide additional instructions..." 
                  : `Describe your research on ${initialQuery || "your topic"} or ask questions...`}
                suggestedPrompts={!reportGeneratorData.confirmingReport ? suggestedPrompts : []}
                onGenerateReport={reportGeneratorData.handleGenerateReport}
                showGenerateButton={readyForReport && !reportGeneratorData.confirmingReport} 
              />
            </>
          )}
        </div>
      </div>

      <InviteDialog
        open={showInviteDialog}
        setOpen={setShowInviteDialog}
        inviteEmail={inviteEmail}
        setInviteEmail={setInviteEmail}
        handleInvite={handleInvite}
      />
    </div>
  );
};

export default CollaborationWindow;
