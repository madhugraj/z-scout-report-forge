
import React, { useState } from 'react';
import { Maximize2, Download, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';

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

export const ResearchImagePanel: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<ResearchImage | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, image: ResearchImage) => {
    e.dataTransfer.setData('application/json', JSON.stringify(image));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="p-6 bg-[#1A1F2C] text-white rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Research Images</h3>
        <div className="text-sm text-gray-400">
          Drag images to add them to your report
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {dummyImages.map((image) => (
          <div
            key={image.id}
            className="group relative"
            draggable
            onDragStart={(e) => handleDragStart(e, image)}
          >
            <Dialog>
              <DialogTrigger asChild>
                <div className="cursor-pointer">
                  <div className="aspect-square bg-[#2A2F3C] rounded-lg overflow-hidden border border-gray-800">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="ghost" className="text-white">
                        <Maximize2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium">{image.title}</p>
                    <p className="text-xs text-gray-400">{image.type} • {image.source}</p>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="bg-[#1A1F2C] text-white border-gray-800 max-w-3xl">
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-auto max-h-[70vh] object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium">{image.title}</h4>
                    <p className="text-sm text-gray-400">{image.source}</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
    </div>
  );
};
