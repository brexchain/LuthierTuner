/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TuningString, CustomArtwork } from '../types';

interface GuitarBodyProps {
  currentNote: string | null;
  currentOctave: number | null;
  inTune: boolean;
  strings: TuningString[];
  activeStringIndex: number | null;
  vibratingStrings: Record<number, boolean>;
  onPluckString: (stringIndex: number) => void;
  onStrum: () => void;
  customArtwork: CustomArtwork | null;
  onOpenStudio?: () => void;
}

export const GuitarBody: React.FC<GuitarBodyProps> = ({
  currentNote,
  currentOctave,
  inTune,
  strings,
  activeStringIndex,
  vibratingStrings,
  onPluckString,
  onStrum,
  customArtwork,
  onOpenStudio,
}) => {
  const numStrings = strings.length;

  return (
    <div id="guitar-interactive-stage" className="relative flex flex-col items-center w-full max-w-[420px] mx-auto select-none">
      {/* Soundboard Container with Brazilian Rosewood / Mahogany shading */}
      <div
        className="relative w-full aspect-[620/920] rounded-[190px_190px_170px_170px] border-4 border-[#4a2412] shadow-[0_30px_90px_rgba(0,0,0,0.95),inset_0_0_80px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center overflow-hidden transition-all duration-500"
        style={{
          background: customArtwork && customArtwork.target === 'finish'
            ? `radial-gradient(circle at 50% 50%, rgba(30,12,6,0.3) 0%, rgba(10,5,2,0.95) 100%), url(${customArtwork.imageUrl}) center/cover no-repeat`
            : 'radial-gradient(circle at 50% 48%, #4a2514 0%, #200f07 60%, #090402 100%)',
        }}
      >
        {/* Subtle wood grain overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffc46e_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Purfling & Inlay Edge Ring */}
        <div className="absolute inset-2.5 rounded-[180px_180px_160px_160px] border border-amber-500/20 pointer-events-none" />
        <div className="absolute inset-4 rounded-[174px_174px_154px_154px] border border-dashed border-amber-500/10 pointer-events-none" />

        {/* Fretboard extension from top */}
        <div className="absolute top-0 w-28 h-36 bg-gradient-to-b from-[#140804] to-[#1c0c07] border-x border-[#381a0e] shadow-md z-10 flex flex-col justify-between py-1">
          {/* Fret wires */}
          <div className="w-full h-0.5 bg-zinc-400/40 shadow-sm" />
          <div className="w-full h-0.5 bg-zinc-400/40 shadow-sm" />
          <div className="w-full h-0.5 bg-zinc-400/40 shadow-sm" />
          <div className="w-full h-0.5 bg-zinc-400/40 shadow-sm" />
          {/* Fret markers (dots) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-100/40 shadow-[0_0_4px_rgba(255,255,255,0.4)]" />
          </div>
        </div>

        {/* Rosette & Soundhole */}
        <div className="relative z-20 flex items-center justify-center my-auto">
          {/* Outer Rosette Ring */}
          <div
            className="w-56 h-56 rounded-full border-4 border-amber-900/50 flex items-center justify-center p-2 shadow-2xl relative"
            style={{
              backgroundImage: customArtwork && customArtwork.target === 'rosette'
                ? `url(${customArtwork.imageUrl})`
                : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Rosette Marquetry Wood Ring */}
            <div className="absolute inset-1 rounded-full border border-dashed border-amber-300/30 pointer-events-none" />
            <div className="absolute inset-2.5 rounded-full border-2 border-amber-600/40 pointer-events-none" />

            {/* True Black Soundhole Cavity */}
            <button
              onClick={onStrum}
              id="soundhole-button"
              className="w-44 h-44 rounded-full bg-[#030101] border-[10px] border-[#221008] shadow-[inset_0_0_45px_#000,0_0_20px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] group"
              title="Click soundhole or press SPACE to strum"
            >
              <span
                id="guitar-detected-note"
                className={`font-serif text-5xl font-bold tracking-tight transition-all duration-150 ${
                  inTune
                    ? 'text-[#7ef0cf] drop-shadow-[0_0_20px_rgba(126,240,207,0.8)]'
                    : currentNote
                    ? 'text-amber-200 drop-shadow-[0_0_15px_rgba(247,198,107,0.5)]'
                    : 'text-amber-500/25'
                }`}
              >
                {currentNote || '—'}
              </span>

              {currentOctave !== null && (
                <span className="font-mono text-xs text-amber-200/50 mt-1">
                  OCTAVE {currentOctave}
                </span>
              )}

              {/* Strum hint on hover */}
              <span className="font-mono text-[9px] uppercase tracking-widest text-amber-300/40 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                Strum · Space
              </span>
            </button>
          </div>
        </div>

        {/* Wooden Bridge & Saddle at bottom */}
        <div className="absolute bottom-14 w-48 h-12 bg-gradient-to-b from-[#221008] to-[#120703] rounded-lg border border-[#3e1d10] shadow-xl z-20 flex flex-col items-center justify-center px-4">
          <div className="w-full h-1 bg-amber-100/70 rounded-full shadow-inner mb-2" />
          <div className="flex justify-between w-full px-2">
            {strings.map((s, idx) => (
              <div
                key={idx}
                className="w-2 h-2 rounded-full bg-black border border-amber-200/40 shadow-sm"
              />
            ))}
          </div>
        </div>

        {/* Realistic Guitar Strings Running Vertically */}
        <div className="absolute inset-0 flex justify-center pointer-events-none z-30">
          <div className="w-40 h-full flex justify-between px-3">
            {strings.map((str, idx) => {
              const isVibrating = vibratingStrings[idx] || activeStringIndex === idx;
              // Wound bass strings are thicker than treble strings
              const thickness = Math.max(1.2, 3.2 - (idx / (numStrings - 1)) * 1.8);

              return (
                <div
                  key={idx}
                  onClick={() => onPluckString(idx)}
                  className="relative h-full flex items-center justify-center cursor-pointer pointer-events-auto group py-4"
                  title={`Pluck ${str.name}`}
                >
                  {/* Invisible touch target expander */}
                  <div className="absolute inset-y-0 -inset-x-3" />

                  {/* Physical string wire with vibration physics */}
                  <div
                    className={`h-full transition-all duration-75 ${
                      isVibrating ? 'animate-[pulse_0.08s_infinite]' : ''
                    } ${
                      activeStringIndex === idx
                        ? 'shadow-[0_0_10px_#7ef0cf]'
                        : 'group-hover:shadow-[0_0_8px_#f7c66b]'
                    }`}
                    style={{
                      width: `${thickness}px`,
                      background: activeStringIndex === idx
                        ? '#7ef0cf'
                        : 'linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,230,190,0.85), rgba(255,255,255,0.4))',
                      transform: isVibrating ? 'scaleX(2.2)' : 'none',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Finish/Inlay Badge Indicator */}
        {customArtwork && (
          <div className="absolute bottom-3 left-4 right-4 z-40 flex justify-between items-center text-[10px] font-mono text-amber-200/60 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-amber-500/20">
            <span className="truncate max-w-[200px]">Custom {customArtwork.target}: {customArtwork.title}</span>
            {onOpenStudio && (
              <button
                onClick={onOpenStudio}
                className="text-[#7ef0cf] hover:underline cursor-pointer ml-2"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
