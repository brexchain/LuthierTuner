/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PitchDetectionResult, TuningString } from '../types';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const CIRCLE_OF_FIFTHS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'] as const;

export function midiToFreq(midi: number, a4 = 440): number {
  return a4 * Math.pow(2, (midi - 69) / 12);
}

export function freqToNote(freq: number, a4 = 440): {
  noteName: string;
  octave: number;
  label: string;
  cents: number;
  midi: number;
} | null {
  if (!freq || freq <= 0 || !isFinite(freq)) return null;

  const noteNum = 12 * (Math.log(freq / a4) / Math.LN2) + 69;
  const roundedMidi = Math.round(noteNum);
  const cents = (noteNum - roundedMidi) * 100;
  const noteIndex = ((roundedMidi % 12) + 12) % 12;
  const noteName = NOTE_NAMES[noteIndex];
  const octave = Math.floor(roundedMidi / 12) - 1;

  return {
    noteName,
    octave,
    label: `${noteName}${octave}`,
    cents,
    midi: roundedMidi,
  };
}

/**
 * Normalized Square Difference Function (NSDF) / McLeod Pitch Method
 * Computes fundamental frequency with high precision and parabolic interpolation.
 */
export function detectPitch(
  buffer: Float32Array,
  sampleRate: number,
  a4 = 440,
  currentTuning?: TuningString[]
): PitchDetectionResult | null {
  const bufferSize = buffer.length;

  // 1. Calculate RMS energy
  let sumSq = 0;
  for (let i = 0; i < bufferSize; i++) {
    sumSq += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(sumSq / bufferSize);

  // Noise gate threshold
  if (rms < 0.008) {
    return null;
  }

  // Guitar & Bass range: 50 Hz to 1100 Hz
  const minFreq = 45;
  const maxFreq = 1100;
  const maxLag = Math.floor(sampleRate / minFreq);
  const minLag = Math.floor(sampleRate / maxFreq);

  // 2. Compute autocorrelation / NSDF
  const nsdf = new Float32Array(maxLag);
  for (let tau = minLag; tau < maxLag; tau++) {
    let acf = 0;
    let divisorM = 0;
    for (let i = 0; i < bufferSize - tau; i++) {
      acf += buffer[i] * buffer[i + tau];
      divisorM += buffer[i] * buffer[i] + buffer[i + tau] * buffer[i + tau];
    }
    nsdf[tau] = divisorM > 0 ? (2 * acf) / divisorM : 0;
  }

  // 3. Find key peak using peak picking
  let maxVal = 0;
  let bestTau = -1;
  const threshold = 0.65; // High confidence threshold

  for (let tau = minLag + 1; tau < maxLag - 1; tau++) {
    if (nsdf[tau] > threshold && nsdf[tau] > nsdf[tau - 1] && nsdf[tau] >= nsdf[tau + 1]) {
      if (nsdf[tau] > maxVal) {
        maxVal = nsdf[tau];
        bestTau = tau;
        // The first strong peak above 0.8 is usually the fundamental
        if (maxVal > 0.82) {
          break;
        }
      }
    }
  }

  if (bestTau === -1 || maxVal < 0.45) {
    return null;
  }

  // 4. Parabolic interpolation on the peak
  const alpha = nsdf[bestTau - 1];
  const beta = nsdf[bestTau];
  const gamma = nsdf[bestTau + 1];
  const denominator = 2 * (alpha - 2 * beta + gamma);
  const delta = denominator !== 0 ? (alpha - gamma) / denominator : 0;
  const refinedTau = bestTau + delta;

  const frequency = sampleRate / refinedTau;
  if (frequency < minFreq || frequency > maxFreq) {
    return null;
  }

  const parsed = freqToNote(frequency, a4);
  if (!parsed) return null;

  // Find nearest string in current tuning if provided
  let nearestStringIndex: number | undefined;
  if (currentTuning && currentTuning.length > 0) {
    let minDistance = Infinity;
    currentTuning.forEach((str, idx) => {
      const targetFreq = midiToFreq(str.midi, a4);
      const semitoneDiff = Math.abs(12 * Math.log2(frequency / targetFreq));
      if (semitoneDiff < minDistance) {
        minDistance = semitoneDiff;
        nearestStringIndex = idx;
      }
    });
  }

  const inTune = Math.abs(parsed.cents) <= 4.0;

  return {
    frequency,
    noteName: parsed.noteName,
    octave: parsed.octave,
    cents: parsed.cents,
    midi: parsed.midi,
    clarity: Math.min(1, Math.max(0, maxVal)),
    rms: Math.min(1, rms * 10),
    label: parsed.label,
    nearestStringIndex,
    inTune,
  };
}
