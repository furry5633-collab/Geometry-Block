/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Level, PlayerSkins, Gamemode, ElementType } from '../types';
import { drawCube, drawWave, drawRobot, drawBall } from '../skins';
import { audio } from '../audio';
import { TILE_SIZE, GROUND_Y_PIXELS, gridToX, gridToY } from '../levels';
import { Play, RotateCcw, X, Volume2, VolumeX, Award, ShieldAlert } from 'lucide-react';

export interface LevelTheme {
  id: string;
  name: string;
  emoji: string;
  bg: string;
  mountain: string;
  skyGlow: string;
  neon: string;
}

export const LEVEL_THEMES: LevelTheme[] = [
  { id: 'purple', name: 'Púrpura Cósmico', emoji: '🔮', bg: '#6D28D9', mountain: '#5B21B6', skyGlow: '#4C1D95', neon: '#10B981' },
  { id: 'cyber', name: 'Cyberpunk Neon', emoji: '🌌', bg: '#090D1A', mountain: '#131930', skyGlow: '#1F2A4C', neon: '#FF007F' },
  { id: 'toxic', name: 'Ácido Radiactivo', emoji: '☣️', bg: '#022C22', mountain: '#064E3B', skyGlow: '#0F766E', neon: '#A3E635' },
  { id: 'lava', name: 'Fuego Volcánico', emoji: '🔥', bg: '#2D0606', mountain: '#450A0A', skyGlow: '#7F1D1D', neon: '#EA580C' },
  { id: 'slate', name: 'Pizarra Brutal', emoji: '🩶', bg: '#0F172A', mountain: '#1E293B', skyGlow: '#334155', neon: '#38BDF8' },
  { id: 'sunset', name: 'Atardecer Oro', emoji: '🌅', bg: '#451A03', mountain: '#78350F', skyGlow: '#92400E', neon: '#F59E0B' },
];

interface GameCanvasProps {
  level: Level;
  skins: PlayerSkins;
  onExit: () => void;
  isPlaytesting?: boolean;
  onProgress?: (percentage: number, attempts: number, isWon: boolean) => void;
  multiplayerState?: {
    isMultiplayer: boolean;
    roomId: string | null;
    socket: WebSocket | null;
    players: any[];
    isLeader: boolean;
  };
  username?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export default function GameCanvas({ 
  level, 
  skins, 
  onExit, 
  isPlaytesting = false, 
  onProgress,
  multiplayerState,
  username
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Game UI States
  const [attempts, setAttempts] = useState(1);
  const [percentage, setPercentage] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [collectedCoins, setCollectedCoins] = useState<string[]>([]);

  // References to keep state updated in the fast RAF (RequestAnimationFrame) loop
  const stateRef = useRef({
    cameraX: 0,
    playerX: 150,
    playerY: GROUND_Y_PIXELS - 32,
    playerYVelocity: 0,
    playerSize: 30,
    gamemode: 'cube' as Gamemode,
    gravityDirection: 1, // 1 = normal down, -1 = inverted up
    isGrounded: true,
    isJumping: false,
    robotJumpTimer: 0,
    rotation: 0,
    waveTrail: [] as { x: number; y: number }[],
    particles: [] as Particle[],
    shards: [] as { x: number; y: number; w: number; h: number; vx: number; vy: number; angle: number; vAngle: number; color: string; opacity: number; life: number; maxLife: number }[],
    winSequenceActive: false,
    winSequenceProgress: 0,
    winPortalX: 0,
    winPortalY: 0,
    winPlayerStartX: 0,
    winPlayerStartY: 0,
    screenShake: 0,
    attempts: 1,
    speedMultiplier: 1.0, // 1x, 2x, 3x
    lastPortalId: '',
    lastSpeedId: '',
    lastPadId: '',
    lastRingId: '',
    isMouseDown: false,
    spacePressed: false,
    levelLengthPixels: 4000,
    levelPassed: false,
    animationTick: 0,
    levelStartTime: Date.now(),
    collectedCoins: [] as string[],
    isDying: false,
    spectatingUser: null as string | null,
    syncFrameCounter: 0,
  });

  // Keep other players' states in multiplayer mode
  const otherPlayersRef = useRef<Record<string, {
    username: string;
    skins: any;
    x: number;
    y: number;
    gamemode: string;
    isDead: boolean;
    rotation?: number;
    progress?: number;
  }>>({});

  // Calculate overall level end coordinate
  const levelElements = level.elements;
  let maxElX = 0;
  levelElements.forEach(el => {
    const px = gridToX(el.x);
    if (px > maxElX) maxElX = px;
  });
  // Must last at least 3 seconds (approx 936px at normal speed)
  // And end when player is past all elements (+120px padding)
  const levelEndCoordinate = Math.max(maxElX + 120, 936);

  useEffect(() => {
    stateRef.current.levelLengthPixels = levelEndCoordinate;
  }, [levelEndCoordinate]);

  // Restart the run
  const restartLevel = (incrementAttempts = true) => {
    const state = stateRef.current;
    state.cameraX = 0;
    state.playerX = 150;
    state.playerY = GROUND_Y_PIXELS - state.playerSize;
    state.playerYVelocity = 0;
    state.gamemode = 'cube';
    state.gravityDirection = 1;
    state.isGrounded = true;
    state.isJumping = false;
    state.robotJumpTimer = 0;
    state.rotation = 0;
    state.waveTrail = [];
    state.particles = [];
    state.shards = [];
    state.winSequenceActive = false;
    state.winSequenceProgress = 0;
    state.winPortalX = 0;
    state.winPortalY = 0;
    state.winPlayerStartX = 0;
    state.winPlayerStartY = 0;
    state.screenShake = 0;
    state.speedMultiplier = 1.0;
    state.lastPortalId = '';
    state.lastSpeedId = '';
    state.lastPadId = '';
    state.lastRingId = '';
    state.levelPassed = false;
    state.isDying = false;
    state.spectatingUser = null;
    state.levelStartTime = Date.now();
    state.collectedCoins = [];
    setCollectedCoins([]);
    
    if (incrementAttempts) {
      setAttempts(prev => {
        state.attempts = prev + 1;
        return prev + 1;
      });
    } else {
      setAttempts(1);
      state.attempts = 1;
    }

    setIsGameOver(false);
    setHasWon(false);
    setIsPaused(false);

    if (soundEnabled) {
      audio.stopMusic();
      audio.startMusic(getTrackForLevel(level));
    }
  };

  const getTrackForLevel = (lvl: Level) => {
    if (lvl.musicTrack) return lvl.musicTrack;
    const id = lvl.id?.toLowerCase() || '';
    if (id.includes('stereo')) return 'track_stereo';
    if (id.includes('back')) return 'track_back';
    if (id.includes('blast') || id.includes('processing')) return 'track_blast';
    if (id.includes('dry') || id.includes('out')) return 'track_dry';
    if (id.includes('theory') || id.includes('everything')) return 'track_theory';
    return 'track_stereo';
  };

  // Toggle Sound Mutex
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      audio.startMusic(getTrackForLevel(level));
    } else {
      audio.stopMusic();
    }
  };

