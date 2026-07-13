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

interface GameCanvasProps {
  level: Level;
  skins: PlayerSkins;
  onExit: () => void;
  isPlaytesting?: boolean;
  onProgress?: (percentage: number, attempts: number, isWon: boolean) => void;
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

export default function GameCanvas({ level, skins, onExit, isPlaytesting = false, onProgress }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Game UI States
  const [attempts, setAttempts] = useState(1);
  const [percentage, setPercentage] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

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
  });

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
    state.screenShake = 0;
    state.speedMultiplier = 1.0;
    state.lastPortalId = '';
    state.lastSpeedId = '';
    state.lastPadId = '';
    state.lastRingId = '';
    state.levelPassed = false;
    state.levelStartTime = Date.now();
    
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
    const state = stateRef.current;
    if (isGameOver || hasWon || isPaused) return;

    const currentTime = Date.now();

    // Perform gamemode specific action
    if (state.gamemode === 'cube') {
      if (state.isGrounded) {
        state.playerYVelocity = -9.2;
        state.isGrounded = false;
        if (soundEnabled) audio.playJump();
      }
    } else if (state.gamemode === 'robot') {
      if (state.isGrounded) {
        state.playerYVelocity = -6.6;
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
      if (el.type === 'ring_yellow' || el.type === 'ring_red') {
        const rx = gridToX(el.x);
        const ry = gridToY(el.y);
        // Overlap check
        if (
          px + size > rx && px < rx + TILE_SIZE &&
          py + size > ry && py < ry + TILE_SIZE
        ) {
          if (state.lastRingId !== el.id) {
            // Trigger jump in mid-air!
            const force = el.type === 'ring_red' ? -11.5 : -8.8;
            state.playerYVelocity = force * state.gravityDirection;
            state.isGrounded = false;
            state.lastRingId = el.id;
            
            // Particles
            const color = el.type === 'ring_red' ? '#FF0000' : '#FFFF00';
            spawnRingBurst(rx + TILE_SIZE / 2, ry + TILE_SIZE / 2, color);
            if (soundEnabled) audio.playRing();
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

      if (!isGameOver && !hasWon) {
        state.animationTick++;
        updatePhysics();
      }

      updateParticles();
      drawGame(ctx, canvas);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // UPDATE PHYSICS ENGINE
    const updatePhysics = () => {
      const state = stateRef.current;

      // 1. Level speed calculation
      // base horizontal speed is 5.2px per frame
      const baseSpeed = 5.2;
      const hSpeed = baseSpeed * state.speedMultiplier;
      state.cameraX += hSpeed;

      // Update completion percentage
      const progressRatio = state.cameraX / state.levelLengthPixels;
      const currentProgress = Math.min(state.cameraX >= state.levelLengthPixels ? 99 : 100, Math.floor(progressRatio * 100));
      setPercentage(currentProgress);

      // Win Condition check
      const elapsedMs = Date.now() - state.levelStartTime;
      const reachedEnd = state.cameraX >= state.levelLengthPixels;
      const threeSecondsPassed = elapsedMs >= 3000;

      if (reachedEnd && threeSecondsPassed && !state.levelPassed) {
        state.levelPassed = true;
        setPercentage(100);
        setHasWon(true);
        if (onProgress) {
          onProgress(100, 1, true);
        }
        if (soundEnabled) audio.playWin();
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

            if (headNormal && prevY + pSize <= elY + 6) {
              // Landed on top of the block
              state.playerY = elY - pSize;
              state.playerYVelocity = 0;
              state.isGrounded = true;
              isCollidingWithSurface = true;

              if (Math.random() < 0.4) {
                spawnSlideSpark(state.playerX + pSize / 4, elY, skins.primaryColor);
              }
            } else if (!headNormal && prevY >= elY + TILE_SIZE - 6) {
              // Inverted Gravity: Walked on bottom of block
              state.playerY = elY + TILE_SIZE;
              state.playerYVelocity = 0;
              state.isGrounded = true;
              isCollidingWithSurface = true;
            } else {
              // Hit the side or bottom of block -> Boom! Crash!
              triggerDeath();
            }
          }

          // SPIKES (Leethal spikes!)
          else if (el.type === 'spike' || el.type === 'spike_inverted' || el.type === 'spike_small') {
            // Slightly smaller hit box to make it feel responsive and fair
            // Mini spikes have a much more forgiving hitbox
            const shrink = el.type === 'spike_small' ? TILE_SIZE * 0.35 : TILE_SIZE * 0.15;
            if (
              px + pSize - shrink > elX &&
              px + shrink < elX + TILE_SIZE &&
              py + pSize - shrink > elY &&
              py + shrink < elY + TILE_SIZE
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

          // JUMP PADS (Auto leap)
          else if (el.type === 'pad_yellow' || el.type === 'pad_red') {
            if (state.lastPadId !== el.id) {
              state.lastPadId = el.id;
              // Auto launch: red mega pads launch the player with extreme speed!
              const force = el.type === 'pad_red' ? -14.5 : -10.5;
              state.playerYVelocity = force * state.gravityDirection;
              state.isGrounded = false;
              const color = el.type === 'pad_red' ? '#FF0000' : '#FFFF00';
              spawnRingBurst(elX + TILE_SIZE / 2, elY + TILE_SIZE / 2, color);
              if (soundEnabled) audio.playJump();
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
              if (soundEnabled) audio.playGravitySwap();
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
    };

    // TRIGGER DEATH (Boom!)
    const triggerDeath = () => {
      const state = stateRef.current;
      setIsGameOver(true);
      state.screenShake = 14;

      const currentProgress = Math.min(100, Math.floor((state.cameraX / state.levelLengthPixels) * 100));
      if (onProgress) {
        onProgress(currentProgress, 1, false);
      }

      // Spawn huge blast of colored explosion sparks
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3.5 + Math.random() * 5.5;
        state.particles.push({
          x: state.playerX + state.playerSize / 2,
          y: state.playerY + state.playerSize / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.5 ? skins.primaryColor : skins.secondaryColor,
          size: 4 + Math.random() * 6,
          life: 0,
          maxLife: 40 + Math.random() * 25,
        });
      }

      if (soundEnabled) {
        audio.playDeath();
        audio.stopMusic();
      }
    };

    // Particles animations
    const spawnSlideSpark = (x: number, y: number, color: string) => {
      const state = stateRef.current;
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
      state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        // Apply tiny drag
        p.vx *= 0.98;
        p.vy *= 0.98;
        return p.life < p.maxLife;
      });

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
    ctx.fillStyle = '#6D28D9'; // Deep violet purple background (classic GD)
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Parallax scrolling mountains/pyramids in the background
    ctx.save();
    ctx.fillStyle = '#5B21B6'; // slightly darker purple
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
    ctx.fillStyle = '#4C1D95';
    ctx.fillRect(0, 0, canvas.width, 80);
    ctx.fillStyle = '#10B981'; // Green ceiling highlight line
    ctx.fillRect(0, 78, canvas.width, 2);

    // 2. Draw static ground mesh & scrolling floor grid
    ctx.fillStyle = '#1F2937'; // dark charcoal ground
    ctx.fillRect(0, GROUND_Y_PIXELS, canvas.width, canvas.height - GROUND_Y_PIXELS);

    // Green neon ground border line
    ctx.fillStyle = '#10B981';
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

      else if (el.type === 'pad_yellow') {
        // Jump Pad base
        ctx.fillStyle = '#374151';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.fillRect(-TILE_SIZE * 0.4, TILE_SIZE * 0.25, TILE_SIZE * 0.8, TILE_SIZE * 0.2);
        ctx.strokeRect(-TILE_SIZE * 0.4, TILE_SIZE * 0.25, TILE_SIZE * 0.8, TILE_SIZE * 0.2);

        // Yellow bouncing spring
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.ellipse(0, TILE_SIZE * 0.2, TILE_SIZE * 0.35, TILE_SIZE * 0.1, 0, 0, Math.PI, true);
        ctx.fill();
        ctx.stroke();
      }

      else if (el.type === 'ring_yellow') {
        // Floating circular neon trigger ring
        const ringPulse = Math.sin(state.animationTick * 0.2) * 2;
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, TILE_SIZE * 0.3 + ringPulse * 0.3, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = '#FFFF00' + '33';
        ctx.beginPath();
        ctx.arc(0, 0, TILE_SIZE * 0.2, 0, 2 * Math.PI);
        ctx.fill();
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

    // 6. Draw Player Character
    if (!isGameOver) {
      const pSize = state.playerSize;
      const px = state.playerX + pSize / 2;
      const py = state.playerY + pSize / 2;

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

    ctx.restore();
  };

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

        {/* Attempts Label */}
        <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700/50 text-white pointer-events-auto font-mono text-sm font-bold shadow-md flex items-center gap-2">
          <span className="text-pink-400">INTENTO:</span>
          <span className="text-xl text-yellow-300 font-black">{attempts}</span>
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
