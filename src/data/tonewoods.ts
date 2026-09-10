/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CustomArtwork } from '../types';

// High-fidelity SVG-encoded master tonewood finishes & rosettes
export const MASTERCRAFT_PRESETS: CustomArtwork[] = [
  {
    id: 'mc-sunburst-1959',
    title: '1959 Iced Tea Sunburst',
    prompt: 'Handcrafted 1959 vintage iced tea burst on flamed violin-grade maple soundboard with nitrocellulose warmth',
    target: 'finish',
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <defs>
          <radialGradient id="burst" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stop-color="#ffd27d" />
            <stop offset="35%" stop-color="#f59e0b" />
            <stop offset="65%" stop-color="#b45309" />
            <stop offset="85%" stop-color="#451a03" />
            <stop offset="100%" stop-color="#1c0701" />
          </radialGradient>
          <pattern id="grain" width="10" height="600" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="600" stroke="#000" stroke-opacity="0.08" stroke-width="1.5" />
            <line x1="5" y1="0" x2="5" y2="600" stroke="#fff" stroke-opacity="0.04" stroke-width="0.8" />
          </pattern>
        </defs>
        <rect width="600" height="600" fill="url(#burst)" />
        <rect width="600" height="600" fill="url(#grain)" />
      </svg>
    `)}`,
    createdAt: 1710000000000,
  },
  {
    id: 'mc-flame-maple',
    title: 'Tiger Flame Maple (Amber)',
    prompt: 'Bookmatched 5A quilted tiger flame maple soundboard with 3D holographic chatoyancy and deep amber oil finish',
    target: 'finish',
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <defs>
          <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#78350f" />
            <stop offset="25%" stop-color="#d97706" />
            <stop offset="50%" stop-color="#fbbf24" />
            <stop offset="75%" stop-color="#b45309" />
            <stop offset="100%" stop-color="#451a03" />
          </linearGradient>
          <pattern id="flame" width="600" height="24" patternUnits="userSpaceOnUse">
            <path d="M0,6 Q150,18 300,6 T600,6" fill="none" stroke="#291104" stroke-width="6" stroke-opacity="0.25" />
            <path d="M0,18 Q150,6 300,18 T600,18" fill="none" stroke="#fde68a" stroke-width="4" stroke-opacity="0.18" />
          </pattern>
        </defs>
        <rect width="600" height="600" fill="url(#amberGrad)" />
        <rect width="600" height="600" fill="url(#flame)" />
      </svg>
    `)}`,
    createdAt: 1710000001000,
  },
  {
    id: 'mc-brazilian-rosewood',
    title: 'Brazilian Dark Rosewood',
    prompt: 'Mastergrade dark Brazilian rosewood top with dark violet spider webbing grain and mirror gloss buffing',
    target: 'finish',
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <defs>
          <radialGradient id="rosewood" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stop-color="#3d1d13" />
            <stop offset="40%" stop-color="#2a120c" />
            <stop offset="80%" stop-color="#180a06" />
            <stop offset="100%" stop-color="#080302" />
          </radialGradient>
          <pattern id="spidergrain" width="40" height="600" patternUnits="userSpaceOnUse">
            <path d="M10,0 Q25,300 5,600 M30,0 Q15,300 35,600" fill="none" stroke="#000" stroke-width="2.5" stroke-opacity="0.35" />
          </pattern>
        </defs>
        <rect width="600" height="600" fill="url(#rosewood)" />
        <rect width="600" height="600" fill="url(#spidergrain)" />
      </svg>
    `)}`,
    createdAt: 1710000002000,
  },
  {
    id: 'mc-celtic-abalone',
    title: 'Celtic Abalone Rosette',
    prompt: 'Intricate circular soundhole rosette in green and peacock-blue iridescent abalone shell with ebony marquetry purfling',
    target: 'rosette',
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
        <defs>
          <radialGradient id="abaloneGrad">
            <stop offset="0%" stop-color="#064e3b" />
            <stop offset="35%" stop-color="#0d9488" />
            <stop offset="65%" stop-color="#2dd4bf" />
            <stop offset="85%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#1e1b4b" />
          </radialGradient>
        </defs>
        <rect width="500" height="500" fill="#0c0704" />
        <circle cx="250" cy="250" r="235" fill="none" stroke="#f59e0b" stroke-width="4" stroke-opacity="0.7" />
        <circle cx="250" cy="250" r="215" fill="none" stroke="url(#abaloneGrad)" stroke-width="32" stroke-dasharray="8,4" />
        <circle cx="250" cy="250" r="190" fill="none" stroke="#f59e0b" stroke-width="3" stroke-opacity="0.9" />
        <circle cx="250" cy="250" r="180" fill="none" stroke="#000" stroke-width="8" />
        <circle cx="250" cy="250" r="168" fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="3,3" />
      </svg>
    `)}`,
    createdAt: 1710000003000,
  },
  {
    id: 'mc-pearl-herringbone',
    title: 'Herringbone Mother of Pearl',
    prompt: 'Vintage style Martin-inspired herringbone marquetry rosette with luminescent mother of pearl soundhole banding',
    target: 'rosette',
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
        <defs>
          <radialGradient id="pearlGrad">
            <stop offset="0%" stop-color="#fdf4ff" />
            <stop offset="50%" stop-color="#f5f3ff" />
            <stop offset="100%" stop-color="#e0e7ff" />
          </radialGradient>
        </defs>
        <rect width="500" height="500" fill="#080402" />
        <circle cx="250" cy="250" r="230" fill="none" stroke="#d97706" stroke-width="4" />
        <circle cx="250" cy="250" r="210" fill="none" stroke="url(#pearlGrad)" stroke-width="26" stroke-dasharray="10,5" stroke-opacity="0.9" />
        <circle cx="250" cy="250" r="185" fill="none" stroke="#b45309" stroke-width="4" stroke-dasharray="4,4" />
        <circle cx="250" cy="250" r="172" fill="none" stroke="#78350f" stroke-width="3" />
      </svg>
    `)}`,
    createdAt: 1710000004000,
  },
];
