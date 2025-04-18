
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface InviteDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  inviteEmail: string;
  setInviteEmail: (email: string) => void;
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
      <DialogContent className="bg-[#1A1F2C] text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Invite Collaborator</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-300">
            Enter the email address of the person you want to collaborate with on this research report.
          </p>
          <Input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@example.com"
            className="bg-[#2A2F3C] border-gray-700 text-white"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite}>
              Send Invite
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteDialog;
