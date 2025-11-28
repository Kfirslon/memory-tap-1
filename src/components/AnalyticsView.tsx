'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Lightbulb } from 'lucide-react';
import { Memory } from '@/lib/types';
import { generateHabitAnalysis } from '@/lib/groq/client';

interface AnalyticsViewProps {
    memories: Memory[];
}

export default function AnalyticsView({ memories }: AnalyticsViewProps) {
    const [analysis, setAnalysis] = useState<{ pattern: string, suggestion: string, productivityScore: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalysis = async () => {
            setLoading(true);
            try {
                const result = await generateHabitAnalysis(memories);
                setAnalysis(result);
            } catch (error) {
                console.error('Failed to generate analysis', error);
            } finally {
                setLoading(false);
            }
        };

        if (memories.length > 0) {
            fetchAnalysis();
        } else {
            setLoading(false);
        }
    }, [memories]);

    const totalMemories = memories.length;
    const completedTasks = memories.filter((m) => m.is_completed).length;
    const completionRate = totalMemories > 0 ? Math.round((completedTasks / totalMemories) * 100) : 0;

    const categoryBreakdown = memories.reduce((acc, m) => {
        acc[m.category] = (acc[m.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-6 pb-24">
            {/* Productivity Score */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-3xl p-6 shadow-xl text-center"
            >
                <TrendingUp size={32} className="mx-auto mb-2" />
                <h2 className="text-2xl font-bold mb-1">Productivity Score</h2>
                {loading ? (
                    <div className="text-4xl font-bold">Loading...</div>
                ) : (
                    <div className="text-6xl font-bold">{analysis?.productivityScore || 0}</div>
                )}
                <p className="text-white/80 mt-2">out of 100</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <p className="text-sm text-slate-600 mb-1">Total Memories</p>
                    <p className="text-3xl font-bold text-slate-900">{totalMemories}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <p className="text-sm text-slate-600 mb-1">Completion Rate</p>
                    <p className="text-3xl font-bold text-green-600">{completionRate}%</p>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4">Category Breakdown</h3>
                <div className="space-y-3">
                    {Object.entries(categoryBreakdown).map(([category, count]) => (
                        <div key={category}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700 capitalize">{category}</span>
                                <span className="text-slate-600">{count}</span>
                            </div>
                            <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(count / totalMemories) * 100}%` }}
                                    className="h-full bg-primary-600 rounded-full"
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Insights */}
            {!loading && analysis && (
                <>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-50 rounded-2xl p-5 border border-blue-100"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Target size={20} className="text-blue-600" />
                            <h3 className="font-bold text-blue-900">Pattern Detected</h3>
                        </div>
                        <p className="text-blue-800">{analysis.pattern}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-amber-50 rounded-2xl p-5 border border-amber-100"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Lightbulb size={20} className="text-amber-600" />
                            <h3 className="font-bold text-amber-900">Suggestion</h3>
                        </div>
                        <p className="text-amber-800">{analysis.suggestion}</p>
                    </motion.div>
                </>
            )}

            {totalMemories === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <p>No data yet. Start recording memories to see analytics!</p>
                </div>
            )}
        </div>
    );
}
