import Anthropic from '@anthropic-ai/sdk';

import type { EventDef } from '@/constants/events';
import { maxShotValue } from '@/constants/events';

export interface DetectedShot {
  /** Shot value — integer, or one decimal place for decimal-scored events. */
  score: number;
  /** Hole center, normalized 0–1 from the top-left of the scoring rings. */
  x: number;
  y: number;
}

export interface TargetAnalysis {
  targetDetected: boolean;
  shots: DetectedShot[];
  /** Model's caveats — occlusions, ambiguous holes, cropped rings. */
  notes: string;
}

const RESULT_SCHEMA = {
  type: 'object',
  properties: {
    target_detected: {
      type: 'boolean',
      description: 'True if a scoring target with visible rings is present in the photo.',
    },
    shots: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          score: { type: 'number', description: 'Score for this hole per ISSF ring values.' },
          x: { type: 'number', description: 'Hole center x, normalized 0-1 across the ring area.' },
          y: { type: 'number', description: 'Hole center y, normalized 0-1 across the ring area.' },
        },
        required: ['score', 'x', 'y'],
        additionalProperties: false,
      },
    },
    notes: {
      type: 'string',
      description: 'Short caveats: overlapping holes, glare, cropped rings, uncertain scores.',
    },
  },
  required: ['target_detected', 'shots', 'notes'],
  additionalProperties: false,
} as const;

function buildPrompt(event: EventDef): string {
  const scoring = event.decimal
    ? 'Score each shot with decimal scoring (e.g. 10.4), max 10.9.'
    : 'Score each shot with integer scoring 0-10.';
  return [
    `This is a photo of a paper target from ${event.name} (${event.distance} ${event.discipline}, ISSF format).`,
    'Identify every bullet hole in the scoring area and score each one from the ring it sits in.',
    'Apply the outward-gauge rule: if the edge of a hole touches a ring line, award the higher value.',
    scoring,
    'Count overlapping holes carefully — an elongated or oversized hole may be two or more shots.',
    'If no target is visible, set target_detected to false and return an empty shots array.',
  ].join(' ');
}

/**
 * Send a target photo to Claude vision and get back scored shots.
 * Requires EXPO_PUBLIC_ANTHROPIC_API_KEY in .env.
 */
export async function analyzeTargetPhoto(
  base64: string,
  mediaType: 'image/jpeg' | 'image/png',
  event: EventDef,
): Promise<TargetAnalysis> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Missing Anthropic API key. Add EXPO_PUBLIC_ANTHROPIC_API_KEY to your .env file and restart the dev server.',
    );
  }

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      output_config: { format: { type: 'json_schema', schema: RESULT_SCHEMA } },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: buildPrompt(event) },
          ],
        },
      ],
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      throw new Error('Invalid Anthropic API key — check EXPO_PUBLIC_ANTHROPIC_API_KEY in .env.');
    }
    if (error instanceof Anthropic.RateLimitError) {
      throw new Error('Rate limited by the vision API. Wait a moment and try again.');
    }
    if (error instanceof Anthropic.APIConnectionError) {
      throw new Error('Could not reach the vision API. Check your internet connection.');
    }
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Vision API error (${error.status}): ${error.message}`);
    }
    throw error;
  }

  if (response.stop_reason === 'refusal') {
    throw new Error('The vision API declined to analyze this photo. Try a clearer shot of the target.');
  }
  if (response.stop_reason === 'max_tokens') {
    throw new Error('Analysis was cut off — try a photo of a single target card.');
  }

  const text = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')?.text;
  if (!text) throw new Error('The vision API returned no result. Try again.');

  const raw = JSON.parse(text) as {
    target_detected: boolean;
    shots: { score: number; x: number; y: number }[];
    notes: string;
  };

  const max = maxShotValue(event);
  const shots = raw.shots
    .map((s) => ({
      score: event.decimal
        ? Math.round(Math.min(Math.max(s.score, 0), max) * 10) / 10
        : Math.min(Math.max(Math.round(s.score), 0), max),
      x: s.x,
      y: s.y,
    }))
    .sort((a, b) => b.score - a.score);

  return { targetDetected: raw.target_detected, shots, notes: raw.notes };
}
