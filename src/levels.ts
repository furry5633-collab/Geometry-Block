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

// Default pre-designed levels to play immediately
export const DEFAULT_LEVELS: Level[] = [
  {
    id: 'stereo_madness',
    name: 'Stereo Madness',
    difficulty: 'easy',
    elements: [
      // Introductory jumping cubes
      { id: '1', x: 10, y: 0, type: 'block' },
      { id: '2', x: 14, y: 0, type: 'spike' },
      { id: '3', x: 18, y: 0, type: 'block' },
      { id: '4', x: 19, y: 0, type: 'block' },
      { id: '5', x: 23, y: 0, type: 'spike' },

      // Jump pads introduction (spaced out safely so player has reaction time)
      { id: 'pad1', x: 29, y: 0, type: 'pad_yellow' },
      { id: 'b_pad1', x: 33, y: 1, type: 'block' },
      { id: 'b_pad2', x: 34, y: 1, type: 'block' },
      { id: 'b_pad3', x: 35, y: 1, type: 'block' },
      { id: 'sp1', x: 34, y: 2, type: 'spike' },

      // Ball/Rueda gravity change portal
      { id: 'p_ball', x: 40, y: 2, type: 'portal_ball' },

      // Ball Section with ceiling blocks at y=5 so player walks on blocks
      { id: 'bc_1', x: 44, y: 5, type: 'block' },
      { id: 'bc_2', x: 45, y: 5, type: 'block' },
      { id: 'bc_3', x: 46, y: 5, type: 'block' },
      { id: 'bc_4', x: 47, y: 5, type: 'block' },
      { id: 'bc_5', x: 48, y: 5, type: 'block' },
      { id: 'bc_6', x: 49, y: 5, type: 'block' },
      { id: 'bc_7', x: 50, y: 5, type: 'block' },
      { id: 'bc_8', x: 51, y: 5, type: 'block' },
      { id: 'bc_9', x: 52, y: 5, type: 'block' },
      { id: 'bc_10', x: 53, y: 5, type: 'block' },
      { id: 'bc_11', x: 54, y: 5, type: 'block' },
      { id: 'bc_12', x: 55, y: 5, type: 'block' },
      { id: 'bc_13', x: 56, y: 5, type: 'block' },
      { id: 'bc_14', x: 57, y: 5, type: 'block' },
      { id: 'bc_15', x: 58, y: 5, type: 'block' },
      { id: 'bc_16', x: 59, y: 5, type: 'block' },
      { id: 'bc_17', x: 60, y: 5, type: 'block' },
      { id: 'bc_18', x: 61, y: 5, type: 'block' },
      { id: 'bc_19', x: 62, y: 5, type: 'block' },

      // Alternating floor and ceiling obstacles
      { id: 'bl_floor1', x: 45, y: 0, type: 'spike' },
      { id: 'bl_ceil1', x: 49, y: 4, type: 'spike' }, // ceiling spike below y=5 blocks
      { id: 'bl_floor2', x: 53, y: 0, type: 'spike' },
      { id: 'bl_ceil2', x: 57, y: 4, type: 'spike' },

      // Mid transition platform
      { id: 'b_mid1', x: 61, y: 2, type: 'block' },
      { id: 'b_mid2', x: 62, y: 2, type: 'block' },
      { id: 'sp_mid', x: 62, y: 3, type: 'spike' },

      // Jump rings introduction
      { id: 'p_cube', x: 66, y: 1, type: 'portal_cube' },
      { id: 'ring1', x: 71, y: 2, type: 'ring_yellow' },
      { id: 'sp_pit', x: 71, y: 0, type: 'spike' },
      { id: 'b_land', x: 73, y: 1, type: 'block' },
      { id: 'b_land2', x: 74, y: 1, type: 'block' },
      { id: 'sp_land', x: 74, y: 2, type: 'spike' },

      // Final stretch
      { id: 'b_st1', x: 81, y: 0, type: 'block' },
      { id: 'b_st2', x: 82, y: 1, type: 'block' },
      { id: 'b_st3', x: 83, y: 2, type: 'block' },
      { id: 'sp_final', x: 88, y: 0, type: 'spike' },
      { id: 'b_st4', x: 91, y: 0, type: 'block' },
    ]
  },
  {
    id: 'back_on_track',
    name: 'Back On Track',
    difficulty: 'normal',
    elements: [
      // Speed indicators & Slopes
      { id: 'spd_start', x: 8, y: 0, type: 'speed_2x' },
      { id: 'slp1', x: 12, y: 0, type: 'slope_r' },
      { id: 'bl_slp1', x: 13, y: 0, type: 'block' },
      { id: 'slp2', x: 14, y: 0, type: 'slope_l' },

      // Robot Portal
      { id: 'p_robot', x: 18, y: 1, type: 'portal_robot' },
      // Large jump pits for Robot
      { id: 'spk_pit1', x: 23, y: 0, type: 'spike' },
      { id: 'spk_pit2', x: 24, y: 0, type: 'spike' },
      { id: 'spk_pit3', x: 25, y: 0, type: 'spike' },
      { id: 'b_bot1', x: 27, y: 1, type: 'block' },
      { id: 'b_bot2', x: 28, y: 1, type: 'block' },

      // Super high obstacle requiring sustained jump
      { id: 'spk_pit4', x: 33, y: 0, type: 'spike' },
      { id: 'b_wall1', x: 36, y: 0, type: 'block' },
      { id: 'b_wall2', x: 36, y: 1, type: 'block' },
      { id: 'b_wall3', x: 36, y: 2, type: 'block' }, // 3 blocks high wall! Only Robot hold-jump can scale this!
      { id: 'b_land_bot', x: 37, y: 2, type: 'block' },
      { id: 'b_land_bot2', x: 38, y: 2, type: 'block' },

      // Pads & Rings sequence
      { id: 'pd_bot', x: 44, y: 0, type: 'pad_yellow' },
      { id: 'rng_bot', x: 48, y: 3, type: 'ring_yellow' },
      { id: 'b_hng1', x: 50, y: 4, type: 'block' },
      { id: 'b_hng2', x: 51, y: 4, type: 'block' },
      { id: 'spk_hng', x: 50, y: 0, type: 'spike' },
      { id: 'spk_hng2', x: 51, y: 0, type: 'spike' },

      // Switch to Wave
      { id: 'p_wave_bot', x: 58, y: 3, type: 'portal_wave' },
      { id: 'wv_ceil_spk1', x: 64, y: 5, type: 'spike' },
      { id: 'wv_flr_spk1', x: 67, y: 0, type: 'spike' },
      { id: 'wv_ceil_spk2', x: 70, y: 5, type: 'spike' },

      // Normal speed & transition back
      { id: 'spd_nrm', x: 76, y: 1, type: 'speed_1x' },
      { id: 'p_cube_end', x: 80, y: 1, type: 'portal_cube' },
      { id: 'sp_f1', x: 86, y: 0, type: 'spike' },
      { id: 'sp_f2', x: 89, y: 0, type: 'spike' },
      { id: 'sp_f3', x: 90, y: 0, type: 'spike' },
    ]
  },
  {
    id: 'blast_processing',
    name: 'Blast Processing',
    difficulty: 'hard',
    elements: [
      { id: 'spd_blast', x: 6, y: 0, type: 'speed_2x' },
      // Quick Wave Portal
      { id: 'p_wave_bl', x: 12, y: 1, type: 'portal_wave' },

      // Tight neon wave corridor
      // Ceiling blocks framing a tight tunnel
      { id: 'tun_c1', x: 18, y: 5, type: 'block' },
      { id: 'tun_c2', x: 19, y: 5, type: 'block' },
      { id: 'tun_c3', x: 20, y: 5, type: 'block' },
      { id: 'tun_c4', x: 21, y: 5, type: 'block' },
      { id: 'tun_c5', x: 22, y: 5, type: 'block' },
      { id: 'tun_c6', x: 23, y: 6, type: 'block' },
      { id: 'tun_c7', x: 24, y: 6, type: 'block' },
      { id: 'tun_c8', x: 25, y: 6, type: 'block' },

      // Floor blocks framing the tunnel
      { id: 'tun_f1', x: 18, y: 0, type: 'block' },
      { id: 'tun_f2', x: 19, y: 0, type: 'block' },
      { id: 'tun_f3', x: 20, y: 1, type: 'block' },
      { id: 'tun_f4', x: 21, y: 1, type: 'block' },
      { id: 'tun_f5', x: 22, y: 1, type: 'block' },
      { id: 'tun_f6', x: 23, y: 1, type: 'block' },
      { id: 'tun_f7', x: 24, y: 0, type: 'block' },
      { id: 'tun_f8', x: 25, y: 0, type: 'block' },

      // Spikes inside wave segment
      { id: 'w_sp1', x: 28, y: 2, type: 'spike' },
      { id: 'w_sp2', x: 33, y: 4, type: 'spike' },
      { id: 'w_sp3', x: 37, y: 1, type: 'spike' },

      // Hyper Speed Wave (3x speed!)
      { id: 'spd_blast3', x: 42, y: 2, type: 'speed_3x' },
      { id: 'w_sp4', x: 48, y: 5, type: 'spike' },
      { id: 'w_sp5', x: 51, y: 1, type: 'spike' },
      { id: 'w_sp6', x: 55, y: 6, type: 'spike' },
      { id: 'w_sp7', x: 58, y: 2, type: 'spike' },

      // Transition to Ball/Rueda
      { id: 'p_ball_bl', x: 65, y: 3, type: 'portal_ball' },
      { id: 'bl_c1', x: 70, y: 0, type: 'spike' },
      { id: 'bl_c2', x: 73, y: 5, type: 'spike' },
      { id: 'bl_c3', x: 76, y: 0, type: 'spike' },
      { id: 'bl_c4', x: 79, y: 5, type: 'spike' },

      // Fast robot section
      { id: 'p_bot_bl', x: 84, y: 2, type: 'portal_robot' },
      { id: 'spk_b1', x: 90, y: 0, type: 'spike' },
      { id: 'spk_b2', x: 91, y: 0, type: 'spike' },
      { id: 'spk_b3', x: 92, y: 0, type: 'spike' },
      { id: 'b_f1', x: 94, y: 1, type: 'block' },
      { id: 'b_f2', x: 95, y: 2, type: 'block' },
      { id: 'b_f3', x: 96, y: 3, type: 'block' },
      { id: 'spk_b4', x: 96, y: 4, type: 'spike' }, // spike on top of block!

      // Final dash
      { id: 'p_cube_bl', x: 102, y: 2, type: 'portal_cube' },
      { id: 'sp_end1', x: 108, y: 0, type: 'spike' },
      { id: 'sp_end2', x: 111, y: 0, type: 'spike' },
    ]
  },
  {
    id: 'dry_out',
    name: 'Dry Out',
    difficulty: 'normal',
    starsReward: 4,
    orbsReward: 125,
    elements: [
      // Dry Out focuses on verticality and jumping over long block structures
      { id: 'do1', x: 10, y: 0, type: 'block' },
      { id: 'do2', x: 12, y: 0, type: 'spike' },
      { id: 'do3', x: 15, y: 0, type: 'block' },
      { id: 'do4', x: 16, y: 1, type: 'block' },
      { id: 'do5', x: 17, y: 2, type: 'block' },
      { id: 'do6', x: 18, y: 2, type: 'spike' },
      
      // Speed indicators
      { id: 'do_speed', x: 22, y: 0, type: 'speed_2x' },
      
      // Portal to Ball
      { id: 'do_p1', x: 27, y: 1, type: 'portal_ball' },
      { id: 'do_bc1', x: 31, y: 0, type: 'spike' },
      { id: 'do_bc2', x: 34, y: 5, type: 'spike' },
      { id: 'do_bc3', x: 38, y: 0, type: 'spike' },
      { id: 'do_bc4', x: 41, y: 5, type: 'spike' },
      
      // Platform segment for ball
      { id: 'do_bp1', x: 45, y: 2, type: 'block' },
      { id: 'do_bp2', x: 46, y: 2, type: 'block' },
      { id: 'do_bp3', x: 47, y: 2, type: 'block' },
      { id: 'do_bs1', x: 46, y: 3, type: 'spike' },
      
      // Portal back to Cube
      { id: 'do_p2', x: 52, y: 1, type: 'portal_cube' },
      { id: 'do_speed_n', x: 55, y: 0, type: 'speed_1x' },
      
      // Inverted gravity ring sequences
      { id: 'do_rng1', x: 60, y: 2, type: 'ring_yellow' },
      { id: 'do_spk1', x: 60, y: 0, type: 'spike' },
      { id: 'do_bl1', x: 62, y: 2, type: 'block' },
      { id: 'do_bl2', x: 63, y: 2, type: 'block' },
      
      // Yellow pad boost
      { id: 'do_pad1', x: 68, y: 0, type: 'pad_yellow' },
      { id: 'do_bl3', x: 71, y: 3, type: 'block' },
      { id: 'do_bl4', x: 72, y: 3, type: 'block' },
      { id: 'do_spk2', x: 72, y: 4, type: 'spike' },
      
      // End dash
      { id: 'do_end_sp1', x: 80, y: 0, type: 'spike' },
      { id: 'do_end_sp2', x: 83, y: 0, type: 'spike' },
    ]
  },
  {
    id: 'base_after_base',
    name: 'Base After Base',
    difficulty: 'hard',
    starsReward: 5,
    orbsReward: 150,
    elements: [
      // Hard jumps, introduction to triple spikes and long speedruns
      { id: 'bab1', x: 8, y: 0, type: 'block' },
      { id: 'bab2', x: 12, y: 0, type: 'spike' },
      { id: 'bab3', x: 13, y: 0, type: 'spike' }, // double spikes!
      
      // Slope slide section
      { id: 'bab_slp1', x: 18, y: 0, type: 'slope_r' },
      { id: 'bab_bl1', x: 19, y: 0, type: 'block' },
      { id: 'bab_slp2', x: 20, y: 0, type: 'slope_l' },
      { id: 'bab_spk1', x: 24, y: 0, type: 'spike' },
      
      // Wave segment introduction
      { id: 'bab_p1', x: 28, y: 2, type: 'portal_wave' },
      { id: 'bab_wv_s1', x: 33, y: 4, type: 'spike' },
      { id: 'bab_wv_s2', x: 37, y: 1, type: 'spike' },
      { id: 'bab_wv_s3', x: 41, y: 5, type: 'spike' },
      { id: 'bab_wv_s4', x: 45, y: 1, type: 'spike' },
      
      // Speed 3x boost in wave mode!
      { id: 'bab_spd3', x: 50, y: 2, type: 'speed_3x' },
      { id: 'bab_wv_s5', x: 55, y: 5, type: 'spike' },
      { id: 'bab_wv_s6', x: 58, y: 1, type: 'spike' },
      
      // Portal back to Cube
      { id: 'bab_p2', x: 64, y: 2, type: 'portal_cube' },
      { id: 'bab_spd1', x: 67, y: 0, type: 'speed_1x' },
      
      // Triple spike challenge!
      { id: 'bab_ts1', x: 73, y: 0, type: 'spike' },
      { id: 'bab_ts2', x: 74, y: 0, type: 'spike' },
      { id: 'bab_ts3', x: 75, y: 0, type: 'spike' }, // TRIPLE SPIKE!
      
      // Upper layout path
      { id: 'bab_ub1', x: 78, y: 2, type: 'block' },
      { id: 'bab_ub2', x: 79, y: 2, type: 'block' },
      { id: 'bab_ub3', x: 80, y: 2, type: 'block' },
      { id: 'bab_ubsp', x: 79, y: 3, type: 'spike' },
      
      // Ring jump out
      { id: 'bab_rng', x: 84, y: 2, type: 'ring_yellow' },
      { id: 'bab_end_sp', x: 89, y: 0, type: 'spike' },
    ]
  },
  {
    id: 'theory_of_everything',
    name: 'Theory of Everything',
    difficulty: 'harder',
    starsReward: 8,
    orbsReward: 250,
    elements: [
      // Highly dynamic, switching vehicle modes rapidly
      { id: 'toe_s1', x: 10, y: 0, type: 'speed_2x' },
      { id: 'toe_sp1', x: 14, y: 0, type: 'spike' },
      
      // Robot Section with high walls to climb
      { id: 'toe_p1', x: 18, y: 1, type: 'portal_robot' },
      { id: 'toe_wall1', x: 23, y: 0, type: 'block' },
      { id: 'toe_wall2', x: 23, y: 1, type: 'block' }, // 2 blocks high
      { id: 'toe_wall3', x: 27, y: 0, type: 'block' },
      { id: 'toe_wall4', x: 27, y: 1, type: 'block' },
      { id: 'toe_wall5', x: 27, y: 2, type: 'block' }, // 3 blocks high! Requires sustained hold-jump
      
      // Spike pitfalls
      { id: 'toe_rsp1', x: 31, y: 0, type: 'spike' },
      { id: 'toe_rsp2', x: 32, y: 0, type: 'spike' },
      { id: 'toe_rbl1', x: 34, y: 1, type: 'block' },
      { id: 'toe_rbl2', x: 35, y: 1, type: 'block' },
      
      // Ball gravity switches
      { id: 'toe_p2', x: 40, y: 2, type: 'portal_ball' },
      { id: 'toe_bsp1', x: 44, y: 0, type: 'spike' },
      { id: 'toe_bsp2', x: 47, y: 5, type: 'spike' },
      { id: 'toe_bbl1', x: 50, y: 2, type: 'block' },
      { id: 'toe_bbl2', x: 51, y: 2, type: 'block' },
      { id: 'toe_bsp3', x: 51, y: 3, type: 'spike' },
      
      // Hyper Wave speed corridor!
      { id: 'toe_p3', x: 56, y: 2, type: 'portal_wave' },
      { id: 'toe_spd3', x: 59, y: 2, type: 'speed_3x' },
      { id: 'toe_wsp1', x: 63, y: 5, type: 'spike' },
      { id: 'toe_wsp2', x: 66, y: 1, type: 'spike' },
      { id: 'toe_wsp3', x: 69, y: 6, type: 'spike' },
      { id: 'toe_wsp4', x: 72, y: 2, type: 'spike' },
      
      // Transition back to Cube
      { id: 'toe_p4', x: 78, y: 2, type: 'portal_cube' },
      { id: 'toe_spd1', x: 81, y: 0, type: 'speed_1x' },
      
      // Final hard orb jumping sequence
      { id: 'toe_rng1', x: 86, y: 2, type: 'ring_yellow' },
      { id: 'toe_fbl1', x: 88, y: 1, type: 'block' },
      { id: 'toe_rng2', x: 92, y: 3, type: 'ring_yellow' },
      { id: 'toe_fbl2', x: 94, y: 2, type: 'block' },
      
      // Final triple spikes
      { id: 'toe_fsp1', x: 99, y: 0, type: 'spike' },
      { id: 'toe_fsp2', x: 100, y: 0, type: 'spike' },
      { id: 'toe_fsp3', x: 101, y: 0, type: 'spike' },
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
const INITIAL_ONLINE_LEVELS: Level[] = [
  {
    id: "shared_custom_1783895647750_1783896055990",
    name: "Sinfonia",
    difficulty: "normal",
    elements: [
      { id: "custom_1783895661448_nm9r", x: 12, y: 0, type: "spike" },
      { id: "custom_1783895665181_p8tf", x: 21, y: 0, type: "spike" },
      { id: "custom_1783895674918_7kar", x: 33, y: 0, type: "portal_robot" },
      { id: "custom_1783895679172_f6e8", x: 44, y: 0, type: "spike" },
      { id: "custom_1783895679859_1vo9", x: 45, y: 0, type: "spike" },
      { id: "custom_1783895685914_ya9w", x: 52, y: 0, type: "spike" },
      { id: "custom_1783895686328_c370", x: 54, y: 0, type: "spike" },
      { id: "custom_1783895687569_ztsg", x: 53, y: 0, type: "spike" },
      { id: "custom_1783895690734_4984", x: 62, y: 0, type: "spike" },
      { id: "custom_1783895702855_ctvy", x: 75, y: 3, type: "portal_wave" },
      { id: "custom_1783895717961_ka3y", x: 86, y: 7, type: "block" },
      { id: "custom_1783895719097_stc8", x: 87, y: 6, type: "block" },
      { id: "custom_1783895719683_rm29", x: 88, y: 5, type: "block" },
      { id: "custom_1783895720345_k7d2", x: 89, y: 4, type: "block" },
      { id: "custom_1783895721854_i3di", x: 90, y: 5, type: "block" },
      { id: "custom_1783895722540_qrmu", x: 91, y: 6, type: "block" },
      { id: "custom_1783895723194_fqkc", x: 92, y: 7, type: "block" },
      { id: "custom_1783895724059_lv3z", x: 91, y: 7, type: "block" },
      { id: "custom_1783895724284_egzc", x: 88, y: 7, type: "block" },
      { id: "custom_1783895724800_e2as", x: 87, y: 7, type: "block" },
      { id: "custom_1783895725531_yw5m", x: 90, y: 7, type: "block" },
      { id: "custom_1783895726224_gs9k", x: 89, y: 6, type: "block" },
      { id: "custom_1783895726434_3mpu", x: 90, y: 6, type: "block" },
      { id: "custom_1783895726616_mj1n", x: 89, y: 5, type: "block" },
      { id: "custom_1783895727944_3y38", x: 89, y: 7, type: "block" },
      { id: "custom_1783895728382_i9w9", x: 88, y: 6, type: "block" },
      { id: "custom_1783895735142_u6n3", x: 86, y: 0, type: "block" },
      { id: "custom_1783895736321_b61j", x: 87, y: 1, type: "block" },
      { id: "custom_1783895751924_qf3o", x: 89, y: 1, type: "block" },
      { id: "custom_1783895752341_8d93", x: 90, y: 0, type: "block" },
      { id: "custom_1783895759350_g5fg", x: 88, y: 1, type: "block" },
      { id: "custom_1783895759724_kxyd", x: 87, y: 0, type: "block" },
      { id: "custom_1783895759902_zx2d", x: 89, y: 0, type: "block" },
      { id: "custom_1783895761140_s4l1", x: 88, y: 0, type: "block" },
      { id: "custom_1783895781710_x3aa", x: 101, y: 7, type: "portal_cube" },
      { id: "custom_1783895783069_ww3l", x: 101, y: 6, type: "portal_cube" },
      { id: "custom_1783895785941_o9rd", x: 101, y: 5, type: "portal_cube" },
      { id: "custom_1783895786120_zps6", x: 101, y: 4, type: "portal_cube" },
      { id: "custom_1783895787158_uvqo", x: 101, y: 3, type: "portal_cube" },
      { id: "custom_1783895787359_pgw5", x: 101, y: 2, type: "portal_cube" },
      { id: "custom_1783895788282_2jlo", x: 101, y: 0, type: "portal_cube" },
      { id: "custom_1783895789370_qjjc", x: 101, y: 1, type: "portal_cube" },
      { id: "custom_1783895804365_jbxh", x: 106, y: 0, type: "speed_3x" },
      { id: "custom_1783895804984_iw6k", x: 107, y: 0, type: "speed_3x" },
      { id: "custom_1783895805441_0xz0", x: 108, y: 0, type: "speed_3x" },
      { id: "custom_1783895805957_expx", x: 109, y: 0, type: "speed_3x" },
      { id: "custom_1783895894689_944q", x: 75, y: 4, type: "portal_wave" },
      { id: "custom_1783895895820_uzv1", x: 75, y: 5, type: "portal_wave" },
      { id: "custom_1783895896310_y3f2", x: 75, y: 6, type: "portal_wave" },
      { id: "custom_1783895896781_0owe", x: 75, y: 7, type: "portal_wave" },
      { id: "custom_1783895906430_cm0p", x: 68, y: 0, type: "portal_ball" },
      { id: "custom_1783895956547_6ewb", x: 11, y: 0, type: "pad_yellow" },
      { id: "custom_1783895985781_owgs", x: 19, y: 0, type: "pad_yellow" },
      { id: "custom_1783895986419_k210", x: 20, y: 0, type: "pad_yellow" }
    ],
    isCustom: true,
    author: "Random",
    downloads: 1,
    likes: 0,
    dislikes: 0,
    lengthLabel: "Medium",
    starsReward: 3,
    orbsReward: 100,
    uploadedAt: "2026-07-12",
    comments: [
      {
        username: "System",
        text: "¡Nivel subido con éxito a los servidores compartidos!",
        date: "2026-07-12"
      }
    ]
  }
];

const UNUSED_DUMMY_LEVELS: any[] = [
  {
    id: 'online_retray',
    name: 'Retray',
    difficulty: 'easy',
    author: 'Viprin',
    downloads: 450210,
    likes: 32410,
    dislikes: 42,
    lengthLabel: 'Short',
    starsReward: 2,
    orbsReward: 50,
    uploadedAt: '2026-05-10',
    elements: [
      { id: 'o1', x: 8, y: 0, type: 'block' },
      { id: 'o2', x: 12, y: 0, type: 'spike' },
      { id: 'o3', x: 16, y: 0, type: 'block' },
      { id: 'o4', x: 17, y: 1, type: 'block' },
      { id: 'o5', x: 22, y: 0, type: 'pad_yellow' },
      { id: 'o6', x: 26, y: 3, type: 'portal_wave' },
      { id: 'o7', x: 32, y: 0, type: 'spike' },
      { id: 'o8', x: 36, y: 5, type: 'spike' },
      { id: 'o9', x: 40, y: 0, type: 'portal_cube' },
      { id: 'o10', x: 45, y: 0, type: 'spike' },
    ],
    comments: [
      { username: 'RobTop', text: 'Classic simple layout! Perfect for beginners.', date: '2026-05-11' },
      { username: 'GamerGD_99', text: 'Downloaded on first try! I loved the wave portal.', date: '2026-06-01' }
    ]
  },
  {
    id: 'online_the_nightmare',
    name: 'The Nightmare',
    difficulty: 'demon',
    author: 'Jax',
    downloads: 1254390,
    likes: 142100,
    dislikes: 1205,
    lengthLabel: 'Long',
    starsReward: 10,
    orbsReward: 500,
    uploadedAt: '2026-01-15',
    elements: [
      { id: 'n1', x: 6, y: 0, type: 'speed_2x' },
      { id: 'n2', x: 10, y: 0, type: 'spike' },
      { id: 'n3', x: 12, y: 0, type: 'spike' },
      { id: 'n4', x: 15, y: 0, type: 'block' },
      { id: 'n5', x: 16, y: 1, type: 'block' },
      { id: 'n6', x: 17, y: 2, type: 'block' },
      { id: 'n7', x: 17, y: 3, type: 'spike' }, // block spike!
      { id: 'n8', x: 22, y: 0, type: 'ring_yellow' },
      { id: 'n9', x: 23, y: 0, type: 'spike' },
      { id: 'n10', x: 28, y: 1, type: 'portal_ball' },
      { id: 'n11', x: 34, y: 0, type: 'spike' },
      { id: 'n12', x: 38, y: 5, type: 'spike' },
      { id: 'n13', x: 42, y: 0, type: 'portal_robot' },
      { id: 'n14', x: 48, y: 0, type: 'spike' },
      { id: 'n15', x: 49, y: 0, type: 'spike' },
      { id: 'n16', x: 50, y: 0, type: 'spike' }, // TRIPLE SPIKE!
      { id: 'n17', x: 55, y: 1, type: 'portal_cube' },
    ],
    comments: [
      { username: 'Stormy', text: 'Easiest demon in the game but still super fun!', date: '2026-02-01' },
      { username: 'L_fr', text: 'I completed this in 20 attempts! Awesome gameplay Jax.', date: '2026-03-14' }
    ]
  },
  {
    id: 'online_nine_circles',
    name: 'Nine Circles',
    difficulty: 'demon',
    author: 'Zobros',
    downloads: 984120,
    likes: 87400,
    dislikes: 432,
    lengthLabel: 'Long',
    starsReward: 10,
    orbsReward: 500,
    uploadedAt: '2026-03-22',
    elements: [
      { id: 'nc1', x: 10, y: 0, type: 'speed_3x' },
      { id: 'nc2', x: 14, y: 1, type: 'portal_wave' },
      { id: 'nc3', x: 18, y: 5, type: 'block' },
      { id: 'nc4', x: 20, y: 0, type: 'block' },
      { id: 'nc5', x: 23, y: 4, type: 'spike' },
      { id: 'nc6', x: 26, y: 1, type: 'spike' },
      { id: 'nc7', x: 30, y: 5, type: 'spike' },
      { id: 'nc8', x: 34, y: 0, type: 'portal_cube' },
      { id: 'nc9', x: 40, y: 0, type: 'spike' },
    ],
    comments: [
      { username: 'Krazyman50', text: 'That wave part sync is outstanding!', date: '2026-03-23' },
      { username: 'Xanei', text: 'So intense. Hard demon definitely!', date: '2026-04-10' }
    ]
  },
  {
    id: 'online_auto_play_area',
    name: 'Auto Play Area',
    difficulty: 'auto',
    author: 'RobTop',
    downloads: 1540300,
    likes: 125300,
    dislikes: 121,
    lengthLabel: 'Medium',
    starsReward: 1,
    orbsReward: 25,
    uploadedAt: '2026-02-14',
    elements: [
      { id: 'a1', x: 12, y: 0, type: 'pad_yellow' },
      { id: 'a2', x: 16, y: 2, type: 'pad_yellow' },
      { id: 'a3', x: 20, y: 4, type: 'pad_yellow' },
      { id: 'a4', x: 25, y: 0, type: 'block' },
      { id: 'a5', x: 26, y: 0, type: 'block' },
      { id: 'a6', x: 30, y: 0, type: 'portal_ball' },
      { id: 'a7', x: 34, y: 4, type: 'pad_yellow' },
      { id: 'a8', x: 40, y: 1, type: 'portal_cube' },
    ],
    comments: [
      { username: 'Zonk', text: 'Literal masterpiece. I did not have to touch the screen at all.', date: '2026-02-15' }
    ]
  },
  {
    id: 'online_sonic_wave',
    name: 'Sonic Wave',
    difficulty: 'demon',
    author: 'L_fr',
    downloads: 654310,
    likes: 49830,
    dislikes: 3105,
    lengthLabel: 'XL',
    starsReward: 10,
    orbsReward: 500,
    uploadedAt: '2026-07-01',
    elements: [
      { id: 'sw1', x: 8, y: 0, type: 'speed_3x' },
      { id: 'sw2', x: 14, y: 3, type: 'portal_wave' },
      { id: 'sw3', x: 20, y: 5, type: 'spike' },
      { id: 'sw4', x: 22, y: 1, type: 'spike' },
      { id: 'sw5', x: 24, y: 6, type: 'spike' },
      { id: 'sw6', x: 26, y: 0, type: 'spike' },
      { id: 'sw7', x: 28, y: 5, type: 'spike' },
      { id: 'sw8', x: 30, y: 2, type: 'spike' },
      { id: 'sw9', x: 32, y: 6, type: 'spike' },
      { id: 'sw10', x: 36, y: 1, type: 'portal_cube' },
    ],
    comments: [
      { username: 'Viprin', text: 'This is absolutely impossible! Excellent design though.', date: '2026-07-02' }
    ]
  },
  {
    id: 'online_theory_of_every_3',
    name: 'Theory of Everything 3',
    difficulty: 'insane',
    author: 'Viprin',
    downloads: 541090,
    likes: 31210,
    dislikes: 189,
    lengthLabel: 'Long',
    starsReward: 9,
    orbsReward: 350,
    uploadedAt: '2026-06-18',
    elements: [
      { id: 'toe1', x: 10, y: 0, type: 'block' },
      { id: 'toe2', x: 14, y: 0, type: 'pad_yellow' },
      { id: 'toe3', x: 18, y: 3, type: 'portal_robot' },
      { id: 'toe4', x: 24, y: 0, type: 'spike' },
      { id: 'toe5', x: 26, y: 0, type: 'spike' },
      { id: 'toe6', x: 30, y: 2, type: 'portal_ball' },
      { id: 'toe7', x: 35, y: 0, type: 'spike' },
      { id: 'toe8', x: 38, y: 5, type: 'spike' },
      { id: 'toe9', x: 42, y: 0, type: 'portal_cube' },
    ],
    comments: [
      { username: 'Alex', text: 'Love the robot gameplay! Very sync.', date: '2026-06-19' }
    ]
  },
  {
    id: 'online_dark_paradise',
    name: 'Dark Paradise',
    difficulty: 'harder',
    author: 'MapPacker',
    downloads: 243900,
    likes: 18740,
    dislikes: 84,
    lengthLabel: 'Long',
    starsReward: 7,
    orbsReward: 200,
    uploadedAt: '2026-04-05',
    elements: [
      { id: 'dp1', x: 8, y: 0, type: 'block' },
      { id: 'dp2', x: 12, y: 0, type: 'spike' },
      { id: 'dp3', x: 16, y: 1, type: 'block' },
      { id: 'dp4', x: 17, y: 1, type: 'block' },
      { id: 'dp5', x: 22, y: 0, type: 'spike' },
      { id: 'dp6', x: 26, y: 2, type: 'portal_ball' },
      { id: 'dp7', x: 32, y: 0, type: 'spike' },
      { id: 'dp8', x: 35, y: 5, type: 'spike' },
      { id: 'dp9', x: 40, y: 1, type: 'portal_cube' },
    ],
    comments: [
      { username: 'NekoGD', text: 'Beautiful visuals, extremely nostalgic for me.', date: '2026-04-06' }
    ]
  }
];

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
