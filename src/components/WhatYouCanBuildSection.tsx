
import React from 'react';

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
  }];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-2xl font-bold tracking-tight text-balance bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent mb-8 text-center">
        What You Can Build
      </h2>
      <p className="text-gray-300 mb-12 max-w-3xl text-center text-xs">
        From intelligent dashboards to executive-ready documents — Z Scout builds everything you need from your research, data, or queries.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="p-6 rounded-2xl bg-[#2A2F3C]/80 border border-gray-800/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
          >
            <h3 className="font-semibold text-lg text-white">{card.title}</h3>
            <p className="mt-2 text-sm text-gray-400">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhatYouCanBuildSection;
