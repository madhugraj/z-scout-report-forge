
import React from 'react';
import { FileEdit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

interface ExternalEditorButtonProps {
  className?: string;
}

const ExternalEditorButton: React.FC<ExternalEditorButtonProps> = ({ className }) => {
  const handleOpenExternalEditor = () => {
    const supportedEditors = [
      { name: "Microsoft Office Online", url: "https://office.live.com/" },
      { name: "Google Docs", url: "https://docs.google.com/" },
      { name: "LibreOffice Online", url: "https://libreoffice.org/" }
    ];
    
    toast("Open in External Editor", {
      description: "This feature would integrate with external document editors."
    });
  };

  return (
    <Button 
      size="sm" 
      variant="secondary"
      onClick={handleOpenExternalEditor}
      className={className || "h-8 px-2"}
    >
      <FileEdit className="h-4 w-4 mr-2" />
      Open Editor
    </Button>
  );
};

export default ExternalEditorButton;
