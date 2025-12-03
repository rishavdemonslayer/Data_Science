
export interface DataRow {
  [key: string]: string | number | null;
}

export interface ColumnSummary {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'date';
  count: number;
  missing: number;
  unique: number;
  mean?: number;
  median?: number;
  min?: number;
  max?: number;
  topValues?: { value: string | number; count: number }[];
}

export interface PythonAnalysisResult {
    correlation?: {
        columns: string[];
        matrix: number[][];
    };
    shape: [number, number];
}

export interface Dataset {
  name: string;
  rows: DataRow[];
  headers: string[];
  summary: ColumnSummary[];
  analysis?: PythonAnalysisResult;
}

export enum AppView {
  UPLOAD = 'UPLOAD',
  DASHBOARD = 'DASHBOARD',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export type ChartType = 'bar' | 'line' | 'scatter' | 'pie' | 'area' | 'histogram';

export interface CaseStudyProject {
  title: string;
  objective: string;
  dataSource: string;
  methodology: string;
  findings: string;
  conclusion: string;
}

export const PROJECT_IDEAS = [
  {
    dataset: "E-Commerce Transaction History",
    description: "100k rows of retail transactions including customer ID, product, date, and amount.",
    ideas: [
      { title: "RFM Analysis", desc: "Segment customers based on Recency, Frequency, and Monetary value to target marketing campaigns." },
      { title: "Market Basket Analysis", desc: "Identify which products are frequently bought together to optimize store layout." }
    ]
  },
  {
    dataset: "Mobile App User Behavior",
    description: "User session logs tracking login times, feature usage, session duration, and device type.",
    ideas: [
      { title: "User Retention Cohorts", desc: "Analyze user retention rates over weeks to identify churn spikes." },
      { title: "Feature Engagement Funnel", desc: "Map the user journey to see where users drop off during onboarding." }
    ]
  },
  {
    dataset: "Tech Stock Market Trends",
    description: "5 years of daily OHLC (Open, High, Low, Close) data for major tech companies.",
    ideas: [
      { title: "Volatility Analysis", desc: "Compare the standard deviation of daily returns to assess risk." },
      { title: "Moving Average Strategies", desc: "Visualize short-term vs long-term moving averages to identify trend signals." }
    ]
  },
  {
    dataset: "Telco Customer Churn",
    description: "Demographics, service usage, and account information for telecom customers.",
    ideas: [
      { title: "Churn Prediction Factors", desc: "Visualize correlations between monthly charges, contract type, and churn probability." },
      { title: "Customer Profiling", desc: "Create profiles of 'High Risk' vs 'Loyal' customers." }
    ]
  },
  {
    dataset: "Global Health & Economics",
    description: "Country-level data on GDP, life expectancy, education index, and healthcare spend.",
    ideas: [
      { title: "Socioeconomic Correlation", desc: "Analyze the relationship between GDP per capita and life expectancy." },
      { title: "Cluster Analysis", desc: "Group countries into development tiers based on health and economic indicators." }
    ]
  }
];
