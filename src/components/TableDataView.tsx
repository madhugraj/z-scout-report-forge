
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
import { 
  Download, 
  ExternalLink, 
  FileText, 
  BarChart,
  List,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

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
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  
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

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'table' ? 'chart' : 'table');
    toast.info(`Switched to ${viewMode === 'table' ? 'chart' : 'table'} view`);
  };

  const toggleMaximize = () => {
    setIsMaximized(prev => !prev);
    toast.info(isMaximized ? 'View normalized' : 'View maximized');
  };

  // Simulated chart data visualization
  const renderChartView = () => {
    return (
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <h3 className="text-md font-medium mb-4 text-gray-700">
          {tableData.find(table => table.id === selectedTable)?.title} - Chart View
        </h3>
        
        <div className="flex flex-col gap-3">
          {sampleTableContent.map((row, index) => (
            <div key={index} className="flex flex-col">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{row.metric}</span>
                <div className="flex space-x-2">
                  <span className="text-xs text-blue-600">{row.ai_treatment}</span>
                  <span className="text-xs text-gray-600">{row.traditional}</span>
                </div>
              </div>
              <div className="relative w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                {/* AI Treatment Bar */}
                <div 
                  className="absolute top-0 left-0 h-full bg-blue-500 rounded-r-full"
                  style={{ 
                    width: `${parseInt(row.ai_treatment) || 50}%`,
                  }}
                ></div>
                {/* Traditional Treatment Bar */}
                <div 
                  className="absolute top-0 left-0 h-full bg-gray-400 rounded-r-full"
                  style={{ 
                    width: `${parseInt(row.traditional) || 30}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-end mt-4 space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">AI-Assisted</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Traditional</span>
          </div>
        </div>
      </div>
    );
  };

  // Dummy table image for visualization when no real data is available
  const renderDummyTableImage = () => {
    return (
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <h3 className="text-md font-medium mb-4 text-gray-700">
          Sample Data Visualization
        </h3>
        
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-3 border-b">
            <div className="grid grid-cols-4 gap-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          <div className="p-3">
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="grid grid-cols-4 gap-4 mb-3">
                <div className="h-6 bg-gray-100 rounded"></div>
                <div className="h-6 bg-blue-100 rounded"></div>
                <div className="h-6 bg-gray-100 rounded"></div>
                <div className="h-6 bg-green-100 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-500 text-center">
          Interactive table visualization will appear here when data is loaded
        </div>
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col ${isMaximized ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {selectedTable === null ? (
        <div className="h-full flex flex-col overflow-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700">Data Tables & Analysis</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleMaximize}
              className="flex items-center gap-1"
            >
              {isMaximized ? (
                <>
                  <Minimize2 className="h-4 w-4" />
                  <span>Minimize</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4" />
                  <span>Maximize</span>
                </>
              )}
            </Button>
          </div>
          
          <ResizablePanelGroup 
            direction="horizontal" 
            className="flex-1 rounded-lg border"
          >
            <ResizablePanel defaultSize={30} minSize={20}>
              <div className="h-full bg-white p-4 overflow-y-auto">
                <h4 className="text-sm font-medium mb-3 text-gray-700">Available Tables</h4>
                <div className="grid gap-2">
                  {tableData.map((table) => (
                    <div 
                      key={table.id} 
                      className="
                        flex items-center justify-between 
                        bg-white border border-gray-200 
                        rounded-lg 
                        p-3 
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
                            {table.source} • {table.date}
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={70}>
              <div className="h-full flex flex-col bg-gray-50 p-4">
                <div className="flex-1 overflow-auto">
                  {renderDummyTableImage()}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full">
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium text-gray-900">
                {tableData.find(table => table.id === selectedTable)?.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleViewMode}
                className="flex gap-1 items-center"
              >
                {viewMode === 'table' ? (
                  <>
                    <BarChart className="h-4 w-4" />
                    <span>Chart View</span>
                  </>
                ) : (
                  <>
                    <List className="h-4 w-4" />
                    <span>Table View</span>
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleMaximize}
                className="flex items-center gap-1"
              >
                {isMaximized ? (
                  <>
                    <Minimize2 className="h-4 w-4" />
                    <span>Minimize</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4" />
                    <span>Maximize</span>
                  </>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCloseTable}>
                Close
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
              {viewMode === 'table' ? (
                <div className="bg-white rounded-lg shadow-sm border p-6">
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
                          <TableCell className={row.difference.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                            {row.difference}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : renderChartView()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableDataView;
