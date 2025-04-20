
import React from 'react';
import { Card } from '@/components/ui/card';

const WhatYouCanBuildSection = () => {
  const cards = [{
    title: "Market Intelligence Dashboards",
    description: "Interactive, data-rich visual dashboards driven by insights."
  }, {
    title: "Investor & Board Reports",
    description: "Beautifully formatted, insight-packed boardroom-ready reports."
  }, {
    title: "Policy Briefs & Whitepapers",
    description: "Crisp, well-cited policy and research documents in minutes."
  }, {
    title: "Research Summaries with Citations",
    description: "Concise research digests with linked citation trails."
  }, {
    title: "Knowledge Graphs",
    description: "Auto-generated relationship graphs from raw documents."
  }, {
    title: "Natural Language Financial Queries",
    description: "Ask in plain English, get deep answers grounded in data."
  }, {
    title: "Auto Slides, Blogs & Copy",
    description: "Transform research into slides, blogs, press releases and more."
  }, {
    title: "Competitor & Sentiment Analysis",
    description: "Compare competitors, track tone, themes, and market mood."
  }, {
    title: "Smart Q&A",
    description: "Ask direct questions and receive grounded, sourced answers."
  }, {
    title: "Contact Directory Generation",
    description: "Structured people directories from public and social data."
  }, {
    title: "Digital Footprint Extraction",
    description: "See online presence and influence mapped into a single view."
  }];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-medium tracking-tight text-center md:text-left mb-8 text-violet-100">
        What You Can Build
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <button
            key={index}
            className="group text-left p-4 rounded-xl bg-[#2A2F3C]/60 border border-gray-800/30 backdrop-blur-sm transition-all duration-200 hover:bg-[#2A2F3C]/80 hover:border-violet-500/20"
          >
            <h3 className="font-medium text-sm text-violet-100 group-hover:text-violet-200 transition-colors opacity-80 group-hover:opacity-100">
              {card.title}
            </h3>
            <p className="mt-2 text-xs text-gray-400 group-hover:text-violet-200/70 transition-colors opacity-0 group-hover:opacity-100">
              {card.description}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default WhatYouCanBuildSection;
