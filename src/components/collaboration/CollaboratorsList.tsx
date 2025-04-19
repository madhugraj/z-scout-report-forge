
import React from 'react';
import { CircleUser, Bot } from 'lucide-react';

interface CollaboratorInfo {
  name: string;
  status: 'online' | 'offline';
  lastEdit?: string;
  isAI?: boolean;
}

interface CollaboratorsListProps {
  collaborators: CollaboratorInfo[];
  currentUser?: string;
}

const CollaboratorsList: React.FC<CollaboratorsListProps> = ({ collaborators, currentUser }) => {
  return (
    <div className="w-56 border-r border-gray-800 overflow-y-auto h-full">
      <div className="px-3 py-2 text-sm font-semibold border-b border-gray-800">
        Active Collaborators
      </div>
      <div className="space-y-1 py-2">
        {collaborators.map((collaborator, index) => (
          <div 
            key={index}
            className="flex items-center px-3 py-2 hover:bg-[#3A3F4C] transition-colors"
          >
            <div className="relative flex-shrink-0">
              {collaborator.isAI ? (
                <Bot className="h-8 w-8 rounded-full bg-violet-900 p-1.5 text-white" />
              ) : (
                <CircleUser className="h-8 w-8 rounded-full bg-gray-700 p-1 text-white" />
              )}
              <span 
                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-gray-900 ${
                  collaborator.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                }`}
              />
            </div>
            <div className="ml-2 overflow-hidden">
              <div className="flex items-center">
                <span className="text-sm font-medium truncate">
                  {collaborator.name === currentUser ? `${collaborator.name} (You)` : collaborator.name}
                </span>
                {collaborator.isAI && (
                  <span className="ml-1 text-xs bg-violet-900 text-white px-1 rounded">AI</span>
                )}
              </div>
              {collaborator.lastEdit && (
                <div className="text-xs text-gray-400 truncate">
                  {collaborator.lastEdit}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollaboratorsList;
