
import React from 'react';
import { Share2, FileDown, Mail, Lock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/sonner';

interface ResearchHeaderProps {
  title: string;
  onToggleSideView: (view: 'pdf-viewer' | 'images' | 'tables' | null) => void;
  activeSideView: 'pdf-viewer' | 'images' | 'tables' | null;
  onShare: () => void;
}

const ResearchHeader: React.FC<ResearchHeaderProps> = ({ 
  title, 
  onToggleSideView, 
  activeSideView,
  onShare
}) => {
  const handleExportReport = () => {
    const content = document.querySelector('.research-content')?.textContent || '';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'research-report.txt';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Research report downloaded successfully!");
  };

  const handleEmailReport = () => {
    const subject = encodeURIComponent("Research Report: " + title);
    const body = encodeURIComponent("Access the full research report here: " + window.location.href);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.success("Email client opened with report link!");
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900">
        {title}
      </h1>
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => onToggleSideView('pdf-viewer')}
                className={`h-8 w-8 ${activeSideView === 'pdf-viewer' ? 'bg-violet-100' : ''}`}
                aria-label="View PDFs"
              >
                <FileDown className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>View PDFs</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => onToggleSideView('images')}
                className={`h-8 w-8 ${activeSideView === 'images' ? 'bg-violet-100' : ''}`}
                aria-label="View Images"
              >
                <img src="/placeholder.svg" alt="Images" className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>View Images</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => onToggleSideView('tables')}
                className={`h-8 w-8 ${activeSideView === 'tables' ? 'bg-violet-100' : ''}`}
                aria-label="View Tables"
              >
                <img src="/placeholder.svg" alt="Tables" className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>View Tables</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8"
              aria-label="Export Options"
            >
              <FileDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-[#1A1F2C] text-white border border-gray-800">
            <DropdownMenuLabel>Export Options</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleExportReport} className="hover:bg-white/10 focus:bg-white/10">
                <FileDown className="mr-2 h-4 w-4" />
                <span>Export as PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEmailReport} className="hover:bg-white/10 focus:bg-white/10">
                <Mail className="mr-2 h-4 w-4" />
                <span>Email Report</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem onClick={onShare} className="hover:bg-white/10 focus:bg-white/10">
                <Lock className="mr-2 h-4 w-4 text-violet-400" />
                <span>Secure Export (XooG)</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8"
                onClick={onShare}
                aria-label="Share Report"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Share & Encrypt Report</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ResearchHeader;
