
import React, { useState, useRef } from 'react';
import { extensiveEDAScript } from '../utils/pythonTemplate';
import { Play, Terminal, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    csv_data: any;
    pyodide: any;
  }
}

interface PythonConsoleProps {
  csvContent: string | null;
}

const PythonConsole: React.FC<PythonConsoleProps> = ({ csvContent }) => {
  const [code, setCode] = useState(extensiveEDAScript);
  const [output, setOutput] = useState<string[]>([]);
  const [plots, setPlots] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // We assume window.pyodide is already loaded by App.tsx
  const isPyodideReady = !!window.pyodide;

  const runCode = async () => {
    if (!window.pyodide) {
        setError("Python environment not ready. Please refresh the page.");
        return;
    }
    
    setIsRunning(true);
    setPlots([]);
    setOutput([]); 
    setError(null);

    try {
      // 1. Redirect stdout to capture print statements
      window.pyodide.setStdout({
        batched: (msg: string) => setOutput(prev => [...prev, msg])
      });

      // 2. Inject Data into global python namespace
      if (csvContent) {
         window.csv_data = csvContent; 
      } else {
         window.csv_data = "";
         setOutput(prev => [...prev, "Warning: No CSV data found. Using empty string."]);
      }

      // 3. Run the code
      await window.pyodide.runPythonAsync(code);

      // 4. Retrieve Plots from the 'generated_plots' variable defined in the script
      try {
        const plotResults = window.pyodide.globals.get('generated_plots');
        if (plotResults) {
            const plotArray = plotResults.toJs();
            setPlots(plotArray);
            plotResults.destroy();
        }
      } catch (e) {
          // Variable might not exist if user changed code, that's fine
      }

      setOutput(prev => [...prev, "\n>>> Execution finished successfully."]);

    } catch (err: any) {
      console.error(err);
      setError(String(err));
      setOutput(prev => [...prev, `\nTraceback/Error:\n${String(err)}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 p-4 bg-slate-900 text-slate-200 rounded-xl shadow-inner">
      
      {/* Left: Code Editor */}
      <div className="flex-1 flex flex-col min-h-[500px] border border-slate-700 rounded-lg overflow-hidden bg-slate-950">
        <div className="bg-slate-800 px-4 py-2 flex justify-between items-center border-b border-slate-700">
            <div className="flex items-center space-x-2 text-sm font-medium text-slate-300">
                <Terminal size={16} />
                <span>extensive_eda.py</span>
            </div>
            <div className="flex space-x-2">
                 <button 
                    onClick={() => setCode(extensiveEDAScript)}
                    className="flex items-center px-2 py-1 text-xs hover:bg-slate-700 rounded text-slate-400"
                    title="Reset to Default Extensive Script"
                >
                    <RefreshCw size={12} className="mr-1" /> Reset
                </button>
            </div>
        </div>
        <textarea 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full bg-slate-950 text-slate-300 font-mono text-xs md:text-sm p-4 outline-none resize-none leading-relaxed"
            spellCheck={false}
        />
        <div className="p-4 bg-slate-800 border-t border-slate-700">
            <button
                onClick={runCode}
                disabled={!isPyodideReady || isRunning || !csvContent}
                className="flex items-center justify-center w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {!isPyodideReady ? (
                    <span className="flex items-center"><Loader2 className="animate-spin mr-2" size={18}/> Loading Python...</span>
                ) : isRunning ? (
                    <span className="flex items-center"><Loader2 className="animate-spin mr-2" size={18}/> Running Analysis...</span>
                ) : (
                    <>
                        <Play size={18} className="mr-2 fill-current" />
                        Run Python Analysis
                    </>
                )}
            </button>
            {!csvContent && (
                <p className="text-xs text-red-400 text-center mt-2">Please upload a dataset in the 'Dashboard' tab first.</p>
            )}
        </div>
      </div>

      {/* Right: Output & Plots */}
      <div className="flex-1 flex flex-col min-h-[500px] bg-slate-950 border border-slate-700 rounded-lg overflow-hidden">
         {/* Console Output */}
         <div className="h-1/2 overflow-y-auto p-4 font-mono text-xs border-b border-slate-800 custom-scrollbar">
            <div className="flex justify-between items-center mb-2">
                 <h3 className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Standard Output</h3>
                 {isRunning && <Loader2 size={12} className="text-blue-500 animate-spin"/>}
            </div>
            
            {output.length === 0 && !error && <span className="text-slate-600 italic opacity-50">Run code to see output...</span>}
            
            {output.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap mb-1 text-slate-300">{line}</div>
            ))}
            
            {error && (
                <div className="text-red-400 mt-2 flex items-start gap-2 bg-red-900/20 p-2 rounded border border-red-900/50">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span className="whitespace-pre-wrap">{error}</span>
                </div>
            )}
         </div>

         {/* Plots Output */}
         <div className="h-1/2 overflow-y-auto p-4 bg-slate-900 custom-scrollbar">
            <h3 className="text-slate-500 mb-4 uppercase tracking-wider text-[10px] font-bold">Generated Plots</h3>
            {plots.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-slate-700 text-sm border-2 border-dashed border-slate-800 rounded-lg">
                    No plots generated
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {plots.map((imgStr, idx) => (
                        <div key={idx} className="bg-white rounded p-2 shadow-lg">
                            <img src={`data:image/png;base64,${imgStr}`} alt={`Plot ${idx}`} className="w-full h-auto" />
                        </div>
                    ))}
                </div>
            )}
         </div>
      </div>

    </div>
  );
};

export default PythonConsole;
