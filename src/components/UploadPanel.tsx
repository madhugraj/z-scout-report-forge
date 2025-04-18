
import React, { useState } from 'react';
import { Upload, Link, AlertCircle, X, ChevronLeft, FileText, HardDrive, Globe, Laptop, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

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
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border shadow-lg">
              <div className="text-center space-y-6">
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-2 mx-auto">
                  <HardDrive className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3 text-gray-900">Connect Cloud Storage</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Securely connect and import documents from your preferred cloud storage services
                  </p>
                </div>
              </div>

              <div className="mt-10 space-y-4 max-w-md mx-auto">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-16 relative hover:border-primary/50 hover:bg-blue-50/50 transition-all duration-200"
                  disabled
                >
                  <div className="flex items-center w-full">
                    <div className="bg-blue-100 p-2 rounded-lg mr-4">
                      <img src="https://www.google.com/images/about/drive.png" alt="" className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col items-start flex-1">
                      <span className="font-medium text-gray-900">Google Drive</span>
                      <span className="text-xs text-muted-foreground">Import documents from Drive</span>
                    </div>
                    <CloudOff className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start h-16 relative hover:border-primary/50 hover:bg-blue-50/50 transition-all duration-200"
                  disabled
                >
                  <div className="flex items-center w-full">
                    <div className="bg-blue-100 p-2 rounded-lg mr-4">
                      <img src="https://www.microsoft.com/onedrive.png" alt="" className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col items-start flex-1">
                      <span className="font-medium text-gray-900">OneDrive</span>
                      <span className="text-xs text-muted-foreground">Access Microsoft OneDrive files</span>
                    </div>
                    <CloudOff className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start h-16 relative hover:border-primary/50 hover:bg-blue-50/50 transition-all duration-200"
                  disabled
                >
                  <div className="flex items-center w-full">
                    <div className="bg-blue-100 p-2 rounded-lg mr-4">
                      <img src="https://www.dropbox.com/static/images/logo.png" alt="" className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col items-start flex-1">
                      <span className="font-medium text-gray-900">Dropbox</span>
                      <span className="text-xs text-muted-foreground">Connect with Dropbox</span>
                    </div>
                    <CloudOff className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </Button>
              </div>

              <div className="mt-8 text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100">
                  <AlertCircle className="h-4 w-4 text-blue-500 mr-2" />
                  <p className="text-sm text-blue-700">
                    Cloud storage integration coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'computer':
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border shadow-sm">
              <div className="text-center space-y-6">
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/10 mb-2 mx-auto">
                  <Laptop className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Upload Local Files</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Select and upload documents directly from your computer
                  </p>
                </div>

                <Button 
                  variant="outline"
                  className="relative overflow-hidden hover:border-orange-500/50 bg-white"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4 text-orange-600" />
                  Choose files to upload
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
                  />
                </Button>

                <div className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOCX, TXT, CSV, XLS
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Selected Files</h3>
                  <span className="text-sm text-muted-foreground">{files.length} files</span>
                </div>
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/30 rounded-lg p-3 pr-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                          <FileText className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-orange-500/10 hover:text-orange-600"
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
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border shadow-sm">
              <div className="text-center space-y-6">
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 mb-2 mx-auto">
                  <Globe className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">URL References</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Add web references by pasting URLs to include in your research
                  </p>
                </div>
              </div>

              <div className="mt-8 max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <Input
                    type="text"
                    placeholder="https://example.com/article"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    onClick={addUrl}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Link className="mr-2 h-4 w-4" />
                    Add URL
                  </Button>
                </div>
                
                {urls.length === 0 ? (
                  <div className="bg-green-500/5 rounded-xl p-4 flex items-start">
                    <AlertCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground text-left">
                      <p className="font-medium text-green-800 mb-1">Getting Started</p>
                      <p>
                        Add URLs to specific sources you want to reference. 
                        Supported content includes research papers, news articles, and web pages.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {urls.map((url, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="p-2 rounded-lg bg-green-500/10">
                            <Link className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-sm truncate flex-1">{url}</span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 ml-2 hover:bg-green-500/10 hover:text-green-600"
                          onClick={() => removeUrl(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
            <p className="text-muted-foreground mt-2 text-lg">
              {uploadType === 'drive' && 'Connect and import documents from your cloud storage'}
              {uploadType === 'computer' && 'Upload documents from your computer'}
              {uploadType === 'url' && 'Add web references and URLs to your research'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {renderContent()}

            {((uploadType === 'computer' && files.length > 0) || 
              (uploadType === 'url' && urls.length > 0)) && (
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isUploading}
                  className={cn(
                    "px-8",
                    uploadType === 'computer' && "bg-orange-600 hover:bg-orange-700",
                    uploadType === 'url' && "bg-green-600 hover:bg-green-700"
                  )}
                >
                  {isUploading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>Continue</>
                  )}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPanel;
