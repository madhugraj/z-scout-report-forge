
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface EditPanelProps {
  sectionTitle: string;
  editTitle: boolean;
  editText: string;
  setEditText: (text: string) => void;
  setEditTitle: (value: boolean) => void;
  handleCancelEdit: () => void;
  handleSubmitEdit: () => void;
  editorMode: 'minimal' | 'advanced';
}

const EditPanel: React.FC<EditPanelProps> = ({
  sectionTitle = "Section", // Provide default value
  editTitle,
  editText,
  setEditText,
  setEditTitle,
  handleCancelEdit,
  handleSubmitEdit,
  editorMode
}) => {
  return (
    <div className="flex-1 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Editing: {editTitle ? "Title" : sectionTitle}
        </h3>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleCancelEdit}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmitEdit}>
            Save Changes
          </Button>
        </div>
      </div>

      {editorMode === 'minimal' ? (
        <Textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          placeholder="Enter your text..."
          className="min-h-[200px] bg-[#2A2F3C] border-gray-700 text-white"
        />
      ) : (
        <div className="border rounded p-4 bg-[#2A2F3C] border-gray-700">
          <div className="flex gap-2 mb-4">
            <Button variant="outline" size="sm">Bold</Button>
            <Button variant="outline" size="sm">Italic</Button>
            <Button variant="outline" size="sm">List</Button>
            <Button variant="outline" size="sm">Link</Button>
          </div>
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Enter your text..."
            className="min-h-[160px] bg-[#2A2F3C] border-gray-700 text-white"
          />
        </div>
      )}
    </div>
  );
};

export default EditPanel;
