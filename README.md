# 🌌 Nebula Notes

**Transform Your Emotions Into Cosmic Art**

A cosmic journaling app for HackTX 2025 that uses AI to analyze your emotions and render them as beautiful, real-time nebula visualizations. Each user's journal entries are stored locally in their browser for complete privacy.

![Nebula Notes](https://img.shields.io/badge/HackTX-2025-purple?style=for-the-badge)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers%20AI-orange?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge)
![Privacy](https://img.shields.io/badge/Privacy-Local%20Storage-green?style=for-the-badge)

## ✨ Features

### 📝 Journaling

Write your thoughts in a distraction-free, beautiful editor with real-time emotion analysis.

### 🌈 Emotion → Nebula

Watch your emotions transform into dynamic WebGL nebulas with realistic cosmic formations:

- **Realistic Nebula Physics**: Cores, floating clouds, and spectral colors
- **Emotion-Based Colors**: Joy (bright blues & purples), Calm (soft purple & pink), Sadness (deep blues), Anger (reds & oranges), Anxiety (warm oranges)
- **Dynamic Particle Systems**: Twinkling stars, drifting clouds, and pulsing cores
- **LLM-Powered Analysis**: Advanced emotion detection using Llama 3.1 for nuanced understanding

### 🔭 Ask the Cosmos

An AI assistant that:

- Answers astronomy questions with cosmic expertise
- Provides gentle reflections on your journal entries
- Powered by Cloudflare Workers AI (Llama 3.1 8B Instruct) - **FREE!**
- Smart fallbacks ensure it always works

### 📚 Entry History

View all your past entries with their associated emotional nebulas in a beautiful timeline. **Each user's entries are stored locally in their browser for complete privacy.**

### 🔒 Privacy-First Design

- **Local Storage**: All journal entries stay in your browser
- **No Shared Data**: Each user has their own private journal
- **Offline Capable**: Works without internet connection
- **No Server Storage**: Your thoughts never leave your device

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Cloudflare account (for deployment)

### AI Setup

**Cloudflare Workers AI LLM** - We use Cloudflare Workers AI with Llama 3.1 8B Instruct for emotion analysis and chat functionality. Works out of the box when deployed!

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd hacktx25

# Install dependencies
npm install

# Run development server (works immediately!)
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

### Optional: Enhanced AI Setup

**For OpenAI API** (best experience):

```bash
# Create .env.local file
echo "OPENAI_API_KEY=your_key_here" > .env.local
```

**For Ollama** (free local AI):

```bash
# Install Ollama from https://ollama.ai/
ollama pull llama3.2
ollama serve
```

**For Cloudflare Deployment** (see SETUP.md):

```bash
npx wrangler d1 create nebula-notes-db
npx wrangler kv:namespace create JOURNAL_KV
# Update wrangler.jsonc with your IDs
npx wrangler d1 execute nebula-notes-db --file=./schema.sql
```

## 📦 Deploy

```bash
npm run deploy
```

Your app will be deployed to Cloudflare Pages + Workers!

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS 4, Framer Motion
- **Backend**: Cloudflare Workers
- **AI**: Workers AI (Llama 3.1 8B Instruct) - FREE!
- **Storage**: Browser localStorage (privacy-first)
- **Database**: D1 (SQLite) - for shared features only
- **Cache**: KV (Key-Value Store)
- **Deployment**: Cloudflare Pages + OpenNext
- **Animation**: WebGL Canvas API for realistic nebula physics

## 🎯 HackTX 2025 Categories

This project targets:

✅ **Best Celestial Theme**

- Space-themed UI with nebula visualizations
- Astronomy Q&A chatbot
- Cosmic personality throughout

✅ **Best Design**

- Beautiful micro-interactions
- Smooth animations with Framer Motion
- Delightful UX with low friction

✅ **Best AI App with Cloudflare**

- Workers AI for sentiment analysis & chat (FREE!)
- Advanced LLM-powered emotion analysis
- Edge inference for speed
- Smart fallbacks for reliability
- Privacy-first local storage

## 📖 Documentation

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## 🎨 Screenshots

### Landing Page

Beautiful animated starfield with gradient hero section.

### Journal Editor

Clean, distraction-free editor with live emotion preview.

### Nebula Visualization

Real-time particle system that responds to your emotions.

### Cosmos Chat

AI-powered astronomy Q&A and gentle reflections.

## 🛠️ Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Cloudflare
npm run deploy

# View logs
npx wrangler tail
```

## 📝 Project Structure

```
/src
  /app
    /api
      /analyze      → LLM-powered emotion analysis API
      /chat         → AI chat API (Cloudflare Workers AI)
      /entries      → CRUD API (legacy, now uses localStorage)
      /entries-local → Local storage API
    /journal        → Journal editor page
    /cosmos         → Chat interface page
    /entries        → History page
    page.tsx        → Landing page
  /components
    NebulaCanvas.tsx → WebGL nebula visualization with realistic physics
  /lib
    localStorage.ts  → Privacy-first local storage utilities
/schema.sql         → D1 database schema
/wrangler.jsonc     → Cloudflare configuration
```

## 🤝 Contributing

This is a hackathon project, but feel free to fork and experiment!

## 📄 License

MIT

## 🌟 Acknowledgments

- Cloudflare for the amazing Workers AI platform (FREE!)
- HackTX 2025 for the inspiration
- The cosmos for being endlessly fascinating ✨
- WebGL Canvas API for realistic nebula physics
- LocalStorage for privacy-first design

## 🚀 Live Demo

**Try it now**: [https://nebula-notes.bychen125.workers.dev](https://nebula-notes.bychen125.workers.dev)

---

Built with 💜 for HackTX 2025

_May your emotions shine as brightly as the stars_ 🌟
