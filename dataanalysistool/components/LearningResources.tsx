import React from 'react';
import { PROJECT_IDEAS } from '../types';
import { Lightbulb, Database, ArrowRight } from 'lucide-react';

const LearningResources: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold text-slate-800">Portfolio Project Ideas</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
                Building a strong portfolio requires diverse projects. Here are 5 curated datasets and project concepts to demonstrate your data analytics skills.
            </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
            {PROJECT_IDEAS.map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                <Database size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{item.dataset}</h3>
                                <p className="text-slate-500 mt-1">{item.description}</p>
                            </div>
                        </div>
                        <span className="text-xs font-medium px-3 py-1 bg-slate-200 text-slate-600 rounded-full">Dataset {idx + 1}</span>
                    </div>
                    
                    <div className="p-6">
                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Recommended Projects</h4>
                        <div className="grid md:grid-cols-2 gap-6">
                            {item.ideas.map((idea, i) => (
                                <div key={i} className="group p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Lightbulb size={18} className="text-amber-500" />
                                        <h5 className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{idea.title}</h5>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed pl-7">
                                        {idea.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
};

export default LearningResources;