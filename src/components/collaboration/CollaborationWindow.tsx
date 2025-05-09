import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import CollaborationHeaderWrapper from './CollaborationHeaderWrapper';
import CollaboratorsList from './CollaboratorsList';
import MessageList from './MessageList';
import EditPanel from './EditPanel';
import InviteDialog from './InviteDialog';
import ChatInput from './ChatInput';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useResearchChat } from '@/hooks/useResearchChat';
import { useCollaborationUtils } from './hooks/useCollaborationUtils';
import { useReportGenerator } from './hooks/useReportGenerator';
import { useSuggestedPrompts } from './SuggestedPrompts';
import { processEditCommand, transformMessages } from './utils/MessageUtils';

interface CollaborationWindowProps {
  onEditRequest?: (sectionIndex: number) => void;
  currentUser?: string;
  reportSections?: {title: string; content: string}[];
  onClose?: () => void;
  isFloating?: boolean;
  onGenerateReport?: (query: string) => void;
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
    researchData,
    currentPhase,
    conversationCount 
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

  // Local state for editor
  const [editSection, setEditSection] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');
  const [editorMode, setEditorMode] = useState<'minimal' | 'advanced'>('minimal');
  const [autoGenerateReport, setAutoGenerateReport] = useState(false);

  // Use the report generator hook
  const reportGenerator = useReportGenerator({
    onGenerateReport,
    researchData,
    sendMessage,
  });

  // Handle initial query
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      sendMessage(initialQuery);
    }
  }, [initialQuery, messages.length, sendMessage]);

  // Auto-generate report after 5 questions
  useEffect(() => {
    if (conversationCount >= 5 && readyForReport && !autoGenerateReport) {
      setAutoGenerateReport(true);
      reportGenerator.prepareReport();
      toast.info("Research phase complete. Generating comprehensive report with web search grounding...");
    }
  }, [conversationCount, readyForReport, autoGenerateReport, reportGenerator]);

  // Editor functions
  const handleCancelEdit = () => {
    setEditSection(null);
    setEditTitle('');
    setEditText('');
  };

  const handleSubmitEdit = () => {
    if (editSection !== null && onEditRequest) {
      // Call the parent's edit handler
      onEditRequest(editSection);
      handleCancelEdit();
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Handle report confirmation if we're in that state
    if (reportGenerator.confirmReportGeneration(message)) {
      return;
    }

    // Check if this is an edit command
    const wasEditCommand = processEditCommand(
      message, 
      reportSections, 
      setEditSection, 
      setEditTitle, 
      setEditText
    );
    if (wasEditCommand) return;

    // Otherwise, send to the research chat
    sendMessage(message);
  };

  // Use suggestion prompts
  const suggestedPrompts = useSuggestedPrompts(initialQuery);

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
      
      <CollaborationHeaderWrapper
        showInviteDialog={showInviteDialog}
        setShowInviteDialog={setShowInviteDialog}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
      />

      <div className="flex flex-row flex-1 overflow-hidden">
        <CollaboratorsList 
          collaborators={collaborators} 
          currentUser={currentUser} 
        />

        <div className="flex-1 flex flex-col overflow-hidden border-l border-gray-800/50">
          {editSection !== null ? (
            <EditPanel
              sectionTitle={editTitle}
              editTitle={false}
              editText={editText}
              setEditText={setEditText}
              setEditTitle={setEditTitle}
              handleCancelEdit={handleCancelEdit}
              handleSubmitEdit={handleSubmitEdit}
              editorMode={editorMode}
            />
          ) : (
            <>
              <MessageList 
                messages={transformMessages(messages, currentUser)} 
                formatTime={formatTime} 
              />
              <ChatInput 
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                placeholder={reportGenerator.confirmingReport 
                  ? "Type 'yes' to confirm report generation or provide additional instructions..." 
                  : `Describe your research on ${initialQuery || "your topic"} or ask questions...`}
                suggestedPrompts={!reportGenerator.confirmingReport ? suggestedPrompts : []}
                onGenerateReport={reportGenerator.prepareReport}
                showGenerateButton={readyForReport && !reportGenerator.confirmingReport} 
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
