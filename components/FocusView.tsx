
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Memory } from '../types';
import { Sparkles, CheckCircle2, Zap, ArrowRight, Target, Bell } from 'lucide-react';
import { generateBriefing } from '../services/geminiService';

interface FocusViewProps {
  memories: Memory[];
  onCompleteTask: (id: string) => void;
}

const FocusView: React.FC<FocusViewProps> = ({ memories, onCompleteTask }) => {
  const [briefing, setBriefing] = useState<{ priorityIds: string[], analysis: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter tasks and reminders
  const actionableMemories = memories.filter(m => !m.isCompleted && (m.category === 'task' || m.category === 'reminder'));
  const reminders = memories.filter(m => !m.isCompleted && m.category === 'reminder');

  useEffect(() => {
    // Auto-generate briefing if not present and we have data
    if (!briefing && actionableMemories.length > 0) {
      handleGenerateBriefing();
    }
  }, [memories.length]);

  const handleGenerateBriefing = async () => {
    setLoading(true);
    const result = await generateBriefing(memories.slice(0, 15)); // Analyze last 15 memories
    setBriefing(result);
    setLoading(false);
  };

  const priorityMemories = briefing 
    ? memories.filter(m => briefing.priorityIds.includes(m.id) && !m.isCompleted)
    : [];

  return (
    <div className="pb-32 space-y-6">
       {/* Header */}
       <div className="flex items-center gap-2 mb-6">
           <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
               <Sparkles size={24} />
           </div>
           <div>
               <h2 className="text-2xl font-bold text-slate-800">Focus Mode</h2>
               <p className="text-sm text-slate-500">AI-powered daily briefing</p>
           </div>
       </div>

       {/* Briefing Card */}
       <motion.div 
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20"
       >
         <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
                <Zap className="fill-yellow-300 text-yellow-300" size={18} /> Daily Briefing
            </h3>
            <button 
                onClick={handleGenerateBriefing}
                disabled={loading}
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors backdrop-blur-md"
            >
                {loading ? 'Analyzing...' : 'Refresh'}
            </button>
         </div>
         <p className="text-indigo-50 leading-relaxed text-sm lg:text-base">
            {loading ? (
                <span className="animate-pulse">Connecting to your second brain to analyze recent tasks...</span>
            ) : briefing ? briefing.analysis : (
                "Tap refresh to let AI analyze your recent memories and suggest what to focus on today."
            )}
         </p>
       </motion.div>

       {/* Priorities Section */}
       <div className="space-y-4">
           <h3 className="font-bold text-slate-800 px-1 flex items-center gap-2">
               <Target size={18} className="text-red-500" /> Top Priorities
           </h3>
           
           {priorityMemories.length > 0 ? (
               priorityMemories.map((memory, idx) => (
                   <PriorityCard key={memory.id} memory={memory} index={idx} onComplete={onCompleteTask} />
               ))
           ) : (
                <div className="text-center py-8 bg-white rounded-3xl border border-slate-100 border-dashed">
                    <p className="text-slate-400 text-sm">No critical tasks identified.</p>
                </div>
           )}
       </div>

       {/* Notifications / Reminders Section */}
       <div className="space-y-4 pt-4">
            <div className="flex justify-between items-end px-1">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Bell size={18} className="text-orange-500" /> Notifications
                 </h3>
                 <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                    {reminders.length}
                 </span>
            </div>
            
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100 divide-y divide-slate-50">
                {reminders.length > 0 ? (
                    reminders.slice(0, 5).map(rem => (
                        <div key={rem.id} className="p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors rounded-2xl">
                             <div className="mt-1 w-2 h-2 rounded-full bg-orange-500" />
                             <div>
                                 <p className="text-sm font-semibold text-slate-800">{rem.title}</p>
                                 <p className="text-xs text-slate-500 line-clamp-1">{rem.summary}</p>
                             </div>
                        </div>
                    ))
                ) : (
                     <div className="p-6 text-center text-slate-400 text-sm">You're all caught up!</div>
                )}
            </div>
       </div>
    </div>
  );
};

interface PriorityCardProps {
    memory: Memory;
    index: number;
    onComplete: (id: string) => void;
}

const PriorityCard: React.FC<PriorityCardProps> = ({ memory, index, onComplete }) => (
    <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4"
    >
        <div className="flex-shrink-0 mt-1">
            <div className="w-6 h-6 rounded-full border-2 border-indigo-100 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-500">{index + 1}</span>
            </div>
        </div>
        <div className="flex-grow">
            <h4 className="font-semibold text-slate-800 leading-tight mb-1">{memory.title}</h4>
            <p className="text-sm text-slate-500 line-clamp-2">{memory.summary}</p>
            <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md uppercase tracking-wide">
                    {memory.category}
                </span>
            </div>
        </div>
        <button 
            onClick={() => onComplete(memory.id)}
            className="flex-shrink-0 text-slate-300 hover:text-green-500 transition-colors p-2"
        >
            <CheckCircle2 size={24} />
        </button>
    </motion.div>
);

export default FocusView;
