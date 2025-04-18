
import React from 'react';
import { Edit } from 'lucide-react';
import { EditHistoryItem } from './types';

interface EditHistoryProps {
  edits: EditHistoryItem[];
}

const EditHistory: React.FC<EditHistoryProps> = ({ edits }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-[#1A1F2C] text-white p-4 rounded-lg border border-gray-800">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Edit className="h-4 w-4" />
        Edit History
      </h3>
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {edits.length === 0 ? (
          <p className="text-sm text-gray-400">No edits have been made yet</p>
        ) : (
          edits.map((edit) => (
            <div key={edit.id} className="bg-[#2A2F3C] p-3 rounded-lg text-sm">
              <div className="flex justify-between mb-1">
                <span className="font-medium">{edit.collaborator.name}</span>
                <span className="text-xs text-gray-400">{formatTime(edit.timestamp)}</span>
              </div>
              <p className="text-gray-300">
                {edit.type === 'title' ? 'Changed title to:' : 
                 edit.type === 'content' ? `Changed content in "${edit.sectionTitle}":` : 
                 edit.type === 'add' ? 'Added new section:' :
                 'Deleted section'}
              </p>
              {edit.newValue && (
                <p className="text-green-300 mt-1 font-mono truncate">"{edit.newValue.substring(0, 40)}{edit.newValue.length > 40 ? '...' : ''}"</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EditHistory;
