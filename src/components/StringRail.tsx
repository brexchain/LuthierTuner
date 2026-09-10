/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TuningString } from '../types';
import { midiToFreq } from '../audio/pitchDetector';
import { Volume2, Radio } from 'lucide-react';

interface StringRailProps {
  strings: TuningString[];
  a4: number;
  activeStringIndex: number | null;
  inTune: boolean;
  droneStringIndex: number | null;
  onPluckString: (index: number) => void;
  onToggleDrone: (index: number) => void;
}

export const StringRail: React.FC<StringRailProps> = ({
  strings,
  a4,
  activeStringIndex,
  inTune,
  droneStringIndex,
  onPluckString,
  onToggleDrone,
}) => {
  return (
    <div id="string-rail-card" className="bg-[#0d0806]/85 border border-amber-500/15 rounded-2xl p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-serif text-xs uppercase tracking-[0.24em] text-amber-200/70">
            String Rail
          </span>
          <span className="font-mono text-[10px] text-amber-200/40">
            Click to pluck · Double-click or antenna to drone
          </span>
        </div>
        <div className="font-mono text-[10px] text-amber-300/60 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Interactive physical modeling</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
        {strings.map((str, idx) => {
          const targetFreq = midiToFreq(str.midi, a4);
          const isDetected = activeStringIndex === idx;
          const isDrone = droneStringIndex === idx;

          return (
            <div
              key={idx}
              className={`relative flex flex-col items-center justify-between p-3 rounded-xl border transition-all duration-150 ${
                isDetected && inTune
                  ? 'border-[#7ef0cf] bg-[#7ef0cf]/10 shadow-[0_0_15px_rgba(126,240,207,0.25)]'
                  : isDetected
                  ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_12px_rgba(247,198,107,0.2)]'
                  : isDrone
                  ? 'border-amber-300 bg-amber-900/30'
                  : 'border-amber-500/15 bg-black/45 hover:border-amber-400/40 hover:bg-amber-500/5'
              }`}
            >
              {/* Top: String label & string number */}
              <div className="w-full flex items-center justify-between font-mono text-[10px] text-amber-200/40 mb-1">
                <span>#{idx + 1}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleDrone(idx);
                  }}
                  className={`p-1 rounded hover:text-amber-200 transition-colors cursor-pointer ${
                    isDrone ? 'text-[#7ef0cf] animate-pulse' : 'text-amber-200/40'
                  }`}
                  title={isDrone ? 'Stop continuous drone' : 'Play continuous drone tone'}
                >
                  <Radio className="w-3 h-3" />
                </button>
              </div>

              {/* Main Pluck Trigger */}
              <button
                onClick={() => onPluckString(idx)}
                className="w-full flex flex-col items-center cursor-pointer group py-1"
                title={`Pluck ${str.name} (${targetFreq.toFixed(1)} Hz)`}
              >
                <div className="flex items-center gap-1">
                  <span
                    className={`font-serif text-2xl font-bold tracking-tight transition-colors ${
                      isDetected && inTune
                        ? 'text-[#7ef0cf]'
                        : isDetected
                        ? 'text-amber-200'
                        : 'text-amber-300/90 group-hover:text-amber-200'
                    }`}
                  >
                    {str.name}
                  </span>
                </div>

                <span className="font-mono text-xs text-amber-200/50 mt-0.5">
                  {targetFreq.toFixed(1)} Hz
                </span>

                <div className="mt-2 flex items-center gap-1 font-mono text-[9px] text-amber-200/40 group-hover:text-amber-300 transition-colors">
                  <Volume2 className="w-2.5 h-2.5" />
                  <span>PLUCK</span>
                </div>
              </button>

              {/* Indicator dot */}
              <div className="mt-1 flex items-center gap-1">
                {isDetected && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      inTune ? 'bg-[#7ef0cf] shadow-[0_0_6px_#7ef0cf]' : 'bg-amber-400'
                    }`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
