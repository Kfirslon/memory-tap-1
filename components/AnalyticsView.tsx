
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Memory } from '../types';
import { BarChart, TrendingUp, Lightbulb, Crown, BrainCircuit, Activity } from 'lucide-react';
import { generateHabitAnalysis } from '../services/geminiService';

interface AnalyticsViewProps {
  memories: Memory[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ memories }) => {
  const [analysis, setAnalysis] = useState<{ pattern: string, suggestion: string, productivityScore: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const totalMemories = memories.length;
  const completedTasks = memories.filter(m => (m.category === 'task' || m.category === 'reminder') && m.isCompleted).length;
  const totalTasks = memories.filter(m => m.category === 'task' || m.category === 'reminder').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const categoryCounts = {
    task: memories.filter(m => m.category === 'task').length,
    reminder: memories.filter(m => m.category === 'reminder').length,
    idea: memories.filter(m => m.category === 'idea').length,
    note: memories.filter(m => m.category === 'note').length,
  };

  const maxCount = Math.max(...Object.values(categoryCounts));

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await generateHabitAnalysis(memories);
    setAnalysis(result);
    setLoading(false);
  }

  return (
    <div className="pb-32 space-y-6">
      <div className="flex items-center gap-2 mb-6">
           <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
               <TrendingUp size={24} />
           </div>
           <div>
               <h2 className="text-2xl font-bold text-slate-800">Insights</h2>
               <p className="text-sm text-slate-500">Track your cognitive footprint</p>
           </div>
       </div>

       {/* Stats Grid */}
       <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
             <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
                <BrainCircuit size={14} /> Total Memories
             </div>
             <div className="text-3xl font-bold text-slate-800">{totalMemories}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
             <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
                <Activity size={14} /> Completion Rate
             </div>
             <div className="text-3xl font-bold text-slate-800">{taskCompletionRate}%</div>
             <div className="w-full bg-slate-100 h-1.5 mt-2 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${taskCompletionRate}%` }} />
             </div>
          </div>
       </div>

       {/* Category Chart */}
       <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart size={18} className="text-slate-400" /> Content Breakdown
          </h3>
          <div className="space-y-4">
            {Object.entries(categoryCounts).map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                    <div className="w-20 text-xs font-medium text-slate-500 capitalize text-right">{cat}</div>
                    <div className="flex-grow h-3 bg-slate-100 rounded-full overflow-hidden relative">
                         <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full absolute top-0 left-0
                                ${cat === 'task' ? 'bg-blue-400' : 
                                  cat === 'reminder' ? 'bg-orange-400' :
                                  cat === 'idea' ? 'bg-purple-400' : 'bg-emerald-400'}
                            `}
                         />
                    </div>
                    <div className="w-6 text-xs font-bold text-slate-700">{count}</div>
                </div>
            ))}
          </div>
       </div>

       {/* Premium AI Analysis */}
       <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 p-3 opacity-10">
              <Crown size={120} />
          </div>
          
          <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                      <SparklesIcon /> Premium Insight
                  </h3>
                  {!analysis && (
                    <button 
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                    >
                        {loading ? 'Analyzing...' : 'Generate Report'}
                    </button>
                  )}
              </div>

              {analysis ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md">
                          <span className="text-xs text-slate-300 uppercase tracking-wider font-bold">Productivity Score</span>
                          <div className="text-4xl font-bold mt-1 text-emerald-400">{analysis.productivityScore}/100</div>
                      </div>
                      <div>
                          <h4 className="font-medium text-indigo-300 text-sm mb-1">Habit Pattern</h4>
                          <p className="text-sm text-slate-300 leading-relaxed">{analysis.pattern}</p>
                      </div>
                      <div>
                          <h4 className="font-medium text-indigo-300 text-sm mb-1">Coach Suggestion</h4>
                          <p className="text-sm text-slate-300 leading-relaxed">{analysis.suggestion}</p>
                      </div>
                      <button 
                        onClick={() => setAnalysis(null)}
                        className="text-xs text-slate-400 hover:text-white mt-2 underline"
                      >
                        Refresh Analysis
                      </button>
                  </motion.div>
              ) : (
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                      Unlock AI-powered analytics to understand your thinking patterns, improve your habits, and boost productivity.
                  </p>
              )}
          </div>
       </div>
    </div>
  );
};

const SparklesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.39 9.89L22 12L14.39 14.11L12 22L9.61 14.11L2 12L9.61 9.89L12 2Z" fill="#FBBF24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)

export default AnalyticsView;
