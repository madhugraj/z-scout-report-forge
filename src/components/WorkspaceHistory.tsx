import React from 'react';
import { Clock, Filter, ChevronRight, Tag, MoreHorizontal, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

const WorkspaceHistory: React.FC = () => {
  const navigate = useNavigate();

  const researchHistory = [
    {
      id: 1,
      title: "Impact of AI on Mental Health Research",
      date: "2025-04-17",
      tags: ["AI & Health", "Mental Health", "Research"],
      lastUpdated: "Yesterday",
    },
    {
      id: 2,
      title: "Climate Change Adaptation Strategies",
      date: "2025-04-15",
      tags: ["Climate", "Adaptation", "Policy"],
      lastUpdated: "3 days ago",
    },
    {
      id: 3,
      title: "Quantum Computing Applications in Drug Discovery",
      date: "2025-04-10",
      tags: ["Quantum", "Pharma", "Technology"],
      lastUpdated: "1 week ago",
    },
    {
      id: 4,
      title: "Sustainable Urban Development Models",
      date: "2025-04-05",
      tags: ["Urban", "Sustainability", "Planning"],
      lastUpdated: "2 weeks ago",
    },
    {
      id: 5,
      title: "Neural Interfaces for Accessibility",
      date: "2025-03-28",
      tags: ["Neuroscience", "Accessibility", "Technology"],
      lastUpdated: "3 weeks ago",
    },
  ];

  const handleRegenerate = (id: number) => {
    toast.success(`Regenerating report #${id}`);
    setTimeout(() => {
      navigate('/dashboard', { 
        state: { 
          query: researchHistory.find(r => r.id === id)?.title,
          source: 'history'
        } 
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#1E2330] to-[#1A1F2C] text-white">
      <div className="container max-w-6xl py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent">Research Workspace</h1>
            <p className="text-gray-300">
              Your research memory, versioned and always within reach
            </p>
          </div>
        </div>

        <div className="flex space-x-6">
          <div className="w-64 space-y-6">
            <Card className="border-gray-800 bg-[#2A2F3C]/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center text-white">
                  <Clock className="h-4 w-4 mr-2 text-violet-400" />
                  Recent Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1 pb-3">
                <Button variant="ghost" className="w-full justify-start font-normal text-gray-300 hover:text-white hover:bg-white/5">All Reports</Button>
                <Button variant="ghost" className="w-full justify-start font-normal text-gray-300 hover:text-white hover:bg-white/5">Last 7 Days</Button>
                <Button variant="ghost" className="w-full justify-start font-normal text-gray-300 hover:text-white hover:bg-white/5">Last 30 Days</Button>
                <Button variant="ghost" className="w-full justify-start font-normal text-gray-300 hover:text-white hover:bg-white/5">Archived</Button>
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-[#2A2F3C]/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center text-white">
                  <Tag className="h-4 w-4 mr-2 text-violet-400" />
                  Research Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1 pb-3">
                <Button variant="ghost" className="w-full justify-start font-normal hover:bg-white/5">
                  <Badge variant="outline" className="mr-2 bg-blue-900/30 text-blue-300 border-blue-800">AI & Health</Badge>
                  <span className="text-gray-400 ml-auto">3</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start font-normal hover:bg-white/5">
                  <Badge variant="outline" className="mr-2 bg-green-900/30 text-green-300 border-green-800">Climate</Badge>
                  <span className="text-gray-400 ml-auto">2</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start font-normal hover:bg-white/5">
                  <Badge variant="outline" className="mr-2 bg-purple-900/30 text-purple-300 border-purple-800">Technology</Badge>
                  <span className="text-gray-400 ml-auto">5</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start font-normal hover:bg-white/5">
                  <Badge variant="outline" className="mr-2 bg-amber-900/30 text-amber-300 border-amber-800">Policy</Badge>
                  <span className="text-gray-400 ml-auto">1</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start font-normal text-violet-400 hover:text-violet-300 hover:bg-white/5">
                  View all tags...
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative w-64">
                  <Input
                    type="text"
                    placeholder="Search research..."
                    className="pl-10"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
              <Button onClick={() => navigate('/')}>
                New Research
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="space-y-4 pr-4">
                {researchHistory.map((item) => (
                  <Card key={item.id} className="hover:border-violet-500/50 transition-colors border-gray-800 bg-[#2A2F3C]/80 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-72">
                            <DropdownMenuLabel>Project Metrics</DropdownMenuLabel>
                            <DropdownMenuItem className="flex flex-col items-start p-4">
                              <div className="grid grid-cols-2 gap-4 w-full text-sm">
                                <div>
                                  <p className="text-gray-400">References</p>
                                  <p className="font-medium">24 sources</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Files</p>
                                  <p className="font-medium">12 PDFs, 8 images</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Collaborators</p>
                                  <p className="font-medium">5 active members</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Duration</p>
                                  <p className="font-medium">2 weeks</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Edits</p>
                                  <p className="font-medium">156 revisions</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Feedback</p>
                                  <p className="font-medium">4.8/5.0 (12)</p>
                                </div>
                              </div>
                              <div className="mt-4 w-full">
                                <p className="text-gray-400 mb-2">Key Insights</p>
                                <ul className="text-sm space-y-1">
                                  <li>• 78% positive sentiment in research findings</li>
                                  <li>• High correlation with recent studies (0.92)</li>
                                  <li>• Featured in 3 academic citations</li>
                                </ul>
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleRegenerate(item.id)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Regenerate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Clock className="h-4 w-4 mr-2" />
                              View Version History
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex space-x-2 mb-2">
                        {item.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="bg-primary/10">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created: {item.date} • Last updated: {item.lastUpdated}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="flex justify-between w-full">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRegenerate(item.id)}
                          className="border-gray-700 text-gray-300 hover:text-white hover:bg-white/5"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => {
                            navigate('/dashboard', { 
                              state: { 
                                query: item.title,
                                source: 'history'
                              } 
                            });
                          }}
                          className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800"
                        >
                          <span>View Report</span>
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 left-4 right-4 flex justify-center z-50">
        <div className="text-sm text-gray-300 text-center backdrop-blur-sm bg-black/30 px-6 py-3 rounded-full shadow-lg border border-gray-800/20">
          Copyright © 2025 Yavar techworks Pte Ltd., All rights reserved. 
          <a 
            href="https://www.yavar.ai/privacy-policy/" 
            className="mx-2 text-violet-300 hover:text-violet-200 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
          •
          <a 
            href="https://www.yavar.ai/terms-and-conditions/" 
            className="mx-2 text-violet-300 hover:text-violet-200 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms & Conditions
          </a>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceHistory;
