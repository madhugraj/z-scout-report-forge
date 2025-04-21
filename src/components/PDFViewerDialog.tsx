
import React from 'react';
import { X, Download, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PDFViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  pdfUrl?: string; // Make pdfUrl optional
}

const PDFViewerDialog: React.FC<PDFViewerDialogProps> = ({ 
  isOpen, 
  onClose, 
  title = 'PDF Document',
  pdfUrl = 'https://www.africau.edu/images/default/sample.pdf' // Provide default value
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-white max-h-[90vh] flex flex-col p-0 gap-0 border-0">
        <div className="p-4 flex items-center justify-between border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-9 w-9"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                const a = document.createElement('a');
                a.href = pdfUrl;
                a.download = title.replace(/\s+/g, '_') + '.pdf';
                a.click();
              }}
              className="h-9 w-9"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => window.open(pdfUrl, '_blank')}
              className="h-9 w-9"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={onClose}
              className="h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className={`w-full ${isFullscreen ? 'h-[80vh]' : 'h-[70vh]'} overflow-hidden`}>
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title={title}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewerDialog;
