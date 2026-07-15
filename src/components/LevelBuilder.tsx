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

const LEVEL_THEMES = [
  { id: 'purple', name: 'Púrpura Cósmico', emoji: '🔮', bg: 'bg-[#6D28D9]', mountain: '#5B21B6', skyGlow: '#4C1D95', neon: '#10B981', gridBg: 'bg-purple-950/40', border: 'border-emerald-400', borderGlow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' },
  { id: 'cyber', name: 'Cyberpunk Neon', emoji: '🌌', bg: 'bg-[#090D1A]', mountain: '#131930', skyGlow: '#1F2A4C', neon: '#FF007F', gridBg: 'bg-indigo-950/40', border: 'border-pink-500', borderGlow: 'shadow-[0_0_15px_rgba(236,72,153,0.3)]' },
  { id: 'toxic', name: 'Ácido Radiactivo', emoji: '☣️', bg: 'bg-[#022C22]', mountain: '#064E3B', skyGlow: '#0F766E', neon: '#A3E635', gridBg: 'bg-emerald-950/40', border: 'border-lime-400', borderGlow: 'shadow-[0_0_15px_rgba(163,230,53,0.3)]' },
  { id: 'lava', name: 'Fuego Volcánico', emoji: '🔥', bg: 'bg-[#2D0606]', mountain: '#450A0A', skyGlow: '#7F1D1D', neon: '#EA580C', gridBg: 'bg-red-950/40', border: 'border-orange-500', borderGlow: 'shadow-[0_0_15px_rgba(234,88,12,0.3)]' },
  { id: 'slate', name: 'Pizarra Brutal', emoji: '🩶', bg: 'bg-[#0F172A]', mountain: '#1E293B', skyGlow: '#334155', neon: '#38BDF8', gridBg: 'bg-slate-900/40', border: 'border-sky-400', borderGlow: 'shadow-[0_0_15px_rgba(56,189,248,0.3)]' },
  { id: 'sunset', name: 'Atardecer Oro', emoji: '🌅', bg: 'bg-[#451A03]', mountain: '#78350F', skyGlow: '#92400E', neon: '#F59E0B', gridBg: 'bg-amber-950/40', border: 'border-yellow-400', borderGlow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]' },
];

export default function LevelBuilder({ initialLevel, onSaveAndClose, onPlaytest }: LevelBuilderProps) {
  const [levelName, setLevelName] = useState(initialLevel?.name || 'Mi Nivel Personalizado');
  const [difficulty, setDifficulty] = useState<Difficulty>(initialLevel?.difficulty || 'easy');
  const [musicTrack, setMusicTrack] = useState<string>(initialLevel?.musicTrack || 'track_stereo');
  const [levelTheme, setLevelTheme] = useState<string>(initialLevel?.theme || 'purple');
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

  // Drag-to-scroll camera offset
  const [scrollOffset, setScrollOffset] = useState(0); 

  // Dynamic zoom: small (24 columns), medium (20 columns), large (16 columns)
  const [zoomLevel, setZoomLevel] = useState<'small' | 'medium' | 'large'>('medium');
  const visibleColumnsCount = zoomLevel === 'small' ? 24 : zoomLevel === 'medium' ? 20 : 16;
  
  const maxColumnsCount = 140; 
  const verticalRowsCount = 8; 

  // Touch & Swipe Mode
  const [swipeEnabled, setSwipeEnabled] = useState(false);

  // Notifications
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Dragging scroll anchor refs
  const dragStartRef = useRef<{ x: number; scrollOffset: number; hasMoved: boolean }>({ x: 0, scrollOffset: 0, hasMoved: false });

  const activeTheme = LEVEL_THEMES.find(t => t.id === levelTheme) || LEVEL_THEMES[0];

  useEffect(() => {
    if (infoMessage) {
      const t = setTimeout(() => setInfoMessage(null), 2500);
      return () => clearTimeout(t);
    }
  }, [infoMessage]);

  // Record history for undo/redo
  const updateElementsWithHistory = (newElements: LevelElement[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    setHistory([...nextHistory, newElements]);
    setHistoryIndex(nextHistory.length);
    setElements(newElements);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
      setSelectedEditCoord(null);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setElements(initialLevel?.elements || []);
      setSelectedEditCoord(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
      setSelectedEditCoord(null);
    }
  };

  // Grid interaction: add / edit / remove elements
  const toggleElementAt = (x: number, y: number) => {
    const existingIndex = elements.findIndex(el => el.x === x && el.y === y);

    if (editorMode === 'build') {
      const newEl: LevelElement = {
        id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        x,
        y,
        type: activeBrush
      };

      if (existingIndex !== -1) {
        // Replace element at same spot
        const updated = [...elements];
        updated[existingIndex] = newEl;
        updateElementsWithHistory(updated);
      } else {
        // Append new element
        updateElementsWithHistory([...elements, newEl]);
      }
    } else if (editorMode === 'delete') {
      if (existingIndex !== -1) {
        const updated = elements.filter((_, idx) => idx !== existingIndex);
        updateElementsWithHistory(updated);
      }
    } else if (editorMode === 'edit') {
      if (existingIndex !== -1) {
        setSelectedEditCoord({ x, y });
      } else {
        setSelectedEditCoord(null);
      }
    }
  };

  // Mouse & Touch Drag paint events
  const handleCellMouseDown = (x: number, y: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (e.button !== 0) return; // Only left-click
    setIsMouseDown(true);
    toggleElementAt(x, y);
  };

  const handleCellMouseEnter = (x: number, y: number) => {
    if (isMouseDown && swipeEnabled && (editorMode === 'build' || editorMode === 'delete')) {
      toggleElementAt(x, y);
    }
  };

  const handleCellTouchStart = (x: number, y: number, e: React.TouchEvent) => {
    e.preventDefault();
    setIsMouseDown(true);
    toggleElementAt(x, y);
  };

  // Grid area background navigation (drag to scroll)
  const handleGridMouseDown = (e: React.MouseEvent) => {
    if (swipeEnabled) return; // Let swipe draw instead of scroll
    setIsMouseDown(true);
    dragStartRef.current = {
      x: e.clientX,
      scrollOffset,
      hasMoved: false
    };
  };

  const handleGridTouchStart = (e: React.TouchEvent) => {
    if (swipeEnabled) return;
    setIsMouseDown(true);
    if (e.touches[0]) {
      dragStartRef.current = {
        x: e.touches[0].clientX,
        scrollOffset,
        hasMoved: false
      };
    }
  };

  // Global mouse / touch scroll tracking listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isMouseDown || swipeEnabled) return;
      const dx = e.clientX - dragStartRef.current.x;
      if (Math.abs(dx) > 6) {
        dragStartRef.current.hasMoved = true;
      }
      if (dragStartRef.current.hasMoved) {
        // 24px of horizontal shift scrolls 1 cell
        const deltaCols = Math.round(dx / 24);
        const newScroll = Math.max(
          0,
          Math.min(maxColumnsCount - visibleColumnsCount, dragStartRef.current.scrollOffset - deltaCols)
        );
        setScrollOffset(newScroll);
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isMouseDown || swipeEnabled || !e.touches[0]) return;
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      if (Math.abs(dx) > 6) {
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

    const handleGlobalMouseUp = () => {
      setIsMouseDown(false);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    window.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [scrollOffset, swipeEnabled, elements, editorMode, activeBrush, isMouseDown, zoomLevel, visibleColumnsCount]);

  // Scrolling shortcuts
  const scrollLeft = () => setScrollOffset(prev => Math.max(0, prev - (zoomLevel === 'large' ? 4 : 6)));
  const scrollRight = () => setScrollOffset(prev => Math.min(maxColumnsCount - visibleColumnsCount, prev + (zoomLevel === 'large' ? 4 : 6)));

  const handleClearBoard = () => {
    if (confirm('¿Seguro que deseas eliminar todos los elementos del mapa? El progreso guardado no se borrará a menos que des a Guardar.')) {
      updateElementsWithHistory([]);
      setSelectedEditCoord(null);
    }
  };

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

  const handleDeleteSelected = () => {
    if (!selectedEditCoord) return;
    const filtered = elements.filter(el => !(el.x === selectedEditCoord.x && el.y === selectedEditCoord.y));
    updateElementsWithHistory(filtered);
    setSelectedEditCoord(null);
  };

  const handleSaveLevel = () => {
    const savedLevel: Level = {
      id: initialLevel?.id || `custom_${Date.now()}`,
      name: levelName.trim() || 'Mi Nivel',
      difficulty,
      musicTrack,
      theme: levelTheme,
      elements,
      isCustom: true,
      author: initialLevel?.author || 'Creador'
    };
    saveCustomLevel(savedLevel);
    setInfoMessage('💾 ¡NIVEL GUARDADO CON ÉXITO!');
  };

  const handlePlaytestLevel = () => {
    const savedLevel: Level = {
      id: initialLevel?.id || `custom_${Date.now()}`,
      name: levelName.trim() || 'Mi Nivel',
      difficulty,
      musicTrack,
      theme: levelTheme,
      elements,
      isCustom: true,
      author: initialLevel?.author || 'Creador'
    };
    saveCustomLevel(savedLevel);
    onPlaytest(savedLevel);
  };

  const activeBrushesByCategory = BRUSH_OPTIONS.filter(opt => opt.category === buildCategory);

  return (
    <div className="flex flex-col w-full h-full bg-[#141517] text-white rounded-xl overflow-hidden border-4 border-black animate-fade-in font-sans select-none relative">
      
      {/* 1. TOP HEADER STATUS PANEL (SLIM & FUTURISTIC) */}
      <div className="bg-[#121315] border-b-2 border-black/40 px-3 py-1.5 flex items-center justify-between z-20 gap-2 shrink-0">
        
        {/* Left Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('¿Quieres salir? Asegúrate de haber guardado tu nivel.')) {
                onSaveAndClose();
              }
            }}
            className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-500 border border-black rounded-lg font-bold text-xs uppercase tracking-wide cursor-pointer text-white shadow active:translate-y-0.5 transition animate-fade-in"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Salir
          </button>
          
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase leading-none">EDITOR DE</span>
            <span className="text-sm font-black text-yellow-400 tracking-wider leading-none">NIVELES</span>
          </div>
        </div>

        {/* Level Quick Summary Status */}
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/5 max-w-xs md:max-w-md truncate">
          <span className="text-xs font-black text-white truncate uppercase">{levelName || 'SIN NOMBRE'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{difficulty}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
          <span className="text-[11px]">{activeTheme.emoji}</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Settings trigger */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-black rounded-lg cursor-pointer text-white flex items-center justify-center shadow active:scale-95 transition"
            title="Ajustes de música, nombre y temática"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Quick Clear */}
          <button
            onClick={handleClearBoard}
            className="p-1.5 bg-slate-800 hover:bg-red-950 hover:text-red-300 border border-black rounded-lg cursor-pointer text-slate-400 flex items-center justify-center shadow active:scale-95 transition"
            title="Limpiar tablero"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleSaveLevel}
            className="flex items-center gap-1 px-3 py-1 bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 border border-black rounded-lg font-bold text-xs uppercase tracking-wide cursor-pointer text-white shadow active:translate-y-0.5 transition"
          >
            <Save className="w-3.5 h-3.5" /> Guardar
          </button>

          <button
            onClick={handlePlaytestLevel}
            className="flex items-center gap-1 px-3 py-1 bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 border border-black rounded-lg font-bold text-xs uppercase tracking-wide cursor-pointer text-white shadow active:translate-y-0.5 transition"
          >
            <Play className="w-3.5 h-3.5 text-yellow-300" /> Probar
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE AREA (SIDEBARS + GRID CANVAS) */}
      <div className="flex-1 flex overflow-hidden min-h-0 bg-[#1e1f22] relative">
        
        {/* LEFT COLUMN: PRIMARY WORK TOOLBOX (SLIM SIDEBAR) */}
        <div className="w-14 bg-[#121315] border-r-2 border-black/40 py-2 px-1 flex flex-col items-center justify-between z-10 shrink-0 select-none">
          
          {/* History Tools */}
          <div className="flex flex-col gap-2 w-full">
            <button
              disabled={historyIndex < 0}
              onClick={handleUndo}
              className={`w-10 h-10 border border-black rounded-xl flex items-center justify-center shadow transition active:scale-95 cursor-pointer ${historyIndex >= 0 ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-900/40 text-slate-600 cursor-not-allowed'}`}
              title="Deshacer"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              disabled={historyIndex >= history.length - 1}
              onClick={handleRedo}
              className={`w-10 h-10 border border-black rounded-xl flex items-center justify-center shadow transition active:scale-95 cursor-pointer ${historyIndex < history.length - 1 ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-900/40 text-slate-600 cursor-not-allowed'}`}
              title="Rehacer"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* Swipe Paint Mode */}
          <button
            onClick={() => setSwipeEnabled(!swipeEnabled)}
            className={`w-10 h-10 border-2 rounded-xl flex flex-col items-center justify-center shadow transition cursor-pointer select-none ${swipeEnabled ? 'bg-gradient-to-b from-green-400 to-green-600 border-yellow-300 text-black font-black animate-pulse' : 'bg-slate-800 border-black text-slate-300 hover:bg-slate-700'}`}
            title="Arrastrar para pintar (Swipe)"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[7px] font-bold uppercase leading-none mt-0.5">{swipeEnabled ? 'SI' : 'NO'}</span>
          </button>

          {/* Settings Trigger inside Sidebar */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-10 h-10 bg-slate-800 border border-black rounded-xl flex items-center justify-center text-slate-300 hover:bg-slate-700 cursor-pointer shadow transition active:scale-95"
            title="Ajustes de nivel"
          >
            <Sliders className="w-4.5 h-4.5" />
          </button>

        </div>

        {/* CENTER AREA: CANVAS GRID + FLOATING NOTIFICATIONS */}
        <div className="flex-1 p-2 flex flex-col justify-between overflow-hidden min-h-0 relative select-none">
          
          {/* Floating Save Notification Alert */}
          {infoMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 to-amber-500 text-black border-2 border-black font-black uppercase text-xs tracking-wider px-5 py-2.5 rounded-2xl shadow-2xl animate-bounce">
              {infoMessage}
            </div>
          )}

          {/* GRID CANVAS BOARD CONTAINER */}
          <div className={`flex-1 ${activeTheme.gridBg} border-4 ${activeTheme.border} ${activeTheme.borderGlow} rounded-2xl p-2 relative shadow-2xl overflow-hidden transition-all duration-300 flex flex-col justify-center`}>
            
            {/* Custom Neon Mountain / Grid background effects */}
            <div className="absolute inset-0 pointer-events-none opacity-10 font-mono text-[9px] flex flex-col justify-between p-3 select-none">
              <span>GD ENGINE LEVEL BUILDER V2.1</span>
              <div className="flex justify-between items-end">
                <span>THEME: {activeTheme.name.toUpperCase()}</span>
                <span>GRID: {maxColumnsCount} x {verticalRowsCount}</span>
              </div>
            </div>

            {/* The Grid Workspace Scroll and Interaction Wrapper */}
            <div
              className="w-full relative select-none cursor-crosshair min-h-0 flex-1 flex flex-col justify-center"
              onMouseDown={handleGridMouseDown}
              onTouchStart={handleGridTouchStart}
            >
              
              {/* VERTICAL GRID LINES */}
              <div className="flex flex-col gap-1 sm:gap-1.5 w-full">
                {Array.from({ length: verticalRowsCount }).map((_, rIdx) => {
                  const rowY = verticalRowsCount - 1 - rIdx;
                  const isSelectedRow = selectedEditCoord && selectedEditCoord.y === rowY;

                  return (
                    <div key={rowY} className="flex items-center w-full">
                      
                      {/* Left vertical coordinates labels (Y0 - Y7) */}
                      <span className={`w-5 text-[10px] font-bold font-mono text-center select-none mr-1.5 ${isSelectedRow ? 'text-yellow-400 animate-pulse' : 'text-slate-500'}`}>
                        Y{rowY}
                      </span>

                      {/* Row Grid Cells */}
                      <div
                        className="grid flex-1 gap-[3px] select-none"
                        style={{ gridTemplateColumns: `repeat(${visibleColumnsCount}, minmax(0, 1fr))` }}
                      >
                        {Array.from({ length: visibleColumnsCount }).map((_, colIdx) => {
                          const cellX = scrollOffset + colIdx;
                          const existingElement = elements.find(el => el.x === cellX && el.y === rowY);
                          const isSelectedCell = selectedEditCoord && selectedEditCoord.x === cellX && selectedEditCoord.y === rowY;

                          let cellBg = 'bg-black/35 hover:bg-white/10 border-white/5';
                          let cellText = 'text-white/40';

                          if (existingElement) {
                            cellBg = 'bg-slate-800 border-slate-600 text-white';
                            cellText = 'text-white';
                          }

                          if (isSelectedCell) {
                            cellBg = 'bg-yellow-500/45 border-yellow-300 scale-[1.03] z-10';
                          }

                          const cellHeightClass = zoomLevel === 'small' ? 'h-6 sm:h-7' : zoomLevel === 'medium' ? 'h-7 sm:h-8' : 'h-9 sm:h-10';
                          const cellTextClass = zoomLevel === 'small' ? 'text-[8px]' : 'text-xs';

                          return (
                            <button
                              key={colIdx}
                              onMouseDown={(e) => handleCellMouseDown(cellX, rowY, e)}
                              onMouseEnter={() => handleCellMouseEnter(cellX, rowY)}
                              onTouchStart={(e) => handleCellTouchStart(cellX, rowY, e)}
                              className={`border rounded flex items-center justify-center transition-all overflow-hidden p-[1px] relative cursor-pointer select-none ${cellBg} ${cellText} ${cellHeightClass}`}
                              title={`Coordenada X:${cellX}, Y:${rowY}`}
                            >
                              {existingElement ? (
                                <div className="w-full h-full flex items-center justify-center select-none pointer-events-none">
                                  {renderVisualElement(existingElement.type)}
                                </div>
                              ) : (
                                <span className={`${cellTextClass} opacity-30 select-none font-mono font-medium pointer-events-none`}>
                                  +
                                </span>
                              )}
                              
                              {/* Small coordinate visual tag on active selections */}
                              {isSelectedCell && (
                                <span className="absolute bottom-0 right-0 bg-yellow-400 text-black font-mono font-bold text-[6px] px-0.5 leading-none select-none">
                                  SEL
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

            {/* Bottom ground highlight bar matching active selected theme border */}
            <div className={`h-2.5 bg-gradient-to-r from-slate-900/60 to-slate-800/60 border-t-2 ${activeTheme.border} ml-6 rounded-b-xl flex items-center justify-between px-6 text-[8px] font-mono font-bold tracking-[0.2em] text-slate-500 select-none`}>
              <span>SUELO DE JUEGO (COLLISION Y=0)</span>
              <span>X:{scrollOffset} - X:{scrollOffset + visibleColumnsCount - 1}</span>
            </div>

          </div>

          {/* 3. COMPACT SLIM SCROLL CONTROLLER & ZOOM CONTROLS (ROW BELOW GRID) */}
          <div className="mt-1.5 flex flex-row items-center justify-between gap-3 bg-[#121315] p-1.5 rounded-xl border border-black/40 shrink-0 select-none">
            
            {/* Scroll Left */}
            <button
              onClick={scrollLeft}
              disabled={scrollOffset <= 0}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border border-black shadow cursor-pointer text-white ${scrollOffset <= 0 ? 'bg-slate-900/40 text-slate-700 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Drag scroll bar slider */}
            <div className="flex-1 flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 font-mono tracking-tighter select-none">X:0</span>
              <input
                type="range"
                min={0}
                max={maxColumnsCount - visibleColumnsCount}
                value={scrollOffset}
                onChange={(e) => setScrollOffset(parseInt(e.target.value))}
                className="flex-1 accent-yellow-400 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter select-none">X:{maxColumnsCount - visibleColumnsCount}</span>
            </div>

            {/* Scroll Right */}
            <button
              onClick={scrollRight}
              disabled={scrollOffset >= maxColumnsCount - visibleColumnsCount}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border border-black shadow cursor-pointer text-white ${scrollOffset >= maxColumnsCount - visibleColumnsCount ? 'bg-slate-900/40 text-slate-700 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Quick Zoom Multi-Selector (Beautifully compact) */}
            <div className="flex items-center gap-1 bg-black/45 p-0.5 rounded-lg border border-white/5">
              <span className="text-[8px] font-bold text-slate-500 px-1 uppercase tracking-tighter hidden md:inline">Vista:</span>
              <button
                onClick={() => setZoomLevel('large')}
                className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded tracking-tighter ${zoomLevel === 'large' ? 'bg-yellow-400 text-black font-black' : 'text-slate-400 hover:text-white'}`}
                title="Zoom de Cerca (16 columnas)"
              >
                Cerca
              </button>
              <button
                onClick={() => setZoomLevel('medium')}
                className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded tracking-tighter ${zoomLevel === 'medium' ? 'bg-yellow-400 text-black font-black' : 'text-slate-400 hover:text-white'}`}
                title="Estándar (20 columnas)"
              >
                Estándar
              </button>
              <button
                onClick={() => setZoomLevel('small')}
                className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded tracking-tighter ${zoomLevel === 'small' ? 'bg-yellow-400 text-black font-black' : 'text-slate-400 hover:text-white'}`}
                title="Zoom Lejos (24 columnas)"
              >
                Lejos
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* 4. REDESIGNED SLIM PANEL (MODES AND PALETTE CONSOLIDATED) */}
      <div className="bg-[#121315] border-t-2 border-black/50 p-2 flex flex-row gap-3 items-center shrink-0 h-[105px] overflow-hidden select-none">
        
        {/* LEFT COMPACT SECTION: EDITOR MODE SELECTOR TABS */}
        <div className="flex flex-col gap-1 bg-black/30 p-1.5 rounded-xl border border-white/5 h-full justify-between shrink-0 w-[110px]">
          <button
            onClick={() => {
              setEditorMode('build');
              setSelectedEditCoord(null);
            }}
            className={`w-full py-1 px-1.5 rounded-lg text-[9px] font-black uppercase text-center cursor-pointer transition flex items-center gap-1 border ${editorMode === 'build' ? 'bg-gradient-to-b from-green-500 to-green-700 text-white border-green-400 shadow-[0_0_8px_rgba(74,222,128,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
          >
            <span className="text-[10px]">🧱</span> CONSTRUIR
          </button>
          <button
            onClick={() => {
              setEditorMode('edit');
              setSelectedEditCoord(null);
            }}
            className={`w-full py-1 px-1.5 rounded-lg text-[9px] font-black uppercase text-center cursor-pointer transition flex items-center gap-1 border ${editorMode === 'edit' ? 'bg-gradient-to-b from-cyan-500 to-cyan-700 text-white border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
          >
            <span className="text-[10px]">✏️</span> EDITAR
          </button>
          <button
            onClick={() => {
              setEditorMode('delete');
              setSelectedEditCoord(null);
            }}
            className={`w-full py-1 px-1.5 rounded-lg text-[9px] font-black uppercase text-center cursor-pointer transition flex items-center gap-1 border ${editorMode === 'delete' ? 'bg-gradient-to-b from-red-600 to-red-800 text-white border-red-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
          >
            <span className="text-[10px]">🗑️</span> BORRAR
          </button>
        </div>

        {/* RIGHT DYNAMIC PALETTE / OPERATIONS SECTION */}
        <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-1.5 flex flex-col h-full justify-between overflow-hidden relative">
          
          {/* BUILD MODE ACTIVE */}
          {editorMode === 'build' && (
            <div className="flex flex-col h-full justify-between overflow-hidden">
              {/* Category tabs row */}
              <div className="flex items-center gap-1.5 overflow-x-auto shrink-0 pb-0.5 scrollbar-thin">
                {(['blocks', 'hazards', 'pads', 'portals', 'speeds'] as const).map(cat => {
                  const label = cat === 'blocks' ? '🧱 BLOQUES' : cat === 'hazards' ? '🔺 PICOS' : cat === 'pads' ? '▰ PADS' : cat === 'portals' ? '🌀 PORTALES' : '⚡ VELOCIDAD';
                  const active = buildCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setBuildCategory(cat);
                        // Default to first brush in that category
                        const defaultBrush = BRUSH_OPTIONS.find(opt => opt.category === cat);
                        if (defaultBrush) setActiveBrush(defaultBrush.type);
                      }}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-tight shrink-0 uppercase transition cursor-pointer ${active ? 'bg-yellow-400 text-black border-2 border-black font-black' : 'bg-slate-900/80 text-slate-400 border border-transparent hover:text-slate-200'}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Brushes Items Picker Row */}
              <div className="flex-1 flex items-center gap-2 overflow-x-auto overflow-y-hidden py-1 px-1 scrollbar-thin">
                {activeBrushesByCategory.map(brush => {
                  const active = activeBrush === brush.type;
                  return (
                    <button
                      key={brush.type}
                      onClick={() => setActiveBrush(brush.type)}
                      className={`h-11 w-11 shrink-0 rounded-lg border-2 flex flex-col items-center justify-center p-[2px] transition hover:scale-105 active:scale-95 relative cursor-pointer select-none ${active ? 'bg-gradient-to-b from-yellow-300 to-yellow-500 border-black text-black scale-103 shadow-md shadow-yellow-400/20 z-10' : 'bg-slate-900/90 border-slate-700 text-slate-300'}`}
                      title={brush.name}
                    >
                      <div className="w-full h-full flex items-center justify-center select-none pointer-events-none">
                        {renderVisualElement(brush.type)}
                      </div>
                      
                      {/* Name tag or dot label */}
                      <span className="absolute bottom-[1px] text-[6px] font-black tracking-tighter uppercase leading-none truncate max-w-full px-0.5 pointer-events-none">
                        {brush.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DELETE MODE ACTIVE */}
          {editorMode === 'delete' && (
            <div className="flex items-center h-full gap-3 px-3">
              <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/30 flex items-center justify-center shrink-0">
                <span className="text-xl">💥</span>
              </div>
              <div className="flex flex-col">
                <h4 className="text-[11px] font-black text-red-400 uppercase tracking-wider leading-tight">MODO BORRADOR ACTIVO</h4>
                <p className="text-[10px] text-slate-400 leading-normal max-w-xl">
                  Haz clic o arrastra sobre cualquier objeto colocado en la cuadrícula de arriba para eliminarlo del nivel. ¡Úsalo con cuidado!
                </p>
              </div>
            </div>
          )}

          {/* EDIT MODE ACTIVE */}
          {editorMode === 'edit' && (
            <div className="flex-1 flex items-center h-full">
              {selectedEditCoord ? (
                (() => {
                  const elementAtCoord = elements.find(el => el.x === selectedEditCoord.x && el.y === selectedEditCoord.y);
                  return (
                    <div className="w-full flex items-center justify-between gap-2 px-1 select-none animate-fade-in">
                      
                      {/* Left: Element Info Details */}
                      <div className="flex items-center gap-2">
                        <div className="w-11 h-11 bg-slate-900 border border-slate-700 rounded-lg p-1.5 shrink-0 flex items-center justify-center">
                          {elementAtCoord ? renderVisualElement(elementAtCoord.type) : '❓'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-yellow-400 leading-none">SELECCIONADO:</span>
                          <span className="text-xs font-black truncate max-w-[120px] leading-tight uppercase text-white">
                            {elementAtCoord ? BRUSH_OPTIONS.find(o => o.type === elementAtCoord.type)?.name : 'Elemento'}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 leading-none">
                            Coord: X:{selectedEditCoord.x}, Y:{selectedEditCoord.y}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Coordinate Shifting Controls (Arrow Pad) */}
                      <div className="flex items-center gap-1.5 bg-black/35 p-1 rounded-xl border border-white/5">
                        <button
                          onClick={() => handleShiftSelected('left')}
                          className="w-7 h-7 bg-slate-800 hover:bg-slate-700 border border-black rounded-lg font-black text-xs cursor-pointer text-white flex items-center justify-center active:scale-90 select-none"
                          title="Desplazar a la izquierda"
                        >
                          ◀
                        </button>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleShiftSelected('up')}
                            className="w-7 h-3.5 bg-slate-800 hover:bg-slate-700 border border-black rounded-lg font-black text-[8px] cursor-pointer text-white flex items-center justify-center active:scale-90 select-none"
                            title="Desplazar arriba"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => handleShiftSelected('down')}
                            className="w-7 h-3.5 bg-slate-800 hover:bg-slate-700 border border-black rounded-lg font-black text-[8px] cursor-pointer text-white flex items-center justify-center active:scale-90 select-none"
                            title="Desplazar abajo"
                          >
                            ▼
                          </button>
                        </div>
                        <button
                          onClick={() => handleShiftSelected('right')}
                          className="w-7 h-7 bg-slate-800 hover:bg-slate-700 border border-black rounded-lg font-black text-xs cursor-pointer text-white flex items-center justify-center active:scale-90 select-none"
                          title="Desplazar a la derecha"
                        >
                          ▶
                        </button>
                      </div>

                      {/* Right: Quick actions on selection */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handleDeleteSelected}
                          className="px-2.5 py-1.5 bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border border-black rounded-lg font-bold text-[9px] uppercase cursor-pointer text-white flex items-center gap-1 shadow active:translate-y-0.5 transition select-none"
                        >
                          <Trash2 className="w-3 h-3" /> Borrar Objeto
                        </button>
                        <button
                          onClick={() => setSelectedEditCoord(null)}
                          className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 border border-black rounded-lg font-bold text-[9px] uppercase cursor-pointer text-slate-300 active:scale-95 transition"
                        >
                          Listo
                        </button>
                      </div>

                    </div>
                  );
                })()
              ) : (
                <div className="flex items-center h-full gap-3 px-3 w-full">
                  <div className="w-12 h-12 rounded-full bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <span className="text-xl">🔍</span>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-wider leading-tight">MODO SELECCIÓN ACTIVO</h4>
                    <p className="text-[10px] text-slate-400 leading-normal max-w-xl">
                      Haz clic en cualquier bloque colocado en la cuadrícula de arriba para seleccionarlo. ¡Podrás desplazarlo con precisión o eliminarlo!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* 5. SETTINGS PANEL OVERLAY MODAL */}
      {showSettingsModal && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4 animate-fade-in">
          <div className="bg-[#1a1b1e] border-4 border-yellow-400 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-yellow-400/20 relative">
            <h3 className="text-xl font-black text-yellow-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              ⚙️ AJUSTES DE NIVEL
            </h3>
            
            {/* Settings Fields */}
            <div className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Nombre del Nivel</label>
                <input
                  type="text"
                  value={levelName}
                  onChange={e => setLevelName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold font-mono focus:border-yellow-400 focus:ring-0 outline-none uppercase"
                  maxLength={22}
                />
              </div>

              {/* Difficulty */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Dificultad</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as Difficulty)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-cyan-400 font-bold focus:border-yellow-400 focus:ring-0 outline-none uppercase"
                >
                  <option value="easy">FÁCIL ⭐</option>
                  <option value="normal">NORMAL ⭐⭐</option>
                  <option value="hard">DIFÍCIL ⭐⭐⭐</option>
                  <option value="insane">INSANO ⭐⭐⭐⭐</option>
                  <option value="demon">DEMON 💀</option>
                </select>
              </div>

              {/* Music */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Banda Sonora</label>
                <select
                  value={musicTrack}
                  onChange={e => setMusicTrack(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-pink-400 font-bold focus:border-yellow-400 focus:ring-0 outline-none uppercase"
                >
                  <option value="track_stereo">🎵 STEREO MADNESS</option>
                  <option value="track_back">🎵 BACK ON TRACK</option>
                  <option value="track_blast">🎵 BLAST PROCESSING</option>
                  <option value="track_dry">🎵 DRY OUT</option>
                  <option value="track_theory">🎵 THEORY OF EVERYTH.</option>
                </select>
              </div>

              {/* Theme Picker */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase mb-1">Tema del Nivel</label>
                <div className="grid grid-cols-3 gap-2">
                  {LEVEL_THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setLevelTheme(theme.id)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border-2 transition uppercase flex flex-col items-center justify-center gap-1 ${levelTheme === theme.id ? 'bg-yellow-400 border-black text-black scale-105 shadow-md shadow-yellow-400/20' : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'}`}
                    >
                      <span className="text-base">{theme.emoji}</span>
                      <span className="text-[9px] tracking-tighter leading-none">{theme.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2.5 bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 border-2 border-black rounded-xl font-bold text-xs uppercase text-white shadow shadow-black flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
              >
                <Check className="w-4 h-4 text-yellow-300" /> APLICAR Y CERRAR
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
