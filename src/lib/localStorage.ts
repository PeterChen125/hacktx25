// Client-side localStorage utilities for journal entries
// This ensures each user only sees their own entries

export interface JournalEntry {
  id: string;
  content: string;
  created_at: number;
  updated_at: number;
}

export interface EmotionData {
  sentiment: string;
  confidence: number;
  emotions: string[];
  intensity: number;
  colorPalette: string[];
}

export interface EntryWithEmotion extends JournalEntry {
  emotion?: EmotionData;
}

const STORAGE_KEY = 'nebula_notes_entries';

// Get all entries from localStorage
export function getEntries(): EntryWithEmotion[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

// Save an entry to localStorage
export function saveEntry(entry: JournalEntry, emotion?: EmotionData): void {
  if (typeof window === 'undefined') return;
  
  try {
    const entries = getEntries();
    const entryWithEmotion: EntryWithEmotion = {
      ...entry,
      emotion
    };
    
    // Add new entry to the beginning of the array (most recent first)
    entries.unshift(entryWithEmotion);
    
    // Keep only the last 100 entries to prevent localStorage from getting too large
    const limitedEntries = entries.slice(0, 100);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedEntries));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Delete an entry from localStorage
export function deleteEntry(entryId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const entries = getEntries();
    const filteredEntries = entries.filter(entry => entry.id !== entryId);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEntries));
    return true;
  } catch (error) {
    console.error('Error deleting from localStorage:', error);
    return false;
  }
}

// Clear all entries (useful for testing)
export function clearAllEntries(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

// Get entry count
export function getEntryCount(): number {
  return getEntries().length;
}
