'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Memory } from '@/lib/types';
import AudioPlayer from './AudioPlayer';

interface MemoryCardProps {
    memory: Memory;
    onToggleFavorite: (id: string) => void;
    onToggleComplete: (id: string) => void;
    onDelete: (id: string) => void;
}

const categoryColors: Record<string, string> = {
    task: 'bg-blue-100 text-blue-700',
    reminder: 'bg-amber-100 text-amber-700',
    idea: 'bg-purple-100 text-purple-700',
    note: 'bg-slate-100 text-slate-700',
};

export default function MemoryCard({ memory, onToggleFavorite, onToggleComplete, onDelete }: MemoryCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all ${memory.is_completed ? 'opacity-60' : ''
                }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${categoryColors[memory.category]}`}>
                            {memory.category}
                        </span>
                        {memory.is_favorite && (
                            <Star size={14} className="text-amber-500" fill="currentColor" />
                        )}
                    </div>
                    <h3 className={`text-lg font-bold text-slate-900 mb-1 ${memory.is_completed ? 'line-through' : ''}`}>
                        {memory.title}
                    </h3>
                    <p className="text-sm text-slate-600">{memory.summary}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-1">
                    <button
                        onClick={() => onToggleFavorite(memory.id)}
                        className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                        <Star
                            size={18}
                            className={memory.is_favorite ? 'text-amber-500' : 'text-slate-300'}
                            fill={memory.is_favorite ? 'currentColor' : 'none'}
                        />
                    </button>

                    {(memory.category === 'task' || memory.category === 'reminder') && (
                        <button
                            onClick={() => onToggleComplete(memory.id)}
                            className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            <Check
                                size={18}
                                className={memory.is_completed ? 'text-green-500' : 'text-slate-300'}
                                strokeWidth={3}
                            />
                        </button>
                    )}

                    <button
                        onClick={() => onDelete(memory.id)}
                        className="p-2 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <Trash2 size={18} className="text-red-400 hover:text-red-600" />
                    </button>
                </div>
            </div>

            {/* Audio Player */}
            {memory.audio_url && (
                <div className="mb-3">
                    <AudioPlayer audioUrl={memory.audio_url} />
                </div>
            )}

            {/* Expand / Collapse */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors py-1"
            >
                {isExpanded ? (
                    <>
                        <ChevronUp size={14} /> Show less
                    </>
                ) : (
                    <>
                        <ChevronDown size={14} /> Full transcript
                    </>
                )}
            </button>

            {/* Expanded Content */}
            <motion.div
                initial={false}
                animate={{ height: isExpanded ? 'auto' : 0 }}
                className="overflow-hidden"
            >
                <div className="pt-3 border-t border-slate-100 mt-2">
                    <p className="text-sm text-slate-700 leading-relaxed">{memory.content}</p>
                    <p className="text-xs text-slate-400 mt-2">
                        {new Date(memory.created_at).toLocaleString()}
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
