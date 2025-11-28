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
            className="relative"
            whileTap={{ scale: 0.95 }}
        >
            {/* Pulse Animation (when recording) */}
            {isRecording && (
                <>
                    <motion.div
                        className="absolute inset-0 bg-red-500 rounded-full"
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.7, 0, 0.7],
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
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 0.3,
                        }}
                    />
                </>
            )}

            {/* Main Button */}
            <motion.div
                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all ${isRecording
                        ? 'bg-red-500 shadow-red-500/50'
                        : isProcessing
                            ? 'bg-slate-400 shadow-slate-400/50 cursor-not-allowed'
                            : 'bg-primary-600 shadow-primary-500/50 hover:bg-primary-700'
                    }`}
                animate={isRecording ? { scale: [1, 1.05, 1] } : {}}
                transition={isRecording ? { duration: 1, repeat: Infinity } : {}}
            >
                {isProcessing ? (
                    <Loader2 className="text-white animate-spin" size={32} />
                ) : (
                    <Mic className="text-white" size={32} />
                )}
            </motion.div>

            {/* Status Text */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-semibold ${isRecording ? 'text-red-600' : isProcessing ? 'text-slate-600' : 'text-primary-600'
                    }`}
            >
                {isRecording ? 'Recording...' : isProcessing ? 'Processing...' : 'Tap to Record'}
            </motion.p>
        </motion.button>
    );
}
