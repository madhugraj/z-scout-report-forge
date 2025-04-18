
import React, { useState } from 'react';
import { Upload, Link, AlertCircle, X, ChevronLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

const UploadPanel: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const uploadType = location.state?.uploadType || 'drive';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles(prev => [...prev, ...fileArray]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addUrl = () => {
    if (newUrl.trim() && isValidUrl(newUrl)) {
      setUrls(prev => [...prev, newUrl.trim()]);
      setNewUrl('');
    } else {
      toast.error('Please enter a valid URL');
    }
  };

  const removeUrl = (index: number) => {
    setUrls(prev => prev.filter((_, i) => i !== index));
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((uploadType === 'computer' && files.length === 0) || 
        (uploadType === 'url' && urls.length === 0)) {
      toast.error('Please add required content before proceeding');
      return;
    }
    
    setIsUploading(true);
    
    setTimeout(() => {
      setIsUploading(false);
      navigate('/dashboard', { 
        state: { 
          files: files.map(f => f.name),
          urls,
          source: 'upload'
        } 
      });
      
      toast.success('Content added successfully');
    }, 2000);
  };

  const renderContent = () => {
    switch (uploadType) {
      case 'drive':
        return (
          <div className="space-y-6">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Connect Cloud Storage</h3>
              <p className="text-muted-foreground mb-6">
                Select documents directly from your cloud storage services
              </p>
              <div className="space-y-4">
                <Button type="button" variant="outline" className="w-full max-w-sm" disabled>
                  Connect Google Drive
                </Button>
                <Button type="button" variant="outline" className="w-full max-w-sm" disabled>
                  Connect OneDrive
                </Button>
                <Button type="button" variant="outline" className="w-full max-w-sm" disabled>
                  Connect Dropbox
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                (Cloud storage integration coming soon)
              </p>
            </div>
          </div>
        );

      case 'computer':
        return (
          <div className="space-y-6">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload Local Files</h3>
              <p className="text-muted-foreground mb-4">
                Support for PDF, DOCX, TXT, CSV, and more
              </p>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose files
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
              />
            </div>

            {files.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-4 border">
                <h3 className="font-medium mb-2">Selected Files</h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/40 rounded-md p-2">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'url':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border">
              <h3 className="font-medium mb-4">Add URL References</h3>
              <div className="flex items-center gap-2 mb-4">
                <Input
                  type="text"
                  placeholder="Paste URL for specific reference"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  onClick={addUrl}
                  className="whitespace-nowrap"
                >
                  <Link className="mr-2 h-4 w-4" />
                  Add URL
                </Button>
              </div>
              
              {urls.length > 0 && (
                <div className="space-y-2">
                  {urls.map((url, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/40 rounded-md p-2">
                      <div className="flex items-center overflow-hidden">
                        <Link className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
                        <span className="text-sm truncate">{url}</span>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 flex-shrink-0"
                        onClick={() => removeUrl(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {urls.length === 0 && (
                <div className="bg-muted/30 rounded-lg p-4 flex items-start">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Add URLs to specific sources you want to reference. 
                      For example: research papers, news articles, or web pages.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container max-w-3xl py-8">
        <Button 
          variant="ghost" 
          className="mb-8 pl-0 hover:bg-transparent hover:text-primary"
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to search
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">
              {uploadType === 'drive' && 'Cloud Storage'}
              {uploadType === 'computer' && 'Upload Files'}
              {uploadType === 'url' && 'URL References'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {uploadType === 'drive' && 'Connect and import documents from your cloud storage'}
              {uploadType === 'computer' && 'Upload documents from your computer'}
              {uploadType === 'url' && 'Add web references and URLs to your research'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {renderContent()}

            {(uploadType === 'computer' && files.length > 0) || 
             (uploadType === 'url' && urls.length > 0) ? (
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isUploading}
                  className="px-8"
                >
                  {isUploading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>Continue</>
                  )}
                </Button>
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPanel;
