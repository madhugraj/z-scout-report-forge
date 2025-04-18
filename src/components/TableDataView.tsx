import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const tableData = [
  {
    id: 1,
    title: "Neural Networks in Mental Health",
    source: "Journal of AI in Healthcare",
    date: "2024",
    category: "Research",
    url: "https://example.com/table1"
  },
  {
    id: 2,
    title: "Global AI Adoption Metrics",
    source: "Digital Health Quarterly",
    date: "2024",
    category: "Statistics",
    url: "https://example.com/table2"
  },
  {
    id: 3,
    title: "Treatment Effectiveness Analysis",
    source: "Mental Health Tech Review",
    date: "2023",
    category: "Clinical",
    url: "https://example.com/table3"
  }
];

const sampleTableContent = [
  { metric: 'Depression Reduction', ai_treatment: '45%', traditional: '32%', difference: '+13%' },
  { metric: 'Anxiety Management', ai_treatment: '38%', traditional: '29%', difference: '+9%' },
  { metric: 'Patient Engagement', ai_treatment: '78%', traditional: '52%', difference: '+26%' },
  { metric: 'Treatment Completion', ai_treatment: '82%', traditional: '61%', difference: '+21%' },
  { metric: 'Cost Effectiveness', ai_treatment: '$320/mo', traditional: '$480/mo', difference: '-$160/mo' },
];

interface TableDataViewProps {
  activeTab?: string;
}

const TableDataView: React.FC<TableDataViewProps> = ({ activeTab = 'tables' }) => {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  
  const handleDownload = (title: string) => {
    toast.success(`Downloaded table: ${title}`);
  };

  const handleTableSelect = (id: number) => {
    setSelectedTable(id);
    toast.info(`Viewing table: ${tableData.find(table => table.id === id)?.title}`);
  };

  const handleCloseTable = () => {
    setSelectedTable(null);
  };

  return (
    <div className="h-full flex flex-col">
      {selectedTable === null ? (
        <div className="flex-1 p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Data Tables & Analysis</h3>
          <div className="grid gap-4">
            {tableData.map((table) => (
              <div 
                key={table.id} 
                className="
                  flex items-center justify-between 
                  bg-white border border-gray-200 
                  rounded-lg 
                  p-4 
                  hover:bg-gray-50 
                  transition-colors 
                  cursor-pointer
                  group
                "
                onClick={() => handleTableSelect(table.id)}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-neutral-500 group-hover:text-primary transition-colors" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors">
                      {table.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {table.source} • {table.date} • {table.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(table.title);
                    }}
                  >
                    <Download className="h-4 w-4 text-neutral-400 group-hover:text-primary" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-primary" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium text-gray-900">
                {tableData.find(table => table.id === selectedTable)?.title}
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCloseTable}>
              Close
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-md font-medium mb-4 text-gray-700">
                {tableData.find(table => table.id === selectedTable)?.title} - Data Overview
              </h3>
              
              <Table>
                <TableCaption>
                  Source: {tableData.find(table => table.id === selectedTable)?.source}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>AI-Assisted Treatment</TableHead>
                    <TableHead>Traditional Treatment</TableHead>
                    <TableHead>Difference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleTableContent.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.metric}</TableCell>
                      <TableCell>{row.ai_treatment}</TableCell>
                      <TableCell>{row.traditional}</TableCell>
                      <TableCell>{row.difference}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableDataView;
