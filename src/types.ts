/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TuningString {
  name: string;
  midi: number;
  stringIndex: number; // 0 = lowest pitch string, etc.
}

export interface TuningPreset {
  id: string;
  name: string;
  category: 'standard' | 'open' | 'drop' | 'other';
  instrument: 'guitar' | 'bass' | 'ukulele';
  strings: TuningString[];
}

export interface PitchDetectionResult {
  frequency: number;
  noteName: string;
  octave: number;
  cents: number;
  midi: number;
  clarity: number;
  rms: number;
  label: string;
  nearestStringIndex?: number;
  inTune: boolean;
}

export interface CustomArtwork {
  id: string;
  title: string;
  prompt: string;
  imageUrl: string;
  target: 'finish' | 'rosette' | 'headstock';
  createdAt: number;
}
