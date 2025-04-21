
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, Search, Zap, Users, Database, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#1E2330] to-[#1A1F2C] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="mb-8 hover:bg-white/5 text-gray-400 hover:text-white group transition-all"
          >
            <ChevronLeft className="h-4 w-4 mr-2 text-violet-400 group-hover:text-violet-300" />
            Back to Home
          </Button>

          <h1 className="text-4xl font-bold tracking-tight text-balance mb-8 bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent">
            About Z Scout
          </h1>

          <div className="prose prose-lg prose-invert max-w-none">
            <p>
              Z Scout is an advanced AI-powered research assistant designed to transform the way researchers, students, professionals, and curious minds explore and analyze information. By combining cutting-edge AI technology with a commitment to accuracy and trustworthiness, Z Scout delivers comprehensive, well-cited research reports on virtually any topic.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-6 text-white">Our Mission</h2>
            <p>
              We believe that access to reliable, high-quality information should be effortless. Our mission is to democratize research capabilities, making it possible for anyone to quickly generate balanced, comprehensive analyses backed by trustworthy sources. Z Scout isn't just about finding information—it's about synthesizing knowledge and delivering actionable insights.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-6 text-white">Key Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white/5 p-6 rounded-xl border border-gray-800">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-violet-900/50">
                    <Search className="h-5 w-5 text-violet-300" />
                  </div>
                  <h3 className="text-xl font-medium ml-3">Smart Research</h3>
                </div>
                <p className="text-gray-300">
                  Ask any research question and receive a comprehensive, well-structured report synthesizing information from multiple reliable sources.
                </p>
              </div>

              <div className="bg-white/5 p-6 rounded-xl border border-gray-800">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-violet-900/50">
                    <Database className="h-5 w-5 text-violet-300" />
                  </div>
                  <h3 className="text-xl font-medium ml-3">Document Analysis</h3>
                </div>
                <p className="text-gray-300">
                  Upload your documents or provide web links to generate analyses grounded in your specific content and trusted external sources.
                </p>
              </div>

              <div className="bg-white/5 p-6 rounded-xl border border-gray-800">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-violet-900/50">
                    <Shield className="h-5 w-5 text-violet-300" />
                  </div>
                  <h3 className="text-xl font-medium ml-3">Trust & Safety</h3>
                </div>
                <p className="text-gray-300">
                  Our advanced Trust & Safety system ensures factual accuracy, balanced viewpoints, and proper attribution with comprehensive citations.
                </p>
              </div>

              <div className="bg-white/5 p-6 rounded-xl border border-gray-800">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-violet-900/50">
                    <Library className="h-5 w-5 text-violet-300" />
                  </div>
                  <h3 className="text-xl font-medium ml-3">Research Workspace</h3>
                </div>
                <p className="text-gray-300">
                  Organize all your research projects in one place with our intuitive workspace environment. Save, revisit, and build upon your past work.
                </p>
              </div>

              <div className="bg-white/5 p-6 rounded-xl border border-gray-800">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-violet-900/50">
                    <Users className="h-5 w-5 text-violet-300" />
                  </div>
                  <h3 className="text-xl font-medium ml-3">Collaboration</h3>
                </div>
                <p className="text-gray-300">
                  Work together with colleagues or classmates in real-time. Share reports, discuss findings, and collectively refine research outcomes.
                </p>
              </div>

              <div className="bg-white/5 p-6 rounded-xl border border-gray-800">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-violet-900/50">
                    <Zap className="h-5 w-5 text-violet-300" />
                  </div>
                  <h3 className="text-xl font-medium ml-3">XooG Encryption</h3>
                </div>
                <p className="text-gray-300">
                  Industry-leading blockchain-based encryption technology ensures your sensitive research remains secure when sharing with others.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-6 text-white">How It Works</h2>
            <p>
              Z Scout uses advanced natural language processing and a sophisticated research framework to analyze your query, retrieve relevant information from trusted sources, evaluate the credibility of each source, extract key insights, identify patterns and themes, and synthesize a comprehensive report. Each step is designed to ensure accuracy, relevance, and appropriate depth of analysis.
            </p>
            <p>
              Every report is generated with proper citations and references, ensuring that you can verify information and explore topics further. Our Trust & Safety features provide additional confidence in the quality and reliability of your research outcomes.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-6 text-white">Our Commitment</h2>
            <p>
              At Z Scout, we're committed to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li><span className="text-white font-medium">Accuracy</span> — Ensuring information is factual and up-to-date</li>
              <li><span className="text-white font-medium">Balance</span> — Presenting multiple perspectives on complex topics</li>
              <li><span className="text-white font-medium">Transparency</span> — Clearly citing sources and explaining methodologies</li>
              <li><span className="text-white font-medium">Privacy</span> — Protecting your data and research with industry-leading security</li>
              <li><span className="text-white font-medium">Accessibility</span> — Making advanced research capabilities available to everyone</li>
            </ul>

            <div className="mt-12 pt-8 border-t border-gray-800">
              <p className="text-center text-gray-400">
                Z Scout is a product of Yavar techworks Pte Ltd. © 2025 All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
