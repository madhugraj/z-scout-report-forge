
import React from 'react';
import { Maximize2, Download, Info } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

interface Image {
  src: string;
  caption: string;
  source: string;
  page?: number;
  description?: string;
}

interface ImagePopoverProps {
  image: Image;
}

const ImagePopover: React.FC<ImagePopoverProps> = ({ image }) => {
  const handleDownload = () => {
    toast.success('Image downloaded');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex flex-col space-y-2 rounded-md border hover:bg-accent cursor-pointer overflow-hidden">
          <div className="relative h-32 bg-muted">
            <img
              src={image.src}
              alt={image.caption}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50">
              <Button variant="ghost" className="text-white">
                <Maximize2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="p-2">
            <p className="text-sm line-clamp-2 font-medium">{image.caption}</p>
            <p className="text-xs text-muted-foreground">
              Source: {image.source} {image.page ? `(p. ${image.page})` : ''}
            </p>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4">
        <div className="space-y-4">
          <div className="rounded-md overflow-hidden border">
            <img
              src={image.src}
              alt={image.caption}
              className="w-full h-auto"
            />
          </div>

          <div>
            <h4 className="font-medium">{image.caption}</h4>
            <p className="text-sm text-muted-foreground">
              Source: {image.source} {image.page ? `(p. ${image.page})` : ''}
            </p>
          </div>

          {image.description && (
            <div className="bg-muted p-3 rounded-md">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm">{image.description}</p>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Image
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Info className="h-4 w-4 mr-2" />
              Image Details
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ImagePopover;
