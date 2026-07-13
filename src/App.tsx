/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Level, PlayerSkins } from './types';
import {
  DEFAULT_LEVELS,
  getCustomLevels,
  saveCustomLevel,
  deleteCustomLevel,
  saveLevelProgress,
  uploadCustomLevelToOnline,
  getLevelProgress
} from './levels';
import GameCanvas from './components/GameCanvas';
import SkinCustomizer from './components/SkinCustomizer';
import LevelBuilder from './components/LevelBuilder';
import OnlineLevelBrowser from './components/OnlineLevelBrowser';
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
  Coins
} from 'lucide-react';

const DEFAULT_SKINS: PlayerSkins = {
  cube: 'cube_classic',
  wave: 'wave_classic',
  robot: 'robot_classic',
  ball: 'ball_classic',
  primaryColor: '#00FF00', // lime green
  secondaryColor: '#FF00FF', // pink
};

type ViewState = 'menu' | 'levels' | 'customizer' | 'editor' | 'playing' | 'online_browser';

interface UserProfile {
  username: string;
  stars: number;
  orbs: number;
  diamonds: number;
  completedCount: number;
}

export default function App() {
  const [view, setViewState] = useState<ViewState>('menu');
  const [cameFromEditor, setCameFromEditor] = useState<boolean>(false);
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

  // Custom sandbox-immune modals states
  const [newProjectModal, setNewProjectModal] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [deleteConfirmLevelId, setDeleteConfirmLevelId] = useState<string | null>(null);
  const [publishLevelModal, setPublishLevelModal] = useState<Level | null>(null);
  const [publishAuthorName, setPublishAuthorName] = useState<string>('');

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

  const handleRegisterAccount = () => {
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
      
      const exists = accounts.some(acc => acc.username.toLowerCase() === cleanUsername.toLowerCase());
      if (exists) {
        setAuthError('Este nombre de usuario ya está registrado.');
        return;
      }

      const newProfile: UserProfile = {
        username: cleanUsername,
        stars: profile.stars > 12 ? profile.stars : 12,
        orbs: profile.orbs > 150 ? profile.orbs : 150,
        diamonds: profile.diamonds > 8 ? profile.diamonds : 8,
        completedCount: profile.completedCount,
      };

      const newAccount = {
        username: cleanUsername,
        passwordHash: cleanPassword,
        profile: newProfile
      };

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

  const handleLoginAccount = () => {
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
      
      const account = accounts.find(acc => acc.username.toLowerCase() === cleanUsername.toLowerCase() && acc.passwordHash === cleanPassword);
      if (!account) {
        setAuthError('Usuario o contraseña incorrectos.');
        return;
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
  const handleProgressUpdate = (percentage: number, attemptsCount: number, isWon: boolean) => {
    if (!selectedLevel) return;
    
    // Save locally
    const currentProgress = getLevelProgress(selectedLevel.id);
    const updated = saveLevelProgress(selectedLevel.id, percentage, attemptsCount, isWon);

    // Award reward points if level is completed for the first time
    if (isWon && !currentProgress.completed) {
      setProfile(prev => {
        const starsGained = selectedLevel.starsReward || 3;
        const orbsGained = selectedLevel.orbsReward || 100;
        const diamondsGained = Math.ceil(starsGained / 2) + 2;

        return {
          ...prev,
          stars: prev.stars + starsGained,
          orbs: prev.orbs + orbsGained,
          diamonds: prev.diamonds + diamondsGained,
          completedCount: prev.completedCount + 1
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
    <div className="relative w-screen h-screen bg-slate-950 text-white font-sans overflow-hidden flex items-center justify-center p-0 select-none">
      
      {/* 1. VIEW ROUTER: GAMEPLAY CANVAS ACTIVE */}
      {view === 'playing' && selectedLevel && (
        <div className="w-full h-full animate-fade-in flex flex-col">
          <GameCanvas
            level={selectedLevel}
            skins={skins}
            onExit={() => {
              if (cameFromEditor) {
                setViewState('editor');
                setCameFromEditor(false);
              } else {
                setViewState(selectedLevel.id.startsWith('shared_') ? 'online_browser' : 'levels');
              }
            }}
            onProgress={handleProgressUpdate}
          />
        </div>
      )}

      {/* 2. VIEW ROUTER: SKIN CUSTOMIZER ACTIVE */}
      {view === 'customizer' && (
        <div className="w-full h-full animate-fade-in">
          <SkinCustomizer
            skins={skins}
            onSkinsChange={handleSkinsChange}
            onClose={() => setViewState('menu')}
            profile={profile}
            onProfileChange={setProfile}
          />
        </div>
      )}

      {/* 3. VIEW ROUTER: LEVEL BUILDER EDITOR ACTIVE */}
      {view === 'editor' && (
        <div className="w-full h-full animate-fade-in">
          <LevelBuilder
            initialLevel={selectedLevel}
            onSaveAndClose={() => setViewState('menu')}
            onPlaytest={(testLevel) => {
              setSelectedLevel(testLevel);
              setCameFromEditor(true);
              setViewState('playing');
            }}
          />
        </div>
      )}

      {/* 4. VIEW ROUTER: ONLINE SHARING BROWSER PLATFORM */}
      {view === 'online_browser' && (
        <div className="w-full h-full animate-fade-in">
          <OnlineLevelBrowser
            skins={skins}
            onPlayLevel={handleStartGame}
            onClose={() => setViewState('menu')}
            username={profile.username}
          />
        </div>
      )}

      {/* 5. VIEW ROUTER: LEVEL SELECT LIST ACTIVE */}
      {view === 'levels' && (
        <div className="w-full h-full bg-slate-900 flex flex-col justify-between p-6 animate-fade-in">
          <div>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Compass className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">Selecciona un Nivel</h2>
              </div>
              <button
                onClick={() => setViewState('menu')}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> VOLVER
              </button>
            </div>

            {/* LEVELS CONTAINER SCROLLABLE LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto pr-2 scrollbar-thin">
              {/* Preset Default Levels */}
              {DEFAULT_LEVELS.map(level => {
                const progress = getLevelProgress(level.id);
                let stars = '★';
                let diffLabel = 'Fácil';
                let diffColor = 'text-green-400';
                
                if (level.difficulty === 'normal') {
                  stars = '★★★';
                  diffLabel = 'Normal';
                  diffColor = 'text-cyan-400';
                } else if (level.difficulty === 'hard') {
                  stars = '★★★★★';
                  diffLabel = 'Difícil';
                  diffColor = 'text-yellow-400';
                }

                return (
                  <div
                    key={level.id}
                    onClick={() => handleStartGame(level)}
                    className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-emerald-500/50 transition cursor-pointer flex justify-between items-center group relative overflow-hidden"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-black text-white group-hover:text-emerald-400 truncate tracking-wide uppercase">
                        {level.name}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className={`text-xs font-mono font-bold ${diffColor}`}>
                          {diffLabel}
                        </span>
                        <span className="text-[10px] text-yellow-500 font-mono tracking-widest">{stars}</span>
                        {progress.normalProgress > 0 && (
                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            Mejor: <span className="text-emerald-400">{progress.normalProgress}%</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button className="p-3 rounded-xl bg-slate-800 group-hover:bg-emerald-500 text-slate-400 group-hover:text-white transition shadow-md flex-shrink-0">
                      <PlayIcon className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                );
              })}

              {/* Custom Created Levels list */}
              {customLevels.length > 0 ? (
                customLevels.map(level => {
                  const progress = getLevelProgress(level.id);
                  return (
                    <div
                      key={level.id}
                      className="p-4 rounded-2xl border border-yellow-900/30 bg-amber-950/10 hover:border-yellow-500/40 transition cursor-pointer flex justify-between items-center group"
                      onClick={() => handleStartGame(level)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-base font-black text-yellow-300 truncate tracking-wide flex items-center gap-1.5 uppercase">
                          <Wrench className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                          {level.name}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                            Personalizado
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">({level.elements.length} obj)</span>
                          {progress.normalProgress > 0 && (
                            <span className="text-[10px] font-mono text-slate-400 font-bold">
                              Mejor: <span className="text-yellow-400">{progress.normalProgress}%</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        {/* Share / Upload to cloud button */}
                        <button
                          onClick={(e) => handleUploadLevel(level, e)}
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500 text-slate-400 hover:text-black transition"
                          title="Subir a Niveles Online (Compartir)"
                        >
                          <CloudUpload className="w-4 h-4" />
                        </button>
                        
                        {/* Edit level */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditor(level);
                          }}
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-yellow-500 text-slate-400 hover:text-slate-950 transition"
                          title="Editar en el Creador"
                        >
                          <Wrench className="w-4 h-4" />
                        </button>

                        {/* Delete level */}
                        <button
                          onClick={(e) => handleDeleteLevel(level.id, e)}
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition"
                          title="Eliminar nivel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-1 md:col-span-2 p-8 rounded-2xl border border-dashed border-slate-800 text-center text-slate-500 font-mono text-xs flex flex-col items-center justify-center gap-3 bg-slate-950/20">
                  No tienes niveles creados aún en local. ¡Usa el constructor para dar rienda suelta a tu imaginación!
                  <button
                    onClick={() => handleOpenEditor(null)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-xl text-xs tracking-wider uppercase transition border border-slate-700"
                  >
                    <Plus className="w-4 h-4" /> CREAR PRIMER NIVEL
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-500 font-mono mt-3">
            Haz clic en Jugar. Los portales te cambiarán de vehículo (Cubo, Wave, Robot, Rueda) automáticamente.
          </div>
        </div>
      )}

      {/* 5. VIEW ROUTER: CLASSIC HOMEPAGE MENU ACTIVE */}
      {view === 'menu' && (
        <div className="w-full h-full bg-purple-950 relative flex flex-col justify-between p-8 select-none">
          
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
          <div className="z-10 flex flex-col sm:flex-row gap-3 justify-between sm:items-center bg-black/35 backdrop-blur px-5 py-2.5 rounded-2xl border border-purple-800/40">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthError('');
                  setAuthMode(isLoggedIn ? 'login' : 'register');
                  setShowAuthModal(true);
                }}
                className="flex items-center gap-2 bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 px-3.5 py-1.5 rounded-xl cursor-pointer transition text-white active:scale-95 text-xs font-bold font-mono group"
              >
                <User className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="tracking-wider uppercase text-cyan-300">
                  {isLoggedIn ? profile.username : 'CREAR CUENTA / LOGIN'}
                </span>
              </button>
              
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-mono font-black text-rose-400 hover:text-rose-300 hover:bg-rose-950 bg-rose-950/40 px-2.5 py-1.5 rounded-xl border border-rose-900/40 cursor-pointer transition uppercase"
                  title="Cerrar Sesión"
                >
                  Salir
                </button>
              )}
            </div>

            {/* Profile points counters */}
            <div className="flex items-center gap-5 font-mono text-xs">
              <div className="flex items-center gap-1 text-yellow-400" title="Estrellas ganadas">
                <span className="text-sm">⭐</span>
                <span className="font-bold">{profile.stars}</span>
              </div>
              <div className="flex items-center gap-1 text-pink-400" title="Orbes de Poder">
                <span className="text-sm">💎</span>
                <span className="font-bold">{profile.orbs}</span>
              </div>
              <div className="flex items-center gap-1 text-cyan-400" title="Diamantes Azules">
                <span className="text-sm">💠</span>
                <span className="font-bold">{profile.diamonds}</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 border-l border-purple-800/60 pl-4" title="Niveles completados">
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

        </div>
      )}

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
              {/* Optional test helper to speed up cofre testing for developers */}
              {!canOpenChest && (
                <button
                  onClick={() => {
                    localStorage.removeItem('geometry_dash_last_chest_time');
                    setCanOpenChest(true);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-400 hover:text-white font-mono rounded-lg transition"
                >
                  DEV: RESET 24H
                </button>
              )}
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

    </div>
  );
}
