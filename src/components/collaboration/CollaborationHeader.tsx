
import React from 'react';
import { Users, UserPlus, Edit2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ExternalEditorButton from './ExternalEditorButton';

interface CollaborationHeaderProps {
  showInviteDialog: boolean;
  setShowInviteDialog: (show: boolean) => void;
  editorMode: 'minimal' | 'advanced';
  setEditorMode: (mode: 'minimal' | 'advanced') => void;
}

const CollaborationHeader: React.FC<CollaborationHeaderProps> = ({ 
  showInviteDialog,
  setShowInviteDialog,
  editorMode,
  setEditorMode
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-800/50 bg-gradient-to-r from-[#1A1F2C]/90 to-[#2A2F3C]/90 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-violet-400" />
        <h3 className="text-lg font-semibold bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent">Collaborators</h3>
        <span className="text-sm text-emerald-400 animate-pulse">online</span>
      </div>
      <div className="flex gap-2 items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroup 
              type="single" 
              value={editorMode} 
              onValueChange={(value) => value && setEditorMode(value as 'minimal' | 'advanced')}
              className="bg-gray-800/50 rounded-lg p-1"
            >
              <ToggleGroupItem 
                value="minimal" 
                aria-label="Simple Editor Mode"
                className="data-[state=on]:bg-violet-600 hover:bg-violet-500/30"
                title="Simple Editor - Basic text editing features"
              >
                <Edit2 className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="advanced" 
                aria-label="Advanced Editor"
                className="data-[state=on]:bg-violet-600 hover:bg-violet-500/30"
                title="Advanced Editor - Rich text formatting and features"
              >
                <FileText className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Toggle between Simple (Pen) and Advanced (Document) editing modes</p>
          </TooltipContent>
        </Tooltip>
        <ExternalEditorButton />
        <Button 
          size="sm" 
          variant="secondary"
          onClick={() => setShowInviteDialog(true)}
          className="h-8 px-2 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 transition-all"
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CollaborationHeader;
