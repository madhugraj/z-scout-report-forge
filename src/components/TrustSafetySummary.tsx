
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { FileText, FileJson, Search, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustGradeHistory {
  date: string;
  grade: string;
  value: number;
}

const gradeHistory: TrustGradeHistory[] = [
  { date: 'Apr 10', grade: 'A-', value: 90 },
  { date: 'Apr 17', grade: 'B+', value: 85 },
  { date: 'Apr 20', grade: 'A-', value: 90 },
];

const getGradeColor = (grade: string) => {
  if (grade.startsWith('A')) return 'text-emerald-500';
  if (grade.startsWith('B')) return 'text-yellow-500';
  if (grade.startsWith('C')) return 'text-orange-500';
  return 'text-red-500';
};

const TrustSafetySummary = () => {
  const currentGrade = 'A-';
  const previousGrade = 'B+';
  const hasImproved = true;

  return (
    <Card className="border-gray-800/50 bg-[#2A2F3C] shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-white">Trust Grade Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-2">
                  <span className={cn("text-3xl font-bold", getGradeColor(currentGrade))}>
                    {currentGrade}
                  </span>
                  {hasImproved && (
                    <span className="text-sm text-emerald-400">
                      (+1 Grade ↑)
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Grade is based on analysis of 10 safety modules</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="h-16 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={gradeHistory}>
              <defs>
                <linearGradient id="gradeColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#gradeColor)"
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as TrustGradeHistory;
                    return (
                      <div className="rounded-lg border border-gray-800 bg-[#2A2F3C] p-2 text-xs">
                        <p className="text-white">{`${data.date} – ${data.grade}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="text-violet-300 hover:text-violet-200">
            <FileText className="h-4 w-4 mr-1" />
            Export as PDF
          </Button>
          <Button variant="outline" size="sm" className="text-violet-300 hover:text-violet-200">
            <FileJson className="h-4 w-4 mr-1" />
            Export as JSON
          </Button>
          <Button variant="default" size="sm" className="ml-auto">
            <Search className="h-4 w-4 mr-1" />
            View Full Scan Log
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrustSafetySummary;
