-- Nebula Notes Database Schema

-- Journal entries table
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Emotions/sentiment analysis results
CREATE TABLE IF NOT EXISTS emotions (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL,
  sentiment TEXT NOT NULL, -- 'positive', 'negative', 'neutral'
  confidence REAL NOT NULL,
  emotions TEXT NOT NULL, -- JSON array: ['joy', 'calm', 'sadness']
  intensity REAL NOT NULL, -- 0-1 scale
  color_palette TEXT NOT NULL, -- JSON: color codes for nebula
  created_at INTEGER NOT NULL,
  FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
);

-- Chat history (optional - for storing cosmos chat)
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  entry_id TEXT, -- optional link to journal entry
  created_at INTEGER NOT NULL,
  FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emotions_entry_id ON emotions(entry_id);
CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON chat_messages(created_at DESC);

