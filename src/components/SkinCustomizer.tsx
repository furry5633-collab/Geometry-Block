/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { PlayerSkins, Gamemode } from '../types';
import {
  CUBE_SKINS,
  WAVE_SKINS,
  ROBOT_SKINS,
  BALL_SKINS,
  COLOR_PALETTE,
  drawCube,
  drawWave,
  drawRobot,
  drawBall
} from '../skins';
import { Sparkles, Palette, ShieldCheck, ArrowLeft, Lock, Edit2, Coins, Gem, Trophy, Star } from 'lucide-react';

interface SkinCustomizerProps {
  skins: PlayerSkins;
  onSkinsChange: (updated: PlayerSkins) => void;
  onClose: () => void;
  profile: {
    username: string;
    stars: number;
    orbs: number;
    diamonds: number;
    completedCount: number;
  };
  onProfileChange: React.Dispatch<React.SetStateAction<{
    username: string;
    stars: number;
    orbs: number;
    diamonds: number;
    completedCount: number;
  }>>;
}

// 12 Gamemodes row to match Geometry Dash kit selection bar
type gdCategory = 'cube' | 'ship' | 'ball' | 'ufo' | 'wave' | 'robot' | 'spider' | 'swing' | 'jetpack' | 'trail' | 'death' | 'ship2';

