import { getEvent } from '@/constants/events';
import type { Session } from '@/types/models';

export function seriesTotal(shots: number[]): number {
  return round1(shots.reduce((a, b) => a + b, 0));
}

export function sessionShots(session: Session): number[] {
  return session.series.flatMap((s) => s.shots);
}

export function sessionTotal(session: Session): number {
  return round1(sessionShots(session).reduce((a, b) => a + b, 0));
}

export function sessionShotCount(session: Session): number {
  return sessionShots(session).length;
}

export function avgPerShot(session: Session): number {
  const n = sessionShotCount(session);
  return n === 0 ? 0 : sessionTotal(session) / n;
}

export function bestSeries(session: Session): number {
  return session.series.length === 0
    ? 0
    : Math.max(...session.series.map((s) => seriesTotal(s.shots)));
}

/** Average score per 10 shots — comparable across events with different series sizes. */
export function seriesAvg10(session: Session): number {
  const n = sessionShotCount(session);
  return n === 0 ? 0 : round1((sessionTotal(session) / n) * 10);
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function formatScore(n: number, decimal: boolean): string {
  return decimal ? n.toFixed(1) : String(Math.round(n * 10) / 10);
}

export function formatSessionScore(session: Session): string {
  const event = getEvent(session.eventId);
  return formatScore(sessionTotal(session), event?.decimal ?? false);
}

export interface PeriodStats {
  sessions: number;
  shots: number;
  avg10: number; // average per 10 shots
  best: number; // best single series
}

export function statsFor(sessions: Session[]): PeriodStats {
  const shots = sessions.flatMap(sessionShots);
  const total = shots.reduce((a, b) => a + b, 0);
  return {
    sessions: sessions.length,
    shots: shots.length,
    avg10: shots.length === 0 ? 0 : round1((total / shots.length) * 10),
    best: sessions.length === 0 ? 0 : Math.max(...sessions.map(bestSeries)),
  };
}

export function thisWeek(sessions: Session[]): Session[] {
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - day);
  return sessions.filter((s) => new Date(s.startedAt) >= monday);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}
