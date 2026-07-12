import type { Discipline } from '@/constants/events';

export interface Profile {
  name: string;
  discipline: Discipline;
  /** Preferred event id from the registry — drives defaults across the app. */
  primaryEventId: string;
  onboarded: boolean;
}

export interface Series {
  shots: number[];
}

export type SessionKind = 'match' | 'practice';

export interface Session {
  id: string;
  eventId: string;
  kind: SessionKind;
  startedAt: string; // ISO
  endedAt: string; // ISO
  series: Series[];
  note?: string;
}
