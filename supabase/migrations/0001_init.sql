-- Triggr initial schema
-- Run this in the Supabase SQL Editor (or `supabase db push` with the CLI).

-- Profiles: one row per user, mirrors the in-app profile.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  discipline text not null check (discipline in ('pistol', 'rifle')),
  primary_event_id text not null,
  updated_at timestamptz not null default now()
);

-- Sessions: one row per training session. Series/shots live in jsonb so the
-- offline-first client can sync a whole session with a single upsert.
create table public.sessions (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id text not null,
  kind text not null check (kind in ('match', 'practice')),
  started_at timestamptz not null,
  ended_at timestamptz not null,
  series jsonb not null default '[]'::jsonb,
  note text,
  created_at timestamptz not null default now()
);

create index sessions_user_started_idx on public.sessions (user_id, started_at desc);

-- Row Level Security: users can only touch their own rows.
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid () = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid () = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid () = id);

create policy "sessions_select_own" on public.sessions
  for select using (auth.uid () = user_id);

create policy "sessions_insert_own" on public.sessions
  for insert with check (auth.uid () = user_id);

create policy "sessions_update_own" on public.sessions
  for update using (auth.uid () = user_id);

create policy "sessions_delete_own" on public.sessions
  for delete using (auth.uid () = user_id);
