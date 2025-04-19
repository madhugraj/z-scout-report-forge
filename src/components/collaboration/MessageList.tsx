
import React from 'react';
import { Bot, Circle } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isAI?: boolean;
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

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-gray-500">
          <p>No messages yet. Start a conversation!</p>
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
                  <div className="font-semibold text-sm mb-1">
                    {msg.sender} <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
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
