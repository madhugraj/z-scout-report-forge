
import React, { useState } from 'react';
import { Maximize2, Download, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { SuggestedImage } from '@/hooks/useGeminiReport';

interface ResearchImagePanelProps {
  images: SuggestedImage[];
  onClose: () => void;
}

interface ResearchImage {
  id: string;
  url: string;
  title: string;
  source: string;
  type: string;
}

const dummyImages: ResearchImage[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
    title: 'AI Neural Network Visualization',
    source: 'Smith et al., 2023',
    type: 'Technical Diagram'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
    title: 'Machine Learning Process',
    source: 'Johnson, 2022',
    type: 'Flow Chart'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    title: 'Data Analysis Results',
    source: 'Williams et al., 2023',
    type: 'Graph'
  }
];

export const ResearchImagePanel: React.FC<ResearchImagePanelProps> = ({ images, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<ResearchImage | null>(null);
  const [draggingImage, setDraggingImage] = useState<string | null>(null);

  // Use images from props if available, otherwise fallback to dummy images
  const displayImages = images && images.length > 0 ? images : dummyImages;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, image: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify(image));
    e.dataTransfer.effectAllowed = 'copy';
    setDraggingImage(image.id || image.title);
    
    // Create a custom drag image showing what's being dragged
    const dragPreview = document.createElement('div');
    dragPreview.className = 'p-2 bg-violet-100 rounded-lg shadow-md';
    dragPreview.innerHTML = `
      <div class="flex items-center gap-2">
        <img src="${image.url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b'}" alt="${image.title}" class="h-8 w-8 object-cover rounded" />
        <span class="text-xs font-medium">${image.title}</span>
      </div>
    `;
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, 20, 20);
    
    // Show drag hint text
    toast.info("Drag image to a section in your report", {
      duration: 2000,
      position: "top-center"
    });
    
    // Remove the element after drag operation
    setTimeout(() => {
      document.body.removeChild(dragPreview);
    }, 0);
  };
  
  const handleDragEnd = () => {
    setDraggingImage(null);
  };

  return (
    <div className="p-6 bg-[#1A1F2C] text-white rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Research Images</h3>
        <div className="flex items-center">
          <div className="text-sm text-gray-400 mr-2">
            Drag images to your report sections
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {displayImages.map((image, index) => (
          <div
            key={image.id || index}
            className={`group relative ${draggingImage === (image.id || image.title) ? 'opacity-50' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, image)}
            onDragEnd={handleDragEnd}
          >
            <Dialog>
              <DialogTrigger asChild>
                <div className="cursor-pointer">
                  <div className="aspect-square bg-[#2A2F3C] rounded-lg overflow-hidden border border-gray-800 relative">
                    <img
                      src={image.url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b'}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex gap-2">
                        <Button variant="ghost" className="text-white">
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" className="text-white">
                          <Move className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium">{image.title}</p>
                    <p className="text-xs text-gray-400">{image.type || 'Image'} • {image.source}</p>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="bg-[#1A1F2C] text-white border-gray-800 max-w-2xl">
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={image.url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b'}
                      alt={image.title}
                      className="w-full h-auto max-h-[70vh] object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium">{image.title}</h4>
                    <p className="text-sm text-gray-400">{image.source}</p>
                    <div className="flex mt-2 gap-2">
                      <Button 
                        variant="outline"
                        className="text-violet-400 border-violet-400/30"
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = image.url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b';
                          a.download = image.title.replace(/\s+/g, '_') + '.jpg';
                          a.click();
                          toast.success("Image downloaded successfully");
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Image
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-violet-900/20 rounded-lg border border-violet-700/30">
        <div className="flex items-center gap-2">
          <Move className="h-4 w-4 text-violet-400" />
          <p className="text-xs text-violet-300">Tip: Drag any image onto a section in your report to include it</p>
        </div>
      </div>
    </div>
  );
};
