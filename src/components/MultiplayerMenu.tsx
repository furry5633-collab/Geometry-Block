/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Level, PlayerSkins, UserProfile } from '../types';
import { drawCube } from '../skins';
import { audio } from '../audio';
import { DifficultyFace } from './OnlineLevelBrowser';
import { getServerBaseUrl, getWebSocketUrl } from '../levels';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  Clock, 
  Play, 
  X, 
  Plus, 
  Send, 
  Mail, 
  Info, 
  LogOut, 
  Shield, 
  Trophy, 
  Coins, 
  Sparkles, 
  Smartphone, 
  Crown,
  Lock,
  Globe
} from 'lucide-react';

interface MultiplayerMenuProps {
  profile: UserProfile;
  skins: PlayerSkins;
  onBack: () => void;
  onStartMultiplayerGame: (level: Level, wsSocket: WebSocket, roomId: string, players: any[], isLeader: boolean) => void;
  customLevels: Level[];
  officialLevels: Level[];
}

export default function MultiplayerMenu({
  profile,
  skins,
  onBack,
  onStartMultiplayerGame,
  customLevels,
  officialLevels
}: MultiplayerMenuProps) {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<'lobby' | 'friends' | 'requests' | 'players'>('lobby');
  
  // Players List DB from Server
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [friendsList, setFriendsList] = useState<string[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [selectedPlayerDetails, setSelectedPlayerDetails] = useState<any | null>(null);

  // Active Room state
  const [room, setRoom] = useState<any | null>(null);
  const [roomIdInput, setRoomIdInput] = useState<string>('');
  const [selectedLobbyLevel, setSelectedLobbyLevel] = useState<Level | null>(null);

  // Incoming Live invitation modal
  const [incomingInvite, setIncomingInvite] = useState<{ from: string; roomId: string } | null>(null);

  // WebSockets Connection
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');

  // Keep refs for callbacks & states used in WS listener to prevent re-opening socket on updates
  const roomRef = useRef<any>(null);
  roomRef.current = room;

  const selectedLobbyLevelRef = useRef<Level | null>(null);
  selectedLobbyLevelRef.current = selectedLobbyLevel;

  const onStartMultiplayerGameRef = useRef<any>(null);
  onStartMultiplayerGameRef.current = onStartMultiplayerGame;

  // 1. Establish WebSocket Connection
  useEffect(() => {
    const socketUrl = getWebSocketUrl(profile.username);
    
    const ws = new WebSocket(socketUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      setErrorText('');
      // Register with stats
      ws.send(JSON.stringify({
        type: 'player_sync',
        x: 0,
        y: 0,
        gamemode: 'cube',
        isDead: false,
        progress: 0
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'room_created':
          case 'room_state': {
            setRoom(data.room);
            setSelectedLobbyLevel(data.room.selectedLevel || null);
            break;
          }
          case 'incoming_invite': {
            setIncomingInvite({ from: data.from, roomId: data.roomId });
            audio.playSpeedGate(); // Play cool invite ringtone sound
            break;
          }
          case 'presence_update': {
            setOnlineUsers(data.onlineUsers || []);
            break;
          }
          case 'game_started': {
            const currentRoom = roomRef.current;
            const currentLevel = selectedLobbyLevelRef.current;
            if (currentRoom && wsRef.current) {
              // Trigger parent launch
              const levelToPlay = currentLevel || officialLevels[0];
              const isLeader = currentRoom.leader === profile.username;
              if (onStartMultiplayerGameRef.current) {
                onStartMultiplayerGameRef.current(levelToPlay, wsRef.current, currentRoom.id, currentRoom.players, isLeader);
              }
            }
            break;
          }
          case 'error': {
            setErrorText(data.message);
            setTimeout(() => setErrorText(''), 4000);
            break;
          }
        }
      } catch (e) {
        console.error('Error parsing WS message', e);
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
    };

    return () => {
      if (ws) ws.close();
    };
  }, [profile.username]);

  // 2. Load API lists (Friends & Requests)
  const loadFriendsData = async () => {
    try {
      const baseUrl = getServerBaseUrl();
      const pRes = await fetch(`${baseUrl}/api/players`);
      if (pRes.ok) {
        const pData = await pRes.json();
        setAllPlayers(pData);
      }

      const fRes = await fetch(`${baseUrl}/api/friends/list?username=${encodeURIComponent(profile.username)}`);
      if (fRes.ok) {
        const fData = await fRes.json();
        setFriendsList(fData);
      }

      const rRes = await fetch(`${baseUrl}/api/friends/requests?username=${encodeURIComponent(profile.username)}`);
      if (rRes.ok) {
        const rData = await rRes.json();
        setPendingRequests(rData);
      }
    } catch (e) {
      console.error('Error fetching friends DB APIs', e);
    }
  };

  useEffect(() => {
    loadFriendsData();
    const interval = setInterval(loadFriendsData, 4000);
    return () => clearInterval(interval);
  }, [profile.username]);

  // Actions
  const handleCreateRoom = () => {
    audio.playClick();
    if (!wsConnected || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({
      type: 'create_room',
      skins,
      stats: profile
    }));
  };

  const handleJoinRoom = (id?: string) => {
    audio.playClick();
    const targetRoomId = id || roomIdInput.trim();
    if (!targetRoomId || !wsConnected || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({
      type: 'join_room',
      roomId: targetRoomId.toUpperCase(),
      skins,
      stats: profile
    }));
    setRoomIdInput('');
  };

  const handleLeaveRoom = () => {
    audio.playClick();
    if (!wsRef.current || !room) return;
    wsRef.current.send(JSON.stringify({ type: 'leave_room' }));
    setRoom(null);
    setSelectedLobbyLevel(null);
  };

  const handleSelectLevel = (lvl: Level) => {
    audio.playClick();
    if (!wsRef.current || !room || room.leader.toLowerCase() !== profile.username.toLowerCase()) return;
    wsRef.current.send(JSON.stringify({
      type: 'select_level',
      level: lvl
    }));
  };

  const handleStartGame = () => {
    audio.playClick();
    if (!wsRef.current || !room || room.leader.toLowerCase() !== profile.username.toLowerCase()) return;
    if (!selectedLobbyLevel) {
      setErrorText('Por favor selecciona un nivel primero');
      return;
    }
    wsRef.current.send(JSON.stringify({ type: 'start_game' }));
  };

  const handleInviteFriend = (friendName: string) => {
    audio.playClick();
    if (!wsRef.current || !room) return;
    wsRef.current.send(JSON.stringify({
      type: 'invite',
      friendUsername: friendName,
      roomId: room.id
    }));
  };

  const handleSendFriendRequest = async (targetUsername: string) => {
    audio.playClick();
    try {
      const baseUrl = getServerBaseUrl();
      const res = await fetch(`${baseUrl}/api/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: profile.username, to: targetUsername })
      });
      if (res.ok) {
        loadFriendsData();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al enviar la solicitud');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRespondRequest = async (sender: string, action: 'accept' | 'reject') => {
    audio.playClick();
    try {
      const baseUrl = getServerBaseUrl();
      const res = await fetch(`${baseUrl}/api/friends/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: sender, to: profile.username, action })
      });
      if (res.ok) {
        loadFriendsData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 flex flex-col text-white font-sans p-4 overflow-hidden select-none">
      
      {/* HEADER SECTION - COMPACT */}
      <div className="flex items-center justify-between border-b border-indigo-900/40 pb-2 mb-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="flex items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all rounded-xl border border-slate-700 text-indigo-400"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-200 to-yellow-400">
              MODO MULTIJUGADOR ONLINE 🌐
            </h1>
            <p className="text-[10px] text-indigo-300 font-mono flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400 animate-pulse' : 'bg-rose-500'}`} />
              {wsConnected ? `CONECTADO COMO ${profile.username.toUpperCase()}` : 'CONECTANDO AL SERVIDOR...'}
            </p>
          </div>
        </div>

        {errorText && (
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 px-3 py-1 rounded-lg text-xs font-mono font-bold animate-pulse">
            ⚠ {errorText}
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-[10px] flex items-center gap-2">
            <span className="text-yellow-400">💎 {profile.orbs}</span>
            <span className="text-cyan-400">💠 {profile.diamonds}</span>
            <span className="text-amber-400">⭐ {profile.stars}</span>
          </div>
        </div>
      </div>

      {/* NO ACTIVE ROOM VIEW */}
      {!room ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 overflow-hidden">
          
          {/* LEFT PANELS: ROOM CONTROLS */}
          <div className="md:col-span-5 flex flex-col gap-3 justify-center items-stretch h-full">
            <div className="bg-slate-900/80 border border-indigo-950/40 p-4 rounded-2xl flex flex-col justify-between shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-500" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" /> Crear Sala Privada
                </h3>
                <p className="text-slate-400 text-[11px] mb-4 leading-relaxed font-mono">
                  Genera una sala multijugador privada e invita a tus amigos agregados en el juego.
                </p>
              </div>
              <button
                onClick={handleCreateRoom}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 active:scale-[0.98] transition-all font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-950/40 border border-indigo-500/20 text-white"
              >
                Crear Nueva Sala
              </button>
            </div>

            <div className="bg-slate-900/80 border border-indigo-950/40 p-4 rounded-2xl flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-yellow-400 mb-1 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" /> Unirse por Código
                </h3>
                <p className="text-slate-400 text-[11px] mb-3 font-mono leading-relaxed">
                  Ingresa el código único que te compartió tu amigo.
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="CÓDIGO DE SALA"
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-center font-mono font-black text-sm uppercase rounded-xl tracking-widest"
                />
                <button
                  onClick={() => handleJoinRoom()}
                  className="px-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-widest rounded-xl active:scale-95 transition-all"
                >
                  Unirse
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANELS: FRIENDS & USERS */}
          <div className="md:col-span-7 bg-slate-900/60 border border-indigo-950/30 rounded-2xl flex flex-col overflow-hidden h-full">
            {/* SUB TABS */}
            <div className="flex border-b border-indigo-950/40 bg-slate-950/40">
              <button
                onClick={() => { audio.playClick(); setActiveTab('lobby'); }}
                className={`flex-1 py-2 text-center text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${activeTab === 'lobby' ? 'text-cyan-400 border-cyan-400 bg-indigo-950/20' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
              >
                <Users className="w-3.5 h-3.5" /> Amigos ({friendsList.length})
              </button>
              <button
                onClick={() => { audio.playClick(); setActiveTab('requests'); }}
                className={`flex-1 py-2 text-center text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 relative ${activeTab === 'requests' ? 'text-cyan-400 border-cyan-400 bg-indigo-950/20' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
              >
                <Mail className="w-3.5 h-3.5" /> Solicitudes
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => { audio.playClick(); setActiveTab('players'); }}
                className={`flex-1 py-2 text-center text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${activeTab === 'players' ? 'text-cyan-400 border-cyan-400 bg-indigo-950/20' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Agregar Amigos
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
              
              {/* 1. FRIENDS LIST */}
              {activeTab === 'lobby' && (
                <div className="flex flex-col gap-2">
                  {friendsList.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-[11px]">
                      Aún no tienes amigos agregados. <br />
                      ¡Busca a otros jugadores en la pestaña "Agregar Amigos"!
                    </div>
                  ) : (
                    friendsList.map(fName => {
                      const dbUser = allPlayers.find(p => p.username.toLowerCase() === fName.toLowerCase());
                      const isOnline = onlineUsers.includes(fName);
                      return (
                        <div key={fName} className="flex items-center justify-between p-2 bg-slate-950/40 border border-slate-900 rounded-xl hover:border-indigo-950 transition-all">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center p-0.5">
                              {dbUser && (
                                <MiniCubeIcon 
                                  skinId={dbUser.skins?.cube || '0'} 
                                  primaryColor={dbUser.skins?.primaryColor || '#00FFFF'} 
                                  secondaryColor={dbUser.skins?.secondaryColor || '#FF00FF'} 
                                />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                {fName}
                                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-slate-600'}`} />
                              </div>
                              <div className="text-[9px] text-slate-500">
                                {isOnline ? 'ONLINE' : 'OFFLINE'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { audio.playClick(); setSelectedPlayerDetails(dbUser); }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] rounded-lg"
                            >
                              Ver más
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* 2. FRIEND REQUESTS */}
              {activeTab === 'requests' && (
                <div className="flex flex-col gap-2">
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-[11px]">
                      No tienes solicitudes de amistad pendientes.
                    </div>
                  ) : (
                    pendingRequests.map(req => {
                      const senderName = req.sender;
                      const isReceived = senderName.toLowerCase() !== profile.username.toLowerCase();
                      const oppositeUser = isReceived ? senderName : (req.user1.toLowerCase() === profile.username.toLowerCase() ? req.user2 : req.user1);
                      const dbUser = allPlayers.find(p => p.username.toLowerCase() === oppositeUser.toLowerCase());
                      
                      return (
                        <div key={req.timestamp} className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-900 rounded-xl">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-0.5">
                              {dbUser && (
                                <MiniCubeIcon 
                                  skinId={dbUser.skins?.cube || '0'} 
                                  primaryColor={dbUser.skins?.primaryColor || '#00FFFF'} 
                                  secondaryColor={dbUser.skins?.secondaryColor || '#FF00FF'} 
                                />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-200">{oppositeUser}</div>
                              <div className="text-[9px] text-slate-500">
                                {isReceived ? 'Te envió solicitud' : 'Esperando respuesta'}
                              </div>
                            </div>
                          </div>

                          {isReceived ? (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleRespondRequest(oppositeUser, 'accept')}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg transition-all"
                              >
                                Aceptar
                              </button>
                              <button
                                onClick={() => handleRespondRequest(oppositeUser, 'reject')}
                                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] rounded-lg transition-all"
                              >
                                Rechazar
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">Pendiente</span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* 3. SEARCH & ALL REGISTERED USERS */}
              {activeTab === 'players' && (
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mb-1 px-1">
                    Todos los jugadores del juego ({allPlayers.filter(p => p.username.toLowerCase() !== profile.username.toLowerCase()).length})
                  </div>
                  {allPlayers
                    .filter(p => p.username.toLowerCase() !== profile.username.toLowerCase())
                    .map(player => {
                      const isFriend = friendsList.some(f => f.toLowerCase() === player.username.toLowerCase());
                      const hasRequest = pendingRequests.some(r => 
                        r.user1.toLowerCase() === player.username.toLowerCase() || 
                        r.user2.toLowerCase() === player.username.toLowerCase()
                      );

                      return (
                        <div key={player.username} className="flex items-center justify-between p-2 bg-slate-950/40 border border-slate-900 rounded-xl hover:border-slate-800 transition-all">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-0.5">
                              <MiniCubeIcon 
                                skinId={player.skins?.cube || '0'} 
                                primaryColor={player.skins?.primaryColor || '#00FFFF'} 
                                secondaryColor={player.skins?.secondaryColor || '#FF00FF'} 
                              />
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                {player.username}
                                {onlineUsers.includes(player.username) && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                )}
                              </div>
                              <div className="text-[9px] text-slate-500">
                                ⭐ {player.stats?.stars || 0} | 💠 {player.stats?.diamonds || 0}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => { audio.playClick(); setSelectedPlayerDetails(player); }}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg"
                            >
                              Ver más
                            </button>

                            {isFriend ? (
                              <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] rounded-lg">
                                Amigo ✓
                              </span>
                            ) : hasRequest ? (
                              <span className="px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold text-[10px] rounded-lg italic">
                                Enviado
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSendFriendRequest(player.username)}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg active:scale-95 transition-all"
                              >
                                Agregar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

            </div>
          </div>

        </div>
      ) : (
        /* ========================================================
           ACTIVE MULTIPLAYER LOBBY (COMPACT MOBILE LANDSCAPE ADAPTED)
           ======================================================== */
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 overflow-hidden">
          
          {/* LOBBY DETAILS COLUMN (LEFT 5 COLS) */}
          <div className="md:col-span-5 flex flex-col gap-2 overflow-hidden h-full">
            
            {/* LOBBY HEADER CARD */}
            <div className="bg-slate-900/95 border-2 border-indigo-900/60 p-3 rounded-2xl flex flex-col gap-1 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase font-mono">CÓDIGO DE SALA</h4>
                  <div className="text-xl font-black font-mono tracking-widest text-yellow-400 animate-pulse">
                    {room.id}
                  </div>
                </div>
                <button
                  onClick={handleLeaveRoom}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] uppercase rounded-lg transition-all"
                >
                  <LogOut className="w-3 h-3" /> Salir
                </button>
              </div>
            </div>

            {/* LEVEL PREVIEW IN CORNER (Left Column Bottom portion) */}
            <div className="flex-1 bg-slate-950/80 border border-indigo-950/40 p-3 rounded-2xl flex flex-col justify-between overflow-hidden relative">
              <div className="flex items-start gap-2.5">
                {/* Simulated Level Image Representation */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-800 to-indigo-950 border border-indigo-500/30 flex flex-col items-center justify-center p-1 relative shadow-inner overflow-hidden flex-shrink-0">
                  <DifficultyFace diff={selectedLobbyLevel ? selectedLobbyLevel.difficulty : 'na'} size={11} />
                  <span className="text-[7px] font-black text-yellow-400 tracking-widest absolute bottom-0.5">GD ONLINE</span>
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase text-indigo-100 tracking-wider">Nivel Seleccionado</h3>
                  <div className="text-base font-black text-yellow-400 truncate max-w-[160px] uppercase tracking-wide">
                    {selectedLobbyLevel ? selectedLobbyLevel.name : 'Ninguno seleccionado'}
                  </div>
                  {selectedLobbyLevel && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5 font-mono text-[8px] text-slate-400">
                      <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-[8px] text-cyan-300 font-bold uppercase">
                        {selectedLobbyLevel.difficulty}
                      </span>
                      <span className="text-slate-500">|</span>
                      <span>{selectedLobbyLevel.isCustom ? 'Custom' : 'Oficial'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* LIST OF ROSTER PARTICIPANTS BELOW PREVIEW */}
              <div className="mt-2.5 flex-1 overflow-y-auto">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                  Jugadores en Sala ({room.players.length})
                </div>
                <div className="flex flex-col gap-1.5">
                  {room.players.map((p: any) => {
                    const isLeader = room.leader === p.username;
                    return (
                      <div key={p.username} className="flex items-center justify-between p-1.5 bg-slate-900/60 border border-slate-800/40 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded bg-slate-950 border border-slate-900 flex items-center justify-center p-0.5">
                            <MiniCubeIcon 
                              skinId={p.skins?.cube || '0'} 
                              primaryColor={p.skins?.primaryColor || '#00FFFF'} 
                              secondaryColor={p.skins?.secondaryColor || '#FF00FF'} 
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-200 text-xs flex items-center gap-1">
                              {p.username}
                              {isLeader && <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />}
                            </div>
                            <div className="text-[8px] text-slate-500 font-mono">
                              ⭐ {p.stats?.stars || 0}
                            </div>
                          </div>
                        </div>
                        {isLeader && (
                          <span className="text-[7px] font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-1 rounded uppercase font-mono">LIDER</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ACTION START BUTTON (Leader only) */}
              <div className="mt-2">
                {room.leader.toLowerCase() === profile.username.toLowerCase() ? (
                  <button
                    onClick={handleStartGame}
                    disabled={!selectedLobbyLevel}
                    className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-150 flex items-center justify-center gap-2 ${selectedLobbyLevel ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/50 active:scale-[0.98]' : 'bg-slate-800 text-slate-500 border border-slate-700/40 cursor-not-allowed'}`}
                  >
                    <Play className="w-4 h-4 fill-slate-950" /> Iniciar Partida
                  </button>
                ) : (
                  <div className="text-center py-2 bg-indigo-950/20 border border-indigo-950/40 text-indigo-300 font-bold font-mono text-[9px] rounded-xl uppercase tracking-wider animate-pulse">
                    Esperando a que el líder inicie... ⌛
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* CHOOSE LEVELS SELECTION GRID (RIGHT 7 COLS) */}
          <div className="md:col-span-7 bg-slate-900/40 border border-indigo-950/30 rounded-2xl flex flex-col overflow-hidden h-full p-3">
            
            {/* COMPACT UPPER BAR IN LEVELS COLUMN */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
                🎮 Niveles Disponibles
              </h3>
              {/* INVITE BOX */}
              {room.players.length < 4 && (
                <div className="relative group">
                  <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg flex items-center gap-1">
                    <UserPlus className="w-3 h-3" /> Invitar Amigo
                  </button>
                  <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-slate-950 border border-slate-800 p-2 rounded-xl shadow-2xl z-50 w-48 text-left">
                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Tus Amigos Conectados</div>
                    <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                      {friendsList.filter(f => onlineUsers.includes(f) && !room.players.some((p: any) => p.username === f)).length === 0 ? (
                        <div className="text-[8px] text-slate-500 italic py-1">No hay amigos online libres</div>
                      ) : (
                        friendsList
                          .filter(f => onlineUsers.includes(f) && !room.players.some((p: any) => p.username === f))
                          .map(fName => (
                            <button
                              key={fName}
                              onClick={() => handleInviteFriend(fName)}
                              className="w-full text-left p-1 text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold rounded flex items-center justify-between"
                            >
                              <span>{fName}</span>
                              <span className="text-[8px] text-cyan-400 bg-cyan-500/10 px-1 rounded">INVITAR</span>
                            </button>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* TWO GRIDS ROW: OFFICIAL VS CUSTOM LEVELS */}
            <div className="flex-1 grid grid-cols-2 gap-2 overflow-hidden">
              {/* OFFICIALS */}
              <div className="flex flex-col overflow-hidden">
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Oficiales ({officialLevels.length})</div>
                <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
                  {officialLevels.map(lvl => {
                    const isSelected = selectedLobbyLevel?.id === lvl.id;
                    const canSelect = room.leader.toLowerCase() === profile.username.toLowerCase();
                    return (
                      <button
                        key={lvl.id}
                        disabled={!canSelect}
                        onClick={() => handleSelectLevel(lvl)}
                        className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between gap-2 ${isSelected ? 'bg-yellow-500/10 border-yellow-400 text-yellow-300' : 'bg-slate-950/50 border-slate-900/60 text-slate-400 hover:border-slate-800'} ${!canSelect ? 'cursor-default opacity-85' : 'cursor-pointer active:scale-[0.98]'}`}
                      >
                        <div className="flex items-center gap-2 truncate min-w-0">
                          <DifficultyFace diff={lvl.difficulty} size={5} />
                          <div className="font-bold text-[11px] truncate uppercase tracking-wider">{lvl.name}</div>
                        </div>
                        <div className="flex flex-col items-end text-[8px] font-mono text-slate-500 flex-shrink-0">
                          <span className="uppercase text-cyan-400 font-bold">{lvl.difficulty}</span>
                          <span>{lvl.musicTrack ? '♪ Tracks' : '♪ Standard'}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CUSTOMS */}
              <div className="flex flex-col overflow-hidden">
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Custom Creados ({customLevels.length})</div>
                <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1 font-mono">
                  {customLevels.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-[9px]">
                      No has creado ningún nivel.
                    </div>
                  ) : (
                    customLevels.map(lvl => {
                      const isSelected = selectedLobbyLevel?.id === lvl.id;
                      const canSelect = room.leader.toLowerCase() === profile.username.toLowerCase();
                      return (
                        <button
                          key={lvl.id}
                          disabled={!canSelect}
                          onClick={() => handleSelectLevel(lvl)}
                          className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between gap-2 ${isSelected ? 'bg-yellow-500/10 border-yellow-400 text-yellow-300' : 'bg-slate-950/50 border-slate-900/60 text-slate-400 hover:border-slate-800'} ${!canSelect ? 'cursor-default opacity-85' : 'cursor-pointer active:scale-[0.98]'}`}
                        >
                          <div className="flex items-center gap-2 truncate min-w-0">
                            <DifficultyFace diff={lvl.difficulty || 'na'} size={5} />
                            <div className="font-bold text-[11px] truncate uppercase tracking-wider">{lvl.name}</div>
                          </div>
                          <div className="flex flex-col items-end text-[8px] text-slate-500 flex-shrink-0">
                            <span className="uppercase text-cyan-400 font-bold">{lvl.difficulty || 'na'}</span>
                            <span>{lvl.elements.length} Elem.</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================
         POPUP MODAL: PLAYER PROFILE DETAILS (VER MAS)
         ======================================================== */}
      {selectedPlayerDetails && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="w-[420px] max-w-full bg-slate-950 border-4 border-indigo-900 rounded-3xl p-5 shadow-2xl relative animate-scale-up font-mono">
            <button
              onClick={() => { audio.playClick(); setSelectedPlayerDetails(null); }}
              className="absolute top-4 right-4 p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 border-b border-indigo-950 pb-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-indigo-500/50 flex items-center justify-center p-1 shadow-md">
                <MiniCubeIcon 
                  skinId={selectedPlayerDetails.skins?.cube || '0'} 
                  primaryColor={selectedPlayerDetails.skins?.primaryColor || '#00FFFF'} 
                  secondaryColor={selectedPlayerDetails.skins?.secondaryColor || '#FF00FF'} 
                  scale={1.3}
                />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  {selectedPlayerDetails.username}
                </h3>
                <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black ${onlineUsers.includes(selectedPlayerDetails.username) ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}>
                  {onlineUsers.includes(selectedPlayerDetails.username) ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>

            {/* STATISTICS GRID */}
            <div className="mb-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Estadísticas del Jugador</h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                  <span className="text-slate-400">Poder Orbes:</span>
                  <span className="font-bold text-yellow-400 flex items-center gap-1">💎 {selectedPlayerDetails.stats?.orbs || 0}</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                  <span className="text-slate-400">Diamantes:</span>
                  <span className="font-bold text-cyan-400 flex items-center gap-1">💠 {selectedPlayerDetails.stats?.diamonds || 0}</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                  <span className="text-slate-400">Estrellas:</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">⭐ {selectedPlayerDetails.stats?.stars || 0}</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                  <span className="text-slate-400">Completados:</span>
                  <span className="font-bold text-emerald-400">🏆 {selectedPlayerDetails.stats?.completedCount || 0}</span>
                </div>
              </div>
            </div>

            {/* CREATED LEVELS */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Niveles Creados ({selectedPlayerDetails.createdLevels?.length || 0})
              </h4>
              <div className="max-h-28 overflow-y-auto flex flex-col gap-1.5 pr-1">
                {!selectedPlayerDetails.createdLevels || selectedPlayerDetails.createdLevels.length === 0 ? (
                  <div className="text-center py-4 text-slate-600 text-[10px] italic">No ha creado niveles aún.</div>
                ) : (
                  selectedPlayerDetails.createdLevels.map((lvl: any) => (
                    <div key={lvl.id} className="p-2 bg-slate-900/40 border border-slate-850 rounded-lg text-[10px] text-slate-300 font-bold uppercase truncate flex items-center gap-2">
                      <DifficultyFace diff={lvl.difficulty || 'na'} size={4} />
                      <span>{lvl.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
         POPUP MODAL: LIVE INCOMING INVITATION TO JOIN ROOM
         ======================================================== */}
      {incomingInvite && (
        <div className="absolute top-4 right-4 z-50 w-80 bg-slate-950 border-2 border-indigo-500 p-4 rounded-2xl shadow-2xl flex flex-col gap-3 font-mono border-l-8 border-l-cyan-400 animate-slide-in">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase">¡INVITACIÓN EN VIVO! 🔔</h4>
              <p className="text-xs text-slate-200 mt-1">
                Tu amigo <strong className="text-yellow-400">{incomingInvite.from}</strong> te ha invitado a jugar en su sala.
              </p>
            </div>
            <button 
              onClick={() => setIncomingInvite(null)}
              className="p-1 hover:bg-slate-900 rounded text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => {
                handleJoinRoom(incomingInvite.roomId);
                setIncomingInvite(null);
              }}
              className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase rounded-lg active:scale-95 transition-all text-center"
            >
              Aceptar
            </button>
            <button
              onClick={() => setIncomingInvite(null)}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold uppercase rounded-lg"
            >
              Ignorar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

/* ========================================================
   HELPER COMPONENT: DRAW MINI CUBE SKIN ON CANVAS
   ======================================================== */
function MiniCubeIcon({ 
  skinId, 
  primaryColor, 
  secondaryColor,
  scale = 1.0
}: { 
  skinId: string; 
  primaryColor: string; 
  secondaryColor: string;
  scale?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const size = 22 * scale;

    drawCube(ctx, cx, cy, size, skinId, primaryColor, secondaryColor, 0);
  }, [skinId, primaryColor, secondaryColor, scale]);

  return <canvas ref={canvasRef} width={36} height={36} className="w-full h-full block" />;
}
