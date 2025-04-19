
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus } from 'lucide-react';

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleInvite();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Collaborator</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-gray-400" />
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1"
              type="email"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Send Invite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteDialog;
