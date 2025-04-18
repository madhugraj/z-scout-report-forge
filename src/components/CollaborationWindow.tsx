
import React, { useState, useEffect } from 'react';
import { Users, Send, Edit, UserPlus, X, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

const CollaborationWindow = () => {
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
          text: 'I've analyzed your comment. Would you like me to help you research this topic further or make edits to the report?',
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
        <Button 
          size="sm" 
          variant="secondary"
          onClick={() => setShowInviteDialog(true)}
          className="h-8 px-2"
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-row h-[300px]">
        <div className="w-1/3 border-r border-gray-800 overflow-y-auto p-4 space-y-3">
          {collaborators.map((collaborator, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-2 rounded-lg bg-[#2A2F3C]"
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`p-2 rounded-lg ${
                  msg.isAI ? 'bg-violet-800/20 mr-6' : 'bg-[#2A2F3C] ml-6'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm flex items-center gap-1">
                    {msg.isAI && <Bot className="h-3 w-3" />}
                    {msg.sender}
                  </span>
                  <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
                </div>
                <p className="text-sm mt-1">{msg.text}</p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 bg-[#2A2F3C] border-gray-700 text-white"
              />
              <Button size="icon" variant="secondary" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
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
