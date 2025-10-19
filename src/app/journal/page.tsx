'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import NebulaCanvas from '@/components/NebulaCanvas';
import { useRouter } from 'next/navigation';

export default function JournalPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState<{
    sentiment: string;
    confidence: number;
    emotions: string[];
    intensity: number;
    colorPalette: string[];
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  // Debounced emotion analysis
  useEffect(() => {
    if (!content.trim()) {
      setEmotion(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: content }),
        });

        if (response.ok) {
          const data = await response.json() as {
            sentiment: string;
            confidence: number;
            emotions: string[];
            intensity: number;
            colorPalette: string[];
          };
          setEmotion(data);
        }
      } catch (error) {
        console.error('Failed to analyze:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 2000); // Analyze after 2s of no typing

    return () => clearTimeout(timeoutId);
  }, [content]);

  const handleSave = useCallback(async () => {
    if (!content.trim()) return;

    setIsSaving(true);
    setSavedMessage('');

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setSavedMessage('✨ Entry saved to the cosmos');
        setTimeout(() => setSavedMessage(''), 3000);
        
        // Clear the editor after save
        setTimeout(() => {
          setContent('');
          setEmotion(null);
        }, 1500);
      } else {
        setSavedMessage('Failed to save entry');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      setSavedMessage('Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  }, [content]);

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
            ✨ Nebula Notes
          </motion.h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/entries')}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
            >
              📚 My Entries
            </button>
            <button
              onClick={() => router.push('/cosmos')}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              🌌 Ask the Cosmos
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Journal Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl font-bold mb-2">
                How are you feeling today?
              </h2>
              <p className="text-gray-400">
                Write your thoughts, and watch them transform into a cosmic nebula
              </p>
            </div>

            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing... the cosmos is listening ✨"
                className="w-full h-96 p-6 rounded-2xl bg-white/5 border border-white/10 
                         focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                         outline-none resize-none text-lg leading-relaxed
                         placeholder:text-gray-500 transition-all"
                maxLength={2000}
              />
              <div className="absolute bottom-4 right-6 text-sm text-gray-500">
                {content.length} / 2000
              </div>
            </div>

            {/* Emotion Status */}
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-sm text-purple-400">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                Analyzing emotions...
              </div>
            )}

            {emotion && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2"
              >
                {emotion.emotions.map((em: string) => (
                  <span
                    key={em}
                    className="px-3 py-1 rounded-full bg-white/10 text-sm capitalize"
                  >
                    {em}
                  </span>
                ))}
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-sm">
                  {emotion.sentiment} ({Math.round(emotion.confidence * 100)}%)
                </span>
              </motion.div>
            )}

            {/* Save Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={!content.trim() || isSaving}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500
                         hover:from-purple-600 hover:to-blue-600 disabled:opacity-50
                         disabled:cursor-not-allowed font-semibold transition-all
                         transform hover:scale-105 active:scale-95"
              >
                {isSaving ? 'Saving...' : '💫 Save to Cosmos'}
              </button>
              {savedMessage && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-green-400 text-sm"
                >
                  {savedMessage}
                </motion.span>
              )}
            </div>
          </motion.div>

          {/* Nebula Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="sticky top-8"
          >
            <h3 className="text-xl font-semibold mb-4">Your Emotional Nebula</h3>
            <div className="flex justify-center">
              {emotion ? (
                <NebulaCanvas
                  emotions={emotion.emotions}
                  intensity={emotion.intensity}
                  colorPalette={emotion.colorPalette}
                  size="medium"
                />
              ) : (
                <div
                  className="flex items-center justify-center rounded-2xl bg-white/5 border border-white/10"
                  style={{ width: 500, height: 500 }}
                >
                  <p className="text-gray-500 text-center px-8">
                    Start writing to see your emotions
                    <br />
                    transform into a nebula ✨
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

