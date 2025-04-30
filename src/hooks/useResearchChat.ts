
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useResearchData } from './research/useResearchData';
import { useResearchMessages } from './research/useResearchMessages';
import { processFunctionResults } from './research/researchUtils';

export interface ChatMessage {
  role: string;
  content: string;
  timestamp?: number;
  functionCall?: {
    name: string;
    arguments: any;
  };
}

export function useResearchChat() {
  const { 
    messages, 
    setMessages, 
    isLoading, 
    setIsLoading 
  } = useResearchMessages();
  
  const { 
    researchData, 
    setResearchData,
    currentPhase, 
    setCurrentPhase,
    readyForReport, 
    setReadyForReport 
  } = useResearchData();
  
  const [conversationCount, setConversationCount] = useState(0);
  const [retryAttempts, setRetryAttempts] = useState(0);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Increment conversation count for user messages
    setConversationCount(prev => prev + 1);

    try {
      // Get the last message that might contain a function call
      const lastAssistantMessage = [...messages].reverse().find(
        msg => msg.role === 'assistant' && msg.functionCall
      );
      
      // If there's a function call that hasn't been processed yet, add dummy results
      let functionResults = null;
      
      if (lastAssistantMessage?.functionCall) {
        const functionName = lastAssistantMessage.functionCall.name;
        const args = lastAssistantMessage.functionCall.arguments;
        
        console.log(`Processing function call: ${functionName}`);
        
        // Instead of auto-processing, we'll use the user's message as input to the research chat
        functionResults = null;
      }

      const { data, error } = await supabase.functions.invoke('research-chat', {
        body: {
          message,
          history: messages,
          functionResults,
          phase: currentPhase,
          forceReport: conversationCount >= 5 // Force report phase after 5 conversations
        }
      });

      if (error) {
        console.error("Error from Edge Function:", error);
        toast.error("Error communicating with research assistant");
        
        // Add fallback error message
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I'm having trouble connecting to the research service. Please try again later.",
          timestamp: Date.now()
        }]);
        
        setIsLoading(false);
        return;
      }

      if (!data) {
        throw new Error("No data returned from Edge Function");
      }
      
      // Extract and store the updated history
      const { response, history, readyForReport: isReadyForReport, currentPhase: newPhase } = data;
      
      // If the response is properly formed
      if (response) {
        // Check if we need to process a function call
        if (response.functionCall) {
          const { name, arguments: args } = response.functionCall;
          
          // Wait a second to make it seem like processing is happening
          setTimeout(() => {
            processFunctionResults(name, args, setResearchData, setCurrentPhase, setReadyForReport);
          }, 1000);
        }
        
        // Store the updated set of messages
        setMessages(
          history.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp || Date.now()
          }))
        );
        
        // Update readyForReport status if the backend says we're ready
        if (isReadyForReport !== undefined) {
          setReadyForReport(isReadyForReport);
        }
        
        // Update current phase if the backend changed it
        if (newPhase) {
          setCurrentPhase(newPhase);
        }
      } else {
        throw new Error("Invalid response format from Edge Function");
      }
      
      // Reset retry attempts on success
      setRetryAttempts(0);
      
    } catch (err) {
      console.error("Failed to send message:", err);
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, there was an error processing your request. Please try again.",
        timestamp: Date.now()
      }]);
      
      // Increment retry attempts
      const currentRetries = retryAttempts + 1;
      setRetryAttempts(currentRetries);
      
      // If we've retried too many times, suggest report generation
      if (currentRetries >= 3 && currentPhase !== 'initial') {
        setReadyForReport(true);
        toast.warning("We're experiencing some issues with the research assistant. You may want to generate a report with what we have so far.");
      }
      
      toast.error("Failed to communicate with research assistant");
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentPhase, processFunctionResults, retryAttempts, conversationCount]);

  const generateReport = useCallback((requirements: any) => {
    if (!researchData.researchQuestion?.mainQuestion) {
      toast.error("Cannot generate report without a research question");
      return;
    }
    
    return {
      query: researchData.researchQuestion.mainQuestion,
      requirements
    };
  }, [researchData]);

  return {
    messages,
    isLoading,
    sendMessage,
    readyForReport,
    generateReport,
    researchData,
    currentPhase,
    conversationCount,
    retryAttempts
  };
}
