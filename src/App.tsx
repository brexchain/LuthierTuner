/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PRESET_TUNINGS, REFERENCE_A4_OPTIONS } from './data/tunings';
import { TuningPreset, PitchDetectionResult, CustomArtwork } from './types';
import { detectPitch, midiToFreq, freqToNote } from './audio/pitchDetector';
import { playPluck, setDronePitch, getAudioContext } from './audio/synth';
import { Gauge } from './components/Gauge';
import { ChordWheel } from './components/ChordWheel';
import { PitchTrace } from './components/PitchTrace';
import { GuitarBody } from './components/GuitarBody';
import { StringRail } from './components/StringRail';
import { ImageStudioModal } from './components/ImageStudioModal';
import { Mic, MicOff, Music, Sparkles, Volume2, VolumeX, HelpCircle } from 'lucide-react';

export default function App() {
  // State
  const [a4, setA4] = useState<number>(440);
  const [selectedTuningId, setSelectedTuningId] = useState<string>('standard');
  const [currentTuning, setCurrentTuning] = useState<TuningPreset>(PRESET_TUNINGS[0]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [pitchData, setPitchData] = useState<PitchDetectionResult | null>(null);
  const [targetStringIndex, setTargetStringIndex] = useState<number | null>(null);
  const [droneStringIndex, setDroneStringIndex] = useState<number | null>(null);
  const [vibratingStrings, setVibratingStrings] = useState<Record<number, boolean>>({});
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);
  const [customArtwork, setCustomArtwork] = useState<CustomArtwork | null>(null);
  const [artHistory, setArtHistory] = useState<CustomArtwork[]>([]);
  const [tuningMode, setTuningMode] = useState<'chromatic' | 'target'>('chromatic');

  // Refs for audio processing
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);

  // Synchronize tuning preset
  const handleTuningChange = (id: string) => {
    setSelectedTuningId(id);
    const found = PRESET_TUNINGS.find((t) => t.id === id) || PRESET_TUNINGS[0];
    setCurrentTuning(found);
    setTargetStringIndex(null);
  };

  // Pluck a specific string
  const pluckString = useCallback(
    (index: number) => {
      const str = currentTuning.strings[index];
      if (!str) return;

      const freq = midiToFreq(str.midi, a4);
      playPluck(freq);

      // Trigger visual vibration
      setVibratingStrings((prev) => ({ ...prev, [index]: true }));
      setTimeout(() => {
        setVibratingStrings((prev) => ({ ...prev, [index]: false }));
      }, 700);

      // Simulate instantaneous pitch feedback
      const parsed = freqToNote(freq, a4);
      if (parsed) {
        setPitchData({
          frequency: freq,
          noteName: parsed.noteName,
          octave: parsed.octave,
          cents: 0,
          midi: parsed.midi,
          clarity: 0.98,
          rms: 0.7,
          label: parsed.label,
          nearestStringIndex: index,
          inTune: true,
        });
      }
    },
    [currentTuning, a4]
  );

  // Strum all strings in sequence
  const strumAll = useCallback(() => {
    currentTuning.strings.forEach((str, idx) => {
      setTimeout(() => {
        pluckString(idx);
      }, idx * 60);
    });
  }, [currentTuning, pluckString]);

  // Toggle continuous drone tone
  const toggleDrone = (stringIndex: number) => {
    if (droneStringIndex === stringIndex) {
      setDronePitch(null);
      setDroneStringIndex(null);
    } else {
      const str = currentTuning.strings[stringIndex];
      if (str) {
        const freq = midiToFreq(str.midi, a4);
        setDronePitch(freq);
        setDroneStringIndex(stringIndex);
      }
    }
  };

  // Microphone toggle & Pitch loop
  const toggleMic = async () => {
    if (isListening) {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
        micStreamRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      setIsListening(false);
      setPitchData(null);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
        },
      });

      micStreamRef.current = stream;
      const ctx = getAudioContext();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsListening(true);
    } catch (err) {
      console.error('Microphone error:', err);
      alert('Could not access microphone. Please check permissions.');
      setIsListening(false);
    }
  };

  // Real-time audio pitch detection loop
  useEffect(() => {
    if (!isListening || !analyserRef.current || !audioCtxRef.current) return;

    const analyser = analyserRef.current;
    const ctx = audioCtxRef.current;
    const buffer = new Float32Array(analyser.fftSize);

    let isMounted = true;

    const loop = () => {
      if (!isMounted) return;

      analyser.getFloatTimeDomainData(buffer);
      const result = detectPitch(buffer, ctx.sampleRate, a4, currentTuning.strings);

      const now = performance.now();

      if (result) {
        lastDetectionTimeRef.current = now;
        setPitchData(result);

        // If in target string mode, verify matching string
        if (result.nearestStringIndex !== undefined) {
          setVibratingStrings((prev) => ({
            ...prev,
            [result.nearestStringIndex!]: true,
          }));
        }
      } else if (now - lastDetectionTimeRef.current > 650) {
        // Clear old pitch reading if silence persists
        setPitchData(null);
        setVibratingStrings({});
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      isMounted = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isListening, a4, currentTuning]);

  // Keyboard shortcuts (Space = Strum, 1-6 = Pluck, M = Mic)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        strumAll();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMic();
      } else if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < currentTuning.strings.length) {
          pluckString(idx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [strumAll, pluckString, isListening]);

  return (
    <div className="min-h-screen bg-[#070403] text-amber-100 font-sans relative overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* Ambient background decorative rosettes and radial glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#3a2113_0%,#180d08_45%,#070403_100%)]" />
        <div className="absolute inset-0 opacity-70 bg-[conic-gradient(from_180deg_at_50%_40%,rgba(255,196,110,0.08)_0deg,transparent_126deg,rgba(126,240,207,0.05)_234deg,transparent_360deg)]" />
        <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 w-[110vh] h-[110vh] rounded-full border border-amber-400/[0.07] shadow-[inset_0_0_160px_rgba(255,196,110,0.04)]" />
        <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 w-[75vh] h-[75vh] rounded-full border border-dashed border-amber-400/[0.11]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col min-h-screen gap-4">
        {/* Header Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-amber-500/15">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-amber-400/30 bg-[radial-gradient(circle_at_35%_30%,#5b3318,#2a1710)] flex items-center justify-center shadow-inner">
              <div className="w-4 h-4 rounded-full border border-amber-300/40 bg-[#0a0503]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl tracking-[0.22em] uppercase font-bold text-amber-200">
                  Luthier
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-amber-500/15 text-amber-300 border border-amber-500/25">
                  Pro Rig
                </span>
              </div>
              <p className="font-mono text-[11px] text-amber-200/50">
                pro guitar tuner · frequency laboratory
              </p>
            </div>
          </div>

          {/* Top Level Controls */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {/* Reference Pitch selector */}
            <div className="flex items-center bg-black/50 border border-amber-500/20 rounded-lg px-2.5 py-1.5 gap-1.5">
              <span className="text-amber-200/50">A4:</span>
              <select
                value={a4}
                onChange={(e) => setA4(Number(e.target.value))}
                className="bg-transparent text-amber-200 outline-none cursor-pointer"
                title="Concert Reference Pitch"
              >
                {REFERENCE_A4_OPTIONS.map((hz) => (
                  <option key={hz} value={hz} className="bg-[#140c08] text-amber-200">
                    {hz} Hz
                  </option>
                ))}
              </select>
            </div>

            {/* Tuning Presets selector */}
            <select
              value={selectedTuningId}
              onChange={(e) => handleTuningChange(e.target.value)}
              className="bg-black/50 border border-amber-500/20 rounded-lg px-2.5 py-1.5 text-amber-200 outline-none cursor-pointer"
              title="Instrument Tuning Preset"
            >
              {PRESET_TUNINGS.map((preset) => (
                <option key={preset.id} value={preset.id} className="bg-[#140c08] text-amber-200">
                  {preset.name}
                </option>
              ))}
            </select>

            {/* Microphone Toggle Button */}
            <button
              onClick={toggleMic}
              id="mic-toggle-btn"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-semibold ${
                isListening
                  ? 'border-[#7ef0cf] bg-[#7ef0cf]/15 text-[#a7f3d0] shadow-[0_0_12px_rgba(126,240,207,0.3)]'
                  : 'border-amber-500/20 bg-black/50 text-amber-200 hover:border-amber-400/40'
              }`}
            >
              {isListening ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#6ee7b7] shadow-[0_0_8px_#6ee7b7] animate-ping" />
                  <Mic className="w-3.5 h-3.5" />
                  <span>MIC LISTENING</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400/40" />
                  <MicOff className="w-3.5 h-3.5" />
                  <span>USE MY MIC</span>
                </>
              )}
            </button>

            {/* Strum Button */}
            <button
              onClick={strumAll}
              id="strum-all-btn"
              className="px-3 py-1.5 rounded-lg bg-gradient-to-b from-amber-200 to-amber-400 text-black font-bold border border-amber-200/50 shadow-[0_8px_20px_-6px_rgba(255,196,110,0.6)] hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Music className="w-3.5 h-3.5" />
              <span>STRUM · SPACE</span>
            </button>

            {/* Custom Studio Modal Trigger */}
            <button
              onClick={() => setIsStudioOpen(true)}
              id="custom-studio-btn"
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-200 hover:bg-amber-500/25 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Create custom guitar finishes & rosettes with Gemini AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7ef0cf]" />
              <span>CUSTOM STUDIO</span>
            </button>
          </div>
        </header>

        {/* 3-Column Studio Grid Layout */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start flex-1">
          {/* Left Column: Analogue Movement Gauge & Sound Lab Guide (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Analogue Needle Gauge Card */}
            <div className="bg-[#0d0806]/80 border border-amber-500/15 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
              <Gauge
                cents={pitchData?.cents ?? 0}
                inTune={pitchData?.inTune ?? false}
                hasSignal={pitchData !== null}
                level={pitchData?.rms ?? 0}
                clarity={pitchData?.clarity ?? 0}
              />
            </div>

            {/* How to Read the Rig Card */}
            <div className="bg-[#0d0806]/80 border border-amber-500/15 rounded-2xl p-4 shadow-xl backdrop-blur-md font-mono text-xs space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="font-serif text-xs uppercase tracking-[0.24em] text-amber-200/70">
                  How to read the rig
                </span>
                <span className="text-[10px] text-amber-200/35">5 views · 1 signal</span>
              </div>

              <ul className="space-y-2 text-[11px] text-amber-200/75">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f7c66b] shadow-[0_0_8px_#f7c66b] shrink-0" />
                  <span>
                    <strong className="text-amber-100 font-sans">Analogue needle:</strong> cents deviation off nearest note
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#7ef0cf] shadow-[0_0_8px_#7ef0cf] shrink-0" />
                  <span>
                    <strong className="text-amber-100 font-sans">Chord wheel:</strong> harmonic position on Circle of Fifths
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff9d7a] shadow-[0_0_8px_#ff9d7a] shrink-0" />
                  <span>
                    <strong className="text-amber-100 font-sans">Pitch trace:</strong> continuous frequency rolling through time
                  </span>
                </li>
              </ul>
            </div>

            {/* Drone / Ear Training Pitch Pipe Quick Card */}
            <div className="bg-[#0d0806]/80 border border-amber-500/15 rounded-2xl p-3.5 shadow-xl backdrop-blur-md flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                {droneStringIndex !== null ? (
                  <Volume2 className="w-4 h-4 text-[#7ef0cf] animate-pulse" />
                ) : (
                  <VolumeX className="w-4 h-4 text-amber-200/40" />
                )}
                <div>
                  <div className="font-semibold text-amber-200">
                    {droneStringIndex !== null
                      ? `Tone Drone: ${currentTuning.strings[droneStringIndex]?.name}`
                      : 'Pitch Pipe Drone'}
                  </div>
                  <div className="text-[10px] text-amber-200/40">
                    {droneStringIndex !== null
                      ? `${midiToFreq(currentTuning.strings[droneStringIndex]?.midi, a4).toFixed(1)} Hz active`
                      : 'Click antenna on string rail to hold tone'}
                  </div>
                </div>
              </div>
              {droneStringIndex !== null && (
                <button
                  onClick={() => {
                    setDronePitch(null);
                    setDroneStringIndex(null);
                  }}
                  className="px-2 py-1 rounded bg-red-950/60 border border-red-500/30 text-red-300 text-[10px] hover:bg-red-900/50 cursor-pointer"
                >
                  MUTE
                </button>
              )}
            </div>
          </div>

          {/* Center Column: Interactive Acoustic Guitar Body (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            <GuitarBody
              currentNote={pitchData?.noteName ?? null}
              currentOctave={pitchData?.octave ?? null}
              inTune={pitchData?.inTune ?? false}
              strings={currentTuning.strings}
              activeStringIndex={pitchData?.nearestStringIndex ?? targetStringIndex}
              vibratingStrings={vibratingStrings}
              onPluckString={pluckString}
              onStrum={strumAll}
              customArtwork={customArtwork}
              onOpenStudio={() => setIsStudioOpen(true)}
            />
          </div>

          {/* Right Column: Chord Wheel & Pitch Trace Oscilloscope (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Chord Wheel Card */}
            <div className="bg-[#0d0806]/80 border border-amber-500/15 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
              <ChordWheel
                currentNote={pitchData?.noteName ?? null}
                onSelectNote={(noteName) => {
                  // Pluck octave 3 of that note
                  const baseMidiMap: Record<string, number> = {
                    C: 48, 'C#': 49, D: 50, 'D#': 51, E: 52, F: 53,
                    'F#': 54, G: 55, 'G#': 56, A: 57, 'A#': 58, B: 59,
                  };
                  const midi = baseMidiMap[noteName] || 57;
                  playPluck(midiToFreq(midi, a4));
                }}
              />
            </div>

            {/* Pitch Trace & Stats Card */}
            <div className="bg-[#0d0806]/80 border border-amber-500/15 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
              <PitchTrace pitchData={pitchData} />
            </div>

            {/* Tuning Mode Selector */}
            <div className="bg-[#0d0806]/80 border border-amber-500/15 rounded-2xl p-3 shadow-xl backdrop-blur-md flex items-center justify-between font-mono text-xs">
              <span className="text-amber-200/60 text-[11px] uppercase">Mode:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setTuningMode('chromatic')}
                  className={`px-2.5 py-1 rounded-md text-[11px] cursor-pointer transition-all ${
                    tuningMode === 'chromatic'
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 font-semibold'
                      : 'text-amber-200/50 hover:text-amber-200'
                  }`}
                >
                  Chromatic Auto
                </button>
                <button
                  onClick={() => setTuningMode('target')}
                  className={`px-2.5 py-1 rounded-md text-[11px] cursor-pointer transition-all ${
                    tuningMode === 'target'
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 font-semibold'
                      : 'text-amber-200/50 hover:text-amber-200'
                  }`}
                >
                  String Lock
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Section: Interactive String Rail */}
        <section className="mt-2">
          <StringRail
            strings={currentTuning.strings}
            a4={a4}
            activeStringIndex={pitchData?.nearestStringIndex ?? null}
            inTune={pitchData?.inTune ?? false}
            droneStringIndex={droneStringIndex}
            onPluckString={pluckString}
            onToggleDrone={toggleDrone}
          />
        </section>
      </div>

      {/* Gemini AI Image Studio Modal for Custom Guitar Finishes & Rosettes */}
      <ImageStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onApplyArtwork={(artwork) => {
          setCustomArtwork(artwork);
        }}
        activeArtwork={customArtwork}
        history={artHistory}
        onAddToHistory={(artwork) => {
          setArtHistory((prev) => [artwork, ...prev.filter((a) => a.id !== artwork.id)]);
        }}
      />
    </div>
  );
}
