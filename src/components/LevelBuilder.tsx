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
  { type: 'coin', name: 'Moneda Oro', color: 'bg-yellow-950/60 border-yellow-500 text-yellow-300', symbol: '🪙', category: 'blocks' },
  // Hazards
  { type: 'spike', name: 'Pico Letal', color: 'bg-rose-950 border-rose-600 text-rose-400', symbol: '▲', category: 'hazards' },
  { type: 'spike_inverted', name: 'Pico Techo', color: 'bg-rose-950/80 border-dashed border-rose-500 text-rose-300', symbol: '▼', category: 'hazards' },
  { type: 'spike_small', name: 'Pico Pequeño', color: 'bg-red-950 border-red-700 text-red-400', symbol: '▴', category: 'hazards' },
  { type: 'sawblade', name: 'Sierra Girar', color: 'bg-slate-800 border-neutral-600 text-white', symbol: '⚙️', category: 'hazards' },
  // Pads
  { type: 'pad_yellow', name: 'Plataforma Salto', color: 'bg-amber-950 border-yellow-500 text-yellow-300', symbol: '▰', category: 'pads' },
  { type: 'ring_yellow', name: 'Anillo Salto', color: 'bg-yellow-950 border-yellow-400 text-yellow-400', symbol: '○', category: 'pads' },
  { type: 'pad_red', name: 'Mega Plataforma', color: 'bg-red-950 border-red-500 text-red-300', symbol: '▰▰', category: 'pads' },
  { type: 'ring_red', name: 'Mega Anillo', color: 'bg-red-950 border-red-400 text-red-400', symbol: '◎', category: 'pads' },
  { type: 'pad_blue', name: 'Pad Gravedad', color: 'bg-blue-950 border-blue-500 text-blue-300', symbol: '▰', category: 'pads' },
  { type: 'ring_blue', name: 'Anillo Gravedad', color: 'bg-blue-950 border-blue-400 text-blue-400', symbol: '○', category: 'pads' },
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

