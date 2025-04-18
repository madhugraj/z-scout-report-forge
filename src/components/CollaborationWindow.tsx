
import React, { useState } from 'react';
import { Users, Send, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CollaboratorInfo {
  name: string;
  status: 'online' | 'offline';
  lastEdit?: string;
}

const CollaborationWindow = () => {
  const [message, setMessage] = useState('');
  const [collaborators] = useState<CollaboratorInfo[]>([
    { name: 'Sarah Kim', status: 'online', lastEdit: 'Edited Introduction' },
    { name: 'John Doe', status: 'online', lastEdit: 'Added new citation' },
    { name: 'Mike Ross', status: 'offline', lastEdit: 'Updated conclusions' }
  ]);

  return (
    <div className="bg-[#1A1F2C] text-white p-4 rounded-lg flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Collaborators
        </h3>
        <span className="text-sm text-green-400">3 online</span>
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

      <div className="pt-3 border-t border-gray-800">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#2A2F3C] border-gray-700 text-white"
          />
          <Button size="icon" variant="secondary">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CollaborationWindow;
