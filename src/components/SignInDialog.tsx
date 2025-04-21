
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, Github, Building2, Search, Loader2, User, ArrowRight } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Progress } from '@/components/ui/progress';

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SignInDialog: React.FC<SignInDialogProps> = ({ open, onOpenChange }) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const [signInStep, setSignInStep] = useState<'selection' | 'authenticating' | 'complete'>('selection');
  const [progress, setProgress] = useState(0);

  const handleSignIn = (selectedProvider: string) => {
    setProvider(selectedProvider);
    setIsSigningIn(true);
    setSignInStep('authenticating');
    
    // Simulate authentication process with progress
    let progressValue = 0;
    const interval = setInterval(() => {
      progressValue += 10;
      setProgress(progressValue);
      
      if (progressValue >= 100) {
        clearInterval(interval);
        setSignInStep('complete');
        
        setTimeout(() => {
          toast.success(`Signed in with ${selectedProvider}`);
          onOpenChange(false);
          setSignInStep('selection');
          setProgress(0);
          setProvider(null);
          setIsSigningIn(false);
        }, 1000);
      }
    }, 250);
  };

  const renderSelectionStep = () => (
    <>
      <DialogHeader className="space-y-3">
        <DialogTitle className="text-2xl font-bold text-center">Welcome to Z-Scout</DialogTitle>
        <DialogDescription className="text-center text-muted-foreground">
          Sign in to access your research workspace, history, and personalized resources
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-4 py-6">
        <Button 
          variant="outline" 
          className="w-full py-6 text-lg flex gap-4 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          onClick={() => handleSignIn('Google')}
          disabled={isSigningIn}
        >
          <Search className="h-5 w-5" />
          Continue with Google
        </Button>
        <Button 
          variant="outline" 
          className="w-full py-6 text-lg flex gap-4 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          onClick={() => handleSignIn('Microsoft')}
          disabled={isSigningIn}
        >
          <Mail className="h-5 w-5" />
          Continue with Microsoft
        </Button>
        <Button 
          variant="outline" 
          className="w-full py-6 text-lg flex gap-4 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          onClick={() => handleSignIn('GitHub')}
          disabled={isSigningIn}
        >
          <Github className="h-5 w-5" />
          Continue with GitHub
        </Button>
        <Button 
          variant="outline" 
          className="w-full py-6 text-lg flex gap-4 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          onClick={() => handleSignIn('SSO')}
          disabled={isSigningIn}
        >
          <Building2 className="h-5 w-5" />
          Enterprise SSO
        </Button>
      </div>
      <div className="flex flex-col items-center gap-4 text-center text-sm text-muted-foreground">
        <p>By continuing, you agree to Z-Scout's Terms of Service and Privacy Policy</p>
      </div>
    </>
  );

  const renderAuthenticatingStep = () => (
    <div className="py-6 space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center bg-slate-100">
          {provider === 'Google' && <Search className="h-8 w-8 text-slate-700" />}
          {provider === 'Microsoft' && <Mail className="h-8 w-8 text-slate-700" />}
          {provider === 'GitHub' && <Github className="h-8 w-8 text-slate-700" />}
          {provider === 'SSO' && <Building2 className="h-8 w-8 text-slate-700" />}
        </div>
        <h3 className="text-xl font-semibold mb-2">Authenticating with {provider}</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Securely connecting to your {provider} account
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Authentication Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-3 mt-4">
        {progress >= 30 && (
          <div className="flex items-center text-sm">
            <div className={`h-4 w-4 mr-2 rounded-full ${progress >= 50 ? 'bg-green-500' : 'animate-pulse bg-blue-500'}`} />
            <span>Verifying credentials</span>
          </div>
        )}
        {progress >= 60 && (
          <div className="flex items-center text-sm">
            <div className={`h-4 w-4 mr-2 rounded-full ${progress >= 80 ? 'bg-green-500' : 'animate-pulse bg-blue-500'}`} />
            <span>Loading user profile</span>
          </div>
        )}
        {progress >= 90 && (
          <div className="flex items-center text-sm">
            <div className={`h-4 w-4 mr-2 rounded-full ${progress >= 100 ? 'bg-green-500' : 'animate-pulse bg-blue-500'}`} />
            <span>Preparing your workspace</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="py-6 space-y-6 text-center">
      <div className="mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center bg-green-100">
        <User className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-xl font-semibold">Successfully Signed In</h3>
      <p className="text-muted-foreground max-w-sm mx-auto">
        Welcome to Z-Scout! You're now ready to explore all features.
      </p>
      <div className="flex justify-center mt-4">
        <ArrowRight className="h-5 w-5 animate-pulse" />
      </div>
    </div>
  );
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {signInStep === 'selection' && renderSelectionStep()}
        {signInStep === 'authenticating' && renderAuthenticatingStep()}
        {signInStep === 'complete' && renderCompleteStep()}
      </DialogContent>
    </Dialog>
  );
};

export default SignInDialog;
