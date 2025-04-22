
import React from 'react';
import { X, Table, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SuggestedDataset } from '@/hooks/useGeminiReport';

interface DataTablesPanelProps {
  datasets: SuggestedDataset[];
  onClose: () => void;
}

const DataTablesPanel: React.FC<DataTablesPanelProps> = ({ datasets = [], onClose }) => {
  // Ensure datasets is always an array
  const safeDatasets = Array.isArray(datasets) ? datasets : [];
  
  return (
    <div className="flex flex-col h-full bg-[#1A1F2C] text-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Data Tables</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {safeDatasets.length > 0 ? (
          safeDatasets.map((dataset, index) => (
            <div key={index} className="bg-[#2A2F3C] p-4 rounded-lg border border-gray-800">
              <div className="flex items-start gap-3">
                <div className="bg-gray-800 p-2 rounded">
                  <Table className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{dataset.title}</h4>
                  <p className="text-sm text-gray-400">Source: {dataset.source}</p>
                  <p className="text-sm text-gray-300 mt-1">{dataset.description}</p>
                  <p className="text-xs text-violet-400 mt-1">Relevant to: {dataset.relevanceToSection}</p>
                  <Button variant="ghost" size="sm" className="mt-2 text-violet-400">
                    <FileDown className="h-4 w-4 mr-2" />
                    Export Table
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">
            <Table className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No datasets available for this report.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTablesPanel;
