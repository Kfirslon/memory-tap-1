'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { Memory } from '@/lib/types';
import { generateBriefing } from '@/lib/groq/client';

interface FocusViewProps {
    memories: Memory[];
    onCompleteTask: (id: string) => void;
}

export default function FocusView({ memories, onCompleteTask }: FocusViewProps) {
    const [briefing, setBriefing] = useState<{ priorityIds: string[], analysis: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBriefing = async () => {
            setLoading(true);
            try {
                const result = await generateBriefing(memories);
                setBriefing(result);
            } catch (error) {
                console.error('Failed to generate briefing', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBriefing();
    }, [memories]);

    const pendingTasks = memories.filter(
        (m) => !m.is_completed && (m.category === 'task' || m.category === 'reminder')
    );

    const priorityMemories = pendingTasks.filter((m) => briefing?.priorityIds.includes(m.id));

    return (
        <div className="space-y-6 pb-24">
            {/* AI Briefing */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary-500 to-blue-600 text-white rounded-3xl p-6 shadow-xl"
            >
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={20} />
                    <h2 className="text-lg font-bold">AI Briefing</h2>
                </div>

                {loading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                ) : (
                    <p className="text-white/90 leading-relaxed">{briefing?.analysis || 'No pending tasks!'}</p>
                )}
            </motion.div>

            {/* Priority Tasks */}
            {priorityMemories.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Clock size={20} className="text-primary-600" />
                        Top Priorities
                    </h3>
                    <div className="space-y-3">
                        {priorityMemories.map((memory, index) => (
                            <motion.div
                                key={memory.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-4 shadow-sm border-2 border-primary-200 flex items-center justify-between"
                            >
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                        </span>
                                        <h4 className="font-semibold text-slate-900">{memory.title}</h4>
                                    </div>
                                    <p className="text-sm text-slate-600 ml-8">{memory.summary}</p>
                                </div>
                                <button
                                    onClick={() => onCompleteTask(memory.id)}
                                    className="p-2 hover:bg-green-50 rounded-xl transition-colors flex-shrink-0"
                                >
                                    <CheckCircle2 size={24} className="text-green-500" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Pending Tasks */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">All Tasks & Reminders</h3>
                {pendingTasks.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <CheckCircle2 size={48} className="mx-auto mb-3 text-green-400" />
                        <p className="font-medium">All caught up! 🎉</p>
                        <p className="text-sm">No pending tasks or reminders.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {pendingTasks.map((memory) => (
                            <motion.div
                                key={memory.id}
                                layout
                                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all"
                            >
                                <div className="flex-grow">
                                    <h4 className="font-semibold text-slate-900 mb-1">{memory.title}</h4>
                                    <p className="text-sm text-slate-600">{memory.summary}</p>
                                </div>
                                <button
                                    onClick={() => onCompleteTask(memory.id)}
                                    className="p-2 hover:bg-green-50 rounded-xl transition-colors"
                                >
                                    <CheckCircle2 size={20} className="text-slate-300 hover:text-green-500" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
