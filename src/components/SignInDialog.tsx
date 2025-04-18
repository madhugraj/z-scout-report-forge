
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Google, Mail, Github, Building2 } from 'lucide-react';

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SignInDialog: React.FC<SignInDialogProps> = ({ open, onOpenChange }) => {
  const handleSignIn = (provider: string) => {
    // Simulate sign in
    console.log(`Signing in with ${provider}`);
    setTimeout(() => {
      onOpenChange(false);
      // Show success toast
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Welcome to Z-Scout</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-6">
          <Button 
            variant="outline" 
            className="w-full py-6 text-lg flex gap-4"
            onClick={() => handleSignIn('Google')}
          >
            <Google className="h-5 w-5" />
            Continue with Google
          </Button>
          <Button 
            variant="outline" 
            className="w-full py-6 text-lg flex gap-4"
            onClick={() => handleSignIn('Microsoft')}
          >
            <Mail className="h-5 w-5" />
            Continue with Microsoft
          </Button>
          <Button 
            variant="outline" 
            className="w-full py-6 text-lg flex gap-4"
            onClick={() => handleSignIn('Github')}
          >
            <Github className="h-5 w-5" />
            Continue with GitHub
          </Button>
          <Button 
            variant="outline" 
            className="w-full py-6 text-lg flex gap-4"
            onClick={() => handleSignIn('SSO')}
          >
            <Building2 className="h-5 w-5" />
            Enterprise SSO
          </Button>
        </div>
        <div className="flex flex-col items-center gap-4 text-center text-sm text-muted-foreground">
          <p>By continuing, you agree to Z-Scout's Terms of Service and Privacy Policy</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignInDialog;
