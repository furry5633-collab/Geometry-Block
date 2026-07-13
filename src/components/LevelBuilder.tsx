/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Level, LevelElement, ElementType, Difficulty } from '../types';
import { saveCustomLevel } from '../levels';
import {
  Wrench,
  Play,
  Save,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  HelpCircle,
  FileEdit,
  RotateCcw,
  RotateCw,
  Undo,
  Redo,
  Check,
  Sparkles,
  Sliders
} from 'lucide-react';

interface LevelBuilderProps {
  initialLevel: Level | null;
  onSaveAndClose: () => void;
  onPlaytest: (testLevel: Level) => void;
}

interface BrushOption {
  type: ElementType;
  name: string;
  color: string;
  symbol: string;
  category: 'blocks' | 'hazards' | 'pads' | 'portals' | 'speeds';
}

const BRUSH_OPTIONS: BrushOption[] = [
  // Blocks
  { type: 'block', name: 'Bloque Sólido', color: 'bg-slate-700 border-slate-500 text-white', symbol: '■', category: 'blocks' },
  { type: 'slope_r', name: 'Rampa Sube', color: 'bg-slate-700 border-slate-500 text-slate-300', symbol: '◢', category: 'blocks' },
  { type: 'slope_l', name: 'Rampa Baja', color: 'bg-slate-700 border-slate-500 text-slate-300', symbol: '◣', category: 'blocks' },
  { type: 'fake_block', name: 'Bloque Falso', color: 'bg-slate-800 border-dashed border-slate-600 text-slate-400', symbol: '░', category: 'blocks' },
  // Hazards
  { type: 'spike', name: 'Pico Letal', color: 'bg-rose-950 border-rose-600 text-rose-400', symbol: '▲', category: 'hazards' },
  { type: 'spike_inverted', name: 'Pico Techo', color: 'bg-rose-950/80 border-dashed border-rose-500 text-rose-300', symbol: '▼', category: 'hazards' },
  { type: 'spike_small', name: 'Pico Pequeño', color: 'bg-red-950 border-red-700 text-red-400', symbol: '▴', category: 'hazards' },
  // Pads
  { type: 'pad_yellow', name: 'Plataforma Salto', color: 'bg-amber-950 border-yellow-500 text-yellow-300', symbol: '▰', category: 'pads' },
  { type: 'ring_yellow', name: 'Anillo Salto', color: 'bg-yellow-950 border-yellow-400 text-yellow-400', symbol: '○', category: 'pads' },
  { type: 'pad_red', name: 'Mega Plataforma', color: 'bg-red-950 border-red-500 text-red-300', symbol: '▰▰', category: 'pads' },
  { type: 'ring_red', name: 'Mega Anillo', color: 'bg-red-950 border-red-400 text-red-400', symbol: '◎', category: 'pads' },
  // Portals
  { type: 'portal_cube', name: 'Portal Cubo', color: 'bg-emerald-950 border-emerald-500 text-emerald-300', symbol: '🄲', category: 'portals' },
  { type: 'portal_wave', name: 'Portal Wave', color: 'bg-cyan-950 border-cyan-400 text-cyan-300', symbol: '🅞', category: 'portals' },
  { type: 'portal_robot', name: 'Portal Robot', color: 'bg-amber-950 border-orange-500 text-orange-400', symbol: '🅁', category: 'portals' },
  { type: 'portal_ball', name: 'Portal Rueda', color: 'bg-pink-950 border-pink-500 text-pink-400', symbol: '🅆', category: 'portals' },
  // Speeds
  { type: 'speed_1x', name: 'Velocidad x1', color: 'bg-blue-900/40 border-blue-600 text-blue-400', symbol: '»', category: 'speeds' },
  { type: 'speed_2x', name: 'Velocidad x2', color: 'bg-emerald-900/40 border-emerald-600 text-emerald-400', symbol: '»»', category: 'speeds' },
  { type: 'speed_3x', name: 'Velocidad x3', color: 'bg-cyan-900/40 border-cyan-500 text-cyan-400', symbol: '»»»', category: 'speeds' },
];

