
import React, { useState } from 'react';
import { X, Lock, Mail, Shield, FileText, ArrowRight, Check, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/sonner';
import { Progress } from '@/components/ui/progress';

interface EncryptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
}

const EncryptionDialog: React.FC<EncryptionDialogProps> = ({ isOpen, onClose, documentTitle }) => {
  const [email, setEmail] = useState('');
  const [encryptionLevel, setEncryptionLevel] = useState('high');
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);
  const [expiryDays, setExpiryDays] = useState(7);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'setup' | 'processing' | 'complete'>('setup');
  const [progress, setProgress] = useState(0);

  const handleSubmit = () => {
    if (!email) {
      toast.error('Please enter recipient email');
      return;
    }

    setIsProcessing(true);
    setCurrentStep('processing');
    
    // Simulate XooG blockchain encryption process with detailed steps
    let progressValue = 0;
    const interval = setInterval(() => {
      progressValue += 5;
      setProgress(progressValue);
      
      if (progressValue >= 100) {
        clearInterval(interval);
        setCurrentStep('complete');
      }
    }, 200);
  };

  const renderSetupStep = () => (
    <>
      <DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="bg-violet-600/20 p-2 rounded-full">
            <Lock className="h-5 w-5 text-violet-400" />
          </div>
          <DialogTitle className="text-xl">Secure with XooG Encryption</DialogTitle>
        </div>
        <DialogDescription className="text-gray-400">
          End-to-end encryption powered by XooG blockchain technology
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="bg-violet-900/20 rounded-lg px-4 py-3 border border-violet-800/30">
          <p className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-400" />
            Encrypting: <span className="font-medium text-violet-300">{documentTitle}</span>
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300">Recipient Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter recipient email" 
              className="pl-10 bg-gray-900 border-gray-700 focus:border-violet-500 text-white" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-500">Add multiple emails separated by comma</p>
        </div>
        
        <div className="space-y-2">
          <Label className="text-gray-300">Encryption Level</Label>
          <RadioGroup 
            defaultValue="high" 
            value={encryptionLevel}
            onValueChange={setEncryptionLevel}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="basic" id="basic" className="border-gray-700 text-violet-500" />
              <Label htmlFor="basic" className="font-normal text-gray-300">Basic (AES-128)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" className="border-gray-700 text-violet-500" />
              <Label htmlFor="medium" className="font-normal text-gray-300">Medium (AES-256)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="high" className="border-gray-700 text-violet-500" />
              <Label htmlFor="high" className="font-normal text-gray-300">High (XooG Blockchain)</Label>
              <span className="bg-violet-900/40 text-violet-300 text-xs py-0.5 px-2 rounded">Recommended</span>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label className="text-gray-300">Access Permissions</Label>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="print" 
                checked={allowPrinting}
                onCheckedChange={(checked) => setAllowPrinting(checked as boolean)} 
                className="border-gray-700 data-[state=checked]:bg-violet-600"
              />
              <Label htmlFor="print" className="font-normal text-gray-300">Allow printing</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="copy" 
                checked={allowCopying}
                onCheckedChange={(checked) => setAllowCopying(checked as boolean)} 
                className="border-gray-700 data-[state=checked]:bg-violet-600"
              />
              <Label htmlFor="copy" className="font-normal text-gray-300">Allow copying content</Label>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="expiry" className="text-gray-300">Access Expiry (days)</Label>
          <Input 
            id="expiry" 
            type="number" 
            className="bg-gray-900 border-gray-700 focus:border-violet-500 text-white" 
            min={1}
            max={30}
            value={expiryDays}
            onChange={(e) => setExpiryDays(parseInt(e.target.value))}
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button 
          variant="ghost" 
          onClick={onClose}
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Shield className="mr-2 h-4 w-4" />
          Encrypt & Send
        </Button>
      </DialogFooter>
    </>
  );

  const renderProcessingStep = () => (
    <div className="py-8 space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 mb-4 bg-violet-900/20 rounded-full flex items-center justify-center">
          <Lock className="h-8 w-8 text-violet-400 animate-pulse" />
        </div>
        <h3 className="text-xl font-semibold mb-2">XooG Encryption in Progress</h3>
        <p className="text-gray-400 max-w-sm mx-auto">
          Your document is being securely encrypted using XooG blockchain technology
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Encryption Progress</span>
          <span className="text-violet-300">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-gray-800" indicatorClassName="bg-violet-500" />
      </div>

      <div className="space-y-3 mt-8">
        {progress >= 20 && (
          <div className="flex items-center text-sm">
            <Check className="h-4 w-4 mr-2 text-green-400" />
            <span className="text-gray-300">Initializing XooG secure connection</span>
          </div>
        )}
        {progress >= 40 && (
          <div className="flex items-center text-sm">
            <Check className="h-4 w-4 mr-2 text-green-400" />
            <span className="text-gray-300">Document tokenized on blockchain</span>
          </div>
        )}
        {progress >= 60 && (
          <div className="flex items-center text-sm">
            <Check className="h-4 w-4 mr-2 text-green-400" />
            <span className="text-gray-300">Applying {encryptionLevel} level encryption</span>
          </div>
        )}
        {progress >= 80 && (
          <div className="flex items-center text-sm">
            <Check className="h-4 w-4 mr-2 text-green-400" />
            <span className="text-gray-300">Setting permission controls</span>
          </div>
        )}
        {progress < 100 && (
          <div className="flex items-center text-sm">
            <div className="h-4 w-4 mr-2 rounded-full border-2 border-gray-700 border-t-violet-400 animate-spin" />
            <span className="text-gray-400">Finalizing secure document</span>
          </div>
        )}
        {progress >= 100 && (
          <div className="flex items-center text-sm">
            <Check className="h-4 w-4 mr-2 text-green-400" />
            <span className="text-gray-300">Document ready for secure distribution</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="py-8 space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 mb-4 bg-green-900/20 rounded-full flex items-center justify-center">
          <Check className="h-8 w-8 text-green-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Encryption Complete</h3>
        <p className="text-gray-400 max-w-sm mx-auto">
          Your document has been securely encrypted and sent via XooG blockchain
        </p>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-white text-sm">Security Information</h4>
            <p className="text-xs text-gray-400 mt-1">
              Recipients will receive an email with secure access instructions. The document will expire in {expiryDays} days and includes tamper-proof blockchain verification.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm border border-gray-800 rounded-lg p-3 bg-gray-900/50">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2 text-violet-400" />
            <span className="text-gray-300">{documentTitle}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs bg-violet-900/30 text-violet-300 py-0.5 px-2 rounded">
              XooG Secured
            </span>
          </div>
        </div>
      </div>
            
      <DialogFooter>
        <Button 
          onClick={onClose}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          Done
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#1A1F2C] text-white border border-gray-800">
        {currentStep === 'setup' && renderSetupStep()}
        {currentStep === 'processing' && renderProcessingStep()}
        {currentStep === 'complete' && renderCompleteStep()}
      </DialogContent>
    </Dialog>
  );
};

export default EncryptionDialog;
