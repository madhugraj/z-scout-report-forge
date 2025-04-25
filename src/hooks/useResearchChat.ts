
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
  const [retryCount, setRetryCount] = useState(0);
  const [researchData, setResearchData] = useState<{
    researchQuestion?: ResearchQuestion;
    recommendedSources?: RecommendedSource[];
    researchScope?: ResearchScope;
  }>({});
  const [readyForReport, setReadyForReport] = useState(false);

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
          toast.error('Failed to get AI response');
        }
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
      
      if (retryCount < 3) {
        const backoffTime = Math.pow(2, retryCount) * 1000;
        toast.info('Retrying in ' + (backoffTime / 1000) + ' seconds...', {
          duration: backoffTime
        });
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          handleSendMessage(message);
        }, backoffTime);
      } else {
        toast.error('Unable to get a response after multiple attempts', {
          description: 'Please try again later',
          duration: 8000
        });
        setRetryCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const determineResearchPhase = () => {
    if (!researchData.researchQuestion) {
      return 'initial';
    }
    if (!researchData.recommendedSources) {
      return 'sources';
    }
    if (!researchData.researchScope) {
      return 'scope';
    }
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

  const processFunctionCallResult = async (functionCall: { name: string, arguments: any }) => {
    const { name, arguments: args } = functionCall;
    
    try {
      const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
      
      switch(name) {
        case 'researchQuestion':
          setResearchData(prev => ({
            ...prev,
            researchQuestion: parsedArgs
          }));
          
          await sendFunctionResultToAI(name, { success: true, data: parsedArgs });
          
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
          
          if (researchData.researchQuestion && researchData.recommendedSources) {
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
          
          break;
      }
    } catch (err) {
      console.error(`Error processing function call ${name}:`, err);
      toast.error(`Error processing research analysis`);
    }
  };

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
    researchData
  };
}
