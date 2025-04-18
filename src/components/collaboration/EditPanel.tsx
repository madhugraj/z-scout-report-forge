
import React from 'react';
import { Button } from '@/components/ui/button';

interface EditPanelProps {
  sectionTitle: string;
  editTitle: boolean;
  editText: string;
  setEditText: (text: string) => void;
  setEditTitle: (isTitle: boolean) => void;
  handleCancelEdit: () => void;
  handleSubmitEdit: () => void;
}

const EditPanel: React.FC<EditPanelProps> = ({
  sectionTitle,
  editTitle,
  editText,
  setEditText,
  setEditTitle,
  handleCancelEdit,
  handleSubmitEdit
}) => {
  return (
    <div className="flex-1 flex flex-col p-4">
      <div className="mb-2 text-sm text-white flex items-center justify-between">
        <div>
          Editing {editTitle ? 'title' : 'content'} of: 
          <span className="font-semibold ml-1">
            {sectionTitle}
          </span>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-7 px-2"
            onClick={() => setEditTitle(!editTitle)}
          >
            {editTitle ? 'Edit Content' : 'Edit Title'}
          </Button>
        </div>
      </div>
      <textarea
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        className="flex-1 p-3 bg-[#2A2F3C] border border-gray-700 rounded-md text-white resize-none"
        placeholder={`Enter new ${editTitle ? 'title' : 'content'}...`}
      />
      <div className="flex justify-end mt-3 gap-2">
        <Button variant="outline" onClick={handleCancelEdit}>
          Cancel
        </Button>
        <Button onClick={handleSubmitEdit}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditPanel;
