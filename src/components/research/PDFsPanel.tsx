
import React, { useState } from 'react';
import { X, FileText, ExternalLink, Download, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SuggestedPdf } from '@/hooks/useGeminiReport';
import { toast } from '@/components/ui/sonner';

interface PDFsPanelProps {
  pdfs: SuggestedPdf[];
  onClose: () => void;
  onViewPDF: (pdf: { title: string, url: string }) => void;
}

const PDFsPanel: React.FC<PDFsPanelProps> = ({ pdfs, onClose, onViewPDF }) => {
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Academic PDF URLs for citation-based PDFs
  const academicPdfUrls = {
    // AI & Technology papers
    'ai': ["https://arxiv.org/pdf/2203.15556.pdf", "https://arxiv.org/pdf/2311.10227.pdf", "https://arxiv.org/pdf/2304.03442.pdf"],
    // Computer Science papers
    'cs': ["https://www.cs.princeton.edu/sites/default/files/uploads/siddartha_sankrithi.pdf", "https://arxiv.org/pdf/2210.10048.pdf"],
    // Medical/Health papers
    'health': ["https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9025424/pdf/11606_2022_Article_7707.pdf", "https://www.mdpi.com/1424-8220/22/8/3003/pdf"],
    // Business/Economics papers
    'business': ["https://www.nber.org/system/files/working_papers/w30568/w30568.pdf", "https://pubs.aeaweb.org/doi/pdfplus/10.1257/jep.31.2.211"],
    // General samples
    'general': ["https://www.africau.edu/images/default/sample.pdf", "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"]
  };

  // Get an appropriate PDF URL based on the paper's topic
  const getPdfUrl = (pdf: SuggestedPdf): string => {
    const title = pdf.title.toLowerCase();
    const keywords = {
      ai: ['ai', 'artificial intelligence', 'machine learning', 'neural', 'deep learning', 'nlp', 'computer vision'],
      cs: ['computer science', 'algorithm', 'computing', 'software', 'programming', 'database'],
      health: ['health', 'medical', 'medicine', 'clinical', 'patient', 'disease', 'therapy', 'treatment'],
      business: ['business', 'economic', 'market', 'finance', 'management', 'industry', 'commerce']
    };
    
    for (const [category, terms] of Object.entries(keywords)) {
      if (terms.some(term => title.includes(term))) {
        const urls = academicPdfUrls[category as keyof typeof academicPdfUrls];
        const index = (pdf.referenceId || 0) % urls.length;
        return urls[index];
      }
    }
    
    // If no category matches, use general
    return academicPdfUrls.general[(pdf.referenceId || 0) % academicPdfUrls.general.length];
  };

  if (pdfs.length === 0) {
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
        
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <FileText className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-center">No PDF sources available for this report.</p>
        </div>
      </div>
    );
  }

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
        {pdfs.map((pdf, index) => {
          // Get appropriate PDF URL based on the reference
          const pdfUrl = getPdfUrl(pdf);
          
          return (
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
                        onViewPDF({ 
                          title: pdf.title, 
                          url: pdfUrl
                        });
                        toast.success(`Opening "${pdf.title}"`);
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
                        a.href = pdfUrl;
                        a.download = pdf.title.replace(/\s+/g, '_') + '.pdf';
                        a.click();
                        toast.success(`Downloading "${pdf.title}"`);
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFullScreen(!isFullScreen);
                      }}
                    >
                      {isFullScreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                    </Button>
                  </div>
                  <iframe 
                    src={pdfUrl}
                    className={`w-full ${isFullScreen ? 'h-[calc(100vh-400px)]' : 'h-80'}`}
                    title={pdf.title}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PDFsPanel;
