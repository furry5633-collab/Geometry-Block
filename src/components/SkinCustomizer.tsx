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

  // Load unlocked skins from localStorage or define defaults (Since we only have 4, all are unlocked by default)
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(() => {
    return [
      'cube_classic', 'cube_angry', 'cube_cool', 'cube_creeper',
      'wave_classic', 'wave_dual', 'wave_cyber', 'wave_spiked',
      'robot_classic', 'robot_gladiator', 'robot_cat', 'robot_heavy',
      'ball_classic', 'ball_saw', 'ball_target', 'ball_biohazard'
    ];
  });

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

  const categoryIcons: { id: gdCategory; label: string; text: string }[] = [
    { id: 'cube', label: 'Cubo', text: '🟩' },
    { id: 'ball', label: 'Rueda', text: '⚙️' },
    { id: 'wave', label: 'Wave', text: '⚡' },
    { id: 'robot', label: 'Robot', text: '🤖' },
  ];

  return (
    <div className="w-full h-full bg-slate-900 text-white flex flex-col p-3 md:p-5 relative font-sans overflow-hidden select-none">
      
      {/* Background Graphic Patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(45deg,#000_25%,transparent_25%),linear-gradient(-45deg,#000_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#000_75%),linear-gradient(-45deg,transparent_75%,#000_75%)] bg-[size:40px_40px] z-0" />

      {/* Embedded Landscape-Specific Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-height: 580px) {
          .customizer-layout-container {
            flex-direction: row !important;
            align-items: stretch !important;
            gap: 16px !important;
          }
          .panel-left {
            width: 35% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            align-items: center !important;
            border-right: 2px solid rgba(255, 255, 255, 0.08) !important;
            padding-right: 12px !important;
            padding-bottom: 0 !important;
          }
          .panel-right {
            width: 65% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            align-items: stretch !important;
          }
          .compact-title-h1 {
            font-size: 1.5rem !important;
            margin-bottom: 2px !important;
          }
          .compact-canvas-wrapper {
            width: 105px !important;
            height: 105px !important;
            padding: 2px !important;
          }
          .compact-canvas-wrapper canvas {
            width: 100px !important;
            height: 100px !important;
          }
          .hide-on-landscape {
            display: none !important;
          }
          .stats-grid-compact {
            display: flex !important;
            flex-wrap: wrap !important;
            flex-direction: row !important;
            gap: 4px !important;
            background: none !important;
            border: none !important;
            padding: 0 !important;
            margin-top: 4px !important;
          }
          .stats-item-compact {
            min-width: 70px !important;
            gap: 3px !important;
          }
          .stats-item-compact div {
            font-size: 11px !important;
          }
          .stats-item-compact span {
            font-size: 11px !important;
          }
          .category-row-compact {
            margin-top: 2px !important;
            margin-bottom: 2px !important;
            padding-top: 2px !important;
            padding-bottom: 2px !important;
          }
          .category-btn-compact {
            width: 32px !important;
            height: 32px !important;
            font-size: 12px !important;
          }
          .skins-grid-compact {
            gap: 6px !important;
            padding: 8px !important;
            min-height: unset !important;
          }
          .skins-grid-slot {
            width: 44px !important;
            height: 44px !important;
          }
          .skins-grid-slot canvas {
            width: 30px !important;
            height: 30px !important;
          }
          .color-palette-compact button {
            width: 20px !important;
            height: 20px !important;
          }
          .toggle-colors-btn {
            padding: 4px 8px !important;
            font-size: 10px !important;
          }
        }
      `}} />

      {/* DYNAMIC LAYOUT ADAPTER */}
      <div className="customizer-layout-container z-10 flex flex-col flex-1 min-h-0 w-full max-w-6xl mx-auto">
        
        {/* PANEL LEFT: TITLE, LIVE PREVIEW, AND STATS */}
        <div className="panel-left flex flex-col items-center justify-start pb-3">
          
          {/* Header username */}
          <div className="flex flex-col items-center justify-center text-center mt-1 mb-2">
            {isEditingName ? (
              <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-slate-700">
                <input
                  type="text"
                  value={editedName}
                  onChange={e => setEditedName(e.target.value)}
                  className="px-2 py-0.5 bg-slate-800 text-yellow-300 font-bold border border-yellow-500/30 rounded-lg text-xs uppercase text-center outline-none focus:ring-1 focus:ring-yellow-400 w-32"
                  maxLength={15}
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="px-2 py-0.5 bg-green-500 text-black font-black text-[10px] uppercase rounded-md hover:bg-green-400 transition"
                >
                  OK
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 
                  className="compact-title-h1 text-3xl sm:text-4xl md:text-5xl font-black tracking-widest text-white uppercase"
                  style={{
                    textShadow: '0 2px 0 #000, 0 4px 0 #000, 2px 2px 0 #000, -2px -2px 0 #000',
                  }}
                >
                  {profile.username}
                </h1>
                <button 
                  onClick={() => setIsEditingName(true)} 
                  className="p-1 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded-md text-slate-300 hover:text-white transition hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Canvas Live Preview */}
          <div className="compact-canvas-wrapper relative rounded-2xl overflow-hidden border-[3px] border-black shadow-2xl bg-slate-900 p-1 my-1">
            <canvas
              ref={previewCanvasRef}
              width={220}
              height={220}
              className="rounded-xl w-[150px] h-[150px] md:w-[220px] md:h-[220px]"
            />
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-black/75 px-2 py-0.5 rounded-full border border-slate-800 text-[9px] font-bold text-cyan-400 uppercase tracking-wider whitespace-nowrap">
              {activeTab === 'cube' && 'Cubo'}
              {activeTab === 'wave' && 'Wave'}
              {activeTab === 'robot' && 'Robot'}
              {activeTab === 'ball' && 'Rueda'}
            </div>
          </div>

          {/* Stats Rows */}
          <div className="stats-grid-compact flex md:flex-col flex-wrap justify-center gap-1.5 bg-black/35 backdrop-blur-md p-2 rounded-xl border border-slate-800 w-full mt-2">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest w-full border-b border-slate-800/60 pb-0.5 mb-0.5 hidden md:block">
              RECOMPENSAS GD
            </div>
            <div className="stats-item-compact flex items-center gap-1.5 min-w-[70px] md:min-w-[100px]">
              <span className="text-xs">⭐</span>
              <div className="flex flex-col">
                <span className="text-[8px] text-slate-400 font-mono leading-none hidden md:block">ESTRELLAS</span>
                <span className="text-xs font-black text-yellow-400 font-mono leading-none">{profile.stars}</span>
              </div>
            </div>
            <div className="stats-item-compact flex items-center gap-1.5 min-w-[70px] md:min-w-[100px]">
              <span className="text-xs">🔮</span>
              <div className="flex flex-col">
                <span className="text-[8px] text-slate-400 font-mono leading-none hidden md:block">ORBES</span>
                <span className="text-xs font-black text-pink-400 font-mono leading-none">{profile.orbs}</span>
              </div>
            </div>
            <div className="stats-item-compact flex items-center gap-1.5 min-w-[70px] md:min-w-[100px]">
              <span className="text-xs">💠</span>
              <div className="flex flex-col">
                <span className="text-[8px] text-slate-400 font-mono leading-none hidden md:block">DIAMANTES</span>
                <span className="text-xs font-black text-cyan-400 font-mono leading-none">{profile.diamonds}</span>
              </div>
            </div>
            <div className="stats-item-compact flex items-center gap-1.5 min-w-[70px] md:min-w-[100px]">
              <span className="text-xs">🪙</span>
              <div className="flex flex-col">
                <span className="text-[8px] text-slate-400 font-mono leading-none hidden md:block">COMPLETADOS</span>
                <span className="text-xs font-black text-amber-400 font-mono leading-none">{profile.completedCount}</span>
              </div>
            </div>
          </div>

          {/* VOLVER button directly placed in Left panel footer to stay visible */}
          <div className="mt-2 w-full flex justify-center md:justify-start">
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-b from-rose-500 to-rose-700 border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-md active:scale-95 hover:scale-105 transition cursor-pointer"
              style={{ boxShadow: '0 3px 0 #000' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              VOLVER
            </button>
          </div>

        </div>

        {/* PANEL RIGHT: CATEGORIES, SKINS SELECTION GRID, COLORS */}
        <div className="panel-right flex-1 flex flex-col items-center justify-start min-h-0 pl-0 md:pl-4">
          
          {/* Shop branding & design togglers row */}
          <div className="flex items-center justify-between w-full gap-3 bg-black/20 p-2 rounded-xl mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-400 font-black tracking-wider">TIENDA KIT</span>
              <div className="hide-on-landscape px-2 py-0.5 bg-amber-500 text-black text-[9px] font-black rounded-md uppercase">ONLINE</div>
            </div>

            {/* Color Palette Toggle button */}
            <button
              onClick={() => setShowColorKit(!showColorKit)}
              className={`toggle-colors-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black font-extrabold text-[10px] uppercase tracking-wider hover:scale-105 active:scale-95 transition cursor-pointer ${showColorKit ? 'bg-amber-400 text-black' : 'bg-slate-800 hover:bg-slate-700 text-yellow-400'}`}
              style={{ boxShadow: '0 2px 0 #000' }}
            >
              <Palette className="w-3.5 h-3.5" />
              {showColorKit ? 'Ver Diseños' : 'Ver Colores'}
            </button>
          </div>

          {/* CATEGORY SELECTOR ROW */}
          <div className="category-row-compact flex justify-center items-center gap-2.5 bg-black/45 py-1.5 px-3 rounded-xl border border-slate-800/80 w-full mb-3">
            {categoryIcons.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`category-btn-compact w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base border-2 transition active:scale-90 cursor-pointer ${isActive ? 'bg-cyan-500 text-black border-cyan-400 scale-105 shadow-md' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'}`}
                  title={cat.label}
                >
                  {cat.text}
                </button>
              );
            })}
          </div>

          {/* SKINS SELECTION GRID PANEL */}
          <div className="skins-grid-compact flex-1 w-full bg-neutral-800 border-[3px] border-black rounded-2xl p-3 shadow-xl relative min-h-[140px] flex items-center justify-center overflow-y-auto">
            
            {showColorKit ? (
              /* COMPACT COLOR PALETTES */
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Primary */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: skins.primaryColor }} />
                    <span className="text-[9px] font-mono font-black uppercase text-slate-300">COLOR PRIMARIO</span>
                  </div>
                  <div className="color-palette-compact flex flex-wrap gap-1 justify-center max-w-[280px]">
                    {COLOR_PALETTE.map(color => (
                      <button
                        key={color}
                        onClick={() => handleSelectColor('primary', color)}
                        className={`w-5 h-5 rounded border border-black transition active:scale-90 ${skins.primaryColor === color ? 'ring-2 ring-yellow-400 scale-105 shadow' : 'opacity-85 hover:opacity-100'}`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Secondary */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: skins.secondaryColor }} />
                    <span className="text-[9px] font-mono font-black uppercase text-slate-300">COLOR SECUNDARIO</span>
                  </div>
                  <div className="color-palette-compact flex flex-wrap gap-1 justify-center max-w-[280px]">
                    {COLOR_PALETTE.map(color => (
                      <button
                        key={color}
                        onClick={() => handleSelectColor('secondary', color)}
                        className={`w-5 h-5 rounded border border-black transition active:scale-90 ${skins.secondaryColor === color ? 'ring-2 ring-yellow-400 scale-105 shadow' : 'opacity-85 hover:opacity-100'}`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* MULTIPLE COMPACT SLOTS */
              <div className="w-full flex justify-center items-center">
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {currentSkins.map((skin, idx) => {
                    const globalIndex = skinPage * skinsPerPage + idx;
                    const isEquipped = getEquippedSkinId() === skin.id;
                    const unlocked = isSkinUnlocked(skin.id);

                    return (
                      <button
                        key={skin.id}
                        onClick={() => handleSelectSkin(skin.id, globalIndex)}
                        className={`skins-grid-slot w-12 h-12 md:w-14 md:h-14 rounded-xl border-2 flex flex-col items-center justify-center bg-slate-900 shadow-md relative transition duration-150 active:scale-95 group overflow-hidden cursor-pointer ${isEquipped ? 'border-yellow-400 bg-slate-950 scale-105' : 'border-neutral-900 hover:border-slate-600'}`}
                      >
                        {unlocked ? (
                          <div className="w-8 h-8 flex items-center justify-center pointer-events-none">
                            <SkinMiniIcon skinId={skin.id} mode={activeTab} colors={skins} />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <Lock className="w-3 h-3 text-rose-500 fill-current" />
                          </div>
                        )}

                        {isEquipped && (
                          <div className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-yellow-400 text-black">
                            <ShieldCheck className="w-2.5 h-2.5 fill-current" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Dynamic Carousel indicators (only shown if pages exist) */}
          {!showColorKit && totalPages > 1 && (
            <div className="flex justify-center gap-1.5 mt-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${skinPage === i ? 'bg-cyan-400 scale-110' : 'bg-neutral-600'}`}
                />
              ))}
            </div>
          )}

          <div className="text-center text-[9px] text-slate-500 font-mono mt-2 uppercase tracking-wide">
            ¡Personaliza colores y diseños para tu jugador de Geometry Dash!
          </div>

        </div>

      </div>

      {/* POPUP: IN-GAME PURCHASE CONFIRM MODAL */}
      {purchaseSkin && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center text-white">
          <div className="w-[340px] max-w-[95%] max-h-[95%] overflow-y-auto bg-slate-900 border-4 border-slate-800 p-5 rounded-3xl text-center shadow-2xl relative flex flex-col justify-between animate-scale-up">
            <div>
              <h3 className="text-lg font-black uppercase tracking-widest text-pink-400 mb-1" style={{ textShadow: '0 2px 0 #000' }}>
                🔮 DESBLOQUEAR SKIN 🔮
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                ¿Quieres comprar esta skin por <span className="font-bold text-pink-400 font-mono">{purchaseSkin.label}</span>?
              </p>
              <p className="text-[10px] text-slate-500 font-mono mt-2">
                Tus Orbes actuales: <span className="text-pink-400 font-bold font-mono">{profile.orbs}</span> 🔮
              </p>
            </div>
            
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() => {
                  onProfileChange(prev => ({
                    ...prev,
                    orbs: prev.orbs - purchaseSkin.cost
                  }));
                  setUnlockedSkins(prev => [...prev, purchaseSkin.skinId]);
                  onSkinsChange({
                    ...skins,
                    [activeTab]: purchaseSkin.skinId
                  });
                  setPurchaseSkin(null);
                }}
                className="px-4 py-2 bg-gradient-to-b from-green-400 to-green-600 border border-black rounded-xl font-black text-[10px] uppercase tracking-wider text-black hover:scale-105 active:scale-95 transition cursor-pointer"
                style={{ boxShadow: '0 2px 0 #000' }}
              >
                SÍ, COMPRAR
              </button>
              <button
                onClick={() => setPurchaseSkin(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP: NOT ENOUGH ORBS WARNING */}
      {notEnoughOrbs && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center text-white">
          <div className="w-[340px] max-w-[95%] max-h-[95%] overflow-y-auto bg-slate-900 border-4 border-slate-800 p-5 rounded-3xl text-center shadow-2xl relative flex flex-col justify-between animate-scale-up">
            <div>
              <h3 className="text-lg font-black uppercase tracking-widest text-yellow-400 mb-1" style={{ textShadow: '0 2px 0 #000' }}>
                🔮 ORBES INSUFICIENTES 🔮
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Necesitas <span className="font-bold text-pink-400 font-mono">{notEnoughOrbs.cost} Orbes</span> de Poder para desbloquear esta skin.
              </p>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">
                ¡Sigue jugando y completando niveles para conseguir más orbes de recompensa!
              </p>
            </div>
            
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setNotEnoughOrbs(null)}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer"
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
