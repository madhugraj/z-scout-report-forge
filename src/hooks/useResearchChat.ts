
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

// Types
export interface ChatMessage {
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

export interface ResearchQuestion {
  mainQuestion: string;
  subQuestions: string[];
  researchContext: string;
}

export interface RecommendedSource {
  title: string;
  authors: string;
  year: string;
  description: string;
  relevance: string;
}

export interface ResearchScope {
  scope: string[];
  limitations: string[];
  timeframe: string;
}

export interface ResearchChatData {
  researchQuestion?: ResearchQuestion;
  recommendedSources?: RecommendedSource[];
  researchScope?: ResearchScope;
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

// Hook
export function useResearchChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [researchData, setResearchData] = useState<ResearchChatData>({});
  const [readyForReport, setReadyForReport] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Helper functions
  const determineResearchPhase = () => {
    if (!researchData.researchQuestion) return 'initial';
    if (!researchData.recommendedSources) return 'sources';
    if (!researchData.researchScope) return 'scope';
    return 'ready';
  };

  const getPhaseMessage = (functionName: string) => {
    switch (functionName) {
      case 'researchQuestion':
        return 'I\'ll help you formulate your research question and identify key areas to explore...';
      case 'suggestSources':
        return 'Now that we have your research question, let me find relevant academic sources...';
      case 'defineResearchScope':
        return 'Based on the sources, I\'ll help define the scope of your research...';
      default:
        return `Analyzing information for: ${functionName}...`;
    }
  };

  // Function to handle API errors
  const handleApiError = (error: any) => {
    console.error('API Error:', error);
    
    // Check if it's a Gemini model issue
    if (error.message?.includes('model') && error.message?.includes('not found')) {
      setApiError('There appears to be an issue with the AI model. Using fallback mode.');
      
      // Create a fallback assistant message
      const fallbackMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'Research AI',
        text: `I'm currently experiencing technical difficulties connecting to my research database. I can still help you brainstorm your topic, but I'll have limited access to academic sources for now. Please describe your research interests, and I'll do my best to assist you.`,
        timestamp: new Date(),
        isAI: true
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      return true;
    }
    
    return false;
  };

  // Function to handle retries with exponential backoff
  const retryWithBackoff = (message: string) => {
    if (retryCount < 3) {
      const backoffTime = Math.pow(2, retryCount) * 1000;
      toast.info('Retrying in ' + (backoffTime / 1000) + ' seconds...', {
        duration: backoffTime
      });
      
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        handleSendMessage(message);
      }, backoffTime);
      return true;
    }
    
