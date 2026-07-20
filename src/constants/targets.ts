/**
 * Physical target geometry per event — drives the local photo scorer.
 * Dimensions from the ISSF General Technical Rules (6.3.4), in millimetres.
 *
 * `rings` lists the OUTER DIAMETER of each scoring zone, highest score first.
 * `blackDiameterMm` is the aiming black — the scanner measures it in the photo
 * to establish the mm-per-pixel scale, so it must match the printed target.
 */

export interface TargetSpec {
  /** [score, outer diameter mm] — highest score first. */
  rings: [score: number, diameterMm: number][];
  /** Diameter of the black aiming area. */
  blackDiameterMm: number;
  /** Bullet/pellet diameter — also the scoring gauge (outward gauge rule). */
  calibreMm: number;
}

/** ISSF 10m Air Pistol target (ISSF 6.3.4.6). Black = rings 7–10. */
const AIR_PISTOL_10M: TargetSpec = {
  rings: [
    [10, 11.5],
    [9, 27.5],
    [8, 43.5],
    [7, 59.5],
    [6, 75.5],
    [5, 91.5],
    [4, 107.5],
    [3, 123.5],
    [2, 139.5],
    [1, 155.5],
  ],
  blackDiameterMm: 59.5,
  calibreMm: 4.5,
};

/** ISSF 10m Air Rifle target (ISSF 6.3.4.5). Black = rings 4–9. */
const AIR_RIFLE_10M: TargetSpec = {
  rings: [
    [10, 0.5],
    [9, 5.5],
    [8, 10.5],
    [7, 15.5],
    [6, 20.5],
    [5, 25.5],
    [4, 30.5],
    [3, 35.5],
    [2, 40.5],
    [1, 45.5],
  ],
  blackDiameterMm: 30.5,
  calibreMm: 4.5,
};

/** ISSF 25m Precision / 50m Pistol target (ISSF 6.3.4.3). Black = rings 7–10. */
const PRECISION_PISTOL: TargetSpec = {
  rings: [
    [10, 50],
    [9, 100],
    [8, 150],
    [7, 200],
    [6, 250],
    [5, 300],
    [4, 350],
    [3, 400],
    [2, 450],
    [1, 500],
  ],
  blackDiameterMm: 200,
  calibreMm: 5.6,
};

/** ISSF 25m Rapid Fire target (ISSF 6.3.4.4). Fully black, rings 5–10 only. */
const RAPID_FIRE: TargetSpec = {
  rings: [
    [10, 100],
    [9, 180],
    [8, 260],
    [7, 340],
    [6, 420],
    [5, 500],
  ],
  blackDiameterMm: 500,
  calibreMm: 5.6,
};

/** ISSF 50m Rifle target (ISSF 6.3.4.2). Black = rings 3–10. */
const RIFLE_50M: TargetSpec = {
  rings: [
    [10, 10.4],
    [9, 26.4],
    [8, 42.4],
    [7, 58.4],
    [6, 74.4],
    [5, 90.4],
    [4, 106.4],
    [3, 122.4],
    [2, 138.4],
    [1, 154.4],
  ],
  blackDiameterMm: 112.4,
  calibreMm: 5.6,
};

/** Target spec per event id from the event registry. */
export const TARGET_SPECS: Record<string, TargetSpec> = {
  ap60: AIR_PISTOL_10M,
  sp25: PRECISION_PISTOL,
  rfp25: RAPID_FIRE,
  fp50: PRECISION_PISTOL,
  ar60: AIR_RIFLE_10M,
  r3p: RIFLE_50M,
  prone50: RIFLE_50M,
};

export function getTargetSpec(eventId: string): TargetSpec | undefined {
  return TARGET_SPECS[eventId];
}
