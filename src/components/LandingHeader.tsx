
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, FolderTree } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import SignInDialog from "./SignInDialog";

interface LandingHeaderProps {
  showSignIn: boolean; setShowSignIn: (val: boolean) => void;
  showFeatureTooltip: boolean;
  handleTrustSafetyClick: () => void;
  handleWorkspaceClick: () => void;
  handleAboutClick: () => void;
  handleProClick: () => void;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({
  showSignIn, setShowSignIn, showFeatureTooltip,
  handleTrustSafetyClick, handleWorkspaceClick,
  handleAboutClick, handleProClick,
}) => {
  return (
    <header className="w-full border-b border-gray-800/50 bg-black/10 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8">
            <img src="/lovable-uploads/9e72d009-982d-437d-9caa-9403a11018b8.png" alt="Yavar Logo" className="h-full" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={handleAboutClick}>
            About
          </Button>
          <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={handleProClick}>
            Pro
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleTrustSafetyClick}
                  className="bg-gradient-to-r from-indigo-600/80 to-indigo-700/80 hover:from-indigo-600 hover:to-indigo-700 text-white border-none group relative"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Z-Grid (Trust & Safety)
                  {showFeatureTooltip &&
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping duration-1000 opacity-75"></span>
                  }
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-indigo-900 border-indigo-700 p-3 max-w-xs">
                <p>Ensure ethical AI use with our Trust & Safety features</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleWorkspaceClick}
                  className="bg-gradient-to-r from-violet-600/80 to-violet-700/80 hover:from-violet-600 hover:to-violet-700 text-white border-none group"
                >
                  <FolderTree className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                  Workspace
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>View and manage all your research projects</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button onClick={() => setShowSignIn(true)} className="bg-gradient-to-r from-violet-600/80 to-violet-700/80 hover:from-violet-600 hover:to-violet-700 text-white border-none">
            Sign In
          </Button>
        </div>
      </div>
      <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
    </header>
  );
};

export default LandingHeader;
