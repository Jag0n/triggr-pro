import { supabase } from '@/lib/supabase';
import type { ProfileRow, SessionRow } from '@/types/database';
import type { Profile, Session } from '@/types/models';

/**
 * Best-effort cloud sync. Local storage is the source of truth (ranges have bad
 * connectivity); when signed in we mirror writes up and merge remote rows down.
 * Every call is safe to fire-and-forget.
 */

export async function pushSession(userId: string, session: Session): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('sessions').upsert({
      id: session.id,
      user_id: userId,
      event_id: session.eventId,
      kind: session.kind,
      started_at: session.startedAt,
      ended_at: session.endedAt,
      series: session.series,
      note: session.note ?? null,
    });
  } catch {
    // Offline or misconfigured — local copy is authoritative, nothing lost.
  }
}

export async function deleteRemoteSession(sessionId: string): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('sessions').delete().eq('id', sessionId);
  } catch {
    // best-effort
  }
}

export async function pushProfile(userId: string, profile: Profile): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('profiles').upsert({
      id: userId,
      name: profile.name,
      discipline: profile.discipline,
      primary_event_id: profile.primaryEventId,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // best-effort
  }
}

export async function pullRemote(
  userId: string,
): Promise<{ sessions: Session[]; profile: Profile | null }> {
  if (!supabase) return { sessions: [], profile: null };
  try {
    const [sessionsRes, profileRes] = await Promise.all([
      supabase.from('sessions').select('*').eq('user_id', userId),
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    ]);
    const rows = (sessionsRes.data ?? []) as SessionRow[];
    const sessions: Session[] = rows.map((row) => ({
      id: row.id,
      eventId: row.event_id,
      kind: row.kind,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      series: row.series,
      note: row.note ?? undefined,
    }));
    const profileRow = profileRes.data as ProfileRow | null;
    const profile: Profile | null = profileRow
      ? {
          name: profileRow.name,
          discipline: profileRow.discipline,
          primaryEventId: profileRow.primary_event_id,
          onboarded: true,
        }
      : null;
    return { sessions, profile };
  } catch {
    return { sessions: [], profile: null };
  }
}
