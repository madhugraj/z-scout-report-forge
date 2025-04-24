
import React from 'react';
import { Bot, Circle, Book, BookOpen, FileText, ScrollText, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isAI?: boolean;
  functionCall?: {
    name: string;
    arguments: any;
  };
}

interface MessageListProps {
  messages: Message[];
  formatTime: (date: Date) => string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, formatTime }) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderFunctionCallBadge = (functionCall: any) => {
    switch (functionCall.name) {
      case 'researchQuestion':
        return (
          <Badge className="bg-blue-800 hover:bg-blue-900 text-white ml-2 flex items-center gap-1">
            <Book className="h-3 w-3" />
            Research Question Analysis
          </Badge>
        );
      case 'suggestSources':
        return (
          <Badge className="bg-emerald-700 hover:bg-emerald-800 text-white ml-2 flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Source Recommendations
          </Badge>
        );
      case 'defineResearchScope':
        return (
          <Badge className="bg-amber-700 hover:bg-amber-800 text-white ml-2 flex items-center gap-1">
            <ScrollText className="h-3 w-3" />
            Research Scope Analysis
          </Badge>
        );
      default:
        return (
          <Badge className="bg-violet-800 hover:bg-violet-900 text-white ml-2 flex items-center gap-1">
            <ArrowRight className="h-3 w-3" />
            {functionCall.name}
          </Badge>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-gray-500">
          <div className="text-center max-w-md space-y-3">
            <BookOpen className="h-10 w-10 mx-auto text-gray-400 mb-2" />
            <p className="text-lg font-medium text-gray-400">Start Your Research Journey</p>
            <p className="text-sm text-gray-500">
              Let me help you develop your research question, identify relevant sources, and define the scope of your study.
            </p>
            <p className="text-xs text-gray-600 border-t border-gray-800 pt-3 mt-4">
              Try asking something like: "I want to research the impact of artificial intelligence on healthcare delivery systems"
            </p>
          </div>
        </div>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[75%] ${msg.sender === 'You' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.isAI ? (
                <Bot className="h-8 w-8 rounded-full bg-violet-900 p-1.5 text-white flex-shrink-0 mx-2" />
              ) : msg.sender !== 'You' ? (
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mx-2">
                  {msg.sender.charAt(0)}
                </div>
              ) : null}
              
              <div className={`rounded-lg px-4 py-2 ${
                msg.sender === 'You' 
                  ? 'bg-violet-600 text-white mr-2' 
                  : msg.isAI 
                    ? 'bg-[#3A3F4C] text-white' 
                    : 'bg-[#2A2F3C] text-white'
              }`}>
                {msg.sender !== 'You' && (
                  <div className="font-semibold text-sm mb-1 flex items-center flex-wrap">
                    {msg.sender} 
                    <span className="text-xs text-gray-400 ml-2">{formatTime(msg.timestamp)}</span>
                    {msg.functionCall && renderFunctionCallBadge(msg.functionCall)}
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap">{msg.text}</div>
                {msg.sender === 'You' && (
                  <div className="text-xs text-right mt-1 text-gray-300">
                    {formatTime(msg.timestamp)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