export default function SkinCustomizer({ skins, onSkinsChange, onClose, profile, onProfileChange }: SkinCustomizerProps) {
  const [activeTab, setActiveTab] = useState<Gamemode>('cube');
  const [activeCategory, setActiveCategory] = useState<gdCategory>('cube');
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [animTick, setAnimTick] = useState(0);

  // Pagination for skins grid
  const [skinPage, setSkinPage] = useState(0);
  const skinsPerPage = 12; // 2 rows of 6 slots

  // Toggle showing colors customizer inside the panel
  const [showColorKit, setShowColorKit] = useState(false);

  // Edit username modal/input toggle
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(profile.username);

  // State for in-game skin purchase confirmation modals to prevent sandbox blockage
  const [purchaseSkin, setPurchaseSkin] = useState<{ skinId: string; cost: number; label: string } | null>(null);
  const [notEnoughOrbs, setNotEnoughOrbs] = useState<{ cost: number } | null>(null);

  // Load unlocked skins from localStorage or define defaults
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(() => {
    try {
      const data = localStorage.getItem('geometry_dash_unlocked_skins_v2');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    // Default unlocked skins (first 4 of each)
    return [
      'cube_classic', 'cube_angry', 'cube_cool', 'cube_creeper',
      'wave_classic', 'wave_dual', 'wave_cyber', 'wave_spiked',
      'robot_classic', 'robot_gladiator', 'robot_cat', 'robot_heavy',
      'ball_classic', 'ball_saw', 'ball_target', 'ball_biohazard'
    ];
  });

  // Save unlocked skins state
  useEffect(() => {
    localStorage.setItem('geometry_dash_unlocked_skins_v2', JSON.stringify(unlockedSkins));
  }, [unlockedSkins]);

  // Sync activeTab and activeCategory
  const handleCategorySelect = (cat: gdCategory) => {
    setActiveCategory(cat);
    setSkinPage(0);
    if (cat === 'cube' || cat === 'wave' || cat === 'robot' || cat === 'ball') {
      setActiveTab(cat);
    } else {
      // Show info/unlocked state for premium un-implemented vehicles
      alert(`🛸 ¡Vehículo ${cat.toUpperCase()} en camino! Estará disponible en futuras actualizaciones de Geometry Dash.`);
    }
  };

  // Retrieve current skin list
  const getSkinsList = () => {
    switch (activeTab) {
      case 'cube': return CUBE_SKINS;
      case 'wave': return WAVE_SKINS;
      case 'robot': return ROBOT_SKINS;
      case 'ball': return BALL_SKINS;
    }
  };

  const getEquippedSkinId = () => {
    return skins[activeTab];
  };

  // Check if a specific skin is unlocked
  const isSkinUnlocked = (skinId: string) => {
    return unlockedSkins.includes(skinId);
  };

  // Get cost details of a locked skin
  const getSkinUnlockCost = (skinId: string, index: number) => {
    // Determine cost based on the skin order
    if (index < 4) return { cost: 0, type: 'free' };
    if (index < 8) return { cost: 100, type: 'orbs', label: '100 Orbes 💎' };
    return { cost: 250, type: 'orbs', label: '250 Orbes 💎' };
  };

  const handleSelectSkin = (skinId: string, index: number) => {
    if (isSkinUnlocked(skinId)) {
      onSkinsChange({
        ...skins,
        [activeTab]: skinId
      });
    } else {
      // Try unlocking skin
      const costInfo = getSkinUnlockCost(skinId, index);
      if (costInfo.type === 'orbs') {
        if (profile.orbs >= costInfo.cost) {
          setPurchaseSkin({
            skinId,
            cost: costInfo.cost,
            label: costInfo.label
          });
        } else {
          setNotEnoughOrbs({
            cost: costInfo.cost
          });
        }
      }
    }
  };

  const handleSelectColor = (type: 'primary' | 'secondary', color: string) => {
    onSkinsChange({
      ...skins,
      [type === 'primary' ? 'primaryColor' : 'secondaryColor']: color
    });
  };

  const handleSaveName = () => {
    const trimmed = editedName.trim();
    if (trimmed) {
      onProfileChange(prev => ({
        ...prev,
        username: trimmed
      }));
      setIsEditingName(false);
    }
  };

  // Float loop animation
  useEffect(() => {
    let animId: number;
    const tick = () => {
      setAnimTick(prev => (prev + 1) % 360);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Live drawing
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < canvas.width; x += 25) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 25) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const size = 110;

    // Bobbing/floating effect
    const bobOffset = Math.sin(animTick * 0.05) * 8;
    const rotation = activeTab === 'cube' 
      ? (animTick * 0.01) 
      : activeTab === 'ball' 
        ? (animTick * 0.02) 
        : 0;

    if (activeTab === 'cube') {
      drawCube(ctx, cx, cy + bobOffset, size, skins.cube, skins.primaryColor, skins.secondaryColor, rotation);
    } else if (activeTab === 'wave') {
      drawWave(ctx, cx, cy + bobOffset, size, skins.wave, skins.primaryColor, skins.secondaryColor, -Math.PI / 8);
    } else if (activeTab === 'robot') {
      drawRobot(ctx, cx, cy + 20 + bobOffset * 0.5, size * 0.9, skins.robot, skins.primaryColor, skins.secondaryColor, false, animTick);
    } else if (activeTab === 'ball') {
      drawBall(ctx, cx, cy + bobOffset, size, skins.ball, skins.primaryColor, skins.secondaryColor, rotation);
    }
  }, [activeTab, skins, animTick]);

  // Pagination bounds
  const totalSkins = getSkinsList().length;
  const totalPages = Math.ceil(totalSkins / skinsPerPage);
  const currentSkins = getSkinsList().slice(skinPage * skinsPerPage, (skinPage + 1) * skinsPerPage);

  const prevPage = () => {
    setSkinPage(prev => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const nextPage = () => {
    setSkinPage(prev => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  // 4 active icons in Geometry Dash category select row
  const categoryIcons: { id: gdCategory; label: string; text: string }[] = [
    { id: 'cube', label: 'Cubo', text: '🟩' },
    { id: 'ball', label: 'Rueda', text: '⚙️' },
    { id: 'wave', label: 'Wave', text: '⚡' },
    { id: 'robot', label: 'Robot', text: '🤖' },
  ];

  return (
    <div className="w-full h-full bg-slate-900 text-white flex flex-col p-4 relative font-sans overflow-hidden select-none">
      
      {/* Background Graphic Patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(45deg,#000_25%,transparent_25%),linear-gradient(-45deg,#000_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#000_75%),linear-gradient(-45deg,transparent_75%,#000_75%)] bg-[size:40px_40px] z-0" />

      {/* TOP HEADER NAME BANNER (PLAYER) */}
      <div className="z-10 flex flex-col items-center justify-center text-center mt-1 mb-3">
        {isEditingName ? (
          <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-xl border border-slate-700">
            <input
              type="text"
              value={editedName}
              onChange={e => setEditedName(e.target.value)}
              className="px-3 py-1 bg-slate-800 text-yellow-300 font-bold border border-yellow-500/30 rounded-lg text-sm uppercase text-center outline-none focus:ring-1 focus:ring-yellow-400"
              maxLength={15}
              autoFocus
            />
            <button
              onClick={handleSaveName}
              className="px-3 py-1 bg-green-500 text-black font-black text-xs uppercase rounded-lg hover:bg-green-400 transition"
            >
              OK
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <h1 
              className="text-4xl sm:text-5xl font-black tracking-widest text-white uppercase"
              style={{
                textShadow: '0 3px 0 #000, 0 5px 0 #000, 3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000',
              }}
            >
              {profile.username}
            </h1>
            <button 
              onClick={() => setIsEditingName(true)} 
              className="p-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:text-white transition hover:scale-105 active:scale-95 cursor-pointer"
              title="Cambiar Nombre de Jugador"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* MIDDLE ZONE: PREVIEW + SHOP + STATS SIDEBAR */}
      <div className="z-10 flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 max-w-6xl mx-auto w-full items-center min-h-0">
        
        {/* LEFT COLUMN: THE SHOP HANGING LOGO (COL 1-3) */}
        <div className="md:col-span-3 flex flex-col items-center gap-3 justify-center">
          {/* Authentic Hanging Signboard */}
          <div 
            className="bg-amber-800 border-[3px] border-black rounded-xl px-4 py-2 text-center relative select-none transform -rotate-2"
            style={{
              boxShadow: '0 4px 0 #451a03, inset 0 2px 4px rgba(255,255,255,0.2)',
            }}
          >
            {/* Hanging chain visual elements */}
            <div className="absolute -top-3 left-6 w-1 h-3 bg-slate-600 border border-black rounded" />
            <div className="absolute -top-3 right-6 w-1 h-3 bg-slate-600 border border-black rounded" />
            
            <span className="text-[10px] font-mono font-bold text-amber-300 block leading-none tracking-widest">TIENDA KIT</span>
            <span 
              className="text-lg font-extrabold text-white block uppercase"
              style={{
                textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
              }}
            >
              THE SHOP
            </span>
          </div>

          {/* Color Palettes Switcher Toggle */}
          <button
            onClick={() => setShowColorKit(!showColorKit)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-black font-extrabold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition cursor-pointer ${showColorKit ? 'bg-amber-400 text-black' : 'bg-slate-800 hover:bg-slate-700 text-yellow-400'}`}
            style={{
              boxShadow: '0 4px 0 #000000',
            }}
          >
            <Palette className="w-4 h-4" />
            {showColorKit ? 'Ver Diseños' : 'Ver Colores'}
          </button>
        </div>

        {/* CENTER COLUMN: PREVIEW WINDOW (COL 4-8) */}
        <div className="md:col-span-6 flex flex-col items-center justify-center">
          <div className="relative rounded-2xl overflow-hidden border-[3px] border-black shadow-2xl bg-slate-900 p-1">
            <canvas
              ref={previewCanvasRef}
              width={220}
              height={220}
              className="rounded-xl"
            />
            {/* Dark shadow overlay */}
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            
            {/* Vehicle Mode Label inside preview */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/75 px-3 py-1 rounded-full border border-slate-800 text-[10px] font-bold text-cyan-400 uppercase tracking-widest whitespace-nowrap">
              {activeTab === 'cube' && 'Cubo'}
              {activeTab === 'wave' && 'Wave (Dardo)'}
              {activeTab === 'robot' && 'Robot'}
              {activeTab === 'ball' && 'Rueda (Ball)'}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STATS ROW COUNTERS (COL 9-12) */}
        <div className="md:col-span-3 flex md:flex-col flex-wrap justify-center md:items-start gap-2 bg-black/35 backdrop-blur-md p-3 rounded-2xl border border-slate-800 self-center">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest w-full border-b border-slate-800/60 pb-1 mb-1 hidden md:block">
            RECOMPENSAS GD
          </div>
          <div className="flex items-center gap-2 min-w-[100px]" title="Estrellas">
            <div className="w-6 h-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center justify-center text-sm">⭐</div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-mono leading-none">ESTRELLAS</span>
              <span className="text-sm font-black text-yellow-400 font-mono">{profile.stars}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-[100px]" title="Orbes de Poder">
            <div className="w-6 h-6 bg-pink-500/10 border border-pink-500/20 rounded-lg flex items-center justify-center text-sm">🔮</div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-mono leading-none">ORBES</span>
              <span className="text-sm font-black text-pink-400 font-mono">{profile.orbs}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-[100px]" title="Diamantes Azules">
            <div className="w-6 h-6 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center text-sm">💠</div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-mono leading-none">DIAMANTES</span>
              <span className="text-sm font-black text-cyan-400 font-mono">{profile.diamonds}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-[100px]" title="Monedas Completadas">
            <div className="w-6 h-6 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center text-sm">🪙</div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-mono leading-none">COMPLETADOS</span>
              <span className="text-sm font-black text-amber-400 font-mono">{profile.completedCount}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-[100px]" title="Monedas Especiales">
            <div className="w-6 h-6 bg-slate-500/10 border border-slate-500/20 rounded-lg flex items-center justify-center text-sm">🥈</div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-mono leading-none">MONEDAS US</span>
              <span className="text-sm font-black text-slate-300 font-mono">0</span>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-[100px]" title="Llaves de Cofres">
            <div className="w-6 h-6 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center text-sm">🔑</div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-mono leading-none">LLAVES</span>
              <span className="text-sm font-black text-purple-400 font-mono">1</span>
            </div>
          </div>
        </div>

      </div>

      {/* CATEGORY SELECTOR ROW (12 circle items) */}
      <div className="z-10 flex justify-center items-center gap-2 bg-black/45 py-2 px-4 rounded-xl border border-slate-800/80 my-3 max-w-4xl mx-auto w-full overflow-x-auto scrollbar-none">
        {categoryIcons.map(cat => {
          const isActive = activeCategory === cat.id;
          const isSupported = cat.id === 'cube' || cat.id === 'wave' || cat.id === 'robot' || cat.id === 'ball';
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-base border-2 transition active:scale-90 cursor-pointer ${isActive ? 'bg-cyan-500 text-black border-cyan-400 scale-110 shadow-lg shadow-cyan-500/20' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'} ${!isSupported ? 'opacity-50' : ''}`}
              title={cat.label}
            >
              {cat.text}
            </button>
          );
        })}
      </div>

      <div className="text-center text-[10px] text-slate-400 font-mono font-bold uppercase mb-2">
        ¡Toca las skins con 🔒 para comprarlas con Orbes de Poder 🔮! Pagina {skinPage + 1}/{totalPages || 1}
      </div>

      {/* CATALOG PANEL (SLOTS GRID OR COLORS KIT) */}
      <div className="z-10 max-w-4xl mx-auto w-full flex items-center gap-3">
        
        {/* Left Arrow (only if not colors kit) */}
        {!showColorKit && (
          <button
            onClick={prevPage}
            className="w-10 h-10 rounded-xl bg-green-500 border-2 border-black flex items-center justify-center shadow-md active:scale-90 hover:scale-105 transition duration-150 cursor-pointer text-black"
            style={{ boxShadow: '0 4px 0 #000000' }}
          >
            ◀
          </button>
        )}

        {/* GREY CAROUSEL PANEL */}
        <div className="flex-1 bg-neutral-800 border-[3px] border-black rounded-2xl p-4 shadow-2xl relative min-h-[160px] flex items-center justify-center">
          
          {showColorKit ? (
            /* COLOR PICKER DRAWER */
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5 justify-center">
                  <div className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: skins.primaryColor }} />
                  <span className="text-[10px] font-mono font-black uppercase text-slate-300 tracking-wider">COLOR PRIMARIO</span>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {COLOR_PALETTE.map(color => (
                    <button
                      key={color}
                      onClick={() => handleSelectColor('primary', color)}
                      className={`w-6 h-6 rounded-md border border-black transition active:scale-90 ${skins.primaryColor === color ? 'ring-2 ring-yellow-400 scale-105 shadow' : 'opacity-85 hover:opacity-100'}`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Secondary */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5 justify-center">
                  <div className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: skins.secondaryColor }} />
                  <span className="text-[10px] font-mono font-black uppercase text-slate-300 tracking-wider">COLOR SECUNDARIO</span>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {COLOR_PALETTE.map(color => (
                    <button
                      key={color}
                      onClick={() => handleSelectColor('secondary', color)}
                      className={`w-6 h-6 rounded-md border border-black transition active:scale-90 ${skins.secondaryColor === color ? 'ring-2 ring-yellow-400 scale-105 shadow' : 'opacity-85 hover:opacity-100'}`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* DESIGN GRID SLOTS */
            <div className="w-full grid grid-cols-6 gap-3">
              {currentSkins.map((skin, idx) => {
                const globalIndex = skinPage * skinsPerPage + idx;
                const isEquipped = getEquippedSkinId() === skin.id;
                const unlocked = isSkinUnlocked(skin.id);
                const costInfo = getSkinUnlockCost(skin.id, globalIndex);

                return (
                  <button
                    key={skin.id}
                    onClick={() => handleSelectSkin(skin.id, globalIndex)}
                    className={`aspect-square rounded-xl border-[2.5px] flex flex-col items-center justify-center bg-slate-900 shadow-md relative transition duration-150 active:scale-95 group overflow-hidden cursor-pointer ${isEquipped ? 'border-yellow-400 bg-slate-950/90 scale-105' : 'border-neutral-900 hover:border-slate-600'}`}
                  >
                    {unlocked ? (
                      /* Skin icon preview */
                      <div className="w-10 h-10 flex items-center justify-center pointer-events-none">
                        <SkinMiniIcon skinId={skin.id} mode={activeTab} colors={skins} />
                      </div>
                    ) : (
                      /* Locked Lock icon */
                      <div className="flex flex-col items-center justify-center">
                        <Lock className="w-4 h-4 text-rose-500 fill-current" />
                        <span className="text-[8px] font-mono font-bold text-rose-400 mt-0.5">{costInfo.cost} 🔮</span>
                      </div>
                    )}

                    {/* Green check badge if equipped */}
                    {isEquipped && (
                      <div className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-yellow-400 text-black">
                        <ShieldCheck className="w-3 h-3 fill-current" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Arrow (only if not colors kit) */}
        {!showColorKit && (
          <button
            onClick={nextPage}
            className="w-10 h-10 rounded-xl bg-green-500 border-2 border-black flex items-center justify-center shadow-md active:scale-90 hover:scale-105 transition duration-150 cursor-pointer text-black"
            style={{ boxShadow: '0 4px 0 #000000' }}
          >
            ▶
          </button>
        )}

      </div>

      {/* Indicator dots for paginator */}
      {!showColorKit && (
        <div className="z-10 flex justify-center gap-1.5 mt-2.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${skinPage === i ? 'bg-cyan-400 scale-125 shadow-glow' : 'bg-neutral-600'}`}
            />
          ))}
        </div>
      )}

      {/* BOTTOM ACTION BUTTON: BACK BUTTON (PINK TRIANGLE) */}
      <div className="z-10 mt-auto flex justify-start pl-4 pb-2">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-rose-500 to-rose-700 border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-lg active:scale-95 hover:scale-105 transition cursor-pointer"
          style={{
            boxShadow: '0 5px 0 #000000',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          VOLVER
        </button>
      </div>

      {/* IN-GAME PURCHASE CONFIRM MODAL */}
      {purchaseSkin && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center text-white">
          <div className="w-[380px] max-w-[90%] bg-slate-900 border-4 border-slate-800 p-6 rounded-3xl text-center shadow-2xl relative flex flex-col justify-between animate-scale-up">
            <div>
              <h3 className="text-xl font-black uppercase tracking-widest text-pink-400 mb-2" style={{ textShadow: '0 2px 0 #000' }}>
                🔮 DESBLOQUEAR SKIN 🔮
              </h3>
              <p className="text-sm text-slate-300 mt-4 leading-relaxed">
                ¿Quieres comprar esta skin por <span className="font-bold text-pink-400 font-mono">{purchaseSkin.label}</span>?
              </p>
              <p className="text-xs text-slate-500 font-mono mt-3">
                Tus Orbes actuales: <span className="text-pink-400 font-bold font-mono">{profile.orbs}</span> 🔮
              </p>
            </div>
            
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => {
                  // Deduct orbs and unlock skin
                  onProfileChange(prev => ({
                    ...prev,
                    orbs: prev.orbs - purchaseSkin.cost
                  }));
                  setUnlockedSkins(prev => [...prev, purchaseSkin.skinId]);
                  // Equip immediately
                  onSkinsChange({
                    ...skins,
                    [activeTab]: purchaseSkin.skinId
                  });
                  setPurchaseSkin(null);
                }}
                className="px-5 py-2.5 bg-gradient-to-b from-green-400 to-green-600 border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider text-black hover:scale-105 active:scale-95 transition cursor-pointer"
                style={{ boxShadow: '0 3px 0 #000' }}
              >
                SÍ, COMPRAR
              </button>
              <button
                onClick={() => setPurchaseSkin(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOT ENOUGH ORBS WARNING MODAL */}
      {notEnoughOrbs && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center text-white">
          <div className="w-[380px] max-w-[90%] bg-slate-900 border-4 border-slate-800 p-6 rounded-3xl text-center shadow-2xl relative flex flex-col justify-between animate-scale-up">
            <div>
              <h3 className="text-xl font-black uppercase tracking-widest text-yellow-400 mb-2" style={{ textShadow: '0 2px 0 #000' }}>
                🔮 ORBES INSUFICIENTES 🔮
              </h3>
              <p className="text-sm text-slate-300 mt-4 leading-relaxed">
                Necesitas <span className="font-bold text-pink-400 font-mono">{notEnoughOrbs.cost} Orbes</span> de Poder para desbloquear esta skin.
              </p>
              <p className="text-xs text-slate-400 mt-3 font-mono">
                ¡Sigue jugando y completando niveles para conseguir más orbes de recompensa!
              </p>
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setNotEnoughOrbs(null)}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                ENTENDIDO
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Helper Mini Canvas component to draw a skin icon button statically
function SkinMiniIcon({ skinId, mode, colors }: { skinId: string; mode: Gamemode; colors: PlayerSkins }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const size = 32;

    if (mode === 'cube') {
      drawCube(ctx, cx, cy, size, skinId, colors.primaryColor, colors.secondaryColor, 0);
    } else if (mode === 'wave') {
      drawWave(ctx, cx, cy, size, skinId, colors.primaryColor, colors.secondaryColor, -Math.PI / 12);
    } else if (mode === 'robot') {
      drawRobot(ctx, cx, cy + 6, size * 0.9, skinId, colors.primaryColor, colors.secondaryColor, false, 0);
    } else if (mode === 'ball') {
      drawBall(ctx, cx, cy, size, skinId, colors.primaryColor, colors.secondaryColor, 0);
    }
  }, [skinId, mode, colors]);

  return <canvas ref={canvasRef} width={48} height={48} className="w-full h-full" />;
}
