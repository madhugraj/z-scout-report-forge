
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SendHorizontal, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  suggestedPrompts?: string[];
  onGenerateReport?: () => void;
  showGenerateButton?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading = false,
  placeholder = "Type your message...",
  suggestedPrompts = [],
  onGenerateReport,
  showGenerateButton = false
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  const handleSuggestedPrompt = (prompt: string) => {
    onSendMessage(prompt);
  };

  const handleGenerateReport = () => {
    if (onGenerateReport) {
      onGenerateReport();
    }
  };

  return (
    <div>
      {suggestedPrompts.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 py-2">
          {suggestedPrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="bg-[#2A2F3C]/30 text-gray-300 border border-gray-700 hover:bg-[#2A2F3C]/80 hover:text-white"
              onClick={() => handleSuggestedPrompt(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      )}
      
      <form 
        onSubmit={handleSubmit}
        className="border-t border-gray-800/50 bg-[#1A1F2C]/90 p-4 backdrop-blur-sm"
      >
        {showGenerateButton && (
          <div className="mb-3">
            <Button 
              type="button"
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white flex items-center justify-center gap-2"
              onClick={handleGenerateReport}
              disabled={isLoading}
            >
              <Sparkles className="h-4 w-4" />
              Generate Comprehensive Research Report
            </Button>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 bg-[#2A2F3C]/50 text-white border-0 rounded-lg px-4 py-2 focus:ring-2 focus:ring-violet-500/50 focus:outline-none placeholder:text-gray-500 disabled:opacity-60"
          />
          <Button 
            type="submit"
            size="icon"
            className="bg-violet-600 hover:bg-violet-700 text-white"
            disabled={!message.trim() || isLoading}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
