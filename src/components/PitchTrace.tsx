/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { PitchDetectionResult } from '../types';

interface PitchTraceProps {
  pitchData: PitchDetectionResult | null;
}

export const PitchTrace: React.FC<PitchTraceProps> = ({ pitchData }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<number[]>(new Array(70).fill(0));
  const hasSignalHistoryRef = useRef<boolean[]>(new Array(70).fill(false));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update history
    const cents = pitchData ? Math.max(-50, Math.min(50, pitchData.cents)) : 0;
    const hasSig = pitchData !== null;

    historyRef.current.push(cents);
    historyRef.current.shift();

    hasSignalHistoryRef.current.push(hasSig);
    hasSignalHistoryRef.current.shift();

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background horizontal guides
    const zeroY = h / 2;
    const stepY = (h / 2) * 0.75; // 50 cents height

    // ±25 cents line
    ctx.beginPath();
    ctx.moveTo(0, zeroY - stepY * 0.5);
    ctx.lineTo(w, zeroY - stepY * 0.5);
    ctx.moveTo(0, zeroY + stepY * 0.5);
    ctx.lineTo(w, zeroY + stepY * 0.5);
    ctx.strokeStyle = 'rgba(254, 215, 170, 0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center zero line
    ctx.beginPath();
    ctx.moveTo(0, zeroY);
    ctx.lineTo(w, zeroY);
    ctx.strokeStyle = 'rgba(254, 215, 170, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot trace
    const stepX = w / (historyRef.current.length - 1);
    ctx.beginPath();

    let isTracing = false;

    historyRef.current.forEach((val, idx) => {
      const active = hasSignalHistoryRef.current[idx];
      const x = idx * stepX;
      // Invert: positive cents go up
      const y = zeroY - (val / 50) * stepY;

      if (active) {
        if (!isTracing) {
          ctx.moveTo(x, y);
          isTracing = true;
        } else {
          ctx.lineTo(x, y);
        }
      } else {
        isTracing = false;
      }
    });

    const isCurrentInTune = pitchData?.inTune;
    ctx.strokeStyle = isCurrentInTune ? '#7ef0cf' : '#ff9d7a';
    ctx.lineWidth = 2;
    ctx.shadowColor = isCurrentInTune ? '#7ef0cf' : '#ff9d7a';
    ctx.shadowBlur = pitchData ? 8 : 0;
    ctx.stroke();
  }, [pitchData]);

  return (
    <div id="pitch-trace-widget" className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="font-serif text-xs uppercase tracking-[0.24em] text-amber-200/70">
          Pitch Trace
        </span>
        <span className="font-mono text-[10px] text-amber-200/40">
          Cents vs Time
        </span>
      </div>

      <div className="w-full h-[120px] rounded-lg bg-black/40 border border-amber-500/15 overflow-hidden p-1">
        <canvas
          ref={canvasRef}
          width={300}
          height={110}
          className="w-full h-full block"
        />
      </div>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs">
        <div className="bg-black/50 border border-amber-500/15 rounded-lg p-2">
          <div className="text-[10px] text-amber-200/40 uppercase">Frequency</div>
          <div className="text-amber-100 font-semibold mt-0.5">
            {pitchData?.frequency ? `${pitchData.frequency.toFixed(1)} Hz` : '—'}
          </div>
        </div>

        <div className="bg-black/50 border border-amber-500/15 rounded-lg p-2">
          <div className="text-[10px] text-amber-200/40 uppercase">Note</div>
          <div className="text-[#7ef0cf] font-semibold mt-0.5">
            {pitchData?.label || '—'}
          </div>
        </div>

        <div className="bg-black/50 border border-amber-500/15 rounded-lg p-2">
          <div className="text-[10px] text-amber-200/40 uppercase">Deviation</div>
          <div
            className={`font-semibold mt-0.5 ${
              pitchData?.inTune
                ? 'text-[#7ef0cf]'
                : pitchData
                ? 'text-amber-300'
                : 'text-amber-100/50'
            }`}
          >
            {pitchData
              ? `${pitchData.cents > 0 ? '+' : ''}${pitchData.cents.toFixed(1)} ¢`
              : '—'}
          </div>
        </div>
      </div>
    </div>
  );
};
