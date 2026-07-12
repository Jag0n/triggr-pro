/**
 * Event registry — the single place that defines what Triggr knows how to score and time.
 *
 * To add a new format in a future version: add an EventDef here (and optionally a
 * TimerSequence). Every screen (logging, timer, trends) is driven by this data.
 */

export type Discipline = 'pistol' | 'rifle';

export interface TimerStep {
  /** Big label shown while this step runs, e.g. "MATCH FIRING". */
  label: string;
  /** Spoken aloud when the step begins, e.g. "Load". */
  announce?: string;
  /** Countdown length in seconds. */
  seconds: number;
  /** Visual/audio flavor: green go-signal, red stop, neutral prep. */
  tone: 'fire' | 'hold' | 'prep';
  /** Seconds-remaining marks that get spoken, e.g. [300, 60]. */
  warnings?: number[];
}

export interface TimerSequence {
  id: string;
  name: string;
  discipline: Discipline | 'both';
  description: string;
  steps: TimerStep[];
}

export interface EventDef {
  id: string;
  name: string;
  short: string;
  discipline: Discipline;
  distance: string;
  seriesCount: number;
  shotsPerSeries: number;
  /** Decimal scoring (10.9 max) vs integer (10 max). */
  decimal: boolean;
  /** Timer sequence id in TIMER_SEQUENCES, if this event has one. */
  timerId?: string;
}

const min = (n: number) => n * 60;

function repeat(times: number, stepsOf: (i: number) => TimerStep[]): TimerStep[] {
  const out: TimerStep[] = [];
  for (let i = 0; i < times; i++) out.push(...stepsOf(i));
  return out;
}

export const TIMER_SEQUENCES: TimerSequence[] = [
  {
    id: 'quali-10m',
    name: '10m Qualification',
    discipline: 'both',
    description: '15 min preparation & sighting, then 75 min match — 60 shots.',
    steps: [
      {
        label: 'PREPARATION & SIGHTING',
        announce: 'Preparation and sighting time. Start.',
        seconds: min(15),
        tone: 'prep',
        warnings: [min(5), 60],
      },
      {
        label: 'MATCH FIRING',
        announce: 'Sighting time has ended. Match firing, 60 shots. Start.',
        seconds: min(75),
        tone: 'fire',
        warnings: [min(30), min(10), min(5), 60],
      },
      { label: 'STOP', announce: 'Stop. End of match.', seconds: 0, tone: 'hold' },
    ],
  },
  {
    id: 'final-10m',
    name: '10m Finals Rhythm',
    discipline: 'both',
    description: 'Single-shot finals cadence — Load, Start, 50 seconds per shot. 10 shots.',
    steps: repeat(10, (i) => [
      {
        label: `SHOT ${i + 1} — LOAD`,
        announce: 'Load.',
        seconds: 8,
        tone: 'prep',
      },
      {
        label: `SHOT ${i + 1} — FIRE`,
        announce: 'Start.',
        seconds: 50,
        tone: 'fire',
      },
      { label: 'STOP', announce: 'Stop.', seconds: 3, tone: 'hold' },
    ]),
  },
  {
    id: 'precision-25m',
    name: '25m Precision Stage',
    discipline: 'pistol',
    description: '6 series of 5 shots, 5 minutes per series.',
    steps: repeat(6, (i) => [
      {
        label: `SERIES ${i + 1} — LOAD`,
        announce: `For series ${i + 1}, load.`,
        seconds: 60,
        tone: 'prep',
      },
      {
        label: `SERIES ${i + 1} — FIRE`,
        announce: 'Start.',
        seconds: min(5),
        tone: 'fire',
        warnings: [60],
      },
      { label: 'STOP', announce: 'Stop. Unload.', seconds: 10, tone: 'hold' },
    ]),
  },
  {
    id: 'rapid-25m',
    name: '25m Rapid Fire Training',
    discipline: 'pistol',
    description: 'Rapid-fire series at 8, 6 and 4 seconds — two of each.',
    steps: [8, 8, 6, 6, 4, 4].flatMap((t, i) => [
      {
        label: `SERIES ${i + 1} — LOAD`,
        announce: 'Load.',
        seconds: 60,
        tone: 'prep' as const,
      },
      { label: 'ATTENTION', announce: 'Attention.', seconds: 7, tone: 'hold' as const },
      {
        label: `FIRE — ${t} SECONDS`,
        announce: 'Start.',
        seconds: t,
        tone: 'fire' as const,
      },
      { label: 'STOP', announce: 'Stop.', seconds: 5, tone: 'hold' as const },
    ]),
  },
  {
    id: 'quali-50m-3p',
    name: '50m 3 Positions',
    discipline: 'rifle',
    description: '15 min preparation & sighting, then 90 min match.',
    steps: [
      {
        label: 'PREPARATION & SIGHTING',
        announce: 'Preparation and sighting time. Start.',
        seconds: min(15),
        tone: 'prep',
        warnings: [min(5), 60],
      },
      {
        label: 'MATCH FIRING',
        announce: 'Match firing. Start.',
        seconds: min(90),
        tone: 'fire',
        warnings: [min(30), min(10), 60],
      },
      { label: 'STOP', announce: 'Stop. End of match.', seconds: 0, tone: 'hold' },
    ],
  },
];

