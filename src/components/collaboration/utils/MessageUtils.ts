
import { ChatMessage } from '@/hooks/useResearchChat';

export interface TransformedMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isAI: boolean;
  functionCall?: {
    name: string;
    arguments: any;
  };
}

export function transformMessages(messages: ChatMessage[], currentUser: string): TransformedMessage[] {
  return messages.map((msg, index) => ({
    id: `msg-${index}-${msg.timestamp || Date.now()}`,
    sender: msg.role === 'user' ? currentUser : 'Research AI',
    text: msg.content,
    timestamp: new Date(msg.timestamp || Date.now()),
    isAI: msg.role === 'assistant',
    functionCall: msg.functionCall
  }));
}

export function processEditCommand(
  message: string, 
  reportSections: {title: string; content: string}[],
  setEditSection: (index: number | null) => void,
  setEditTitle: (title: string) => void,
  setEditText: (text: string) => void
): boolean {
  const editRegex = /^edit\s+section\s+(\d+)$/i;
  const match = message.match(editRegex);
  
  if (match) {
    const sectionIndex = parseInt(match[1], 10) - 1; // Convert to 0-based index
    if (sectionIndex >= 0 && sectionIndex < reportSections.length) {
      setEditSection(sectionIndex);
      setEditTitle(reportSections[sectionIndex].title);
      setEditText(reportSections[sectionIndex].content);
      return true;
    }
  }
  return false;
}
