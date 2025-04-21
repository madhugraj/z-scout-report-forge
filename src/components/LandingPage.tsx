
import React, { useState, useRef } from 'react';
import { Search, Globe, GraduationCap, Mic, CloudUpload, FolderUp, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import WhatYouCanBuildSection from './WhatYouCanBuildSection';
import LandingHeader from './LandingHeader';
import PopularResearchTopics from './PopularResearchTopics';
import { useNavigate } from 'react-router-dom';

const topicReports: Record<string, string> = {
  "How is AI transforming mental health research and interventions? Provide an overview and significant trends.": 
`**AI in Mental Health Research:**

Artificial Intelligence (AI) is revolutionizing mental health through accelerated diagnostics, personalized treatments, and advanced research:
- *Diagnostics & Screening*: AI-driven tools such as chatbots and screening platforms efficiently identify mental health conditions by analyzing speech and text patterns.
- *Personalized Treatment*: Machine learning tailors interventions to individuals by predicting treatment responses and adjusting care plans dynamically.
- *Big Data & Trend Analysis*: AI analyzes vast datasets to identify trends, risk factors, and intervention outcomes, improving large-scale public health approaches.
*Significant Trends*: Integration of AI in teletherapy, real-time crisis response, and stigma reduction programs is making mental health care more proactive, scalable, and inclusive.`,

  "Summarize the latest findings on climate change impact analysis, focusing on risk factors and adaptation.":
`**Climate Change Impact Analysis:**

Leading scientific reports indicate:
- *Risk Factors*: Rising temperatures, extreme weather events, and sea-level rise continue to threaten vulnerable communities, agriculture, and biodiversity.
- *Socio-Economic Consequences*: Displacement, food insecurity, and public health crises are intensifying as climate risks grow.
- *Adaptation Strategies*: Recent findings highlight the success of climate-resilient infrastructure, green energy transitions, and community-driven mitigation and adaptation initiatives.
Global collaboration, technological adaptation, and strong policy action remain essential to manage future climate risks effectively.`,

  "Explain key applications and advancements in quantum computing and their industry adoption.":
`**Quantum Computing Applications & Advancements:**

Quantum computing is making groundbreaking strides:
- *Key Applications*: Quantum algorithms are being used for cryptography, complex simulations in chemistry and material science, financial modeling, and logistics optimization.
- *Industry Adoption*: Companies like IBM, Google, and D-Wave are rapidly advancing hardware and expanding cloud-based quantum computing platforms accessible to researchers and enterprises.
- *Recent Advancements*: Error correction improvements, scalable architectures, and hybrid classical-quantum workflows are accelerating real-world adoption.
The next wave of quantum advantage is expected to transform industries reliant on high-performance computing and secure data processing.`,
};

const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  // Tooltip is now shown only on hover (disabled persistent auto-show)
  const [showFeatureTooltip, setShowFeatureTooltip] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      navigate('/dashboard', {
        state: {
          query: searchQuery,
          source: 'search'
        }
      });
    }, 1200);
  };

  const handleUpload = (type: 'drive' | 'computer' | 'url') => {
    navigate('/upload', { state: { uploadType: type } });
  };
  const handleWorkspaceClick = () => navigate('/workspace');
  const handleTrustSafetyClick = () => navigate('/trust-safety');
  const handleAboutClick = () => navigate('/about');
  const handleProClick = () => navigate('/pro');

  const showFeaturedResearch = (query: string) => {
    setSearchQuery(query);
    setTimeout(() => handleSubmit({ preventDefault: () => { } } as React.FormEvent), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#1E2330] to-[#1A1F2C] text-white flex flex-col">
      <LandingHeader
        showSignIn={showSignIn}
        setShowSignIn={setShowSignIn}
        showFeatureTooltip={showFeatureTooltip}
        handleTrustSafetyClick={handleTrustSafetyClick}
        handleWorkspaceClick={handleWorkspaceClick}
        handleAboutClick={handleAboutClick}
        handleProClick={handleProClick}
      />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-3xl mx-auto space-y-8 text-center">
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-balance bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent sm:text-3xl">
              Z Scout - The research assistant you always needed
            </h1>
            <p className="max-w-2xl mx-auto text-balance text-md font-light text-gray-300">
              Just upload documents or reference live links, or ask, and get intelligent, cited answers grounded in your documents and trusted sources.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="w-full" onClick={() => setShowUploadOptions(false)}>
            <div className="relative rounded-xl border border-gray-800 bg-[#2A2F3C]/80 backdrop-blur-sm shadow-lg transition-colors focus-within:border-violet-500">
              <Input
                type="text"
                placeholder="Ask a question or search your documents..."
                className="pl-12 pr-24 py-7 text-lg border-0 focus-visible:ring-0 rounded-xl bg-transparent text-white placeholder:text-gray-500"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="hover:bg-white/5 text-gray-400 hover:text-violet-400 relative"
                  onClick={e => {
                    e.stopPropagation();
                    setShowUploadOptions(!showUploadOptions);
                  }}
                  onMouseEnter={() => setShowFeatureTooltip(true)}
                  onMouseLeave={() => setShowFeatureTooltip(false)}
                >
                  <CloudUpload className="h-5 w-5" />
                  {showFeatureTooltip && (
                    <span className="absolute -top-10 whitespace-nowrap bg-violet-900 text-white text-xs py-1 px-2 rounded animate-bounce z-20">
                      Upload documents here
                    </span>
                  )}
                </Button>
                <Button type="button" size="icon" disabled={isGenerating} className="bg-gradient-to-r from-violet-600/80 to-violet-700/80 hover:from-violet-600 hover:to-violet-700 text-white border-none">
                  <Mic className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </form>
          <PopularResearchTopics onSelectTopic={showFeaturedResearch} />
        </div>
      </main>
      <WhatYouCanBuildSection />
      <footer className="border-t border-gray-800/50 bg-black/10 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 h-16 flex items-center justify-end text-sm text-gray-400">
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

export default LandingPage;
