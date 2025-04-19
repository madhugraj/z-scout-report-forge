
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Download, Maximize2, Minimize2 } from 'lucide-react';

interface PDFViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pdf: {
    title: string;
    url: string;
  };
}

const PDFViewerDialog = ({ isOpen, onClose, pdf }: PDFViewerDialogProps) => {
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{pdf.title}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsFullScreen(!isFullScreen)}
            >
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                const a = document.createElement('a');
                a.href = pdf.url;
                a.download = pdf.title.replace(/\s+/g, '_') + '.pdf';
                a.click();
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="mt-4 flex-1 min-h-0">
          <iframe 
            src={pdf.url} 
            className={`w-full h-full rounded-lg ${isFullScreen ? 'h-[calc(100vh-200px)]' : 'h-[60vh]'}`}
            title={pdf.title}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewerDialog;
