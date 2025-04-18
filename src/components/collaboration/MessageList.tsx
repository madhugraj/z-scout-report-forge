
import React from 'react';
import { Bot, Edit } from 'lucide-react';
import { Message } from './types';

interface MessageListProps {
  messages: Message[];
  formatTime: (date: Date) => string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, formatTime }) => {
  return (
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
  );
};

export default MessageList;
