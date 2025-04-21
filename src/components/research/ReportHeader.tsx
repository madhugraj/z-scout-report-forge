
import React from 'react';
import { FileText, Image, Table, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lock, Mail } from 'lucide-react';

interface ReportHeaderProps {
  title: string;
  activeSideView: 'pdf-viewer' | 'images' | 'tables' | null;
  setActiveSideView: (view: 'pdf-viewer' | 'images' | 'tables' | null) => void;
  handleExportReport: () => void;
  handleEmailReport: () => void;
  handleSecureExport: () => void;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({
  title,
  activeSideView,
  setActiveSideView,
  handleExportReport,
  handleEmailReport,
  handleSecureExport
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setActiveSideView(prev => prev === 'pdf-viewer' ? null : 'pdf-viewer')}
                className={`h-8 w-8 ${activeSideView === 'pdf-viewer' ? 'bg-violet-100' : ''}`}
                aria-label="View PDFs"
              >
                <FileText className="h-4 w-4" />
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
                onClick={() => setActiveSideView(prev => prev === 'images' ? null : 'images')}
                className={`h-8 w-8 ${activeSideView === 'images' ? 'bg-violet-100' : ''}`}
                aria-label="View Images"
              >
                <Image className="h-4 w-4" />
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
                onClick={() => setActiveSideView(prev => prev === 'tables' ? null : 'tables')}
                className={`h-8 w-8 ${activeSideView === 'tables' ? 'bg-violet-100' : ''}`}
                aria-label="View Tables"
              >
                <Table className="h-4 w-4" />
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
              <DropdownMenuItem onClick={handleSecureExport} className="hover:bg-white/10 focus:bg-white/10">
                <Lock className="mr-2 h-4 w-4" />
                <span>Secure Export</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ReportHeader;
