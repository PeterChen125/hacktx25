# 🌌 Nebula Notes

**Transform Your Emotions Into Cosmic Art**

A cosmic journaling app for HackTX 2025 that uses AI to analyze your emotions and render them as beautiful, real-time nebula visualizations.

![Nebula Notes](https://img.shields.io/badge/HackTX-2025-purple?style=for-the-badge)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers%20AI-orange?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge)

## ✨ Features

### 📝 Journaling

Write your thoughts in a distraction-free, beautiful editor with real-time emotion analysis.

### 🌈 Emotion → Nebula

Watch your emotions transform into dynamic WebGL nebulas:

- **Joy**: Bright blues & purples
- **Calm**: Soft purple & pink
- **Sadness**: Deep blues
- **Anger**: Reds & oranges
- **Anxiety**: Warm oranges

### 🔭 Ask the Cosmos

An AI assistant that:

- Answers astronomy questions
- Provides gentle reflections on your journal entries
- Powered by Llama 3.1 8B Instruct

### 📚 Entry History

View all your past entries with their associated emotional nebulas in a beautiful timeline.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Cloudflare account (for deployment)

### AI Options (Choose One)

1. **OpenAI API** (recommended) - Add `OPENAI_API_KEY` to `.env.local`
2. **Ollama Local AI** (free) - Install Ollama and run `ollama serve`
3. **Smart Fallbacks** (always works) - No setup needed

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
- **AI**: Workers AI (Llama 3.1, DistilBERT)
- **Database**: D1 (SQLite)
- **Cache**: KV (Key-Value Store)
- **Deployment**: Cloudflare Pages + OpenNext

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

- Workers AI for sentiment analysis & chat
- D1 for persistent storage
- KV for caching
- Edge inference for speed

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
      /analyze      → Sentiment analysis API
      /chat         → AI chat API
      /entries      → CRUD API
    /journal        → Journal editor page
    /cosmos         → Chat interface page
    /entries        → History page
    page.tsx        → Landing page
  /components
    NebulaCanvas.tsx → WebGL nebula visualization
/schema.sql         → D1 database schema
/wrangler.jsonc     → Cloudflare configuration
```

## 🤝 Contributing

This is a hackathon project, but feel free to fork and experiment!

## 📄 License

MIT

## 🌟 Acknowledgments

- Cloudflare for the amazing Workers AI platform
- HackTX 2025 for the inspiration
- The cosmos for being endlessly fascinating ✨

---

Built with 💜 by [Your Team Name]

_May your emotions shine as brightly as the stars_ 🌟
