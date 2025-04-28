
import React, { useState, ReactNode } from 'react';
import { toast } from '@/components/ui/sonner';

interface EditorManagerProps {
  reportSections: {title: string; content: string}[];
  onEditRequest?: (sectionIndex: number) => void;
}

const EditorManager = ({ 
  reportSections = [],
  onEditRequest 
}: EditorManagerProps) => {
  const [editSection, setEditSection] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState(false);
  const [editText, setEditText] = useState('');
  const [editorMode, setEditorMode] = useState<'minimal' | 'advanced'>('minimal');

  const handleCancelEdit = () => {
    setEditSection(null);
    setEditText('');
  };

  const handleSubmitEdit = () => {
    if (editSection !== null) {
      toast.success(`Section ${editSection + 1} updated successfully!`);
      setEditSection(null);
      setEditText('');
    }
  };

  const processEditCommand = (message: string) => {
    if (message.startsWith('edit section')) {
      const sectionNumber = parseInt(message.split(' ')[2]) - 1;
      if (sectionNumber >= 0 && sectionNumber < reportSections.length) {
        setEditSection(sectionNumber);
        setEditText(reportSections[sectionNumber].content);
        return true;
      } else {
        toast.error('Invalid section number');
        return false;
      }
    }
    return false;
  };

  return {
    editSection,
    editTitle,
    editText,
    editorMode,
    setEditorMode,
    setEditSection,
    setEditTitle,
    setEditText,
    handleCancelEdit,
    handleSubmitEdit,
    processEditCommand
  };
};

export default EditorManager;
