
import React from 'react';

const AboutPage = () => (
  <div className="max-w-3xl mx-auto py-16 px-6 text-white">
    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent mb-6">About Z Scout</h1>
    <p className="mb-4 text-lg">
      <b>Z Scout</b> is your intelligent research assistant, designed to streamline research, knowledge curation, and insight generation for individuals and teams. Our platform brings together document uploads, web reference extraction, advanced search, and <b>cited answers</b> in one simple interface.
    </p>
    <ul className="list-disc pl-6 mb-4 text-base">
      <li><b>Flexible Research Modes:</b> Ask questions, upload documents, or cite reference links. Z Scout understands your workflow.</li>
      <li><b>Automatic Reports & Dashboards:</b> Instantly generate well-cited research reports, summaries, tables, and discussion threads.</li>
      <li><b>Collaboration:</b> Invite colleagues to contribute, annotate, and export insights into slides, knowledge graphs, or executive summaries.</li>
      <li><b>Workspace & Project Management:</b> Organize research by workspace, track project history, and revisit previous reports.</li>
      <li><b>Trust & Safety (Z-Grid):</b> Advanced encryption, audit trails, and compliance integrations ensure your research is safe, ethical, and privacy-respecting.</li>
      <li><b>Pro Features:</b> Advanced analytics, team controls, and best-in-class export tools available soon!</li>
    </ul>
    <div className="border-t border-gray-700 mt-12 pt-6 text-gray-400 text-sm">
      <b>Navigation:</b>  
      <ul className="list-disc pl-5 mt-2">
        <li><b>Home</b>: Start new research, popular topics, upload docs, or ask questions</li>
        <li><b>Workspace</b>: Access all projects and history</li>
        <li><b>Z-Grid (Trust & Safety)</b>: Manage privacy, encryption, and compliance</li>
        <li><b>Pro</b>: Explore upcoming advanced features</li>
        <li><b>Share & Export</b>: Encrypt, export, or collaborate in real-time</li>
      </ul>
      <p className="mt-4">Security and Trust remain at the heart of Z Scout. Every report and export option offers enhanced safety and control for you and your organization.</p>
    </div>
  </div>
);

export default AboutPage;
