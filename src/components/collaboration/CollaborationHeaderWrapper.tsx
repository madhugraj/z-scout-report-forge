
import React from 'react';
import CollaborationHeader from './CollaborationHeader';

interface CollaborationHeaderWrapperProps {
  showInviteDialog: boolean;
  setShowInviteDialog: (show: boolean) => void;
  editorMode: 'minimal' | 'advanced';
  setEditorMode: (mode: 'minimal' | 'advanced') => void;
}

const CollaborationHeaderWrapper: React.FC<CollaborationHeaderWrapperProps> = ({
  showInviteDialog,
  setShowInviteDialog,
  editorMode,
  setEditorMode
}) => {
  return (
    <CollaborationHeader
      showInviteDialog={showInviteDialog}
      setShowInviteDialog={setShowInviteDialog}
      editorMode={editorMode}
      setEditorMode={setEditorMode}
    />
  );
};

export default CollaborationHeaderWrapper;
