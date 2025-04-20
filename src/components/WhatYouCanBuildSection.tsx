
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { toast } from "@/components/ui/sonner";

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

  const handleCardClick = (title: string) => {
    toast("Feature Integration", {
      description: `${title} feature integration is in progress...`,
      duration: 3000,
    });
  };

  return (
    <section className="w-full max-w-[95rem] mx-auto px-12 py-12">
      <h2 className="text-2xl font-medium tracking-tight text-center md:text-left mb-8 bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent">
        What You Can Build
      </h2>
      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {cards.map((card, index) => (
              <CarouselItem key={index} className="pl-4 basis-[280px] md:basis-[320px]">
                <button
                  onClick={() => handleCardClick(card.title)}
                  className="w-full h-full text-left p-4 rounded-xl bg-[#181B2C]/90 backdrop-blur-sm border border-gray-800/30 
                    transition-all duration-300 hover:border-violet-500/30 hover:shadow-[0_0_10px_rgba(139,92,246,0.15)] 
                    group cursor-pointer"
                >
                  <h3 className="font-medium text-sm text-violet-100 group-hover:text-violet-200 transition-colors mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs text-gray-400 group-hover:text-violet-200/70 transition-colors">
                    {card.description}
                  </p>
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-8 bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/30" />
          <CarouselNext className="hidden md:flex -right-8 bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/30" />
        </Carousel>
      </div>
    </section>
  );
};

export default WhatYouCanBuildSection;
