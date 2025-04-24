
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface ChatMessage {
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

interface ResearchQuestion {
  mainQuestion: string;
  subQuestions: string[];
  researchContext: string;
}

interface RecommendedSource {
  title: string;
  authors: string;
  year: string;
  description: string;
  relevance: string;
}

interface ResearchScope {
  scope: string[];
  limitations: string[];
  timeframe: string;
}

interface ChatHistory {
  role: 'user' | 'assistant' | 'function';
  content: string | null;
  name?: string;
  functionCall?: {
    name: string;
    arguments: any;
  };
}

export function useResearchChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [researchData, setResearchData] = useState<{
    researchQuestion?: ResearchQuestion;
    recommendedSources?: RecommendedSource[];
    researchScope?: ResearchScope;
  }>({});
  const [readyForReport, setReadyForReport] = useState(false);

  // Function to handle user messages and get AI responses
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    
    // Add user message to UI
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      text: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Call the research-chat edge function
      const { data, error } = await supabase.functions.invoke('research-chat', {
        body: { message, history }
      });
      
      if (error) {
        console.error('Error calling research-chat function:', error);
        toast.error('Failed to get AI response');
        return;
      }
      
      const { response, history: newHistory } = data;
      
      // Update history state
      setHistory(newHistory);
      
      // Handle function call if present
      if (response.functionCall) {
        const functionCallMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'Research AI',
          text: `Analyzing information for: ${response.functionCall.name}...`,
          timestamp: new Date(),
          isAI: true,
          functionCall: response.functionCall
        };
        
        setMessages(prev => [...prev, functionCallMessage]);
        
        // Process function call results
        await processFunctionCallResult(response.functionCall);
      } else if (response.content) {
        // Normal text response
        const aiMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'Research AI',
          text: response.content,
          timestamp: new Date(),
          isAI: true
        };
        
        setMessages(prev => [...prev, aiMessage]);
      }
      
    } catch (err) {
      console.error('Error processing message:', err);
      toast.error('An error occurred while processing your message');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process function calls and their results
  const processFunctionCallResult = async (functionCall: { name: string, arguments: any }) => {
    const { name, arguments: args } = functionCall;
    
    try {
      // Parse function arguments
      const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
      
      switch(name) {
        case 'researchQuestion':
          setResearchData(prev => ({
            ...prev,
            researchQuestion: parsedArgs
          }));
          
          // Function result to send back to AI
          await sendFunctionResultToAI(name, { success: true, data: parsedArgs });
          
          // Add a UI message explaining the research question
          const researchQuestionMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'Research AI',
            text: `I've identified your main research question: "${parsedArgs.mainQuestion}"\n\n${
              parsedArgs.subQuestions && parsedArgs.subQuestions.length > 0 ? 
                `Related sub-questions:\n${parsedArgs.subQuestions.map((q: string) => `• ${q}`).join('\n')}` : ''
            }`,
            timestamp: new Date(),
            isAI: true
          };
          
          setMessages(prev => [...prev, researchQuestionMessage]);
          break;
          
        case 'suggestSources':
          setResearchData(prev => ({
            ...prev,
            recommendedSources: parsedArgs.recommendedSources
          }));
          
          await sendFunctionResultToAI(name, { success: true, data: parsedArgs });
          
          // Add a UI message explaining the sources
          const sourcesMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'Research AI',
            text: `I've identified ${parsedArgs.recommendedSources.length} relevant sources for your research. Here are some key references:\n\n${
              parsedArgs.recommendedSources.slice(0, 3).map((source: RecommendedSource, index: number) => 
                `${index + 1}. "${source.title}" by ${source.authors} (${source.year})`
              ).join('\n')
            }${parsedArgs.recommendedSources.length > 3 ? '\n\n...and more' : ''}`,
            timestamp: new Date(),
            isAI: true
          };
          
          setMessages(prev => [...prev, sourcesMessage]);
          break;
          
        case 'defineResearchScope':
          setResearchData(prev => ({
            ...prev,
            researchScope: parsedArgs
          }));
          
          await sendFunctionResultToAI(name, { success: true, data: parsedArgs });
          
          // Add a UI message explaining the scope
          const scopeMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'Research AI',
            text: `I've defined the scope for your research:\n\n${
              parsedArgs.scope ? `Within scope:\n${parsedArgs.scope.map((s: string) => `• ${s}`).join('\n')}` : ''
            }\n\n${
              parsedArgs.limitations ? `Beyond scope:\n${parsedArgs.limitations.map((l: string) => `• ${l}`).join('\n')}` : ''
            }${
              parsedArgs.timeframe ? `\n\nTimeframe: ${parsedArgs.timeframe}` : ''
            }`,
            timestamp: new Date(),
            isAI: true
          };
          
          setMessages(prev => [...prev, scopeMessage]);
          
          // Check if we have enough data to generate a report
          if (researchData.researchQuestion && researchData.recommendedSources) {
            setReadyForReport(true);
            
            // Add a message suggesting report generation
            const readyMessage: ChatMessage = {
              id: Date.now().toString(),
              sender: 'Research AI',
              text: `I now have enough information to generate a comprehensive research report. Would you like me to start generating the full report based on our discussion?`,
              timestamp: new Date(),
              isAI: true
            };
            
            setMessages(prev => [...prev, readyMessage]);
          }
          
          break;
      }
    } catch (err) {
      console.error(`Error processing function call ${name}:`, err);
      toast.error(`Error processing research analysis`);
    }
  };
  
  // Send function results back to AI
  const sendFunctionResultToAI = async (name: string, results: any) => {
    try {
      // Get the last message (which should be the function call)
      const { data, error } = await supabase.functions.invoke('research-chat', {
        body: { 
          message: "", // Empty message since we're just sending function results
          history, 
          functionResults: results
        }
      });
      
      if (error) {
        console.error('Error sending function results:', error);
        return;
      }
      
      // Update history
      setHistory(data.history);
      
    } catch (err) {
      console.error('Error sending function results:', err);
    }
  };
  
  // Generate the final report
  const generateReport = async () => {
    if (!researchData.researchQuestion) {
      toast.error('Research question is required before generating a report');
      return;
    }
    
    const confirmMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'Research AI',
      text: `Starting comprehensive report generation based on our conversation...`,
      timestamp: new Date(),
      isAI: true
    };
    
    setMessages(prev => [...prev, confirmMessage]);
    
    // Here we would call the existing report generation function...
    // For now, we'll just return the query for the existing report generation pipeline
    
    return researchData.researchQuestion.mainQuestion;
  };
  
  return {
    messages,
    isLoading,
    sendMessage: handleSendMessage,
    readyForReport,
    generateReport,
    researchData
  };
}
