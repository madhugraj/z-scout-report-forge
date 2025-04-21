
import React from 'react';
import { ArrowLeft, Clock, Zap, Lock, Database, Users, CreditCard, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

const ProPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    toast.info("Pro subscriptions coming soon! We'll notify you when available.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#1E2330] to-[#1A1F2C] text-white">
      <header className="w-full border-b border-gray-800/50 bg-black/10 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="h-8">
              <img src="/lovable-uploads/9e72d009-982d-437d-9caa-9403a11018b8.png" alt="Yavar Logo" className="h-full" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4 max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 mb-4">Coming Soon</Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent">
            Z Scout Pro
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Enhanced research capabilities for professionals and teams
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="bg-[#2A2F3C] border-gray-800 shadow-xl hover:border-violet-500/30 transition-colors">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-violet-900/30 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-violet-400" />
              </div>
              <CardTitle className="text-white">Extended Usage</CardTitle>
              <CardDescription className="text-gray-400">
                More research time, longer reports
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Unlimited research sessions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Extended report length (up to 20,000 words)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Priority processing for faster results</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-[#2A2F3C] border-gray-800 shadow-xl hover:border-violet-500/30 transition-colors">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-violet-900/30 rounded-full flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-violet-400" />
              </div>
              <CardTitle className="text-white">Advanced Data Sources</CardTitle>
              <CardDescription className="text-gray-400">
                Access premium research databases
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Academic journal integration</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Industry-specific databases</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Historical archives and datasets</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-[#2A2F3C] border-gray-800 shadow-xl hover:border-violet-500/30 transition-colors">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-violet-900/30 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-violet-400" />
              </div>
              <CardTitle className="text-white">Team Collaboration</CardTitle>
              <CardDescription className="text-gray-400">
                Work together seamlessly
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Real-time collaborative editing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Team workspaces with shared resources</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Role-based access controls</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-[#2A2F3C] border-gray-800 shadow-xl hover:border-violet-500/30 transition-colors">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-violet-900/30 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-violet-400" />
              </div>
              <CardTitle className="text-white">Advanced Features</CardTitle>
              <CardDescription className="text-gray-400">
                Professional research tools
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Custom citation formats (APA, MLA, Chicago)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Statistical analysis tools</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Data visualization exports</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-[#2A2F3C] border-gray-800 shadow-xl hover:border-violet-500/30 transition-colors">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-violet-900/30 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-violet-400" />
              </div>
              <CardTitle className="text-white">Enhanced Security</CardTitle>
              <CardDescription className="text-gray-400">
                Enterprise-grade protections
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Advanced XooG blockchain encryption</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Customizable Z-Grid trust thresholds</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Data retention policies</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-violet-900/30 border-violet-500/30 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-violet-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
              Recommended
            </div>
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-violet-700/50 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-violet-300" />
              </div>
              <CardTitle className="text-white">Premium Plan</CardTitle>
              <CardDescription className="text-gray-300">
                Complete Pro experience
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-lg font-bold text-white mb-4">
                <span className="opacity-75 line-through mr-2">$49.99</span>
                <span>$39.99</span>
                <span className="text-sm text-gray-400 ml-1">/month</span>
              </p>
              <p className="text-sm text-gray-300 mb-4">
                All Pro features included, plus:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-300 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Priority customer support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-300 mr-2 flex-shrink-0 mt-0.5" />
                  <span>White-labeled reports</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-300 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Early access to new features</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-white text-violet-900 hover:bg-gray-200" 
                onClick={handleSubscribe}
              >
                Subscribe Now
                <Badge className="bg-violet-500 text-white ml-2 text-xs">20% OFF</Badge>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <section className="bg-[#2A2F3C] rounded-xl border border-gray-800 p-8 shadow-xl mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Coming Soon to Pro</h2>
            <p className="text-gray-400">Exciting new features on our roadmap</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800/30 p-6 rounded-lg">
              <h3 className="font-medium text-white mb-2">Custom AI Models</h3>
              <p className="text-sm text-gray-400">Train domain-specific research assistants for your specialized field</p>
            </div>
            <div className="bg-gray-800/30 p-6 rounded-lg">
              <h3 className="font-medium text-white mb-2">API Access</h3>
              <p className="text-sm text-gray-400">Integrate Z Scout capabilities into your existing workflows and tools</p>
            </div>
            <div className="bg-gray-800/30 p-6 rounded-lg">
              <h3 className="font-medium text-white mb-2">Advanced Analytics</h3>
              <p className="text-sm text-gray-400">In-depth insights about your research patterns and productivity</p>
            </div>
          </div>
        </section>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Ready to transform your research?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/')} 
              className="bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-700 hover:to-violet-900 px-8"
            >
              Try Free Version
            </Button>
            <Button 
              onClick={handleSubscribe} 
              variant="outline"
              className="border-violet-500 text-violet-300 hover:bg-violet-500/10"
            >
              Join Pro Waitlist
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800/50 bg-black/10 backdrop-blur-sm mt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="text-right">
            <div className="text-sm text-gray-400">
              Copyright © 2025 Yavar techworks Pte Ltd., All rights reserved.
              <a href="https://www.yavar.ai/privacy-policy/" className="mx-2 text-violet-300 hover:text-violet-200 transition-colors" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
              •
              <a href="https://www.yavar.ai/terms-and-conditions/" className="mx-2 text-violet-300 hover:text-violet-200 transition-colors" target="_blank" rel="noopener noreferrer">
                Terms & Conditions
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProPage;
