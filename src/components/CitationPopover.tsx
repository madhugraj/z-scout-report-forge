
import React from 'react';
import { ExternalLink, Copy, File } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

interface Reference {
  title: string;
  authors: string | string[];
  year: number | string;
  journal?: string;
  url?: string;
  doi?: string;
  abstract?: string;
}

interface CitationPopoverProps {
  reference: Reference;
  index: number;
  inline?: boolean;
}

const CitationPopover: React.FC<CitationPopoverProps> = ({
  reference,
  index,
  inline = false,
}) => {
  const handleCopy = () => {
    const authorText = Array.isArray(reference.authors) 
      ? reference.authors.join(', ')
      : reference.authors;
    
    const citation = `${authorText}. (${reference.year}). ${reference.title}. ${reference.journal || ''}. ${reference.doi ? `DOI: ${reference.doi}` : ''}`;
    navigator.clipboard.writeText(citation);
    toast.success('Citation copied to clipboard');
  };

  const handleVisitSource = () => {
    if (reference.url) {
      window.open(reference.url, '_blank');
    } else if (reference.doi) {
      window.open(`https://doi.org/${reference.doi}`, '_blank');
    } else {
      toast.error('No URL available for this reference');
    }
  };

  const authorText = Array.isArray(reference.authors) 
    ? reference.authors.join(', ')
    : reference.authors;

  return (
    <Popover>
      <PopoverTrigger asChild>
        {inline ? (
          <Button
            variant="link"
            className="h-auto p-0 text-primary font-normal underline underline-offset-2 hover:text-primary/80"
          >
            [{index + 1}]
          </Button>
        ) : (
          <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer">
            <div className="rounded-full bg-muted h-6 w-6 flex items-center justify-center text-xs">
              {index + 1}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium line-clamp-1">{reference.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {authorText} ({reference.year})
              </p>
            </div>
          </div>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">{reference.title}</h4>
            <p className="text-sm text-muted-foreground">
              {authorText} ({reference.year})
            </p>
            {reference.journal && (
              <p className="text-sm italic">{reference.journal}</p>
            )}
          </div>

          {reference.abstract && (
            <div>
              <h5 className="text-sm font-medium mb-1">Abstract</h5>
              <p className="text-xs text-muted-foreground line-clamp-3">
                {reference.abstract}
              </p>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={handleCopy}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy Citation
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={handleVisitSource}
              disabled={!reference.url && !reference.doi}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Source
            </Button>
          </div>

          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <File className="h-3 w-3" />
            <span>
              {reference.doi
                ? `DOI: ${reference.doi}`
                : 'Source document reference'}
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CitationPopover;
