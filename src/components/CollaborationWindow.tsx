import React, { useState, useEffect } from 'react';
import { Users, Send, Edit, UserPlus, X, Bot, FileEdit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CollaboratorInfo {
  name: string;
  status: 'online' | 'offline';
  lastEdit?: string;
  isAI?: boolean;
  id: string;
}

interface Message {
  id: string;
  sender: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isAI?: boolean;
  isEdit?: boolean;
  editDetails?: {
    sectionIndex?: number;
    sectionTitle?: string;
    changeType: 'title' | 'content' | 'add' | 'delete';
    oldValue?: string;
    newValue?: string;
  };
}

export interface EditRequest {
  type: 'title' | 'content' | 'add' | 'delete';
  sectionIndex?: number;
  sectionTitle?: string;
  newValue?: string;
  collaborator: CollaboratorInfo;
}

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
            ? {...c, lastEdit: `Edited ${request.type === 'title' ? 'title' : `${request.sectionTitle || 'section'}`}`} 
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
        <div className="w-1/3 border-r border-gray-800 overflow-y-auto p-4 space-y-3">
          {collaborators.map((collaborator, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-2 rounded-lg bg-[#2A2F3C] ${collaborator.id === currentUser.id ? 'ring-1 ring-violet-500' : ''}`}
            >
              <div className="relative">
                <div className={`w-8 h-8 rounded-full ${collaborator.isAI ? 'bg-violet-800' : 'bg-violet-600'} flex items-center justify-center`}>
                  {collaborator.isAI ? <Bot className="h-4 w-4" /> : collaborator.name.charAt(0)}
                </div>
                <div 
                  className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1A1F2C] ${
                    collaborator.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{collaborator.name}</span>
                  <span className={`text-xs ${
                    collaborator.status === 'online' ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {collaborator.status}
                  </span>
                </div>
                {collaborator.lastEdit && (
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    {collaborator.isAI ? <Bot className="h-3 w-3" /> : <Edit className="h-3 w-3" />}
                    {collaborator.lastEdit}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col">
          {editMode && editSection !== null ? (
            <div className="flex-1 flex flex-col p-4">
              <div className="mb-2 text-sm text-white flex items-center justify-between">
                <div>
                  Editing {editTitle ? 'title' : 'content'} of: 
                  <span className="font-semibold ml-1">
                    {reportSections[editSection]?.title}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 px-2"
                    onClick={() => setEditTitle(!editTitle)}
                  >
                    {editTitle ? 'Edit Content' : 'Edit Title'}
                  </Button>
                </div>
              </div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="flex-1 p-3 bg-[#2A2F3C] border border-gray-700 rounded-md text-white resize-none"
                placeholder={`Enter new ${editTitle ? 'title' : 'content'}...`}
              />
              <div className="flex justify-end mt-3 gap-2">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`p-2 rounded-lg ${
                      msg.isEdit ? 'bg-blue-800/20' :
                      msg.isAI ? 'bg-violet-800/20 mr-6' : 
                      msg.sender === 'System' ? 'bg-gray-800/50' :
                      'bg-[#2A2F3C] ml-6'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm flex items-center gap-1">
                        {msg.isAI && <Bot className="h-3 w-3" />}
                        {msg.isEdit && <Edit className="h-3 w-3" />}
                        {msg.sender}
                      </span>
                      <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
                    </div>
                    <p className="text-sm mt-1">{msg.text}</p>
                    {msg.isEdit && msg.editDetails && (
                      <div className="mt-1 text-xs bg-gray-800 p-1.5 rounded">
                        <p className="text-gray-300">
                          {msg.editDetails.changeType === 'title' ? 'Changed title to:' : 
                           msg.editDetails.changeType === 'content' ? `Changed content in section "${msg.editDetails.sectionTitle}":` : 
                           `${msg.editDetails.changeType} operation`}
                        </p>
                        {msg.editDetails.newValue && (
                          <p className="text-green-300 mt-1 font-mono">"{msg.editDetails.newValue.substring(0, 50)}{msg.editDetails.newValue.length > 50 ? '...' : ''}"</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

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

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="bg-[#1A1F2C] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Invite Collaborator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-300">
              Enter the email address of the person you want to collaborate with on this research report.
            </p>
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="bg-[#2A2F3C] border-gray-700 text-white"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite}>
                Send Invite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollaborationWindow;
