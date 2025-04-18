
import React from 'react';
import { Chart, ChartContainer, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Info } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/sonner';

// Sample data for tables
const tableData = [
  {
    id: 1,
    title: "Comparison of AI Mental Health Applications",
    source: "Journal of Digital Health (2023)",
    data: [
      { application: "Therapy Chatbots", efficacy: "Moderate", accessibility: "High", cost: "Low", humanOversight: "Low to Medium" },
      { application: "Monitoring Apps", efficacy: "High", accessibility: "Medium", cost: "Medium", humanOversight: "Medium" },
      { application: "VR Therapy", efficacy: "High", accessibility: "Low", cost: "High", humanOversight: "High" },
      { application: "Diagnostic AI", efficacy: "Very High", accessibility: "Low", cost: "Very High", humanOversight: "Very High" }
    ]
  },
  {
    id: 2,
    title: "AI Implementation in Mental Health Services by Region",
    source: "Global Health Tech Summit (2024)",
    data: [
      { region: "North America", adoption: "76%", efficacy: "68%", investment: "$5.2B" },
      { region: "Europe", adoption: "63%", efficacy: "71%", investment: "$3.7B" },
      { region: "Asia", adoption: "59%", efficacy: "65%", investment: "$4.1B" },
      { region: "Australia", adoption: "54%", efficacy: "66%", investment: "$1.5B" },
      { region: "Africa", adoption: "23%", efficacy: "72%", investment: "$0.6B" }
    ]
  }
];

// Sample chart data
const lineChartData = [
  { year: 2018, patients: 2400, providers: 1200 },
  { year: 2019, patients: 3600, providers: 1800 },
  { year: 2020, patients: 5400, providers: 2400 },
  { year: 2021, patients: 7800, providers: 3600 },
  { year: 2022, patients: 9600, providers: 4200 },
  { year: 2023, patients: 12400, providers: 4800 }
];

const pieChartData = [
  { name: 'Chatbots', value: 40 },
  { name: 'Mobile Apps', value: 30 },
  { name: 'VR Therapy', value: 15 },
  { name: 'Diagnostic AI', value: 15 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const barChartData = [
  { name: 'Clinical', impact: 78, adoption: 62 },
  { name: 'Research', impact: 85, adoption: 71 },
  { name: 'Education', impact: 65, adoption: 58 },
  { name: 'Public Health', impact: 72, adoption: 45 }
];

interface TableDataViewProps {
  activeTab?: string;
}

const TableDataView: React.FC<TableDataViewProps> = ({ activeTab = 'tables' }) => {
  const handleDownload = (title: string) => {
    toast.success(`Downloaded table: ${title}`);
  };

  return (
    <div className="space-y-6 p-4">
      {activeTab === 'tables' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Extracted Tables</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Info className="h-4 w-4 mr-2" />
                About This Data
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {tableData.map((table) => (
              <Card key={table.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30 pb-2">
                  <CardTitle className="text-base font-medium">{table.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">Source: {table.source}</p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        {table.id === 1 ? (
                          <TableRow>
                            <TableHead>Application Type</TableHead>
                            <TableHead>Efficacy</TableHead>
                            <TableHead>Accessibility</TableHead>
                            <TableHead>Cost</TableHead>
                            <TableHead>Human Oversight</TableHead>
                          </TableRow>
                        ) : (
                          <TableRow>
                            <TableHead>Region</TableHead>
                            <TableHead>Adoption Rate</TableHead>
                            <TableHead>Efficacy Rate</TableHead>
                            <TableHead>Investment</TableHead>
                          </TableRow>
                        )}
                      </TableHeader>
                      <TableBody>
                        {table.id === 1 ? (
                          table.data.map((row: any, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{row.application}</TableCell>
                              <TableCell>{row.efficacy}</TableCell>
                              <TableCell>{row.accessibility}</TableCell>
                              <TableCell>{row.cost}</TableCell>
                              <TableCell>{row.humanOversight}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          table.data.map((row: any, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{row.region}</TableCell>
                              <TableCell>{row.adoption}</TableCell>
                              <TableCell>{row.efficacy}</TableCell>
                              <TableCell>{row.investment}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end p-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownload(table.title)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Table
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">AI Adoption in Mental Health (2018-2023)</CardTitle>
                <p className="text-xs text-muted-foreground">Source: Global Mental Health Tech Analysis</p>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={lineChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="patients" stroke="#8884d8" name="Patients Using AI Tools" />
                      <Line type="monotone" dataKey="providers" stroke="#82ca9d" name="Providers Implementing AI" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">AI Solutions Market Share</CardTitle>
                <p className="text-xs text-muted-foreground">Source: MedTech Quarterly Report</p>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">AI Impact vs. Adoption Rate by Sector</CardTitle>
                <p className="text-xs text-muted-foreground">Source: Journal of Healthcare Technology</p>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="impact" name="Positive Impact %" fill="#8884d8" />
                      <Bar dataKey="adoption" name="Adoption Rate %" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default TableDataView;
