
import React, { useState } from 'react';
import { 
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

import CollaborationWindow from '../CollaborationWindow';
import { CollaboratorInfo, EditRequest } from './types';

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
  const [isOpen, setIsOpen] = useState(false);

  const handleEditRequest = (edit: EditRequest) => {
    if (edit.type === 'title' || edit.type === 'content') {
      onEditReport(edit.sectionIndex, edit.type, edit.newValue);
      setIsOpen(false);
      toast.success(`Changes applied successfully`);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button 
          className="fixed bottom-4 right-4 rounded-full shadow-lg"
          size="icon"
        >
          <Users className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[400px]">
        <div className="h-1 w-12 rounded-full bg-gray-600 mx-auto my-2" />
        <CollaborationWindow 
          onEditRequest={handleEditRequest}
          currentUser={currentUser}
          reportSections={reportSections}
        />
      </DrawerContent>
    </Drawer>
  );
};

export default CollaborationModule;

