
import React, { useState } from 'react';
import { FileEdit, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ExternalEditorButtonProps {
  className?: string;
}

const ExternalEditorButton: React.FC<ExternalEditorButtonProps> = ({ className }) => {
  const [open, setOpen] = useState(false);
  
  const supportedEditors = [
    { name: "Microsoft Office Online", url: "https://office.live.com/", icon: "📝" },
    { name: "Google Docs", url: "https://docs.google.com/", icon: "📄" },
    { name: "LibreOffice Online", url: "https://libreoffice.org/", icon: "📋" }
  ];
  
  const handleOpenExternalEditor = (url: string, name: string) => {
    window.open(url, '_blank');
    toast("External editor opened", {
      description: `${name} opened in a new window`
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="secondary"
          className={className || "h-8 px-2"}
        >
          <FileEdit className="h-4 w-4 mr-2" />
          Open Editor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#2A2F3C] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>External Editors</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose an external editor to continue working on this document.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {supportedEditors.map((editor) => (
            <Button
              key={editor.name}
              variant="outline"
              className="justify-start h-14 border-gray-700 hover:bg-gray-700 hover:text-white"
              onClick={() => handleOpenExternalEditor(editor.url, editor.name)}
            >
              <span className="mr-3 text-xl">{editor.icon}</span>
              <div className="flex flex-col items-start">
                <span>{editor.name}</span>
                <span className="text-xs text-gray-400 flex items-center">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open in new window
                </span>
              </div>
            </Button>
          ))}
        </div>
        <DialogFooter className="sm:justify-start">
          <Button 
            variant="secondary" 
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExternalEditorButton;
