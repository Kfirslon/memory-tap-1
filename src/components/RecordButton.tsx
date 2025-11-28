'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Loader2 } from 'lucide-react';

interface RecordButtonProps {
    isRecording: boolean;
    isProcessing: boolean;
    onStart: () => void;
    onStop: () => void;
}

export default function RecordButton({ isRecording, isProcessing, onStart, onStop }: RecordButtonProps) {
    const handleClick = () => {
        if (isRecording) {
            onStop();
        } else if (!isProcessing) {
            onStart();
        }
    };

    return (
        <motion.button
            onClick={handleClick}
            disabled={isProcessing}
            className="relative group"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
        >
            {/* Pulse Animation (when recording) */}
            {isRecording && (
                <>
                    <motion.div
                        className="absolute inset-0 bg-red-500 rounded-full blur-xl"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.div
                        className="absolute inset-0 bg-red-500 rounded-full"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.8, 0, 0.8],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                </>
            )}

            {/* Idle Glow (when not recording) */}
            {!isRecording && !isProcessing && (
                <div className="absolute inset-0 bg-primary-500 rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
            )}

            {/* Main Button */}
            <motion.div
                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all border border-white/20 ${isRecording
                    ? 'bg-gradient-to-br from-red-500 to-pink-600'
                    : isProcessing
                        ? 'bg-slate-800 cursor-not-allowed'
                        : 'bg-gradient-to-br from-primary-500 to-accent-600'
                    }`}
                animate={isRecording ? { scale: [1, 1.05, 1] } : {}}
                transition={isRecording ? { duration: 1, repeat: Infinity } : {}}
            >
                {isProcessing ? (
                    <Loader2 className="text-white/70 animate-spin" size={32} />
                ) : (
                    <Mic className="text-white drop-shadow-md" size={32} strokeWidth={2.5} />
                )}
            </motion.div>

            {/* Status Text */}
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-bold tracking-wide ${isRecording ? 'text-red-400' : isProcessing ? 'text-slate-500' : 'text-primary-300'
                    }`}
            >
                {isRecording ? 'Listening...' : isProcessing ? 'Thinking...' : 'Tap to Record'}
            </motion.p>
        </motion.button>
    );
}
