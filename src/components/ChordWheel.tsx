/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { CIRCLE_OF_FIFTHS } from '../audio/pitchDetector';

interface ChordWheelProps {
  currentNote: string | null;
  onSelectNote?: (noteName: string) => void;
}

export const ChordWheel: React.FC<ChordWheelProps> = ({
  currentNote,
  onSelectNote,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.38;

    // Outer faint ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 14, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(254, 215, 170, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Inner connecting web
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(254, 215, 170, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw nodes
    CIRCLE_OF_FIFTHS.forEach((note, idx) => {
      const angle = (idx / 12) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      const isCurrent = currentNote?.toUpperCase().startsWith(note);

      if (isCurrent) {
        // Glowing halo for current note
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(126, 240, 207, 0.2)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.strokeStyle = '#7ef0cf';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#7ef0cf';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();

        // Ray to center
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'rgba(126, 240, 207, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.font = isCurrent ? 'bold 13px serif' : '11px monospace';
      ctx.fillStyle = isCurrent ? '#7ef0cf' : 'rgba(254, 215, 170, 0.5)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(note, x, y);
    });

    // Center pivot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = currentNote ? '#7ef0cf' : 'rgba(254, 215, 170, 0.3)';
    ctx.fill();
  }, [currentNote]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onSelectNote) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.38;

    CIRCLE_OF_FIFTHS.forEach((note, idx) => {
      const angle = (idx / 12) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      const dist = Math.hypot(clickX - x, clickY - y);
      if (dist < 20) {
        onSelectNote(note);
      }
    });
  };

  return (
    <div id="chord-wheel-widget" className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="font-serif text-xs uppercase tracking-[0.24em] text-amber-200/70">
          Chord Wheel
        </span>
        <span className="font-mono text-[10px] text-amber-200/40">
          Circle of Fifths
        </span>
      </div>
      <div className="w-full h-[180px] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={300}
          height={180}
          onClick={handleClick}
          className="w-full h-full block cursor-pointer"
          title="Click any note to hear reference pitch"
        />
      </div>
    </div>
  );
};
