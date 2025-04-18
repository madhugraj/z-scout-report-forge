
import React from 'react';
import { ChartContainer, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Info, GripVertical, FileText } from 'lucide-react';
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

interface TableDataViewProps {
  activeTab?: string;
}

const TableDataView: React.FC<TableDataViewProps> = ({ activeTab = 'tables' }) => {
  const handleDownload = (title: string) => {
    toast.success(`Downloaded table: ${title}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-700">Data Tables & Analysis</h3>
      </div>

      <div className="space-y-3">
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
          >
            <div className="flex items-center space-x-3">
              <FileText 
                className="
                  h-6 w-6 
                  text-neutral-500 
                  group-hover:text-primary 
                  transition-colors
                " 
              />
              <div>
                <h4 className="
                  text-sm font-medium 
                  text-gray-800 
                  group-hover:text-primary 
                  transition-colors
                ">
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
                onClick={() => handleDownload(table.title)}
              >
                <Download className="h-4 w-4 text-neutral-400 group-hover:text-primary" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-primary" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableDataView;
