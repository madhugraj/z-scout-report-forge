
import React, { useState, useEffect } from 'react';
import { Users, Send, Edit, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CollaboratorInfo {
  name: string;
  status: 'online' | 'offline';
  lastEdit?: string;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
}

const CollaborationWindow = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([
    { name: 'Sarah Kim', status: 'online', lastEdit: 'Edited Introduction' },
    { name: 'John Doe', status: 'online', lastEdit: 'Added new citation' },
    { name: 'Mike Ross', status: 'offline', lastEdit: 'Updated conclusions' }
  ]);

  // Add some example messages
  useEffect(() => {
    setMessages([
      {
        id: '1',
        sender: 'Sarah Kim',
        text: 'I added a few more citations to the literature review',
        timestamp: new Date(Date.now() - 15 * 60000) // 15 minutes ago
      },
      {
        id: '2',
        sender: 'John Doe',
        text: 'Great work! I'm reviewing the impact analysis section now',
        timestamp: new Date(Date.now() - 5 * 60000) // 5 minutes ago
      }
    ]);
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: 'You',
        text: message,
        timestamp: new Date()
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInvite = () => {
    if (inviteEmail.trim() && inviteEmail.includes('@')) {
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteEmail('');
      setShowInviteDialog(false);
      
      // Simulate new collaborator joining
      setTimeout(() => {
        const name = inviteEmail.split('@')[0];
        setCollaborators([
          ...collaborators,
          { 
            name: name.charAt(0).toUpperCase() + name.slice(1), 
            status: 'online',
            lastEdit: 'Just joined'
          }
        ]);
        toast.success(`${name} joined the collaboration`);
      }, 3000);
    } else {
      toast.error('Please enter a valid email address');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-[#1A1F2C] text-white p-4 rounded-lg flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Collaborators
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-green-400">{collaborators.filter(c => c.status === 'online').length} online</span>
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

      <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
        {collaborators.map((collaborator, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-2 rounded-lg bg-[#2A2F3C]"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center">
                {collaborator.name.charAt(0)}
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
                  <Edit className="h-3 w-3" />
                  {collaborator.lastEdit}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-800 pt-3 mb-3">
        <h4 className="text-sm font-medium mb-2">Chat</h4>
        <div className="space-y-3 max-h-40 overflow-y-auto mb-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`p-2 rounded-lg ${msg.sender === 'You' ? 'bg-violet-800 ml-6' : 'bg-[#2A2F3C] mr-6'}`}>
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm">{msg.sender}</span>
                <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
              </div>
              <p className="text-sm mt-1">{msg.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto">
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