  // Handle Input triggers (jump, change gravity, etc.)
  const handleTriggerPress = () => {
    // Resume audio context on any user interaction
    audio.resumeContext();

    const state = stateRef.current;
    if (isGameOver || hasWon || isPaused) return;

    const currentTime = Date.now();

    // Perform gamemode specific action
    if (state.gamemode === 'cube') {
      if (state.isGrounded) {
        state.playerYVelocity = -9.2 * state.gravityDirection;
        state.isGrounded = false;
        if (soundEnabled) audio.playJump();
      }
    } else if (state.gamemode === 'robot') {
      if (state.isGrounded) {
        state.playerYVelocity = -6.6 * state.gravityDirection;
        state.isGrounded = false;
        state.robotJumpTimer = 14; // Allow upward thrust for 14 frames
        if (soundEnabled) audio.playJump();
      }
    } else if (state.gamemode === 'ball') {
      if (state.isGrounded) {
        // Reverse gravity!
        state.gravityDirection *= -1;
        state.isGrounded = false;
        if (soundEnabled) audio.playGravitySwap();
      }
    }

    // Check Jump Rings (yellow chime) collision
    // If player is overlapping a ring in mid-air
    const px = state.cameraX + state.playerX;
    const py = state.playerY;
    const size = state.playerSize;

    levelElements.forEach(el => {
      if (el.type === 'ring_yellow' || el.type === 'ring_red' || el.type === 'ring_blue') {
        const rx = gridToX(el.x);
        const ry = gridToY(el.y);
        // Overlap check
        if (
          px + size > rx && px < rx + TILE_SIZE &&
          py + size > ry && py < ry + TILE_SIZE
        ) {
          if (state.lastRingId !== el.id) {
            state.lastRingId = el.id;
            
            if (el.type === 'ring_blue') {
              // Gravity swap ring: reverse gravity direction and give a tiny hover boost
              state.gravityDirection *= -1;
              state.playerYVelocity = -3.5 * state.gravityDirection;
              state.isGrounded = false;
              
              spawnRingBurst(rx + TILE_SIZE / 2, ry + TILE_SIZE / 2, '#22d3ee');
              if (soundEnabled) audio.playGravitySwap();
            } else {
              // Trigger jump in mid-air!
              const force = el.type === 'ring_red' ? -11.5 : -8.8;
              state.playerYVelocity = force * state.gravityDirection;
              state.isGrounded = false;
              
              // Particles
              const color = el.type === 'ring_red' ? '#FF0000' : '#FFFF00';
              spawnRingBurst(rx + TILE_SIZE / 2, ry + TILE_SIZE / 2, color);
              if (soundEnabled) audio.playRing();
            }
          }
        }
      }
    });
  };

