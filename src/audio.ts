/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMusicPlaying = false;
  private bpm = 130;
  private beatStep = 0;
  private nextNoteTime = 0.0;
  private schedulerTimerId: any = null;
  private scheduleAheadTime = 0.12; // Schedule 120ms in advance
  private lookahead = 25.0; // Poll every 25ms
  private noiseBuffer: AudioBuffer | null = null;
  private currentTrackId = 'track_stereo';
  private activeMusicNodes: (OscillatorNode | AudioBufferSourceNode)[] = [];

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  resumeContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        // Reset nextNoteTime so scheduled notes are properly aligned in the future
        this.nextNoteTime = this.ctx!.currentTime + 0.05;
      });
    }
  }

  private trackMusicNode(node: OscillatorNode | AudioBufferSourceNode) {
    this.activeMusicNodes.push(node);
    node.onended = () => {
      const idx = this.activeMusicNodes.indexOf(node);
      if (idx !== -1) {
        this.activeMusicNodes.splice(idx, 1);
      }
    };
  }

  private getNoiseBuffer(): AudioBuffer {
    this.init();
    if (this.noiseBuffer) return this.noiseBuffer;
    if (!this.ctx) {
      // Fallback empty buffer if audio context failed
      const dummyCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      return dummyCtx.createBuffer(1, 44100, 44100);
    }
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  // JUMP SOUND (Upward sweep)
  playJump() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, this.ctx.currentTime + 0.14);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // DEATH EXPLOSION SOUND (White noise crash + pitch drop)
  playDeath() {
    this.init();
    if (!this.ctx) return;
    try {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer();

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.45);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      noise.stop(this.ctx.currentTime + 0.46);

      // Add a low-end sub impact
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(120, this.ctx.currentTime);
      subOsc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 0.35);

      subGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      subGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start();
      subOsc.stop(this.ctx.currentTime + 0.36);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // LANDING SOUND (Subtle retro thud)
  playLand() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // JUMP PAD ACTIVATION (Springy launching sound)
  playPad() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.2);

      // Add frequency modulation for an authentic "boing/spring" feel
      const fm = this.ctx.createOscillator();
      const fmGain = this.ctx.createGain();
      fm.frequency.value = 35;
      fmGain.gain.value = 40;

      fm.connect(fmGain);
      fmGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      fm.start();
      osc.start();
      fm.stop(this.ctx.currentTime + 0.21);
      osc.stop(this.ctx.currentTime + 0.21);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // GRAVITY SWAP SOUND
  playGravitySwap() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.setValueAtTime(480, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // PORTAL TRANSITION (Rising metallic sweep)
  playPortalTransition() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.25);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(225, this.ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.26);
      osc2.stop(this.ctx.currentTime + 0.26);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // JUMP RING TOUCH (Chime)
  playRing() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1350, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // COIN COLLECT SOUND (High-pitch twin chime)
  playCoinCollect() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [1318.51, 1975.53].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.1, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.26);
      });
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // LEVEL WIN FANFARE (Upbeat arpeggio victory sequence)
  playWin() {
    this.init();
    if (!this.ctx) return;
    this.stopMusic();

    try {
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major
      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0.0, now);
        gain.gain.setValueAtTime(0.15, now + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.32);
      });
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Crisp menu selection click sound
  playClick() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1500, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Energetic riser speed gate sound
  playSpeedGate() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(720, this.ctx.currentTime + 0.2);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(360, this.ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1440, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.21);
      osc2.stop(this.ctx.currentTime + 0.21);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Light sparking slide friction sound
  playSlide() {
    this.init();
    if (!this.ctx) return;
    try {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer();

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(6000, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.012, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      noise.stop(this.ctx.currentTime + 0.07);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // SYNTH INSTRUMENT RENDERING
  private playKickNode(time: number) {
    if (!this.ctx) return;
    try {
      // Sub sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(145, time);
      osc.frequency.exponentialRampToValueAtTime(35, time + 0.11);
      
      gain.gain.setValueAtTime(0.32, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
      
      // Transient click
      const click = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      click.type = 'triangle';
      click.frequency.setValueAtTime(1000, time);
      click.frequency.exponentialRampToValueAtTime(180, time + 0.025);
      
      clickGain.gain.setValueAtTime(0.16, time);
      clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.025);
      
      osc.connect(gain);
      click.connect(clickGain);
      
      gain.connect(this.ctx.destination);
      clickGain.connect(this.ctx.destination);
      
      this.trackMusicNode(osc);
      this.trackMusicNode(click);

      osc.start(time);
      osc.stop(time + 0.16);
      click.start(time);
      click.stop(time + 0.03);
    } catch (e) {
      // safe bypass
    }
  }

  private playHiHatNode(time: number, isOpen = false) {
    if (!this.ctx) return;
    try {
      const source = this.ctx.createBufferSource();
      source.buffer = this.getNoiseBuffer();
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7500, time);
      
      const gain = this.ctx.createGain();
      const duration = isOpen ? 0.22 : 0.06;
      
      gain.gain.setValueAtTime(0.045, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      this.trackMusicNode(source);

      source.start(time);
      source.stop(time + duration + 0.01);
    } catch (e) {
      // safe bypass
    }
  }

  private playSnareNode(time: number) {
    if (!this.ctx) return;
    try {
      // Noise burst
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer();
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1300, time);
      
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
      
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      
      // Tone punch
      const tone = this.ctx.createOscillator();
      const toneGain = this.ctx.createGain();
      tone.type = 'triangle';
      tone.frequency.setValueAtTime(175, time);
      tone.frequency.exponentialRampToValueAtTime(90, time + 0.08);
      
      toneGain.gain.setValueAtTime(0.18, time);
      toneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
      
      tone.connect(toneGain);
      toneGain.connect(this.ctx.destination);
      
      this.trackMusicNode(noise);
      this.trackMusicNode(tone);

      noise.start(time);
      noise.stop(time + 0.2);
      tone.start(time);
      tone.stop(time + 0.09);
    } catch (e) {
      // safe bypass
    }
  }

  private playPadChordNode(time: number, frequencies: number[], duration: number) {
    if (!this.ctx) return;
    try {
      frequencies.forEach(freq => {
        const osc1 = this.ctx!.createOscillator();
        const osc2 = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, time);
        
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(freq + 1.2, time); // Detuned chorus
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(550, time);
        filter.frequency.exponentialRampToValueAtTime(1350, time + 0.18);
        filter.frequency.exponentialRampToValueAtTime(500, time + duration);
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.038, time + 0.06); // Smooth attack
        gain.gain.setValueAtTime(0.038, time + duration - 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration + 0.15); // Release
        
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx!.destination);
        
        this.trackMusicNode(osc1);
        this.trackMusicNode(osc2);

        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + duration + 0.2);
        osc2.stop(time + duration + 0.2);
      });
    } catch (e) {
      // safe bypass
    }
  }

  private playBassNode(time: number, freq: number, duration: number) {
    if (!this.ctx) return;
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, time);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 0.5, time); // Sub bass octave
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, time);
      filter.frequency.exponentialRampToValueAtTime(250, time + 0.09);
      
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      this.trackMusicNode(osc1);
      this.trackMusicNode(osc2);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + duration + 0.02);
      osc2.stop(time + duration + 0.02);
    } catch (e) {
      // safe bypass
    }
  }

  private playLeadNode(time: number, freq: number, duration: number) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, time);
      
      gain.gain.setValueAtTime(0.022, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      
      // Infinite Echo delay line loop!
      const delay = this.ctx.createDelay();
      delay.delayTime.value = 0.22; // 220ms delay
      
      const delayGain = this.ctx.createGain();
      delayGain.gain.value = 0.32; // Feedback gain
      
      osc.connect(filter);
      filter.connect(gain);
      
      gain.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(delay); // Feedback path
      
      gain.connect(this.ctx.destination);
      delayGain.connect(this.ctx.destination);
      
      this.trackMusicNode(osc);

      osc.start(time);
      osc.stop(time + duration + 0.01);
    } catch (e) {
      // safe bypass
    }
  }

  // SCHEDULER HEART
  private scheduler() {
    if (!this.ctx) return;
    // If context is suspended, don't schedule notes (keep nextNoteTime synchronized to avoid huge glitched playback bursts)
    if (this.ctx.state === 'suspended') {
      this.nextNoteTime = this.ctx.currentTime;
      return;
    }
    // If nextNoteTime gets stuck or falls behind (e.g. after a resume or tab focus change), reset it
    if (this.nextNoteTime < this.ctx.currentTime) {
      this.nextNoteTime = this.ctx.currentTime + 0.05;
    }

    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.beatStep, this.nextNoteTime);
      this.advanceNote();
    }
  }

  private advanceNote() {
    const secondsPerBeat = 60.0 / this.bpm;
    const secondsPerStep = secondsPerBeat / 4; // 16th notes
    this.nextNoteTime += secondsPerStep;
    this.beatStep++;
  }

  // MATHEMATICAL MUSIC COMPOSITION IN REAL TIME (16th notes per step)
  private scheduleNote(step: number, time: number) {
    // 1. DRUMS (4-on-the-floor EDM house beat)
    const stepInMeasure = step % 16;
    
    // Kick on 0, 4, 8, 12
    if (stepInMeasure % 4 === 0) {
      this.playKickNode(time);
    }
    
    // Snare on 4, 12
    if (stepInMeasure === 4 || stepInMeasure === 12) {
      this.playSnareNode(time);
    }
    
    // Hi-hats on off-beats (2, 6, 10, 14) or fast on demon tracks
    const isDemon = (this.currentTrackId === 'track_blast' || this.currentTrackId === 'track_theory');
    if (stepInMeasure % 4 === 2) {
      this.playHiHatNode(time, false);
    } else if (isDemon && stepInMeasure % 2 === 1) {
      this.playHiHatNode(time, false); // Rapid double hat
    }

    // 2. CHORD HARMONIES & BASSLINES
    // 4-measure loops
    const measure = Math.floor(step / 16) % 4;
    
    // Define progressions
    let chordFreqs: number[] = [];
    let bassRoot = 55.00; // default A1 (55Hz)
    
    if (this.currentTrackId === 'track_stereo') {
      // A Minor: Am, F, C, G
      const roots = [55.00, 43.65, 65.41, 49.00]; // A1, F1, C2, G1
      bassRoot = roots[measure];
      
      const chords = [
        [220.00, 261.63, 329.63], // Am (A3, C4, E4)
        [174.61, 220.00, 261.63], // F (F3, A3, C4)
        [261.63, 329.63, 392.00], // C (C4, E4, G4)
        [196.00, 246.94, 293.66], // G (G3, B3, D4)
      ];
      chordFreqs = chords[measure];
    } 
    else if (this.currentTrackId === 'track_back') {
      // F# Minor: F#m, D, A, E
      const roots = [46.25, 36.71, 55.00, 41.20]; // F#1, D1, A1, E1
      bassRoot = roots[measure];
      
      const chords = [
        [185.00, 220.00, 277.18], // F#m
        [146.83, 185.00, 220.00], // D
        [220.00, 277.18, 329.63], // A
        [164.81, 207.65, 246.94], // E
      ];
      chordFreqs = chords[measure];
    }
    else if (this.currentTrackId === 'track_dry') {
      // C Minor: Cm, Ab, Eb, Bb
      const roots = [65.41, 51.91, 77.78, 58.27]; // C2, Ab1, Eb2, Bb1
      bassRoot = roots[measure];
      
      const chords = [
        [261.63, 311.13, 392.00], // Cm
        [207.65, 261.63, 311.13], // Ab
        [311.13, 392.00, 466.16], // Eb
        [233.08, 293.66, 349.23], // Bb
      ];
      chordFreqs = chords[measure];
    }
    else if (this.currentTrackId === 'track_blast') {
      // D Minor: Dm, Bb, F, C
      const roots = [36.71, 29.14, 43.65, 32.70]; // D1, Bb0, F1, C1
      bassRoot = roots[measure];
      
      const chords = [
        [293.66, 349.23, 440.00], // Dm
        [233.08, 293.66, 349.23], // Bb
        [349.23, 440.00, 523.25], // F
        [261.63, 329.63, 392.00], // C
      ];
      chordFreqs = chords[measure];
    }
    else {
      // Theory of Everything - G Minor: Gm, Eb, Bb, F
      const roots = [49.00, 38.89, 58.27, 43.65]; // G1, Eb1, Bb1, F1
      bassRoot = roots[measure];
      
      const chords = [
        [196.00, 233.08, 293.66], // Gm
        [155.56, 196.00, 233.08], // Eb
        [233.08, 293.66, 349.23], // Bb
        [174.61, 220.00, 261.63], // F
      ];
      chordFreqs = chords[measure];
    }

    // Trigger pad chords every 16 steps (start of measure) or 8 steps (midway)
    if (stepInMeasure === 0) {
      const stepDur = (60.0 / this.bpm) * 4; // 4 beats duration
      this.playPadChordNode(time, chordFreqs, stepDur * 0.95);
    }

    // Rhythmic bassline (classic off-beat rolling sub-bass!)
    // Plays on eighth note offsets: 1, 3, 5, 7, 9, 11, 13, 15
    if (stepInMeasure % 2 === 1) {
      const stepDur = (60.0 / this.bpm) / 4; // 16th note duration
      this.playBassNode(time, bassRoot * 2, stepDur * 0.85);
    }

    // 3. SYNTH LEAD MELODY
    // Let's program a beautiful, heroic 4-measure electronic melody loop for each level
    const stepInLoop = step % 64;
    let melodyNoteIndex = -1;
    let leadScaleMultipliers: number[] = [];

    if (this.currentTrackId === 'track_stereo') {
      // Heroic A minor melody
      // Index of steps to play a lead note
      const playSteps = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 34, 36, 40, 44, 48, 52, 56, 60];
      melodyNoteIndex = playSteps.indexOf(stepInLoop);
      // Multipliers on bass root frequency
      leadScaleMultipliers = [
        4, 4.8, 5, 4.8, 6, 5, 4.8, 4, 
        3.5, 4, 4.8, 4, 5, 6,
        4.8, 5, 6, 5, 4.8, 4, 3.5, 3, 4
      ];
    } 
    else if (this.currentTrackId === 'track_back') {
      // Energetic F# minor melody
      const playSteps = [0, 3, 6, 8, 11, 14, 16, 19, 22, 24, 27, 30, 32, 36, 40, 44, 48, 52, 56, 60];
      melodyNoteIndex = playSteps.indexOf(stepInLoop);
      leadScaleMultipliers = [
        4, 4.8, 5, 6, 5.4, 4.8, 4, 4.8, 5, 6, 5.4, 4.8,
        3.6, 4, 4.8, 5, 6, 5.4, 4.8, 4
      ];
    }
    else if (this.currentTrackId === 'track_dry') {
      // Atmospheric C minor melody
      const playSteps = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60];
      melodyNoteIndex = playSteps.indexOf(stepInLoop);
      leadScaleMultipliers = [
        4, 4.8, 5, 4.8, 4, 3.6, 3, 4,
        4.8, 5.4, 6, 5.4, 4.8, 4, 3.6, 3
      ];
    }
    else if (this.currentTrackId === 'track_blast') {
      // Intense, super fast cyber D minor lead
      const playSteps = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 52, 56, 60];
      melodyNoteIndex = playSteps.indexOf(stepInLoop);
      leadScaleMultipliers = [
        4, 4.5, 5, 6, 5, 4.5, 4, 3.5,
        4, 4.5, 5, 6, 5.4, 4.8, 4, 3.5,
        3, 3.5, 4, 4.5, 5, 4.5, 4, 3.5,
        4, 5, 6, 8
      ];
    }
    else {
      // Mysterious G minor melody (Theory of Everything)
      const playSteps = [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 40, 44, 48, 52, 56, 60];
      melodyNoteIndex = playSteps.indexOf(stepInLoop);
      leadScaleMultipliers = [
        4, 4.8, 5.4, 6, 5.4, 4.8, 4, 3.6, 3, 3.6, 4, 4.8,
        5.4, 6, 5.4, 4.8, 4, 3.6, 3
      ];
    }

    if (melodyNoteIndex !== -1 && leadScaleMultipliers[melodyNoteIndex]) {
      const stepDur = (60.0 / this.bpm) / 4; // 16th note duration
      const leadFreq = bassRoot * leadScaleMultipliers[melodyNoteIndex];
      this.playLeadNode(time, leadFreq, stepDur * 1.5); // nice length for delays!
    }
  }

  // START BACKGROUND RHYTHM MUSIC
  startMusic(trackId?: string) {
    this.init();
    if (trackId) {
      this.currentTrackId = trackId;
    }
    if (!this.ctx || this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.beatStep = 0;

    // Set BPM depending on level track
    let bpm = 130;
    if (this.currentTrackId === 'track_back') bpm = 136;
    if (this.currentTrackId === 'track_blast') bpm = 142;
    if (this.currentTrackId === 'track_dry') bpm = 125;
    if (this.currentTrackId === 'track_theory') bpm = 132;
    this.bpm = bpm;

    this.nextNoteTime = this.ctx.currentTime + 0.05;

    // Start scheduling loop
    const scheduleNextNotes = () => {
      if (!this.isMusicPlaying) return;
      this.scheduler();
    };

    // Poll scheduler every 25ms
    this.schedulerTimerId = setInterval(scheduleNextNotes, this.lookahead);
    scheduleNextNotes();
  }

  stopMusic() {
    if (this.schedulerTimerId) {
      clearInterval(this.schedulerTimerId);
      this.schedulerTimerId = null;
    }
    this.isMusicPlaying = false;
    
    // Stop and clear all active music nodes instantly to avoid any overlapping
    this.activeMusicNodes.forEach(node => {
      try {
        node.stop();
      } catch (e) {
        // Safe bypass
      }
    });
    this.activeMusicNodes = [];
  }
}

export const audio = new AudioEngine();
