/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Skin {
  id: string;
  name: string;
}

export const CUBE_SKINS: Skin[] = [
  { id: 'cube_classic', name: 'Clásico' },
  { id: 'cube_angry', name: 'Enojado' },
  { id: 'cube_cool', name: 'Gafas de Sol' },
  { id: 'cube_creeper', name: 'Creeper' },
];

export const WAVE_SKINS: Skin[] = [
  { id: 'wave_classic', name: 'Dardo Clásico' },
  { id: 'wave_dual', name: 'Doble Punta' },
  { id: 'wave_cyber', name: 'Ciber Nave' },
  { id: 'wave_spiked', name: 'Puntas Aladas' },
];

export const ROBOT_SKINS: Skin[] = [
  { id: 'robot_classic', name: 'Bot Clásico' },
  { id: 'robot_gladiator', name: 'Gladiador' },
  { id: 'robot_cat', name: 'Neko Cyber' },
  { id: 'robot_heavy', name: 'Armadura Pesada' },
];

export const BALL_SKINS: Skin[] = [
  { id: 'ball_classic', name: 'Rueda Clásica' },
  { id: 'ball_saw', name: 'Sierras' },
  { id: 'ball_target', name: 'Blanco' },
  { id: 'ball_biohazard', name: 'Peligro' },
];

export const COLOR_PALETTE = [
  '#00FF00', // Lime Green (Classic GD)
  '#00FFFF', // Cyan
  '#FF00FF', // Pink/Magenta
  '#FFFF00', // Yellow
  '#FF4500', // Orange Red
  '#FF0000', // Red
  '#9333EA', // Purple
  '#3B82F6', // Blue
  '#FFFFFF', // White
  '#34D399', // Emerald
  '#F59E0B', // Amber
  '#111827', // Obsidian/Dark Charcoal
  '#FFB7B2', // Pastel Pink 🌸
  '#FFDAC1', // Pastel Peach 🍑
  '#E2F0CB', // Pastel Soft Green 🍏
  '#B5EAD7', // Pastel Mint 🌿
  '#C7CEEA', // Pastel Blue-Grey 🪐
  '#E8C4FF', // Pastel Lavender 🦄
  '#A8DADC', // Pastel Cool Cyan ❄️
  '#F08080', // Pastel Light Coral 🦩
];

