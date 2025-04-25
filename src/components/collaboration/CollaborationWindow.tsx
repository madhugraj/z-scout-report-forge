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

    if (confirmingReport) {
      if (message.toLowerCase().includes('yes') || message.toLowerCase().includes('confirm') || 
          message.toLowerCase().includes('generate') || message.toLowerCase().includes('proceed')) {
        
        if (!researchData.researchQuestion || !researchData.recommendedSources || !researchData.researchScope) {
          sendMessage("Before generating the report, I need to understand more about your research. Let me ask you a few questions.");
          setConfirmingReport(false);
          return;
        }
        
        handleStartReportGeneration();
        setConfirmingReport(false);
        
        sendMessage("I confirm that I want to generate the report.");
      } else {
        setConfirmingReport(false);
        sendMessage("I'm not ready to generate the report yet.");
      }
      return;
    }

    sendMessage(message);
  };

  const handleGenerateReport = async () => {
    try {
      if (!researchData.researchQuestion) {
        sendMessage("Before we generate a report, I need to understand your research topic better. Could you tell me what you'd like to research?");
        return;
      }

      if (!researchData.recommendedSources) {
        sendMessage("I'll help you identify relevant sources for your research. This will help ensure a comprehensive report.");
        return;
      }

      if (!researchData.researchScope) {
        sendMessage("Let's define the scope of your research to ensure we cover all important aspects.");
        return;
      }

      const query = await generateReport();
      
      if (query) {
        setReportQuery(query);
        setConfirmingReport(true);
        
        sendMessage(`Based on our discussion, I understand your research requirements:

1. Main Research Question: "${researchData.researchQuestion.mainQuestion}"
2. Scope: ${researchData.researchScope.scope.join(', ')}
3. Number of identified sources: ${researchData.recommendedSources.length}

I'm ready to generate a comprehensive report. Would you like me to proceed?

Please confirm by typing "yes", "confirm", "generate", or "proceed".`);
      }
    } catch (err) {
      console.error('Error preparing report:', err);
      toast.error('Failed to prepare report generation');
      setConfirmingReport(false);
    }
  };

  const handleStartReportGeneration = () => {
    if (!reportQuery || !onGenerateReport) return;
    
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
      toast.success(`Section ${editSection + 1} updated successfully!`);
      setEditSection(null);
      setEditText('');
    }
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
