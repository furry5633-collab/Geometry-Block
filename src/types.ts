/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Gamemode = 'cube' | 'wave' | 'robot' | 'ball';

export type ElementType =
  | 'block'          // Solid square block
  | 'spike'          // Deadly spike
  | 'slope_r'        // Slope going up-right (45 degrees)
  | 'slope_l'        // Slope going down-right (45 degrees)
  | 'portal_cube'    // Portal to change to Cube mode (Green)
  | 'portal_wave'    // Portal to change to Wave mode (Cyan)
  | 'portal_robot'   // Portal to change to Robot mode (Bronze/Orange)
  | 'portal_ball'    // Portal to change to Ball/Rueda mode (Magenta)
  | 'ring_yellow'    // Jump ring (yellow, tap in mid-air to jump)
  | 'pad_yellow'     // Jump pad (yellow, auto jump on contact)
  | 'speed_1x'       // Speed normal (yellow/orange arrow)
  | 'speed_2x'       // Speed fast (green arrows)
  | 'speed_3x'       // Speed super fast (cyan triple arrows)
  | 'spike_inverted' // Inverted ceiling spike (deadly)
  | 'spike_small'    // Smaller, easier spike (deadly)
  | 'fake_block'     // Pass-through block with no collision
  | 'pad_red'        // Red mega jump pad (high launch)
  | 'ring_red'       // Red mega jump ring (high mid-air jump)
  | 'ring_blue'      // Blue gravity swap ring (tap in mid-air to reverse gravity)
  | 'pad_blue'       // Blue gravity swap pad (swaps gravity on contact)
  | 'sawblade'       // Deadly spinning saw obstacle
  | 'coin';          // Golden secret coin to collect

export interface LevelElement {
  id: string;
  x: number; // grid coordinate X
  y: number; // grid coordinate Y
  type: ElementType;
}

export type Difficulty = 'na' | 'easy' | 'normal' | 'hard' | 'harder' | 'insane' | 'demon' | 'auto';

export interface Comment {
  username: string;
  text: string;
  date: string;
}

export interface Level {
  id: string;
  name: string;
  difficulty: Difficulty;
  elements: LevelElement[];
  isCustom?: boolean;
  musicTrack?: string;
  author?: string;
  downloads?: number;
  likes?: number;
  dislikes?: number;
  lengthLabel?: 'Tiny' | 'Short' | 'Medium' | 'Long' | 'XL' | 'Plat.';
  starsReward?: number;
  orbsReward?: number;
  normalProgress?: number;
  practiceProgress?: number;
  uploadedAt?: string;
  comments?: Comment[];
}

export interface PlayerSkins {
  cube: string;      // ID of equipped cube skin
  wave: string;      // ID of equipped wave skin
  robot: string;     // ID of equipped robot skin
  ball: string;      // ID of equipped ball skin
  primaryColor: string;   // Hex color
  secondaryColor: string; // Hex color
}

export interface SkinOption {
  id: string;
  name: string;
  svgPath: string; // Draw inside custom viewport
}
