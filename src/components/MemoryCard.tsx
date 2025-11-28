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
    onUpdate?: (id: string, updates: { title: string; content: string }) => void;
}

const categoryColors: Record<string, string> = {
    task: 'bg-primary-500/10 text-primary-300 border border-primary-500/20',
    reminder: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
    idea: 'bg-accent-500/10 text-accent-300 border border-accent-500/20',
    note: 'bg-slate-500/10 text-slate-300 border border-slate-500/20',
};

export default function MemoryCard({ memory, onToggleFavorite, onToggleComplete, onDelete, onUpdate }: MemoryCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(memory.title);
    const [editContent, setEditContent] = useState(memory.content);

    const handleSave = () => {
        if (onUpdate) {
            onUpdate(memory.id, { title: editTitle, content: editContent });
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditTitle(memory.title);
        setEditContent(memory.content);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <motion.div
                layout
                className="glass-card rounded-3xl p-5 border-primary-500/50"
            >
                <div className="space-y-4">
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white font-bold focus:outline-none focus:border-primary-500/50"
                        placeholder="Title"
                    />
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-slate-300 text-sm focus:outline-none focus:border-primary-500/50 min-h-[100px]"
                        placeholder="Content"
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-500 transition-colors shadow-glow"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`glass-card rounded-3xl p-5 hover:border-primary-500/30 transition-all group ${memory.is_completed ? 'opacity-60' : ''
                }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-grow cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${categoryColors[memory.category]}`}>
                            {memory.category.toUpperCase()}
                        </span>
                        {memory.is_favorite && (
                            <Star size={14} className="text-amber-400" fill="currentColor" />
                        )}
                    </div>
                    <h3 className={`text-lg font-bold text-white mb-1 ${memory.is_completed ? 'line-through text-slate-500' : ''}`}>
                        {memory.title}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2">{memory.summary}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onToggleFavorite(memory.id)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        title="Favorite"
                    >
                        <Star
                            size={18}
                            className={memory.is_favorite ? 'text-amber-400' : 'text-slate-500'}
                            fill={memory.is_favorite ? 'currentColor' : 'none'}
                        />
                    </button>

                    {(memory.category === 'task' || memory.category === 'reminder') && (
                        <button
                            onClick={() => onToggleComplete(memory.id)}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            title="Complete"
                        >
                            <Check
                                size={18}
                                className={memory.is_completed ? 'text-emerald-400' : 'text-slate-500'}
                                strokeWidth={3}
                            />
                        </button>
                    )}

                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        title="Edit"
                    >
                        <ChevronDown size={18} className="text-slate-500 hover:text-primary-400 rotate-90" />
                    </button>

                    <button
                        onClick={() => onDelete(memory.id)}
                        className="p-2 hover:bg-red-500/20 rounded-xl transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={18} className="text-slate-500 hover:text-red-400" />
                    </button>
                </div>
            </div>

            {/* Audio Player */}
            {memory.audio_url && isExpanded && (
                <div className="mb-4">
                    <AudioPlayer audioUrl={memory.audio_url} />
                </div>
            )}

            {/* Expand / Collapse */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-primary-400 transition-colors py-1"
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
                <div className="pt-4 border-t border-white/5 mt-2">
                    <p className="text-sm text-slate-300 leading-relaxed">{memory.content}</p>
                    <p className="text-xs text-slate-600 mt-3 font-mono">
                        {new Date(memory.created_at).toLocaleString()}
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
