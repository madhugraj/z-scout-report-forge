
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  suggestedPrompts?: string[];
  showGenerateButton?: boolean;
  onGenerateReport?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder = "Ask a question...",
  suggestedPrompts = [],
  showGenerateButton = false,
  onGenerateReport
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Auto-resize the textarea based on content
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(120, textareaRef.current.scrollHeight) + 'px';
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    onSendMessage(message);
    setMessage('');
  };

  const handleGenerateReport = () => {
    if (onGenerateReport) {
      onGenerateReport();
      toast.info("Preparing report generation...");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    onSendMessage(prompt);
  };

  return (
    <div className="p-3 pt-2 border-t border-gray-800/50">
      {suggestedPrompts && suggestedPrompts.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleSuggestedPrompt(prompt)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full bg-gray-700/40 
                hover:bg-gray-600/60 text-gray-300 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="min-h-[60px] w-full resize-none py-3 pr-14 bg-gray-800/50
            focus-visible:ring-1 focus-visible:ring-gray-600 border-gray-700/50
            placeholder:text-gray-500 text-gray-300"
        />
        
        <div className="absolute right-2 bottom-2 flex gap-2">
          {showGenerateButton && (
            <Button 
              type="button"
              onClick={handleGenerateReport}
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700"
              title="Generate comprehensive research report"
            >
              <Sparkles className="h-4 w-4 text-white" />
            </Button>
          )}
          
          <Button 
            type="submit"
            size="icon"
            disabled={isLoading || !message.trim()}
            className={`h-9 w-9 rounded-full ${isLoading ? 'opacity-50' : ''}`}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
