
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, Image, Table, BookOpen, MessageSquare, Download, Share2, 
  ChevronRight, ExternalLink, Edit, Copy, Info, ChevronDown, Search, Send,
  FilePdf
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import CitationPopover from './CitationPopover';
import ImagePopover from './ImagePopover';
import TableDataView from './TableDataView';
import { mockReport, mockImages, mockReferences } from '@/data/mockData';

const samplePdfs = [
  {
    id: 1,
    title: "Impact of AI on Mental Health Treatment Outcomes",
    source: "Journal of Digital Psychiatry",
    date: "2024",
    pages: 12,
    url: "https://arxiv.org/pdf/2106.05358.pdf"
  },
  {
    id: 2,
    title: "Machine Learning Applications in Mental Healthcare",
    source: "AI in Medicine Quarterly",
    date: "2023",
    pages: 28,
    url: "https://arxiv.org/pdf/2212.04173.pdf"
  },
  {
    id: 3,
    title: "Ethical Considerations in AI-Powered Mental Health Tools",
    source: "Ethics in Healthcare Technology",
    date: "2024",
    pages: 15,
    url: "https://arxiv.org/pdf/2301.10700.pdf"
  }
];

interface DashboardState {
  query?: string;
  files?: string[];
  urls?: string[];
  useDocuments?: boolean;
  useWebSources?: boolean;
  useAcademic?: boolean;
  source?: string;
}

const ResearchDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as DashboardState || {};
  
  const [report, setReport] = useState<string>('');
  const [sections, setSections] = useState<{title: string; content: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<{question: string; answer: string}[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  
  useEffect(() => {
    if (!state.query && !state.files?.length && !state.urls?.length) {
      navigate('/');
      return;
    }
    
    const query = state.query || "Research topic";
    startGeneratingReport(query);
  }, [state, navigate]);
  
  const startGeneratingReport = (query: string) => {
    setReport('');
    setSections([]);
    setIsGenerating(true);
    setProgress(0);
    
    const totalSteps = 5;
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 800);
    
    setTimeout(() => {
      setSections(prev => [...prev, {
        title: "Executive Summary",
        content: mockReport.executiveSummary
      }]);
      setProgress(20);
    }, 2000);
    
    setTimeout(() => {
      setSections(prev => [...prev, {
        title: "Introduction",
        content: mockReport.introduction
      }]);
      setProgress(40);
    }, 4000);
    
    setTimeout(() => {
      setSections(prev => [...prev, {
        title: "Literature Review",
        content: mockReport.literatureReview
      }]);
      setProgress(60);
    }, 6000);
    
    setTimeout(() => {
      setSections(prev => [...prev, {
        title: "Impact Analysis",
        content: mockReport.impactAnalysis
      }]);
      setProgress(80);
    }, 8000);
    
    setTimeout(() => {
      setSections(prev => [...prev, {
        title: "Conclusions and Recommendations",
        content: mockReport.conclusions
      }]);
      setProgress(100);
      setIsGenerating(false);
      clearInterval(progressInterval);
    }, 10000);
  };
  
  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    const userQuestion = question.trim();
    setQuestion('');
    
    setHistory(prev => [...prev, { 
      question: userQuestion, 
      answer: 'Thinking...' 
    }]);
    
    setTimeout(() => {
      let response = '';
      
      if (userQuestion.toLowerCase().includes('compare') && 
          (userQuestion.toLowerCase().includes('europe') || userQuestion.toLowerCase().includes('us'))) {
        response = mockReport.comparison;
        
        setSections(prev => [...prev, {
          title: "Comparative Analysis: Europe vs US",
          content: mockReport.comparison
        }]);
        
        toast.success('Added new report section: Comparative Analysis');
      } else {
        response = "Based on the research, AI technologies have shown promising results in mental health applications. Studies indicate that AI-powered chatbots and cognitive behavioral therapy apps can provide accessible support for mild to moderate conditions. However, research also suggests that human oversight remains essential for clinical applications.";
      }
      
      setHistory(prev => 
        prev.map((item, i) => 
          i === prev.length - 1 
            ? { ...item, answer: response } 
            : item
        )
      );
    }, 3000);
  };
  
  const handleExport = (format: string) => {
    toast.success(`Report exported as ${format.toUpperCase()}`);
  };
  
  const handleShare = () => {
    toast.success('Sharable link copied to clipboard');
  };

  const handlePdfPreview = (pdfUrl: string, title: string) => {
    setPdfLoading(true);
    setSelectedPdf(pdfUrl);
    toast.info(`Loading PDF: ${title}`);
    setTimeout(() => setPdfLoading(false), 1000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const imageId = e.dataTransfer.getData('text/plain');
    if (imageId) {
      toast.success('Image added to the report');
    }
  };

  const closePdfViewer = () => {
    setSelectedPdf(null);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="w-64 border-r bg-white flex flex-col">
        <div className="p-4 border-b flex items-center space-x-2">
          <div className="rounded-md bg-primary/10 p-1">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <span className="font-medium">Z-Scout Report</span>
        </div>
        <Tabs defaultValue="report" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-6 px-4 py-2">
            <TabsTrigger value="report" className="flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="pdfs" className="flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="tables" className="flex items-center justify-center">
              <Table className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="figures" className="flex items-center justify-center">
              <Image className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="citations" className="flex items-center justify-center">
              <Info className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="threads" className="flex items-center justify-center">
              <MessageSquare className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="report" className="flex-1 flex flex-col p-0 m-0">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {sections.map((section, index) => (
                  <Button
                    key={index}
                    variant={activeSection === index ? "secondary" : "ghost"}
                    className="w-full justify-start text-left font-normal"
                    onClick={() => setActiveSection(index)}
                  >
                    <ChevronRight className={`h-4 w-4 mr-2 ${activeSection === index ? 'text-primary' : 'text-muted-foreground'}`} />
                    {section.title}
                  </Button>
                ))}
                
                {isGenerating && progress < 100 && (
                  <div className="p-2 text-sm text-muted-foreground animate-pulse">
                    Generating report...
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t space-y-2">
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleExport('pdf')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="figures" className="flex-1 flex flex-col p-0 m-0">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <h3 className="font-medium text-sm mb-2">Extracted Figures & Charts</h3>
                
                {mockImages.map((image, index) => (
                  <ImagePopover key={index} image={image} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="citations" className="flex-1 flex flex-col p-0 m-0">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <h3 className="font-medium text-sm mb-2">References</h3>
                
                {mockReferences.map((reference, index) => (
                  <div key={index} className="space-y-2">
                    <CitationPopover reference={reference} index={index} />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="pdfs" className="flex-1 p-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-lg font-medium mb-4">Source Documents</h3>
              <div className="grid gap-4">
                {samplePdfs.map((pdf) => (
                  <Card key={pdf.id} className="hover:bg-muted/50 transition-colors">
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="bg-muted p-2 rounded">
                            <FilePdf className="h-8 w-8 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <CardTitle className="text-base font-medium">
                              {pdf.title}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {pdf.source} • {pdf.date} • {pdf.pages} pages
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePdfPreview(pdf.url, pdf.title)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View PDF
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tables" className="flex-1 p-0 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <TableDataView activeTab="tables" />
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="threads" className="flex-1 p-4">
            <div className="text-center text-muted-foreground p-4">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Conversation threads</p>
              <p className="text-sm">(Demo feature)</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="flex-1 overflow-hidden flex flex-col">
        {isGenerating && (
          <div className="py-2 px-4 bg-muted">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-muted-foreground">Generating report...</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}
        
        {selectedPdf ? (
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center px-4 py-2 border-b">
              <h2 className="text-lg font-medium">PDF Viewer</h2>
              <Button variant="ghost" size="sm" onClick={closePdfViewer}>
                Close
              </Button>
            </div>
            {pdfLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading PDF...</p>
                </div>
              </div>
            ) : (
              <iframe 
                src={`${selectedPdf}#toolbar=1&navpanes=1`} 
                className="w-full h-full"
                title="PDF Viewer"
              />
            )}
          </div>
        ) : (
          <ScrollArea 
            className="flex-1"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="max-w-3xl mx-auto py-8 px-4">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">
                  {state.query || "Impact of AI on Mental Health Research"}
                </h1>
                <div className="flex items-center text-sm text-muted-foreground space-x-4">
                  <span>Generated {new Date().toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{sections.length} sections</span>
                  <span>•</span>
                  <span>{mockReferences.length} sources</span>
                </div>
              </div>
              
              {sections.length > 0 ? (
                <div className="space-y-8">
                  {sections.map((section, index) => (
                    <div 
                      key={index} 
                      id={`section-${index}`}
                      className={`space-y-4 ${index === sections.length - 1 && isGenerating ? 'animate-pulse' : ''}`}
                    >
                      <h2 className="text-2xl font-semibold">{section.title}</h2>
                      <div className="prose max-w-none">
                        {section.content.split('\n\n').map((paragraph, idx) => {
                          const citationRegex = /\[(\d+)\]/g;
                          const parts = [];
                          let lastIndex = 0;
                          let match;
                          
                          while ((match = citationRegex.exec(paragraph)) !== null) {
                            parts.push(paragraph.substring(lastIndex, match.index));
                            
                            const citationNumber = parseInt(match[1]);
                            parts.push(
                              <CitationPopover 
                                key={`${idx}-${citationNumber}`}
                                reference={mockReferences[citationNumber - 1] || mockReferences[0]} 
                                index={citationNumber - 1}
                                inline
                              />
                            );
                            
                            lastIndex = match.index + match[0].length;
                          }
                          
                          parts.push(paragraph.substring(lastIndex));
                          
                          return (
                            <p key={idx}>
                              {parts}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-12">
                  <div className="animate-pulse">Preparing your report...</div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
      
      <div className="w-96 border-l bg-white flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="rounded-md bg-primary/10 p-1">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <span className="font-medium">Ask Follow-up Questions</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowHistory(!showHistory)}
            className="h-8 w-8 p-0"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 flex flex-col">
          {showHistory && (
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <div key={index} className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg p-3 text-sm">
                          {item.question}
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 bg-primary/10">
                          <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
                        </Avatar>
                        <div className="bg-primary/5 rounded-lg p-3 text-sm">
                          {item.answer === 'Thinking...' ? (
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                              <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-150"></div>
                              <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-300"></div>
                              <span className="ml-1">Thinking...</span>
                            </div>
                          ) : (
                            <div>
                              {item.answer}
                              <div className="flex mt-2 gap-2">
                                <Button variant="outline" size="sm" className="h-7 text-xs">
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </Button>
                                <Button variant="outline" size="sm" className="h-7 text-xs">
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Ask questions about the report</p>
                    <p className="text-sm">Example: "Compare AI mental health interventions in Europe vs US"</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          
          <div className="p-4 border-t">
            <form onSubmit={handleQuestionSubmit} className="flex space-x-2">
              <Input
                type="text"
                placeholder="Ask a follow-up question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!question.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <Button variant="link" className="h-auto p-0 text-xs">
                <Search className="h-3 w-3 mr-1" />
                Search in report
              </Button>
              <Button variant="link" className="h-auto p-0 text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                Web search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchDashboard;
