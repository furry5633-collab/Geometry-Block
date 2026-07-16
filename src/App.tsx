/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Level, PlayerSkins, UserProfile } from './types';
import {
  DEFAULT_LEVELS,
  getCustomLevels,
  saveCustomLevel,
  deleteCustomLevel,
  saveLevelProgress,
  saveLevelPracticeProgress,
  uploadCustomLevelToOnline,
  getLevelProgress
} from './levels';
import { audio } from './audio';
import GameCanvas from './components/GameCanvas';
import SkinCustomizer from './components/SkinCustomizer';
import LevelBuilder from './components/LevelBuilder';
import OnlineLevelBrowser from './components/OnlineLevelBrowser';
import MultiplayerMenu from './components/MultiplayerMenu';
import { PlayerLevelBar } from './components/PlayerLevelBar';
import { LevelRewardsModal } from './components/LevelRewardsModal';
import {
  Sparkles,
  Play as PlayIcon,
  Wrench,
  User,
  Trash2,
  Lock,
  Plus,
  Compass,
  ArrowLeft,
  Volume2,
  VolumeX,
  Gift,
  CloudUpload,
  Trophy,
  Gem,
  Coins,
  Users
} from 'lucide-react';

const DEFAULT_SKINS: PlayerSkins = {
  cube: 'cube_classic',
  wave: 'wave_classic',
  robot: 'robot_classic',
  ball: 'ball_classic',
  primaryColor: '#00FF00', // lime green
  secondaryColor: '#FF00FF', // pink
};

type ViewState = 'menu' | 'levels' | 'customizer' | 'editor' | 'playing' | 'online_browser' | 'multiplayer';

