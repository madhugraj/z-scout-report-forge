import React, { useState } from 'react';
import { ArrowLeft, Download, Share, FileText, FileSearch, CheckCircle, AlertTriangle, XCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import AuditAgentDropdown from './AuditAgentDropdown';

interface AuditModule {
  id: string;
  title: string;
  status: 'passed' | 'warning' | 'failed';
  tags: string[];
  summary: string;
  lastChecked: string;
  actions: { label: string; action: () => void }[];
}

const TrustSafetyDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("last-7-days");
  const [selectedAgent, setSelectedAgent] = useState<string>("gemini");

  // Updated mock data for modules with more detailed content
  const auditModules: AuditModule[] = [
    {
      id: "bias-detection",
      title: "Bias & Stereotyping Protection",
      status: "warning",
      tags: ["Bias", "Language Framing"],
      summary: "Detected 1 biased phrase in \"Executive Summary\". The phrase \"revolutionary impact\" implies strong opinion.",
      lastChecked: "Just now",
      actions: [
        { label: "View Phrase", action: () => console.log("View phrase") },
        { label: "Edit Suggestion", action: () => console.log("Edit suggestion") },
        { label: "Accept Revision", action: () => console.log("Accept revision") }
      ]
    },
    {
      id: "hallucination-detection",
      title: "Hallucination Detection",
      status: "warning",
      tags: ["No Citation", "Claim Risk"],
      summary: "\"AI has reduced anxiety levels by 70%\" lacks citation.",
      lastChecked: "10 minutes ago",
      actions: [
        { label: "Review Insight", action: () => console.log("Review insight") },
        { label: "Add Citation", action: () => console.log("Add citation") },
        { label: "Rephrase", action: () => console.log("Rephrase") }
      ]
    },
    {
      id: "citation-integrity",
      title: "Citation Integrity",
      status: "passed",
      tags: ["APA Format", "Valid URLs"],
      summary: "All 17 citations match proper formatting and are resolvable.",
      lastChecked: "1 hour ago",
      actions: [
        { label: "View Citation Tree", action: () => console.log("View citation tree") }
      ]
    },
    {
      id: "factual-consistency",
      title: "Factual Consistency",
      status: "failed",
      tags: ["Conflicting Facts", "Mismatched Year"],
      summary: "Found a 2019 date conflicting with a 2021 reference.",
      lastChecked: "2 hours ago",
      actions: [
        { label: "Resolve Conflict", action: () => console.log("Resolve conflict") },
        { label: "Review Context", action: () => console.log("Review context") }
      ]
    },
    {
      id: "toxicity-check",
      title: "Toxicity & Hate Speech Detection",
      status: "passed",
      tags: ["Safe Language", "Professional Tone"],
      summary: "No harmful or offensive phrases detected in any section.",
      lastChecked: "3 hours ago",
      actions: [
        { label: "Module Logs", action: () => console.log("Module logs") }
      ]
    },
    {
      id: "sensitive-data",
      title: "Sensitive Data Leakage Prevention",
      status: "warning",
      tags: ["PII Risk", "Personal Name"],
      summary: "\"Dr. Sarah Jain from Bengaluru\" might reveal identity.",
      lastChecked: "4 hours ago",
      actions: [
        { label: "Mask Entity", action: () => console.log("Mask entity") },
        { label: "Confirm Context", action: () => console.log("Confirm context") }
      ]
    },
    {
      id: "tone-detection",
      title: "Inappropriate Tone Detection",
      status: "failed",
      tags: ["Overconfidence", "Aggressive Framing"],
      summary: "Detected tone mismatch in \"Conclusion\": overly assertive.",
      lastChecked: "5 hours ago",
      actions: [
        { label: "Suggest Softer Tone", action: () => console.log("Suggest softer tone") },
        { label: "Edit Phrase", action: () => console.log("Edit phrase") }
      ]
    },
    {
      id: "prompt-injection",
      title: "Prompt Injection Defense",
      status: "passed",
      tags: ["Injection Prevention", "Sanitized Input"],
      summary: "No unauthorized instructions or prompt injection found.",
      lastChecked: "6 hours ago",
      actions: [
        { label: "View Input Sanitation Logs", action: () => console.log("View logs") }
      ]
    },
    {
      id: "external-source",
      title: "External Source Verification",
      status: "warning",
      tags: ["Low Credibility", "Unverified Blog"],
      summary: "Reference to \"healthhacks.xyz\" may lack authority.",
      lastChecked: "7 hours ago",
      actions: [
        { label: "Replace Source", action: () => console.log("Replace source") },
        { label: "View Alternatives", action: () => console.log("View alternatives") },
        { label: "Accept Anyway", action: () => console.log("Accept anyway") }
      ]
    },
    {
      id: "safety-net",
      title: "SafetyNet Final Scan",
      status: "passed",
      tags: ["Safe Output", "No Critical Issues"],
      summary: "Full validation complete. No Trust & Safety violations found.",
      lastChecked: "8 hours ago",
      actions: [
        { label: "View Full Scan Log", action: () => console.log("View full scan log") }
      ]
    }
  ];

  const getStatusCount = (status: 'passed' | 'warning' | 'failed') => {
    return auditModules.filter(module => module.status === status).length;
  };

  const getFilteredModules = () => {
    let filtered = [...auditModules];
    
    if (selectedModule && selectedModule !== 'all') {
      const statusMap: Record<string, 'passed' | 'warning' | 'failed'> = {
        'passed': 'passed',
        'warning': 'warning',
        'failed': 'failed'
      };
      
      if (statusMap[selectedModule]) {
        filtered = filtered.filter(module => module.status === statusMap[selectedModule]);
      }
    }
    
    if (selectedTag && selectedTag !== 'all') {
      filtered = filtered.filter(module => 
        module.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
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

  const getTagColor = (tag: string) => {
    const tagColors: Record<string, string> = {
      'Bias': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'No Citation': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Claim Risk': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'APA Format': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      'Valid URLs': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Toxicity': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      'Safe Language': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'Untrusted Source': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Language Framing': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'Privacy': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
      'GDPR': 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      'Policy Risk': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      'SafetyNet': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    };
    
    return tagColors[tag] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#1E2330] to-[#1A1F2C] text-white">
      {/* Top header */}
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
        {/* Left Sidebar */}
        <div className="w-full lg:w-64 space-y-6">
          {/* Add Audit Agent Dropdown */}
          <div className="bg-[#2A2F3C] rounded-xl border border-gray-800/50 p-4 shadow-md">
            <AuditAgentDropdown onAgentChange={setSelectedAgent} />
          </div>

          <div className="bg-[#2A2F3C] rounded-xl border border-gray-800/50 p-4 shadow-md">
            <h2 className="font-bold text-white mb-3">Trust & Safety Modules</h2>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${selectedModule === 'all' ? 'bg-violet-500/20 text-violet-300' : 'text-gray-300'}`}
                onClick={() => setSelectedModule('all')}
              >
                All Modules
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${selectedModule === 'passed' ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-300'}`}
                onClick={() => setSelectedModule('passed')}
              >
                <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
                Passed ({getStatusCount('passed')})
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${selectedModule === 'warning' ? 'bg-amber-500/20 text-amber-300' : 'text-gray-300'}`}
                onClick={() => setSelectedModule('warning')}
              >
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-400" />
                Warning ({getStatusCount('warning')})
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${selectedModule === 'failed' ? 'bg-red-500/20 text-red-300' : 'text-gray-300'}`}
                onClick={() => setSelectedModule('failed')}
              >
                <XCircle className="h-4 w-4 mr-2 text-red-400" />
                Failed ({getStatusCount('failed')})
              </Button>
            </div>
          </div>

          <div className="bg-[#2A2F3C] rounded-xl border border-gray-800/50 p-4 shadow-md">
            <h2 className="font-bold text-white mb-3">Audit Tags</h2>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${selectedTag === 'all' ? 'bg-violet-500/20 text-violet-300' : 'text-gray-300'}`}
                onClick={() => setSelectedTag('all')}
              >
                All Tags
              </Button>
              {['Bias', 'Hallucination', 'Toxicity', 'PII', 'Policy Risk', 'SafetyNet'].map(tag => (
                <Button 
                  key={tag}
                  variant="ghost" 
                  className={`w-full justify-start ${selectedTag === tag.toLowerCase() ? 'bg-violet-500/20 text-violet-300' : 'text-gray-300'}`}
                  onClick={() => setSelectedTag(tag.toLowerCase())}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-[#2A2F3C] rounded-xl border border-gray-800/50 p-4 shadow-md">
            <h2 className="font-bold text-white mb-3">Audit Time Ranges</h2>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${selectedTimeRange === 'last-7-days' ? 'bg-violet-500/20 text-violet-300' : 'text-gray-300'}`}
                onClick={() => setSelectedTimeRange('last-7-days')}
              >
                Last 7 Days
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${selectedTimeRange === 'last-30-days' ? 'bg-violet-500/20 text-violet-300' : 'text-gray-300'}`}
                onClick={() => setSelectedTimeRange('last-30-days')}
              >
                Last 30 Days
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${selectedTimeRange === 'archived' ? 'bg-violet-500/20 text-violet-300' : 'text-gray-300'}`}
                onClick={() => setSelectedTimeRange('archived')}
              >
                Archived
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Top-Level Report Card */}
          <Card className="border-gray-800/50 bg-[#2A2F3C] shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-white">Research Content Audit</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge className={`${getTagColor('Research')}`}>Research</Badge>
                    <Badge className={`${getTagColor('SafetyNet')}`}>SafetyNet</Badge>
                    <Badge className={`${getTagColor('APA Format')}`}>Content</Badge>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-400">
                  <div>Created: 2025-04-17</div>
                  <div>Last Audited: Yesterday</div>
                  <div>Audit Agent: Gemini T&S</div>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" size="sm">
                <FileSearch className="h-4 w-4 mr-1" />
                Re-run Audit
              </Button>
              <Button variant="secondary" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                Export JSON
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download PDF
              </Button>
            </CardFooter>
          </Card>

          {/* Safety Audit Summary Card */}
          <Card className="border-gray-800/50 bg-[#2A2F3C] shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    <Shield className="h-5 w-5 inline-block mr-2 text-violet-400" />
                    Safety Audit Summary
                  </h3>
                  <div className="space-y-1 text-gray-300">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
                      <span className="text-white font-medium">{getStatusCount('passed')} / {auditModules.length} Modules Passed</span>
                    </div>
                    <div>Last Run: 2025-04-20 08:05:21</div>
                    <div>Audit Duration: 3.2s</div>
                    <div>Audit Agent: Gemini T&S</div>
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <Button variant="outline" size="sm">
                    <FileSearch className="h-4 w-4 mr-1" />
                    Audit History
                  </Button>
                  <Button variant="default" size="sm">
                    <FileText className="h-4 w-4 mr-1" />
                    Open Full Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFilteredModules().map(module => (
              <Card key={module.id} className="border-gray-800/50 bg-[#2A2F3C] shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-white flex items-center">
                      {getStatusIcon(module.status)}
                      <span className="ml-2">{module.title}</span>
                    </CardTitle>
                    <Badge className={getStatusColor(module.status)}>
                      {module.status.charAt(0).toUpperCase() + module.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {module.tags.map(tag => (
                      <Badge key={tag} className={getTagColor(tag)}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-gray-300">{module.summary}</p>
                  <p className="text-xs text-gray-500 mt-1">Last Checked: {module.lastChecked}</p>
                </CardContent>
                <CardFooter className="pt-0 flex flex-wrap gap-2">
                  {module.actions.map((action, idx) => (
                    <Button key={idx} variant="secondary" size="sm" onClick={action.action}>
                      {action.label}
                    </Button>
                  ))}
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Footer Action Bar */}
          <div className="sticky bottom-4 mt-auto">
            <Card className="border-gray-800/50 bg-[#2A2F3C]/90 backdrop-blur-sm shadow-md">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-violet-400" />
                  <span className="font-semibold">Final Actions:</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download Full Audit Report
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-1" />
                    Share Safety Summary
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileSearch className="h-4 w-4 mr-1" />
                    Trace Agent Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSafetyDashboard;
