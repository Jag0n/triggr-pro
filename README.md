# Triggr — The Shooters OS

A training companion for ISSF pistol and rifle shooters: structured sessions, shot logging, a match-format simulator, and progress history. Built with Expo (React Native + Web) so the same codebase ships to web, iOS, and Android.

Product context and architecture decisions live in the Obsidian vault (`Triggr.pro/`), not in this repo.

## Get started

1. Copy environment variables

   ```bash
   cp .env.example .env
   # fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the app

   ```bash
   npm run web      # web
   npm run ios      # iOS simulator
   npm run android  # Android emulator
   ```

## Structure

- `src/app/` — screens, file-based routing via Expo Router
  - `(tabs)/` — Train, Simulator, History, Profile
- `src/lib/supabase.ts` — Supabase client
- `src/types/database.ts` — hand-written types matching the Supabase schema (regenerate once a project exists)
- `Brand/`, `Context/` — logo and reference material