export const renderVisualElement = (type: ElementType) => {
  switch (type) {
    case 'block':
      return (
        <div className="w-full h-full bg-[#111827] border-[1.5px] border-[#00FF00] flex items-center justify-center p-[1px] rounded-[3px]">
          <div className="w-full h-full border border-[#00FF00]/40 bg-[#1F2937]" />
        </div>
      );
    case 'fake_block':
      return (
        <div className="w-full h-full bg-slate-900/40 border-2 border-dashed border-slate-500/50 rounded-[3px]" />
      );
    case 'slope_r':
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full flex items-center justify-center">
          <polygon points="0,40 40,40 40,0" fill="#111827" stroke="#00FF00" strokeWidth="2.5" />
          <polygon points="10,40 40,40 40,10" fill="#1F2937" stroke="#00FF00" strokeWidth="1" opacity="0.6" />
        </svg>
      );
    case 'slope_l':
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full flex items-center justify-center">
          <polygon points="0,40 40,40 0,0" fill="#111827" stroke="#00FF00" strokeWidth="2.5" />
          <polygon points="0,40 30,40 0,10" fill="#1F2937" stroke="#00FF00" strokeWidth="1" opacity="0.6" />
        </svg>
      );
    case 'spike':
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full flex items-center justify-center">
          <polygon points="20,4 36,36 4,36" fill="#374151" stroke="#FF3B30" strokeWidth="2" />
          <polygon points="20,15 28,34 12,34" fill="#FF4500" opacity="0.8" />
        </svg>
      );
    case 'spike_inverted':
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full flex items-center justify-center">
          <polygon points="20,36 36,4 4,4" fill="#374151" stroke="#FF3B30" strokeWidth="2" />
          <polygon points="20,25 28,6 12,6" fill="#FF4500" opacity="0.8" />
        </svg>
      );
    case 'spike_small':
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full flex items-center justify-center p-1">
          <polygon points="20,12 32,36 8,36" fill="#374151" stroke="#F87171" strokeWidth="2.5" />
        </svg>
      );
    case 'sawblade':
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full flex items-center justify-center p-[2px] animate-spin" style={{ animationDuration: '4s' }}>
          <circle cx="20" cy="20" r="11" fill="#4B5563" stroke="#9CA3AF" strokeWidth="1.5" />
          <path d="M 20 4 L 23 11 L 31 9 L 27 16 L 35 19 L 27 22 L 31 29 L 23 27 L 20 34 L 17 27 L 9 29 L 13 22 L 5 19 L 13 16 L 9 9 L 17 11 Z" fill="#374151" stroke="#D1D5DB" strokeWidth="1" strokeLinejoin="round" />
          <circle cx="20" cy="20" r="4" fill="#111827" stroke="#374151" strokeWidth="1" />
        </svg>
      );
    case 'coin':
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full flex items-center justify-center p-1">
          <circle cx="20" cy="20" r="11" fill="#FEF08A" stroke="#EAB308" strokeWidth="2.2" />
          <circle cx="20" cy="20" r="8" fill="none" stroke="#CA8A04" strokeWidth="1.2" />
          <text x="20" y="24" fontFamily="Impact, sans-serif" fontSize="13" fontWeight="900" fill="#CA8A04" textAnchor="middle">C</text>
        </svg>
      );
    case 'pad_yellow':
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full flex items-center justify-center">
          <rect x="6" y="26" width="28" height="8" fill="#374151" stroke="#000" strokeWidth="1.5" rx="1" />
          <ellipse cx="20" cy="22" rx="10" ry="4" fill="#FFFF00" stroke="#000" strokeWidth="1" />
        </svg>
      );
    case 'pad_blue':
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full flex items-center justify-center">
          <rect x="6" y="26" width="28" height="8" fill="#374151" stroke="#000" strokeWidth="1.5" rx="1" />
          <ellipse cx="20" cy="22" rx="10" ry="4" fill="#22d3ee" stroke="#000" strokeWidth="1" />
        </svg>
      );
    case 'pad_red':
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full flex items-center justify-center">
          <rect x="4" y="26" width="32" height="8" fill="#450a0a" stroke="#000" strokeWidth="1.5" rx="1" />
          <ellipse cx="20" cy="22" rx="12" ry="4" fill="#FF0000" stroke="#000" strokeWidth="1" />
        </svg>
      );
    case 'ring_yellow':
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full flex items-center justify-center p-1">
          <circle cx="20" cy="20" r="11" fill="rgba(255, 255, 0, 0.25)" stroke="#FFFF00" strokeWidth="2.5" />
          <circle cx="20" cy="20" r="5" fill="none" stroke="#FFFF00" strokeWidth="1" strokeDasharray="2,2" />
        </svg>
      );
    case 'ring_blue':
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full flex items-center justify-center p-1">
          <circle cx="20" cy="20" r="11" fill="rgba(6, 182, 212, 0.25)" stroke="#22d3ee" strokeWidth="2.5" />
          <circle cx="20" cy="20" r="5" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="2,2" />
        </svg>
      );
    case 'ring_red':
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full flex items-center justify-center p-1">
          <circle cx="20" cy="20" r="11" fill="rgba(255, 0, 0, 0.25)" stroke="#FF0000" strokeWidth="2.5" />
          <circle cx="20" cy="20" r="5" fill="none" stroke="#FF0000" strokeWidth="1.5" />
        </svg>
      );
    case 'portal_cube':
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-950/40 border border-emerald-500 rounded-[5px] p-[2px] leading-none overflow-hidden">
          <div className="w-2 h-2 bg-emerald-400 border border-black rounded-sm mb-[2px]" />
          <span className="text-[6.5px] font-black text-emerald-400 tracking-tighter uppercase">CUBO</span>
        </div>
      );
    case 'portal_wave':
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-cyan-950/40 border border-cyan-400 rounded-[5px] p-[2px] leading-none overflow-hidden">
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-cyan-300 mb-[2px]" />
          <span className="text-[6.5px] font-black text-cyan-300 tracking-tighter uppercase">WAVE</span>
        </div>
      );
    case 'portal_robot':
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-amber-950/40 border border-orange-500 rounded-[5px] p-[2px] leading-none overflow-hidden">
          <div className="w-2 h-[6px] bg-orange-400 border border-black mb-[2px]" />
          <span className="text-[6.5px] font-black text-orange-400 tracking-tighter uppercase">BOT</span>
        </div>
      );
    case 'portal_ball':
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-pink-950/40 border border-pink-500 rounded-[5px] p-[2px] leading-none overflow-hidden">
          <div className="w-2.5 h-2.5 bg-pink-400 border border-black rounded-full mb-[2px]" />
          <span className="text-[6.5px] font-black text-pink-400 tracking-tighter uppercase">BALL</span>
        </div>
      );
    case 'speed_1x':
      return (
        <div className="w-full h-full flex items-center justify-center bg-blue-900/30 border border-blue-500 rounded-[3px] p-[1px]">
          <span className="text-[9px] font-black text-blue-300 tracking-tighter">»</span>
        </div>
      );
    case 'speed_2x':
      return (
        <div className="w-full h-full flex items-center justify-center bg-emerald-900/30 border border-emerald-500 rounded-[3px] p-[1px]">
          <span className="text-[9px] font-black text-emerald-300 tracking-tighter">»»</span>
        </div>
      );
    case 'speed_3x':
      return (
        <div className="w-full h-full flex items-center justify-center bg-cyan-900/30 border border-cyan-500 rounded-[3px] p-[1px]">
          <span className="text-[9px] font-black text-cyan-300 tracking-tighter">»»»</span>
        </div>
      );
    default:
      return null;
  }
};

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

  // Swipe mode (painting elements consecutively vs sliding to scroll)
  const [swipeEnabled, setSwipeEnabled] = useState(false);

  // Drag-to-scroll and swipe drag refs
  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    scrollOffset: number;
    hasMoved: boolean;
    cellX: number;
    cellY: number;
  } | null>(null);

  const handleCellMouseDown = (x: number, y: number, event: React.MouseEvent) => {
    if (event.button !== 0) return; // Only left click
    if (swipeEnabled) {
      setIsMouseDown(true);
      handleCellAction(x, y);
    } else {
      dragStartRef.current = {
        clientX: event.clientX,
        clientY: event.clientY,
        scrollOffset: scrollOffset,
        hasMoved: false,
        cellX: x,
        cellY: y,
      };
    }
  };

  const handleCellMouseEnter = (x: number, y: number) => {
    if (swipeEnabled && isMouseDown) {
      handleCellAction(x, y);
    }
  };

  const handleCellTouchStart = (x: number, y: number, event: React.TouchEvent) => {
    if (swipeEnabled) {
      setIsMouseDown(true);
      handleCellAction(x, y);
    } else {
      if (event.touches.length === 0) return;
      const touch = event.touches[0];
      dragStartRef.current = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        scrollOffset: scrollOffset,
        hasMoved: false,
        cellX: x,
        cellY: y,
      };
    }
  };

  // Register mouse & touch listeners globally to support swipe sliding
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;

      const dx = e.clientX - dragStartRef.current.clientX;
      const dy = e.clientY - dragStartRef.current.clientY;

      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        dragStartRef.current.hasMoved = true;
      }

      if (dragStartRef.current.hasMoved) {
        // Horizontal scroll: roughly 24px of move scrolls 1 grid cell
        const deltaCols = Math.round(dx / 24);
        const newScroll = Math.max(
          0,
          Math.min(maxColumnsCount - visibleColumnsCount, dragStartRef.current.scrollOffset - deltaCols)
        );
        setScrollOffset(newScroll);
      }
    };

    const handleGlobalMouseUp = () => {
      if (swipeEnabled) {
        setIsMouseDown(false);
      } else if (dragStartRef.current) {
        // If they did NOT move, treat as a single click
        if (!dragStartRef.current.hasMoved) {
          handleCellAction(dragStartRef.current.cellX, dragStartRef.current.cellY);
        }
        dragStartRef.current = null;
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!dragStartRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];

      const dx = touch.clientX - dragStartRef.current.clientX;
      const dy = touch.clientY - dragStartRef.current.clientY;

      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        dragStartRef.current.hasMoved = true;
      }

      if (dragStartRef.current.hasMoved) {
        const deltaCols = Math.round(dx / 24);
        const newScroll = Math.max(
          0,
          Math.min(maxColumnsCount - visibleColumnsCount, dragStartRef.current.scrollOffset - deltaCols)
        );
        setScrollOffset(newScroll);
      }
    };

    const handleGlobalTouchEnd = () => {
      if (swipeEnabled) {
        setIsMouseDown(false);
      } else if (dragStartRef.current) {
        if (!dragStartRef.current.hasMoved) {
          handleCellAction(dragStartRef.current.cellX, dragStartRef.current.cellY);
        }
        dragStartRef.current = null;
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: true });
    window.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [scrollOffset, swipeEnabled, elements, editorMode, activeBrush, isMouseDown]);

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

          {/* Swipe mode toggle */}
          <button
            onClick={() => setSwipeEnabled(!swipeEnabled)}
            className={`w-10 h-10 rounded-xl border-2 border-black flex flex-col items-center justify-center font-black transition-all cursor-pointer ${
              swipeEnabled
                ? 'bg-green-500 hover:bg-green-400 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)] border-green-300 scale-105'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
            }`}
            title="Modo SWIPE: Activa para pintar arrastrando / Desactiva para deslizar y mover la pantalla con el dedo o ratón"
          >
            <span className="text-[7px] font-black uppercase tracking-tighter leading-none font-sans">SWIPE</span>
            <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${swipeEnabled ? 'bg-black animate-pulse' : 'bg-slate-500'}`} />
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
              <div className="flex-1 bg-[#0c4391] border-4 border-[#09295c] rounded-2xl p-2 relative shadow-2xl shadow-black/60 overflow-hidden">
                
                {/* Horizontal line markers */}
                <div className="absolute inset-0 grid grid-rows-8 pointer-events-none opacity-20">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="border-b border-cyan-400 w-full" />
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
                          const isStartCol = cellX === 3;
                          
                          // Styling
                          let cellBg = isStartCol 
                            ? 'bg-emerald-950/20 hover:bg-emerald-900/40 border-[#00e1ff]/15 border-l-[3px] border-l-emerald-400' 
                            : 'bg-[#1554aa]/40 hover:bg-[#1a62c4]/70 border-[#00e1ff]/15';
                          let cellText = 'text-slate-600';

                          if (element) {
                            const match = BRUSH_OPTIONS.find(t => t.type === element.type);
                            if (match) {
                              cellBg = match.color;
                              if (isStartCol) {
                                cellBg += ' border-l-[3px] border-l-emerald-400/95';
                              }
                            }
                          }

                          // Highlight selected item in Edit mode
                          const isSelectedInEdit = editorMode === 'edit' && selectedEditCoord && selectedEditCoord.x === cellX && selectedEditCoord.y === rowY;
                          if (isSelectedInEdit) {
                            cellBg = 'bg-yellow-400 text-black border-yellow-300 ring-2 ring-yellow-400 scale-105 z-20 animate-pulse';
                            if (isStartCol) {
                              cellBg += ' border-l-[3px] border-l-emerald-400/95';
                            }
                          }

                          return (
                            <button
                              key={colIdx}
                              onMouseDown={(e) => handleCellMouseDown(cellX, rowY, e)}
                              onMouseEnter={() => handleCellMouseEnter(cellX, rowY)}
                              onTouchStart={(e) => handleCellTouchStart(cellX, rowY, e)}
                              className={`h-8 border text-xs font-bold rounded flex items-center justify-center transition overflow-hidden p-[1px] relative ${cellBg} ${cellText}`}
                              title={isStartCol ? `Punto de Inicio (Spawn) | Celda: X:${cellX}, Y:${rowY}` : `Celda: X:${cellX}, Y:${rowY}`}
                            >
                              {element ? (
                                <div className="w-full h-full">
                                  {renderVisualElement(element.type)}
                                </div>
                              ) : isStartCol && rowY === 0 ? (
                                <span className="text-[7px] font-black text-emerald-400 animate-pulse uppercase leading-none tracking-tighter absolute">GO</span>
                              ) : null}
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
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 bg-[#141414] p-3 rounded-xl border-2 border-black">
            
            <div className="flex items-center gap-3">
              <button
                onClick={scrollLeft}
                disabled={scrollOffset === 0}
                className="w-11 h-9 bg-gradient-to-b from-pink-500 to-pink-700 hover:from-pink-400 hover:to-pink-600 border-2 border-black disabled:opacity-20 rounded-xl text-white font-black flex items-center justify-center transition active:scale-90 cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
                title="Atrás 5 celdas"
              >
                ◀◀
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-pink-400 font-mono font-black tracking-wide uppercase">CÁMARA:</span>
                <input
                  type="range"
                  min={0}
                  max={maxColumnsCount - visibleColumnsCount}
                  value={scrollOffset}
                  onChange={e => setScrollOffset(parseInt(e.target.value))}
                  className="w-36 sm:w-56 accent-pink-500 h-2 bg-black/80 rounded-lg appearance-none cursor-pointer border border-neutral-800"
                />
                <span className="text-xs font-mono font-black text-white bg-black/60 px-2.5 py-1 rounded-lg border border-neutral-800 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
                  X:{scrollOffset} - X:{scrollOffset + visibleColumnsCount}
                </span>
              </div>

              <button
                onClick={scrollRight}
                disabled={scrollOffset >= maxColumnsCount - visibleColumnsCount}
                className="w-11 h-9 bg-gradient-to-b from-pink-500 to-pink-700 hover:from-pink-400 hover:to-pink-600 border-2 border-black disabled:opacity-20 rounded-xl text-white font-black flex items-center justify-center transition active:scale-90 cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
                title="Adelante 5 celdas"
              >
                ▶▶
              </button>
            </div>

            <div className="text-[10px] font-mono text-slate-300 flex items-center gap-1.5 bg-cyan-950/20 p-2 rounded-lg border border-cyan-900/30">
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 animate-pulse" />
              <span>
                {swipeEnabled 
                  ? '👉 MODO PINTAR ACTIVO: Arrastra sobre la cuadrícula para construir rápido.' 
                  : '👉 MODO NAVEGAR ACTIVO: Desliza con un dedo o ratón sobre la cuadrícula para moverte.'}
              </span>
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
                      className={`h-11 rounded-xl border-2 flex flex-col items-center justify-center p-0.5 relative transition duration-100 ${isSelected ? 'border-yellow-400 bg-yellow-950/20 text-yellow-300 scale-105' : 'border-neutral-900 bg-slate-900 hover:border-slate-600 text-slate-300'}`}
                      title={tool.name}
                    >
                      <div className="w-5 h-5 flex items-center justify-center mb-2.5">
                        {renderVisualElement(tool.type)}
                      </div>
                      <span className="text-[6.5px] text-slate-400 font-extrabold tracking-tight absolute bottom-0.5 truncate max-w-[95%] block uppercase">
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
