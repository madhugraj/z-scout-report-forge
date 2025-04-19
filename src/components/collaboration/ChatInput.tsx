
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SendHorizontal } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="border-t border-gray-800/50 bg-[#1A1F2C]/90 p-4 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-[#2A2F3C]/50 text-white border-0 rounded-lg px-4 py-2 focus:ring-2 focus:ring-violet-500/50 focus:outline-none placeholder:text-gray-500"
        />
        <Button 
          type="submit"
          size="icon"
          className="bg-violet-600 hover:bg-violet-700 text-white"
          disabled={!message.trim()}
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
