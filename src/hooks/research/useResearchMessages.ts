
import { useState } from 'react';
import { ChatMessage } from '../useResearchChat';

export function useResearchMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading
  };
}
