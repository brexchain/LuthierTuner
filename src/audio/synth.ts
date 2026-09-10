/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * High-fidelity acoustic guitar pluck physical modeling synthesizer.
 * Simulates string tension, body resonance, and finger/pick attack.
 */
export function playPluck(frequency: number, velocity = 0.85): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const duration = 2.4;

  // Master gain for this voice
  const voiceGain = ctx.createGain();
  voiceGain.gain.setValueAtTime(0, now);
  voiceGain.gain.linearRampToValueAtTime(velocity * 0.7, now + 0.006);
  voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  // Body Resonance Filter (Acoustic mahogany soundbox simulation)
  const bodyFilter = ctx.createBiquadFilter();
  bodyFilter.type = 'peaking';
  bodyFilter.frequency.setValueAtTime(190, now); // Typical guitar air resonance
  bodyFilter.Q.setValueAtTime(2.2, now);
  bodyFilter.gain.setValueAtTime(4.5, now);

  // String Damping Lowpass Filter (strings lose high frequencies over time)
  const stringFilter = ctx.createBiquadFilter();
  stringFilter.type = 'lowpass';
  stringFilter.frequency.setValueAtTime(Math.min(frequency * 8, 8000), now);
  stringFilter.frequency.exponentialRampToValueAtTime(frequency * 1.8, now + duration);

  // Fundamental & Warm Harmonic Oscillators
  const osc1 = ctx.createOscillator();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(frequency, now);

  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(frequency * 1.002, now); // micro-detune for acoustic warmth

  const subOsc = ctx.createOscillator();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(frequency, now);

  // Pick noise burst (attack transient)
  const bufferSize = Math.floor(ctx.sampleRate * 0.02);
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
  }
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(Math.min(frequency * 3, 3500), now);
  noiseFilter.Q.setValueAtTime(3.0, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(velocity * 0.35, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(bodyFilter);

  // Routing oscillators through filters
  const oscMix = ctx.createGain();
  oscMix.gain.setValueAtTime(0.5, now);

  osc1.connect(oscMix);
  osc2.connect(oscMix);
  subOsc.connect(oscMix);

  oscMix.connect(stringFilter);
  stringFilter.connect(bodyFilter);
  bodyFilter.connect(voiceGain);
  voiceGain.connect(ctx.destination);

  // Start & Stop
  osc1.start(now);
  osc2.start(now);
  subOsc.start(now);
  noiseSource.start(now);

  osc1.stop(now + duration);
  osc2.stop(now + duration);
  subOsc.stop(now + duration);
  noiseSource.stop(now + 0.03);
}

/**
 * Continuous pitch reference drone
 */
let droneOsc: OscillatorNode | null = null;
let droneGain: GainNode | null = null;

export function setDronePitch(frequency: number | null): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  if (frequency === null || frequency <= 0) {
    if (droneGain) {
      droneGain.gain.linearRampToValueAtTime(0.0001, now + 0.15);
      setTimeout(() => {
        if (droneOsc) {
          droneOsc.stop();
          droneOsc.disconnect();
          droneOsc = null;
        }
        if (droneGain) {
          droneGain.disconnect();
          droneGain = null;
        }
      }, 160);
    }
    return;
  }

  if (!droneOsc || !droneGain) {
    droneOsc = ctx.createOscillator();
    droneGain = ctx.createGain();

    droneOsc.type = 'sine';
    droneOsc.frequency.setValueAtTime(frequency, now);

    droneGain.gain.setValueAtTime(0, now);
    droneGain.gain.linearRampToValueAtTime(0.25, now + 0.1);

    droneOsc.connect(droneGain);
    droneGain.connect(ctx.destination);
    droneOsc.start(now);
  } else {
    droneOsc.frequency.setTargetAtTime(frequency, now, 0.05);
  }
}

export function isDronePlaying(): boolean {
  return droneOsc !== null;
}
