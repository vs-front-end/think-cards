# ThinkCards

Free, open-source flashcard app with spaced repetition powered by the [FSRS algorithm](https://github.com/open-spaced-repetition/fsrs4anki). Study smarter, retain more, and build long-term memory.

**[think-cards.com](https://think-cards.com)**

## Features

- **FSRS Spaced Repetition** - Each card gets its own adaptive schedule based on your memory performance
- **Offline-First** - Study anywhere without internet. Data syncs automatically when you reconnect
- **PWA** - Install on desktop or mobile. No app store required
- **Decks & Subdecks** - Organize cards by subject, chapter, or any structure
- **Card Types** - Basic (front/back), cloze (fill-in-the-blank), and typing cards
- **Progress Tracking** - Streaks, study time, card distribution, and daily goals
- **Multi-Language** - English, Portuguese (BR), and Spanish
- **Themes** - Light, dark, and ocean

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript (strict) |
| Routing | TanStack Router (file-based, auto code-split) |
| Data Fetching | TanStack Query |
| UI Components | [Stellar UI Kit](https://stellar-ui-one.vercel.app) + Radix UI |
| Styling | Tailwind CSS v3 |
| State | Zustand |
| Local DB | Dexie.js (IndexedDB) |
| Backend | Supabase (auth, database, storage) |
| SRS Engine | ts-fsrs |
| i18n | i18next + react-i18next |
| PWA | vite-plugin-pwa + Workbox |
| Deploy | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Setup

```bash
git clone https://github.com/vs-front-end/think-cards.git
cd think-cards
npm install
```

Create a `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
npm run start
```

### Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
  components/    # Reusable UI components
  hooks/         # Custom React hooks
  lib/           # Core libraries (db, supabase, i18n, sync)
  locales/       # Translation files (en, es, pt-BR)
  routes/        # File-based routes (TanStack Router)
  store/         # Zustand stores
  utils/         # Utility functions
```

## License

MIT
