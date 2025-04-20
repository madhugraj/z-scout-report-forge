
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
  }];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-semibold tracking-tight text-center md:text-left mb-8 text-white">
        What You Can Build
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <button
            key={index}
            className="text-left p-6 rounded-2xl bg-[#2A2F3C]/80 border border-gray-800/50 backdrop-blur-sm transition-all duration-200 hover:bg-[#2A2F3C] hover:border-gray-700/50 hover:shadow-lg group"
          >
            <h3 className="font-semibold text-lg text-white group-hover:text-violet-200 transition-colors">
              {card.title}
            </h3>
            <p className="mt-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              {card.description}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default WhatYouCanBuildSection;
