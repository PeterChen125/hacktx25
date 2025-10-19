'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import NebulaCanvas from '@/components/NebulaCanvas';
import { formatDistance } from 'date-fns';

interface Entry {
  id: string;
  content: string;
  created_at: number;
  sentiment?: string;
  emotions?: string;
  intensity?: number;
  color_palette?: string;
}

export default function EntriesPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/entries');
      if (response.ok) {
        const data = await response.json() as { entries: Entry[] };
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry from the cosmos?')) return;

    try {
      const response = await fetch(`/api/entries?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
        if (selectedEntry?.id === id) {
          setSelectedEntry(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1A1F3A] to-[#0A0E27] text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
          >
            📚 Your Cosmic Journey
          </motion.h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/journal')}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              ✍️ New Entry
            </button>
            <button
              onClick={() => router.push('/cosmos')}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
            >
              🌌 Ask Cosmos
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400">Loading your cosmic memories...</p>
            </div>
          </div>
        ) : entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-64 space-y-4"
          >
            <p className="text-gray-400 text-lg">No entries yet</p>
            <button
              onClick={() => router.push('/journal')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              ✨ Create Your First Entry
            </button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Entries List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">
                {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}
              </h2>
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                {entries.map((entry, index) => {
                  const emotions = entry.emotions
                    ? JSON.parse(entry.emotions)
                    : [];
                  const isSelected = selectedEntry?.id === entry.id;

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedEntry(entry)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white/10 border-purple-500'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-gray-400">
                          {formatDistance(entry.created_at, Date.now(), {
                            addSuffix: true,
                          })}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(entry.id);
                          }}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="line-clamp-3 text-gray-200 mb-2">
                        {entry.content}
                      </p>
                      {emotions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {emotions.map((em: string) => (
                            <span
                              key={em}
                              className="px-2 py-1 rounded-full bg-white/10 text-xs capitalize"
                            >
                              {em}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Selected Entry Detail */}
            <div className="sticky top-8">
              {selectedEntry ? (
                <motion.div
                  key={selectedEntry.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 mb-4">
                      {new Date(selectedEntry.created_at).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )}
                    </p>
                    <p className="text-lg leading-relaxed whitespace-pre-wrap">
                      {selectedEntry.content}
                    </p>
                  </div>

                  {selectedEntry.color_palette && (
                    <div className="flex justify-center">
                      <NebulaCanvas
                        emotions={
                          selectedEntry.emotions
                            ? JSON.parse(selectedEntry.emotions)
                            : ['neutral']
                        }
                        intensity={selectedEntry.intensity || 0.5}
                        colorPalette={JSON.parse(selectedEntry.color_palette)}
                        size="medium"
                      />
                    </div>
                  )}
                </motion.div>
              ) : (
                <div
                  className="flex items-center justify-center rounded-2xl bg-white/5 border border-white/10"
                  style={{ height: 500 }}
                >
                  <p className="text-gray-500">
                    Select an entry to view its nebula
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(155, 89, 182, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(155, 89, 182, 0.8);
        }
      `}</style>
    </div>
  );
}

