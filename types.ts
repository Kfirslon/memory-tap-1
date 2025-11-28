
export type MemoryCategory = 'task' | 'reminder' | 'idea' | 'note';

export interface Memory {
  id: string;
  userId: string;
  title: string;
  content: string; // The full transcription
  summary: string;
  category: MemoryCategory;
  audioUrl?: string; // Blob URL for local playback
  audioBlob?: string; // Base64 for storage (mocking DB)
  isFavorite: boolean;
  isCompleted?: boolean; // New field for task completion
  createdAt: string; // ISO date string
  durationSec?: number;
}

export interface ProcessingResult {
  title: string;
  transcription: string;
  summary: string;
  category: MemoryCategory;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
