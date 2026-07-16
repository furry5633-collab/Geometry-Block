/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Level, LevelElement, Difficulty } from './types';

export const TILE_SIZE = 40;
export const GROUND_Y_PIXELS = 400;

// Convert grid coordinates to pixel coordinates
export function gridToX(gridX: number): number {
  return gridX * TILE_SIZE;
}

export function gridToY(gridY: number): number {
  return GROUND_Y_PIXELS - (gridY + 1) * TILE_SIZE;
}

// Default pre-designed levels to play immediately - Sorted by ascending difficulty
export const DEFAULT_LEVELS: Level[] = [
  {
    id: 'online_retray',
    name: 'Retray',
    difficulty: 'easy',
    musicTrack: 'track_stereo',
    author: 'Viprin',
    elements: [
      { id: 'o1', x: 8, y: 0, type: 'block' },
      { id: 'o2', x: 12, y: 0, type: 'spike_small' },
      { id: 'o3', x: 16, y: 0, type: 'block' },
      { id: 'o4', x: 17, y: 1, type: 'block' },
      { id: 'o5', x: 22, y: 0, type: 'pad_yellow' },
      { id: 'o6', x: 27, y: 3, type: 'portal_wave' },
      { id: 'o7', x: 33, y: 0, type: 'spike_small' },
      { id: 'o8', x: 38, y: 5, type: 'spike_small' },
      { id: 'o9', x: 44, y: 0, type: 'portal_cube' },
      { id: 'o10', x: 49, y: 0, type: 'spike_small' },
    ]
  },
  {
    id: 'stereo_madness',
    name: 'Stereo Madness',
    difficulty: 'easy',
    musicTrack: 'track_stereo',
    elements: [
      // Introductory jumping cubes
      { id: '1', x: 10, y: 0, type: 'block' },
      { id: '2', x: 14, y: 0, type: 'spike_small' },
      { id: '3', x: 18, y: 0, type: 'block' },
      { id: '4', x: 19, y: 1, type: 'block' },
      { id: '5', x: 20, y: 2, type: 'block' },
      
      // Basic jump pads
      { id: '6', x: 25, y: 0, type: 'pad_yellow' },
      { id: '7', x: 32, y: 0, type: 'spike_small' }, // Moved to 32 so landing at 30 is safe!
      
      // Ship transition (simulated via Wave mode)
      { id: '8', x: 37, y: 0, type: 'portal_wave' },
      { id: '9', x: 43, y: 4, type: 'spike_small' },
      { id: '10', x: 47, y: 1, type: 'spike_small' },
      { id: '11', x: 51, y: 5, type: 'spike_small' },
      
      // Back to cube
      { id: '12', x: 56, y: 0, type: 'portal_cube' },
      { id: '13', x: 61, y: 0, type: 'spike_small' },
      { id: '14', x: 65, y: 0, type: 'spike_small' },
      { id: '15', x: 70, y: 1, type: 'block' },
      { id: '16', x: 73, y: 2, type: 'ring_yellow' },
      { id: '17', x: 78, y: 0, type: 'spike_small' },
    ]
  },
  {
    id: 'online_auto_play_area',
    name: 'Auto Play Area',
    difficulty: 'auto',
    musicTrack: 'track_stereo',
    author: 'RobTop',
    elements: [
      { id: 'a1', x: 10, y: 0, type: 'pad_yellow' },
      { id: 'a2', x: 14, y: 1, type: 'pad_yellow' },
      { id: 'a3', x: 18, y: 2, type: 'pad_yellow' },
      { id: 'a4', x: 22, y: 3, type: 'pad_yellow' },
      { id: 'a5', x: 26, y: 4, type: 'pad_yellow' },
      { id: 'a6', x: 31, y: 0, type: 'portal_ball' },
      { id: 'a7', x: 35, y: 4, type: 'pad_yellow' },
      { id: 'a8', x: 41, y: 1, type: 'portal_cube' },
    ]
  },
  {
    id: 'back_on_track',
    name: 'Back On Track',
    difficulty: 'normal',
    musicTrack: 'track_back',
    elements: [
      // Yellow launch pads on columns
      { id: 'bot_b1', x: 12, y: 0, type: 'block' },
      { id: 'bot_b2', x: 13, y: 1, type: 'block' },
      { id: 'bot_p1', x: 13, y: 2, type: 'pad_yellow' },
      
      { id: 'bot_s1', x: 21, y: 0, type: 'spike_small' }, // Moved to 21 so landing is safe!
      
      // Floating platforms
      { id: 'bot_f1', x: 26, y: 2, type: 'block' },
      { id: 'bot_f2', x: 27, y: 2, type: 'block' },
      { id: 'bot_f3', x: 28, y: 2, type: 'block' },
      { id: 'bot_s2', x: 27, y: 3, type: 'spike_small' },
      
      // High jumps
      { id: 'bot_p2', x: 34, y: 0, type: 'pad_yellow' },
      { id: 'bot_s3', x: 41, y: 0, type: 'spike_small' }, // Moved to 41 for safe landing
      
      // Robot mode portal sequence
      { id: 'bot_pr1', x: 46, y: 0, type: 'portal_robot' },
      { id: 'bot_rb1', x: 52, y: 0, type: 'spike_small' },
      { id: 'bot_rb2', x: 55, y: 2, type: 'block' },
      { id: 'bot_rb3', x: 59, y: 0, type: 'spike_small' },
      
      // Return to Cube
      { id: 'bot_pc1', x: 65, y: 0, type: 'portal_cube' },
      { id: 'bot_s4', x: 70, y: 0, type: 'spike_small' },
      { id: 'bot_s5', x: 74, y: 0, type: 'spike_small' },
    ]
  },
  {
    id: 'dry_out',
    name: 'Dry Out',
    difficulty: 'normal',
    musicTrack: 'track_dry',
    elements: [
      { id: 'dry_b1', x: 8, y: 0, type: 'spike_small' },
      { id: 'dry_b2', x: 13, y: 1, type: 'block' },
      { id: 'dry_b3', x: 16, y: 2, type: 'block' },
      { id: 'dry_p1', x: 22, y: 0, type: 'portal_ball' },
      
      // Ball mode gravity flips
      { id: 'dry_s1', x: 28, y: 0, type: 'spike_small' },
      { id: 'dry_s2', x: 32, y: 5, type: 'spike_inverted' },
      { id: 'dry_s3', x: 36, y: 0, type: 'spike_small' },
      { id: 'dry_s4', x: 40, y: 5, type: 'spike_inverted' },
      
      // Return to Cube
      { id: 'dry_p2', x: 46, y: 0, type: 'portal_cube' },
      { id: 'dry_s5', x: 51, y: 0, type: 'spike_small' },
      { id: 'dry_s6', x: 55, y: 0, type: 'spike_small' },
      
      // High jump pad finish
      { id: 'dry_pd1', x: 61, y: 0, type: 'pad_red' },
      { id: 'dry_fb1', x: 67, y: 4, type: 'block' },
      { id: 'dry_s8', x: 73, y: 0, type: 'spike_small' },
    ]
  },
  {
    id: 'base_after_base',
    name: 'Base After Base',
    difficulty: 'hard',
    musicTrack: 'track_dry',
    elements: [
      // Ramps & Blocks jumps
      { id: 'bab_sl1', x: 8, y: 0, type: 'slope_r' },
      { id: 'bab_b1', x: 9, y: 1, type: 'block' },
      { id: 'bab_b2', x: 10, y: 1, type: 'block' },
      { id: 'bab_sl2', x: 11, y: 0, type: 'slope_l' },
      
      { id: 'bab_sp1', x: 16, y: 0, type: 'spike_small' },
      
      // Floating columns with orbs
      { id: 'bab_b3', x: 22, y: 1, type: 'block' },
      { id: 'bab_r1', x: 22, y: 2, type: 'ring_yellow' },
      { id: 'bab_b4', x: 27, y: 2, type: 'block' },
      { id: 'bab_r2', x: 27, y: 3, type: 'ring_yellow' },
      
      // Speed modifier
      { id: 'bab_spd', x: 33, y: 0, type: 'speed_2x' },
      { id: 'bab_sp2', x: 39, y: 0, type: 'spike_small' },
      { id: 'bab_sp3', x: 43, y: 0, type: 'spike_small' },
      
      // Robot sequence
      { id: 'bab_p1', x: 48, y: 0, type: 'portal_robot' },
      { id: 'bab_rb1', x: 54, y: 1, type: 'block' },
      { id: 'bab_rb2', x: 58, y: 3, type: 'block' },
      { id: 'bab_rsp1', x: 63, y: 0, type: 'spike_small' },
      
      // Finish
      { id: 'bab_p2', x: 68, y: 0, type: 'portal_cube' },
      { id: 'bab_sp4', x: 73, y: 0, type: 'spike_small' },
    ]
  },
  {
    id: 'blast_processing',
    name: 'Blast Processing',
    difficulty: 'hard',
    musicTrack: 'track_blast',
    elements: [
      // Introduce wave mode portals & diamond waves
      { id: 'bp_b1', x: 10, y: 0, type: 'block' },
      { id: 'bp_s1', x: 14, y: 0, type: 'spike_small' },
      
      // Speed up to 2x
      { id: 'bp_spd1', x: 18, y: 0, type: 'speed_2x' },
      
      // Wave portal!
      { id: 'bp_p1', x: 24, y: 0, type: 'portal_wave' },
      
      // Diagonal obstacle course for Wave (spaced for great reactability!)
      { id: 'bp_w1', x: 30, y: 1, type: 'spike_small' },
      { id: 'bp_w2', x: 34, y: 5, type: 'spike_small' },
      { id: 'bp_w3', x: 38, y: 1, type: 'spike_small' },
      { id: 'bp_w4', x: 42, y: 5, type: 'spike_small' },
      
      // Multi-speed waves
      { id: 'bp_spd2', x: 47, y: 3, type: 'speed_3x' },
      { id: 'bp_w5', x: 52, y: 1, type: 'spike_small' },
      { id: 'bp_w6', x: 56, y: 6, type: 'spike_small' },
      
      // Return to Cube
      { id: 'bp_p2', x: 61, y: 1, type: 'portal_cube' },
      { id: 'bp_spd3', x: 65, y: 0, type: 'speed_1x' },
      { id: 'bp_s2', x: 70, y: 0, type: 'spike_small' },
      { id: 'bp_s3', x: 73, y: 0, type: 'spike_small' },
    ]
  },
  {
    id: 'online_dark_paradise',
    name: 'Dark Paradise',
    difficulty: 'harder',
    musicTrack: 'track_theory',
    author: 'MapPacker',
    elements: [
      { id: 'dp1', x: 8, y: 0, type: 'block' },
      { id: 'dp2', x: 12, y: 0, type: 'spike_small' },
      { id: 'dp3', x: 16, y: 1, type: 'block' },
      { id: 'dp4', x: 17, y: 1, type: 'block' },
      { id: 'dp5', x: 23, y: 0, type: 'spike_small' },
      { id: 'dp6', x: 27, y: 2, type: 'portal_ball' },
      { id: 'dp7', x: 33, y: 0, type: 'spike_small' },
      { id: 'dp8', x: 37, y: 5, type: 'spike_inverted' },
      { id: 'dp9', x: 42, y: 1, type: 'portal_cube' },
    ]
  },
  {
    id: 'theory_of_everything',
    name: 'Theory of Everything',
    difficulty: 'harder',
    musicTrack: 'track_theory',
    elements: [
      // Fast paced jumps and pads
      { id: 'toe_s1', x: 10, y: 0, type: 'spike_small' },
      { id: 'toe_pd1', x: 14, y: 0, type: 'pad_yellow' },
      { id: 'toe_b1', x: 20, y: 3, type: 'block' }, // Moved to 20 for safe landing
      { id: 'toe_s2', x: 24, y: 0, type: 'spike_small' },
      
      // Robot mode jumping section
      { id: 'toe_p1', x: 28, y: 0, type: 'portal_robot' },
      { id: 'toe_rb1', x: 33, y: 0, type: 'spike_small' },
      { id: 'toe_rb2', x: 37, y: 2, type: 'block' },
      { id: 'toe_rb3', x: 41, y: 0, type: 'spike_small' },
      { id: 'toe_rb4', x: 45, y: 4, type: 'block' },
      
      // Ball mode swap sequence
      { id: 'toe_p2', x: 50, y: 2, type: 'portal_ball' },
      { id: 'toe_bl1', x: 55, y: 0, type: 'spike_small' },
      { id: 'toe_bl2', x: 59, y: 5, type: 'spike_inverted' },
      
      // Hyper Wave speed corridor!
      { id: 'toe_p3', x: 64, y: 2, type: 'portal_wave' },
      { id: 'toe_spd3', x: 68, y: 2, type: 'speed_3x' },
      { id: 'toe_wsp1', x: 73, y: 5, type: 'spike_small' },
      { id: 'toe_wsp2', x: 77, y: 1, type: 'spike_small' },
      { id: 'toe_wsp3', x: 81, y: 6, type: 'spike_small' },
      { id: 'toe_wsp4', x: 85, y: 2, type: 'spike_small' },
      
      // Transition back to Cube
      { id: 'toe_p4', x: 91, y: 2, type: 'portal_cube' },
      { id: 'toe_spd1', x: 95, y: 0, type: 'speed_1x' },
      
      // Final hard orb jumping sequence
      { id: 'toe_rng1', x: 100, y: 2, type: 'ring_yellow' },
      { id: 'toe_fbl1', x: 102, y: 1, type: 'block' },
      { id: 'toe_rng2', x: 106, y: 3, type: 'ring_yellow' },
      { id: 'toe_fbl2', x: 108, y: 2, type: 'block' },
      
      // Final spike
      { id: 'toe_fsp2', x: 114, y: 0, type: 'spike_small' },
    ]
  },
  {
    id: 'online_theory_of_every_3',
    name: 'Theory of Everything 3',
    difficulty: 'insane',
    musicTrack: 'track_theory',
    author: 'Viprin',
    elements: [
      { id: 'toe1', x: 10, y: 0, type: 'block' },
      { id: 'toe2', x: 14, y: 0, type: 'pad_yellow' },
      { id: 'toe3', x: 20, y: 3, type: 'portal_robot' },
      { id: 'toe4', x: 25, y: 0, type: 'spike_small' },
      { id: 'toe5', x: 28, y: 0, type: 'spike_small' },
      { id: 'toe6', x: 32, y: 2, type: 'portal_ball' },
      { id: 'toe7', x: 38, y: 0, type: 'spike_small' },
      { id: 'toe8', x: 42, y: 5, type: 'spike_inverted' },
      { id: 'toe9', x: 47, y: 0, type: 'portal_cube' },
    ]
  },
  {
    id: 'online_the_nightmare',
    name: 'The Nightmare',
    difficulty: 'demon',
    musicTrack: 'track_dry',
    author: 'Jax',
    elements: [
      { id: 'n1', x: 6, y: 0, type: 'speed_2x' },
      { id: 'n2', x: 10, y: 0, type: 'spike_small' },
      { id: 'n3', x: 13, y: 0, type: 'spike_small' },
      { id: 'n4', x: 16, y: 0, type: 'block' },
      { id: 'n5', x: 17, y: 1, type: 'block' },
      { id: 'n6', x: 18, y: 2, type: 'block' },
      { id: 'n7', x: 23, y: 0, type: 'ring_yellow' },
      { id: 'n10', x: 27, y: 1, type: 'portal_ball' },
      { id: 'n11', x: 33, y: 0, type: 'spike_small' },
      { id: 'n12', x: 37, y: 5, type: 'spike_inverted' },
      { id: 'n13', x: 42, y: 0, type: 'portal_robot' },
      { id: 'n14', x: 48, y: 0, type: 'spike_small' },
      { id: 'n15', x: 51, y: 0, type: 'spike_small' },
      { id: 'n17', x: 56, y: 1, type: 'portal_cube' },
    ]
  },
  {
    id: 'online_nine_circles',
    name: 'Nine Circles',
    difficulty: 'demon',
    musicTrack: 'track_blast',
    author: 'Zobros',
    elements: [
      { id: 'nc1', x: 10, y: 0, type: 'speed_3x' },
      { id: 'nc2', x: 14, y: 1, type: 'portal_wave' },
      { id: 'nc3', x: 20, y: 6, type: 'block' },
      { id: 'nc4', x: 22, y: 0, type: 'block' },
      { id: 'nc5', x: 27, y: 5, type: 'spike_small' },
      { id: 'nc6', x: 31, y: 1, type: 'spike_small' },
      { id: 'nc7', x: 35, y: 5, type: 'spike_small' },
      { id: 'nc8', x: 40, y: 1, type: 'portal_cube' },
      { id: 'nc9', x: 46, y: 0, type: 'spike_small' },
    ]
  },
  {
    id: 'online_sonic_wave',
    name: 'Sonic Wave',
    difficulty: 'demon',
    musicTrack: 'track_blast',
    author: 'L_fr',
    elements: [
      { id: 'sw1', x: 8, y: 0, type: 'speed_3x' },
      { id: 'sw2', x: 14, y: 3, type: 'portal_wave' },
      { id: 'sw3', x: 20, y: 6, type: 'spike_small' },
      { id: 'sw4', x: 24, y: 1, type: 'spike_small' },
      { id: 'sw5', x: 28, y: 6, type: 'spike_small' },
      { id: 'sw6', x: 32, y: 0, type: 'spike_small' },
      { id: 'sw7', x: 36, y: 5, type: 'spike_small' },
      { id: 'sw8', x: 40, y: 1, type: 'spike_small' },
      { id: 'sw9', x: 44, y: 6, type: 'spike_small' },
      { id: 'sw10', x: 49, y: 1, type: 'portal_cube' },
    ]
  }
];