// Helper to draw standard shapes
export function drawCube(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  id: string,
  primary: string,
  secondary: string,
  rotation: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  const hs = size / 2;

  // Draw base body
  ctx.fillStyle = primary;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = Math.max(2, size / 15);
  ctx.fillRect(-hs, -hs, size, size);
  ctx.strokeRect(-hs, -hs, size, size);

  // Draw secondary highlights & face based on ID
  ctx.fillStyle = secondary;
  ctx.strokeStyle = '#000000';

  if (id === 'cube_classic') {
    // Inner frame
    ctx.fillRect(-hs + size * 0.15, -hs + size * 0.15, size * 0.7, size * 0.7);
    ctx.strokeRect(-hs + size * 0.15, -hs + size * 0.15, size * 0.7, size * 0.7);

    // Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(-size * 0.2, -size * 0.25, size * 0.12, size * 0.15);
    ctx.fillRect(size * 0.08, -size * 0.25, size * 0.12, size * 0.15);

    // Mouth
    ctx.fillRect(-size * 0.22, size * 0.08, size * 0.44, size * 0.1);
    ctx.fillRect(-size * 0.22, size * 0.0, size * 0.08, size * 0.1);
    ctx.fillRect(size * 0.14, size * 0.0, size * 0.08, size * 0.1);
  } else if (id === 'cube_angry') {
    // Spiked secondary bands
    ctx.beginPath();
    ctx.moveTo(-hs, -hs);
    ctx.lineTo(-hs + size * 0.3, -hs + size * 0.3);
    ctx.lineTo(hs - size * 0.3, -hs + size * 0.3);
    ctx.lineTo(hs, -hs);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-hs, hs);
    ctx.lineTo(-hs + size * 0.3, hs - size * 0.3);
    ctx.lineTo(hs - size * 0.3, hs - size * 0.3);
    ctx.lineTo(hs, hs);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Angry Eyes
    ctx.fillStyle = '#000000';
    ctx.save();
    // Left eye tilted
    ctx.translate(-size * 0.18, -size * 0.08);
    ctx.rotate(0.3);
    ctx.fillRect(-size * 0.1, -size * 0.06, size * 0.2, size * 0.12);
    ctx.restore();

    ctx.save();
    // Right eye tilted opposite
    ctx.translate(size * 0.18, -size * 0.08);
    ctx.rotate(-0.3);
    ctx.fillRect(-size * 0.1, -size * 0.06, size * 0.2, size * 0.12);
    ctx.restore();

    // Angry scowl mouth
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(-size * 0.25, size * 0.18);
    ctx.quadraticCurveTo(0, size * 0.05, size * 0.25, size * 0.18);
    ctx.lineTo(size * 0.25, size * 0.24);
    ctx.quadraticCurveTo(0, size * 0.11, -size * 0.25, size * 0.24);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'cube_cool') {
    // Diamond center
    ctx.beginPath();
    ctx.moveTo(0, -hs + size * 0.1);
    ctx.lineTo(hs - size * 0.1, 0);
    ctx.lineTo(0, hs - size * 0.1);
    ctx.lineTo(-hs + size * 0.1, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sunglasses
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.moveTo(-size * 0.35, -size * 0.18);
    ctx.lineTo(size * 0.35, -size * 0.18);
    ctx.lineTo(size * 0.28, size * 0.04);
    ctx.lineTo(size * 0.05, size * 0.04);
    ctx.lineTo(-size * 0.05, size * 0.04);
    ctx.lineTo(-size * 0.28, size * 0.04);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sunglasses white shine
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-size * 0.25, -size * 0.14, size * 0.08, size * 0.06);
    ctx.fillRect(size * 0.1, -size * 0.14, size * 0.08, size * 0.06);

    // Smirk
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.arc(size * 0.08, size * 0.15, size * 0.15, 0, Math.PI);
    ctx.stroke();
  } else if (id === 'cube_creeper') {
    // Inner outline
    ctx.fillStyle = secondary;
    ctx.fillRect(-size * 0.35, -size * 0.35, size * 0.7, size * 0.7);
    ctx.strokeRect(-size * 0.35, -size * 0.35, size * 0.7, size * 0.7);

    // Creeper face blocks
    ctx.fillStyle = '#000000';
    // Eyes
    ctx.fillRect(-size * 0.25, -size * 0.22, size * 0.18, size * 0.18);
    ctx.fillRect(size * 0.07, -size * 0.22, size * 0.18, size * 0.18);
    // Nose / Mouth
    ctx.fillRect(-size * 0.09, -size * 0.04, size * 0.18, size * 0.22);
    ctx.fillRect(-size * 0.18, size * 0.08, size * 0.09, size * 0.2);
    ctx.fillRect(size * 0.09, size * 0.08, size * 0.09, size * 0.2);
  } else if (id === 'cube_spiral') {
    // Concentric circles or square spiral
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.35, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(3, size / 12);
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.22, 0, 1.5 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, size * 0.1, 0, 2 * Math.PI);
    ctx.fillStyle = '#000000';
    ctx.fill();
  } else if (id === 'cube_ninja') {
    // Headband bandana shape
    ctx.beginPath();
    ctx.moveTo(-hs, -size * 0.3);
    ctx.lineTo(hs, -size * 0.3);
    ctx.lineTo(hs, size * 0.05);
    ctx.lineTo(-hs, size * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eye slit in bandana
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-size * 0.3, -size * 0.18, size * 0.6, size * 0.15);
    ctx.strokeRect(-size * 0.3, -size * 0.18, size * 0.6, size * 0.15);

    // Ninja determined eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(-size * 0.2, -size * 0.14, size * 0.12, size * 0.08);
    ctx.fillRect(size * 0.08, -size * 0.14, size * 0.12, size * 0.08);

    // Brow lines
    ctx.beginPath();
    ctx.moveTo(-size * 0.22, -size * 0.16);
    ctx.lineTo(-size * 0.06, -size * 0.1);
    ctx.moveTo(size * 0.22, -size * 0.16);
    ctx.lineTo(size * 0.06, -size * 0.1);
    ctx.stroke();
  } else {
    // Elegant fallback drawings for the new skins
    if (id === 'cube_demon') {
      // Demon horns & glowing eyes
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.moveTo(-hs, -hs); ctx.lineTo(-hs - size * 0.15, -hs - size * 0.15); ctx.lineTo(-hs + size * 0.3, -hs); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hs, -hs); ctx.lineTo(hs + size * 0.15, -hs - size * 0.15); ctx.lineTo(hs - size * 0.3, -hs); ctx.closePath(); ctx.fill(); ctx.stroke();
      
      ctx.fillStyle = secondary;
      ctx.fillRect(-size * 0.3, -size * 0.1, size * 0.6, size * 0.2);
      ctx.strokeRect(-size * 0.3, -size * 0.1, size * 0.6, size * 0.2);

      ctx.fillStyle = '#FFFF00';
      ctx.fillRect(-size * 0.2, -size * 0.05, size * 0.1, size * 0.1);
      ctx.fillRect(size * 0.1, -size * 0.05, size * 0.1, size * 0.1);
    } else if (id === 'cube_skull') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.6);
      ctx.strokeRect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.6);
      ctx.fillStyle = '#000000';
      ctx.beginPath(); ctx.arc(-size * 0.12, -size * 0.08, size * 0.08, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(size * 0.12, -size * 0.08, size * 0.08, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(-size * 0.15, size * 0.1, size * 0.3, size * 0.15);
    } else if (id === 'cube_crown') {
      ctx.fillStyle = secondary;
      ctx.fillRect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.6);
      ctx.strokeRect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.6);
      // Gold crown at top
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(-hs, -hs); ctx.lineTo(-hs, -hs - size * 0.2); ctx.lineTo(-hs + size * 0.25, -hs - size * 0.1);
      ctx.lineTo(0, -hs - size * 0.25); ctx.lineTo(hs - size * 0.25, -hs - size * 0.1);
      ctx.lineTo(hs, -hs - size * 0.2); ctx.lineTo(hs, -hs);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (id === 'cube_smile') {
      ctx.fillStyle = secondary;
      ctx.beginPath(); ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.fillRect(-size * 0.12, -size * 0.15, size * 0.06, size * 0.1);
      ctx.fillRect(size * 0.06, -size * 0.15, size * 0.06, size * 0.1);
      ctx.beginPath(); ctx.arc(0, size * 0.05, size * 0.12, 0, Math.PI); ctx.stroke();
    } else if (id === 'cube_companion') {
      // Aperture Companion Cube heart design
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.6);
      ctx.strokeRect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.6);
      ctx.fillStyle = '#F472B6'; // Pink heart
      ctx.beginPath();
      ctx.arc(-size * 0.08, -size * 0.04, size * 0.08, Math.PI, 0, false);
      ctx.arc(size * 0.08, -size * 0.04, size * 0.08, Math.PI, 0, false);
      ctx.lineTo(0, size * 0.18);
      ctx.closePath(); ctx.fill();
    } else if (id === 'cube_iron') {
      // Iron plate texture
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(-size * 0.35, -size * 0.35, size * 0.7, size * 0.7);
      ctx.beginPath();
      ctx.moveTo(-hs, -hs); ctx.lineTo(hs, hs);
      ctx.moveTo(-hs, hs); ctx.lineTo(hs, -hs);
      ctx.stroke();
    } else if (id === 'cube_kitty') {
      // Cute cat ears & face
      ctx.fillStyle = secondary;
      // left ear
      ctx.beginPath(); ctx.moveTo(-hs, -hs); ctx.lineTo(-hs - size * 0.1, -hs - size * 0.2); ctx.lineTo(-hs + size * 0.3, -hs); ctx.closePath(); ctx.fill(); ctx.stroke();
      // right ear
      ctx.beginPath(); ctx.moveTo(hs, -hs); ctx.lineTo(hs + size * 0.1, -hs - size * 0.2); ctx.lineTo(hs - size * 0.3, -hs); ctx.closePath(); ctx.fill(); ctx.stroke();
      // inner face
      ctx.fillRect(-size * 0.25, -size * 0.25, size * 0.5, size * 0.5);
      ctx.strokeRect(-size * 0.25, -size * 0.25, size * 0.5, size * 0.5);
      // cute eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(-size * 0.14, -size * 0.05, size * 0.06, 0.08 * size);
      ctx.fillRect(size * 0.08, -size * 0.05, size * 0.06, 0.08 * size);
      // whiskers
      ctx.beginPath();
      ctx.moveTo(-size * 0.2, size * 0.05); ctx.lineTo(-size * 0.38, size * 0.02);
      ctx.moveTo(-size * 0.2, size * 0.1); ctx.lineTo(-size * 0.38, size * 0.12);
      ctx.moveTo(size * 0.2, size * 0.05); ctx.lineTo(size * 0.38, size * 0.02);
      ctx.moveTo(size * 0.2, size * 0.1); ctx.lineTo(size * 0.38, size * 0.12);
      ctx.stroke();
    } else if (id === 'cube_alien') {
      // Alien design
      ctx.fillStyle = secondary;
      ctx.beginPath(); ctx.arc(0, 0, size * 0.32, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // 3 glowing alien eyes
      ctx.fillStyle = '#FFD700';
      ctx.beginPath(); ctx.arc(-size * 0.12, -size * 0.05, size * 0.06, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(size * 0.12, -size * 0.05, size * 0.06, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -size * 0.18, size * 0.07, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (id === 'cube_steve') {
      // Blocky haircut and nose
      ctx.fillStyle = secondary;
      ctx.fillRect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.6);
      ctx.strokeRect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.6);
      ctx.fillStyle = '#451A03'; // Brown hair
      ctx.fillRect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.18);
      // Nose
      ctx.fillStyle = '#FCA5A5';
      ctx.fillRect(-size * 0.08, -size * 0.03, size * 0.16, size * 0.14);
      ctx.strokeRect(-size * 0.08, -size * 0.03, size * 0.16, size * 0.14);
    } else if (id === 'cube_pacman') {
      // Pacman wedge body
      ctx.fillStyle = '#FFFF00';
      ctx.beginPath();
      ctx.arc(0, 0, hs * 0.9, Math.PI * 0.2, Math.PI * 1.8, false);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.beginPath(); ctx.arc(0, -size * 0.2, size * 0.06, 0, Math.PI * 2); ctx.fill();
    } else if (id === 'cube_matrix') {
      // Digital look
      ctx.fillStyle = '#000000';
      ctx.fillRect(-hs * 0.9, -hs * 0.9, size * 0.9, size * 0.9);
      ctx.strokeRect(-hs * 0.9, -hs * 0.9, size * 0.9, size * 0.9);
      ctx.fillStyle = secondary;
      ctx.font = `bold ${size * 0.25}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('10', 0, 0);
    } else if (id === 'cube_steampunk') {
      // Steampunk nested gear-like design
      ctx.fillStyle = secondary;
      ctx.beginPath(); ctx.arc(0, 0, hs * 0.9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-hs * 0.8, 0); ctx.lineTo(hs * 0.8, 0); ctx.moveTo(0, -hs * 0.8); ctx.lineTo(0, hs * 0.8); ctx.stroke();
    } else {
      ctx.fillStyle = secondary;
      ctx.fillRect(-size * 0.2, -size * 0.2, size * 0.4, size * 0.4);
      ctx.strokeRect(-size * 0.2, -size * 0.2, size * 0.4, size * 0.4);
    }
  }

  ctx.restore();
}

export function drawWave(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  id: string,
  primary: string,
  secondary: string,
  rotation: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  const hs = size / 2;

  ctx.lineWidth = Math.max(2, size / 15);
  ctx.strokeStyle = '#000000';

  if (id === 'wave_classic') {
    // Sharp arrow head
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.moveTo(hs, 0); // front tip
    ctx.lineTo(-hs, -hs); // top-back
    ctx.lineTo(-size * 0.1, 0); // inner indent
    ctx.lineTo(-hs, hs); // bottom-back
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Secondary wing inner insert
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, 0);
    ctx.lineTo(-hs + size * 0.2, -size * 0.25);
    ctx.lineTo(-hs, -hs);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-size * 0.1, 0);
    ctx.lineTo(-hs + size * 0.2, size * 0.25);
    ctx.lineTo(-hs, hs);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (id === 'wave_dual') {
    // Split tip
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.moveTo(hs, -size * 0.15);
    ctx.lineTo(hs, size * 0.15);
    ctx.lineTo(-hs, hs);
    ctx.lineTo(-size * 0.2, 0);
    ctx.lineTo(-hs, -hs);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Core glow
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.arc(-size * 0.05, 0, size * 0.2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  } else if (id === 'wave_cyber') {
    // Futuristic spaceship shape
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.moveTo(hs, 0);
    ctx.lineTo(-size * 0.1, -hs);
    ctx.lineTo(-hs, -hs * 0.6);
    ctx.lineTo(-hs * 0.4, 0);
    ctx.lineTo(-hs, hs * 0.6);
    ctx.lineTo(-size * 0.1, hs);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Windshield visor
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.moveTo(size * 0.2, -size * 0.12);
    ctx.lineTo(size * 0.2, size * 0.12);
    ctx.lineTo(-size * 0.05, size * 0.22);
    ctx.lineTo(-size * 0.05, -size * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (id === 'wave_spiked') {
    // Spike wings wave
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.moveTo(hs, 0);
    ctx.lineTo(-size * 0.2, -size * 0.2);
    ctx.lineTo(-hs, -hs);
    ctx.lineTo(-size * 0.4, -size * 0.1);
    ctx.lineTo(-hs, 0);
    ctx.lineTo(-size * 0.4, size * 0.1);
    ctx.lineTo(-hs, hs);
    ctx.lineTo(-size * 0.2, size * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Spiky accents
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-hs, -hs * 0.5);
    ctx.lineTo(-size * 0.2, 0);
    ctx.lineTo(-hs, hs * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (id === 'wave_diamond') {
    // Diamond shape
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.moveTo(hs, 0);
    ctx.lineTo(0, -hs);
    ctx.lineTo(-hs, 0);
    ctx.lineTo(0, hs);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner diamond grid
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.moveTo(size * 0.2, 0);
    ctx.lineTo(0, -size * 0.25);
    ctx.lineTo(-size * 0.2, 0);
    ctx.lineTo(0, size * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (id === 'wave_phoenix') {
    // Curved winged falcon
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.moveTo(hs, 0);
    ctx.quadraticCurveTo(0, -size * 0.3, -hs, -hs);
    ctx.quadraticCurveTo(-size * 0.2, -size * 0.1, -size * 0.3, 0);
    ctx.quadraticCurveTo(-size * 0.2, size * 0.1, -hs, hs);
    ctx.quadraticCurveTo(0, size * 0.3, hs, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Phoenix eye/flame
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.moveTo(size * 0.1, -size * 0.08);
    ctx.quadraticCurveTo(-size * 0.1, -size * 0.15, -size * 0.2, 0);
    ctx.quadraticCurveTo(-size * 0.1, size * 0.15, size * 0.1, size * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    // Fallbacks for the new wave skins
    if (id === 'wave_saw') {
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.moveTo(hs, 0);
      ctx.lineTo(-hs, -hs);
      ctx.lineTo(-size * 0.2, -size * 0.1);
      ctx.lineTo(-size * 0.4, -hs);
      ctx.lineTo(-hs, 0);
      ctx.lineTo(-size * 0.4, hs);
      ctx.lineTo(-size * 0.2, size * 0.1);
      ctx.lineTo(-hs, hs);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // Draw saw center
      ctx.fillStyle = secondary;
      ctx.beginPath(); ctx.arc(-size * 0.1, 0, size * 0.15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (id === 'wave_skull') {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(hs, 0); ctx.lineTo(-hs, -hs * 0.8); ctx.lineTo(-hs, hs * 0.8); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.fillRect(-size * 0.15, -size * 0.1, size * 0.08, size * 0.08);
      ctx.fillRect(-size * 0.15, size * 0.02, size * 0.08, size * 0.08);
    } else if (id === 'wave_demon') {
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.moveTo(hs, 0); ctx.lineTo(-hs, -hs); ctx.lineTo(-size * 0.15, 0); ctx.lineTo(-hs, hs); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(-hs, -hs * 0.5); ctx.lineTo(-hs - size * 0.1, -hs - size * 0.1); ctx.lineTo(-size * 0.3, -size * 0.2); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-hs, hs * 0.5); ctx.lineTo(-hs - size * 0.1, hs + size * 0.1); ctx.lineTo(-size * 0.3, size * 0.2); ctx.closePath(); ctx.fill();
    } else if (id === 'wave_ufo') {
      ctx.fillStyle = secondary;
      ctx.beginPath(); ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = primary;
      ctx.beginPath(); ctx.ellipse(0, 0, size * 0.45, size * 0.15, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (id === 'wave_rocket') {
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.moveTo(hs, 0); ctx.lineTo(-hs, -hs * 0.5); ctx.lineTo(-hs, hs * 0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#EF4444'; // Red tail fin
      ctx.fillRect(-hs - size * 0.1, -size * 0.12, size * 0.15, size * 0.24);
    } else if (id === 'wave_angel') {
      ctx.fillStyle = '#F0F9FF';
      ctx.beginPath();
      ctx.moveTo(hs, 0);
      ctx.bezierCurveTo(0, -hs * 1.5, -hs, -hs * 1.5, -hs, 0);
      ctx.bezierCurveTo(-hs, hs * 1.5, 0, hs * 1.5, hs, 0);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = secondary;
      ctx.beginPath(); ctx.arc(-size * 0.15, 0, size * 0.12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (id === 'wave_bat') {
      // Spiky bat wings design
      ctx.fillStyle = '#1E293B'; // Dark charcoal wings
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-hs, -hs * 1.3); ctx.lineTo(-size * 0.1, -size * 0.3);
      ctx.lineTo(-hs, hs * 1.3); ctx.closePath(); ctx.fill(); ctx.stroke();
      // Arrow core
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.moveTo(hs, 0); ctx.lineTo(-hs, -hs * 0.6); ctx.lineTo(-hs, hs * 0.6); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (id === 'wave_vortex') {
      // Concentric spirals
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.moveTo(hs, 0); ctx.lineTo(-hs, -hs * 0.8); ctx.lineTo(-hs, hs * 0.8); ctx.closePath(); ctx.fill(); ctx.stroke();
      // Vortex spiral
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let theta = 0; theta < Math.PI * 3; theta += 0.2) {
        const r = (theta / (Math.PI * 3)) * (size * 0.25);
        ctx.lineTo(-size * 0.1 + Math.cos(theta) * r, Math.sin(theta) * r);
      }
      ctx.stroke();
    } else if (id === 'wave_spear') {
      // Sharp spear head with backwards fins
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.moveTo(hs, 0);
      ctx.lineTo(-size * 0.1, -hs);
      ctx.lineTo(0, -size * 0.15);
      ctx.lineTo(-hs, -hs * 0.8);
      ctx.lineTo(-hs, hs * 0.8);
      ctx.lineTo(0, size * 0.15);
      ctx.lineTo(-size * 0.1, hs);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (id === 'wave_alien') {
      // UFO saucery dardo wave
      ctx.fillStyle = secondary;
      ctx.beginPath(); ctx.ellipse(-size * 0.1, 0, size * 0.4, size * 0.25, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // Glowing dome
      ctx.fillStyle = '#06B6D4'; // cyan dome
      ctx.beginPath(); ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else {
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.moveTo(hs, 0); ctx.lineTo(-hs, -hs * 0.5); ctx.lineTo(-hs, hs * 0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }

  ctx.restore();
}

export function drawRobot(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  id: string,
  primary: string,
  secondary: string,
  isJumping: boolean,
  animTick: number
) {
  ctx.save();
  ctx.translate(cx, cy);

  const hs = size / 2;
  ctx.lineWidth = Math.max(2, size / 16);
  ctx.strokeStyle = '#000000';

  // Leg animation variables
  let legOffset1 = 0;
  let legOffset2 = 0;
  if (isJumping) {
    legOffset1 = size * 0.15; // Raised legs
    legOffset2 = size * 0.15;
  } else {
    // Running cycle
    legOffset1 = Math.sin(animTick * 0.25) * size * 0.12;
    legOffset2 = -Math.sin(animTick * 0.25) * size * 0.12;
  }

  // DRAW LEGS (behind body)
  ctx.fillStyle = secondary;
  // Left Leg
  ctx.fillRect(-size * 0.25, size * 0.1, size * 0.12, size * 0.25 + legOffset1);
  ctx.strokeRect(-size * 0.25, size * 0.1, size * 0.12, size * 0.25 + legOffset1);
  ctx.fillRect(-size * 0.3, size * 0.35 + legOffset1, size * 0.2, size * 0.08); // Foot
  ctx.strokeRect(-size * 0.3, size * 0.35 + legOffset1, size * 0.2, size * 0.08);

  // Right Leg
  ctx.fillRect(size * 0.1, size * 0.1, size * 0.12, size * 0.25 + legOffset2);
  ctx.strokeRect(size * 0.1, size * 0.1, size * 0.12, size * 0.25 + legOffset2);
  ctx.fillRect(size * 0.05, size * 0.35 + legOffset2, size * 0.2, size * 0.08); // Foot
  ctx.strokeRect(size * 0.05, size * 0.35 + legOffset2, size * 0.2, size * 0.08);

  // DRAW MAIN BODY
  ctx.fillStyle = primary;
  ctx.fillRect(-size * 0.35, -size * 0.2, size * 0.7, size * 0.4);
  ctx.strokeRect(-size * 0.35, -size * 0.2, size * 0.7, size * 0.4);

  // Secondary highlights on torso
  ctx.fillStyle = secondary;
  ctx.fillRect(-size * 0.2, -size * 0.1, size * 0.4, size * 0.2);
  ctx.strokeRect(-size * 0.2, -size * 0.1, size * 0.4, size * 0.2);

  // DRAW HEAD & ACCENTS DEPENDING ON ID
  if (id === 'robot_classic') {
    // Head neck
    ctx.fillStyle = '#333333';
    ctx.fillRect(-size * 0.08, -size * 0.32, size * 0.16, size * 0.12);
    ctx.strokeRect(-size * 0.08, -size * 0.32, size * 0.16, size * 0.12);

    // Robot Head
    ctx.fillStyle = primary;
    ctx.fillRect(-size * 0.25, -size * 0.55, size * 0.5, size * 0.25);
    ctx.strokeRect(-size * 0.25, -size * 0.55, size * 0.5, size * 0.25);

    // Visor eye
    ctx.fillStyle = '#00FFFF';
    ctx.fillRect(-size * 0.15, -size * 0.48, size * 0.35, size * 0.1);
    ctx.strokeRect(-size * 0.15, -size * 0.48, size * 0.35, size * 0.1);

    // Antenna
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.55);
    ctx.lineTo(0, -size * 0.7);
    ctx.stroke();
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.arc(0, -size * 0.7, size * 0.05, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  } else if (id === 'robot_gladiator') {
    // Heavy Spartan/Gladiator neck + head
    ctx.fillStyle = '#333333';
    ctx.fillRect(-size * 0.1, -size * 0.3, size * 0.2, size * 0.1);
    ctx.strokeRect(-size * 0.1, -size * 0.3, size * 0.2, size * 0.1);

    // Head
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, -size * 0.42, size * 0.22, Math.PI, 0);
    ctx.lineTo(size * 0.22, -size * 0.25);
    ctx.lineTo(-size * 0.22, -size * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Gladiator crest feather
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.6);
    ctx.quadraticCurveTo(-size * 0.3, -size * 0.5, -size * 0.32, -size * 0.35);
    ctx.quadraticCurveTo(-size * 0.1, -size * 0.45, 0, -size * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Angry visor slit
    ctx.fillStyle = secondary;
    ctx.fillRect(-size * 0.15, -size * 0.42, size * 0.3, size * 0.08);
  } else if (id === 'robot_cat') {
    // Cute cat head
    ctx.fillStyle = primary;
    ctx.fillRect(-size * 0.26, -size * 0.52, size * 0.52, size * 0.24);
    ctx.strokeRect(-size * 0.26, -size * 0.52, size * 0.52, size * 0.24);

    // Cyber Ears (triangles)
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.moveTo(-size * 0.22, -size * 0.52);
    ctx.lineTo(-size * 0.25, -size * 0.68);
    ctx.lineTo(-size * 0.08, -size * 0.52);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(size * 0.22, -size * 0.52);
    ctx.lineTo(size * 0.25, -size * 0.68);
    ctx.lineTo(size * 0.08, -size * 0.52);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cat digital eyes
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(-size * 0.16, -size * 0.44, size * 0.08, size * 0.08);
    ctx.fillRect(size * 0.08, -size * 0.44, size * 0.08, size * 0.08);
  } else if (id === 'robot_heavy') {
    // Massive helmet head
    ctx.fillStyle = primary;
    ctx.fillRect(-size * 0.32, -size * 0.56, size * 0.64, size * 0.32);
    ctx.strokeRect(-size * 0.32, -size * 0.56, size * 0.64, size * 0.32);

    // Front vent grill
    ctx.fillStyle = '#111827';
    ctx.fillRect(-size * 0.2, -size * 0.44, size * 0.4, size * 0.15);
    ctx.strokeRect(-size * 0.2, -size * 0.44, size * 0.4, size * 0.15);

    ctx.strokeStyle = secondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, -size * 0.44);
    ctx.lineTo(-size * 0.1, -size * 0.3);
    ctx.moveTo(0, -size * 0.44);
    ctx.lineTo(0, -size * 0.3);
    ctx.moveTo(size * 0.1, -size * 0.44);
    ctx.lineTo(size * 0.1, -size * 0.3);
    ctx.stroke();
  } else if (id === 'robot_cyclops') {
    // One big eye head
    ctx.fillStyle = primary;
    ctx.fillRect(-size * 0.24, -size * 0.5, size * 0.48, size * 0.24);
    ctx.strokeRect(-size * 0.24, -size * 0.5, size * 0.48, size * 0.24);

    // Big central red cyclops eye
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(0, -size * 0.38, size * 0.09, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    // Eye horizontal bar
    ctx.fillStyle = secondary;
    ctx.fillRect(-size * 0.2, -size * 0.4, size * 0.07, size * 0.04);
    ctx.fillRect(size * 0.13, -size * 0.4, size * 0.07, size * 0.04);
  } else if (id === 'robot_steampunk') {
    // Gear head
    ctx.fillStyle = secondary;
    ctx.save();
    ctx.translate(0, -size * 0.38);
    // Draw gear teeth
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-size * 0.05, -size * 0.26, size * 0.1, size * 0.1);
      ctx.strokeRect(-size * 0.05, -size * 0.26, size * 0.1, size * 0.1);
    }
    // Main circle of gear
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    // Center pin
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.07, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  } else {
    // Other new robots head
    ctx.fillStyle = primary;
    ctx.fillRect(-size * 0.24, -size * 0.5, size * 0.48, size * 0.24);
    ctx.strokeRect(-size * 0.24, -size * 0.5, size * 0.48, size * 0.24);

    ctx.fillStyle = secondary;
    if (id === 'robot_demon') {
      // Demon horns
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.moveTo(-size * 0.24, -size * 0.5); ctx.lineTo(-size * 0.35, -size * 0.65); ctx.lineTo(-size * 0.1, -size * 0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(size * 0.24, -size * 0.5); ctx.lineTo(size * 0.35, -size * 0.65); ctx.lineTo(size * 0.1, -size * 0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (id === 'robot_angel') {
      // Halo above head
      ctx.strokeStyle = '#FCD34D';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(0, -size * 0.6, size * 0.18, size * 0.06, 0, 0, Math.PI * 2); ctx.stroke();
    } else if (id === 'robot_pirate') {
      // Eyepatch
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(-size * 0.15, -size * 0.46, size * 0.12, size * 0.12);
      ctx.beginPath(); ctx.moveTo(-size * 0.24, -size * 0.46); ctx.lineTo(size * 0.24, -size * 0.38); ctx.stroke();
    } else if (id === 'robot_samurai') {
      // Crest helmet
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.5); ctx.lineTo(-size * 0.15, -size * 0.7); ctx.lineTo(size * 0.15, -size * 0.7);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (id === 'robot_terminator') {
      // Red mechanical eye and metallic plates
      ctx.fillStyle = '#EF4444'; // glowing red eye
      ctx.beginPath(); ctx.arc(-size * 0.08, -size * 0.38, size * 0.06, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, -size * 0.44, size * 0.18, size * 0.12);
      ctx.strokeRect(0, -size * 0.44, size * 0.18, size * 0.12);
    } else if (id === 'robot_bunny') {
      // Tall floppy bunny ears on head
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.ellipse(-size * 0.1, -size * 0.62, size * 0.06, size * 0.18, -0.1, 0, Math.PI * 2);
      ctx.ellipse(size * 0.1, -size * 0.62, size * 0.06, size * 0.18, 0.1, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // cute face line
      ctx.fillStyle = '#FF9999';
      ctx.fillRect(-size * 0.04, -size * 0.38, size * 0.08, size * 0.05);
    } else if (id === 'robot_spider') {
      // Spider eyes (multiple dots)
      ctx.fillStyle = '#DC2626';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(-size * 0.14 + (i * size * 0.09), -size * 0.38, size * 0.035, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (id === 'robot_wizard') {
      // Pointy wizard hat
      ctx.fillStyle = '#4F46E5'; // Indigo hat
      ctx.beginPath();
      ctx.moveTo(-size * 0.32, -size * 0.5);
      ctx.lineTo(0, -size * 0.82);
      ctx.lineTo(size * 0.32, -size * 0.5);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // Star on hat
      ctx.fillStyle = '#FCD34D';
      ctx.beginPath(); ctx.arc(0, -size * 0.64, size * 0.05, 0, Math.PI * 2); ctx.fill();
    } else {
      // Simple face line
      ctx.fillRect(-size * 0.15, -size * 0.42, size * 0.3, size * 0.08);
    }
  }

  // ARM (swings relative to legs)
  ctx.save();
  ctx.translate(-size * 0.1, -size * 0.05);
  let armSwing = Math.sin(animTick * 0.2) * 0.4;
  if (isJumping) armSwing = -0.8;
  ctx.rotate(armSwing);
  ctx.fillStyle = secondary;
  ctx.fillRect(-size * 0.06, 0, size * 0.12, size * 0.28);
  ctx.strokeRect(-size * 0.06, 0, size * 0.12, size * 0.28);
  // Fist
  ctx.fillStyle = primary;
  ctx.beginPath();
  ctx.arc(0, size * 0.28, size * 0.07, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

export function drawBall(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  id: string,
  primary: string,
  secondary: string,
  rotation: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  const radius = size / 2;
  ctx.lineWidth = Math.max(2, size / 16);
  ctx.strokeStyle = '#000000';

  if (id === 'ball_classic') {
    // Circular body
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Concentric wheel slots
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.65, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Spokes
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(3, size / 12);
    ctx.beginPath();
    ctx.moveTo(-radius, 0);
    ctx.lineTo(radius, 0);
    ctx.moveTo(0, -radius);
    ctx.lineTo(0, radius);
    ctx.stroke();

    // Center cap
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.25, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  } else if (id === 'ball_saw') {
    // Saw blade spikes
    ctx.fillStyle = primary;
    ctx.beginPath();
    const spikes = 12;
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes;
      const dist = i % 2 === 0 ? radius : radius * 0.6;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner core
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.45, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  } else if (id === 'ball_target') {
    // Bullseye targets / concentric circles
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.75, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.25, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  } else if (id === 'ball_biohazard') {
    // Circular shell
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // 3 hazard fans
    ctx.fillStyle = secondary;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const startAngle = (i * 2 * Math.PI) / 3 - 0.4;
      const endAngle = (i * 2 * Math.PI) / 3 + 0.4;
      ctx.arc(0, 0, radius * 0.85, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Center circle
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.15, 0, 2 * Math.PI);
    ctx.fill();
  } else if (id === 'ball_turbine') {
    // Turbine wheel
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Turbine blades curved
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(2, size / 14);
    ctx.fillStyle = secondary;
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(radius * 0.5, -radius * 0.2, radius * 0.95, -radius * 0.15);
      ctx.lineTo(radius * 0.85, radius * 0.2);
      ctx.quadraticCurveTo(radius * 0.4, radius * 0.1, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Small center core
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.25, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  } else if (id === 'ball_yinyang') {
    // Yin yang symbol wheel
    ctx.fillStyle = primary; // acts as white
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Dark side
    ctx.fillStyle = secondary; // acts as dark
    ctx.beginPath();
    ctx.arc(0, 0, radius, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    ctx.stroke();

    // Draw inner loops
    ctx.beginPath();
    ctx.arc(0, radius * 0.5, radius * 0.5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, -radius * 0.5, radius * 0.5, 0, 2 * Math.PI);
    ctx.fill();

    // Small dots
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, radius * 0.5, radius * 0.15, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.arc(0, -radius * 0.5, radius * 0.15, 0, 2 * Math.PI);
    ctx.fill();

    // Circle border
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#000000';
    ctx.stroke();
  } else {
    // Elegant fallbacks for the new ball/rueda skins
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = secondary;
    if (id === 'ball_skull') {
      // Skull circle
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.fillRect(-radius * 0.3, -radius * 0.2, radius * 0.2, radius * 0.2);
      ctx.fillRect(radius * 0.1, -radius * 0.2, radius * 0.2, radius * 0.2);
      ctx.fillRect(-radius * 0.15, radius * 0.1, radius * 0.3, radius * 0.15);
    } else if (id === 'ball_star') {
      // Star wheel
      ctx.beginPath();
      const points = 5;
      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const dist = i % 2 === 0 ? radius * 0.95 : radius * 0.45;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (id === 'ball_atom') {
      // Orbit rings
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 2.5;
      ctx.save();
      for (let i = 0; i < 3; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath(); ctx.ellipse(0, 0, radius * 0.9, radius * 0.25, 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
      ctx.fillStyle = primary;
      ctx.beginPath(); ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (id === 'ball_flower') {
      // Sunflower/Flower petals
      for (let i = 0; i < 8; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 4);
        ctx.beginPath(); ctx.ellipse(radius * 0.5, 0, radius * 0.35, radius * 0.15, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = '#FCD34D';
      ctx.beginPath(); ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (id === 'ball_shield') {
      // Target/shield look
      ctx.fillStyle = secondary;
      ctx.beginPath(); ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = primary;
      ctx.beginPath(); ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = secondary;
      ctx.beginPath(); ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (id === 'ball_vortex') {
      // Swirly vortex
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let theta = 0; theta < Math.PI * 4; theta += 0.1) {
        const r = (theta / (Math.PI * 4)) * radius;
        const x = Math.cos(theta) * r;
        const y = Math.sin(theta) * r;
        if (theta === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (id === 'ball_cookie') {
      // Chocolate chip cookie look
      ctx.fillStyle = '#D97706'; // Golden brown cookie
      ctx.beginPath(); ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // chocolate chips (dark brown circles)
      ctx.fillStyle = '#451A03';
      const chips = [
        { x: -0.3, y: -0.3 }, { x: 0.3, y: -0.2 },
        { x: -0.2, y: 0.3 }, { x: 0.25, y: 0.3 },
        { x: 0, y: 0 }
      ];
      chips.forEach(c => {
        ctx.beginPath(); ctx.arc(c.x * radius, c.y * radius, radius * 0.12, 0, Math.PI * 2); ctx.fill();
      });
    } else if (id === 'ball_spiral') {
      // Swirling spiral stripes
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 5;
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(radius * 0.4, -radius * 0.4, radius * 0.9, 0);
        ctx.stroke();
        ctx.restore();
      }
    } else if (id === 'ball_pokeball') {
      // PokeBall (half red, half white, black division, central button)
      ctx.fillStyle = '#EF4444'; // Red top
      ctx.beginPath(); ctx.arc(0, 0, radius, Math.PI, 0, false); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#FFFFFF'; // White bottom
      ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI, false); ctx.fill(); ctx.stroke();
      // Black dividing bar
      ctx.fillStyle = '#000000';
      ctx.fillRect(-radius, -size * 0.05, size, size * 0.1);
      // Button
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.beginPath(); ctx.arc(0, 0, radius * 0.1, 0, Math.PI * 2); ctx.fill();
    } else if (id === 'ball_gear') {
      // Industrial gear teeth
      ctx.fillStyle = secondary;
      for (let i = 0; i < 10; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 5);
        ctx.fillRect(-size * 0.08, -radius, size * 0.16, size * 0.2);
        ctx.strokeRect(-size * 0.08, -radius, size * 0.16, size * 0.2);
        ctx.restore();
      }
      ctx.fillStyle = primary;
      ctx.beginPath(); ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = secondary;
      ctx.beginPath(); ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-radius, 0); ctx.lineTo(radius, 0);
      ctx.moveTo(0, -radius); ctx.lineTo(0, radius);
      ctx.stroke();
    }
  }

  ctx.restore();
}
