/**
 * Row shapes matching supabase/migrations/0001_init.sql.
 *
 * The Supabase client is intentionally untyped (hand-written Database generics
 * fight supabase-js's generated-schema expectations); lib/sync.ts converts rows
 * to/from app models through these interfaces instead. Once the Supabase project
 * exists you can switch to generated types:
 *   npx supabase gen types typescript --project-id <id>
 */

import type { Series, SessionKind } from '@/types/models';

export interface ProfileRow {
  id: string;
  name: string;
  discipline: 'pistol' | 'rifle';
  primary_event_id: string;
  updated_at: string;
}

export interface SessionRow {
  id: string;
  user_id: string;
  event_id: string;
  kind: SessionKind;
  started_at: string;
  ended_at: string;
  series: Series[];
  note: string | null;
  created_at: string;
}
