
import React from "react";
import ResearchHeader from "../ResearchHeader";
import ResearchContent from "../ResearchContent";
import PDFsPanel from "../PDFsPanel";
import DataTablesPanel from "../DataTablesPanel";
import { ResearchImagePanel } from "../../ResearchImagePanel";
import { GeminiReport, ReportSection } from "@/hooks/useGeminiReport";

interface DashboardContentSwitcherProps {
  activeView: string;
  toggleSideView: (view: 'pdf-viewer' | 'images' | 'tables' | null) => void;
  activeSideView: 'pdf-viewer' | 'images' | 'tables' | null;
  report: GeminiReport;
  stateQuery: string;
  handleShareReport: () => void;
  setActiveView: (view: string) => void;
  setSelectedPdfForView: (pdf: {title: string, url: string} | null) => void;
}

const DashboardContentSwitcher: React.FC<DashboardContentSwitcherProps> = ({
  activeView,
  toggleSideView,
  activeSideView,
  report,
  stateQuery,
  handleShareReport,
  setActiveView,
  setSelectedPdfForView,
}) => {
  // Ensure all arrays in the report are defined, even if they're empty
  const safeReport = {
    ...report,
    sections: report.sections || [],
    references: report.references || [],
    suggestedPdfs: report.suggestedPdfs || [],
    suggestedImages: report.suggestedImages || [],
    suggestedDatasets: report.suggestedDatasets || []
  };

  return (
    <div className="max-w-4xl mx-auto p-8 pb-32">
      {activeView === 'full-report' && (
        <>
          <ResearchHeader 
            title={safeReport.title || stateQuery || "Research Report"}
            onToggleSideView={toggleSideView}
            activeSideView={activeSideView}
            onShare={handleShareReport}
          />
          <ResearchContent 
            sections={safeReport.sections} 
            references={safeReport.references}
            intermediateResults={safeReport.intermediateResults}
          />
        </>
      )}

      {activeView === 'pdf-viewer' && (
        <PDFsPanel 
          pdfs={safeReport.suggestedPdfs}
          onClose={() => setActiveView('full-report')}
          onViewPDF={setSelectedPdfForView}
        />
      )}
      {activeView === 'images' && (
        <ResearchImagePanel 
          images={safeReport.suggestedImages}
          onClose={() => setActiveView('full-report')}
        />
      )}
      {activeView === 'tables' && (
        <DataTablesPanel 
          datasets={safeReport.suggestedDatasets}
          onClose={() => setActiveView('full-report')}
        />
      )}
      {activeView === 'citations' && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Citations</h2>
          <div className="space-y-4">
            {safeReport.references.map((reference, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-800">
                  [{reference.id}] {reference.authors} ({reference.year}). <strong>{reference.title}</strong>. <em>{reference.journal}</em>.
                  {reference.url && (
                    <span> <a href={reference.url} className="text-violet-600 hover:underline" target="_blank" rel="noopener noreferrer">Link</a></span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardContentSwitcher;
