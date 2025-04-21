
import React from "react";
import { Home, FileText, BookOpen, Image, Database, BarChart, Share2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface DashboardSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  toggleSideView: (view: 'pdf-viewer' | 'images' | 'tables' | null) => void;
  activeSideView: 'pdf-viewer' | 'images' | 'tables' | null;
  onToggleCollaborator?: () => void;
  showCollaborator?: boolean;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeView,
  setActiveView,
  toggleSideView,
  activeSideView,
  onToggleCollaborator,
  showCollaborator = false
}) => {
  return (
    <div className="flex flex-col w-14 bg-[#0F151D] border-r border-[#2D3747] items-center py-4 space-y-6">
      <TooltipProvider>
        <div className="flex flex-col space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-10 w-10 rounded-xl ${
                  activeView === 'full-report' ? 'bg-violet-600 hover:bg-violet-700' : 'hover:bg-[#2D3747] text-gray-400'
                }`}
                onClick={() => setActiveView('full-report')}
              >
                <BookOpen className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Full Report</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-10 w-10 rounded-xl ${
                  activeView === 'pdf-viewer' ? 'bg-violet-600 hover:bg-violet-700' : 'hover:bg-[#2D3747] text-gray-400'
                }`}
                onClick={() => setActiveView('pdf-viewer')}
              >
                <FileText className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>PDF Sources</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-10 w-10 rounded-xl ${
                  activeView === 'images' ? 'bg-violet-600 hover:bg-violet-700' : 'hover:bg-[#2D3747] text-gray-400'
                }`}
                onClick={() => setActiveView('images')}
              >
                <Image className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Images</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-10 w-10 rounded-xl ${
                  activeView === 'tables' ? 'bg-violet-600 hover:bg-violet-700' : 'hover:bg-[#2D3747] text-gray-400'
                }`}
                onClick={() => setActiveView('tables')}
              >
                <Database className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Data Tables</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-10 w-10 rounded-xl ${
                  activeView === 'citations' ? 'bg-violet-600 hover:bg-violet-700' : 'hover:bg-[#2D3747] text-gray-400'
                }`}
                onClick={() => setActiveView('citations')}
              >
                <BarChart className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Citations</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="mt-auto flex flex-col space-y-2">
          {onToggleCollaborator && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 rounded-xl ${
                    showCollaborator ? 'bg-violet-600 hover:bg-violet-700' : 'hover:bg-[#2D3747] text-gray-400'
                  }`}
                  onClick={onToggleCollaborator}
                >
                  <Users className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Collaborators</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl hover:bg-[#2D3747] text-gray-400"
                onClick={() => toggleSideView('pdf-viewer')}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Share</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl hover:bg-[#2D3747] text-gray-400"
                onClick={() => window.location.href = '/'}
              >
                <Home className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Home</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default DashboardSidebar;
