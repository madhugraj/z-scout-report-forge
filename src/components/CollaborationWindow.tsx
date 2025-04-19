
import React, { useState, useEffect } from 'react';
import { Users, Send, Edit, UserPlus, X, Bot, FileEdit, Edit2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import CollaboratorsList from './collaboration/CollaboratorsList';
import MessageList from './collaboration/MessageList';
import EditPanel from './collaboration/EditPanel';
import InviteDialog from './collaboration/InviteDialog';

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
}

const CollaborationWindow: React.FC<CollaborationWindowProps> = ({ 
  onEditRequest, 
  currentUser = 'You',
  reportSections = []
}) => {
  const [message, setMessage] = useState('');
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

  const handleSendMessage = () => {
    if (message.trim()) {
      if (message.startsWith('edit section')) {
        const sectionNumber = parseInt(message.split(' ')[2]) - 1;
        if (sectionNumber >= 0 && sectionNumber < reportSections.length) {
          setEditSection(sectionNumber);
          setEditText(reportSections[sectionNumber].content);
          setMessage('');
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
      setMessage('');

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
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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

  const handleOpenExternalEditor = () => {
    // This is a placeholder function that would integrate with external editors
    const supportedEditors = [
      { name: "Microsoft Office Online", url: "https://office.live.com/" },
      { name: "Google Docs", url: "https://docs.google.com/" },
      { name: "LibreOffice Online", url: "https://libreoffice.org/" }
    ];
    
    toast({
      title: "Open in External Editor",
      description: "This feature would integrate with external document editors.",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Collaborators</h3>
          <span className="text-sm text-green-400">
            {collaborators.filter(c => c.status === 'online').length} online
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <ToggleGroup type="single" value={editorMode} onValueChange={(value) => value && setEditorMode(value as 'minimal' | 'advanced')}>
            <ToggleGroupItem value="minimal" aria-label="Minimal Editor">
              <Edit2 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="advanced" aria-label="Advanced Editor">
              <FileText className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={handleOpenExternalEditor}
            className="h-8 px-2"
          >
            <FileEdit className="h-4 w-4 mr-2" />
            Open Editor
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => setShowInviteDialog(true)}
            className="h-8 px-2"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-row h-[300px]">
        <CollaboratorsList 
          collaborators={collaborators} 
          currentUser={currentUser} 
        />

        <div className="flex-1 flex flex-col">
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

              <div className="p-4 border-t border-gray-800">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message or 'edit section 1'..."
                    className="flex-1 bg-[#2A2F3C] border-gray-700 text-white"
                  />
                  <Button size="icon" variant="secondary" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
