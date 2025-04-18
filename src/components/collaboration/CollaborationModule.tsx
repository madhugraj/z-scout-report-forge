
import React, { useState, useEffect } from 'react';
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

import CollaborationWindow from '../CollaborationWindow';
import EditHistory from './EditHistory';
import { CollaboratorInfo, EditRequest, EditHistoryItem } from './types';

interface CollaborationModuleProps {
  reportSections: {title: string; content: string}[];
  onEditReport: (sectionIndex: number | undefined, type: 'title' | 'content', newValue: string) => void;
  currentUser: CollaboratorInfo;
}

const CollaborationModule: React.FC<CollaborationModuleProps> = ({
  reportSections,
  onEditReport,
  currentUser
}) => {
  const [editHistory, setEditHistory] = useState<EditHistoryItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const handleEditRequest = (edit: EditRequest) => {
    if (edit.type === 'title' || edit.type === 'content') {
      const sectionIndex = edit.sectionIndex;
      const newValue = edit.newValue;
      
      if (newValue) {
        // Update the report
        onEditReport(sectionIndex, edit.type, newValue);
        
        // Add to edit history
        const historyItem: EditHistoryItem = {
          id: Date.now().toString(),
          timestamp: new Date(),
          collaborator: edit.collaborator,
          type: edit.type,
          sectionIndex: sectionIndex,
          sectionTitle: edit.sectionTitle,
          newValue: newValue
        };
        
        setEditHistory(prev => [historyItem, ...prev]);
        
        toast.success(`${edit.collaborator.name} edited the ${edit.type === 'title' ? 'title' : 'content'}`);
      }
    }
  };

  return (
    <>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button 
            className="fixed bottom-4 right-4 rounded-full shadow-lg"
            size="icon"
          >
            <Users className="h-5 w-5" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-[400px] bg-[#1A1F2C] p-0">
          <div className="h-1 w-12 rounded-full bg-gray-600 mx-auto my-2" />
          <CollaborationWindow 
            onEditRequest={handleEditRequest}
            currentUser={currentUser}
            reportSections={reportSections}
          />
        </DrawerContent>
      </Drawer>
      
      {editHistory.length > 0 && (
        <div className="fixed bottom-4 left-4 w-80">
          <EditHistory edits={editHistory} />
        </div>
      )}
    </>
  );
};

export default CollaborationModule;
