
import React, { useState } from 'react';
import { X, Lock, Mail, Shield, FileText, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/sonner';

interface EncryptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
}

const EncryptionDialog: React.FC<EncryptionDialogProps> = ({ isOpen, onClose, documentTitle }) => {
  const [email, setEmail] = useState('');
  const [encryptionLevel, setEncryptionLevel] = useState('medium');
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);
  const [expiryDays, setExpiryDays] = useState(7);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = () => {
    if (!email) {
      toast.error('Please enter recipient email');
      return;
    }

    setIsProcessing(true);
    
    // Simulate XooG blockchain encryption process
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Document securely encrypted and sent via XooG blockchain!');
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#1A1F2C] text-white border border-gray-800">
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
              defaultValue="medium" 
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
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Encrypting...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Encrypt & Send
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EncryptionDialog;