export const EVENTS: EventDef[] = [
  {
    id: 'ap60',
    name: '10m Air Pistol',
    short: 'AP 60',
    discipline: 'pistol',
    distance: '10m',
    seriesCount: 6,
    shotsPerSeries: 10,
    decimal: false,
    timerId: 'quali-10m',
  },
  {
    id: 'sp25',
    name: '25m Sports Pistol',
    short: 'SP 25',
    discipline: 'pistol',
    distance: '25m',
    seriesCount: 6,
    shotsPerSeries: 5,
    decimal: false,
    timerId: 'precision-25m',
  },
  {
    id: 'rfp25',
    name: '25m Rapid Fire Pistol',
    short: 'RFP',
    discipline: 'pistol',
    distance: '25m',
    seriesCount: 12,
    shotsPerSeries: 5,
    decimal: false,
    timerId: 'rapid-25m',
  },
  {
    id: 'fp50',
    name: '50m Pistol',
    short: 'FP 50',
    discipline: 'pistol',
    distance: '50m',
    seriesCount: 6,
    shotsPerSeries: 10,
    decimal: false,
  },
  {
    id: 'ar60',
    name: '10m Air Rifle',
    short: 'AR 60',
    discipline: 'rifle',
    distance: '10m',
    seriesCount: 6,
    shotsPerSeries: 10,
    decimal: true,
    timerId: 'quali-10m',
  },
  {
    id: 'r3p',
    name: '50m Rifle 3 Positions',
    short: '3P',
    discipline: 'rifle',
    distance: '50m',
    seriesCount: 6,
    shotsPerSeries: 10,
    decimal: false,
    timerId: 'quali-50m-3p',
  },
  {
    id: 'prone50',
    name: '50m Rifle Prone',
    short: 'PRONE',
    discipline: 'rifle',
    distance: '50m',
    seriesCount: 6,
    shotsPerSeries: 10,
    decimal: true,
  },
];

export function getEvent(id: string): EventDef | undefined {
  return EVENTS.find((e) => e.id === id);
}

export function getTimerSequence(id: string): TimerSequence | undefined {
  return TIMER_SEQUENCES.find((s) => s.id === id);
}

export function eventsForDiscipline(d: Discipline): EventDef[] {
  return EVENTS.filter((e) => e.discipline === d);
}

/** Max possible score for one shot in this event. */
export function maxShotValue(event: EventDef): number {
  return event.decimal ? 10.9 : 10;
}

/** Max possible total for a full session of this event. */
export function maxTotal(event: EventDef): number {
  return maxShotValue(event) * event.seriesCount * event.shotsPerSeries;
}