export default function App() {
  const [view, setViewStateInternal] = useState<ViewState>('menu');
  
  const setViewState = (state: ViewState) => {
    audio.playClick();
    setViewStateInternal(state);
  };

  const [cameFromEditor, setCameFromEditor] = useState<boolean>(false);

  // Multiplayer Game states
  const [multiplayerState, setMultiplayerState] = useState<{
    isMultiplayer: boolean;
    roomId: string | null;
    socket: WebSocket | null;
    players: any[];
    isLeader: boolean;
  }>({
    isMultiplayer: false,
    roomId: null,
    socket: null,
    players: [],
    isLeader: false
  });

  const handleStartMultiplayerGame = (level: Level, wsSocket: WebSocket, roomId: string, players: any[], isLeader: boolean) => {
    setSelectedLevel(level);
    setMultiplayerState({
      isMultiplayer: true,
      roomId,
      socket: wsSocket,
      players,
      isLeader
    });
    setViewStateInternal('playing'); // directly transition into gameplay without clicking sound
  };
  const [skins, setSkins] = useState<PlayerSkins>(() => {
    try {
      const data = localStorage.getItem('geometry_dash_skins');
      return data ? JSON.parse(data) : DEFAULT_SKINS;
    } catch (e) {
      return DEFAULT_SKINS;
    }
  });

  // Current selected level to play or edit
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  
  // Custom levels list
  const [customLevels, setCustomLevels] = useState<Level[]>([]);

  // Persistent User profile stats (Save system!)
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const data = localStorage.getItem('geometry_dash_profile');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return {
      username: 'Jugador_' + Math.floor(Math.random() * 9000 + 1000),
      stars: 12,
      orbs: 150,
      diamonds: 8,
      completedCount: 0
    };
  });

  // Daily Chest States
  const [showChestModal, setShowChestModal] = useState(false);
  const [chestOpened, setChestOpened] = useState(false);
  const [chestReward, setChestReward] = useState('');
  const [countdownText, setCountdownText] = useState('');
  const [canOpenChest, setCanOpenChest] = useState(true);
  const [showEditorHub, setShowEditorHub] = useState<boolean>(false);
  const [showRewardsModal, setShowRewardsModal] = useState<boolean>(false);

  // Custom sandbox-immune modals states
  const [newProjectModal, setNewProjectModal] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [deleteConfirmLevelId, setDeleteConfirmLevelId] = useState<string | null>(null);
  const [publishLevelModal, setPublishLevelModal] = useState<Level | null>(null);
  const [publishAuthorName, setPublishAuthorName] = useState<string>('');

  // Level selection carousel states
  const [officialLevelIndex, setOfficialLevelIndex] = useState<number>(0);
  const [levelSelectTab, setLevelSelectTab] = useState<'official' | 'custom'>('official');

  // Account system states
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [authUsername, setAuthUsername] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('geometry_dash_logged_in_user');
    } catch {
      return false;
    }
  });

  // Auto-save profile when it updates & sync with accounts database
  useEffect(() => {
    localStorage.setItem('geometry_dash_profile', JSON.stringify(profile));
    
    // Also save to accounts database if they are logged into an account
    try {
      const loggedInUser = localStorage.getItem('geometry_dash_logged_in_user');
      if (loggedInUser) {
        const accountsData = localStorage.getItem('geometry_dash_accounts');
        const accounts: any[] = accountsData ? JSON.parse(accountsData) : [];
        const updatedAccounts = accounts.map(acc => {
          if (acc.username.toLowerCase() === loggedInUser.toLowerCase()) {
            return { ...acc, profile };
          }
          return acc;
        });
        localStorage.setItem('geometry_dash_accounts', JSON.stringify(updatedAccounts));
      }
    } catch (e) {
      console.error('Failed to sync account profile:', e);
    }
  }, [profile]);

  // Prompt account creation exactly ONCE on initial load
  useEffect(() => {
    try {
      const prompted = localStorage.getItem('geometry_dash_auth_prompted');
      const activeUser = localStorage.getItem('geometry_dash_logged_in_user');
      if (!prompted && !activeUser) {
        setAuthMode('register');
        setShowAuthModal(true);
        localStorage.setItem('geometry_dash_auth_prompted', 'true');
      }
    } catch (e) {
      console.error('Auth prompt check failed:', e);
    }
  }, []);

  const handleRegisterAccount = async () => {
    setAuthError('');
    const cleanUsername = authUsername.trim();
    const cleanPassword = authPassword.trim();
    if (!cleanUsername) {
      setAuthError('El nombre de usuario no puede estar vacío.');
      return;
    }
    if (cleanUsername.length < 3) {
      setAuthError('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }
    if (cleanPassword.length < 4) {
      setAuthError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    try {
      const accountsData = localStorage.getItem('geometry_dash_accounts');
      const accounts: any[] = accountsData ? JSON.parse(accountsData) : [];
      
      const exists = accounts.some(acc => acc.username.toLowerCase() === cleanUsername.toLowerCase() && acc.passwordHash);
      if (exists) {
        setAuthError('Este nombre de usuario ya está registrado en este navegador.');
        return;
      }

      // Also double-check on server if already registered there
      try {
        const checkRes = await fetch('/api/players');
        if (checkRes.ok) {
          const serverUsers = await checkRes.json();
          const serverExists = serverUsers.some((u: any) => u.username.toLowerCase() === cleanUsername.toLowerCase() && u.passwordHash);
          if (serverExists) {
            setAuthError('Este nombre de usuario ya tiene una cuenta registrada.');
            return;
          }
        }
      } catch (checkErr) {
        console.warn('Could not check server users on registration, proceeding offline first:', checkErr);
      }

      const newProfile: UserProfile = {
        username: cleanUsername,
        stars: profile.stars > 12 ? profile.stars : 12,
        orbs: profile.orbs > 150 ? profile.orbs : 150,
        diamonds: profile.diamonds > 8 ? profile.diamonds : 8,
        completedCount: profile.completedCount,
        xp: profile.xp || 0,
        claimedRewards: profile.claimedRewards || []
      };

      const newAccount = {
        username: cleanUsername,
        passwordHash: cleanPassword,
        profile: newProfile
      };

      // Register/sync with server first so passwordHash is persisted
      try {
        await fetch('/api/players/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: cleanUsername,
            skins,
            stats: newProfile,
            passwordHash: cleanPassword,
            createdLevels: customLevels.map(lvl => ({ id: lvl.id, name: lvl.name }))
          })
        });
      } catch (serverErr) {
        console.warn('Failed to register player on server, will sync later:', serverErr);
      }

      accounts.push(newAccount);
      localStorage.setItem('geometry_dash_accounts', JSON.stringify(accounts));
      localStorage.setItem('geometry_dash_logged_in_user', cleanUsername);
      localStorage.setItem('geometry_dash_auth_prompted', 'true');
      
      setProfile(newProfile);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      setAuthUsername('');
      setAuthPassword('');
    } catch (e) {
      setAuthError('Error al crear la cuenta. Inténtalo de nuevo.');
    }
  };

  const handleLoginAccount = async () => {
    setAuthError('');
    const cleanUsername = authUsername.trim();
    const cleanPassword = authPassword.trim();
    if (!cleanUsername || !cleanPassword) {
      setAuthError('Introduce el usuario y la contraseña.');
      return;
    }

    try {
      const accountsData = localStorage.getItem('geometry_dash_accounts');
      const accounts: any[] = accountsData ? JSON.parse(accountsData) : [];
      
      let account = accounts.find(acc => acc.username.toLowerCase() === cleanUsername.toLowerCase() && acc.passwordHash === cleanPassword);
      
      // If not found in local accounts, try hitting the server login API!
      if (!account) {
        try {
          const res = await fetch('/api/players/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: cleanUsername, password: cleanPassword })
          });
          
          if (res.ok) {
            const serverUser = await res.json();
            const serverProfile: UserProfile = {
              username: serverUser.username,
              stars: serverUser.stats?.stars ?? 12,
              orbs: serverUser.stats?.orbs ?? 150,
              diamonds: serverUser.stats?.diamonds ?? 8,
              completedCount: serverUser.stats?.completedCount ?? 0,
              xp: serverUser.stats?.xp ?? 0,
              claimedRewards: serverUser.stats?.claimedRewards ?? []
            };

            account = {
              username: serverUser.username,
              passwordHash: serverUser.passwordHash || cleanPassword,
              profile: serverProfile
            };

            // Sync skins if available
            if (serverUser.skins) {
              setSkins(serverUser.skins);
              localStorage.setItem('geometry_dash_skins', JSON.stringify(serverUser.skins));
            }

            accounts.push(account);
            localStorage.setItem('geometry_dash_accounts', JSON.stringify(accounts));
          } else {
            const errBody = await res.json().catch(() => ({}));
            setAuthError(errBody.error || 'Usuario o contraseña incorrectos.');
            return;
          }
        } catch (serverErr) {
          setAuthError('No se pudo conectar con el servidor. Verifica tu conexión.');
          return;
        }
      }

      localStorage.setItem('geometry_dash_logged_in_user', account.username);
      localStorage.setItem('geometry_dash_auth_prompted', 'true');
      
      setProfile(account.profile);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      setAuthUsername('');
      setAuthPassword('');
    } catch (e) {
      setAuthError('Error al iniciar sesión.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('geometry_dash_logged_in_user');
    setIsLoggedIn(false);
    const guestProfile: UserProfile = {
      username: 'Invitado_' + Math.floor(Math.random() * 9000 + 1000),
      stars: 12,
      orbs: 150,
      diamonds: 8,
      completedCount: 0
    };
    setProfile(guestProfile);
  };

  // Reload custom levels from local storage whenever view changes
  useEffect(() => {
    setCustomLevels(getCustomLevels());
  }, [view]);

  // Synchronize player profile with the server
  useEffect(() => {
    const registerPlayerOnServer = async () => {
      if (!profile || !profile.username) return;
      try {
        await fetch('/api/players/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: profile.username,
            skins,
            stats: profile,
            createdLevels: customLevels.map(lvl => ({ id: lvl.id, name: lvl.name }))
          })
        });
      } catch (e) {
        console.warn('Could not sync player profile with server:', e);
      }
    };
    registerPlayerOnServer();
  }, [profile, skins, customLevels]);

  // Check the daily chest cooldown on mount and every second
  useEffect(() => {
    const checkCooldown = () => {
      try {
        const lastOpen = localStorage.getItem('geometry_dash_last_chest_time');
        if (!lastOpen) {
          setCanOpenChest(true);
          setCountdownText('');
          return;
        }

        const lastOpenTime = parseInt(lastOpen, 10);
        const currentTime = Date.now();
        const duration = 24 * 60 * 60 * 1000; // 24 hours in ms
        const remaining = lastOpenTime + duration - currentTime;

        if (remaining <= 0) {
          setCanOpenChest(true);
          setCountdownText('');
        } else {
          setCanOpenChest(false);
          // Format remaining time to HH:MM:SS
          const hrs = Math.floor(remaining / (1000 * 60 * 60));
          const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((remaining % (1000 * 60)) / 1000);
          setCountdownText(
            `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
          );
        }
      } catch (e) {
        console.error(e);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [showChestModal, chestOpened]);

  // Save skins change
  const handleSkinsChange = (updated: PlayerSkins) => {
    setSkins(updated);
    try {
      localStorage.setItem('geometry_dash_skins', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartGame = (level: Level) => {
    setSelectedLevel(level);
    setViewState('playing');
  };

  const handleOpenEditor = (level: Level | null) => {
    setSelectedLevel(level);
    setViewState('editor');
  };

  const handleClaimReward = (rewardLevel: number, reward: any) => {
    audio.playClick();
    setProfile(prev => {
      const currentClaimed = prev.claimedRewards || [];
      if (currentClaimed.includes(rewardLevel)) return prev;
      return {
        ...prev,
        orbs: prev.orbs + reward.orbs,
        diamonds: prev.diamonds + reward.diamonds,
        stars: prev.stars + reward.stars,
        claimedRewards: [...currentClaimed, rewardLevel]
      };
    });
  };

  // Open daily chest prize trigger (strictly enforces 24 hour lockout)
  const handleOpenChest = () => {
    if (!canOpenChest) return;

    const rewards = [
      { text: '¡Has ganado +250 Orbes de Poder! 💎', type: 'orbs', amount: 250 },
      { text: '¡Has ganado +15 Diamantes Azules! 💠', type: 'diamonds', amount: 15 },
      { text: '¡Has desbloqueado +5 Estrellas Doradas! ⭐', type: 'stars', amount: 5 },
      { text: '¡Has ganado +500 Orbes de Poder! 💎', type: 'orbs', amount: 500 },
      { text: '¡Has conseguido +30 Diamantes Azules! 💠', type: 'diamonds', amount: 30 },
      { text: '¡Has ganado +10 Estrellas Doradas! ⭐', type: 'stars', amount: 10 }
    ];

    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    setChestReward(randomReward.text);
    setChestOpened(true);
    setCanOpenChest(false);

    // Save timestamp of unlock in local storage
    localStorage.setItem('geometry_dash_last_chest_time', Date.now().toString());

    // Update profile stats dynamically!
    setProfile(prev => {
      const updated = { ...prev };
      if (randomReward.type === 'orbs') updated.orbs += randomReward.amount;
      if (randomReward.type === 'diamonds') updated.diamonds += randomReward.amount;
      if (randomReward.type === 'stars') updated.stars += randomReward.amount;
      return updated;
    });
  };

  // Callback from GameCanvas when a run finishes or player crashes
  const handleProgressUpdate = (percentage: number, attemptsCount: number, isWon: boolean, isPractice?: boolean) => {
    if (!selectedLevel) return;
    
    // Save locally
    const currentProgress = getLevelProgress(selectedLevel.id);
    let updated;
    if (isPractice) {
      updated = saveLevelPracticeProgress(selectedLevel.id, percentage);
    } else {
      updated = saveLevelProgress(selectedLevel.id, percentage, attemptsCount, isWon);
    }

    // Calculate XP gained from progress
    const previousMaxPercentage = isPractice ? currentProgress.practiceProgress || 0 : currentProgress.normalProgress || 0;
    const progressGain = Math.max(0, percentage - previousMaxPercentage);
    
    // XP is awarded for hitting new milestones in progress!
    // Practice mode awards slightly reduced XP (0.5 XP per 1% progress, no completion bonus)
    let xpGained = 0;
    if (isPractice) {
      xpGained = Math.floor(progressGain * 0.5);
    } else {
      xpGained = Math.floor(progressGain * 1.5); // 1.5 XP per 1% progress
      if (isWon && !currentProgress.completed) {
        xpGained += 150; // Massively rewarding first completion!
      }
    }

    // Award reward points if level is completed for the first time (only in normal mode!)
    if ((isWon && !currentProgress.completed && !isPractice) || xpGained > 0) {
      setProfile(prev => {
        const starsGained = selectedLevel.starsReward || 3;
        const orbsGained = selectedLevel.orbsReward || 100;
        const diamondsGained = Math.ceil(starsGained / 2) + 2;

        const currentXP = prev.xp || 0;
        // Cap level at 100, which is reached at 100 * 200 = 20000 XP
        const nextXP = Math.min(20000, currentXP + xpGained);

        const earnedStars = (isWon && !currentProgress.completed && !isPractice) ? starsGained : 0;
        const earnedOrbs = (isWon && !currentProgress.completed && !isPractice) ? orbsGained : 0;
        const earnedDiamonds = (isWon && !currentProgress.completed && !isPractice) ? diamondsGained : 0;
        const earnedCompleted = (isWon && !currentProgress.completed && !isPractice) ? 1 : 0;

        return {
          ...prev,
          stars: prev.stars + earnedStars,
          orbs: prev.orbs + earnedOrbs,
          diamonds: prev.diamonds + earnedDiamonds,
          completedCount: prev.completedCount + earnedCompleted,
          xp: nextXP
        };
      });
    }
  };

  const handleDeleteLevel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmLevelId(id);
  };

  // Create brand new project helper
  const handleCreateNewProject = () => {
    setNewProjectName('Mi Nivel ' + (customLevels.length + 1));
    setNewProjectModal(true);
  };

  const handleConfirmCreateProject = () => {
    const cleanName = newProjectName.trim() || ('Mi Nivel ' + (customLevels.length + 1));

    const newLvl: Level = {
      id: 'custom_' + Date.now(),
      name: cleanName,
      difficulty: 'normal',
      elements: [
        { id: 'start_block', x: 5, y: 0, type: 'block' } // seed with initial block
      ],
      isCustom: true
    };

    saveCustomLevel(newLvl);
    setCustomLevels(getCustomLevels());
    localStorage.setItem('geometry_dash_last_edited_id', newLvl.id);

    setSelectedLevel(newLvl);
    setViewState('editor');
    setShowEditorHub(false);
    setNewProjectModal(false);
  };

  const handleConfirmDeleteLevel = () => {
    if (!deleteConfirmLevelId) return;
    deleteCustomLevel(deleteConfirmLevelId);
    setCustomLevels(getCustomLevels());
    setDeleteConfirmLevelId(null);
  };

  // Find last edited project helper
  const getLastEditedLevel = (): Level | null => {
    if (customLevels.length === 0) return null;
    const lastId = localStorage.getItem('geometry_dash_last_edited_id');
    const found = customLevels.find(l => l.id === lastId);
    return found || customLevels[customLevels.length - 1]; // fallback to the latest
  };

  // Upload custom level to online sharing (Real backend Express API with fallback)
  const handleUploadLevel = (level: Level, e: React.MouseEvent) => {
    e.stopPropagation();
    setPublishLevelModal(level);
    setPublishAuthorName(profile.username);
  };

  const handleConfirmPublishLevel = async () => {
    if (!publishLevelModal) return;
    const cleanAuthor = publishAuthorName.trim() || profile.username;
    if (cleanAuthor) {
      setProfile(prev => ({ ...prev, username: cleanAuthor }));
    }

    try {
      const res = await fetch('/api/online-levels/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: publishLevelModal, author: cleanAuthor })
      });
      if (res.ok) {
        const uploaded = await res.json();
        alert(`¡Nivel "${publishLevelModal.name}" PUBLICADO ONLINE CON ÉXITO! Código de Nivel: ${uploaded.id}\n\nAhora cualquier jugador puede buscarlo, jugarlo, calificarlo y comentarlo.`);
        setViewState('online_browser');
        setPublishLevelModal(null);
        return;
      }
    } catch (err) {
      console.error('API sharing failed, falling back to cached LocalStorage:', err);
    }

    const onlineLvl = uploadCustomLevelToOnline(publishLevelModal, cleanAuthor);
    alert(`¡Nivel "${publishLevelModal.name}" guardado en tu caché online local (Servidor temporal).\n\nAhora cualquier jugador en tu navegador puede buscarlo, calificarlo, comentarlo y jugarlo en el Buscador Online.`);
    setViewState('online_browser');
    setPublishLevelModal(null);
  };

  return (
    <div className="relative bg-slate-950 text-white font-sans overflow-y-auto md:overflow-hidden flex items-center justify-center p-0 select-none w-screen min-h-screen" style={{ minHeight: '100dvh' }}>
      <AnimatePresence mode="wait">
        
        {/* 1. VIEW ROUTER: GAMEPLAY CANVAS ACTIVE */}
        {view === 'playing' && selectedLevel && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="w-full h-full flex flex-col"
          >
            <GameCanvas
              level={selectedLevel}
              skins={skins}
              multiplayerState={multiplayerState}
              username={profile.username}
              onExit={() => {
                if (multiplayerState.isMultiplayer) {
                  // Reset multiplayer gameplay states and return to multiplayer screen
                  setMultiplayerState({
                    isMultiplayer: false,
                    roomId: null,
                    socket: null,
                    players: [],
                    isLeader: false
                  });
                  setViewState('multiplayer');
                } else if (cameFromEditor) {
                  setViewState('editor');
                  setCameFromEditor(false);
                } else {
                  setViewState(selectedLevel.id.startsWith('shared_') ? 'online_browser' : 'levels');
                }
              }}
              onProgress={handleProgressUpdate}
            />
          </motion.div>
        )}

        {/* 2. VIEW ROUTER: SKIN CUSTOMIZER ACTIVE */}
        {view === 'customizer' && (
          <motion.div
            key="customizer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="w-full h-full"
          >
            <SkinCustomizer
              skins={skins}
              onSkinsChange={handleSkinsChange}
              onClose={() => setViewState('menu')}
              profile={profile}
              onProfileChange={setProfile}
            />
          </motion.div>
        )}

        {/* 3. VIEW ROUTER: LEVEL BUILDER EDITOR ACTIVE */}
        {view === 'editor' && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="w-full h-full"
          >
            <LevelBuilder
              initialLevel={selectedLevel}
              onSaveAndClose={() => setViewState('menu')}
              onPlaytest={(testLevel) => {
                setSelectedLevel(testLevel);
                setCameFromEditor(true);
                setViewState('playing');
              }}
            />
          </motion.div>
        )}

        {/* 4. VIEW ROUTER: ONLINE SHARING BROWSER PLATFORM */}
        {view === 'online_browser' && (
          <motion.div
            key="online_browser"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="w-full h-full"
          >
            <OnlineLevelBrowser
              skins={skins}
              onPlayLevel={handleStartGame}
              onClose={() => setViewState('menu')}
              username={profile.username}
            />
          </motion.div>
        )}

        {/* 4.5. VIEW ROUTER: ONLINE MULTIPLAYER MODE */}
        {view === 'multiplayer' && (
          <motion.div
            key="multiplayer"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="w-full h-full"
          >
            <MultiplayerMenu
              profile={profile}
              skins={skins}
              onBack={() => setViewState('menu')}
              onStartMultiplayerGame={handleStartMultiplayerGame}
              customLevels={customLevels}
              officialLevels={DEFAULT_LEVELS}
            />
          </motion.div>
        )}

        {/* 5. VIEW ROUTER: LEVEL SELECT CAROUSEL ACTIVE */}
        {view === 'levels' && (
          <motion.div
            key="levels"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className={`w-full h-full relative flex flex-col justify-between select-none overflow-hidden ${levelSelectTab === 'official' ? 'bg-[#0024f0]' : 'bg-slate-900'} p-4 sm:p-6 pb-2 sm:pb-4`}
          >
          
          {/* Info Modal Dialog */}
          {levelSelectTab === 'official' && (
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-500 z-30 opacity-80" />
          )}

          {/* Top Header / Navigation row */}
          <div className="z-20 flex items-center justify-between w-full relative">
            {/* Back Button (Classic GD styled) */}
            <button
              onClick={() => setViewState('menu')}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 hover:bg-green-400 border-[3px] border-black rounded-full flex items-center justify-center cursor-pointer shadow-[0_4px_0_#000] hover:scale-110 active:scale-95 active:translate-y-0.5 transition-all text-white font-black"
              title="Volver al Menú Principal"
            >
              <span className="text-xl sm:text-2xl -translate-x-0.5">◀</span>
            </button>

            {/* Tab Swapper to let users access both Official Levels & custom creations */}
            <div className="flex gap-2 bg-black/45 p-1 rounded-2xl border border-white/10 shadow-inner">
              <button
                onClick={() => setLevelSelectTab('official')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-widest transition cursor-pointer ${levelSelectTab === 'official' ? 'bg-gradient-to-b from-yellow-300 to-yellow-500 text-black border-2 border-black shadow-[0_2px_0_#000]' : 'text-slate-300 hover:text-white border-2 border-transparent'}`}
                style={{
                  textShadow: levelSelectTab === 'official' ? 'none' : '1px 1px 0px #000'
                }}
              >
                Oficiales
              </button>
              <button
                onClick={() => setLevelSelectTab('custom')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-widest transition cursor-pointer ${levelSelectTab === 'custom' ? 'bg-gradient-to-b from-yellow-300 to-yellow-500 text-black border-2 border-black shadow-[0_2px_0_#000]' : 'text-slate-300 hover:text-white border-2 border-transparent'}`}
                style={{
                  textShadow: levelSelectTab === 'custom' ? 'none' : '1px 1px 0px #000'
                }}
              >
                Creados ({customLevels.length})
              </button>
            </div>

            {/* Info Button (Classic GD Cyan circle with "i") */}
            {levelSelectTab === 'official' ? (
              <button
                onClick={() => alert(`ℹ️ GUÍA DE JUEGO ℹ️\n\n• Controles: Presiona ESPACIO, Flecha Arriba o Haz Clic para Saltar.\n• Portales de Vehículo:\n   - Verde: Cubo Clásico\n   - Azul: Wave (Vuelo en zigzag)\n   - Rosa/Naranja: Robot (Mantén presionado para saltar más alto)\n   - Morado: Rueda (Cambia la gravedad con cada clic)\n\n¡Consigue el 100% en todos los niveles para demostrar tu destreza!`)}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-400 hover:bg-cyan-300 border-[3px] border-black rounded-full flex items-center justify-center cursor-pointer shadow-[0_4px_0_#000] hover:scale-110 active:scale-95 active:translate-y-0.5 transition-all text-white font-serif font-black text-lg sm:text-xl"
                title="Información de Niveles"
              >
                i
              </button>
            ) : (
              <div className="w-10 sm:w-12" /> // spacer to keep balance
            )}
          </div>

          {/* MAIN TAB SWITCH VIEWPORT */}
          {levelSelectTab === 'official' ? (
            /* OFFICIAL GD CAROUSEL VIEWPORT */
            <div className="flex-1 flex flex-col justify-center items-center my-auto relative z-10 w-full px-12 max-w-[700px] mx-auto">
              
              {/* Previous Level Trigger Arrow (Left side of screen) */}
              <button
                onClick={() => {
                  setOfficialLevelIndex((prev) => (prev - 1 + DEFAULT_LEVELS.length) % DEFAULT_LEVELS.length);
                }}
                className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center text-white hover:scale-125 transition-transform duration-150 cursor-pointer text-4xl sm:text-5xl font-black filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] select-none text-shadow-gd active:scale-90"
                style={{
                  textShadow: '4px 4px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 2px 2px 0px #000'
                }}
              >
                ◀
              </button>

              {/* Next Level Trigger Arrow (Right side of screen) */}
              <button
                onClick={() => {
                  setOfficialLevelIndex((prev) => (prev + 1) % DEFAULT_LEVELS.length);
                }}
                className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center text-white hover:scale-125 transition-transform duration-150 cursor-pointer text-4xl sm:text-5xl font-black filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] select-none text-shadow-gd active:scale-90"
                style={{
                  textShadow: '4px 4px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 2px 2px 0px #000'
                }}
              >
                ▶
              </button>

              {(() => {
                const currentLevel = DEFAULT_LEVELS[officialLevelIndex];
                if (!currentLevel) return null;
                const progress = getLevelProgress(currentLevel.id);
                
                // Fetch difficulty color mapping
                let starReward = currentLevel.starsReward || (currentLevel.difficulty === 'easy' ? 1 : currentLevel.difficulty === 'normal' ? 3 : 5);

                return (
                  <div className="w-full flex flex-col items-center animate-fade-in mt-1 landscape:mt-0">
                    
                    {/* CENTERED LEVEL CARD */}
                    <div
                      onClick={() => handleStartGame(currentLevel)}
                      className="w-full max-w-[460px] bg-[#001047] border-[4px] border-[#000520] rounded-[24px] p-5 sm:p-6 shadow-[0_12px_24px_rgba(0,0,0,0.6)] hover:scale-103 hover:border-cyan-400 active:scale-97 transition-all duration-200 cursor-pointer relative select-none flex flex-col justify-between min-h-[140px] sm:min-h-[170px]"
                    >
                      {/* Star points reward at top-right of card */}
                      <div className="absolute top-3.5 right-4 flex items-center gap-1 font-mono font-black text-yellow-400 text-sm sm:text-base tracking-wider filter drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.9)]">
                        <span>{starReward}</span>
                        <span className="text-yellow-400 text-base sm:text-lg">⭐</span>
                      </div>

                      {/* Middle row: Difficulty face & Level Name */}
                      <div className="flex items-center gap-3.5 sm:gap-5 mt-3 sm:mt-4">
                        {/* Difficulty Face SVG */}
                        <div className="flex-shrink-0">
                          {(() => {
                            switch (currentLevel.difficulty) {
                              case 'easy':
                                return (
                                  <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-18 sm:h-18 filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)]">
                                    <circle cx="50" cy="50" r="45" fill="#00c8ff" stroke="#000" strokeWidth="5" />
                                    <ellipse cx="32" cy="40" rx="6.5" ry="8.5" fill="#000" />
                                    <ellipse cx="68" cy="40" rx="6.5" ry="8.5" fill="#000" />
                                    <circle cx="32" cy="38" r="2.5" fill="#fff" />
                                    <circle cx="68" cy="38" r="2.5" fill="#fff" />
                                    <path d="M 22 55 Q 50 85 78 55 Z" fill="#000" stroke="#000" strokeWidth="3" />
                                    <rect x="29" y="55" width="6" height="4.5" fill="#fff" rx="1.5" />
                                    <rect x="37" y="55" width="6" height="4.5" fill="#fff" rx="1.5" />
                                    <rect x="45" y="55" width="6" height="4.5" fill="#fff" rx="1.5" />
                                    <rect x="53" y="55" width="6" height="4.5" fill="#fff" rx="1.5" />
                                    <rect x="61" y="55" width="6" height="4.5" fill="#fff" rx="1.5" />
                                    <rect x="69" y="55" width="6" height="4.5" fill="#fff" rx="1.5" />
                                    <circle cx="18" cy="48" r="4" fill="#ff4d4d" opacity="0.6" />
                                    <circle cx="82" cy="48" r="4" fill="#ff4d4d" opacity="0.6" />
                                  </svg>
                                );
                              case 'normal':
                                return (
                                  <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-18 sm:h-18 filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)]">
                                    <circle cx="50" cy="50" r="45" fill="#4ade80" stroke="#000" strokeWidth="5" />
                                    <ellipse cx="32" cy="42" rx="6.5" ry="8.5" fill="#000" />
                                    <ellipse cx="68" cy="42" rx="6.5" ry="8.5" fill="#000" />
                                    <circle cx="32" cy="39" r="2.5" fill="#fff" />
                                    <circle cx="68" cy="39" r="2.5" fill="#fff" />
                                    <path d="M 26 56 Q 50 78 74 56" fill="none" stroke="#000" strokeWidth="6" strokeLinecap="round" />
                                  </svg>
                                );
                              case 'hard':
                                return (
                                  <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-18 sm:h-18 filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)]">
                                    <circle cx="50" cy="50" r="45" fill="#fbbf24" stroke="#000" strokeWidth="5" />
                                    <path d="M 18 32 L 44 41" stroke="#000" strokeWidth="6" strokeLinecap="round" />
                                    <path d="M 82 32 L 56 41" stroke="#000" strokeWidth="6" strokeLinecap="round" />
                                    <circle cx="30" cy="47" r="6" fill="#000" />
                                    <circle cx="70" cy="47" r="6" fill="#000" />
                                    <circle cx="30" cy="45" r="1.5" fill="#fff" />
                                    <circle cx="70" cy="45" r="1.5" fill="#fff" />
                                    <path d="M 32 68 Q 50 60 68 68" fill="none" stroke="#000" strokeWidth="6" strokeLinecap="round" />
                                  </svg>
                                );
                              case 'harder':
                              default:
                                return (
                                  <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-18 sm:h-18 filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)]">
                                    <circle cx="50" cy="50" r="45" fill="#f97316" stroke="#000" strokeWidth="5" />
                                    <path d="M 16 30 L 44 42" stroke="#000" strokeWidth="7" strokeLinecap="round" />
                                    <path d="M 84 30 L 56 42" stroke="#000" strokeWidth="7" strokeLinecap="round" />
                                    <ellipse cx="28" cy="49" rx="6.5" ry="7.5" fill="#000" />
                                    <ellipse cx="72" cy="49" rx="6.5" ry="7.5" fill="#000" />
                                    <circle cx="28" cy="47" r="1.5" fill="#fff" />
                                    <circle cx="72" cy="47" r="1.5" fill="#fff" />
                                    <path d="M 30 70 Q 50 56 70 70" fill="none" stroke="#000" strokeWidth="6" strokeLinecap="round" />
                                  </svg>
                                );
                            }
                          })()}
                        </div>

                        {/* Title text with classic thick stroke GD styled shadow */}
                        <div className="flex-1 min-w-0 pr-8">
                          <h3
                            className="font-black uppercase tracking-wider text-white text-2xl sm:text-3xl tracking-wide select-none truncate text-left filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.7)]"
                            style={{
                              fontFamily: '"Space Grotesk", sans-serif',
                              textShadow: '3px 3px 0px #000, -1.5px -1.5px 0px #000, 1.5px -1.5px 0px #000, -1.5px 1.5px 0px #000, 1.5px 1.5px 0px #000'
                            }}
                          >
                            {currentLevel.name}
                          </h3>
                        </div>
                      </div>

                      {/* Stars/Coins Row (Bottom Right) */}
                      <div className="mt-4 sm:mt-5 flex justify-end items-center gap-1.5">
                        {/* 3 Gold Secret Coins */}
                        {[1, 2, 3].map(coin => (
                          <div
                            key={coin}
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-black flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-all ${progress.normalProgress === 100 ? 'bg-gradient-to-b from-yellow-300 to-amber-500 scale-105 rotate-12' : 'bg-amber-600/30 brightness-50'}`}
                            title={progress.normalProgress === 100 ? "Moneda secreta conseguida" : "Completa el nivel al 100% para reclamar monedas"}
                          >
                            {/* Inner gold star shape icon */}
                            <svg className={`w-3.5 h-3.5 ${progress.normalProgress === 100 ? 'text-white' : 'text-amber-500'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* DUAL PROGRESS BARS SUB-PANEL */}
                    <div className="w-full max-w-[460px] flex flex-col gap-2 mt-4 sm:mt-5">
                      
                      {/* NORMAL MODE PROGRESS */}
                      <div className="flex flex-col items-center">
                        <div
                          className="font-extrabold uppercase text-white text-xs sm:text-sm tracking-widest mb-1 filter drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.9)]"
                          style={{ textShadow: '1.5px 1.5px 0px #000' }}
                        >
                          NORMAL MODE
                        </div>
                        <div className="w-full h-7 sm:h-8 bg-slate-950/80 border-[3.5px] border-black rounded-full overflow-hidden relative flex items-center justify-center shadow-[0_3px_5px_rgba(0,0,0,0.4)]">
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-[#00ff00] border-r-[2.5px] border-black transition-all duration-1000 ease-out"
                            style={{ width: `${progress.normalProgress || 0}%` }}
                          />
                          <span
                            className="z-10 font-black text-xs sm:text-sm text-white tracking-widest text-shadow-gd"
                            style={{ textShadow: '1.5px 1.5px 0px #000' }}
                          >
                            {progress.normalProgress || 0}%
                          </span>
                        </div>
                      </div>

                      {/* PRACTICE MODE PROGRESS */}
                      <div className="flex flex-col items-center mt-1">
                        <div
                          className="font-extrabold uppercase text-white text-xs sm:text-sm tracking-widest mb-1 filter drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.9)]"
                          style={{ textShadow: '1.5px 1.5px 0px #000' }}
                        >
                          PRACTICE MODE
                        </div>
                        <div className="w-full h-7 sm:h-8 bg-slate-950/80 border-[3.5px] border-black rounded-full overflow-hidden relative flex items-center justify-center shadow-[0_3px_5px_rgba(0,0,0,0.4)]">
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-[#00ffff] border-r-[2.5px] border-black transition-all duration-1000 ease-out"
                            style={{ width: `${progress.practiceProgress || 0}%` }}
                          />
                          <span
                            className="z-10 font-black text-xs sm:text-sm text-white tracking-widest text-shadow-gd"
                            style={{ textShadow: '1.5px 1.5px 0px #000' }}
                          >
                            {progress.practiceProgress || 0}%
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* DOWNLOAD THE SOUNDTRACKS BUTTON */}
              <div className="w-full max-w-[460px] mt-4 sm:mt-5 z-20">
                <button
                  onClick={() => alert("🎵 DESCARGAR SOUNDTRACKS 🎵\n\nLas canciones originales de Geometry Dash están disponibles gratis en Newgrounds.\n\n¡Disfruta del juego y crea tus propios mapas con pistas editables!")}
                  className="w-full py-2 bg-[#2d3a60]/85 hover:bg-[#3d4b7c] border-[3px] border-black rounded-xl text-center text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-cyan-300 hover:text-white transition cursor-pointer shadow-[0_3.5px_0_#000] active:translate-y-0.5 active:shadow-[0_1px_0_#000] text-shadow-gd"
                  style={{ textShadow: '1.5px 1.5px 0px #000' }}
                >
                  DOWNLOAD THE SOUNDTRACKS
                </button>
              </div>

            </div>
          ) : (
            /* CUSTOM CREATED LEVELS LIST VIEWPORT */
            <div className="flex-1 flex flex-col justify-start w-full max-w-4xl mx-auto px-4 py-3 z-10 overflow-hidden">
              <div className="mb-4 pb-2 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold uppercase text-yellow-500 tracking-wider font-mono">Taller de Diseño</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Edita tus propios mapas o expórtalos a los servidores</p>
                </div>
                <button
                  onClick={() => handleOpenEditor(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-b from-yellow-400 to-amber-500 border-2 border-black rounded-xl text-[10px] font-black text-black uppercase transition shadow-[0_2px_0_#000] hover:scale-105"
                >
                  <Plus className="w-3.5 h-3.5" /> Nuevo Proyecto
                </button>
              </div>

              {/* SCROLLABLE LIST OF USER CREATED MAPS */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[58vh] scrollbar-thin">
                {customLevels.length > 0 ? (
                  customLevels.map(level => {
                    const progress = getLevelProgress(level.id);
                    return (
                      <div
                        key={level.id}
                        className="p-3.5 rounded-2xl border border-yellow-900/30 bg-amber-950/10 hover:border-yellow-500/40 transition cursor-pointer flex justify-between items-center group shadow"
                        onClick={() => handleStartGame(level)}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-extrabold text-yellow-300 truncate tracking-wide flex items-center gap-1.5 uppercase">
                            <Wrench className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                            {level.name}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                              Personalizado
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">({level.elements.length} obj)</span>
                            {progress.normalProgress > 0 && (
                              <span className="text-[9px] font-mono text-slate-400 font-bold">
                                Mejor: <span className="text-yellow-400">{progress.normalProgress}%</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                          {/* Share / Upload to cloud */}
                          <button
                            onClick={(e) => handleUploadLevel(level, e)}
                            className="p-2 bg-slate-800 hover:bg-cyan-500 text-slate-400 hover:text-black rounded-xl transition"
                            title="Publicar en Servidores Online"
                          >
                            <CloudUpload className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Edit level in builder */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditor(level);
                            }}
                            className="p-2 bg-slate-800 hover:bg-yellow-500 text-slate-400 hover:text-slate-950 rounded-xl transition"
                            title="Editar mapa"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete level */}
                          <button
                            onClick={(e) => handleDeleteLevel(level.id, e)}
                            className="p-2 bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white rounded-xl transition"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center text-slate-500 font-mono text-xs flex flex-col items-center justify-center gap-3 bg-slate-950/20">
                    No tienes mapas creados en local todavía. ¡Usa el taller para inventar tus propios desafíos!
                    <button
                      onClick={() => handleOpenEditor(null)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-xl text-xs tracking-wider uppercase transition border border-slate-700"
                    >
                      <Plus className="w-4 h-4" /> Empezar a Construir
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DOTS PAGINATION & DECORATIVE PILLARS BOTTOM ROW */}
          <div className="relative w-full flex flex-col items-center justify-center z-10 pt-1 mt-auto select-none pointer-events-none">
            {/* Dots Indicator for official carousel */}
            {levelSelectTab === 'official' && (
              <div className="flex gap-2.5 justify-center items-center py-2 bg-black/25 px-5 rounded-full border border-white/5 pointer-events-auto">
                {DEFAULT_LEVELS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setOfficialLevelIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full border border-black/60 transition-all cursor-pointer ${idx === officialLevelIndex ? 'bg-white scale-125 shadow-md shadow-white/40' : 'bg-white/40 hover:bg-white/70'}`}
                    title={`Ver nivel ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Left Corner Steps (Teal / Green staircases) */}
            {levelSelectTab === 'official' && (
              <div className="absolute bottom-0 left-0 flex flex-col items-start pointer-events-none z-10 scale-90 origin-bottom-left">
                {/* Step 3 */}
                <div className="w-7 h-5 bg-gradient-to-b from-[#49e35b] to-[#12a123] border-t-2 border-r-2 border-white"></div>
                {/* Step 2 */}
                <div className="flex">
                  <div className="w-7 h-5 bg-gradient-to-b from-[#12a123] to-[#04610f] border-r-2 border-white"></div>
                  <div className="w-7 h-5 bg-gradient-to-b from-[#49e35b] to-[#12a123] border-t-2 border-r-2 border-white"></div>
                </div>
                {/* Step 1 */}
                <div className="flex">
                  <div className="w-7 h-5 bg-gradient-to-b from-[#12a123] to-[#04610f] border-r-2 border-white"></div>
                  <div className="w-7 h-5 bg-gradient-to-b from-[#12a123] to-[#04610f] border-r-2 border-white"></div>
                  <div className="w-7 h-5 bg-gradient-to-b from-[#49e35b] to-[#12a123] border-t-2 border-r-2 border-white"></div>
                </div>
              </div>
            )}

            {/* Right Corner Steps (Teal / Green staircases mirroring Left) */}
            {levelSelectTab === 'official' && (
              <div className="absolute bottom-0 right-0 flex flex-col items-end pointer-events-none z-10 scale-90 origin-bottom-right">
                {/* Step 3 */}
                <div className="w-7 h-5 bg-gradient-to-b from-[#49e35b] to-[#12a123] border-t-2 border-l-2 border-white"></div>
                {/* Step 2 */}
                <div className="flex">
                  <div className="w-7 h-5 bg-gradient-to-b from-[#49e35b] to-[#12a123] border-t-2 border-l-2 border-white"></div>
                  <div className="w-7 h-5 bg-gradient-to-b from-[#12a123] to-[#04610f] border-l-2 border-white"></div>
                </div>
                {/* Step 1 */}
                <div className="flex">
                  <div className="w-7 h-5 bg-gradient-to-b from-[#49e35b] to-[#12a123] border-t-2 border-l-2 border-white"></div>
                  <div className="w-7 h-5 bg-gradient-to-b from-[#12a123] to-[#04610f] border-l-2 border-white"></div>
                  <div className="w-7 h-5 bg-gradient-to-b from-[#12a123] to-[#04610f] border-l-2 border-white"></div>
                </div>
              </div>
            )}
          </div>

        </motion.div>
      )}

        {/* 5. VIEW ROUTER: CLASSIC HOMEPAGE MENU ACTIVE */}
        {view === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="w-full min-h-screen sm:h-full bg-purple-950 relative flex flex-col justify-between p-4 sm:p-8 select-none gap-4 overflow-y-auto sm:overflow-visible"
          >
          
          {/* Animated Mountains Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-[#7c2d12]/10 via-[#6d28d9] to-[#3b0764]">
            {/* Parallax Mountains */}
            <svg className="absolute bottom-0 w-full h-1/2 opacity-40 fill-purple-900" viewBox="0 0 800 200" preserveAspectRatio="none">
              <polygon points="0,200 120,50 240,200 320,80 440,200 560,40 680,200 750,90 800,200" />
            </svg>
            <svg className="absolute bottom-0 w-full h-1/3 opacity-50 fill-purple-950" viewBox="0 0 800 200" preserveAspectRatio="none">
              <polygon points="0,200 180,60 360,200 480,90 600,200 700,70 800,200" />
            </svg>
          </div>

          {/* Upper Profile Info Bar & Stats (Save System!) */}
          <div className="z-10 flex flex-col xl:flex-row gap-4 justify-between xl:items-center bg-black/45 backdrop-blur px-5 py-3 rounded-2xl border border-purple-800/40 shadow-xl">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <PlayerLevelBar
                profile={profile}
                skins={skins}
                onClick={() => {
                  audio.playClick();
                  setShowRewardsModal(true);
                }}
              />
              
              <div className="flex sm:flex-col gap-2 shrink-0 justify-center">
                <button
                  onClick={() => {
                    setAuthError('');
                    setAuthMode(isLoggedIn ? 'login' : 'register');
                    setShowAuthModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 px-3.5 py-1.5 rounded-xl cursor-pointer transition text-white active:scale-95 text-[10px] font-black font-mono uppercase group"
                >
                  <User className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="tracking-wider text-cyan-300">
                    {isLoggedIn ? 'Cuentas' : 'Login / Registro'}
                  </span>
                </button>
                
                {isLoggedIn && (
                  <button
                    onClick={handleLogout}
                    className="flex-1 text-[9px] font-mono font-black text-rose-400 hover:text-rose-300 hover:bg-rose-950 bg-rose-950/40 px-2.5 py-1.5 rounded-xl border border-rose-900/40 cursor-pointer transition uppercase text-center"
                    title="Cerrar Sesión"
                  >
                    Salir
                  </button>
                )}
              </div>
            </div>

            {/* Profile points counters */}
            <div className="flex items-center gap-4 sm:gap-5 font-mono text-xs overflow-x-auto py-1 sm:py-0">
              <div className="flex items-center gap-1.5 text-yellow-400" title="Estrellas ganadas">
                <span className="text-sm">⭐</span>
                <span className="font-bold">{profile.stars}</span>
              </div>
              <div className="flex items-center gap-1.5 text-pink-400" title="Orbes de Poder">
                <span className="text-sm">💎</span>
                <span className="font-bold">{profile.orbs}</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-400" title="Diamantes Azules">
                <span className="text-sm">💠</span>
                <span className="font-bold">{profile.diamonds}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 border-l border-purple-800/60 pl-4" title="Niveles completados">
                <Trophy className="w-3.5 h-3.5" />
                <span className="font-bold">{profile.completedCount}</span>
              </div>
            </div>
          </div>

          {/* MAIN GEOMETRY DASH TITLE */}
          <div className="z-10 flex flex-col items-center justify-center text-center my-auto">
            <h1 className="text-6xl sm:text-8xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#00FF00] to-[#10B981] select-none uppercase py-2"
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  filter: 'drop-shadow(0 4px 0 #000000) drop-shadow(0 6px 12px rgba(16,185,129,0.3))',
                  WebkitTextStroke: '2.5px #000000'
                }}>
              GEOMETRY DASH
            </h1>
            <p className="text-xs text-green-300 font-mono font-bold uppercase tracking-[0.25em] mt-1 select-none">
              ONLINE SHARING & MULTIPLAYER STUDIO
            </p>
          </div>

          {/* FOUR MAIN CENTERED BUTTONS (Including Online Browser!) */}
          <div className="z-10 flex items-center justify-center gap-5 sm:gap-8 my-auto">
            
            {/* BUTTON 1: SKIN CUSTOMIZER (Left) */}
            <button
              onClick={() => setViewState('customizer')}
              className="w-18 h-18 sm:w-22 sm:h-22 bg-gradient-to-b from-green-400 to-green-600 border-[3px] border-black rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer group"
              style={{
                boxShadow: '0 6px 0 #000000, 0 10px 15px rgba(0,0,0,0.4)',
              }}
              title="Personalizar Personaje"
            >
              {/* Cubo icon face inside golden frame */}
              <div className="w-11 h-11 bg-yellow-400 border-[2px] border-black rounded-lg flex flex-col items-center justify-center relative shadow-inner group-hover:rotate-12 transition">
                <div className="flex gap-2 mt-1.5">
                  <div className="w-2 h-2.5 bg-black rounded-sm" />
                  <div className="w-2 h-2.5 bg-black rounded-sm" />
                </div>
                <div className="w-6 h-1.5 bg-black rounded-sm mt-2" />
              </div>
            </button>

            {/* BUTTON 2: PLAY LEVEL SELECTOR (Center-left, largest!) */}
            <button
              onClick={() => setViewState('levels')}
              className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-b from-green-400 to-green-600 border-[4px] border-black rounded-3xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer group"
              style={{
                boxShadow: '0 8px 0 #000000, 0 15px 20px rgba(0,0,0,0.5)',
              }}
              title="Jugar Niveles Locales"
            >
              <div className="w-14 h-14 bg-yellow-400 border-[2.5px] border-black rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden group-hover:rotate-6 transition">
                <PlayIcon className="w-7 h-7 text-black fill-current translate-x-0.5" />
                <div className="absolute inset-0 bg-white/25 -translate-y-full rotate-45 group-hover:translate-y-full transition-transform duration-1000" />
              </div>
            </button>

            {/* BUTTON: ONLINE MULTIPLAYER (Stunning orange-red center button!) */}
            <button
              onClick={() => setViewState('multiplayer')}
              className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-b from-orange-500 to-red-600 border-[4px] border-black rounded-3xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer group relative overflow-hidden"
              style={{
                boxShadow: '0 8px 0 #000000, 0 15px 20px rgba(0,0,0,0.5)',
              }}
              title="Modo Multijugador Online (Jugar con Amigos)"
            >
              <div className="w-14 h-14 bg-yellow-400 border-[2.5px] border-black rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden group-hover:rotate-6 transition">
                <Users className="w-7 h-7 text-black stroke-[2.5]" />
                <div className="absolute inset-0 bg-white/25 -translate-y-full rotate-45 group-hover:translate-y-full transition-transform duration-1000" />
              </div>
              {/* Pulsing notification circle badge */}
              <span className="absolute top-2 right-2 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
              </span>
            </button>

            {/* BUTTON 3: ONLINE LEVEL BROWSER (Center-right, also large!) */}
            <button
              onClick={() => setViewState('online_browser')}
              className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-b from-blue-400 to-blue-600 border-[4px] border-black rounded-3xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer group"
              style={{
                boxShadow: '0 8px 0 #000000, 0 15px 20px rgba(0,0,0,0.5)',
              }}
              title="Buscador de Niveles Online (Compartidos)"
            >
              <div className="w-14 h-14 bg-cyan-300 border-[2.5px] border-black rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden group-hover:rotate-6 transition">
                <Compass className="w-7 h-7 text-black fill-none stroke-[2.5]" />
                <div className="absolute inset-0 bg-white/25 -translate-y-full rotate-45 group-hover:translate-y-full transition-transform duration-1000" />
              </div>
            </button>

            {/* BUTTON 4: LEVEL CREATOR WORKSPACE (Right) */}
            <button
              onClick={() => {
                if (customLevels.length > 0) {
                  setShowEditorHub(true);
                } else {
                  handleCreateNewProject();
                }
              }}
              className="w-18 h-18 sm:w-22 sm:h-22 bg-gradient-to-b from-green-400 to-green-600 border-[3px] border-black rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer group"
              style={{
                boxShadow: '0 6px 0 #000000, 0 10px 15px rgba(0,0,0,0.4)',
              }}
              title="Creador de Niveles"
            >
              <div className="w-11 h-11 bg-yellow-400 border-[2px] border-black rounded-lg flex items-center justify-center shadow-inner group-hover:-rotate-12 transition">
                <Wrench className="w-5 h-5 text-black" />
              </div>
            </button>

          </div>

          {/* Daily chest & footer details */}
          <div className="z-10 flex items-center justify-between mt-auto">
            <div className="text-[10px] font-mono text-purple-200 uppercase tracking-widest">
              SISTEMA DE GUARDADO: <span className="text-green-400 font-bold">ACTIVO</span>
            </div>

            {/* Daily Chest feature trigger with 24h countdown check */}
            <button
              onClick={() => {
                setChestOpened(false);
                setChestReward('');
                setShowChestModal(true);
              }}
              className={`flex flex-col items-center gap-1 p-2 font-black text-[10px] rounded-xl shadow border-2 border-black active:scale-95 transition tracking-wider uppercase select-none ${canOpenChest ? 'bg-gradient-to-b from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black' : 'bg-slate-800 text-slate-400 cursor-not-allowed border-slate-700'}`}
              style={{
                boxShadow: canOpenChest ? '0 4px 0 #000000' : 'none',
              }}
            >
              <Gift className={`w-4 h-4 ${canOpenChest ? 'text-black animate-bounce' : 'text-slate-500'}`} />
              {canOpenChest ? 'REGALO DIARIO' : 'REGALO CERRADO'}
            </button>
          </div>

        </motion.div>
      )}
      </AnimatePresence>

      {/* DAILY CHEST MODAL DIALOG POPUP */}
      {showChestModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="w-80 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center shadow-2xl relative animate-scale-up">
            <h3 className="text-lg font-black uppercase tracking-wider text-yellow-400 mb-2">🏆 Cofre Diario 🏆</h3>
            
            {canOpenChest ? (
              <p className="text-slate-400 text-xs mb-6 font-mono">¡Ábrelo para recibir un regalo aleatorio!</p>
            ) : (
              <div className="text-xs text-rose-400 font-bold mb-4 font-mono uppercase bg-rose-500/10 p-2 border border-rose-500/20 rounded-xl">
                Cofre bloqueado. Disponible en: <br />
                <span className="text-lg text-white tracking-widest">{countdownText}</span>
              </div>
            )}

            <div className="flex items-center justify-center h-28 mb-6">
              {chestOpened ? (
                <div className="flex flex-col items-center justify-center gap-2 animate-pulse">
                  <div className="text-4xl">🌟</div>
                  <div className="text-xs text-green-400 font-bold max-w-[200px] leading-relaxed">
                    {chestReward}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleOpenChest}
                  disabled={!canOpenChest}
                  className={`p-4 rounded-full text-5xl hover:scale-115 active:scale-95 transition duration-200 cursor-pointer ${canOpenChest ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-slate-950/40 text-slate-600 border border-slate-850/20 cursor-not-allowed'}`}
                >
                  {canOpenChest ? '🎁' : '🔒'}
                </button>
              )}
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowChestModal(false)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
              >
                Cerrar cofre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL BUILDER HUB POPUP MODAL */}
      {showEditorHub && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center text-white">
          <div className="w-[450px] max-w-[95%] bg-slate-900 border-4 border-slate-800 p-6 rounded-3xl text-center shadow-2xl relative animate-scale-up flex flex-col justify-between">
            <div>
              {/* HEADER */}
              <h3 className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-500 mb-2"
                  style={{ WebkitTextStroke: '1px black', filter: 'drop-shadow(0 2px 2px #000)' }}>
                TALLER DE NIVELES
              </h3>
              <p className="text-slate-400 text-xs font-mono mb-6">Crea, edita o comparte tus niveles personalizados</p>
              
              {/* PRIMARY ACTION BUTTONS */}
              <div className="flex flex-col gap-3 mb-6">
                {/* 1. CONTINUAR EDICIÓN (if there is a last edited level) */}
                {(() => {
                  const lastLevel = getLastEditedLevel();
                  if (!lastLevel) return null;
                  return (
                    <button
                      onClick={() => {
                        setSelectedLevel(lastLevel);
                        localStorage.setItem('geometry_dash_last_edited_id', lastLevel.id);
                        setViewState('editor');
                        setShowEditorHub(false);
                      }}
                      className="py-3 px-4 bg-gradient-to-b from-green-400 to-green-600 border-2 border-black rounded-2xl font-black uppercase text-sm tracking-wider hover:scale-105 active:scale-95 transition cursor-pointer flex items-center justify-between shadow-md"
                      style={{ boxShadow: '0 4px 0 #000' }}
                    >
                      <span className="flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-yellow-300" />
                        CONTINUAR PROYECTO
                      </span>
                      <span className="text-xs text-green-200 font-mono italic max-w-[150px] truncate">
                        "{lastLevel.name}"
                      </span>
                    </button>
                  );
                })()}

                {/* 2. CREAR NUEVO PROYECTO */}
                <button
                  onClick={handleCreateNewProject}
                  className="py-3 px-4 bg-gradient-to-b from-blue-400 to-blue-600 border-2 border-black rounded-2xl font-black uppercase text-sm tracking-wider hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-2 shadow-md"
                  style={{ boxShadow: '0 4px 0 #000' }}
                >
                  <Plus className="w-5 h-5 text-cyan-300" />
                  CREAR NUEVO PROYECTO
                </button>
              </div>

              {/* SECTION: MY CUSTOM LIBRARY LIST (scrollable) */}
              <div className="text-left">
                <h4 className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2">MIS PROYECTOS GUARDADOS ({customLevels.length})</h4>
                <div className="max-h-[160px] overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                  {customLevels.map(level => (
                    <div
                      key={level.id}
                      onClick={() => {
                        setSelectedLevel(level);
                        localStorage.setItem('geometry_dash_last_edited_id', level.id);
                        setViewState('editor');
                        setShowEditorHub(false);
                      }}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-yellow-500/40 transition cursor-pointer flex justify-between items-center group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-white group-hover:text-yellow-400 truncate tracking-wide uppercase">
                          {level.name}
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono uppercase mt-0.5">
                          {level.elements.length} objetos
                        </div>
                      </div>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        {/* Share */}
                        <button
                          onClick={(e) => {
                            setShowEditorHub(false);
                            handleUploadLevel(level, e);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 text-slate-400 hover:text-black transition"
                          title="Publicar Online"
                        >
                          <CloudUpload className="w-3.5 h-3.5" />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={(e) => handleDeleteLevel(level.id, e)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MODAL FOOTER CLOSE */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowEditorHub(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. CREAR NUEVO PROYECTO MODAL */}
      {newProjectModal && (
        <div className="absolute inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center text-white">
          <div className="w-[380px] max-w-[90%] bg-slate-900 border-4 border-slate-800 p-6 rounded-3xl text-center shadow-2xl relative flex flex-col justify-between animate-scale-up">
            <div>
              <h3 className="text-xl font-black uppercase tracking-widest text-cyan-400 mb-2" style={{ textShadow: '0 2px 0 #000' }}>
                🆕 NUEVO NIVEL 🆕
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">Introduce el nombre de tu nuevo nivel</p>
              <input
                type="text"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                placeholder="Nombre del nivel..."
                className="w-full px-4 py-2.5 bg-slate-950 border-2 border-slate-800 rounded-xl text-center font-bold text-sm text-cyan-300 focus:outline-none focus:border-cyan-500 uppercase tracking-wide"
                maxLength={24}
                autoFocus
              />
            </div>
            
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={handleConfirmCreateProject}
                className="px-5 py-2.5 bg-gradient-to-b from-green-400 to-green-600 border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider text-black hover:scale-105 active:scale-95 transition cursor-pointer"
                style={{ boxShadow: '0 3px 0 #000' }}
              >
                CREAR
              </button>
              <button
                onClick={() => setNewProjectModal(false)}
                className="px-5 py-2.5 bg-slate-850 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ELIMINAR PROYECTO MODAL */}
      {deleteConfirmLevelId && (
        <div className="absolute inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center text-white">
          <div className="w-[380px] max-w-[90%] bg-slate-900 border-4 border-slate-800 p-6 rounded-3xl text-center shadow-2xl relative flex flex-col justify-between animate-scale-up">
            <div>
              <h3 className="text-xl font-black uppercase tracking-widest text-rose-500 mb-2" style={{ textShadow: '0 2px 0 #000' }}>
                ⚠️ ELIMINAR PROYECTO ⚠️
              </h3>
              <p className="text-sm text-slate-300 mt-4 leading-relaxed">
                ¿Estás seguro de que quieres eliminar este nivel personalizado? Esta acción no se puede deshacer.
              </p>
            </div>
            
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={handleConfirmDeleteLevel}
                className="px-5 py-2.5 bg-gradient-to-b from-rose-500 to-rose-700 border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider text-white hover:scale-105 active:scale-95 transition cursor-pointer"
                style={{ boxShadow: '0 3px 0 #000' }}
              >
                SÍ, ELIMINAR
              </button>
              <button
                onClick={() => setDeleteConfirmLevelId(null)}
                className="px-5 py-2.5 bg-slate-850 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. PUBLICAR PROYECTO MODAL */}
      {publishLevelModal && (
        <div className="absolute inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center text-white">
          <div className="w-[380px] max-w-[90%] bg-slate-900 border-4 border-slate-800 p-6 rounded-3xl text-center shadow-2xl relative flex flex-col justify-between animate-scale-up">
            <div>
              <h3 className="text-xl font-black uppercase tracking-widest text-blue-400 mb-2" style={{ textShadow: '0 2px 0 #000' }}>
                🌐 PUBLICAR ONLINE 🌐
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">¡Comparte "{publishLevelModal.name}" con toda la comunidad!</p>
              
              <div className="text-left space-y-1 mb-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider pl-1">Nombre de autor:</label>
                <input
                  type="text"
                  value={publishAuthorName}
                  onChange={e => setPublishAuthorName(e.target.value)}
                  placeholder="Tu apodo de creador..."
                  className="w-full px-4 py-2.5 bg-slate-950 border-2 border-slate-800 rounded-xl text-center font-bold text-sm text-blue-300 focus:outline-none focus:border-blue-500 uppercase tracking-wide"
                  maxLength={16}
                  autoFocus
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={handleConfirmPublishLevel}
                className="px-5 py-2.5 bg-gradient-to-b from-blue-400 to-blue-600 border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider text-black hover:scale-105 active:scale-95 transition cursor-pointer"
                style={{ boxShadow: '0 3px 0 #000' }}
              >
                PUBLICAR ONLINE
              </button>
              <button
                onClick={() => setPublishLevelModal(null)}
                className="px-5 py-2.5 bg-slate-850 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. CREAR CUENTA / INICIO DE SESIÓN MODAL */}
      {showAuthModal && (
        <div className="absolute inset-0 z-[110] bg-black/90 backdrop-blur-sm flex items-center justify-center text-white p-4">
          <div className="w-[420px] max-w-full bg-slate-900 border-4 border-purple-800 p-6 rounded-3xl text-center shadow-2xl relative flex flex-col justify-between animate-scale-up">
            
            {/* GD themed Close Button if they can skip / close */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-rose-600 hover:bg-rose-500 border-2 border-black rounded-full font-black text-sm flex items-center justify-center shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-transform"
              title="Cerrar / Jugar como Invitado"
            >
              ✕
            </button>

            <div>
              <h3 className="text-2xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#00FF00] to-[#10B981] mb-2"
                  style={{
                    filter: 'drop-shadow(0 2px 0 #000)',
                    fontFamily: '"Space Grotesk", sans-serif',
                    WebkitTextStroke: '1px #000'
                  }}>
                {authMode === 'register' ? 'Crea tu Cuenta GD' : 'Iniciar Sesión'}
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                {authMode === 'register' 
                  ? 'Guarda tus estrellas, orbes de poder y niveles personalizados en la nube local.'
                  : 'Entra a tu cuenta para restaurar tu progreso y creaciones.'}
              </p>

              {authError && (
                <div className="bg-rose-950/40 border border-rose-500/50 text-rose-400 text-xs font-bold py-2 px-3 rounded-xl mb-4 font-mono font-bold">
                  ⚠️ {authError}
                </div>
              )}

              <div className="space-y-3.5">
                {/* Nickname / Username */}
                <div className="text-left space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Nombre de Usuario:</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={authUsername}
                      onChange={e => {
                        setAuthError('');
                        setAuthUsername(e.target.value);
                      }}
                      placeholder="Tu apodo o nickname..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border-2 border-slate-800 rounded-xl font-bold text-sm text-cyan-300 focus:outline-none focus:border-cyan-500 uppercase tracking-wide placeholder-slate-600"
                      maxLength={18}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="text-left space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Contraseña secreta:</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={authPassword}
                      onChange={e => {
                        setAuthError('');
                        setAuthPassword(e.target.value);
                      }}
                      placeholder="Mínimo 4 caracteres..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border-2 border-slate-800 rounded-xl font-bold text-sm text-pink-300 focus:outline-none focus:border-pink-500 placeholder-slate-600"
                      maxLength={16}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Main actions */}
            <div className="mt-6 space-y-3">
              {authMode === 'register' ? (
                <button
                  onClick={handleRegisterAccount}
                  className="w-full py-3 bg-gradient-to-b from-green-400 to-green-600 border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider text-black hover:scale-102 active:scale-98 transition shadow-lg cursor-pointer animate-pulse"
                  style={{ boxShadow: '0 3px 0 #000' }}
                >
                  REGISTRARSE Y JUGAR
                </button>
              ) : (
                <button
                  onClick={handleLoginAccount}
                  className="w-full py-3 bg-gradient-to-b from-cyan-400 to-cyan-600 border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider text-black hover:scale-102 active:scale-98 transition shadow-lg cursor-pointer"
                  style={{ boxShadow: '0 3px 0 #000' }}
                >
                  INICIAR SESIÓN
                </button>
              )}

              {/* Toggle Account Mode */}
              <button
                onClick={() => {
                  setAuthError('');
                  setAuthMode(authMode === 'register' ? 'login' : 'register');
                }}
                className="text-xs text-purple-400 hover:text-purple-300 font-bold transition block mx-auto underline cursor-pointer"
              >
                {authMode === 'register' 
                  ? '¿Ya tienes una cuenta? Inicia Sesión' 
                  : '¿No tienes cuenta? Regístrate aquí'}
              </button>

              <div className="border-t border-slate-800/60 pt-3.5 mt-2 flex justify-center">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-mono text-slate-400 hover:text-white uppercase tracking-wider cursor-pointer transition"
                >
                  Jugar como Invitado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. LEVEL REWARDS PATH PATHWAY MODAL */}
      {showRewardsModal && (
        <LevelRewardsModal
          profile={profile}
          skins={skins}
          onClaim={handleClaimReward}
          onClose={() => setShowRewardsModal(false)}
        />
      )}

    </div>
  );
}
