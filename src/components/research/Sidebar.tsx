
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Image, 
  Table, 
  BookOpen, 
  MessageSquare, 
  FolderTree, 
  ArrowLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const navigate = useNavigate();
  
  return (
    <div className="w-64 flex flex-col border-r border-gray-800/50 backdrop-blur-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent">Research View</h1>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/')}
          className="w-full justify-start mb-4 hover:bg-white/5 text-gray-400 hover:text-white group transition-all py-3"
        >
          <ArrowLeft className="h-4 w-4 mr-2 text-violet-400 group-hover:text-violet-300" />
          Back to Home
        </Button>
        
        <nav className="space-y-2">
          <Button
            variant={activeView === 'full-report' ? 'secondary' : 'ghost'}
            className="w-full justify-start hover:bg-white/5 transition-colors"
            onClick={() => setActiveView('full-report')}
          >
            <FileText className="h-5 w-5 mr-3 text-violet-400" />
            Full Report
          </Button>
          <Button
            variant={activeView === 'pdf-viewer' ? 'secondary' : 'ghost'}
            className="w-full justify-start hover:bg-white/5 transition-colors"
            onClick={() => setActiveView('pdf-viewer')}
          >
            <BookOpen className="h-5 w-5 mr-3 text-violet-400" />
            Source PDFs
          </Button>
          <Button
            variant={activeView === 'images' ? 'secondary' : 'ghost'}
            className="w-full justify-start hover:bg-white/5 transition-colors"
            onClick={() => setActiveView('images')}
          >
            <Image className="h-5 w-5 mr-3 text-violet-400" />
            Research Images
          </Button>
          <Button
            variant={activeView === 'citations' ? 'secondary' : 'ghost'}
            className="w-full justify-start hover:bg-white/5 transition-colors"
            onClick={() => setActiveView('citations')}
          >
            <FileText className="h-5 w-5 mr-3 text-violet-400" />
            Citations
          </Button>
          <Button
            variant={activeView === 'tables' ? 'secondary' : 'ghost'}
            className="w-full justify-start hover:bg-white/5 transition-colors"
            onClick={() => setActiveView('tables')}
          >
            <Table className="h-5 w-5 mr-3 text-violet-400" />
            Data Tables
          </Button>
          <Button
            variant={activeView === 'threads' ? 'secondary' : 'ghost'}
            className="w-full justify-start hover:bg-white/5 transition-colors"
            onClick={() => setActiveView('threads')}
          >
            <MessageSquare className="h-5 w-5 mr-3 text-violet-400" />
            Discussions
          </Button>
        </nav>
      </div>
      <div className="mt-auto p-4 border-t border-gray-800/50">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5 group transition-all py-4"
          onClick={() => navigate('/workspace')}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <FolderTree className="h-5 w-5 text-violet-400 group-hover:text-violet-300 mr-3" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Research Workspace</span>
                <span className="text-xs text-gray-500">View all research projects</span>
              </div>
            </div>
            <div className="h-6">
              <img src="/lovable-uploads/9e72d009-982d-437d-9caa-9403a11018b8.png" alt="Yavar Logo" className="h-full" />
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
