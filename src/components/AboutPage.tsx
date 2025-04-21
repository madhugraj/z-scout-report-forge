
import React from 'react';
import { ArrowLeft, Award, Book, GraduationCap, ArrowRight, Clock, Shield, Code, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

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

      <main className="container mx-auto py-12 px-4 max-w-5xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent">
            About Z Scout
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            The next generation research assistant that transforms how you explore, analyze, and synthesize information
          </p>
        </div>

        <div className="space-y-16">
          <section className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-block p-2 bg-violet-900/30 rounded-lg mb-2">
                <Search className="h-6 w-6 text-violet-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Intelligent Research Platform</h2>
              <p className="text-gray-300">
                Z Scout uses advanced AI to help researchers, students, and professionals access, analyze, and synthesize information across multiple sources in seconds, not hours or days.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-violet-400 mr-2">•</span>
                  <span>Upload documents or reference live links</span>
                </li>
                <li className="flex items-start">
                  <span className="text-violet-400 mr-2">•</span>
                  <span>Ask questions in natural language</span>
                </li>
                <li className="flex items-start">
                  <span className="text-violet-400 mr-2">•</span>
                  <span>Receive comprehensive, properly cited research reports</span>
                </li>
              </ul>
            </div>
            <div className="bg-[#2A2F3C] p-6 rounded-xl border border-gray-800 shadow-xl">
              <div className="aspect-video bg-gray-800/50 rounded-lg flex items-center justify-center mb-4">
                <Book className="h-12 w-12 text-gray-600" />
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-700/50 rounded-full w-full"></div>
                <div className="h-4 bg-gray-700/50 rounded-full w-3/4"></div>
                <div className="h-4 bg-gray-700/50 rounded-full w-5/6"></div>
              </div>
            </div>
          </section>

          <Separator className="bg-gray-800/50" />

          <section className="grid md:grid-cols-2 gap-8 items-center">
            <div className="bg-[#2A2F3C] p-6 rounded-xl border border-gray-800 shadow-xl order-last md:order-first">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-violet-900/30 rounded-full flex items-center justify-center mb-2">
                    <Shield className="h-6 w-6 text-violet-400" />
                  </div>
                  <span className="text-sm text-gray-400">Trust & Safety</span>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-indigo-900/30 rounded-full flex items-center justify-center mb-2">
                    <Code className="h-6 w-6 text-indigo-400" />
                  </div>
                  <span className="text-sm text-gray-400">Citation Integrity</span>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                    <GraduationCap className="h-6 w-6 text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-400">Academic Quality</span>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-emerald-900/30 rounded-full flex items-center justify-center mb-2">
                    <Clock className="h-6 w-6 text-emerald-400" />
                  </div>
                  <span className="text-sm text-gray-400">Time Saving</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="inline-block p-2 bg-violet-900/30 rounded-lg mb-2">
                <Shield className="h-6 w-6 text-violet-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Z-Grid: Trust & Safety Built In</h2>
              <p className="text-gray-300">
                Z Scout's Z-Grid technology ensures ethical AI use, with industry-leading trust and safety features built right into the core of our platform.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-violet-400 mr-2">•</span>
                  <span>Automated bias detection and mitigation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-violet-400 mr-2">•</span>
                  <span>Citation integrity verification</span>
                </li>
                <li className="flex items-start">
                  <span className="text-violet-400 mr-2">•</span>
                  <span>Factual consistency checking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-violet-400 mr-2">•</span>
                  <span>XooG blockchain encryption for secure sharing</span>
                </li>
              </ul>
            </div>
          </section>

          <Separator className="bg-gray-800/50" />

          <section className="text-center">
            <div className="inline-block p-2 bg-violet-900/30 rounded-lg mb-4">
              <Award className="h-6 w-6 text-violet-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-6">Start Your Research Journey Today</h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-8">
              Join thousands of researchers, students, and professionals who are transforming their research process with Z Scout.
            </p>
            <Button 
              onClick={() => navigate('/')} 
              className="bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-700 hover:to-violet-900 px-8 py-6 text-lg"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </section>
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

export default AboutPage;
