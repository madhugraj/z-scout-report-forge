
import React, { useState } from 'react';
import { X, FileText, ExternalLink, Download, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SuggestedPdf } from '@/hooks/useGeminiReport';

interface PDFsPanelProps {
  pdfs: SuggestedPdf[];
  onClose: () => void;
  onViewPDF: (pdf: { title: string, url: string }) => void;
}

const PDFsPanel: React.FC<PDFsPanelProps> = ({ pdfs, onClose, onViewPDF }) => {
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Mock URLs for demo purposes
  const mockPdfUrls = [
    "https://www.africau.edu/images/default/sample.pdf",
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  ];

  return (
    <div className="flex flex-col h-full bg-[#1A1F2C] text-white p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Source PDFs</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 overflow-auto">
        {pdfs.map((pdf, index) => (
          <div 
            key={index} 
            className={`bg-[#2A2F3C] p-3 rounded-lg border ${selectedPdf === pdf.title ? 'border-violet-500' : 'border-gray-800'} cursor-pointer hover:border-violet-400 transition-colors`}
            onClick={() => setSelectedPdf(pdf.title)}
          >
            <div className="flex items-start gap-2">
              <div className="bg-gray-800 p-1.5 rounded">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white text-sm">{pdf.title}</h4>
                <p className="text-xs text-gray-400">
                  {pdf.author} • Relevance: {pdf.relevance}
                  {pdf.referenceId && <span> • Citation [{pdf.referenceId}]</span>}
                </p>
                <p className="text-xs text-gray-300 mt-1">{pdf.description}</p>
                <div className="flex mt-2 gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-violet-400 h-7 text-xs px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      // For demo purposes, use a mock URL
                      onViewPDF({ 
                        title: pdf.title, 
                        url: mockPdfUrls[index % mockPdfUrls.length] 
                      });
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-violet-400 h-7 text-xs px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      const a = document.createElement('a');
                      // For demo purposes, use a mock URL
                      a.href = mockPdfUrls[index % mockPdfUrls.length];
                      a.download = pdf.title.replace(/\s+/g, '_') + '.pdf';
                      a.click();
                    }}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
            {selectedPdf === pdf.title && (
              <div className="mt-3 bg-gray-900 rounded-lg overflow-hidden relative">
                <div className="absolute top-2 right-2 z-10 flex gap-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6 bg-gray-800 border-gray-700"
                    onClick={() => setIsFullScreen(!isFullScreen)}
                  >
                    {isFullScreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                  </Button>
                </div>
                <iframe 
                  src={mockPdfUrls[index % mockPdfUrls.length]} 
                  className={`w-full ${isFullScreen ? 'h-[calc(100vh-400px)]' : 'h-80'}`}
                  title={pdf.title}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFsPanel;
