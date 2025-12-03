
import React, { useMemo } from 'react';
import { Dataset } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter
} from 'recharts';
import { Activity, Hash, AlignLeft, AlertCircle, Code2 } from 'lucide-react';

interface DashboardProps {
  dataset: Dataset;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; subtext?: string }> = ({ title, value, icon, subtext }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      </div>
      <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
        {icon}
      </div>
    </div>
    {subtext && <p className="text-xs text-slate-400 mt-3">{subtext}</p>}
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ dataset }) => {
  
  const numericColumns = useMemo(() => (dataset.summary || []).filter(c => c.type === 'number'), [dataset]);
  const categoricalColumns = useMemo(() => (dataset.summary || []).filter(c => c.type === 'string'), [dataset]);

  // Determine primary categorical key for X-axis
  const xAxisKey = (dataset.headers || []).find(h => {
    const col = (dataset.summary || []).find(s => s.name === h);
    return col && (col.type === 'string' || h.toLowerCase().includes('date') || h.toLowerCase().includes('month'));
  }) || (dataset.headers ? dataset.headers[0] : '');

  // Safety check
  if (!dataset || !dataset.rows) {
      return <div className="p-8 text-center text-slate-500">No data available to display.</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Python Indicator */}
      <div className="flex items-center justify-end space-x-2 text-xs font-mono text-slate-400">
        <Code2 size={12} />
        <span>Powered by Python 3.11 (Pyodide)</span>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Rows" 
          value={dataset.rows.length.toLocaleString()} 
          icon={<AlignLeft size={24} />} 
        />
        <StatCard 
          title="Total Columns" 
          value={dataset.headers?.length || 0} 
          icon={<Hash size={24} />} 
        />
        <StatCard 
          title="Numeric Features" 
          value={numericColumns.length} 
          icon={<Activity size={24} />} 
          subtext={`${categoricalColumns.length} Categorical`}
        />
        <StatCard 
          title="Data Completeness" 
          value={`${(100 - ((dataset.summary || []).reduce((acc, curr) => acc + curr.missing, 0) / (dataset.rows.length * (dataset.headers?.length || 1)) * 100)).toFixed(1)}%`} 
          icon={<AlertCircle size={24} />} 
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Trends (Line) */}
        {numericColumns.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Overview Trend: {numericColumns[0].name}</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataset.rows.slice(0, 50)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey={xAxisKey} stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey={numericColumns[0].name} 
                    stroke={COLORS[0]} 
                    strokeWidth={2} 
                    dot={false}
                  />
                  {numericColumns.length > 1 && (
                       <Line 
                       type="monotone" 
                       dataKey={numericColumns[1].name} 
                       stroke={COLORS[1]} 
                       strokeWidth={2} 
                       dot={false}
                     />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Chart 2: Distributions (Bar) */}
        {categoricalColumns.length > 0 && categoricalColumns[0].topValues && (
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h4 className="text-lg font-semibold text-slate-800 mb-4">Frequency: {categoricalColumns[0].name}</h4>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={categoricalColumns[0].topValues} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                 <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} />
                 <YAxis type="category" dataKey="value" width={100} stroke="#64748b" fontSize={12} tickLine={false} />
                 <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                 <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
         </div>
        )}

        {/* Chart 3: Correlation Matrix */}
        {dataset.analysis?.correlation && (
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Correlation Matrix (Python Calculated)</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr>
                                <th className="px-2 py-2 bg-slate-50"></th>
                                {dataset.analysis.correlation.columns.map(col => (
                                    <th key={col} className="px-2 py-2 bg-slate-50 text-slate-600 font-medium border-b border-slate-100 max-w-[100px] truncate" title={col}>
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {dataset.analysis.correlation.matrix.map((row, i) => (
                                <tr key={i}>
                                    <td className="px-2 py-2 bg-slate-50 text-slate-600 font-medium border-r border-slate-100 max-w-[100px] truncate" title={dataset.analysis?.correlation?.columns[i]}>
                                        {dataset.analysis?.correlation?.columns[i]}
                                    </td>
                                    {row.map((val, j) => {
                                        // Color scale calculation
                                        const intensity = Math.abs(val);
                                        const isPos = val > 0;
                                        const bg = isPos 
                                            ? `rgba(59, 130, 246, ${intensity})` 
                                            : `rgba(239, 68, 68, ${intensity})`;
                                        const text = intensity > 0.5 ? 'white' : 'black';
                                        return (
                                            <td key={j} className="px-2 py-2 text-center border border-white" style={{ backgroundColor: bg, color: text }}>
                                                {val?.toFixed(2) || '-'}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
        )}

        {/* Chart 4: Scatter (if 2+ numeric) */}
        {numericColumns.length >= 2 && (
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h4 className="text-lg font-semibold text-slate-800 mb-4">Relation: {numericColumns[0].name} vs {numericColumns[1].name}</h4>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <ScatterChart>
                 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                 <XAxis type="number" dataKey={numericColumns[0].name} name={numericColumns[0].name} stroke="#64748b" fontSize={12} />
                 <YAxis type="number" dataKey={numericColumns[1].name} name={numericColumns[1].name} stroke="#64748b" fontSize={12} />
                 <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                 <Scatter name="Data Points" data={dataset.rows.slice(0, 200)} fill="#f59e0b" />
               </ScatterChart>
             </ResponsiveContainer>
           </div>
         </div>
        )}
         
         {/* Chart 5: Composition (Pie) */}
         {categoricalColumns.length > 0 && categoricalColumns[0].topValues && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Composition: {categoricalColumns[0].name}</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoricalColumns[0].topValues}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoricalColumns[0].topValues.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
         )}

      </div>
    </div>
  );
};

export default Dashboard;
