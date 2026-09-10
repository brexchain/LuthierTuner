/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TuningPreset } from '../types';

export const PRESET_TUNINGS: TuningPreset[] = [
  {
    id: 'standard',
    name: 'Standard (E A D G B E)',
    category: 'standard',
    instrument: 'guitar',
    strings: [
      { name: 'E2', midi: 40, stringIndex: 0 },
      { name: 'A2', midi: 45, stringIndex: 1 },
      { name: 'D3', midi: 50, stringIndex: 2 },
      { name: 'G3', midi: 55, stringIndex: 3 },
      { name: 'B3', midi: 59, stringIndex: 4 },
      { name: 'E4', midi: 64, stringIndex: 5 },
    ],
  },
  {
    id: 'dropd',
    name: 'Drop D (D A D G B E)',
    category: 'drop',
    instrument: 'guitar',
    strings: [
      { name: 'D2', midi: 38, stringIndex: 0 },
      { name: 'A2', midi: 45, stringIndex: 1 },
      { name: 'D3', midi: 50, stringIndex: 2 },
      { name: 'G3', midi: 55, stringIndex: 3 },
      { name: 'B3', midi: 59, stringIndex: 4 },
      { name: 'E4', midi: 64, stringIndex: 5 },
    ],
  },
  {
    id: 'open_g',
    name: 'Open G (D G D G B D)',
    category: 'open',
    instrument: 'guitar',
    strings: [
      { name: 'D2', midi: 38, stringIndex: 0 },
      { name: 'G2', midi: 43, stringIndex: 1 },
      { name: 'D3', midi: 50, stringIndex: 2 },
      { name: 'G3', midi: 55, stringIndex: 3 },
      { name: 'B3', midi: 59, stringIndex: 4 },
      { name: 'D4', midi: 62, stringIndex: 5 },
    ],
  },
  {
    id: 'open_d',
    name: 'Open D (D A D F# A D)',
    category: 'open',
    instrument: 'guitar',
    strings: [
      { name: 'D2', midi: 38, stringIndex: 0 },
      { name: 'A2', midi: 45, stringIndex: 1 },
      { name: 'D3', midi: 50, stringIndex: 2 },
      { name: 'F#3', midi: 54, stringIndex: 3 },
      { name: 'A3', midi: 57, stringIndex: 4 },
      { name: 'D4', midi: 62, stringIndex: 5 },
    ],
  },
  {
    id: 'dadgad',
    name: 'DADGAD (Celtic / Folk)',
    category: 'open',
    instrument: 'guitar',
    strings: [
      { name: 'D2', midi: 38, stringIndex: 0 },
      { name: 'A2', midi: 45, stringIndex: 1 },
      { name: 'D3', midi: 50, stringIndex: 2 },
      { name: 'G3', midi: 55, stringIndex: 3 },
      { name: 'A3', midi: 57, stringIndex: 4 },
      { name: 'D4', midi: 62, stringIndex: 5 },
    ],
  },
  {
    id: 'half_step_down',
    name: 'Half Step Down (Eb Ab Db Gb Bb Eb)',
    category: 'standard',
    instrument: 'guitar',
    strings: [
      { name: 'Eb2', midi: 39, stringIndex: 0 },
      { name: 'Ab2', midi: 44, stringIndex: 1 },
      { name: 'Db3', midi: 49, stringIndex: 2 },
      { name: 'Gb3', midi: 54, stringIndex: 3 },
      { name: 'Bb3', midi: 58, stringIndex: 4 },
      { name: 'Eb4', midi: 63, stringIndex: 5 },
    ],
  },
  {
    id: 'drop_c',
    name: 'Drop C (C G C F A D)',
    category: 'drop',
    instrument: 'guitar',
    strings: [
      { name: 'C2', midi: 36, stringIndex: 0 },
      { name: 'G2', midi: 43, stringIndex: 1 },
      { name: 'C3', midi: 48, stringIndex: 2 },
      { name: 'F3', midi: 53, stringIndex: 3 },
      { name: 'A3', midi: 57, stringIndex: 4 },
      { name: 'D4', midi: 62, stringIndex: 5 },
    ],
  },
  {
    id: 'bass_standard',
    name: 'Bass 4-String (E A D G)',
    category: 'standard',
    instrument: 'bass',
    strings: [
      { name: 'E1', midi: 28, stringIndex: 0 },
      { name: 'A1', midi: 33, stringIndex: 1 },
      { name: 'D2', midi: 38, stringIndex: 2 },
      { name: 'G2', midi: 43, stringIndex: 3 },
    ],
  },
  {
    id: 'ukulele',
    name: 'Ukulele Standard (G C E A)',
    category: 'standard',
    instrument: 'ukulele',
    strings: [
      { name: 'G4', midi: 67, stringIndex: 0 },
      { name: 'C4', midi: 60, stringIndex: 1 },
      { name: 'E4', midi: 64, stringIndex: 2 },
      { name: 'A4', midi: 69, stringIndex: 3 },
    ],
  },
];

export const REFERENCE_A4_OPTIONS = [432, 435, 438, 440, 442, 444] as const;
