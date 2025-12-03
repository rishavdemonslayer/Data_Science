
import { Dataset, DataRow, ColumnSummary } from '../types';

// Note: parseCSV has been removed as parsing is now handled by Pyodide (Python) in App.tsx

export const generateSampleData = (): Dataset => {
  const headers = ['Month', 'Sales', 'Marketing_Spend', 'New_Customers', 'Region'];
  const regions = ['North', 'South', 'East', 'West'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const rows: DataRow[] = [];

  months.forEach((month, index) => {
    rows.push({
      Month: month,
      Sales: Math.floor(Math.random() * 50000) + 10000,
      Marketing_Spend: Math.floor(Math.random() * 10000) + 2000,
      New_Customers: Math.floor(Math.random() * 500) + 50,
      Region: regions[index % regions.length]
    });
  });

  // We return a partial dataset object here just to construct the CSV string in App.tsx
  // The actual summary stats will be recalculated by Python.
  return {
    name: 'Sample_Sales_Data.csv',
    headers,
    rows,
    summary: [] // Placeholder, python will fill this
  };
};

export const generateHistogramData = (rows: DataRow[], key: string, bins: number = 10) => {
  const values = rows.map(r => Number(r[key])).filter(v => !isNaN(v));
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const binSize = range / bins;

  const histogram = Array.from({ length: bins }, (_, i) => {
    const binStart = min + i * binSize;
    const binEnd = min + (i + 1) * binSize;
    return {
      range: `${binStart.toFixed(1)} - ${binEnd.toFixed(1)}`,
      count: 0,
      binStart,
      binEnd
    };
  });

  values.forEach(v => {
    const binIndex = Math.min(Math.floor((v - min) / binSize), bins - 1);
    if (binIndex >= 0) {
      histogram[binIndex].count++;
    }
  });

  return histogram;
};
