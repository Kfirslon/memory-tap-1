
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BrainCircuit, Mic, Home, Sparkles, User as UserIcon, LogOut, TrendingUp } from 'lucide-react';
import RecordButton from './components/RecordButton';
import MemoryCard from './components/MemoryCard';
import AuthScreen from './components/AuthScreen';
import FocusView from './components/FocusView';
import AnalyticsView from './components/AnalyticsView';
import { Memory, MemoryCategory } from './types';
import { processAudioMemory, blobToBase64 } from './services/geminiService';
import { getMemories, saveMemory, toggleFavorite as toggleFavService, deleteMemory as deleteMemService, toggleComplete } from './services/storageService';
import { signOut } from './services/authService';

type Tab = 'memories' | 'focus' | 'analytics' | 'profile';

const App: React.FC = () => {
  // State
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<MemoryCategory | 'all'>('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showToast, setShowToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('memories');

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Effects
  useEffect(() => {
    if (isLoggedIn) {
      loadMemories();
    }
  }, [isLoggedIn]);

  // Toast Helper
  const toast = (message: string, type: 'success' | 'error' = 'success') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  const loadMemories = async () => {
    try {
      const data = await getMemories();
      // Rehydrate blob URLs for session
      const hydrated = data.map(m => {
        if (m.audioBlob && !m.audioUrl) {
            try {
                 const byteCharacters = atob(m.audioBlob);
                 const byteNumbers = new Array(byteCharacters.length);
                 for (let i = 0; i < byteCharacters.length; i++) {
                     byteNumbers[i] = byteCharacters.charCodeAt(i);
                 }
                 const byteArray = new Uint8Array(byteNumbers);
                 const blob = new Blob([byteArray], { type: 'audio/webm' });
                 return { ...m, audioUrl: URL.createObjectURL(blob) };
            } catch(e) {
                return m;
            }
        }
        return m;
      })
      setMemories(hydrated);
    } catch (error) {
      console.error("Failed to load memories", error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '' }); 
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleProcessing(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast("Microphone access denied or not available", 'error');
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true); 
    }
  };

  const handleProcessing = async (audioBlob: Blob) => {
    try {
        if (audioBlob.size < 1000) {
            toast("Recording too short", "error");
            setIsProcessing(false);
            return;
        }

        const result = await processAudioMemory(audioBlob);

        const base64Audio = await blobToBase64(audioBlob);
        const newMemory: Memory = {
            id: crypto.randomUUID(),
            userId: 'user-1',
            createdAt: new Date().toISOString(),
            isFavorite: false,
            isCompleted: false,
            audioUrl: URL.createObjectURL(audioBlob), 
            audioBlob: base64Audio, 
            title: result.title,
            summary: result.summary,
            category: result.category,
            content: result.transcription,
        };

        await saveMemory(newMemory);
        setMemories(prev => [newMemory, ...prev]);
        toast("Memory saved successfully!");
        setActiveTab('memories'); // Switch to memories to see the new one
    } catch (error) {
        console.error(error);
        toast("Failed to process memory. Check API Key.", "error");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    await toggleFavService(id);
    setMemories(prev => prev.map(m => m.id === id ? { ...m, isFavorite: !m.isFavorite } : m));
  };

  const handleToggleComplete = async (id: string) => {
    await toggleComplete(id);
    setMemories(prev => prev.map(m => m.id === id ? { ...m, isCompleted: !m.isCompleted } : m));
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Delete this memory?")) return;
    await deleteMemService(id);
    setMemories(prev => prev.filter(m => m.id !== id));
    toast("Memory deleted");
  };

  const handleLogout = async () => {
    await signOut();
    setIsLoggedIn(false);
  }

  const filteredMemories = memories
    .filter(m => filterCategory === 'all' || m.category === filterCategory)
    .filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // --- Auth Screen ---
  if (!isLoggedIn) {
    return <AuthScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // --- Main Dashboard ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary-200 selection:text-primary-900 pb-20">
        
        {/* Background Ambient Effects */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
             <div className="absolute -top-[10%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-primary-100/40 blur-3xl mix-blend-multiply" />
             <div className="absolute top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-100/40 blur-3xl mix-blend-multiply" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6 min-h-screen flex flex-col">
            
            {/* Header / Search */}
            <header className="mb-6 flex justify-between items-center sticky top-0 bg-slate-50/80 backdrop-blur-md z-20 py-2 -mx-4 px-4 transition-all">
                {activeTab === 'memories' ? (
                     <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search memories..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border-0 shadow-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-800 placeholder:text-slate-400"
                        />
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="bg-primary-600 p-2 rounded-xl text-white shadow-lg shadow-primary-500/20">
                            <BrainCircuit size={20} />
                        </div>
                        <span className="font-bold text-xl text-slate-800 tracking-tight">Memory Tap</span>
                    </div>
                )}
            </header>

            <main className="flex-grow">
                <AnimatePresence mode="wait">
                    {activeTab === 'memories' && (
                        <motion.div 
                            key="memories"
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            {/* Filter Chips */}
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                {(['all', 'task', 'reminder', 'idea', 'note'] as const).map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilterCategory(cat)}
                                        className={`
                                            px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all
                                            ${filterCategory === cat 
                                                ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20 scale-105' 
                                                : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
                                            }
                                        `}
                                    >
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </button>
                                ))}
                            </div>

                             {/* Empty State */}
                            {memories.length === 0 && !isProcessing && (
                                <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                                    <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                        <Mic className="text-slate-300" size={32} />
                                    </div>
                                    <p className="text-slate-600 font-medium text-lg">Your mind is clear</p>
                                    <p className="text-sm text-slate-400 max-w-xs">Tap the button below to store a thought, task, or idea.</p>
                                </div>
                            )}

                            <div className="space-y-4 pb-24">
                                <AnimatePresence mode='popLayout'>
                                    {filteredMemories.map((memory) => (
                                        <MemoryCard 
                                            key={memory.id} 
                                            memory={memory} 
                                            onToggleFavorite={handleToggleFavorite}
                                            onToggleComplete={handleToggleComplete}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'focus' && (
                        <motion.div 
                            key="focus"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        >
                            <FocusView memories={memories} onCompleteTask={handleToggleComplete} />
                        </motion.div>
                    )}

                     {activeTab === 'analytics' && (
                        <motion.div 
                            key="analytics"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        >
                            <AnalyticsView memories={memories} />
                        </motion.div>
                    )}

                     {activeTab === 'profile' && (
                        <motion.div 
                            key="profile"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="p-4"
                        >
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center mb-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary-100 to-blue-100" />
                                <div className="relative mt-12 w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-slate-400 shadow-md ring-4 ring-white">
                                    <UserIcon size={40} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Demo User</h2>
                                <p className="text-slate-500 text-sm">user@example.com</p>
                                <div className="mt-4 flex justify-center gap-2">
                                     <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Premium Member</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleLogout}
                                className="w-full bg-red-50 text-red-600 font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                            >
                                <LogOut size={20} /> Sign Out
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>

        {/* Floating Record Button (Only on Memories Tab) */}
        <AnimatePresence>
            {activeTab === 'memories' && (
                <motion.div 
                    initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                    className="fixed bottom-24 left-0 right-0 z-40 flex justify-center pointer-events-none"
                >
                    <div className="pointer-events-auto">
                        <RecordButton 
                            isRecording={isRecording}
                            isProcessing={isProcessing}
                            onStart={startRecording}
                            onStop={stopRecording}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
       
        {/* Bottom Tab Navigation */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[90vw]">
            <div className="bg-slate-900/90 backdrop-blur-xl text-white p-1.5 rounded-full shadow-2xl shadow-slate-900/40 flex items-center gap-1 border border-white/10">
                <TabButton 
                    active={activeTab === 'memories'} 
                    onClick={() => setActiveTab('memories')} 
                    icon={<Home size={20} />} 
                    label="Home" 
                />
                <TabButton 
                    active={activeTab === 'focus'} 
                    onClick={() => setActiveTab('focus')} 
                    icon={<Sparkles size={20} />} 
                    label="Focus" 
                />
                 <TabButton 
                    active={activeTab === 'analytics'} 
                    onClick={() => setActiveTab('analytics')} 
                    icon={<TrendingUp size={20} />} 
                    label="Stats" 
                />
                <TabButton 
                    active={activeTab === 'profile'} 
                    onClick={() => setActiveTab('profile')} 
                    icon={<UserIcon size={20} />} 
                    label="Profile" 
                />
            </div>
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
            {showToast && (
                <motion.div
                    initial={{ opacity: 0, y: -20, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -20, x: '-50%' }}
                    className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-xl text-sm font-semibold flex items-center gap-2 z-[60] backdrop-blur-md
                        ${showToast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-slate-800/90 text-white'}
                    `}
                >
                    {showToast.message}
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button 
        onClick={onClick}
        className={`relative px-4 sm:px-5 py-3 rounded-full flex items-center justify-center transition-all duration-300 ${active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
    >
        {active && (
            <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 bg-white/20 rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <span className="relative z-10 flex items-center gap-2">
            {icon}
            {active && <motion.span initial={{width: 0, opacity: 0}} animate={{width: 'auto', opacity: 1}} className="text-sm font-medium overflow-hidden whitespace-nowrap hidden sm:block">{label}</motion.span>}
        </span>
    </button>
)

export default App;