    toast.error('Unable to get a response after multiple attempts', {
      description: 'Please try again later',
      duration: 8000
    });
    setRetryCount(0);
    return false;
  };

  // Function to send results of function calls back to the AI
  const sendFunctionResultToAI = async (name: string, results: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('research-chat', {
        body: { 
          message: "", 
          history, 
          functionResults: results
        }
      });
      
      if (error) {
        console.error('Error sending function results:', error);
        return;
      }
      
      setHistory(data.history);
      
    } catch (err) {
      console.error('Error sending function results:', err);
    }
  };

  // Functions for handling different types of function calls
  const handleResearchQuestion = async (args: ResearchQuestion) => {
    setResearchData(prev => ({
      ...prev,
      researchQuestion: args
    }));
    
    await sendFunctionResultToAI('researchQuestion', { success: true, data: args });
    
    const researchQuestionMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'Research AI',
      text: `I've identified your main research question: "${args.mainQuestion}"\n\n${
        args.subQuestions && args.subQuestions.length > 0 ? 
          `Related sub-questions:\n${args.subQuestions.map((q: string) => `• ${q}`).join('\n')}` : ''
      }`,
      timestamp: new Date(),
      isAI: true
    };
    
    setMessages(prev => [...prev, researchQuestionMessage]);
  };

  const handleSuggestSources = async (args: { recommendedSources: RecommendedSource[] }) => {
    setResearchData(prev => ({
      ...prev,
      recommendedSources: args.recommendedSources
    }));
    
    await sendFunctionResultToAI('suggestSources', { success: true, data: args });
    
    const sourcesMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'Research AI',
      text: `I've identified ${args.recommendedSources.length} relevant sources for your research. Here are some key references:\n\n${
        args.recommendedSources.slice(0, 3).map((source: RecommendedSource, index: number) => 
          `${index + 1}. "${source.title}" by ${source.authors} (${source.year})`
        ).join('\n')
      }${args.recommendedSources.length > 3 ? '\n\n...and more' : ''}`,
      timestamp: new Date(),
      isAI: true
    };
    
    setMessages(prev => [...prev, sourcesMessage]);
  };

  const handleDefineResearchScope = async (args: ResearchScope) => {
    setResearchData(prev => ({
      ...prev,
      researchScope: args
    }));
    
    await sendFunctionResultToAI('defineResearchScope', { success: true, data: args });
    
    const scopeMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'Research AI',
      text: `I've defined the scope for your research:\n\n${
        args.scope ? `Within scope:\n${args.scope.map((s: string) => `• ${s}`).join('\n')}` : ''
      }\n\n${
        args.limitations ? `Beyond scope:\n${args.limitations.map((l: string) => `• ${l}`).join('\n')}` : ''
      }${
        args.timeframe ? `\n\nTimeframe: ${args.timeframe}` : ''
      }`,
      timestamp: new Date(),
      isAI: true
    };
    
    setMessages(prev => [...prev, scopeMessage]);
    
    checkIfReadyForReport();
  };

  // Check if we're ready to generate a report
  const checkIfReadyForReport = () => {
    if (researchData.researchQuestion && researchData.recommendedSources && researchData.researchScope) {
      setReadyForReport(true);
      
      const readyMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'Research AI',
        text: `I now have enough information to generate a comprehensive research report. Would you like me to start generating the full report based on our discussion?`,
        timestamp: new Date(),
        isAI: true
      };
      
      setMessages(prev => [...prev, readyMessage]);
    }
  };

  // Process function call results
  const processFunctionCallResult = async (functionCall: { name: string, arguments: any }) => {
    const { name, arguments: args } = functionCall;
    
    try {
      const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
      
      switch(name) {
        case 'researchQuestion':
          await handleResearchQuestion(parsedArgs);
          break;
          
        case 'suggestSources':
          await handleSuggestSources(parsedArgs);
          break;
          
        case 'defineResearchScope':
          await handleDefineResearchScope(parsedArgs);
          break;
      }
    } catch (err) {
      console.error(`Error processing function call ${name}:`, err);
      toast.error(`Error processing research analysis`);
    }
  };

  // Handle fallback responses when API is failing
  const createFallbackResponse = (message: string) => {
    // Simple responses when the AI service is down
    let response: string;
    
    if (message.toLowerCase().includes('research') || message.toLowerCase().includes('study') || message.toLowerCase().includes('paper')) {
      response = "I understand you're working on a research project. While I'm having trouble connecting to my academic database right now, I can still help you organize your thoughts. What specific area are you researching?";
    } else if (message.toLowerCase().includes('source') || message.toLowerCase().includes('reference') || message.toLowerCase().includes('citation')) {
      response = "I'd normally provide specific academic sources for your research, but I'm currently having trouble accessing my citation database. In the meantime, consider checking Google Scholar, JSTOR, or your university's research portal for relevant literature.";
    } else {
      response = "Thank you for your message. I'm currently experiencing some technical limitations with my research tools, but I'm still here to help. Could you tell me more about your research goals so I can assist you in other ways?";
    }
    
    const aiMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'Research AI',
      text: response,
      timestamp: new Date(),
      isAI: true
    };
    
    setMessages(prev => [...prev, aiMessage]);
  };

  // Main function to send messages
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      text: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // If we're in API error state, use fallback responses
      if (apiError) {
        createFallbackResponse(message);
        setIsLoading(false);
        return;
      }
      
      const currentPhase = determineResearchPhase();
      
      const { data, error } = await supabase.functions.invoke('research-chat', {
        body: { 
          message, 
          history,
          phase: currentPhase
        }
      });
      
      if (error) {
        console.error('Error calling research-chat function:', error);
        
        if (error.message.includes('rate limit') || error.message.includes('quota exceeded')) {
          toast.error('API rate limit reached', {
            description: 'Please wait a moment before sending another message.',
            duration: 5000
          });
        } else {
          // Handle other API errors with fallback
          if (handleApiError(error)) {
            setIsLoading(false);
            return;
          }
          
          toast.error('Failed to get AI response');
        }
        
        setIsLoading(false);
        return;
      }
      
      setRetryCount(0);
      
      const { response, history: newHistory } = data;
      
      setHistory(newHistory);
      
      if (response.functionCall) {
        const functionCallMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'Research AI',
          text: getPhaseMessage(response.functionCall.name),
          timestamp: new Date(),
          isAI: true,
          functionCall: response.functionCall
        };
        
        setMessages(prev => [...prev, functionCallMessage]);
        
        await processFunctionCallResult(response.functionCall);
      } else if (response.content) {
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
      
      // Try to handle API error with fallback
      if (handleApiError(err)) {
        setIsLoading(false);
        return;
      }
      
      retryWithBackoff(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate the report
  const generateReport = async () => {
    if (!researchData.researchQuestion) {
      toast.error('Research question is required before generating a report');
      return null;
    }
    
    if (!researchData.recommendedSources) {
      toast.error('Source recommendations are required before generating a report');
      return null;
    }
    
    if (!researchData.researchScope) {
      toast.error('Research scope definition is required before generating a report');
      return null;
    }
    
    const confirmMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'Research AI',
      text: `Starting comprehensive report generation based on our conversation...`,
      timestamp: new Date(),
      isAI: true
    };
    
    setMessages(prev => [...prev, confirmMessage]);
    
    return researchData.researchQuestion.mainQuestion;
  };

  return {
    messages,
    isLoading,
    sendMessage: handleSendMessage,
    readyForReport,
    generateReport,
    researchData,
    apiError
  };
}
