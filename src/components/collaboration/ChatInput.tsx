
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SendHorizontal, Sparkles, TestTube } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

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
  const [testingApi, setTestingApi] = useState(false);

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

  // Function to test the Gemini API key
  const testGeminiApiKey = async () => {
    try {
      setTestingApi(true);
      toast.info("Testing Gemini API key...", { duration: 3000 });
      
      const { data, error } = await supabase.functions.invoke('test-gemini-key', {
        body: { test: true }
      });
      
      if (error) {
        console.error("Error testing Gemini API key:", error);
        toast.error("Failed to test Gemini API key", { 
          description: error.message,
          duration: 8000
        });
        return;
      }
      
      if (data.error) {
        console.error("Gemini API key test failed:", data.error);
        toast.error("Gemini API key test failed", {
          description: data.error + (data.details ? ` - ${data.details}` : ''),
          duration: 10000
        });
      } else if (data.success) {
        toast.success("Gemini API key is valid!", {
          description: data.message,
          duration: 5000
        });
      }
    } catch (err: any) {
      console.error("Exception testing Gemini API key:", err);
      toast.error("Exception occurred while testing Gemini API key", {
        description: err.message,
        duration: 8000
      });
    } finally {
      setTestingApi(false);
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
              disabled={isLoading || testingApi}
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
          <div className="mb-3 flex gap-2">
            <Button 
              type="button"
              className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white flex items-center justify-center gap-2"
              onClick={handleGenerateReport}
              disabled={isLoading || testingApi}
            >
              <Sparkles className="h-4 w-4" />
              Prepare Research Report
            </Button>
            
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="bg-[#2A2F3C]/50 text-violet-400 border-gray-700 hover:bg-[#2A2F3C]/80"
              onClick={testGeminiApiKey}
              disabled={testingApi || isLoading}
              title="Test Gemini API Key"
            >
              <TestTube className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading || testingApi}
            className="flex-1 bg-[#2A2F3C]/50 text-white border-0 rounded-lg px-4 py-2 focus:ring-2 focus:ring-violet-500/50 focus:outline-none placeholder:text-gray-500 disabled:opacity-60"
          />
          <Button 
            type="submit"
            size="icon"
            className="bg-violet-600 hover:bg-violet-700 text-white"
            disabled={!message.trim() || isLoading || testingApi}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
