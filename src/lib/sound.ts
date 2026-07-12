import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

/**
 * Range audio: spoken commands (expo-speech, all platforms) plus signal beeps
 * (Web Audio oscillator on web; haptic pulses stand in on native until a
 * bundled beep asset is added).
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (Platform.OS !== 'web') return null;
  if (!audioCtx) {
    const Ctor =
      (globalThis as { AudioContext?: typeof AudioContext }).AudioContext ??
      (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  return audioCtx;
}

function webBeep(freq: number, durationMs: number, count = 1) {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') void ctx.resume();
  for (let i = 0; i < count; i++) {
    const start = ctx.currentTime + i * ((durationMs + 80) / 1000);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.4, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + durationMs / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + durationMs / 1000 + 0.05);
  }
}

export function beepStart() {
  if (Platform.OS === 'web') webBeep(880, 250);
  else void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function beepStop() {
  if (Platform.OS === 'web') webBeep(440, 500, 2);
  else void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

export function beepTick() {
  if (Platform.OS === 'web') webBeep(660, 90);
  else void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function speak(text: string) {
  Speech.stop();
  Speech.speak(text, { rate: 0.95 });
}

export function stopSpeech() {
  Speech.stop();
}

export function tapFeedback() {
  if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function successFeedback() {
  if (Platform.OS !== 'web')
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
