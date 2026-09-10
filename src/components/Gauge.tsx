/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface GaugeProps {
  cents: number;
  inTune: boolean;
  hasSignal: boolean;
  level: number;
  clarity: number;
}

export const Gauge: React.FC<GaugeProps> = ({
  cents,
  inTune,
  hasSignal,
  level,
  clarity,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const smoothedCentsRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      // Smooth interpolation
      const targetCents = hasSignal ? Math.max(-50, Math.min(50, cents)) : 0;
      smoothedCentsRef.current += (targetCents - smoothedCentsRef.current) * 0.18;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h - 22;
      const radius = 125;

      // 1. Background Arc (±50 cents spans from 150 deg to 30 deg in standard circle, or Math.PI * 0.85 to Math.PI * 2.15)
      const startAngle = Math.PI * 0.95;
      const endAngle = Math.PI * 2.05;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.strokeStyle = 'rgba(254, 215, 170, 0.12)';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.stroke();

      // 2. In-Tune Green Target Zone (around middle ±4 cents)
      const midAngle = (startAngle + endAngle) / 2;
      const span = endAngle - startAngle;
      const inTuneWidth = (span / 100) * 8; // 8 cents window

      ctx.beginPath();
      ctx.arc(cx, cy, radius, midAngle - inTuneWidth / 2, midAngle + inTuneWidth / 2);
      ctx.strokeStyle = inTune && hasSignal ? 'rgba(126, 240, 207, 0.9)' : 'rgba(126, 240, 207, 0.35)';
      ctx.lineWidth = 10;
      ctx.stroke();

      // 3. Ticks and Labels
      const majorCents = [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50];
      majorCents.forEach((c) => {
        const norm = (c + 50) / 100;
        const angle = startAngle + norm * span;

        const isZero = c === 0;
        const tickLength = isZero ? 14 : c % 20 === 0 ? 10 : 6;
        const rInner = radius - tickLength;
        const rOuter = radius + 4;

        const x1 = cx + Math.cos(angle) * rInner;
        const y1 = cy + Math.sin(angle) * rInner;
        const x2 = cx + Math.cos(angle) * rOuter;
        const y2 = cy + Math.sin(angle) * rOuter;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isZero
          ? 'rgba(126, 240, 207, 0.8)'
          : Math.abs(c) <= 10
          ? 'rgba(254, 215, 170, 0.5)'
          : 'rgba(254, 215, 170, 0.25)';
        ctx.lineWidth = isZero ? 2.5 : 1.5;
        ctx.stroke();

        // Major numbers
        if (c % 20 === 0) {
          const textR = radius - 24;
          const tx = cx + Math.cos(angle) * textR;
          const ty = cy + Math.sin(angle) * textR;
          ctx.font = '10px monospace';
          ctx.fillStyle = isZero
            ? '#7ef0cf'
            : 'rgba(254, 215, 170, 0.4)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${c > 0 ? '+' : ''}${c}`, tx, ty);
        }
      });

      // 4. Analogue Needle
      const currentCentsVal = smoothedCentsRef.current;
      const currentNorm = (currentCentsVal + 50) / 100;
      const needleAngle = startAngle + currentNorm * span;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(needleAngle + Math.PI / 2);

      // Shadow / glow
      const isPerfect = hasSignal && Math.abs(currentCentsVal) <= 3;
      ctx.shadowColor = isPerfect ? '#7ef0cf' : hasSignal ? '#f7c66b' : 'transparent';
      ctx.shadowBlur = hasSignal ? 12 : 0;

      // Needle body
      ctx.beginPath();
      ctx.moveTo(-3, 0);
      ctx.lineTo(0, -radius + 8);
      ctx.lineTo(3, 0);
      ctx.closePath();
      ctx.fillStyle = isPerfect
        ? '#7ef0cf'
        : hasSignal
        ? '#f7c66b'
        : 'rgba(254, 215, 170, 0.3)';
      ctx.fill();

      // Needle tip highlight
      ctx.beginPath();
      ctx.arc(0, -radius + 8, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isPerfect ? '#a7f3d0' : '#ffedd5';
      ctx.fill();

      ctx.restore();

      // Center pivot cap
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fillStyle = hasSignal ? '#f7c66b' : '#3a2113';
      ctx.fill();
      ctx.strokeStyle = '#180d08';
      ctx.lineWidth = 2;
      ctx.stroke();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [cents, inTune, hasSignal]);

  return (
    <div id="gauge-widget" className="space-y-3">
      <div className="flex justify-between items-baseline">
        <span className="font-serif text-xs uppercase tracking-[0.24em] text-amber-200/70">
          Analogue Movement
        </span>
        <div className="font-mono text-xs text-amber-200/50 flex items-center gap-1.5">
          <span>±50 ¢</span>
          {inTune && hasSignal && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-[#7ef0cf] font-semibold text-[10px] border border-emerald-500/40 animate-pulse">
              IN TUNE
            </span>
          )}
        </div>
      </div>

      <div className="relative w-full h-[180px] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={320}
          height={180}
          className="w-full h-full block"
        />
      </div>

      {/* Input Level Bar */}
      <div className="space-y-1">
        <div className="flex justify-between font-mono text-[10px] text-amber-200/50">
          <span>INPUT LEVEL</span>
          <span>{Math.round(level * 100)}%</span>
        </div>
        <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-amber-500/10">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-300 rounded-full transition-all duration-75"
            style={{ width: `${Math.min(100, Math.round(level * 100))}%` }}
          />
        </div>
      </div>

      {/* Signal Clarity Bar */}
      <div className="space-y-1">
        <div className="flex justify-between font-mono text-[10px] text-amber-200/50">
          <span>SIGNAL CLARITY</span>
          <span>{Math.round(clarity * 100)}%</span>
        </div>
        <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-amber-500/10">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-[#7ef0cf] rounded-full transition-all duration-75"
            style={{ width: `${Math.min(100, Math.round(clarity * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
