
import { Memory } from "../types";

const STORAGE_KEY = "memory_tap_data";

// Mock delay to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getMemories = async (): Promise<Memory[]> => {
  await delay(500);
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveMemory = async (memory: Memory): Promise<Memory> => {
  await delay(800);
  const memories = await getMemories();
  const updatedMemories = [memory, ...memories];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMemories));
  return memory;
};

export const toggleFavorite = async (id: string): Promise<void> => {
  const memories = await getMemories();
  const updated = memories.map(m => m.id === id ? { ...m, isFavorite: !m.isFavorite } : m);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const toggleComplete = async (id: string): Promise<void> => {
  const memories = await getMemories();
  const updated = memories.map(m => m.id === id ? { ...m, isCompleted: !m.isCompleted } : m);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const deleteMemory = async (id: string): Promise<void> => {
  const memories = await getMemories();
  const updated = memories.filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
