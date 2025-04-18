
import React from 'react';
import { Bot, Edit } from 'lucide-react';
import { CollaboratorInfo } from './types';

interface CollaboratorsListProps {
  collaborators: CollaboratorInfo[];
  currentUser: CollaboratorInfo;
}

const CollaboratorsList: React.FC<CollaboratorsListProps> = ({ 
  collaborators,
  currentUser
}) => {
  return (
    <div className="w-1/3 border-r border-gray-800 overflow-y-auto p-4 space-y-3">
      {collaborators.map((collaborator, index) => (
        <div
          key={collaborator.id}
          className={`flex items-start gap-3 p-2 rounded-lg bg-[#2A2F3C] ${
            collaborator.id === currentUser.id ? 'ring-1 ring-violet-500' : ''
          }`}
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
  );
};

export default CollaboratorsList;
