
import React, { useState, useEffect } from 'react';
import { Users, Send, FileEdit, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';

import CollaboratorsList from './collaboration/CollaboratorsList';
import MessageList from './collaboration/MessageList';
import EditPanel from './collaboration/EditPanel';
import InviteDialog from './collaboration/InviteDialog';
import { CollaboratorInfo, Message, EditRequest } from './collaboration/types';

interface CollaborationWindowProps {
  onEditRequest?: (edit: EditRequest) => void;
  currentUser: CollaboratorInfo;
  reportSections: {title: string; content: string}[];
}

const CollaborationWindow: React.FC<CollaborationWindowProps> = ({ 
  onEditRequest, 
  currentUser,
  reportSections
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editSection, setEditSection] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [editTitle, setEditTitle] = useState(false);
  
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([
    {
      id: 'ai-assistant',
      name: 'Research AI',
      status: 'online',
      lastEdit: 'AI Assistant ready to help',
      isAI: true
    },
    currentUser
  ]);

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
      const newCollaborator = {
        id: `user-${Date.now()}`,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        status: 'online',
        lastEdit: 'Just joined'
      };
      
      setCollaborators(prev => [...prev, newCollaborator]);
      
      const joinMessage: Message = {
        id: Date.now().toString(),
        sender: 'System',
        senderId: 'system',
        text: `${newCollaborator.name} joined the collaboration`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, joinMessage]);
      toast.success(`${name} joined the collaboration`);
    }, 3000);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: currentUser.name,
        senderId: currentUser.id,
        text: message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage('');

      const editRequest = parseEditRequest(message);
      if (editRequest && onEditRequest) {
        processEditRequest(editRequest);
        return;
      }

      setTimeout(() => {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'Research AI',
          senderId: 'ai-assistant',
          text: "I've analyzed your comment. Would you like me to help you research this topic further or make edits to the report?",
          timestamp: new Date(),
          isAI: true
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 1500);
    }
  };

  const parseEditRequest = (msg: string): EditRequest | null => {
    const titleChangeRegex = /change\s+title\s+to\s+"([^"]+)"/i;
    const editSectionRegex = /edit\s+section\s+(\d+|\w+)/i;
    
    const titleMatch = msg.match(titleChangeRegex);
    if (titleMatch) {
      return {
        type: 'title',
        newValue: titleMatch[1],
        collaborator: currentUser
      };
    }
    
    const sectionMatch = msg.match(editSectionRegex);
    if (sectionMatch) {
      const sectionId = sectionMatch[1];
      const sectionIndex = isNaN(Number(sectionId)) 
        ? reportSections.findIndex(s => s.title.toLowerCase().includes(sectionId.toLowerCase()))
        : Number(sectionId) - 1;
        
      if (sectionIndex >= 0 && sectionIndex < reportSections.length) {
        setEditMode(true);
        setEditSection(sectionIndex);
        setEditText(reportSections[sectionIndex].content);
        setEditTitle(false);
        return null;
      }
    }
    
    return null;
  };

  const processEditRequest = (request: EditRequest) => {
    if (onEditRequest) {
      onEditRequest(request);
      
      const editMessage: Message = {
        id: Date.now().toString(),
        sender: 'System',
        senderId: 'system',
        text: `${request.collaborator.name} made a change to the report`,
        timestamp: new Date(),
        isEdit: true,
        editDetails: {
          changeType: request.type,
          sectionTitle: request.sectionTitle,
          sectionIndex: request.sectionIndex,
          newValue: request.newValue
        }
      };
      
      setMessages(prev => [...prev, editMessage]);
      
      setCollaborators(prev => 
        prev.map(c => 
          c.id === request.collaborator.id 
            ? {...c, lastEdit: `Edited ${request.type === 'title' ? 'title' : request.sectionTitle || 'section'}`} 
            : c
        )
      );
    }
  };

  const handleSubmitEdit = () => {
    if (editSection !== null && editText.trim() && onEditRequest) {
      const section = reportSections[editSection];
      processEditRequest({
        type: editTitle ? 'title' : 'content',
        sectionIndex: editSection,
        sectionTitle: section.title,
        newValue: editText,
        collaborator: currentUser
      });
      
      setEditMode(false);
      setEditSection(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditSection(null);
    setEditText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !editMode) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => setEditMode(prev => !prev)}
            className={`h-8 px-2 ${editMode ? 'bg-violet-700' : ''}`}
          >
            <FileEdit className="h-4 w-4" />
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
          {editMode && editSection !== null ? (
            <EditPanel
              sectionTitle={reportSections[editSection]?.title}
              editTitle={editTitle}
              editText={editText}
              setEditText={setEditText}
              setEditTitle={setEditTitle}
              handleCancelEdit={handleCancelEdit}
              handleSubmitEdit={handleSubmitEdit}
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
                    placeholder="Type a message or 'change title to \"New Title\"'..."
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
