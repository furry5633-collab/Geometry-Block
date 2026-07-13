import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'shared_levels.json');

// Preloaded community levels to seed the online server if empty
const INITIAL_ONLINE_LEVELS = [
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

// Helper to load levels from disk
function loadLevelsFromDisk() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading shared_levels.json, re-initializing.', e);
  }
  // If file doesn't exist or failed to parse, seed and return seed data
  saveLevelsToDisk(INITIAL_ONLINE_LEVELS);
  return INITIAL_ONLINE_LEVELS;
}

// Helper to save levels to disk
function saveLevelsToDisk(levels: any[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(levels, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing to shared_levels.json', e);
  }
}

async function start() {
  const app = express();
  app.use(express.json());

  // Initialize shared levels cache
  let sharedLevels = loadLevelsFromDisk();

  // API 1: Get all online shared levels
  app.get('/api/online-levels', (req, res) => {
    res.json(sharedLevels);
  });

  // API 2: Upload a new custom level to online sharing
  app.post('/api/online-levels/upload', (req, res) => {
    const { level, author } = req.body;
    if (!level) {
      return res.status(400).json({ error: 'Missing level data' });
    }

    const starsMap: Record<string, number> = {
      na: 0,
      easy: 2,
      normal: 3,
      hard: 5,
      harder: 7,
      insane: 9,
      demon: 10,
      auto: 1
    };

    const orbsMap: Record<string, number> = {
      na: 0,
      easy: 50,
      normal: 100,
      hard: 175,
      harder: 250,
      insane: 350,
      demon: 500,
      auto: 25
    };

    const difficulty = level.difficulty || 'normal';

    const onlineLevel = {
      ...level,
      id: `shared_${level.id}_${Date.now()}`,
      isCustom: true,
      author: author || 'Anónimo',
      downloads: 1,
      likes: 0,
      dislikes: 0,
      lengthLabel: level.elements.length < 15 ? 'Tiny' : level.elements.length < 35 ? 'Short' : level.elements.length < 60 ? 'Medium' : level.elements.length < 90 ? 'Long' : 'XL',
      starsReward: starsMap[difficulty] || 3,
      orbsReward: orbsMap[difficulty] || 100,
      uploadedAt: new Date().toISOString().split('T')[0],
      comments: [
        { username: 'System', text: '¡Nivel subido con éxito a los servidores compartidos!', date: new Date().toISOString().split('T')[0] }
      ]
    };

    sharedLevels.unshift(onlineLevel);
    saveLevelsToDisk(sharedLevels);
    res.status(201).json(onlineLevel);
  });

  // API 3: Like / Dislike online level
  app.post('/api/online-levels/like', (req, res) => {
    const { id, isLike } = req.body;
    const idx = sharedLevels.findIndex((l: any) => l.id === id);
    if (idx < 0) {
      return res.status(404).json({ error: 'Level not found' });
    }

    const lvl = sharedLevels[idx];
    if (isLike) {
      lvl.likes = (lvl.likes || 0) + 1;
    } else {
      lvl.dislikes = (lvl.dislikes || 0) + 1;
    }

    sharedLevels[idx] = lvl;
    saveLevelsToDisk(sharedLevels);
    res.json(lvl);
  });

  // API 4: Download count increment
  app.post('/api/online-levels/download', (req, res) => {
    const { id } = req.body;
    const idx = sharedLevels.findIndex((l: any) => l.id === id);
    if (idx < 0) {
      return res.status(404).json({ error: 'Level not found' });
    }

    const lvl = sharedLevels[idx];
    lvl.downloads = (lvl.downloads || 0) + 1;

    sharedLevels[idx] = lvl;
    saveLevelsToDisk(sharedLevels);
    res.json(lvl);
  });

  // API 5: Add comment to online level
  app.post('/api/online-levels/comment', (req, res) => {
    const { id, username, text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Comment text cannot be empty' });
    }

    const idx = sharedLevels.findIndex((l: any) => l.id === id);
    if (idx < 0) {
      return res.status(404).json({ error: 'Level not found' });
    }

    const lvl = sharedLevels[idx];
    if (!lvl.comments) lvl.comments = [];
    lvl.comments.push({
      username: username || 'Anónimo',
      text: text.trim(),
      date: new Date().toISOString().split('T')[0]
    });

    sharedLevels[idx] = lvl;
    saveLevelsToDisk(sharedLevels);
    res.json(lvl);
  });

  // Vite development middleware vs production static delivery
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[Server Error]', err);
});
