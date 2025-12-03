
import React, { useState, useRef, useEffect } from 'react';
import { Dataset, AppView, ChatMessage } from './types';
import { generateSampleData } from './utils/dataHelpers';
import { dashboardAnalysisScript } from './utils/pythonTemplate';
import { generateDataInsights } from './services/geminiService';
import Dashboard from './components/Dashboard';
import ChartCreator from './components/ChartCreator';
import CaseStudyBuilder from './components/CaseStudyBuilder';
import LearningResources from './components/LearningResources';
import PythonConsole from './components/PythonConsole';
import { 
  UploadCloud, 
  FileText, 
  BarChart2, 
  MessageSquare, 
  Table, 
  Send, 
  BrainCircuit,
  PieChart,
  BookOpen,
  Layout,
  X,
  Lightbulb,
  Code2,
  Loader2,
  RefreshCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

declare global {
  interface Window {
    loadPyodide: any;
    pyodide: any;
    csv_data: any;
  }
}

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.UPLOAD);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [rawCsv, setRawCsv] = useState<string | null>(null); 
  const [activeTab, setActiveTab] = useState<'dashboard' | 'visualize' | 'data' | 'casestudy' | 'code' | 'ai'>('dashboard');
  const [showResources, setShowResources] = useState(false);
  
  // Python Engine State
  const [isPythonReady, setIsPythonReady] = useState(false);
  const [pythonLoadingText, setPythonLoadingText] = useState('Initializing Python engine...');
  const [isProcessing, setIsProcessing] = useState(false);

  // AI Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize Pyodide once on mount
  useEffect(() => {
    const initPython = async () => {
      if (window.pyodide) {
          setIsPythonReady(true);
          return;
      }
      try {
        // Robust polling: wait up to 10 seconds for script to load
        let retries = 20;
        while (!window.loadPyodide && retries > 0) {
            await new Promise(r => setTimeout(r, 500));
            retries--;
        }

        if (!window.loadPyodide) {
            throw new Error("Pyodide script failed to load. Please check your internet connection and refresh.");
        }
        
        setPythonLoadingText("Loading Python 3.11...");
        const pyodide = await window.loadPyodide({
             indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
        });
        
        setPythonLoadingText("Installing Pandas & Matplotlib...");
        await pyodide.loadPackage("micropip");
        const micropip = pyodide.pyimport("micropip");
        await micropip.install(["pandas", "matplotlib", "seaborn"]);
        
        window.pyodide = pyodide;
        setIsPythonReady(true);
      } catch (e) {
        console.error("Python init error", e);
        setPythonLoadingText("Error loading Python. Please refresh.");
      }
    };
    initPython();
  }, []);

  // Run the dashboard analysis script via Python
  const runPythonAnalysis = async (csvText: string, fileName: string) => {
    if (!window.pyodide) {
        console.error("Pyodide not ready");
        return;
    }
    console.log("Starting Python analysis for:", fileName);
    setIsProcessing(true);
    
    try {
        // Inject data
        window.csv_data = csvText;
        
        // Run the hidden dashboard script
        await window.pyodide.runPythonAsync(dashboardAnalysisScript);
        
        // Get result - Python returns a JSON string.
        const resultRaw = window.pyodide.globals.get('analysis_result');
        
        let resultJson: string;
        
        if (typeof resultRaw === 'string') {
            resultJson = resultRaw;
        } else {
            // Fallback if it happens to be a Proxy
            resultJson = resultRaw.toString();
            if (resultRaw.destroy) {
                resultRaw.destroy();
            }
        }
        
        const result = JSON.parse(resultJson);
        
        if (result.error) {
            throw new Error(result.error);
        }

        // Validate structure to prevent undefined errors
        if (!result.rows || !Array.isArray(result.rows)) {
            throw new Error("Invalid data structure returned from Python analysis.");
        }

        setDataset({
            name: fileName,
            headers: result.headers,
            rows: result.rows,
            summary: result.summary,
            analysis: result.analysis
        });
        
        setRawCsv(csvText);
        setView(AppView.DASHBOARD);
        setShowResources(false);
        
        // Initial AI Message
        setMessages([{
            role: 'model',
            text: `I've analyzed **${fileName}** using Python. 
            
**Summary:**
- Rows: ${result.rows.length}
- Columns: ${result.headers.length}
- Missing Values: ${result.summary.reduce((acc: number, curr: any) => acc + curr.missing, 0)}

You can check the **Code Lab** tab to see the detailed Python analysis code!`,
            timestamp: new Date()
        }]);

    } catch (error: any) {
        console.error("Analysis failed:", error);
        alert(`Error analyzing data with Python: ${error.message}`);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        runPythonAnalysis(text, file.name);
      };
      reader.readAsText(file);
    }
    // Reset input so the same file can be selected again
    event.target.value = '';
  };

  const loadSampleData = () => {
    const data = generateSampleData();
    // Convert sample object back to CSV string for consistency with Python engine
    const headerStr = data.headers.join(',');
    const rowStr = data.rows.map(r => data.headers.map(h => r[h]).join(',')).join('\n');
    const csvStr = `${headerStr}\n${rowStr}`;
    
    runPythonAnalysis(csvStr, "Sample_Sales_Data.csv");
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !dataset) return;

    const userMsg: ChatMessage = { role: 'user', text: inputMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const responseText = await generateDataInsights(dataset, userMsg.text);
      const aiMsg: ChatMessage = { role: 'model', text: responseText, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error processing your request.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openResources = () => {
    setShowResources(true);
    setView(AppView.DASHBOARD); 
  };

  // 1. Loading State (Python init)
  if (!isPythonReady) {
      return (
          <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-6 p-4">
              <div className="relative">
                  <Loader2 size={64} className="animate-spin text-blue-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                      <Code2 size={24} className="text-slate-400" />
                  </div>
              </div>
              <div className="text-center space-y-2">
                  <p className="text-xl font-medium animate-pulse">{pythonLoadingText}</p>
                  <p className="text-slate-500 text-sm max-w-md">
                      Downloading and configuring the Pyodide Python environment. This usually takes a few seconds...
                  </p>
              </div>
              {pythonLoadingText.includes("Error") && (
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center text-sm"
                  >
                      <RefreshCw size={16} className="mr-2" /> Reload Application
                  </button>
              )}
          </div>
      )
  }

  // 2. Upload View
  if (view === AppView.UPLOAD && !showResources) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4 text-white">
        <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in-up">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Basic EDA Tool
            </h1>
            <p className="text-slate-400 text-lg">Conduct Exploratory EDA with Ease</p>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">
                <Code2 size={12} className="mr-2" /> Python Powered Analysis
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-12 rounded-2xl shadow-2xl border-dashed border-2 border-slate-600 hover:border-blue-500 transition-colors group relative">
            
            {isProcessing ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/90 rounded-xl z-20">
                    <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
                    <p className="text-lg font-medium text-white">Running Python Analysis...</p>
                 </div>
            ) : (
                <>
                    <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    <div className="flex flex-col items-center space-y-4 pointer-events-none">
                    <div className="p-4 bg-slate-700 rounded-full group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all">
                        <UploadCloud size={48} />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-slate-200">Drop your CSV file here</h3>
                        <p className="text-slate-500 mt-2">or click to browse</p>
                    </div>
                    </div>
                </>
            )}
          </div>

          <div className="flex justify-center gap-4">
             <button 
                onClick={loadSampleData}
                disabled={isProcessing}
                className="flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all border border-white/10 disabled:opacity-50"
            >
                <FileText className="mr-2" size={18} />
                Load Sample Data
            </button>
            <button 
                onClick={openResources}
                disabled={isProcessing}
                className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
            >
                <Lightbulb className="mr-2" size={18} />
                Project Ideas
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Resources View
  if (showResources && !dataset) {
      return (
          <div className="min-h-screen bg-slate-50 flex flex-col">
              <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setShowResources(false)}>
                        <div className="p-2 bg-blue-600 rounded-lg">
                        <BrainCircuit className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-bold text-slate-800">Basic EDA Tool</span>
                    </div>
                    <button onClick={() => setShowResources(false)} className="text-slate-500 hover:text-slate-800"><X /></button>
                </div>
              </header>
              <LearningResources />
          </div>
      )
  }

  // 4. Main Dashboard View
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <BrainCircuit className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-slate-800">Basic EDA Tool</span>
          </div>
          <div className="flex items-center space-x-4">
            {dataset && (
                 <div className="hidden md:flex items-center px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-600">
                    <FileText size={14} className="mr-2" />
                    {dataset.name}
                </div>
            )}
            <button 
              onClick={() => { setView(AppView.UPLOAD); setDataset(null); setRawCsv(null); setShowResources(false); }}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
              title="Close Project"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Left Column: Navigation & Main View */}
        <div className="flex-1 flex flex-col space-y-6 min-w-0">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Layout size={16} className="mr-2" />
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('visualize')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${activeTab === 'visualize' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <PieChart size={16} className="mr-2" />
              Visualizer
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${activeTab === 'code' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Code2 size={16} className="mr-2" />
              Code Lab
            </button>
            <button 
              onClick={() => setActiveTab('data')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${activeTab === 'data' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Table size={16} className="mr-2" />
              Data
            </button>
             <button 
              onClick={() => setActiveTab('casestudy')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${activeTab === 'casestudy' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <BookOpen size={16} className="mr-2" />
              Case Study
            </button>
            <button 
              onClick={() => setActiveTab('ai')}
              className={`lg:hidden px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${activeTab === 'ai' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <MessageSquare size={16} className="mr-2" />
              AI
            </button>
          </div>

          {/* View Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {activeTab === 'dashboard' && dataset && (
              <Dashboard dataset={dataset} />
            )}
            
            {activeTab === 'visualize' && dataset && (
                <ChartCreator dataset={dataset} />
            )}

            {activeTab === 'code' && (
                <PythonConsole csvContent={rawCsv} />
            )}

            {activeTab === 'casestudy' && (
                <CaseStudyBuilder dataset={dataset} />
            )}

            {activeTab === 'data' && dataset && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        {dataset.headers.map((header) => (
                          <th key={header} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {dataset.rows.slice(0, 100).map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          {dataset.headers.map((header) => (
                            <td key={`${i}-${header}`} className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
                  Showing first 100 rows
                </div>
              </div>
            )}

            {/* Mobile AI View */}
            {activeTab === 'ai' && (
               <div className="h-[600px] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center justify-center">
                   <p className="text-slate-500">Please use a larger screen for the AI assistant while viewing charts.</p>
               </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Assistant (Desktop Sticky) */}
        <div className="hidden lg:flex w-96 flex-col bg-white rounded-xl shadow-lg border border-slate-200 h-[calc(100vh-8rem)] sticky top-24">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl text-white">
            <div className="flex items-center space-x-2">
              <BrainCircuit size={20} />
              <h3 className="font-semibold">Data Guru</h3>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                  }`}
                >
                   {msg.role === 'model' ? (
                     <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-headings:text-slate-800">
                       <div className="react-markdown-container">
                          <ReactMarkdown>
                            {msg.text}
                          </ReactMarkdown>
                       </div>
                     </div>
                   ) : (
                     msg.text
                   )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-200 rounded-b-xl">
            <div className="relative flex items-center">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about trends, stats..."
                className="w-full pl-4 pr-12 py-3 bg-slate-100 border-0 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none max-h-32"
                rows={1}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="mt-2 flex justify-center">
                <p className="text-[10px] text-slate-400 text-center">
                    AI can make mistakes. Verify important info.
                </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;
