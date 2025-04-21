
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
}

interface CollaborationWindowProps {
  onEditRequest?: (sectionIndex: number) => void;
  currentUser?: string;
  reportSections?: {title: string; content: string}[];
  onClose?: () => void;
  isFloating?: boolean;
  title?: string; // Add title prop to the interface
}

const CollaborationWindow: React.FC<CollaborationWindowProps> = ({ 
  onEditRequest, 
  currentUser = 'You',
  reportSections = [],
  onClose,
  isFloating = false,
  title
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
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

    const newMessage = {
      id: Date.now().toString(),
      sender: 'You',
      text: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'Research AI',
        text: 'I\'ve analyzed your comment. Would you like me to help you research this topic further or make edits to the report?',
        timestamp: new Date(),
        isAI: true
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1500);
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
              <ChatInput onSendMessage={handleSendMessage} />
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
