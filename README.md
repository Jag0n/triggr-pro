# Triggr — The Shooters OS

A training companion for ISSF and NRAI pistol and rifle shooters: shot logging, a match-format timer with spoken commands, score trends, and a profile/settings vertical. Built with Expo (React Native + Web) so the same codebase ships to web, iOS, and Android.

Product context and architecture decisions also live in the Obsidian vault (`Triggr.pro/`); this repo is the code plus reference docs (`docs/`) that inform it.

## Get started

1. Copy environment variables

   ```bash
   cp .env.example .env
   # fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
   ```

   See [SETUP.md](SETUP.md) for creating the Supabase project. The app works fully without this — data stays on-device until you connect an account.

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
  - `(tabs)/` — Home, Log, Timer, Trends, Profile
  - `welcome.tsx`, `onboarding.tsx` — auth + first-run setup
  - `session/`, `timer/` — full-screen logging and timer-run flows
- `src/constants/events.ts` — the event/format registry (pistol + rifle) driving scoring and timer sequences; add a format here to support it everywhere
- `src/providers/` — theme (5 selectable color themes × dark/light, picked in Profile → Appearance), auth, and app-state (local-first + Supabase sync) context
- `src/constants/theme.ts` — the theme registry (Ember, Ocean, Ranger, Podium, Violet); add a theme here and it appears in the picker automatically
- `src/lib/supabase.ts`, `src/lib/sync.ts` — Supabase client and best-effort cloud sync
- `supabase/migrations/` — SQL schema for the Supabase project
- `docs/` — ISSF/NRAI event format reference and the product roadmap (V1–V4)
- `Brand/`, `Context/`, `Competitor analysis/` — logo and research material