  // Helper to spawn ring touch bursts
  const spawnRingBurst = (x: number, y: number, color: string) => {
    const state = stateRef.current;
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2;
      state.particles.push({
        x: x - state.cameraX,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 3,
        life: 0,
        maxLife: 20 + Math.random() * 15,
      });
    }
  };

  // Main game loop effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Handle Keyboard Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        if (!stateRef.current.spacePressed) {
          stateRef.current.spacePressed = true;
          stateRef.current.isMouseDown = true;
          handleTriggerPress();
        }
      }
      if (e.code === 'Escape') {
        setIsPaused(p => !p);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        stateRef.current.spacePressed = false;
        stateRef.current.isMouseDown = false;
      }
    };

    // Touch / Mouse listeners
    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'BUTTON') return; // Ignore buttons
      stateRef.current.isMouseDown = true;
      handleTriggerPress();
    };

    const handleMouseUp = () => {
      stateRef.current.isMouseDown = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).tagName === 'BUTTON') return;
      stateRef.current.isMouseDown = true;
      handleTriggerPress();
    };

    const handleTouchEnd = () => {
      stateRef.current.isMouseDown = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // Initial play music on interaction
    if (soundEnabled) {
      audio.startMusic(getTrackForLevel(level));
    }

    // GAME LOOP FUNCTION
    const gameLoop = () => {
      const state = stateRef.current;

      if (isPaused) {
        // Just draw paused screen or simple refresh
        drawGame(ctx, canvas);
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      if (!isGameOver && !hasWon && !state.isDying) {
        state.animationTick++;
        updatePhysics();
      } else if (state.isDying) {
        state.animationTick++;
        if (multiplayerState && multiplayerState.isMultiplayer && state.spectatingUser) {
          // Sync camera with the surviving friend!
          const friend = otherPlayersRef.current[state.spectatingUser];
          if (friend && !friend.isDead) {
            state.cameraX = friend.x - state.playerX;
            setPercentage(friend.progress || 0);
          }
        }
      }

      updateParticles();
      drawGame(ctx, canvas);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // UPDATE PHYSICS ENGINE
    const updatePhysics = () => {
      const state = stateRef.current;
      const wasGrounded = state.isGrounded;

      // 1. Level speed calculation
      // base horizontal speed is 5.2px per frame
      const baseSpeed = 5.2;
      const hSpeed = baseSpeed * state.speedMultiplier;
      state.cameraX += hSpeed;

      // Update completion percentage
      const progressRatio = state.cameraX / state.levelLengthPixels;
      const currentProgress = Math.min(state.cameraX >= state.levelLengthPixels ? 99 : 100, Math.floor(progressRatio * 100));
      setPercentage(currentProgress);

      // Sync position to server in multiplayer mode
      if (multiplayerState && multiplayerState.isMultiplayer && multiplayerState.socket) {
        state.syncFrameCounter = (state.syncFrameCounter || 0) + 1;
        if (state.syncFrameCounter % 2 === 0) { // Sync every 2 frames (~30Hz)
          try {
            if (multiplayerState.socket.readyState === WebSocket.OPEN) {
              multiplayerState.socket.send(JSON.stringify({
                type: 'player_sync',
                x: state.cameraX + state.playerX,
                y: state.playerY,
                gamemode: state.gamemode,
                isDead: state.isDying,
                rotation: state.rotation,
                progress: currentProgress
              }));
            }
          } catch (e) {
            console.error('Error sending player sync', e);
          }
        }
      }

      // Win Condition check
      const elapsedMs = Date.now() - state.levelStartTime;
      const reachedEnd = state.cameraX >= state.levelLengthPixels;
      const threeSecondsPassed = elapsedMs >= 3000;

      if (reachedEnd && threeSecondsPassed && !state.levelPassed && !state.winSequenceActive) {
        state.winSequenceActive = true;
        state.winSequenceProgress = 0;
        state.winPortalX = state.playerX + 300; // spawn portal 300px ahead on screen
        state.winPortalY = GROUND_Y_PIXELS - 120; // floating above
        state.winPlayerStartX = state.playerX;
        state.winPlayerStartY = state.playerY;

        // Spawn beautiful neon red-cyan portal opening particles
        for (let i = 0; i < 25; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 40 + Math.random() * 40;
          state.particles.push({
            x: state.cameraX + state.winPortalX + Math.cos(angle) * dist,
            y: state.winPortalY + Math.sin(angle) * dist,
            vx: -Math.cos(angle) * 3,
            vy: -Math.sin(angle) * 3,
            color: '#00FFFF',
            size: 3 + Math.random() * 4,
            life: 0,
            maxLife: 30 + Math.random() * 15,
          });
        }
      }

      if (state.winSequenceActive) {
        // Horizontally drift slowly
        state.winSequenceProgress += 0.015; // Complete in ~66 frames
        const t = state.winSequenceProgress;
        
        // Custom cubic ease-out for a smooth visual lock-on to the portal
        const ease = t * (2 - t);
        
        state.playerX = state.winPlayerStartX + (state.winPortalX - state.winPlayerStartX) * ease;
        state.playerY = state.winPlayerStartY + (state.winPortalY - state.winPlayerStartY) * ease;
        
        // Vortex spin!
        state.rotation += 0.25;

        // Visual exhaust trails
        if (Math.random() > 0.3) {
          state.particles.push({
            x: state.playerX + state.playerSize / 2,
            y: state.playerY + state.playerSize / 2,
            vx: -2 - Math.random() * 3,
            vy: (Math.random() - 0.5) * 2,
            color: '#00FFFF',
            size: 2.5 + Math.random() * 3,
            life: 0,
            maxLife: 20 + Math.random() * 10,
          });
        }

        if (t >= 1.0) {
          state.levelPassed = true;
          setPercentage(100);
          setHasWon(true);
          if (onProgress) {
            onProgress(100, 1, true);
          }
          if (soundEnabled) audio.playWin();
          return;
        }

        // Bypass normal game physics
        return;
      }

      // 2. Gravitational forces & movement for each gamemode
      const pSize = state.playerSize;

      if (state.gamemode === 'wave') {
        // Wave mode: Diagonals
        // Releasing mouse goes down-right, holding mouse goes up-right
        const diagonalSpeed = 5.0;
        if (state.isMouseDown) {
          state.playerYVelocity = -diagonalSpeed;
          state.rotation = -Math.PI / 6; // Angled upwards
        } else {
          state.playerYVelocity = diagonalSpeed;
          state.rotation = Math.PI / 6; // Angled downwards
        }

        state.playerY += state.playerYVelocity;
        state.isGrounded = false;

        // Store wave trail positions
        state.waveTrail.push({
          x: state.cameraX + state.playerX + pSize / 2,
          y: state.playerY + pSize / 2
        });

        // Limit wave trail history length to save performance
        if (state.waveTrail.length > 250) {
          state.waveTrail.shift();
        }

        // Wave limit checks (floor & ceiling limits are lethal in wave mode)
        if (state.playerY < 20 || state.playerY > GROUND_Y_PIXELS - pSize) {
          triggerDeath();
          return;
        }
      } else {
        // Non-wave modes: Apply custom gravity physics
        let gravityConst = 0.58;

        // If falling/descending, increase gravity for snappier, less floaty landing (al saltar bajes más rápido)
        const isDescending = (state.gravityDirection === 1 && state.playerYVelocity > 0) ||
                             (state.gravityDirection === -1 && state.playerYVelocity < 0);
        if (isDescending) {
          gravityConst = 0.70; // Descend slightly faster for crisp control, but fair jump distance!
        }

        const currentGravity = gravityConst * state.gravityDirection;

        // Apply constant gravity acceleration
        state.playerYVelocity += currentGravity;

        // Robot thrust sustain
        if (state.gamemode === 'robot' && state.isMouseDown && state.robotJumpTimer > 0) {
          // Sustained hover acceleration
          state.playerYVelocity = -5.5;
          state.robotJumpTimer--;
        }

        // Terminal velocity check
        const maxVelocity = 13;
        if (Math.abs(state.playerYVelocity) > maxVelocity) {
          state.playerYVelocity = maxVelocity * Math.sign(state.playerYVelocity);
        }

        // Apply vertical speed
        state.playerY += state.playerYVelocity;

        // Rotation effects
        if (state.gamemode === 'cube') {
          if (!state.isGrounded) {
            // Spin smoothly
            state.rotation += 0.10 * state.gravityDirection;
          } else {
            // Snap to nearest 90 degrees when grounded
            const ninetyDegrees = Math.PI / 2;
            const currentRot = state.rotation;
            const targetRot = Math.round(currentRot / ninetyDegrees) * ninetyDegrees;
            state.rotation += (targetRot - currentRot) * 0.35; // smooth snap
          }
        } else if (state.gamemode === 'ball') {
          // Continuous rotation while rolling
          state.rotation += 0.09 * state.gravityDirection * state.speedMultiplier;
        } else if (state.gamemode === 'robot') {
          // Robot doesn't rotate, stays horizontal
          state.rotation = 0;
        }
      }

      // 3. Ground / Ceiling Boundary Collisions
      const px = state.cameraX + state.playerX;
      const py = state.playerY;

      // Ground Collision
      if (state.gravityDirection === 1) {
        if (state.playerY >= GROUND_Y_PIXELS - pSize) {
          state.playerY = GROUND_Y_PIXELS - pSize;
          state.playerYVelocity = 0;
          state.isGrounded = true;

          // Spawn slide spark particles
          if (state.gamemode !== 'wave' && Math.random() < 0.4) {
            spawnSlideSpark(state.playerX + pSize / 4, GROUND_Y_PIXELS, skins.primaryColor);
          }
        }
      } else {
        // Ceiling/Inverted Gravity Ground (Ball/Rueda walking on top)
        // Let's assume height 80 is the ceiling limit
        const ceilingY = 80;
        if (state.playerY <= ceilingY) {
          state.playerY = ceilingY;
          state.playerYVelocity = 0;
          state.isGrounded = true;

          // Spawn slide spark particles on ceiling
          if (Math.random() < 0.4) {
            spawnSlideSpark(state.playerX + pSize / 4, ceilingY, skins.primaryColor);
          }
        }
      }

      // 4. Level Obstacle Collisions
      let isCollidingWithSurface = false;

      levelElements.forEach(el => {
        const elX = gridToX(el.x);
        const elY = gridToY(el.y);

        // AABB check variables
        const overX = px + pSize > elX && px < elX + TILE_SIZE;
        const overY = py + pSize > elY && py < elY + TILE_SIZE;

        if (overX && overY) {
          // SOLID BLOCKS
          if (el.type === 'block') {
            const prevY = py - state.playerYVelocity;

            // Determine collision vector
            const headNormal = state.gravityDirection === 1; // standard gravity falls down onto block

            if (headNormal) {
              // Landed on top of the block - highly forgiving edge-landing buffer (18px)
              const wasAbove = prevY + pSize <= elY + 18;
              const isFalling = state.playerYVelocity >= -0.5;

              if (isFalling && wasAbove) {
                state.playerY = elY - pSize;
                state.playerYVelocity = 0;
                state.isGrounded = true;
                isCollidingWithSurface = true;

                if (Math.random() < 0.4) {
                  spawnSlideSpark(state.playerX + pSize / 4, elY, skins.primaryColor);
                }
              } else {
                // Hit the side or bottom of block -> Boom! Crash!
                triggerDeath();
              }
            } else {
              // Inverted Gravity: Walked on bottom of block
              const wasBelow = prevY >= elY + TILE_SIZE - 18;
              const isRisingInverted = state.playerYVelocity <= 0.5;

              if (isRisingInverted && wasBelow) {
                state.playerY = elY + TILE_SIZE;
                state.playerYVelocity = 0;
                state.isGrounded = true;
                isCollidingWithSurface = true;
              } else {
                triggerDeath();
              }
            }
          }

          // SPIKES (Leethal spikes!)
          else if (el.type === 'spike' || el.type === 'spike_inverted' || el.type === 'spike_small') {
            // Highly forgiving hitboxes that prevent dying on the transparent corners of triangular spikes
            let shrinkX = TILE_SIZE * 0.32; // 32% shrink from both sides makes the hitbox narrow (ideal for triangles)
            let shrinkY = TILE_SIZE * 0.25; // 25% shrink from vertical tip makes it shorter

            if (el.type === 'spike_small') {
              shrinkX = TILE_SIZE * 0.42; // Very forgiving for small spikes
              shrinkY = TILE_SIZE * 0.45;
            }

            // AABB with custom horizontal and vertical shrink margins
            const playerLeft = px + shrinkX;
            const playerRight = px + pSize - shrinkX;
            const playerTop = py + (el.type === 'spike_inverted' ? shrinkY : shrinkY * 0.2);
            const playerBottom = py + pSize - (el.type === 'spike_inverted' ? shrinkY * 0.2 : shrinkY);

            const obstacleLeft = elX + shrinkX;
            const obstacleRight = elX + TILE_SIZE - shrinkX;
            const obstacleTop = elY + (el.type === 'spike_inverted' ? 0 : shrinkY);
            const obstacleBottom = elY + TILE_SIZE - (el.type === 'spike_inverted' ? shrinkY : 0);

            if (
              playerRight > obstacleLeft &&
              playerLeft < obstacleRight &&
              playerBottom > obstacleTop &&
              playerTop < obstacleBottom
            ) {
              triggerDeath();
            }
          }

          // SLOPES (Rampas)
          else if (el.type === 'slope_r' || el.type === 'slope_l') {
            const relX = px + pSize / 2 - elX; // center of player
            if (relX >= 0 && relX <= TILE_SIZE) {
              // Calculate target Y surface of the slope
              let slopeSurfaceY = elY + TILE_SIZE;
              if (el.type === 'slope_r') {
                // Slope going up-right
                slopeSurfaceY = elY + TILE_SIZE - relX;
              } else {
                // Slope going down-right (slope_l)
                slopeSurfaceY = elY + relX;
              }

              // Collision with the slope slide surface
              if (py + pSize >= slopeSurfaceY - 4 && py + pSize <= slopeSurfaceY + 16) {
                state.playerY = slopeSurfaceY - pSize;
                state.playerYVelocity = 0;
                state.isGrounded = true;
                isCollidingWithSurface = true;
                // Auto snap rotation to tilt of slope
                if (state.gamemode === 'cube') {
                  state.rotation = el.type === 'slope_r' ? -Math.PI / 4 : Math.PI / 4;
                }
              }
            }
          }

          // PORTALS (Green, Cyan, Bronze, Magenta)
          else if (el.type.startsWith('portal_')) {
            if (state.lastPortalId !== el.id) {
              state.lastPortalId = el.id;
              
              let nextMode: Gamemode = 'cube';
              if (el.type === 'portal_cube') nextMode = 'cube';
              else if (el.type === 'portal_wave') nextMode = 'wave';
              else if (el.type === 'portal_robot') nextMode = 'robot';
              else if (el.type === 'portal_ball') nextMode = 'ball';

              state.gamemode = nextMode;
              // Normalize gravity on portals just in case
              if (nextMode !== 'ball') {
                state.gravityDirection = 1;
              }

              // Visual burst around portal
              spawnPortalBurst(elX + TILE_SIZE / 2, elY + TILE_SIZE / 2);
              if (soundEnabled) audio.playPortalTransition();
            }
          }

          // JUMP PADS (Auto leap or Gravity swap)
          else if (el.type === 'pad_yellow' || el.type === 'pad_red' || el.type === 'pad_blue') {
            if (state.lastPadId !== el.id) {
              state.lastPadId = el.id;
              
              if (el.type === 'pad_blue') {
                // Gravity swap pad: swap gravity, give hover boost in new gravity direction
                state.gravityDirection *= -1;
                state.playerYVelocity = -5.5 * state.gravityDirection;
                state.isGrounded = false;
                spawnRingBurst(elX + TILE_SIZE / 2, elY + TILE_SIZE / 2, '#22d3ee');
                if (soundEnabled) audio.playGravitySwap();
              } else {
                // Auto launch: red mega pads launch the player with extreme speed!
                const force = el.type === 'pad_red' ? -14.5 : -10.5;
                state.playerYVelocity = force * state.gravityDirection;
                state.isGrounded = false;
                const color = el.type === 'pad_red' ? '#FF0000' : '#FFFF00';
                spawnRingBurst(elX + TILE_SIZE / 2, elY + TILE_SIZE / 2, color);
                if (soundEnabled) audio.playPad();
              }
            }
          }

          // SAWBLADE (Deadly rotating obstacles)
          else if (el.type === 'sawblade') {
            const shrink = TILE_SIZE * 0.15;
            if (
              px + pSize - shrink > elX &&
              px + shrink < elX + TILE_SIZE &&
              py + pSize - shrink > elY &&
              py + shrink < elY + TILE_SIZE
            ) {
              triggerDeath();
            }
          }

          // COIN (Gold collectible coins)
          else if (el.type === 'coin') {
            if (!state.collectedCoins.includes(el.id)) {
              state.collectedCoins.push(el.id);
              setCollectedCoins([...state.collectedCoins]);
              
              // Nice yellow gold burst!
              spawnRingBurst(elX + TILE_SIZE / 2, elY + TILE_SIZE / 2, '#fbbf24');
              if (soundEnabled) audio.playCoinCollect();
            }
          }

          // SPEED TRIGGERS
          else if (el.type.startsWith('speed_')) {
            if (state.lastSpeedId !== el.id) {
              state.lastSpeedId = el.id;
              if (el.type === 'speed_1x') state.speedMultiplier = 1.0;
              else if (el.type === 'speed_2x') state.speedMultiplier = 1.4;
              else if (el.type === 'speed_3x') state.speedMultiplier = 1.8;

              // Spawn flash trail
              spawnRingBurst(elX + TILE_SIZE / 2, elY + TILE_SIZE / 2, '#00FFFF');
              if (soundEnabled) audio.playSpeedGate();
            }
          }
        }
      });

      // Update grounded state
      if (!isCollidingWithSurface && state.playerY < GROUND_Y_PIXELS - pSize) {
        // If gravity is normal and we didn't touch anything solid, we are not grounded
        if (state.gravityDirection === 1) {
          state.isGrounded = false;
        } else {
          // If gravity is inverted, ceiling height limit is grounded
          if (state.playerY > 80) {
            state.isGrounded = false;
          }
        }
      }

      // Auto-jump / hold-to-jump buffer when grounded (core GD physics mechanism!)
      if (state.isGrounded && state.isMouseDown) {
        if (state.gamemode === 'cube') {
          state.playerYVelocity = -9.2 * state.gravityDirection;
          state.isGrounded = false;
          if (soundEnabled) audio.playJump();
        } else if (state.gamemode === 'ball') {
          // Ball swaps gravity when grounded if button is held
          state.gravityDirection *= -1;
          state.isGrounded = false;
          if (soundEnabled) audio.playGravitySwap();
        } else if (state.gamemode === 'robot') {
          // Robot jumps when grounded if button is held
          state.playerYVelocity = -6.6 * state.gravityDirection;
          state.isGrounded = false;
          state.robotJumpTimer = 14;
          if (soundEnabled) audio.playJump();
        }
      }

      // Landing sound check (if player transitioned from airborne to grounded)
      if (!wasGrounded && state.isGrounded) {
        if (soundEnabled) audio.playLand();
      }
    };

    // TRIGGER DEATH (Boom!)
    const triggerDeath = () => {
      const state = stateRef.current;
      if (state.isDying) return;
      state.isDying = true;
      state.screenShake = 14;

      // Sync death with server in multiplayer mode
      if (multiplayerState && multiplayerState.isMultiplayer && multiplayerState.socket) {
        try {
          if (multiplayerState.socket.readyState === WebSocket.OPEN) {
            multiplayerState.socket.send(JSON.stringify({ type: 'player_death' }));
          }
        } catch (e) {
          console.error(e);
        }

        // Set who we should spectate: the first alive player
        const aliveFriend = Object.keys(otherPlayersRef.current).find(uName => 
          uName !== username && !otherPlayersRef.current[uName].isDead
        );
        state.spectatingUser = aliveFriend || null;
      }

      const currentProgress = Math.min(100, Math.floor((state.cameraX / state.levelLengthPixels) * 100));
      if (onProgress) {
        onProgress(currentProgress, 1, false);
      }

      // Generate a grid of individual rigid shards to shatter the player character
      const shardCols = 4;
      const shardRows = 4;
      const sw = state.playerSize / shardCols;
      const sh = state.playerSize / shardRows;
      state.shards = [];

      for (let r = 0; r < shardRows; r++) {
        for (let c = 0; c < shardCols; c++) {
          const sx = state.playerX + c * sw;
          const sy = state.playerY + r * sh;
          
          // Compute direction away from player center for explosion force
          const cx = state.playerX + state.playerSize / 2;
          const cy = state.playerY + state.playerSize / 2;
          const dx = (sx + sw / 2) - cx;
          const dy = (sy + sh / 2) - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 1.5 + Math.random() * 4.0;

          state.shards.push({
            x: sx + sw / 2,
            y: sy + sh / 2,
            w: sw,
            h: sh,
            vx: (dx / dist) * force + (Math.random() - 0.5) * 2.0,
            vy: (dy / dist) * force - (2.0 + Math.random() * 3.5), // fling upwards
            angle: Math.random() * Math.PI * 2,
            vAngle: (Math.random() - 0.5) * 0.3,
            color: (r + c) % 2 === 0 ? skins.primaryColor : skins.secondaryColor,
            opacity: 1.0,
            life: 0,
            maxLife: 45 + Math.random() * 20
          });
        }
      }

      // Spawn some smaller trailing sparks as well
      for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * 5.0;
        state.particles.push({
          x: state.playerX + state.playerSize / 2,
          y: state.playerY + state.playerSize / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.5 ? skins.primaryColor : skins.secondaryColor,
          size: 3 + Math.random() * 4,
          life: 0,
          maxLife: 35 + Math.random() * 20,
        });
      }

      if (soundEnabled) {
        audio.playDeath();
        audio.stopMusic();
      }

      // Show Game Over UI after the cube shattering finishes playing
      setTimeout(() => {
        if (state.isDying) {
          if (multiplayerState && multiplayerState.isMultiplayer) {
            // In multiplayer, don't show the standard overlay, remain in spectating
          } else {
            setIsGameOver(true);
          }
        }
      }, 1000);
    };

    // Particles animations
    const spawnSlideSpark = (x: number, y: number, color: string) => {
      const state = stateRef.current;
      if (soundEnabled && Math.random() < 0.12) {
        audio.playSlide();
      }
      state.particles.push({
        x,
        y: y - 2 + Math.random() * 4,
        vx: -3 - Math.random() * 3,
        vy: -0.5 - Math.random() * 2 * state.gravityDirection,
        color,
        size: 2 + Math.random() * 3,
        life: 0,
        maxLife: 12 + Math.random() * 8,
      });
    };

    const spawnPortalBurst = (x: number, y: number) => {
      const state = stateRef.current;
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.0 + Math.random() * 3.0;
        state.particles.push({
          x: x - state.cameraX,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: '#34D399', // Cyan/Emerald glow
          size: 3 + Math.random() * 4,
          life: 0,
          maxLife: 30 + Math.random() * 15,
        });
      }
    };

    // Update particles position/life
    const updateParticles = () => {
      const state = stateRef.current;
      
      // Update particles
      state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        // Apply tiny drag
        p.vx *= 0.98;
        p.vy *= 0.98;
        return p.life < p.maxLife;
      });

      // Update shards (physical player cracking pieces)
      if (state.shards && state.shards.length > 0) {
        state.shards.forEach(shard => {
          shard.x += shard.vx;
          shard.y += shard.vy;
          shard.vy += 0.22; // gravity pulling them down
          shard.vx *= 0.98; // horizontal drag
          shard.angle += shard.vAngle;
          shard.life++;
          shard.opacity = Math.max(0, 1 - shard.life / shard.maxLife);
        });
        state.shards = state.shards.filter(s => s.life < s.maxLife);
      }

      // Reduce screenshake
      if (state.screenShake > 0) {
        state.screenShake--;
      }
    };

    // RUN THE LOOP
    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      audio.stopMusic();
    };
  }, [isPaused, isGameOver, hasWon, soundEnabled, level, skins]);

  // DRAW CANVAS VIEW
  const drawGame = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const state = stateRef.current;

    ctx.save();

    // 1. Screenshake effect
    if (state.screenShake > 0) {
      const shakeAmt = state.screenShake * 1.5;
      const dx = (Math.random() - 0.5) * shakeAmt;
      const dy = (Math.random() - 0.5) * shakeAmt;
      ctx.translate(dx, dy);
    }

    // Clear background
    const activeThemeId = level.theme || 'purple';
    const activeTheme = LEVEL_THEMES.find(t => t.id === activeThemeId) || LEVEL_THEMES[0];

    ctx.fillStyle = activeTheme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Parallax scrolling mountains/pyramids in the background
    ctx.save();
    ctx.fillStyle = activeTheme.mountain;
    const mountainScale = 0.2; // scroll slower
    for (let i = 0; i < 15; i++) {
      const mx = (i * 280) - (state.cameraX * mountainScale) % 280;
      ctx.beginPath();
      ctx.moveTo(mx, GROUND_Y_PIXELS);
      ctx.lineTo(mx + 140, GROUND_Y_PIXELS - 160);
      ctx.lineTo(mx + 280, GROUND_Y_PIXELS);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Draw ceiling background glow grid
    ctx.fillStyle = activeTheme.skyGlow;
    ctx.fillRect(0, 0, canvas.width, 80);
    ctx.fillStyle = activeTheme.neon; // Theme neon line
    ctx.fillRect(0, 78, canvas.width, 2);

    // 2. Draw static ground mesh & scrolling floor grid
    ctx.fillStyle = '#1F2937'; // dark charcoal ground
    ctx.fillRect(0, GROUND_Y_PIXELS, canvas.width, canvas.height - GROUND_Y_PIXELS);

    // Neon ground border line
    ctx.fillStyle = activeTheme.neon;
    ctx.fillRect(0, GROUND_Y_PIXELS, canvas.width, 4);

    // Grid Lines scrolling backwards
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    const gridOffset = state.cameraX % TILE_SIZE;
    // vertical grid lines
    for (let x = -gridOffset; x < canvas.width; x += TILE_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y_PIXELS);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    // horizontal grid lines on ground
    for (let y = GROUND_Y_PIXELS; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 3. Draw Level Elements
    levelElements.forEach(el => {
      // Coordinates relative to camera scrolling
      const rx = gridToX(el.x) - state.cameraX;
      const ry = gridToY(el.y);

      // Skip elements that are far off screen to save draw performance
      if (rx < -TILE_SIZE * 2 || rx > canvas.width + TILE_SIZE * 2) {
        return;
      }

      ctx.save();
      ctx.translate(rx + TILE_SIZE / 2, ry + TILE_SIZE / 2);

      // Draw depending on obstacle type
      if (el.type === 'block') {
        // Neon green-glowing tech block
        ctx.fillStyle = '#111827';
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2.5;
        ctx.fillRect(-TILE_SIZE / 2 + 1, -TILE_SIZE / 2 + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        ctx.strokeRect(-TILE_SIZE / 2 + 1, -TILE_SIZE / 2 + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        
        // Inner square decoration
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(-TILE_SIZE / 4, -TILE_SIZE / 4, TILE_SIZE / 2, TILE_SIZE / 2);
        ctx.strokeRect(-TILE_SIZE / 4, -TILE_SIZE / 4, TILE_SIZE / 2, TILE_SIZE / 2);
      }

      else if (el.type === 'fake_block') {
        // Translucent/semi-invisible passing block with dashed line indicator
        ctx.fillStyle = 'rgba(17, 24, 39, 0.4)';
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.fillRect(-TILE_SIZE / 2 + 1, -TILE_SIZE / 2 + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        ctx.strokeRect(-TILE_SIZE / 2 + 1, -TILE_SIZE / 2 + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        ctx.setLineDash([]); // Reset line dash
      }

      else if (el.type === 'spike') {
        // Classic deadly triangle spike
        ctx.fillStyle = '#374151';
        ctx.strokeStyle = '#FF3B30';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -TILE_SIZE / 2 + 3); // top tip
        ctx.lineTo(TILE_SIZE / 2 - 3, TILE_SIZE / 2 - 1); // bottom-right
        ctx.lineTo(-TILE_SIZE / 2 + 3, TILE_SIZE / 2 - 1); // bottom-left
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner fire line
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -TILE_SIZE / 2 + 10);
        ctx.lineTo(TILE_SIZE / 4, TILE_SIZE / 2 - 4);
        ctx.lineTo(-TILE_SIZE / 4, TILE_SIZE / 2 - 4);
        ctx.closePath();
        ctx.stroke();
      }

      else if (el.type === 'spike_inverted') {
        // Ceiling spike pointing downwards
        ctx.fillStyle = '#4b5563';
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, TILE_SIZE / 2 - 3); // tip points down
        ctx.lineTo(TILE_SIZE / 2 - 3, -TILE_SIZE / 2 + 1); // top-right
        ctx.lineTo(-TILE_SIZE / 2 + 3, -TILE_SIZE / 2 + 1); // top-left
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner fire line
        ctx.strokeStyle = '#F97316';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, TILE_SIZE / 2 - 10);
        ctx.lineTo(TILE_SIZE / 4, -TILE_SIZE / 2 + 4);
        ctx.lineTo(-TILE_SIZE / 4, -TILE_SIZE / 2 + 4);
        ctx.closePath();
        ctx.stroke();
      }

      else if (el.type === 'spike_small') {
        // Smaller cute spike
        ctx.fillStyle = '#374151';
        ctx.strokeStyle = '#F87171';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const sw = TILE_SIZE * 0.3;
        const sh = TILE_SIZE * 0.35;
        ctx.moveTo(0, -sh + TILE_SIZE / 2); // top tip
        ctx.lineTo(sw, TILE_SIZE / 2 - 1); // bottom-right
        ctx.lineTo(-sw, TILE_SIZE / 2 - 1); // bottom-left
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      else if (el.type === 'slope_r') {
        // Solid slope going up-right
        ctx.fillStyle = '#111827';
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-TILE_SIZE / 2, TILE_SIZE / 2);
        ctx.lineTo(TILE_SIZE / 2, -TILE_SIZE / 2);
        ctx.lineTo(TILE_SIZE / 2, TILE_SIZE / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      else if (el.type === 'slope_l') {
        // Solid slope going down-right
        ctx.fillStyle = '#111827';
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-TILE_SIZE / 2, -TILE_SIZE / 2);
        ctx.lineTo(TILE_SIZE / 2, TILE_SIZE / 2);
        ctx.lineTo(-TILE_SIZE / 2, TILE_SIZE / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      else if (el.type.startsWith('portal_')) {
        // Render stylized swirling portal rings
        let ringColor = '#00FF00'; // Green: Cube
        let portalName = 'Cubo';
        if (el.type === 'portal_wave') {
          ringColor = '#00FFFF'; // Cyan: Wave
          portalName = 'Wave';
        } else if (el.type === 'portal_robot') {
          ringColor = '#FF9500'; // Orange: Robot
          portalName = 'Robot';
        } else if (el.type === 'portal_ball') {
          ringColor = '#FF2D55'; // Magenta: Ball/Wheel
          portalName = 'Rueda';
        }

        // Pulse ring based on frames
        const pulse = Math.sin(state.animationTick * 0.15) * 5;

        // Outer glow oval
        ctx.shadowColor = ringColor;
        ctx.shadowBlur = 15;
        ctx.fillStyle = ringColor + '22'; // alpha
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, TILE_SIZE * 0.45 + pulse * 0.2, TILE_SIZE * 1.1, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Inner spinning sparkles
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-2, -TILE_SIZE * 0.7 + pulse, 4, 8);
        ctx.fillRect(-2, TILE_SIZE * 0.7 - pulse, 4, 8);

        // Label above portal
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px "JetBrains Mono"';
        ctx.textAlign = 'center';
        ctx.fillText(portalName, 0, -TILE_SIZE * 1.3);
      }

      else if (el.type === 'pad_yellow' || el.type === 'pad_red' || el.type === 'pad_blue') {
        // Jump Pad base
        let baseColor = '#374151';
        let springColor = '#FFFF00';
        if (el.type === 'pad_red') {
          baseColor = '#450a0a';
          springColor = '#FF0000';
        } else if (el.type === 'pad_blue') {
          baseColor = '#083344';
          springColor = '#06b6d4';
        }
        
        ctx.fillStyle = baseColor;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.fillRect(-TILE_SIZE * 0.4, TILE_SIZE * 0.25, TILE_SIZE * 0.8, TILE_SIZE * 0.2);
        ctx.strokeRect(-TILE_SIZE * 0.4, TILE_SIZE * 0.25, TILE_SIZE * 0.8, TILE_SIZE * 0.2);

        // Bouncing spring (Yellow / Red / Blue)
        ctx.fillStyle = springColor;
        ctx.beginPath();
        ctx.ellipse(0, TILE_SIZE * 0.2, TILE_SIZE * 0.35, TILE_SIZE * 0.1, 0, 0, Math.PI, true);
        ctx.fill();
        ctx.stroke();
      }

      else if (el.type === 'ring_yellow' || el.type === 'ring_red' || el.type === 'ring_blue') {
        // Floating circular neon trigger ring
        const ringPulse = Math.sin(state.animationTick * 0.2) * 2;
        let color = '#FFFF00';
        if (el.type === 'ring_red') {
          color = '#FF0000';
        } else if (el.type === 'ring_blue') {
          color = '#06b6d4';
        }
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, TILE_SIZE * 0.3 + ringPulse * 0.3, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = color + '33';
        ctx.beginPath();
        ctx.arc(0, 0, TILE_SIZE * 0.2, 0, 2 * Math.PI);
        ctx.fill();
      }

      else if (el.type === 'sawblade') {
        // Spinning metal saw blade
        const angle = (state.animationTick * 0.08) % (Math.PI * 2);
        ctx.rotate(angle);

        // Draw outer saw teeth
        ctx.fillStyle = '#4b5563';
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const teethCount = 12;
        const outerRad = TILE_SIZE * 0.5;
        const innerRad = TILE_SIZE * 0.35;
        
        for (let t = 0; t < teethCount; t++) {
          const theta = (t * Math.PI * 2) / teethCount;
          const nextTheta = ((t + 0.5) * Math.PI * 2) / teethCount;
          
          ctx.lineTo(Math.cos(theta) * outerRad, Math.sin(theta) * outerRad);
          ctx.lineTo(Math.cos(nextTheta) * innerRad, Math.sin(nextTheta) * innerRad);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner core
        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.arc(0, 0, TILE_SIZE * 0.22, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Center spiral
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, TILE_SIZE * 0.1, 0, Math.PI, false);
        ctx.stroke();
      }

      else if (el.type === 'coin') {
        const isCollected = state.collectedCoins.includes(el.id);
        
        ctx.save();
        if (isCollected) {
          // Semi-transparent ghost coin indicating it was already picked up
          ctx.globalAlpha = 0.25;
        }
        
        // Spin and float effect
        const bounce = Math.sin(state.animationTick * 0.1) * 2;
        ctx.translate(0, bounce);
        const spinScale = Math.cos(state.animationTick * 0.05);
        ctx.scale(Math.abs(spinScale) < 0.1 ? 0.1 : spinScale, 1);

        // Gold outer rim
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, TILE_SIZE * 0.4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Inner coin face
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, TILE_SIZE * 0.28, 0, 2 * Math.PI);
        ctx.fill();

        // Stylized letter "C"
        ctx.fillStyle = '#fffbeb';
        ctx.font = '900 12px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('C', 0, 0);
        
        ctx.restore();
      }

      else if (el.type.startsWith('speed_')) {
        // Draw directional fast forward arrows
        let arrowCount = 1;
        let color = '#F59E0B'; // 1x Speed
        if (el.type === 'speed_2x') {
          arrowCount = 2;
          color = '#10B981';
        } else if (el.type === 'speed_3x') {
          arrowCount = 3;
          color = '#06B6D4';
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.fillStyle = color + '44';
        ctx.beginPath();
        ctx.arc(0, 0, TILE_SIZE * 0.45, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Draw chevron arrows
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        const arrowSpacing = 8;
        const startX = -((arrowCount - 1) * arrowSpacing) / 2;

        for (let a = 0; a < arrowCount; a++) {
          const ax = startX + a * arrowSpacing;
          ctx.beginPath();
          ctx.moveTo(ax - 3, -8);
          ctx.lineTo(ax + 3, 0);
          ctx.lineTo(ax - 3, 8);
          ctx.stroke();
        }
      }

      ctx.restore();
    });

    // 4. Draw Wave Trail (Neon line zig-zag behind wave)
    if (state.gamemode === 'wave' && state.waveTrail.length > 1) {
      ctx.save();
      ctx.strokeStyle = skins.primaryColor;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = skins.primaryColor;
      ctx.shadowBlur = 8;

      ctx.beginPath();
      const firstPoint = state.waveTrail[0];
      ctx.moveTo(firstPoint.x - state.cameraX, firstPoint.y);

      for (let i = 1; i < state.waveTrail.length; i++) {
        const pt = state.waveTrail[i];
        ctx.lineTo(pt.x - state.cameraX, pt.y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 5. Draw Particles
    state.particles.forEach(p => {
      ctx.fillStyle = p.color;
      // opacity fades out over life
      ctx.globalAlpha = 1 - p.life / p.maxLife;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    ctx.globalAlpha = 1.0; // reset

    // 5.5. Draw Shards (Player fracturing on death)
    if ((isGameOver || state.isDying) && state.shards && state.shards.length > 0) {
      state.shards.forEach(shard => {
        ctx.save();
        ctx.translate(shard.x, shard.y);
        ctx.rotate(shard.angle);
        ctx.globalAlpha = shard.opacity;
        ctx.fillStyle = shard.color;
        ctx.fillRect(-shard.w / 2, -shard.h / 2, shard.w, shard.h);
        
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(-shard.w / 2, -shard.h / 2, shard.w, shard.h);
        ctx.restore();
      });
      ctx.globalAlpha = 1.0; // reset
    }

    // 5.6. Draw Neon Victory Exit Portal
    if (state.winSequenceActive) {
      const portalX = state.winPortalX;
      const portalY = state.winPortalY;
      
      ctx.save();
      ctx.translate(portalX, portalY);
      
      const pTick = state.animationTick;
      const pulse = Math.sin(pTick * 0.25) * 8;
      const ringColor = '#00FFFF'; // Beautiful neon cyan/teal
      
      ctx.shadowColor = ringColor;
      ctx.shadowBlur = 20;
      ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 0, TILE_SIZE * 0.65 + pulse * 0.2, TILE_SIZE * 1.5, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
      
      // Inner spinning sparkles
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 4; i++) {
        const angle = pTick * 0.08 + (i * Math.PI / 2);
        const sx = Math.cos(angle) * (TILE_SIZE * 0.45);
        const sy = Math.sin(angle) * (TILE_SIZE * 0.9);
        ctx.fillRect(sx - 2, sy - 4, 4, 8);
      }
      
      // Portal label
      ctx.fillStyle = '#00FFFF';
      ctx.font = '900 11px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('▼ VICTORY ▼', 0, -TILE_SIZE * 1.8);
      ctx.restore();
    }

    // 6. Draw Player Character
    if (!isGameOver && !state.isDying) {
      let pSize = state.playerSize;
      
      // Shrink size on entering portal
      if (state.winSequenceActive && state.winSequenceProgress > 0.7) {
        const factor = (1.0 - state.winSequenceProgress) / 0.3;
        pSize *= Math.max(0, factor);
      }
      
      const px = state.playerX + state.playerSize / 2; // Keep centered around normal size anchor
      const py = state.playerY + state.playerSize / 2;

      // Select equipped skin
      const equippedCube = skins.cube;
      const equippedWave = skins.wave;
      const equippedRobot = skins.robot;
      const equippedBall = skins.ball;

      if (state.gamemode === 'cube') {
        drawCube(ctx, px, py, pSize, equippedCube, skins.primaryColor, skins.secondaryColor, state.rotation);
      } else if (state.gamemode === 'wave') {
        // Draw wave arrow rotated based on current diagonal travel
        drawWave(ctx, px, py, pSize, equippedWave, skins.primaryColor, skins.secondaryColor, state.rotation);
      } else if (state.gamemode === 'robot') {
        // Draw running/jumping robot
        const isJumping = !state.isGrounded;
        drawRobot(ctx, px, py, pSize, equippedRobot, skins.primaryColor, skins.secondaryColor, isJumping, state.animationTick);
      } else if (state.gamemode === 'ball') {
        // Draw wheel rolling
        drawBall(ctx, px, py, pSize, equippedBall, skins.primaryColor, skins.secondaryColor, state.rotation);
      }
    }

    // Draw Other Multiplayer Players
    if (multiplayerState && multiplayerState.isMultiplayer) {
      Object.keys(otherPlayersRef.current).forEach(uName => {
        if (uName === username) return; // Don't draw ourselves twice
        const otherP = otherPlayersRef.current[uName];
        if (!otherP || otherP.isDead) return;

        // Compute their on-screen coordinates
        const otherPx = otherP.x - state.cameraX;
        const otherPy = otherP.y;

        // Draw their cube/wave/robot/ball
        ctx.save();
        const otherPrimaryColor = otherP.skins?.primaryColor || '#00FFFF';
        const otherSecondaryColor = otherP.skins?.secondaryColor || '#FF00FF';
        const otherCube = otherP.skins?.cube || '0';
        const otherRotation = otherP.rotation || 0;

        ctx.globalAlpha = 0.65; // Draw with a slight transparency to differentiate from ourselves
        
        if (otherP.gamemode === 'cube') {
          drawCube(ctx, otherPx + state.playerSize / 2, otherPy + state.playerSize / 2, state.playerSize, otherCube, otherPrimaryColor, otherSecondaryColor, otherRotation);
        } else if (otherP.gamemode === 'wave') {
          drawWave(ctx, otherPx + state.playerSize / 2, otherPy + state.playerSize / 2, state.playerSize, otherP.skins?.wave || '0', otherPrimaryColor, otherSecondaryColor, otherRotation);
        } else if (otherP.gamemode === 'robot') {
          drawRobot(ctx, otherPx + state.playerSize / 2, otherPy + state.playerSize / 2, state.playerSize, otherP.skins?.robot || '0', otherPrimaryColor, otherSecondaryColor, false, state.animationTick);
        } else if (otherP.gamemode === 'ball') {
          drawBall(ctx, otherPx + state.playerSize / 2, otherPy + state.playerSize / 2, state.playerSize, otherP.skins?.ball || '0', otherPrimaryColor, otherSecondaryColor, otherRotation);
        }

        ctx.globalAlpha = 1.0;

        // Draw their floating name tag above their cube
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(otherP.username.toUpperCase(), otherPx + state.playerSize / 2, otherPy - 8);
        ctx.shadowBlur = 0; // reset

        ctx.restore();
      });
    }

    ctx.restore();
  };

  // Listen to incoming WebSocket sync messages for multiplayer
  useEffect(() => {
    if (!multiplayerState || !multiplayerState.isMultiplayer || !multiplayerState.socket) return;

    const socket = multiplayerState.socket;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'sync_broadcast') {
          if (data.username === username) return;

          otherPlayersRef.current[data.username] = {
            username: data.username,
            skins: data.skins || {},
            x: data.x,
            y: data.y,
            gamemode: data.gamemode,
            isDead: !!data.isDead,
            rotation: data.rotation || 0,
            progress: data.progress || 0
          };

          const state = stateRef.current;
          if (state.spectatingUser === data.username && !data.isDead) {
            state.cameraX = data.x - state.playerX;
          }
        } else if (data.type === 'player_died') {
          if (data.username === username) return;
          if (otherPlayersRef.current[data.username]) {
            otherPlayersRef.current[data.username].isDead = true;
          }

          const state = stateRef.current;
          if (state.spectatingUser === data.username) {
            const aliveFriend = Object.keys(otherPlayersRef.current).find(uName => 
              uName !== username && !otherPlayersRef.current[uName].isDead
            );
            state.spectatingUser = aliveFriend || null;
          }
        } else if (data.type === 'game_restart') {
          const state = stateRef.current;
          state.spectatingUser = null;
          state.isDying = false;
          Object.keys(otherPlayersRef.current).forEach(u => {
            if (otherPlayersRef.current[u]) {
              otherPlayersRef.current[u].isDead = false;
              otherPlayersRef.current[u].x = 0;
              otherPlayersRef.current[u].y = 0;
            }
          });
          restartLevel(false);
        } else if (data.type === 'room_state') {
          data.room.players.forEach((p: any) => {
            if (p.username === username) return;
            if (!otherPlayersRef.current[p.username]) {
              otherPlayersRef.current[p.username] = {
                username: p.username,
                skins: p.skins || {},
                x: 0,
                y: 0,
                gamemode: 'cube',
                isDead: false,
                progress: 0
              };
            } else {
              otherPlayersRef.current[p.username].skins = p.skins || {};
            }
          });
        }
      } catch (e) {
        console.error('Error handling WS sync message in GameCanvas', e);
      }
    };

    socket.addEventListener('message', handleMessage);
    
    // Seed current players from state
    if (multiplayerState.players) {
      multiplayerState.players.forEach((p: any) => {
        if (p.username === username) return;
        otherPlayersRef.current[p.username] = {
          username: p.username,
          skins: p.skins || {},
          x: 0,
          y: 0,
          gamemode: 'cube',
          isDead: false,
          progress: 0
        };
      });
    }

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [multiplayerState, username]);

  return (
    <div className="relative flex flex-col w-full h-full bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800" ref={containerRef}>
      {/* Game HUD Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        {/* Progress Tracker */}
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700/50 text-white pointer-events-auto shadow-md">
          <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">PROGRESO</div>
          <div className="w-32 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-100 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-xs font-mono font-bold w-10 text-right">{percentage}%</div>
        </div>

        {/* Attempts Label & Coins Counter */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {levelElements.some(el => el.type === 'coin') && (
            <div className="bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700/50 text-white font-mono text-xs font-black shadow-md flex items-center gap-1">
              <span className="text-yellow-400 animate-pulse text-base">🪙</span>
              <span className="text-yellow-300 text-sm">
                {collectedCoins.length}/{levelElements.filter(el => el.type === 'coin').length}
              </span>
            </div>
          )}

          <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700/50 text-white font-mono text-sm font-bold shadow-md flex items-center gap-2">
            <span className="text-pink-400">INTENTO:</span>
            <span className="text-xl text-yellow-300 font-black">{attempts}</span>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Pause Trigger */}
          <button
            onClick={() => setIsPaused(p => !p)}
            className="p-2.5 bg-slate-900/80 backdrop-blur text-white hover:text-cyan-400 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition"
            title="Pausar juego (Esc)"
          >
            {isPaused ? <Play className="w-4.5 h-4.5 fill-current" /> : <div className="flex gap-1 items-center justify-center h-4.5 w-4.5"><div className="w-1.5 h-4 bg-white rounded-full"></div><div className="w-1.5 h-4 bg-white rounded-full"></div></div>}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2.5 bg-slate-900/80 backdrop-blur text-white rounded-lg border border-slate-700/50 hover:bg-slate-800 transition ${soundEnabled ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-400 hover:text-white'}`}
            title="Silenciar / Activar sonido"
          >
            {soundEnabled ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
          </button>

          {/* Exit Game */}
          <button
            onClick={onExit}
            className="p-2.5 bg-rose-950/60 hover:bg-rose-900 text-rose-200 hover:text-white rounded-lg border border-rose-800/40 transition"
            title="Salir del nivel"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Actual Game Render Surface */}
      <div className="flex-1 flex items-center justify-center p-2 bg-slate-950">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="bg-violet-950 rounded-lg shadow-inner cursor-pointer select-none active:scale-[0.99] transition-transform duration-700 ease-out"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>

      {/* Touch action overlay helper message */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-mono font-bold text-slate-400 pointer-events-none bg-slate-950/55 px-3 py-1 rounded-full uppercase tracking-wider select-none">
        {stateRef.current.gamemode === 'cube' && 'Cubo: Toca para saltar'}
        {stateRef.current.gamemode === 'robot' && 'Robot: Mantén pulsado para saltar más alto'}
        {stateRef.current.gamemode === 'ball' && 'Rueda: Toca para invertir la gravedad'}
        {stateRef.current.gamemode === 'wave' && 'Wave: Mantén pulsado para subir diagonal, suelta para bajar'}
      </div>

      {/* SPECTATING HUD OVERLAY */}
      {multiplayerState?.isMultiplayer && stateRef.current.spectatingUser && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-slate-900/95 border-2 border-cyan-400 px-6 py-2 rounded-full text-white z-30 font-mono flex items-center gap-3 shadow-2xl animate-pulse">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <div className="text-[10px] uppercase tracking-widest font-black">
            👀 ESPECTANDO JUGADOR: <span className="text-yellow-400">{stateRef.current.spectatingUser}</span>
          </div>
        </div>
      )}

      {/* GAME OVER DIALOG OVERLAY */}
      {isGameOver && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20 animate-fade-in">
          <div className="p-1 rounded-full bg-rose-500/10 border border-rose-500/20 mb-4 animate-bounce">
            <ShieldAlert className="w-16 h-16 text-rose-500" />
          </div>
          <h2 className="text-4xl font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400 mb-2">¡HAS CHOCADO!</h2>
          <p className="text-slate-400 font-mono text-sm mb-6">Intentos en este nivel: <span className="text-yellow-400 font-bold">{attempts}</span></p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => restartLevel(true)}
              className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-base font-bold rounded-xl shadow-lg shadow-emerald-900/30 active:scale-95 transition"
            >
              <RotateCcw className="w-5 h-5" />
              REINTENTAR
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-base font-bold rounded-xl active:scale-95 transition border border-slate-700"
            >
              SALIR AL MENÚ
            </button>
          </div>
        </div>
      )}

      {/* VICTORY LEVEL WIN DIALOG OVERLAY */}
      {hasWon && (
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/95 to-slate-950/95 backdrop-blur flex flex-col items-center justify-center text-white z-20 animate-fade-in">
          <div className="p-3 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-5 animate-bounce">
            <Award className="w-16 h-16 text-yellow-400" />
          </div>
          <h2 className="text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-emerald-400 to-cyan-400 mb-1 drop-shadow-lg">¡NIVEL COMPLETADO!</h2>
          <p className="text-emerald-400 font-bold font-mono text-lg uppercase tracking-wide mb-6">100% COMPLETADO</p>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3 w-64 text-center font-mono text-sm text-slate-300 mb-8">
            <div className="flex justify-between items-center">
              <span>NIVEL:</span>
              <span className="text-white font-bold">{level.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>INTENTOS:</span>
              <span className="text-yellow-400 font-bold text-base">{attempts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>ESTADO:</span>
              <span className="text-emerald-400 font-bold uppercase">¡CONSEGUIDO!</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => restartLevel(false)}
              className="flex items-center gap-2.5 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white text-base font-bold rounded-xl active:scale-95 transition border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
              JUGAR DE NUEVO
            </button>
            <button
              onClick={onExit}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-base font-bold rounded-xl shadow-lg shadow-emerald-900/30 active:scale-95 transition"
            >
              SALIR AL MENÚ
            </button>
          </div>
        </div>
      )}

      {/* GAME PAUSED DIALOG OVERLAY */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
          <h2 className="text-4xl font-extrabold uppercase tracking-widest text-cyan-400 mb-3">JUEGO EN PAUSA</h2>
          <p className="text-slate-400 font-mono text-xs mb-8">Pulsa Escape o pulsa Reanudar para continuar la partida</p>

          <div className="flex flex-col gap-3 w-56">
            <button
              onClick={() => setIsPaused(false)}
              className="flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-base font-bold rounded-xl transition active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              REANUDAR
            </button>
            <button
              onClick={() => restartLevel(false)}
              className="flex items-center justify-center gap-2.5 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white text-base font-bold rounded-xl transition border border-slate-700 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              REINICIAR
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-base font-bold rounded-xl transition border border-rose-900/30 active:scale-95 text-center"
            >
              SALIR AL MENÚ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
