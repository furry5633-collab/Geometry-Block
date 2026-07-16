import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'shared_levels.json');
const USERS_FILE = path.join(process.cwd(), 'registered_users.json');
const FRIENDSHIPS_FILE = path.join(process.cwd(), 'friendships.json');

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

// Helper to load registered users from disk
function loadUsers(): any[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading registered_users.json', e);
  }
  return [];
}

// Helper to save registered users to disk
function saveUsers(users: any[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing to registered_users.json', e);
  }
}

// Helper to load friendships from disk
function loadFriendships(): any[] {
  try {
    if (fs.existsSync(FRIENDSHIPS_FILE)) {
      const raw = fs.readFileSync(FRIENDSHIPS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading friendships.json', e);
  }
  return [];
}

// Helper to save friendships to disk
function saveFriendships(friendships: any[]) {
  try {
    fs.writeFileSync(FRIENDSHIPS_FILE, JSON.stringify(friendships, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing to friendships.json', e);
  }
}

async function start() {
  const app = express();
  app.use(express.json());

  // Players APIs
  app.get('/api/players', (req, res) => {
    res.json(loadUsers());
  });

  app.post('/api/players/register', (req, res) => {
    const { username, skins, stats, createdLevels, passwordHash } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Missing username' });
    }
    const users = loadUsers();
    const existingIndex = users.findIndex((u: any) => u.username.toLowerCase() === username.toLowerCase());
    
    const userPayload: any = {
      username,
      skins: skins || {},
      stats: stats || {},
      createdLevels: createdLevels || [],
      lastActive: Date.now()
    };

    if (passwordHash) {
      userPayload.passwordHash = passwordHash;
    }

    if (existingIndex >= 0) {
      users[existingIndex] = {
        ...users[existingIndex],
        ...userPayload,
        stats: {
          ...users[existingIndex].stats,
          ...stats
        }
      };
      if (passwordHash) {
        users[existingIndex].passwordHash = passwordHash;
      }
    } else {
      users.push(userPayload);
    }

    saveUsers(users);
    res.status(200).json(users[existingIndex >= 0 ? existingIndex : users.length - 1]);
  });

  app.post('/api/players/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }
    const users = loadUsers();
    const user = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    if (user.passwordHash && user.passwordHash !== password) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }
    // If the server-side record doesn't have a password yet, bind it now!
    if (!user.passwordHash) {
      user.passwordHash = password;
      saveUsers(users);
    }
    res.status(200).json(user);
  });

  // Friendships APIs
  app.post('/api/friends/request', (req, res) => {
    const { from, to } = req.body;
    if (!from || !to) {
      return res.status(400).json({ error: 'Missing from or to parameters' });
    }
    if (from.toLowerCase() === to.toLowerCase()) {
      return res.status(400).json({ error: 'No te puedes enviar solicitud a ti mismo' });
    }

    const friendships = loadFriendships();
    const existing = friendships.find((f: any) => 
      (f.user1.toLowerCase() === from.toLowerCase() && f.user2.toLowerCase() === to.toLowerCase()) ||
      (f.user1.toLowerCase() === to.toLowerCase() && f.user2.toLowerCase() === from.toLowerCase())
    );

    if (existing) {
      return res.status(400).json({ error: 'Ya existe una solicitud o amistad activa entre estos jugadores' });
    }

    friendships.push({
      user1: from,
      user2: to,
      status: 'pending',
      sender: from,
      timestamp: Date.now()
    });

    saveFriendships(friendships);
    res.status(200).json({ success: true });
  });

  app.post('/api/friends/respond', (req, res) => {
    const { from, to, action } = req.body; // from is the sender of the request, to is the replier
    if (!from || !to || !action) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    let friendships = loadFriendships();
    const idx = friendships.findIndex((f: any) => 
      f.status === 'pending' &&
      ((f.user1.toLowerCase() === from.toLowerCase() && f.user2.toLowerCase() === to.toLowerCase()) ||
       (f.user1.toLowerCase() === to.toLowerCase() && f.user2.toLowerCase() === from.toLowerCase()))
    );

    if (idx < 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada o ya procesada' });
    }

    if (action === 'accept') {
      friendships[idx].status = 'accepted';
    } else {
      friendships.splice(idx, 1);
    }

    saveFriendships(friendships);
    res.status(200).json({ success: true });
  });

  app.get('/api/friends/requests', (req, res) => {
    const username = req.query.username as string;
    if (!username) {
      return res.status(400).json({ error: 'Missing username query param' });
    }
    const friendships = loadFriendships();
    const pending = friendships.filter((f: any) => 
      f.status === 'pending' && 
      (f.user1.toLowerCase() === username.toLowerCase() || f.user2.toLowerCase() === username.toLowerCase())
    );
    res.json(pending);
  });

  app.get('/api/friends/list', (req, res) => {
    const username = req.query.username as string;
    if (!username) {
      return res.status(400).json({ error: 'Missing username query param' });
    }
    const friendships = loadFriendships();
    const accepted = friendships.filter((f: any) => 
      f.status === 'accepted' && 
      (f.user1.toLowerCase() === username.toLowerCase() || f.user2.toLowerCase() === username.toLowerCase())
    );

    const friendsList = accepted.map((f: any) => {
      const friendName = f.user1.toLowerCase() === username.toLowerCase() ? f.user2 : f.user1;
      return friendName;
    });

    res.json(friendsList);
  });

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

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });

  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`).pathname;
    if (pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  // Store active online players: username -> WebSocket
  const onlineSockets = new Map<string, WebSocket>();

  // Lobby type definitions
  interface WSPlayer {
    username: string;
    skins: any;
    stats: any;
    x: number;
    y: number;
    gamemode: string;
    isDead: boolean;
    rotation?: number;
    progress?: number;
  }

  interface WSLobby {
    id: string;
    leader: string;
    players: WSPlayer[];
    selectedLevel: any | null;
    isPlaying: boolean;
  }

  const lobbies = new Map<string, WSLobby>();

  function broadcastToRoom(lobbyId: string, message: any) {
    const lobby = lobbies.get(lobbyId);
    if (!lobby) return;
    const payload = JSON.stringify(message);
    lobby.players.forEach(p => {
      const socket = onlineSockets.get(p.username);
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(payload);
      }
    });
  }

  wss.on('connection', (ws, req) => {
    // Parse username from query params: /?username=MyPlayer
    const urlObj = new URL(req.url || '', 'http://localhost');
    const username = urlObj.searchParams.get('username');

    if (!username) {
      ws.close();
      return;
    }

    // Register active connection
    onlineSockets.set(username, ws);
    console.log(`[WS] ${username} connected.`);

    // Send updated list of players online to everyone when someone connects
    const notifyPresence = () => {
      const onlineList = Array.from(onlineSockets.keys());
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'presence_update', onlineUsers: onlineList }));
        }
      });
    };
    notifyPresence();

    // Current lobby ID of this connection
    let currentLobbyId: string | null = null;

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'create_room': {
            const { skins, stats } = data;
            const roomId = `room_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            const newLobby: WSLobby = {
              id: roomId,
              leader: username,
              players: [{
                username,
                skins,
                stats,
                x: 0,
                y: 0,
                gamemode: 'cube',
                isDead: false,
                progress: 0
              }],
              selectedLevel: null,
              isPlaying: false
            };
            lobbies.set(roomId, newLobby);
            currentLobbyId = roomId;
            ws.send(JSON.stringify({ type: 'room_created', room: newLobby }));
            break;
          }

          case 'join_room': {
            const { roomId, skins, stats } = data;
            const lobby = lobbies.get(roomId);
            if (!lobby) {
              ws.send(JSON.stringify({ type: 'error', message: 'La sala no existe' }));
              return;
            }
            if (lobby.isPlaying) {
              ws.send(JSON.stringify({ type: 'error', message: 'La partida ya ha comenzado' }));
              return;
            }
            
            // Remove from old room if any
            if (currentLobbyId && lobbies.has(currentLobbyId)) {
              handleUserLeave(username, currentLobbyId);
            }

            // Check if player already in lobby
            const existingIdx = lobby.players.findIndex(p => p.username === username);
            if (existingIdx >= 0) {
              lobby.players[existingIdx] = {
                username,
                skins,
                stats,
                x: 0,
                y: 0,
                gamemode: 'cube',
                isDead: false,
                progress: 0
              };
            } else {
              lobby.players.push({
                username,
                skins,
                stats,
                x: 0,
                y: 0,
                gamemode: 'cube',
                isDead: false,
                progress: 0
              });
            }

            currentLobbyId = roomId;
            broadcastToRoom(roomId, { type: 'room_state', room: lobby });
            break;
          }

          case 'invite': {
            const { friendUsername, roomId } = data;
            const targetSocket = onlineSockets.get(friendUsername);
            if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
              targetSocket.send(JSON.stringify({
                type: 'incoming_invite',
                from: username,
                roomId
              }));
            } else {
              ws.send(JSON.stringify({ type: 'error', message: `${friendUsername} no está conectado.` }));
            }
            break;
          }

          case 'select_level': {
            if (!currentLobbyId) return;
            const lobby = lobbies.get(currentLobbyId);
            if (!lobby || lobby.leader !== username) return;

            lobby.selectedLevel = data.level;
            broadcastToRoom(currentLobbyId, { type: 'room_state', room: lobby });
            break;
          }

          case 'start_game': {
            if (!currentLobbyId) return;
            const lobby = lobbies.get(currentLobbyId);
            if (!lobby || lobby.leader !== username) return;

            lobby.isPlaying = true;
            lobby.players.forEach(p => {
              p.isDead = false;
              p.x = 0;
              p.y = 0;
              p.progress = 0;
            });
            broadcastToRoom(currentLobbyId, { type: 'game_started' });
            break;
          }

          case 'player_sync': {
            if (!currentLobbyId) return;
            const lobby = lobbies.get(currentLobbyId);
            if (!lobby) return;

            const player = lobby.players.find(p => p.username === username);
            if (player) {
              player.x = data.x;
              player.y = data.y;
              player.gamemode = data.gamemode;
              player.isDead = !!data.isDead;
              player.rotation = data.rotation;
              player.progress = data.progress;
            }

            // Broadcast only client movements to others to save bandwidth
            broadcastToRoom(currentLobbyId, {
              type: 'sync_broadcast',
              username,
              x: data.x,
              y: data.y,
              gamemode: data.gamemode,
              isDead: data.isDead,
              rotation: data.rotation,
              progress: data.progress
            });
            break;
          }

          case 'player_death': {
            if (!currentLobbyId) return;
            const lobby = lobbies.get(currentLobbyId);
            if (!lobby) return;

            const player = lobby.players.find(p => p.username === username);
            if (player) {
              player.isDead = true;
            }

            broadcastToRoom(currentLobbyId, {
              type: 'player_died',
              username
            });

            // If ALL players in the room are now dead, trigger auto-restart
            const allDead = lobby.players.every(p => p.isDead);
            if (allDead) {
              setTimeout(() => {
                const updatedLobby = lobbies.get(currentLobbyId!);
                if (updatedLobby && updatedLobby.isPlaying) {
                  updatedLobby.players.forEach(p => {
                    p.isDead = false;
                    p.x = 0;
                    p.y = 0;
                    p.progress = 0;
                  });
                  broadcastToRoom(currentLobbyId!, { type: 'game_restart' });
                }
              }, 2000);
            }
            break;
          }

          case 'leave_room': {
            if (!currentLobbyId) return;
            handleUserLeave(username, currentLobbyId);
            currentLobbyId = null;
            break;
          }
        }

      } catch (e) {
        console.error('[WS Error processing message]', e);
      }
    });

    function handleUserLeave(userToLeave: string, roomId: string) {
      const lobby = lobbies.get(roomId);
      if (!lobby) return;

      lobby.players = lobby.players.filter(p => p.username !== userToLeave);
      
      if (lobby.players.length === 0) {
        lobbies.delete(roomId);
      } else {
        if (lobby.leader === userToLeave) {
          lobby.leader = lobby.players[0].username;
        }
        broadcastToRoom(roomId, { type: 'room_state', room: lobby });
      }
    }

    ws.on('close', () => {
      onlineSockets.delete(username);
      console.log(`[WS] ${username} disconnected.`);
      notifyPresence();
      if (currentLobbyId) {
        handleUserLeave(username, currentLobbyId);
      }
    });
  });
}

start().catch((err) => {
  console.error('[Server Error]', err);
});