export default function LevelBuilder({ initialLevel, onSaveAndClose, onPlaytest }: LevelBuilderProps) {
  const [levelName, setLevelName] = useState(initialLevel?.name || 'Mi Nivel Personalizado');
  const [difficulty, setDifficulty] = useState<Difficulty>(initialLevel?.difficulty || 'easy');
  const [musicTrack, setMusicTrack] = useState<string>(initialLevel?.musicTrack || 'track_stereo');
  const [elements, setElements] = useState<LevelElement[]>(initialLevel?.elements || []);
  
  // Editor mode: 'build' | 'edit' | 'delete'
  const [editorMode, setEditorMode] = useState<'build' | 'edit' | 'delete'>('build');
  
  // Category of build items
  const [buildCategory, setBuildCategory] = useState<'blocks' | 'hazards' | 'pads' | 'portals' | 'speeds'>('blocks');
  
  // Active selected item type in build mode
  const [activeBrush, setActiveBrush] = useState<ElementType>('block');

  // Currently selected item coordinate in Edit mode
  const [selectedEditCoord, setSelectedEditCoord] = useState<{ x: number; y: number } | null>(null);

  // Undo / Redo History
  const [history, setHistory] = useState<LevelElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Drag-to-paint state
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Scrolling view state
  const [scrollOffset, setScrollOffset] = useState(0); 
  const visibleColumnsCount = 20; 
  const maxColumnsCount = 140; 
  const verticalRowsCount = 8; 

  const [infoMessage, setInfoMessage] = useState('');

  // Clear info logs
  useEffect(() => {
    if (infoMessage) {
      const t = setTimeout(() => setInfoMessage(''), 3000);
      return () => clearTimeout(t);
    }
  }, [infoMessage]);

  // Initial history push
  useEffect(() => {
    setHistory([initialLevel?.elements || []]);
    setHistoryIndex(0);
  }, []);

  // Update elements with history support
  const updateElementsWithHistory = (newElements: LevelElement[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    setHistory([...nextHistory, newElements]);
    setHistoryIndex(nextHistory.length);
    setElements(newElements);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setElements(history[prevIdx]);
      setInfoMessage('Deshecho');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setElements(history[nextIdx]);
      setInfoMessage('Rehecho');
    }
  };

  // Cell Interaction (handles single clicks & dragging)
  const handleCellAction = (x: number, y: number) => {
    if (editorMode === 'build') {
      // Avoid placing duplicate of the exact same type at this coordinate
      const existing = elements.find(el => el.x === x && el.y === y);
      if (existing && existing.type === activeBrush) return;

      const filtered = elements.filter(el => !(el.x === x && el.y === y));
      const newElement: LevelElement = {
        id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        x,
        y,
        type: activeBrush
      };
      updateElementsWithHistory([...filtered, newElement]);
    } else if (editorMode === 'delete') {
      const filtered = elements.filter(el => !(el.x === x && el.y === y));
      if (filtered.length !== elements.length) {
        updateElementsWithHistory(filtered);
      }
    } else if (editorMode === 'edit') {
      const existing = elements.find(el => el.x === x && el.y === y);
      if (existing) {
        setSelectedEditCoord({ x, y });
      } else {
        setSelectedEditCoord(null);
      }
    }
  };

  const handleCellMouseDown = (x: number, y: number) => {
    setIsMouseDown(true);
    handleCellAction(x, y);
  };

  const handleCellMouseEnter = (x: number, y: number) => {
    if (isMouseDown) {
      handleCellAction(x, y);
    }
  };

  const handleMouseUpGlobal = () => {
    setIsMouseDown(false);
  };

  // Register mouse up listener to stop drag painting
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUpGlobal);
    return () => window.removeEventListener('mouseup', handleMouseUpGlobal);
  }, [isMouseDown, editorMode, activeBrush, elements]);

  const getElementAt = (x: number, y: number): LevelElement | undefined => {
    return elements.find(el => el.x === x && el.y === y);
  };

  // Shift coordinates in Edit mode
  const handleShiftSelected = (dir: 'up' | 'down' | 'left' | 'right') => {
    if (!selectedEditCoord) return;
    const target = elements.find(el => el.x === selectedEditCoord.x && el.y === selectedEditCoord.y);
    if (!target) return;

    let nextX = target.x;
    let nextY = target.y;

    if (dir === 'up') nextY = Math.min(verticalRowsCount - 1, nextY + 1);
    if (dir === 'down') nextY = Math.max(0, nextY - 1);
    if (dir === 'left') nextX = Math.max(0, nextX - 1);
    if (dir === 'right') nextX = Math.min(maxColumnsCount - 1, nextX + 1);

    // Swap / Overwrite if another element exists at target coordinates
    const filtered = elements.filter(el => el.id !== target.id && !(el.x === nextX && el.y === nextY));
    const updatedElement = { ...target, x: nextX, y: nextY };
    updateElementsWithHistory([...filtered, updatedElement]);
    setSelectedEditCoord({ x: nextX, y: nextY });
  };

  const handleClearAll = () => {
    if (window.confirm('¿Seguro que quieres borrar todos los elementos?')) {
      updateElementsWithHistory([]);
      setSelectedEditCoord(null);
      setInfoMessage('Lienzo vaciado por completo.');
    }
  };

  const handleSave = () => {
    if (!levelName.trim()) {
      alert('Introduce un nombre para el nivel.');
      return;
    }

    const savedLevel: Level = {
      id: initialLevel?.id || `custom_${Date.now()}`,
      name: levelName.trim(),
      difficulty,
      musicTrack,
      elements,
      isCustom: true
    };

    saveCustomLevel(savedLevel);
    setInfoMessage('¡Nivel guardado!');
  };

  const handlePlaytest = () => {
    const savedLevel: Level = {
      id: initialLevel?.id || `custom_${Date.now()}`,
      name: levelName.trim(),
      difficulty,
      musicTrack,
      elements,
      isCustom: true
    };
    onPlaytest(savedLevel);
  };

  // Scroll controls
  const scrollLeft = () => setScrollOffset(prev => Math.max(0, prev - 5));
  const scrollRight = () => setScrollOffset(prev => Math.min(maxColumnsCount - visibleColumnsCount, prev + 5));

  // Category buttons metadata for the BUILD palette
  const subCategories = [
    { id: 'blocks', label: 'Bloques', emoji: '🧱' },
    { id: 'hazards', label: 'Picos', emoji: '▲' },
    { id: 'pads', label: 'Pads', emoji: '▰' },
    { id: 'portals', label: 'Portales', emoji: '🌀' },
    { id: 'speeds', label: 'Velocidad', emoji: '⚡' },
  ];

  return (
    <div className="flex flex-col w-full h-full bg-[#1e1e1e] text-white rounded-xl overflow-hidden shadow-2xl border-4 border-black animate-fade-in font-sans select-none">
      
      {/* 1. TOP HEADER STATUS PANEL */}
      <div className="px-5 py-3 bg-[#181818] border-b-4 border-black flex flex-wrap items-center justify-between gap-4">
        
        {/* Left side: Back to menu and title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSaveAndClose}
            className="p-2 bg-gradient-to-b from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 border-2 border-black rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow shadow-black flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> VOLVER
          </button>
          
          <div className="hidden sm:block">
            <h1 
              className="text-2xl font-black tracking-wider text-yellow-400 uppercase"
              style={{
                textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
              }}
            >
              NIVEL CREATOR
            </h1>
            <p className="text-[9px] font-mono text-slate-400 uppercase leading-none">Estudio editor de niveles GD</p>
          </div>
        </div>

        {/* Middle: Name Input and Difficulty */}
        <div className="flex items-center gap-2.5 bg-[#121212] p-1.5 rounded-xl border-2 border-neutral-800">
          <div className="relative">
            <FileEdit className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={levelName}
              onChange={e => setLevelName(e.target.value)}
              placeholder="Nombre del nivel"
              maxLength={22}
              className="pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 focus:border-yellow-400 focus:ring-0 text-xs rounded-lg font-bold text-yellow-300 uppercase outline-none w-44 sm:w-56"
            />
          </div>

          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value as Difficulty)}
            className="px-2.5 py-1 bg-slate-900 border border-slate-800 focus:border-yellow-400 focus:ring-0 text-xs rounded-lg font-bold text-cyan-400 uppercase outline-none"
          >
            <option value="easy">FÁCIL</option>
            <option value="medium">MEDIO</option>
            <option value="hard">DIFÍCIL</option>
            <option value="insane">INSANO</option>
            <option value="demon">DEMON</option>
          </select>

          <select
            value={musicTrack}
            onChange={e => setMusicTrack(e.target.value)}
            className="px-2.5 py-1 bg-slate-900 border border-slate-800 focus:border-yellow-400 focus:ring-0 text-xs rounded-lg font-bold text-pink-400 uppercase outline-none"
          >
            <option value="track_stereo">🎵 STEREO</option>
            <option value="track_back">🎵 BACK TRACK</option>
            <option value="track_blast">🎵 BLAST</option>
            <option value="track_dry">🎵 DRY OUT</option>
            <option value="track_theory">🎵 THEORY</option>
          </select>
        </div>

        {/* Right side: Save & Playtest */}
        <div className="flex items-center gap-2">
          {infoMessage && (
            <div className="text-[10px] font-mono font-bold text-green-400 bg-green-950/40 px-3 py-1.5 rounded-lg border border-green-900/40 uppercase">
              {infoMessage}
            </div>
          )}

          <button
            onClick={handleSave}
            className="p-2 bg-slate-800 hover:bg-slate-700 border-2 border-black rounded-xl text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow active:scale-95 transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" /> GUARDAR
          </button>

          <button
            onClick={handlePlaytest}
            className="p-2 bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 border-2 border-black rounded-xl font-black text-xs uppercase text-white shadow shadow-black flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current text-yellow-300" /> PROBAR
          </button>
        </div>

      </div>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden bg-[#242424]">
        
        {/* Left Side Quick Panel: Undo/Redo/Swipe/Clear */}
        <div className="w-full md:w-16 bg-[#161616] p-2 flex md:flex-col justify-around md:justify-start items-center gap-3 border-b-2 md:border-b-0 md:border-r-4 border-black flex-wrap">
          
          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="w-10 h-10 rounded-xl bg-slate-800 border-2 border-black disabled:opacity-30 hover:bg-slate-700 text-white flex items-center justify-center active:scale-90 transition cursor-pointer"
            title="Deshacer"
          >
            <Undo className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Redo */}
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="w-10 h-10 rounded-xl bg-slate-800 border-2 border-black disabled:opacity-30 hover:bg-slate-700 text-white flex items-center justify-center active:scale-90 transition cursor-pointer"
            title="Rehacer"
          >
            <Redo className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Clean board */}
          <button
            onClick={handleClearAll}
            className="w-10 h-10 rounded-xl bg-rose-950 hover:bg-rose-900 border-2 border-black text-rose-300 flex items-center justify-center active:scale-90 transition cursor-pointer"
            title="Borrar Lienzo Completo"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
          </button>

          <div className="h-0.5 w-8 bg-neutral-800 hidden md:block" />

          {/* Help tip indicator */}
          <div className="text-[10px] text-slate-500 font-mono text-center select-none hidden md:block">
            X {scrollOffset}
          </div>
        </div>

        {/* Middle Board: Scrollable Grid */}
        <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto">
          
          {/* Grid Box */}
          <div className="flex-1 flex flex-col justify-center min-h-[300px]">
            <div className="flex items-stretch gap-1.5">
              
              {/* Vertical indices 7 to 0 (Sky to Ground) */}
              <div className="flex flex-col justify-between py-1 text-[10px] font-mono font-bold text-slate-500 select-none text-right w-5">
                {Array.from({ length: verticalRowsCount }).map((_, rIdx) => {
                  const labelY = verticalRowsCount - 1 - rIdx;
                  return (
                    <div key={rIdx} className="h-8 flex items-center justify-end">
                      Y{labelY}
                    </div>
                  );
                })}
              </div>

              {/* Grid board canvas */}
              <div className="flex-1 bg-black border-4 border-[#141414] rounded-2xl p-2 relative shadow-2xl shadow-black/60 overflow-hidden">
                
                {/* Horizontal line markers */}
                <div className="absolute inset-0 grid grid-rows-8 pointer-events-none opacity-10">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="border-b border-cyan-500 w-full" />
                  ))}
                </div>

                <div className="flex flex-col gap-1 z-10 relative">
                  {Array.from({ length: verticalRowsCount }).map((_, rIdx) => {
                    const rowY = verticalRowsCount - 1 - rIdx;
                    return (
                      <div key={rIdx} className="grid gap-1" style={{ gridTemplateColumns: 'repeat(20, minmax(0, 1fr))' }}>
                        {Array.from({ length: visibleColumnsCount }).map((_, colIdx) => {
                          const cellX = scrollOffset + colIdx;
                          const element = getElementAt(cellX, rowY);
                          
                          // Styling
                          let cellBg = 'bg-slate-900/40 hover:bg-slate-800/80 border-neutral-800/40';
                          let cellText = 'text-slate-600';
                          let symbol = '';

                          if (element) {
                            const match = BRUSH_OPTIONS.find(t => t.type === element.type);
                            if (match) {
                              cellBg = match.color;
                              symbol = match.symbol;
                              cellText = 'text-white';
                            }
                          }

                          // Highlight selected item in Edit mode
                          const isSelectedInEdit = editorMode === 'edit' && selectedEditCoord && selectedEditCoord.x === cellX && selectedEditCoord.y === rowY;
                          if (isSelectedInEdit) {
                            cellBg = 'bg-yellow-400 text-black border-yellow-300 ring-2 ring-yellow-400 scale-105 z-20 animate-pulse';
                            cellText = 'text-black';
                          }

                          return (
                            <button
                              key={colIdx}
                              onMouseDown={() => handleCellMouseDown(cellX, rowY)}
                              onMouseEnter={() => handleCellMouseEnter(cellX, rowY)}
                              className={`h-8 border text-xs font-bold rounded flex items-center justify-center transition ${cellBg} ${cellText}`}
                              title={`Celda: X:${cellX}, Y:${rowY}`}
                            >
                              {symbol}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Neon glowing GD grid floor line */}
            <div className="h-4 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border-t-2 border-cyan-500 ml-6 rounded-b-xl flex items-center justify-between px-6 text-[8px] font-mono font-bold tracking-[0.2em] text-cyan-400 select-none">
              <span>◀ SUELO DEL MAPA (ALTURA 0) ▶</span>
              <span>DESLIZA TU RATÓN PARA DIBUJAR BLOQUES RÁPIDO</span>
            </div>
          </div>

          {/* Bottom Scrolling Navigation Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 bg-[#1a1a1a] p-3 rounded-xl border-2 border-black">
            
            <div className="flex items-center gap-2">
              <button
                onClick={scrollLeft}
                disabled={scrollOffset === 0}
                className="w-10 h-8 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-white flex items-center justify-center transition border border-neutral-700 active:scale-95 cursor-pointer"
                title="Atrás 5 celdas"
              >
                ◀
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">CÁMARA:</span>
                <input
                  type="range"
                  min={0}
                  max={maxColumnsCount - visibleColumnsCount}
                  value={scrollOffset}
                  onChange={e => setScrollOffset(parseInt(e.target.value))}
                  className="w-36 sm:w-56 accent-yellow-400"
                />
                <span className="text-xs font-mono font-bold text-yellow-400 bg-black/40 px-2 py-0.5 rounded border border-neutral-800">
                  X:{scrollOffset} - X:{scrollOffset + visibleColumnsCount}
                </span>
              </div>

              <button
                onClick={scrollRight}
                disabled={scrollOffset >= maxColumnsCount - visibleColumnsCount}
                className="w-10 h-8 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-white flex items-center justify-center transition border border-neutral-700 active:scale-95 cursor-pointer"
                title="Adelante 5 celdas"
              >
                ▶
              </button>
            </div>

            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 bg-black/30 p-1.5 rounded border border-neutral-800">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span>Coloca portales (🄲=Cubo, ⚡=Wave, 🤖=Robot, ⚙️=Rueda) para forzar transformaciones.</span>
            </div>

          </div>

        </div>

      </div>

      {/* 3. GD ORIGINAL REDESIGNED BOTTOM PANEL (Screenshot-2026_0712_230116.png) */}
      <div className="bg-[#121212] border-t-4 border-black p-4 flex flex-col md:flex-row gap-4 items-stretch select-none">
        
        {/* Left Side: Three Large Action Modes Tabs (BUILD, EDIT, DELETE) */}
        <div className="flex md:flex-col gap-1.5 justify-center md:justify-start w-full md:w-32">
          
          {/* BUILD */}
          <button
            onClick={() => setEditorMode('build')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase border-2 border-black tracking-wider transition ${editorMode === 'build' ? 'bg-green-500 text-black shadow shadow-green-400 scale-105' : 'bg-[#2a2a2a] hover:bg-[#333] text-slate-300'}`}
          >
            🧱 BUILD
          </button>

          {/* EDIT */}
          <button
            onClick={() => {
              setEditorMode('edit');
              setSelectedEditCoord(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase border-2 border-black tracking-wider transition ${editorMode === 'edit' ? 'bg-cyan-500 text-black shadow shadow-cyan-400 scale-105' : 'bg-[#2a2a2a] hover:bg-[#333] text-slate-300'}`}
          >
            ✏️ EDIT
          </button>

          {/* DELETE */}
          <button
            onClick={() => {
              setEditorMode('delete');
              setSelectedEditCoord(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase border-2 border-black tracking-wider transition ${editorMode === 'delete' ? 'bg-rose-600 text-white shadow shadow-rose-500 scale-105' : 'bg-[#2a2a2a] hover:bg-[#333] text-slate-300'}`}
          >
            🗑️ DELETE
          </button>

        </div>

        {/* Right Side: The Content Area depending on Mode */}
        <div className="flex-1 bg-[#202020] border-2 border-black rounded-2xl p-3 flex flex-col justify-center relative shadow-inner">
          
          {editorMode === 'build' && (
            /* BUILD PALETTE CONTENT */
            <div className="w-full flex flex-col gap-3">
              {/* Build Categories row */}
              <div className="flex gap-1 overflow-x-auto pb-1 border-b border-neutral-800">
                {subCategories.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setBuildCategory(sub.id as any)}
                    className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border border-black flex items-center gap-1 transition ${buildCategory === sub.id ? 'bg-yellow-400 text-black font-extrabold' : 'bg-[#2d2d2d] text-slate-300 hover:text-white'}`}
                  >
                    <span>{sub.emoji}</span>
                    <span>{sub.label}</span>
                  </button>
                ))}
              </div>

              {/* Grid of actual blocks for chosen Category */}
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-12 gap-2 max-h-20 overflow-y-auto">
                {BRUSH_OPTIONS.filter(o => o.category === buildCategory).map(tool => {
                  const isSelected = activeBrush === tool.type;
                  return (
                    <button
                      key={tool.type}
                      onClick={() => setActiveBrush(tool.type)}
                      className={`h-11 rounded-xl border-2 flex flex-col items-center justify-center relative transition duration-100 ${isSelected ? 'border-yellow-400 bg-yellow-950/20 text-yellow-300 scale-105' : 'border-neutral-900 bg-slate-900 hover:border-slate-600 text-slate-300'}`}
                      title={tool.name}
                    >
                      <div className="text-sm font-black">{tool.symbol}</div>
                      <span className="text-[7px] text-slate-400 font-bold tracking-tight absolute bottom-0.5 truncate max-w-[90%] block">
                        {tool.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {editorMode === 'delete' && (
            /* DELETE PANEL CONTENT */
            <div className="w-full flex flex-col items-center justify-center p-3 text-center">
              <span className="text-rose-400 font-extrabold text-xs uppercase animate-pulse">
                💥 Modo Borrador Activo 💥
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                Haz clic o arrastra el ratón sobre cualquier celda del mapa con bloques para eliminarlos instantáneamente del nivel.
              </p>
            </div>
          )}

          {editorMode === 'edit' && (
            /* EDIT CONTROLS PANEL CONTENT */
            <div className="w-full flex flex-col justify-center min-h-[70px]">
              {selectedEditCoord ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
                  <div className="text-left font-mono text-xs">
                    <span className="text-yellow-400 font-bold block uppercase">OBJETO SELECCIONADO</span>
                    <span className="text-slate-400 text-[10px]">Coordenadas actuales: X:{selectedEditCoord.x}, Y:{selectedEditCoord.y}</span>
                  </div>

                  {/* Micro Shift Controls */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-mono mr-1">MOVER:</span>
                    <button
                      onClick={() => handleShiftSelected('left')}
                      className="w-10 py-1 bg-slate-800 hover:bg-slate-700 border border-black rounded text-xs active:scale-90 transition font-bold"
                      title="Mover Izquierda"
                    >
                      ◀
                    </button>
                    <button
                      onClick={() => handleShiftSelected('down')}
                      className="w-10 py-1 bg-slate-800 hover:bg-slate-700 border border-black rounded text-xs active:scale-90 transition font-bold"
                      title="Mover Abajo"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => handleShiftSelected('up')}
                      className="w-10 py-1 bg-slate-800 hover:bg-slate-700 border border-black rounded text-xs active:scale-90 transition font-bold"
                      title="Mover Arriba"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleShiftSelected('right')}
                      className="w-10 py-1 bg-slate-800 hover:bg-slate-700 border border-black rounded text-xs active:scale-90 transition font-bold"
                      title="Mover Derecha"
                    >
                      ▶
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      const filtered = elements.filter(el => !(el.x === selectedEditCoord.x && el.y === selectedEditCoord.y));
                      updateElementsWithHistory(filtered);
                      setSelectedEditCoord(null);
                      setInfoMessage('Objeto Eliminado');
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-black text-xs font-black rounded-lg transition active:scale-95 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-black" /> ELIMINAR OBJ
                  </button>
                </div>
              ) : (
                <div className="w-full text-center py-2">
                  <span className="text-cyan-400 font-bold text-xs uppercase">
                    🔍 Selección de Edición 🔍
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    Haz clic en cualquier bloque colocado en la cuadrícula de arriba para seleccionarlo. ¡Podrás desplazarlo con precisión o eliminarlo!
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