// LocalStorage helpers for custom levels
const STORAGE_KEY = 'geometry_dash_custom_levels';
const ONLINE_STORAGE_KEY = 'geometry_dash_online_levels';
const PROGRESS_STORAGE_KEY = 'geometry_dash_level_progress';

export function getCustomLevels(): Level[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse custom levels:', e);
    return [];
  }
}

export function saveCustomLevel(level: Level): void {
  const levels = getCustomLevels();
  const existingIndex = levels.findIndex(l => l.id === level.id);
  if (existingIndex >= 0) {
    levels[existingIndex] = level;
  } else {
    levels.push(level);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
}

export function deleteCustomLevel(levelId: string): void {
  const levels = getCustomLevels();
  const filtered = levels.filter(l => l.id !== levelId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// PRELOADED HIGH-QUALITY SIMULATED ONLINE COMMUNITY LEVELS
const INITIAL_ONLINE_LEVELS: Level[] = [];

export function getOnlineSharedLevels(): Level[] {
  try {
    const data = localStorage.getItem(ONLINE_STORAGE_KEY);
    if (!data) {
      // Initialize with default community levels
      localStorage.setItem(ONLINE_STORAGE_KEY, JSON.stringify(INITIAL_ONLINE_LEVELS));
      return INITIAL_ONLINE_LEVELS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse online levels:', e);
    return INITIAL_ONLINE_LEVELS;
  }
}

export function saveOnlineSharedLevel(level: Level): void {
  const levels = getOnlineSharedLevels();
  const existingIndex = levels.findIndex(l => l.id === level.id);
  if (existingIndex >= 0) {
    levels[existingIndex] = level;
  } else {
    levels.push(level);
  }
  localStorage.setItem(ONLINE_STORAGE_KEY, JSON.stringify(levels));
}

export function uploadCustomLevelToOnline(level: Level, authorName: string): Level {
  const levels = getOnlineSharedLevels();
  
  const starsMap: Record<Difficulty, number> = {
    na: 0,
    easy: 2,
    normal: 3,
    hard: 5,
    harder: 7,
    insane: 9,
    demon: 10,
    auto: 1
  };
  
  const orbsMap: Record<Difficulty, number> = {
    na: 0,
    easy: 50,
    normal: 100,
    hard: 175,
    harder: 250,
    insane: 350,
    demon: 500,
    auto: 25
  };

  const onlineLevel: Level = {
    ...level,
    id: `shared_${level.id}_${Date.now()}`,
    isCustom: true,
    author: authorName || 'Un Jugador',
    downloads: 1, // start with 1 download (the uploader)
    likes: 0,
    dislikes: 0,
    lengthLabel: level.elements.length < 15 ? 'Tiny' : level.elements.length < 35 ? 'Short' : level.elements.length < 60 ? 'Medium' : level.elements.length < 90 ? 'Long' : 'XL',
    starsReward: starsMap[level.difficulty] || 0,
    orbsReward: orbsMap[level.difficulty] || 0,
    uploadedAt: new Date().toISOString().split('T')[0],
    comments: [
      { username: 'System', text: '¡Nivel subido con éxito a los servidores de Geometry Dash!', date: new Date().toISOString().split('T')[0] }
    ]
  };

  levels.unshift(onlineLevel); // push to top of list
  localStorage.setItem(ONLINE_STORAGE_KEY, JSON.stringify(levels));
  return onlineLevel;
}

export function likeOnlineLevel(id: string, isLike: boolean): Level | null {
  const levels = getOnlineSharedLevels();
  const idx = levels.findIndex(l => l.id === id);
  if (idx < 0) return null;

  const lvl = levels[idx];
  if (isLike) {
    lvl.likes = (lvl.likes || 0) + 1;
  } else {
    lvl.dislikes = (lvl.dislikes || 0) + 1;
  }
  
  levels[idx] = lvl;
  localStorage.setItem(ONLINE_STORAGE_KEY, JSON.stringify(levels));
  return lvl;
}

export function downloadOnlineLevel(id: string): Level | null {
  const levels = getOnlineSharedLevels();
  const idx = levels.findIndex(l => l.id === id);
  if (idx < 0) return null;

  const lvl = levels[idx];
  lvl.downloads = (lvl.downloads || 0) + 1;
  levels[idx] = lvl;
  localStorage.setItem(ONLINE_STORAGE_KEY, JSON.stringify(levels));

  // Also save it locally in custom levels so they can play it!
  const customLevels = getCustomLevels();
  if (!customLevels.some(cl => cl.id === lvl.id)) {
    customLevels.push({
      ...lvl,
      isCustom: true // Treat it as custom so they can play it from their menu too
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customLevels));
  }

  return lvl;
}

export function addOnlineComment(id: string, username: string, text: string): Level | null {
  const levels = getOnlineSharedLevels();
  const idx = levels.findIndex(l => l.id === id);
  if (idx < 0) return null;

  const lvl = levels[idx];
  if (!lvl.comments) lvl.comments = [];
  lvl.comments.push({
    username: username || 'Anónimo',
    text,
    date: new Date().toISOString().split('T')[0]
  });

  levels[idx] = lvl;
  localStorage.setItem(ONLINE_STORAGE_KEY, JSON.stringify(levels));
  return lvl;
}

// LEVEL PROGRESS SYSTEM - SAVING BEST SCORE / ATTEMPTS
export interface ProgressData {
  normalProgress: number;
  practiceProgress: number;
  completed: boolean;
  attemptsCount: number;
}

export function getLevelProgress(levelId: string): ProgressData {
  try {
    const data = localStorage.getItem(PROGRESS_STORAGE_KEY);
    const progressMap = data ? JSON.parse(data) : {};
    return progressMap[levelId] || {
      normalProgress: 0,
      practiceProgress: 0,
      completed: false,
      attemptsCount: 0
    };
  } catch (e) {
    return {
      normalProgress: 0,
      practiceProgress: 0,
      completed: false,
      attemptsCount: 0
    };
  }
}

export function saveLevelProgress(levelId: string, percentage: number, attempts: number, isWon: boolean): ProgressData {
  try {
    const data = localStorage.getItem(PROGRESS_STORAGE_KEY) || '{}';
    const progressMap = JSON.parse(data);
    const existing = progressMap[levelId] || {
      normalProgress: 0,
      practiceProgress: 0,
      completed: false,
      attemptsCount: 0
    };

    existing.normalProgress = Math.max(existing.normalProgress, percentage);
    existing.attemptsCount += attempts;
    if (isWon || percentage >= 100) {
      existing.completed = true;
      existing.normalProgress = 100;
    }

    progressMap[levelId] = existing;
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressMap));
    return existing;
  } catch (e) {
    console.error(e);
    return {
      normalProgress: percentage,
      practiceProgress: 0,
      completed: isWon,
      attemptsCount: attempts
    };
  }
}

export function saveLevelPracticeProgress(levelId: string, percentage: number): ProgressData {
  try {
    const data = localStorage.getItem(PROGRESS_STORAGE_KEY) || '{}';
    const progressMap = JSON.parse(data);
    const existing = progressMap[levelId] || {
      normalProgress: 0,
      practiceProgress: 0,
      completed: false,
      attemptsCount: 0
    };

    existing.practiceProgress = Math.max(existing.practiceProgress, percentage);
    progressMap[levelId] = existing;
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressMap));
    return existing;
  } catch (e) {
    console.error(e);
    return {
      normalProgress: 0,
      practiceProgress: percentage,
      completed: false,
      attemptsCount: 0
    };
  }
}
