
import React from 'react';
import { ArrowUp, Download, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AuditAgentDropdown from './AuditAgentDropdown';
import { useToast } from '@/hooks/use-toast';

interface TrustSafetySummaryProps {
  grade: string;
  previousGrade: string;
  agent: string;
  onAgentChange: (agent: string) => void;
  stats: {
    passed: number;
    warning: number;
    failed: number;
  };
}

const TrustSafetySummary = ({
  grade = 'A-',
  previousGrade = 'B+',
  agent = 'gemini',
  onAgentChange,
  stats = { passed: 4, warning: 4, failed: 2 }
}: TrustSafetySummaryProps) => {
  const { toast } = useToast();
  
  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-emerald-500';
    if (grade.startsWith('B')) return 'text-amber-500';
    if (grade.startsWith('C')) return 'text-orange-500';
    return 'text-red-500';
  };

  const handleExport = (format: 'pdf' | 'json') => {
    toast({
      title: `Exporting ${format.toUpperCase()} Report`,
      description: "Your report will be ready in a moment."
    });
  };

  return (
    <Card className="border-gray-800/50 bg-[#2A2F3C] shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          {/* Trust Grade Section */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Trust Grade</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-2xl font-bold ${getGradeColor(grade)}`}>
                  {grade}
                </span>
                {grade !== previousGrade && (
                  <span className="text-xs flex items-center gap-1 text-emerald-400">
                    <ArrowUp className="h-3 w-3" />
                    from {previousGrade}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Trust Agent Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Trust Agent</h3>
            <AuditAgentDropdown onAgentChange={onAgentChange} />
          </div>

          {/* Status Summary Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Status Summary</h3>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-emerald-400">{stats.passed} Passed</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs text-amber-400">{stats.warning} Warning</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-xs text-red-400">{stats.failed} Failed</span>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-start text-violet-300 hover:text-violet-200"
              onClick={() => handleExport('pdf')}
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-400 hover:text-gray-300"
            >
              <FileText className="h-4 w-4" />
              View Full Scan Log
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrustSafetySummary;
