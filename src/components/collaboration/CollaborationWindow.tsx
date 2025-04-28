
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
import EditorManager from './EditorManager';
import ReportGenerator from './ReportGenerator';

interface CollaboratorInfo {
  name: string;
  status: 'online' | 'offline';
  lastEdit?: string;
  isAI?: boolean;
}

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
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([
    {
      name: 'Research AI',
      status: 'online',
      lastEdit: 'AI Assistant ready to help',
      isAI: true
    }
  ]);

  const { 
    messages, 
    isLoading, 
    sendMessage, 
    readyForReport,
    generateReport,
    researchData 
  } = useResearchChat();

  const editorData = EditorManager({ reportSections, onEditRequest });
  
  const reportGeneratorData = ReportGenerator({ 
    onGenerateReport, 
    researchData,
    sendMessage 
  });

  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      sendMessage(initialQuery);
    }
  }, [initialQuery, messages.length]);

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!inviteEmail.includes('@') || !inviteEmail.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }

    toast.success(`Invite sent to ${inviteEmail}`);
    setInviteEmail('');
    setShowInviteDialog(false);
    
    setTimeout(() => {
      const name = inviteEmail.split('@')[0];
      setCollaborators(prev => [...prev, {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        status: 'online',
        lastEdit: 'Just joined'
      }]);
      toast.success(`${name} joined the collaboration`);
    }, 3000);
  };

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const suggestedPrompts = [
    "I'm interested in researching climate change adaptation in coastal cities",
    "Help me formulate a research question about AI ethics in healthcare",
    "I want to explore the impact of remote work on employee productivity"
  ];

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
                  : "Describe your research topic or ask a question..."}
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
