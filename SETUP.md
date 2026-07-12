# Triggr — Supabase setup (5 minutes)

The app works fully without this (data stays on the device). Do this once to enable
accounts and cloud backup.

## 1. Create the project

1. Go to [supabase.com](https://supabase.com) → sign in → **New project**
2. Name: `triggr` · pick the region closest to your users (e.g. `ap-south-1` Mumbai) · set a database password (save it somewhere)
3. Wait ~2 minutes for provisioning

## 2. Create the tables

1. In the Supabase dashboard: **SQL Editor** → **New query**
2. Paste the entire contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
3. Click **Run** — you should see "Success. No rows returned"

## 3. Connect the app

1. Dashboard → **Project Settings** → **API**
2. Copy **Project URL** and the **anon public** key
3. In this repo:

   ```bash
   cp .env.example .env
   ```

   and fill in:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

4. Restart the dev server (`npm run web`). The welcome screen now shows
   Google + email sign-in.

## 4. (Optional) Google sign-in

1. Dashboard → **Authentication** → **Providers** → **Google** → enable
2. Follow Supabase's inline guide to create Google OAuth credentials
   (Google Cloud Console → OAuth client ID → add the callback URL Supabase shows you)
3. Add your site URL (e.g. `http://localhost:8081` for dev, `https://triggr.pro` for prod)
   under **Authentication** → **URL Configuration**

## Notes

- Email auth works immediately with no extra config (confirmation emails are on by
  default — turn off "Confirm email" under Authentication → Providers → Email for
  faster testing).
- Data logged before signing in stays on the device; sessions logged while signed
  in sync automatically.
