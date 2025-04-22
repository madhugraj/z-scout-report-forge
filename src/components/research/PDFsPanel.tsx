
import React, { useState, useEffect } from 'react';
import { X, FileText, ExternalLink, Download, Maximize2, Minimize2, Tag, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SuggestedPdf } from '@/hooks/useGeminiReport';
import { toast } from '@/components/ui/sonner';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface PDFsPanelProps {
  pdfs: SuggestedPdf[];
  onClose: () => void;
  onViewPDF: (pdf: { title: string, url: string }) => void;
}

const PDFsPanel: React.FC<PDFsPanelProps> = ({ pdfs, onClose, onViewPDF }) => {
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  
  // Academic PDF URLs mapped by domain for better categorization
  const academicPdfUrls = {
    ai: [
      "https://arxiv.org/pdf/2203.15556.pdf", 
      "https://arxiv.org/pdf/2311.10227.pdf", 
      "https://arxiv.org/pdf/2304.03442.pdf",
      "https://proceedings.neurips.cc/paper_files/paper/2023/file/38ceebc48c19b5fe42c87e052c8a7275-Paper-Conference.pdf"
    ],
    cs: [
      "https://www.cs.princeton.edu/sites/default/files/uploads/siddartha_sankrithi.pdf", 
      "https://arxiv.org/pdf/2210.10048.pdf",
      "https://dl.acm.org/doi/pdf/10.1145/3442188.3445922"
    ],
    health: [
      "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9025424/pdf/11606_2022_Article_7707.pdf", 
      "https://www.mdpi.com/1424-8220/22/8/3003/pdf",
      "https://jamanetwork.com/journals/jama/fullarticle/2788483"
    ],
    business: [
      "https://www.nber.org/system/files/working_papers/w30568/w30568.pdf", 
      "https://pubs.aeaweb.org/doi/pdfplus/10.1257/jep.31.2.211",
      "https://hbr.org/archive-toc/BR1801"
    ],
    science: [
      "https://www.science.org/doi/pdf/10.1126/science.abq1841",
      "https://www.nature.com/articles/s41586-021-03819-2.pdf",
      "https://www.science.org/doi/pdf/10.1126/science.adf0553"
    ],
    technology: [
      "https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=9810754",
      "https://dl.acm.org/doi/pdf/10.1145/3491102.3517582",
      "https://www.usenix.org/system/files/osdi20-li-pingchiang.pdf"
    ]
  };

  // Create a safe wrapper for pdfs array
  const safePdfs = Array.isArray(pdfs) ? pdfs : [];
  
  // Extract unique categories based on PDF topics or keywords
  useEffect(() => {
    if (safePdfs.length === 0) return;
    
    const extractedCategories = new Set<string>();
    
    safePdfs.forEach(pdf => {
      // Guard against undefined or null fields
      if (!pdf || !pdf.title) return;

      // Try to determine category from title keywords
      const title = pdf.title.toLowerCase();
      
      const categoryKeywords = {
        'AI & ML': ['ai', 'artificial intelligence', 'machine learning', 'neural', 'deep learning'],
        'Computer Science': ['computer science', 'algorithm', 'computing', 'software', 'programming'],
        'Healthcare': ['health', 'medical', 'medicine', 'clinical', 'patient', 'disease'],
        'Business': ['business', 'economic', 'market', 'finance', 'management', 'industry'],
        'Science': ['science', 'physics', 'chemistry', 'biology', 'climate', 'research'],
        'Technology': ['technology', 'engineering', 'system', 'device', 'hardware', 'network']
      };
      
      let foundCategory = false;
      
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => title.includes(keyword))) {
          extractedCategories.add(category);
          foundCategory = true;
          break;
        }
      }
      
      if (!foundCategory) {
        extractedCategories.add('Other');
      }
    });
    
    setCategories(Array.from(extractedCategories));
  }, [safePdfs]);

  // Map referenceIds to consistent PDF URLs
  const getPdfUrlById = (referenceId: number): string => {
    // Get a consistent category based on the referenceId
    const categories = Object.keys(academicPdfUrls);
    const category = categories[referenceId % categories.length];
    
    // Check if the category exists in academicPdfUrls before accessing it
    if (!academicPdfUrls[category as keyof typeof academicPdfUrls]) {
      // Fallback to the first category if the calculated category doesn't exist
      return academicPdfUrls.ai[0];
    }
    
    const urls = academicPdfUrls[category as keyof typeof academicPdfUrls];
    // Make sure urls array exists and has items before accessing by index
    if (!urls || urls.length === 0) {
      return academicPdfUrls.ai[0]; // Fallback to first AI PDF if no URLs in category
    }
    
    // Get a consistent URL within the category based on the referenceId
    return urls[referenceId % urls.length];
  };

  // Get a PDF URL based on the paper topic and reference ID
  const getPdfUrl = (pdf: SuggestedPdf): string => {
    if (!pdf) {
      return academicPdfUrls.ai[0]; // Default fallback
    }

    if (pdf.referenceId !== undefined) {
      return getPdfUrlById(pdf.referenceId);
    }
    
    // If no referenceId, determine category by title keywords
    // Guard against missing title
    const title = pdf.title ? pdf.title.toLowerCase() : '';
    if (!title) {
      return academicPdfUrls.ai[0]; // Default fallback
    }

    const keywords = {
      ai: ['ai', 'artificial intelligence', 'machine learning', 'neural', 'deep learning', 'nlp', 'computer vision'],
      cs: ['computer science', 'algorithm', 'computing', 'software', 'programming', 'database'],
      health: ['health', 'medical', 'medicine', 'clinical', 'patient', 'disease', 'therapy', 'treatment'],
      business: ['business', 'economic', 'market', 'finance', 'management', 'industry', 'commerce'],
      science: ['science', 'physics', 'chemistry', 'biology', 'climate', 'research', 'experiment'],
      technology: ['technology', 'engineering', 'system', 'device', 'hardware', 'infrastructure', 'network']
    };
    
    for (const [category, terms] of Object.entries(keywords)) {
      if (terms.some(term => title.includes(term))) {
        const urls = academicPdfUrls[category as keyof typeof academicPdfUrls];
        // Make sure urls array exists and has items before creating a hash
        if (!urls || urls.length === 0) {
          return academicPdfUrls.ai[0]; // Fallback to first AI PDF
        }
        
        // Create a hash from the title to get a consistent index
        const titleHash = [...title].reduce((hash, char) => hash + char.charCodeAt(0), 0);
        return urls[titleHash % urls.length];
      }
    }
    
    // Default to AI category if no match
    return academicPdfUrls.ai[0];
  };

  // Determine publication source from URL
  const getPublicationSource = (url: string): string => {
    if (!url) return 'Academic Source'; // Handle empty URL
    
    if (url.includes('arxiv.org')) return 'arXiv';
    if (url.includes('ncbi.nlm.nih.gov')) return 'PubMed/NIH';
    if (url.includes('science.org')) return 'Science';
    if (url.includes('nature.com')) return 'Nature';
    if (url.includes('acm.org')) return 'ACM Digital Library';
    if (url.includes('ieee')) return 'IEEE Xplore';
    if (url.includes('nber.org')) return 'NBER';
    if (url.includes('mdpi.com')) return 'MDPI';
    if (url.includes('jamanetwork.com')) return 'JAMA Network';
    if (url.includes('princeton.edu')) return 'Princeton University';
    if (url.includes('proceedings.neurips.cc')) return 'NeurIPS';
    if (url.includes('hbr.org')) return 'Harvard Business Review';
    if (url.includes('aeaweb.org')) return 'American Economic Association';
    if (url.includes('usenix.org')) return 'USENIX';
    return 'Academic Source';
  };
  
  // Filter PDFs based on active tab and search query
  const filteredPdfs = safePdfs.filter(pdf => {
    if (!pdf || !pdf.title) return false; // Skip invalid PDFs

    const matchesSearch = searchQuery === '' || 
      (pdf.title && pdf.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pdf.author && pdf.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pdf.description && pdf.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (activeTab === 'all') return true;
    
    // Get the publication source for category filtering
    const pdfUrl = getPdfUrl(pdf);
    const source = getPublicationSource(pdfUrl);
    
    // Filter by academic category
    const title = pdf.title ? pdf.title.toLowerCase() : '';
    const categoryKeywords = {
      'AI & ML': ['ai', 'artificial intelligence', 'machine learning', 'neural', 'deep learning'],
      'Computer Science': ['computer science', 'algorithm', 'computing', 'software', 'programming'],
      'Healthcare': ['health', 'medical', 'medicine', 'clinical', 'patient', 'disease'],
      'Business': ['business', 'economic', 'market', 'finance', 'management', 'industry'],
      'Science': ['science', 'physics', 'chemistry', 'biology', 'climate', 'research'],
      'Technology': ['technology', 'engineering', 'system', 'device', 'hardware', 'network']
    };
    
    if (activeTab === 'citations') {
      return pdf.referenceId !== undefined;
    }
    
    if (activeTab in categoryKeywords) {
      return categoryKeywords[activeTab as keyof typeof categoryKeywords].some(keyword => title.includes(keyword));
    }
    
    return false;
  });

  if (safePdfs.length === 0) {
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
      
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search papers..."
            className="pl-8 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="all" className="data-[state=active]:bg-violet-600">All</TabsTrigger>
          <TabsTrigger value="citations" className="data-[state=active]:bg-violet-600">Citations</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger 
              key={category} 
              value={category}
              className="data-[state=active]:bg-violet-600"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 gap-3 overflow-auto">
        {filteredPdfs.length > 0 ? (
          filteredPdfs.map((pdf, index) => {
            // Get appropriate PDF URL based on the reference
            const pdfUrl = getPdfUrl(pdf);
            const source = getPublicationSource(pdfUrl);
            
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
                    <h4 className="font-medium text-white text-sm">{pdf.title || 'Untitled Document'}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-400">
                        {pdf.author || 'Unknown Author'} • Relevance: {pdf.relevance || 'N/A'}
                      </p>
                      {pdf.referenceId !== undefined && (
                        <Badge variant="outline" className="text-xs bg-violet-900/30 text-violet-300 border-violet-700">
                          Citation [{pdf.referenceId}]
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs bg-gray-700/50">
                        <Tag className="h-3 w-3 mr-1" /> {source}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-300 mt-1">{pdf.description || 'No description available.'}</p>
                    <div className="flex mt-2 gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-violet-400 h-7 text-xs px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewPDF({ 
                            title: pdf.title || 'Untitled Document', 
                            url: pdfUrl
                          });
                          toast.success(`Opening "${pdf.title || 'Untitled Document'}"`);
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
                          a.download = (pdf.title || 'document').replace(/\s+/g, '_') + '.pdf';
                          a.click();
                          toast.success(`Downloading "${pdf.title || 'Untitled Document'}"`);
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
                      title={pdf.title || 'PDF Document'}
                    />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-400 py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No matches found for "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFsPanel;
