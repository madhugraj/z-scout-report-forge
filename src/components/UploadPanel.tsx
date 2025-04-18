
import React, { useState } from 'react';
import { Upload, File, Link, AlertCircle, X, ChevronLeft, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

const UploadPanel: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [useDocuments, setUseDocuments] = useState(true);
  const [useWebSources, setUseWebSources] = useState(true);
  const [useAcademic, setUseAcademic] = useState(true);
  const [queryText, setQueryText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

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
    
    if (files.length === 0 && urls.length === 0 && !queryText) {
      toast.error('Please upload files, add URLs, or enter a research question');
      return;
    }
    
    setIsUploading(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsUploading(false);
      
      // Navigate to dashboard with state
      navigate('/dashboard', { 
        state: { 
          files: files.map(f => f.name),
          urls,
          useDocuments,
          useWebSources,
          useAcademic,
          query: queryText,
          source: 'upload'
        } 
      });
      
      toast.success('Files and references added successfully');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container max-w-5xl py-8">
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
            <h1 className="text-3xl font-bold">Upload & References</h1>
            <p className="text-muted-foreground mt-2">
              Add your research materials and set preferences for your report
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="mb-4 grid grid-cols-4 w-full max-w-md">
                  <TabsTrigger value="upload">Local</TabsTrigger>
                  <TabsTrigger value="gdrive">Google Drive</TabsTrigger>
                  <TabsTrigger value="onedrive">OneDrive</TabsTrigger>
                  <TabsTrigger value="sharepoint">SharePoint</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Drag and drop your files here</h3>
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
                </TabsContent>
                
                <TabsContent value="gdrive">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <File className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Connect Google Drive</h3>
                    <p className="text-muted-foreground mb-4">
                      Select documents directly from your Google Drive
                    </p>
                    <Button type="button" variant="outline" disabled>
                      Connect Google Drive
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                      (This is a demo feature)
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="onedrive" className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <File className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Connect OneDrive</h3>
                    <p className="text-muted-foreground mb-4">
                      Select documents directly from your OneDrive
                    </p>
                    <Button type="button" variant="outline" disabled>
                      Connect OneDrive
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                      (This is a demo feature)
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="sharepoint" className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <File className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Connect SharePoint</h3>
                    <p className="text-muted-foreground mb-4">
                      Select documents directly from your SharePoint
                    </p>
                    <Button type="button" variant="outline" disabled>
                      Connect SharePoint
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                      (This is a demo feature)
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Files list */}
            {files.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-4 border">
                <h3 className="font-medium mb-2">Uploaded Files</h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/40 rounded-md p-2">
                      <div className="flex items-center">
                        <File className="h-4 w-4 text-muted-foreground mr-2" />
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

            {/* URL Reference section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-medium mb-4">URL References</h3>
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
                <div className="space-y-2 mt-4">
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
              
              {urls.length === 0 && files.length === 0 && (
                <div className="bg-muted/30 rounded-lg p-4 flex items-start">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Add URLs to specific sources you want to reference in your report. 
                      For example: research papers, news articles, or web pages.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Research question */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-medium mb-4">Research Question</h3>
              <Input
                type="text"
                placeholder="What is your research question? (optional if uploading files)"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                className="mb-2"
              />
              <p className="text-sm text-muted-foreground">
                For example: "Impact of AI on mental health research" or "Climate change adaptation strategies"
              </p>
            </div>

            {/* Source preferences */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-medium mb-4">Source Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="use-documents">Use uploaded documents</Label>
                    <p className="text-sm text-muted-foreground">
                      Analyze and extract data from your uploaded files
                    </p>
                  </div>
                  <Switch
                    id="use-documents"
                    checked={useDocuments}
                    onCheckedChange={setUseDocuments}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="use-web">Use real-time web sources</Label>
                    <p className="text-sm text-muted-foreground">
                      Search the internet for additional relevant sources
                    </p>
                  </div>
                  <Switch
                    id="use-web"
                    checked={useWebSources}
                    onCheckedChange={setUseWebSources}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="use-academic">Include academic sources</Label>
                    <p className="text-sm text-muted-foreground">
                      Search academic databases and journals
                    </p>
                  </div>
                  <Switch
                    id="use-academic"
                    checked={useAcademic}
                    onCheckedChange={setUseAcademic}
                  />
                </div>
              </div>
            </div>

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
                  <>
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPanel;
