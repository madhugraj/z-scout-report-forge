
import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import CollaborationHeader from './CollaborationHeader';
import CollaboratorsList from './CollaboratorsList';
import MessageList from './MessageList';
import EditPanel from './EditPanel';
import InviteDialog from './InviteDialog';
import ChatInput from './ChatInput';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useResearchChat } from '@/hooks/useResearchChat';
import { useNavigate } from 'react-router-dom';

interface CollaboratorInfo {
  name: string;
  status: 'online' | 'offline';
  lastEdit?: string;
  isAI?: boolean;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isAI?: boolean;
  functionCall?: {
    name: string;
    arguments: any;
  };
}

interface CollaborationWindowProps {
  onEditRequest?: (sectionIndex: number) => void;
  currentUser?: string;
  reportSections?: {title: string; content: string}[];
  onClose?: () => void;
  isFloating?: boolean;
  onGenerateReport?: (query: string) => void;
}

const CollaborationWindow: React.FC<CollaborationWindowProps> = ({ 
  onEditRequest, 
  currentUser = 'You',
  reportSections = [],
  onClose,
  isFloating = false,
  onGenerateReport
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
  const [editSection, setEditSection] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState(false);
  const [editText, setEditText] = useState('');
  const [editorMode, setEditorMode] = useState<'minimal' | 'advanced'>('minimal');
  const [confirmingReport, setConfirmingReport] = useState(false);
  const [reportQuery, setReportQuery] = useState('');

  // Use the research chat hook
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    readyForReport,
    generateReport,
    researchData 
  } = useResearchChat();

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
    
    // Simulate new collaborator joining
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

  const handleSendMessage = (message: string) => {
    if (message.startsWith('edit section')) {
      const sectionNumber = parseInt(message.split(' ')[2]) - 1;
      if (sectionNumber >= 0 && sectionNumber < reportSections.length) {
        setEditSection(sectionNumber);
        setEditText(reportSections[sectionNumber].content);
        return;
      } else {
        toast.error('Invalid section number');
        return;
      }
    }

    // If we're confirming a report, process the confirmation
    if (confirmingReport) {
      if (message.toLowerCase().includes('yes') || message.toLowerCase().includes('confirm') || 
          message.toLowerCase().includes('generate') || message.toLowerCase().includes('proceed')) {
        
        // User confirmed, start report generation
        handleStartReportGeneration();
        setConfirmingReport(false);
        
        // Add confirmation message to chat
        sendMessage("I confirm that I want to generate the report.");
      } else {
        // User didn't confirm
        setConfirmingReport(false);
        sendMessage("I'm not ready to generate the report yet.");
      }
      return;
    }

    // Regular message sending
    sendMessage(message);
  };

  const handleGenerateReport = async () => {
    try {
      const query = await generateReport();
      
      if (query) {
        // Store the query but don't start generation yet
        setReportQuery(query);
        setConfirmingReport(true);
        
        // Add a confirmation message
        const confirmationMessage: Message = {
          id: Date.now().toString(),
          sender: 'Research AI',
          text: `I'm ready to generate a comprehensive report on "${query}". Is this the topic you want me to research? Please confirm or provide any additional instructions.`,
          timestamp: new Date(),
          isAI: true
        };
        
        // Note: Using the chat hook's internal message handling instead of managing local messages
        sendMessage(`I'm ready to generate a comprehensive report on "${query}". Please confirm to proceed.`);
      }
    } catch (err) {
      console.error('Error preparing report:', err);
      toast.error('Failed to prepare report generation');
      setConfirmingReport(false);
    }
  };
  
  const handleStartReportGeneration = () => {
    if (!reportQuery || !onGenerateReport) return;
    
    // Start the actual report generation
    onGenerateReport(reportQuery);
    
    toast.success('Starting comprehensive report generation', {
      description: 'This may take 1-2 minutes. We\'ll notify you when it\'s ready.',
      duration: 5000
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCancelEdit = () => {
    setEditSection(null);
    setEditText('');
  };

  const handleSubmitEdit = () => {
    if (editSection !== null) {
      // Here you would typically send the updated content to your backend
      // and update the reportSections state in the parent component.
      toast.success(`Section ${editSection + 1} updated successfully!`);
      setEditSection(null);
      setEditText('');
    }
  };

  // Suggested research prompts
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
              sectionTitle={reportSections[editSection]?.title}
              editTitle={editTitle}
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
                messages={messages} 
                formatTime={formatTime} 
              />
              <ChatInput 
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                placeholder={confirmingReport 
                  ? "Type 'yes' to confirm report generation or provide additional instructions..." 
                  : "Describe your research topic or ask a question..."}
                suggestedPrompts={!confirmingReport ? suggestedPrompts : []}
                onGenerateReport={handleGenerateReport}
                showGenerateButton={readyForReport && !confirmingReport} 
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
