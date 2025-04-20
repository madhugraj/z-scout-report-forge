import React, { useState } from 'react';
import { ArrowLeft, FileSearch, CheckCircle, AlertTriangle, XCircle, Shield, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import AuditAgentDropdown from './AuditAgentDropdown';
import ModuleActionDialog from './ModuleActionDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TrustSafetySummary from './TrustSafetySummary';

interface AuditModule {
  id: string;
  title: string;
  status: 'passed' | 'warning' | 'failed';
  tags: string[];
  summary: string;
  lastChecked: string;
  primaryAction: string;
}

const TrustSafetyDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("last-7-days");
  const [selectedAgent, setSelectedAgent] = useState<string>("gemini");
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<{ type: string; moduleId: string } | null>(null);

  const [trustGrade, setTrustGrade] = useState('A-');
  const [previousGrade, setPreviousGrade] = useState('B+');

  const auditModules: AuditModule[] = [
    {
      id: "bias-detection",
      title: "Bias & Stereotyping",
      status: "warning",
      tags: ["Bias", "Language Framing"],
      summary: "1 biased phrase",
      lastChecked: "Just now",
      primaryAction: "Review"
    },
    {
      id: "hallucination-detection",
      title: "Hallucination Detection",
      status: "warning",
      tags: ["No Citation", "Claim Risk"],
      summary: "1 uncited claim",
      lastChecked: "10 mins ago",
      primaryAction: "Review"
    },
    {
      id: "citation-integrity",
      title: "Citation Integrity",
      status: "passed",
      tags: ["APA Format", "Valid URLs"],
      summary: "17 citations valid",
      lastChecked: "1 hr ago",
      primaryAction: "View Tree"
    },
    {
      id: "factual-consistency",
      title: "Factual Consistency",
      status: "failed",
      tags: ["Conflicting Facts", "Mismatched Year"],
      summary: "1 timeline conflict",
      lastChecked: "2 hrs ago",
      primaryAction: "Review"
    },
    {
      id: "toxicity-check",
      title: "Toxicity Detection",
      status: "passed",
      tags: ["Safe Language", "Professional Tone"],
      summary: "No issues",
      lastChecked: "3 hrs ago",
      primaryAction: "View Log"
    },
    {
      id: "sensitive-data",
      title: "Sensitive Data",
      status: "warning",
      tags: ["PII Risk", "Personal Name"],
      summary: "1 PII found",
      lastChecked: "4 hrs ago",
      primaryAction: "Review"
    },
    {
      id: "tone-detection",
      title: "Inappropriate Tone",
      status: "failed",
      tags: ["Overconfidence", "Aggressive Framing"],
      summary: "2 tone issues",
      lastChecked: "5 hrs ago",
      primaryAction: "Review"
    },
    {
      id: "prompt-injection",
      title: "Prompt Injection",
      status: "passed",
      tags: ["Injection Prevention", "Sanitized Input"],
      summary: "No threats",
      lastChecked: "6 hrs ago",
      primaryAction: "View Logs"
    },
    {
      id: "external-source",
      title: "External Source Verification",
      status: "warning",
      tags: ["Low Credibility", "Unverified Blog"],
      summary: "1 unverified blog",
      lastChecked: "7 hrs ago",
      primaryAction: "Review"
    },
    {
      id: "safety-net",
      title: "SafetyNet Final Scan",
      status: "passed",
      tags: ["Safe Output", "No Critical Issues"],
      summary: "All checks clear",
      lastChecked: "8 hrs ago",
      primaryAction: "Full Log"
    }
  ];

  const getStatusCount = (status: 'passed' | 'warning' | 'failed') => {
    return auditModules.filter(module => module.status === status).length;
  };

  const getFilteredModules = () => {
    let filtered = [...auditModules];
    
    if (selectedModule !== 'all') {
      filtered = filtered.filter(module => module.status === selectedModule);
    }
    
    if (selectedTag) {
      filtered = filtered.filter(module => 
        module.tags.some(tag => tag.toLowerCase().includes(selectedTag.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const getStatusIcon = (status: 'passed' | 'warning' | 'failed') => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: 'passed' | 'warning' | 'failed') => {
    switch (status) {
      case 'passed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'warning':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusEmoji = (status: 'passed' | 'warning' | 'failed') => {
    switch (status) {
      case 'passed':
        return '✅';
      case 'warning':
        return '🟠';
      case 'failed':
        return '❌';
      default:
        return '⚪';
    }
  };

  const handleActionClick = (actionType: string, moduleId: string) => {
    setCurrentAction({ type: actionType, moduleId });
    setActionDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#1E2330] to-[#1A1F2C] text-white">
      <header className="w-full border-b border-gray-800/50 bg-black/10 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-gray-400 hover:text-white p-2">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Button>
            <Separator orientation="vertical" className="h-6 bg-gray-700/50" />
            <h1 className="text-xl font-semibold bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent">
              Trust & Safety Dashboard
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64 space-y-6">
          <TrustSafetySummary
            grade={trustGrade}
            previousGrade={previousGrade}
            agent={selectedAgent}
            onAgentChange={setSelectedAgent}
            stats={{
              passed: getStatusCount('passed'),
              warning: getStatusCount('warning'),
              failed: getStatusCount('failed')
            }}
          />
        </div>

        <div className="flex-1 space-y-6">
          <Card className="border-gray-800/50 bg-[#2A2F3C] shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-white">Trust & Safety Summary</CardTitle>
                  <div className="text-sm text-gray-400 mt-1">
                    <span className="text-emerald-400 font-medium">{getStatusCount('passed')} Passed</span> • 
                    <span className="text-amber-400 font-medium ml-2">{getStatusCount('warning')} Warning</span> • 
                    <span className="text-red-400 font-medium ml-2">{getStatusCount('failed')} Failed</span>
                  </div>
                </div>
                <div>
                  <Button variant="outline" size="sm" className="text-violet-300 hover:text-violet-200">
                    <FileSearch className="h-4 w-4 mr-1" />
                    Rerun Audit
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="grid" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-[#2A2F3C]">
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
              
              <Button variant="outline" size="sm" className="ml-auto">
                <FileText className="h-4 w-4 mr-1" />
                Export Report
              </Button>
            </div>
            
            <TabsContent value="grid" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredModules().map(module => (
                  <Card key={module.id} className="border-gray-800/50 bg-[#2A2F3C] shadow-md hover:border-violet-500/20 transition-all">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(module.status)}
                          <h3 className="font-medium text-white">{module.title}</h3>
                        </div>
                        <Badge className={getStatusColor(module.status)}>
                          {module.status.charAt(0).toUpperCase() + module.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="my-2 text-sm text-gray-400">
                        {module.summary}
                      </div>
                      
                      <div className="flex justify-between items-end mt-4">
                        <div className="text-xs text-gray-500">
                          {module.lastChecked}
                        </div>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleActionClick(module.primaryAction, module.id)}
                          className="text-violet-300 hover:text-violet-200"
                        >
                          🔍 {module.primaryAction}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="list" className="mt-0">
              <Card className="border-gray-800/50 bg-[#2A2F3C]">
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-800/50">
                    {getFilteredModules().map(module => (
                      <div key={module.id} className="flex items-center justify-between p-4 hover:bg-[#3A3F4C]/30 transition-colors">
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">{getStatusIcon(module.status)}</div>
                          <div>
                            <h3 className="font-medium text-white">{module.title}</h3>
                            <p className="text-xs text-gray-400">{module.summary}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-xs text-gray-500 hidden md:block">
                            {module.lastChecked}
                          </div>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleActionClick(module.primaryAction, module.id)}
                            className="text-violet-300 hover:text-violet-200"
                          >
                            {module.primaryAction}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="sticky bottom-4 mt-auto">
            <Card className="border-gray-800/50 bg-[#2A2F3C]/90 backdrop-blur-sm shadow-md">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-violet-400" />
                  <span>Resolve Next Issue</span>
                </div>
                <Button variant="default" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Fix Warning Issues
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {currentAction && (
        <ModuleActionDialog
          isOpen={actionDialogOpen}
          onClose={() => {
            setActionDialogOpen(false);
            setCurrentAction(null);
          }}
          actionType={currentAction.type}
          moduleId={currentAction.moduleId}
        />
      )}
    </div>
  );
};

export default TrustSafetyDashboard;
