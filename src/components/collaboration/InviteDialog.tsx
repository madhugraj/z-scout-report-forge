
import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InviteDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  inviteEmail: string;
  setInviteEmail: React.Dispatch<React.SetStateAction<string>>;
  handleInvite: () => void;
}

const InviteDialog: React.FC<InviteDialogProps> = ({
  open,
  setOpen,
  inviteEmail,
  setInviteEmail,
  handleInvite
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-gray-100">Invite Collaborator</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            id="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@example.com"
            className="w-full bg-gray-800 border-gray-700 text-gray-100"
          />
          <p className="text-sm text-gray-400 mt-2">The collaborator will receive an email invitation.</p>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="ghost"
            onClick={() => setOpen(false)}
            className="text-gray-300"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleInvite}
            className="bg-violet-600 hover:bg-violet-700"
          >
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteDialog;
