
import React, { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { ResearchChatData } from '@/hooks/research/useResearchData';

interface ReportGeneratorProps {
  onGenerateReport?: (query: string) => void;
  researchData: ResearchChatData;
  sendMessage: (message: string) => void;
}

const ReportGenerator = ({ 
  onGenerateReport,
  researchData,
  sendMessage
}: ReportGeneratorProps) => {
  const [reportQuery, setReportQuery] = useState('');
  const [confirmingReport, setConfirmingReport] = useState(false);

  const handleGenerateReport = async () => {
    try {
      if (!researchData.researchQuestion) {
        sendMessage("Before we generate a report, I need to understand your research topic better. Could you tell me what you'd like to research?");
        return;
      }

      if (!researchData.recommendedSources) {
        sendMessage("I'll help you identify relevant sources for your research. This will help ensure a comprehensive report.");
        return;
      }

      if (!researchData.researchScope) {
        sendMessage("Let's define the scope of your research to ensure we cover all important aspects.");
        return;
      }

      // Format the query based on research data
      const query = researchData.researchQuestion.mainQuestion;
      
      if (query) {
        setReportQuery(query);
        setConfirmingReport(true);
        
        sendMessage(`Based on our discussion, I understand your research requirements:

1. Main Research Question: "${researchData.researchQuestion.mainQuestion}"
2. Scope: ${researchData.researchScope.scope.join(', ')}
3. Number of identified sources: ${researchData.recommendedSources.length}

I'm ready to generate a comprehensive report. Would you like me to proceed?

Please confirm by typing "yes", "confirm", "generate", or "proceed".`);
      }
    } catch (err) {
      console.error('Error preparing report:', err);
      toast.error('Failed to prepare report generation');
      setConfirmingReport(false);
    }
  };

  const handleConfirmReportGeneration = (message: string) => {
    if (message.toLowerCase().includes('yes') || 
        message.toLowerCase().includes('confirm') || 
        message.toLowerCase().includes('generate') || 
        message.toLowerCase().includes('proceed')) {
      handleStartReportGeneration();
      setConfirmingReport(false);
      return true;
    } else {
      setConfirmingReport(false);
      return false;
    }
  };

  const handleStartReportGeneration = () => {
    if (!reportQuery || !onGenerateReport) return;
    
    onGenerateReport(reportQuery);
    
    toast.success('Starting comprehensive report generation', {
      description: 'This may take 1-2 minutes. We\'ll notify you when it\'s ready.',
      duration: 5000
    });
  };

  return {
    confirmingReport,
    handleGenerateReport,
    handleConfirmReportGeneration
  };
};

export default ReportGenerator;
