
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Mail, ArrowRight } from 'lucide-react';
import { signInWithGoogle } from '../services/authService';
import { isSupabaseConfigured } from '../services/supabase';

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    if (!isSupabaseConfigured()) {
        // Fallback for demo mode if no keys are present
        setTimeout(() => {
            onLoginSuccess();
        }, 1000);
        return;
    }

    try {
      await signInWithGoogle();
      // Supabase redirect handles the rest, but for SPA feel we might catch success if redirect is off
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Google');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
        onLoginSuccess();
        setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 relative overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-200/20 blur-3xl" 
        />
        <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[10%] right-[5%] w-[50%] h-[50%] rounded-full bg-blue-200/20 blur-3xl" 
        />

      <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative max-w-md w-full bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 p-10 border border-white/50 text-center z-10"
      >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-500/30"
          >
              <BrainCircuit size={40} />
          </motion.div>

          <h1 className="text-4xl font-bold text-slate-800 mb-3 tracking-tight">Memory Tap</h1>
          <p className="text-slate-500 mb-10 text-lg leading-relaxed">
            Your second brain. Capture thoughts, tasks, and ideas with a single tap.
          </p>
          
          <div className="space-y-4">
            <button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl border border-slate-200 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md flex items-center justify-center gap-3 group"
            >
               {isLoading ? (
                   <span className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
               ) : (
                   <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                   </>
               )}
            </button>

            <button 
                onClick={handleDemoLogin}
                className="w-full py-4 bg-slate-900 text-white font-semibold rounded-2xl shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.01] hover:bg-slate-800 flex items-center justify-center gap-2"
            >
                Try Demo Mode <ArrowRight size={18} className="opacity-80" />
            </button>
          </div>
          
          {error && (
              <p className="mt-4 text-sm text-red-500 bg-red-50 py-2 px-4 rounded-lg animate-pulse">{error}</p>
          )}

          <p className="mt-8 text-xs text-slate-400">
            Protected by reCAPTCHA and Subject to the Privacy Policy.
          </p>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
