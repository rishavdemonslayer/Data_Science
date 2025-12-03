import React, { useState, useMemo, useRef } from 'react';
import { Dataset, ChartType } from '../types';
import { generateHistogramData } from '../utils/dataHelpers';
import { 
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { Download, Settings, AlertTriangle } from 'lucide-react';

interface ChartCreatorProps {
  dataset: Dataset;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

const ChartCreator: React.FC<ChartCreatorProps> = ({ dataset }) => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [xAxis, setXAxis] = useState<string>(dataset.headers[0]);
  // Default Y-Axis to first numeric column, or second column if none found initially
  const [yAxis, setYAxis] = useState<string>(
      dataset.summary.find(c => c.type === 'number')?.name || 
      (dataset.headers.length > 1 ? dataset.headers[1] : dataset.headers[0])
  );
  const [color, setColor] = useState<string>(COLORS[0]);
  const [title, setTitle] = useState('My Analysis Chart');
  const [aggregation, setAggregation] = useState<'sum' | 'avg' | 'count' | 'none'>('none');
  
  const chartRef = useRef<HTMLDivElement>(null);

  // Check for sufficient numeric data
  const numericColumns = useMemo(() => dataset.summary.filter(c => c.type === 'number'), [dataset]);
  const hasInsufficientNumericData = numericColumns.length <= 1;

  const processedData = useMemo(() => {
    if (hasInsufficientNumericData) return [];

    if (chartType === 'histogram') {
      return generateHistogramData(dataset.rows, yAxis);
    }

    let data = [...dataset.rows];

    if (aggregation !== 'none' && chartType !== 'scatter') {
      // Group by X and aggregate Y
      const groups: Record<string, any> = {};
      data.forEach(row => {
        const key = String(row[xAxis]);
        if (!groups[key]) {
          groups[key] = { [xAxis]: key, values: [] };
        }
        const val = Number(row[yAxis]);
        if (!isNaN(val)) groups[key].values.push(val);
      });

      return Object.values(groups).map((g: any) => {
        const sum = g.values.reduce((a: number, b: number) => a + b, 0);
        const val = aggregation === 'sum' ? sum : aggregation === 'avg' ? sum / g.values.length : g.values.length;
        return { [xAxis]: g[xAxis], [yAxis]: Math.round(val * 100) / 100 };
      });
    }

    // For Pie charts without aggregation, specifically limit to top 10 to avoid clutter
    if (chartType === 'pie') {
         return data
            .sort((a, b) => (Number(b[yAxis]) || 0) - (Number(a[yAxis]) || 0))
            .slice(0, 10)
            .map(item => ({ 
                ...item, 
                [xAxis]: String(item[xAxis]).length > 15 ? String(item[xAxis]).substring(0, 15) + '...' : String(item[xAxis])
            }));
    }

    return data.slice(0, 100); // Limit for performance on raw scatter/line
  }, [dataset, xAxis, yAxis, chartType, aggregation, hasInsufficientNumericData]);

  const handleExport = () => {
    const svg = chartRef.current?.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Set canvas size based on SVG
      const svgSize = svg.getBoundingClientRect();
      canvas.width = svgSize.width;
      canvas.height = svgSize.height;

      img.onload = () => {
        if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `${title.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  const renderChart = () => {
    const CommonProps = {
      data: processedData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...CommonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={xAxis} stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend />
            <Line type="monotone" dataKey={yAxis} stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        );
      case 'scatter':
        return (
          <ScatterChart {...CommonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" dataKey={xAxis} name={xAxis} stroke="#64748b" />
            <YAxis type="number" dataKey={yAxis} name={yAxis} stroke="#64748b" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend />
            <Scatter name="Data" data={processedData} fill={color} />
          </ScatterChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={processedData}
              dataKey={yAxis}
              nameKey={xAxis}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill={color}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend />
          </PieChart>
        );
      case 'area':
        return (
            <AreaChart {...CommonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={xAxis} stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend />
            <Area type="monotone" dataKey={yAxis} stroke={color} fill={color} />
          </AreaChart>
        );
      case 'histogram':
        return (
          <BarChart data={processedData} margin={CommonProps.margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="range" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend />
            <Bar dataKey="count" name="Frequency" fill={color} />
          </BarChart>
        );
      case 'bar':
      default:
        return (
          <BarChart {...CommonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={xAxis} stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend />
            <Bar dataKey={yAxis} fill={color} />
          </BarChart>
        );
    }
  };

  if (hasInsufficientNumericData) {
      return (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="bg-red-100 p-4 rounded-full mb-4">
                  <AlertTriangle className="text-red-600" size={48} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Visualisation Not Possible</h3>
              <p className="text-red-600 max-w-md">
                  This dataset contains {numericColumns.length} numeric columns. Visualisation requires more than 1 numeric column to generate meaningful charts.
                  <br/><br/>
                  <span className="font-medium">Please use Code Lab to make analysis on your own.</span>
              </p>
          </div>
      );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
            <Settings className="text-slate-400" size={20} />
            <h3 className="font-semibold text-slate-800">Configuration</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Chart Type</label>
            <select 
              value={chartType} 
              onChange={(e) => setChartType(e.target.value as ChartType)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option className="text-slate-800" value="bar">Bar Chart</option>
              <option className="text-slate-800" value="line">Line Chart</option>
              <option className="text-slate-800" value="scatter">Scatter Plot</option>
              <option className="text-slate-800" value="area">Area Chart</option>
              <option className="text-slate-800" value="pie">Pie Chart</option>
              <option className="text-slate-800" value="histogram">Histogram</option>
            </select>
          </div>

          {chartType !== 'histogram' && (
             <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">X-Axis Column</label>
                <select 
                  value={xAxis} 
                  onChange={(e) => setXAxis(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {dataset.headers.map(h => <option className="text-slate-800" key={h} value={h}>{h}</option>)}
                </select>
              </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
                {chartType === 'histogram' ? 'Target Metric Column' : 'Y-Axis Column'}
            </label>
            <select 
              value={yAxis} 
              onChange={(e) => setYAxis(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            >
               {numericColumns.map(c => (
                     <option className="text-slate-800" key={c.name} value={c.name}>{c.name}</option>
               ))}
            </select>
          </div>

          {['bar', 'area', 'line'].includes(chartType) && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Aggregation</label>
                <select 
                    value={aggregation} 
                    onChange={(e) => setAggregation(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option className="text-slate-800" value="none">None (Raw Data)</option>
                    <option className="text-slate-800" value="sum">Sum</option>
                    <option className="text-slate-800" value="avg">Average</option>
                    <option className="text-slate-800" value="count">Count</option>
                </select>
              </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Chart Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
             <label className="block text-xs font-medium text-slate-500 mb-1">Primary Color</label>
             <div className="flex flex-wrap gap-2">
                 {COLORS.map(c => (
                     <button 
                        key={c} 
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? 'border-slate-600 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                     />
                 ))}
             </div>
          </div>
        </div>

        <button 
          onClick={handleExport}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium"
        >
          <Download size={16} className="mr-2" />
          Export Image
        </button>
      </div>

      {/* Chart Preview */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
        <h2 className="text-xl font-bold text-slate-800 text-center mb-6">{title}</h2>
        <div className="flex-1 min-h-[400px]" ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartCreator;