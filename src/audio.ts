/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicInterval: any = null;
  private isMusicPlaying = false;
  private bpm = 130;
  private beatStep = 0;

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

  // JUMP SOUND (Upward sine sweep)
  playJump() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // DEATH EXPLOSION SOUND (White noise crash + pitch drop)
  playDeath() {
    this.init();
    if (!this.ctx) return;
    try {
      // Noise buffer for explosion
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      noise.stop(this.ctx.currentTime + 0.4);

      // Add a low-end sub impact
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(100, this.ctx.currentTime);
      subOsc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.3);

      subGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      subGain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start();
      subOsc.stop(this.ctx.currentTime + 0.3);
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
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.setValueAtTime(450, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

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
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.25);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(210, this.ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(840, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc2.start();
      osc.stop(this.ctx.currentTime + 0.26);
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
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

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

        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.25);

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
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0.0, now);
        gain.gain.setValueAtTime(0.15, now + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.3);
      });
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  private currentTrackId = 'track_stereo';

  // START BACKGROUND RHYTHM MUSIC
  startMusic(trackId?: string) {
    this.init();
    if (trackId) {
      this.currentTrackId = trackId;
    }
    if (!this.ctx || this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.beatStep = 0;

    let bpm = 130;
    if (this.currentTrackId === 'track_back') bpm = 136;
    if (this.currentTrackId === 'track_blast') bpm = 142;
    if (this.currentTrackId === 'track_dry') bpm = 125;
    if (this.currentTrackId === 'track_theory') bpm = 132;
    
    this.bpm = bpm;
    const stepDuration = 60 / this.bpm / 2; // Eighth notes

    const playNextStep = () => {
      if (!this.isMusicPlaying || !this.ctx) return;
      const time = this.ctx.currentTime;

      // 1. KICK DRUM (Every 2 steps = quarter note, plus track-specific syncopations)
      let playKick = (this.beatStep % 2 === 0);
      if (this.currentTrackId === 'track_blast' && (this.beatStep % 16 === 14 || this.beatStep % 16 === 15)) {
        playKick = true; // Fast double bass kick at the end of the bar
      }
      if (this.currentTrackId === 'track_dry' && this.beatStep % 8 === 3) {
        playKick = true; // Syncopated kick on the off-beat
      }

      if (playKick) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(this.currentTrackId === 'track_theory' ? 130 : 150, time);
        osc.frequency.exponentialRampToValueAtTime(this.currentTrackId === 'track_dry' ? 35 : 40, time + 0.1);
        gain.gain.setValueAtTime(0.22, time);
        gain.gain.linearRampToValueAtTime(0.01, time + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.15);
      }

      // 2. SYNTH BASSLINE (Retro 8-bit rolling bass)
      const measure = Math.floor(this.beatStep / 16) % 4;
      const stepInMeasure = this.beatStep % 16;
      let rootFreq = 55.00; // Default: A1
      
      if (this.currentTrackId === 'track_stereo') {
        // A Minor: A, G, F, E
        if (measure === 1) rootFreq = 48.99; // G1
        if (measure === 2) rootFreq = 43.65; // F1
        if (measure === 3) rootFreq = 41.20; // E1
      } else if (this.currentTrackId === 'track_back') {
        // F# Minor: F#, E, D, C#
        rootFreq = 46.25; // F#1
        if (measure === 1) rootFreq = 41.20; // E1
        if (measure === 2) rootFreq = 36.71; // D1
        if (measure === 3) rootFreq = 34.65; // C#1
      } else if (this.currentTrackId === 'track_blast') {
        // D Minor: D, C, Bb, A
        rootFreq = 36.71; // D1
        if (measure === 1) rootFreq = 32.70; // C1
        if (measure === 2) rootFreq = 29.14; // Bb0
        if (measure === 3) rootFreq = 27.50; // A0
      } else if (this.currentTrackId === 'track_dry') {
        // C Minor: C, Bb, Ab, G
        rootFreq = 32.70; // C1
        if (measure === 1) rootFreq = 29.14; // Bb0
        if (measure === 2) rootFreq = 25.96; // Ab0
        if (measure === 3) rootFreq = 24.50; // G0
      } else {
        // Theory of Everything - G Minor: G, F, Eb, D
        rootFreq = 48.99; // G1
        if (measure === 1) rootFreq = 43.65; // F1
        if (measure === 2) rootFreq = 38.89; // Eb1
        if (measure === 3) rootFreq = 36.71; // D1
      }

      // Bass patterns
      let bassPattern = [1, 1, 1.5, 1, 1, 1.2, 1.5, 1.2, 1, 1, 1.5, 1, 1, 1.2, 1.8, 1.5];
      if (this.currentTrackId === 'track_blast') {
        bassPattern = [1, 1.2, 1, 1.2, 1, 1.5, 1.2, 1.5, 1, 1.2, 1, 1.2, 1.8, 1.5, 1.3, 1];
      } else if (this.currentTrackId === 'track_dry') {
        bassPattern = [1, 1, 1.33, 1, 1, 1, 1.5, 1, 1, 1, 1.33, 1, 1.2, 1.2, 1.5, 1.8];
      }
      
      const noteMultiplier = bassPattern[stepInMeasure];
      const noteFreq = rootFreq * noteMultiplier;

      const bassOsc = this.ctx!.createOscillator();
      const bassGain = this.ctx!.createGain();
      
      if (this.currentTrackId === 'track_back') {
        bassOsc.type = 'square';
      } else if (this.currentTrackId === 'track_dry') {
        bassOsc.type = 'triangle';
      } else {
        bassOsc.type = 'sawtooth';
      }
      
      bassOsc.frequency.setValueAtTime(noteFreq, time);

      // Lowpass filter configuration
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      
      let filterFreq = 350;
      if (this.currentTrackId === 'track_dry') filterFreq = 180;
      if (this.currentTrackId === 'track_back') filterFreq = 450;
      if (this.currentTrackId === 'track_theory') {
        filterFreq = 200 + (stepInMeasure * 40); // Sweeping lowpass filter
      }
      filter.frequency.setValueAtTime(filterFreq, time);

      let gainVal = 0.08;
      if (this.currentTrackId === 'track_dry') gainVal = 0.15; // Triangle needs more gain
      if (this.currentTrackId === 'track_back') gainVal = 0.06; // Square is louder
      
      bassGain.gain.setValueAtTime(gainVal, time);
      bassGain.gain.linearRampToValueAtTime(0.005, time + stepDuration * 0.9);

      bassOsc.connect(filter);
      filter.connect(bassGain);
      bassGain.connect(this.ctx!.destination);

      bassOsc.start(time);
      bassOsc.stop(time + stepDuration * 0.95);

      // 3. RETRO MELODY LEAD
      if (measure >= 0 && (stepInMeasure % 4 === 1 || stepInMeasure % 4 === 3)) {
        let leadNotes = [1, 1.2, 1.5, 1.33, 1.8, 1.5, 2.0, 1.8];
        if (this.currentTrackId === 'track_back') {
          leadNotes = [1.5, 1.8, 2.0, 1.5, 2.25, 2.0, 1.8, 1.5];
        } else if (this.currentTrackId === 'track_blast') {
          leadNotes = [1, 1.33, 1.5, 1.8, 1.2, 1.5, 1.8, 2.25];
        } else if (this.currentTrackId === 'track_dry') {
          leadNotes = [1.2, 1.5, 1.8, 2.0, 1.5, 1.8, 2.25, 2.5];
        } else if (this.currentTrackId === 'track_theory') {
          leadNotes = [1.5, 2.0, 1.8, 1.5, 2.5, 2.0, 3.0, 2.5];
        }

        const leadNoteIndex = (measure * 4 + Math.floor(stepInMeasure / 2)) % leadNotes.length;
        const leadFreq = noteFreq * 4 * leadNotes[leadNoteIndex];

        const leadOsc = this.ctx!.createOscillator();
        const leadGain = this.ctx!.createGain();
        
        if (this.currentTrackId === 'track_blast') {
          leadOsc.type = 'sawtooth'; // Bright buzzer lead
        } else if (this.currentTrackId === 'track_dry') {
          leadOsc.type = 'sine'; // Round whistle lead
        } else {
          leadOsc.type = 'triangle';
        }
        
        leadOsc.frequency.setValueAtTime(leadFreq, time);

        let leadGainVal = 0.04;
        if (this.currentTrackId === 'track_dry') leadGainVal = 0.08;
        if (this.currentTrackId === 'track_blast') leadGainVal = 0.025;

        leadGain.gain.setValueAtTime(leadGainVal, time);
        leadGain.gain.exponentialRampToValueAtTime(0.001, time + stepDuration * 1.5);

        leadOsc.connect(leadGain);
        leadGain.connect(this.ctx!.destination);

        leadOsc.start(time);
        leadOsc.stop(time + stepDuration * 1.6);
      }

      this.beatStep++;
    };

    // Synthesize steps using accurate setInterval
    const intervalTime = (60 / this.bpm / 2) * 1000;
    this.musicInterval = setInterval(playNextStep, intervalTime);
    playNextStep();
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }
}

export const audio = new AudioEngine();
