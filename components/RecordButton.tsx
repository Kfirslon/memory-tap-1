import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2 } from 'lucide-react';

interface RecordButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStart: () => void;
  onStop: () => void;
}

const RecordButton: React.FC<RecordButtonProps> = ({ 
  isRecording, 
  isProcessing, 
  onStart, 
  onStop 
}) => {
  
  const handleClick = () => {
    if (isProcessing) return;
    if (isRecording) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing Rings */}
      <AnimatePresence>
        {isRecording && (
          <>
            <motion.div
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 2 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              className="absolute w-20 h-20 rounded-full bg-primary-400/50"
            />
             <motion.div
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
              className="absolute w-20 h-20 rounded-full bg-primary-300/30"
            />
          </>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        animate={{
            scale: isRecording ? 1.1 : 1,
            boxShadow: isRecording ? "0px 0px 20px rgba(139, 92, 246, 0.5)" : "0px 4px 6px rgba(0,0,0,0.1)"
        }}
        className={`
            z-10 w-20 h-20 rounded-full flex items-center justify-center
            transition-colors duration-300
            ${isRecording 
                ? 'bg-red-500 text-white' 
                : 'bg-gradient-to-br from-primary-500 to-primary-700 text-white'
            }
            ${isProcessing ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isProcessing ? (
          <Loader2 className="w-8 h-8 animate-spin" />
        ) : isRecording ? (
          <Square fill="currentColor" className="w-8 h-8 rounded-sm" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
      </motion.button>
      
      {/* Status Text */}
      <div className="absolute -bottom-12 w-40 text-center">
        <AnimatePresence mode='wait'>
            {isProcessing ? (
                <motion.span 
                    key="proc"
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                    className="text-sm font-medium text-primary-600"
                >
                    Processing thoughts...
                </motion.span>
            ) : isRecording ? (
                <motion.span 
                    key="rec"
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                    className="text-sm font-medium text-red-500"
                >
                    Listening...
                </motion.span>
            ) : (
                <motion.span 
                    key="idle"
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                    className="text-sm font-medium text-slate-400"
                >
                    Tap to remember
                </motion.span>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RecordButton;
