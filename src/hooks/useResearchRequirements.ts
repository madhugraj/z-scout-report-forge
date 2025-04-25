
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface ResearchRequirements {
  topic: string;
  research_scope: string;
  location: string;
  user_summary: string;
}

export function useResearchRequirements() {
  const [isGathering, setIsGathering] = useState(false);
  const [requirements, setRequirements] = useState<ResearchRequirements | null>(null);

  const gatherRequirements = async (query: string, history: any[] = []) => {
    setIsGathering(true);
    try {
      const { data, error } = await supabase.functions.invoke('research-requirements', {
        body: { query, history }
      });

      if (error) throw error;

      if (data.isFunctioncall && data.content.name === 'ResearchAgent') {
        setRequirements(data.content.args);
        return {
          isConfirmation: false,
          message: data.content,
          requirements: data.content.args
        };
      }

      return {
        isConfirmation: false,
        message: data.content
      };

    } catch (err) {
      console.error('Error gathering requirements:', err);
      toast.error('Failed to process research requirements');
      return {
        isConfirmation: false,
        message: 'I encountered an error. Could you please try again?'
      };
    } finally {
      setIsGathering(false);
    }
  };

  return {
    gatherRequirements,
    isGathering,
    requirements
  };
}
