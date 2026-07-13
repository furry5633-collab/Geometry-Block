/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Level, Difficulty, PlayerSkins, Comment } from '../types';
import {
  getOnlineSharedLevels,
  downloadOnlineLevel,
  likeOnlineLevel,
  addOnlineComment,
  getLevelProgress
} from '../levels';
import {
  Search,
  Users,
  X,
  Download,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Gem,
  Award,
  RefreshCw,
  Trophy,
  Info,
  ChevronRight,
  MessageSquare,
  PlusCircle,
  Play
} from 'lucide-react';

interface OnlineLevelBrowserProps {
  skins: PlayerSkins;
  onPlayLevel: (level: Level) => void;
  onClose: () => void;
  username: string;
}

// Draw the iconic GD Difficulty Faces in JSX
export function DifficultyFace({ diff, size = 10 }: { diff: Difficulty; size?: number }) {
  const getStyles = () => {
    switch (diff) {
      case 'na':
        return { bg: 'bg-slate-500', border: 'border-slate-700', text: 'N/A' };
      case 'easy':
        return { bg: 'bg-cyan-500', border: 'border-cyan-700', text: 'Easy' };
      case 'normal':
        return { bg: 'bg-emerald-500', border: 'border-emerald-700', text: 'Normal' };
      case 'hard':
        return { bg: 'bg-yellow-500', border: 'border-yellow-700', text: 'Hard' };
      case 'harder':
        return { bg: 'bg-orange-500', border: 'border-orange-700', text: 'Harder' };
      case 'insane':
        return { bg: 'bg-purple-600', border: 'border-purple-800', text: 'Insane' };
      case 'demon':
        return { bg: 'bg-red-600', border: 'border-red-800', text: 'Demon' };
      case 'auto':
        return { bg: 'bg-pink-500', border: 'border-pink-700', text: 'Auto' };
    }
  };

  const { bg, border } = getStyles();

  return (
    <div className={`relative flex items-center justify-center rounded-full border-2 ${bg} ${border} shadow-md select-none`} style={{ width: `${size * 4}px`, height: `${size * 4}px` }}>
      {diff === 'na' && (
        <div className="flex flex-col items-center justify-center">
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 bg-black rounded-full" />
            <div className="w-1.5 h-1.5 bg-black rounded-full" />
          </div>
          <div className="w-4 h-0.5 bg-black mt-1" />
        </div>
      )}
      {diff === 'easy' && (
        <div className="flex flex-col items-center justify-center">
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 bg-black rounded-full" />
            <div className="w-1.5 h-1.5 bg-black rounded-full" />
          </div>
          <div className="w-5 h-2.5 border-b-2 border-black rounded-b-full mt-0.5" />
        </div>
      )}
      {diff === 'normal' && (
        <div className="flex flex-col items-center justify-center">
          <div className="flex gap-2.5">
            <div className="w-2 h-2 bg-black rounded-full" />
            <div className="w-2 h-2 bg-black rounded-full" />
          </div>
          <div className="w-6 h-3 border-b-2 border-black rounded-b-full mt-0.5" />
        </div>
      )}
      {diff === 'hard' && (
        <div className="flex flex-col items-center justify-center">
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-black rounded-full" />
            <div className="w-2 h-2 bg-black rounded-full" />
          </div>
          <div className="w-6 h-1.5 bg-black mt-1 rounded-sm" />
        </div>
      )}
      {diff === 'harder' && (
        <div className="flex flex-col items-center justify-center">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-black rounded-full transform -rotate-12" />
            <div className="w-2 h-2 bg-black rounded-full transform rotate-12" />
          </div>
          <div className="w-5 h-2 border-t-2 border-black rounded-t-full mt-1" />
        </div>
      )}
      {diff === 'insane' && (
        <div className="flex flex-col items-center justify-center">
          <div className="flex gap-2 -mt-1">
            {/* Angry eyebrows */}
            <div className="text-[9px] text-black font-extrabold rotate-12 leading-none">\</div>
            <div className="text-[9px] text-black font-extrabold -rotate-12 leading-none">/</div>
          </div>
          <div className="flex gap-1.5 -mt-1">
            <div className="w-2 h-2 bg-black rounded-full" />
            <div className="w-2 h-2 bg-black rounded-full" />
          </div>
          <div className="w-5 h-1.5 bg-black mt-1" />
        </div>
      )}
      {diff === 'demon' && (
        <div className="relative flex flex-col items-center justify-center w-full h-full">
          {/* Horns */}
          <div className="absolute -top-1.5 -left-1 text-[12px] text-black font-black rotate-45 select-none">▲</div>
          <div className="absolute -top-1.5 -right-1 text-[12px] text-black font-black -rotate-45 select-none">▲</div>
          <div className="flex gap-2 mt-1">
            <div className="w-2 h-2 bg-yellow-400 border border-black rounded-full flex items-center justify-center"><div className="w-1 h-1 bg-black rounded-full" /></div>
            <div className="w-2 h-2 bg-yellow-400 border border-black rounded-full flex items-center justify-center"><div className="w-1 h-1 bg-black rounded-full" /></div>
          </div>
          {/* Evil grin with teeth */}
          <div className="w-6 h-3 bg-black rounded-b-md mt-1 relative flex items-start justify-around">
            <div className="w-1 h-1 bg-white" />
            <div className="w-1 h-1 bg-white" />
            <div className="w-1 h-1 bg-white" />
          </div>
        </div>
      )}
      {diff === 'auto' && (
        <div className="flex flex-col items-center justify-center">
          {/* Metal robotic visor */}
          <div className="w-7 h-2.5 bg-slate-800 border border-black rounded-sm flex items-center justify-center">
            <div className="w-5 h-1 bg-red-500 rounded-full animate-pulse" />
          </div>
          <div className="w-4 h-2 border-b border-black rounded-b-full mt-1" />
        </div>
      )}
    </div>
  );
}

export default function OnlineLevelBrowser({ skins, onPlayLevel, onClose, username }: OnlineLevelBrowserProps) {
  const [onlineLevels, setOnlineLevels] = useState<Level[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | 'all'>('all');
  const [activeLength, setActiveLength] = useState<string | 'all'>('all');
  const [quickSearchFilter, setQuickSearchFilter] = useState<'all' | 'downloads' | 'likes' | 'trending' | 'recent' | 'magic' | 'awarded' | 'friends'>('all');

  // Custom detailed modals inside level page
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [hasRated, setHasRated] = useState<Record<string, 'like' | 'dislike'>>({});
  const [downloadedLevels, setDownloadedLevels] = useState<string[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Reload online levels from real backend Express API with LocalStorage fallback
  const reloadLevels = async () => {
    try {
      const res = await fetch('/api/online-levels');
      if (res.ok) {
        const list = await res.json();
        setOnlineLevels(list);
        return;
      }
    } catch (e) {
      console.error('Failed to reload levels from Express API, trying LocalStorage fallback:', e);
    }
    const list = getOnlineSharedLevels();
    setOnlineLevels(list);
  };

  useEffect(() => {
    reloadLevels();
    // Load rated and downloaded lists from localStorage
    try {
      const rated = localStorage.getItem('geometry_dash_rated_levels');
      if (rated) setHasRated(JSON.parse(rated));
      const downloaded = localStorage.getItem('geometry_dash_downloaded_ids');
      if (downloaded) setDownloadedLevels(JSON.parse(downloaded));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Filter levels based on search input & filter buttons
  const getFilteredLevels = () => {
    let result = [...onlineLevels];

    // 1. Text Query Search (Level name, user author, or ID)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(lvl =>
        lvl.name.toLowerCase().includes(q) ||
        (lvl.author && lvl.author.toLowerCase().includes(q)) ||
        lvl.id.toLowerCase().includes(q)
      );
    }

    // 2. Difficulty Filter
    if (activeDifficulty !== 'all') {
      result = result.filter(lvl => lvl.difficulty === activeDifficulty);
    }

    // 3. Length Filter
    if (activeLength !== 'all') {
      result = result.filter(lvl => lvl.lengthLabel?.toLowerCase() === activeLength.toLowerCase());
    }

    // 4. Quick Search Category Sorting/Filtering
    if (quickSearchFilter === 'downloads') {
      result.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    } else if (quickSearchFilter === 'likes') {
      result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (quickSearchFilter === 'trending') {
      // Likes + downloads combined ratio
      result.sort((a, b) => {
        const scoreA = (a.likes || 0) * 2 + (a.downloads || 0);
        const scoreB = (b.likes || 0) * 2 + (b.downloads || 0);
        return scoreB - scoreA;
      });
    } else if (quickSearchFilter === 'recent') {
      result.sort((a, b) => {
        const dateA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
        const dateB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
        return dateB - dateA;
      });
    } else if (quickSearchFilter === 'magic') {
      // Magic levels: contains at least 15 elements and has length long or XL
      result = result.filter(lvl => lvl.elements.length >= 10 && (lvl.lengthLabel === 'Long' || lvl.lengthLabel === 'XL'));
    } else if (quickSearchFilter === 'awarded') {
      result = result.filter(lvl => (lvl.starsReward || 0) > 0);
    } else if (quickSearchFilter === 'friends') {
      // Friends: mock custom levels with common known authors
      result = result.filter(lvl => lvl.author === 'Viprin' || lvl.author === 'RobTop');
    }

    return result;
  };

  const filteredLevels = getFilteredLevels();

  // Play Level handler
  const handlePlayLevel = async (level: Level) => {
    // Save download increment first if not yet downloaded
    if (!downloadedLevels.includes(level.id)) {
      const updated = [...downloadedLevels, level.id];
      setDownloadedLevels(updated);
      localStorage.setItem('geometry_dash_downloaded_ids', JSON.stringify(updated));

      try {
        await fetch('/api/online-levels/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: level.id })
        });
      } catch (e) {
        console.error(e);
        downloadOnlineLevel(level.id);
      }
    }
    onPlayLevel(level);
  };

  // Like level handler
  const handleLikeLevel = async (levelId: string, isLike: boolean) => {
    if (hasRated[levelId]) {
      alert('Ya has valorado este nivel.');
      return;
    }

    const updated = { ...hasRated, [levelId]: isLike ? ('like' as const) : ('dislike' as const) };
    setHasRated(updated);
    localStorage.setItem('geometry_dash_rated_levels', JSON.stringify(updated));

    try {
      const res = await fetch('/api/online-levels/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: levelId, isLike })
      });
      if (res.ok) {
        const updatedLevel = await res.json();
        if (selectedLevel?.id === levelId) {
          setSelectedLevel(updatedLevel);
        }
        reloadLevels();
        return;
      }
    } catch (e) {
      console.error('API like failed, falling back locally:', e);
    }

    const updatedLevel = likeOnlineLevel(levelId, isLike);
    if (updatedLevel) {
      reloadLevels();
      if (selectedLevel?.id === levelId) {
        setSelectedLevel(updatedLevel);
      }
    }
  };

  // Add Comment handler
  const handlePostComment = async () => {
    if (!selectedLevel || commentText.trim() === '') return;
    const cleanUsername = username || 'Tú';
    const text = commentText;

    try {
      const res = await fetch('/api/online-levels/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedLevel.id, username: cleanUsername, text })
      });
      if (res.ok) {
        const updatedLevel = await res.json();
        setSelectedLevel(updatedLevel);
        reloadLevels();
        setCommentText('');
        return;
      }
    } catch (e) {
      console.error('API comment failed, falling back locally:', e);
    }

    const updated = addOnlineComment(selectedLevel.id, cleanUsername, text);
    if (updated) {
      setSelectedLevel(updated);
      reloadLevels();
      setCommentText('');
    }
  };

  // Manual Trigger Download Level (saves in custom levels menu)
  const handleDownloadOnly = async (level: Level) => {
    if (downloadedLevels.includes(level.id)) {
      alert('¡Este nivel ya está descargado!');
      return;
    }
    const updated = [...downloadedLevels, level.id];
    setDownloadedLevels(updated);
    localStorage.setItem('geometry_dash_downloaded_ids', JSON.stringify(updated));

    try {
      const res = await fetch('/api/online-levels/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: level.id })
      });
      if (res.ok) {
        const updatedLevel = await res.json();
        
        // Save locally to custom levels so they can play it offline as well
        try {
          const raw = localStorage.getItem('geometry_dash_custom_levels');
          const customLevels = raw ? JSON.parse(raw) : [];
          if (!customLevels.some((cl: any) => cl.id === updatedLevel.id)) {
            customLevels.push({
              ...updatedLevel,
              isCustom: true
            });
            localStorage.setItem('geometry_dash_custom_levels', JSON.stringify(customLevels));
          }
        } catch (e) {
          console.error(e);
        }

        reloadLevels();
        setSelectedLevel(updatedLevel);
        alert('¡Nivel descargado con éxito! Ahora puedes jugarlo también desde tu biblioteca local offline.');
        return;
      }
    } catch (e) {
      console.error('API download failed, falling back locally:', e);
    }

    const updatedLevel = downloadOnlineLevel(level.id);
    if (updatedLevel) {
      reloadLevels();
      setSelectedLevel(updatedLevel);
      alert('¡Nivel descargado con éxito! Ahora puedes jugarlo también desde tu biblioteca local offline.');
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setActiveDifficulty('all');
    setActiveLength('all');
    setQuickSearchFilter('all');
  };

  // Progress for the selected level
  const progress = selectedLevel ? getLevelProgress(selectedLevel.id) : { normalProgress: 0, practiceProgress: 0, completed: false, attemptsCount: 0 };

  return (
    <div className="relative w-full h-full bg-blue-950 border-4 border-blue-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col font-sans select-none animate-fade-in text-white">
      
      {/* BACKGROUND GRAPHIC LINES */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(255,255,255,.05)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,.05)_1px,_transparent_1px)] bg-[size:40px_40px] z-0" />

      {/* VIEW CONDITIONAL: 1. THE MAIN BROWSER / SEARCH VIEW */}
      {!selectedLevel ? (
        <div className="relative z-10 flex flex-col h-full p-5 justify-between">
          
          {/* SEARCH TOP INPUT BAR (Matches Screenshot_2026_0712_230050.png) */}
          <div className="flex items-center gap-3 bg-black/45 p-1.5 rounded-2xl border-2 border-blue-900">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ENTER A LEVEL, USER OR ID"
              className="flex-1 bg-transparent px-4 py-2 border-none outline-none font-black tracking-wider text-sm placeholder-slate-400 uppercase text-yellow-300"
            />
            {/* Search green button */}
            <button
              onClick={() => setQuickSearchFilter('all')}
              className="px-4 py-2.5 bg-gradient-to-b from-green-400 to-green-600 border-2 border-black rounded-xl hover:scale-105 active:scale-95 transition cursor-pointer text-black"
              style={{ boxShadow: '0 3px 0 #000' }}
            >
              <Search className="w-5 h-5 text-white stroke-[2.5]" />
            </button>
            {/* User Search button */}
            <button
              className="px-4 py-2.5 bg-gradient-to-b from-green-400 to-green-600 border-2 border-black rounded-xl hover:scale-105 active:scale-95 transition cursor-pointer text-black"
              style={{ boxShadow: '0 3px 0 #000' }}
            >
              <Users className="w-5 h-5 text-white stroke-[2.5]" />
            </button>
            {/* Close button */}
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-gradient-to-b from-red-500 to-red-700 border-2 border-black rounded-xl hover:scale-105 active:scale-95 transition cursor-pointer"
              style={{ boxShadow: '0 3px 0 #000' }}
            >
              <X className="w-5 h-5 text-white stroke-[2.5]" />
            </button>
          </div>

          {/* QUICK SEARCH BUTTONS (Matches Screenshot_2026_0712_230050.png) */}
          <div className="my-auto">
            <h3 className="text-center font-black tracking-widest text-xs text-cyan-300 uppercase mb-3 drop-shadow-md">QUICK SEARCH</h3>
            
            <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
              {[
                { id: 'downloads', label: 'DOWNLOADS', icon: '📥' },
                { id: 'likes', label: 'LIKES', icon: '👍' },
                { id: 'trending', label: 'TRENDING', icon: '📈' },
                { id: 'recent', label: 'RECENT', icon: '⏱️' },
                { id: 'magic', label: 'MAGIC', icon: '✨' },
                { id: 'awarded', label: 'AWARDED', icon: '⭐' },
                { id: 'friends', label: 'FRIENDS', icon: '👥' },
              ].map(item => {
                const isActive = quickSearchFilter === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setQuickSearchFilter(isActive ? 'all' : (item.id as any))}
                    className={`py-3.5 px-3 rounded-2xl border-2 border-black font-black uppercase text-xs tracking-wider transition duration-150 transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${isActive ? 'bg-gradient-to-b from-yellow-300 to-yellow-500 text-black' : 'bg-gradient-to-b from-green-400 to-green-600 text-white'}`}
                    style={{
                      boxShadow: '0 4px 0 #000000',
                      textShadow: '1.5px 1.5px 0px rgba(0,0,0,0.5)'
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
              {/* Reset/All filter option */}
              <button
                onClick={resetFilters}
                className="col-span-1 py-3.5 px-3 bg-gradient-to-b from-blue-400 to-blue-600 border-2 border-black rounded-2xl font-black uppercase text-xs tracking-wider text-white hover:scale-105 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                style={{
                  boxShadow: '0 4px 0 #000000',
                  textShadow: '1.5px 1.5px 0px rgba(0,0,0,0.5)'
                }}
              >
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                <span>LIMPIAR</span>
              </button>
            </div>
          </div>

          {/* FILTERS (Difficulty faces & Lengths - Matches Screenshot_2026_0712_230050.png) */}
          <div className="mt-3">
            <h4 className="text-center font-black tracking-widest text-xs text-cyan-300 uppercase mb-2 drop-shadow-md">FILTERS</h4>
            
            {/* Difficulty Faces */}
            <div className="flex items-center justify-center gap-3 bg-black/30 py-2.5 px-4 rounded-2xl border border-blue-900 max-w-3xl mx-auto mb-2">
              {([
                { id: 'na', label: 'NA' },
                { id: 'easy', label: 'EASY' },
                { id: 'normal', label: 'NORMAL' },
                { id: 'hard', label: 'HARD' },
                { id: 'harder', label: 'HARDER' },
                { id: 'insane', label: 'INSANE' },
                { id: 'demon', label: 'DEMON' },
                { id: 'auto', label: 'AUTO' }
              ] as { id: Difficulty; label: string }[]).map(item => {
                const isActive = activeDifficulty === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveDifficulty(isActive ? 'all' : item.id)}
                    className={`flex flex-col items-center gap-1 cursor-pointer transition transform hover:scale-110 active:scale-95 p-1 rounded-xl ${isActive ? 'bg-yellow-500/20 border border-yellow-400/40' : 'opacity-65 hover:opacity-100'}`}
                  >
                    <DifficultyFace diff={item.id} size={8} />
                    <span className="text-[9px] font-mono font-bold tracking-tight">{item.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Length indicators */}
            <div className="flex items-center justify-center gap-4 bg-black/35 py-1.5 px-4 rounded-xl border border-blue-900/60 max-w-xl mx-auto">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {['TINY', 'SHORT', 'MEDIUM', 'LONG', 'XL', 'PLAT.'].map(len => {
                const isActive = activeLength === len;
                return (
                  <button
                    key={len}
                    onClick={() => setActiveLength(isActive ? 'all' : len)}
                    className={`text-[9px] font-black tracking-widest px-2.5 py-1 rounded transition uppercase ${isActive ? 'bg-yellow-400 text-black font-extrabold' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                  >
                    {len}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE FILTER RESULTS OVERLAY */}
          {(quickSearchFilter !== 'all' || activeDifficulty !== 'all' || activeLength !== 'all' || searchQuery !== '') && (
            <div className="absolute inset-x-0 bottom-0 top-[85px] z-20 bg-slate-950/95 backdrop-blur-md p-5 flex flex-col justify-between rounded-3xl animate-slide-up">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-400 font-mono">
                  Resultados encontrados: <span className="text-yellow-400 font-black">{filteredLevels.length}</span>
                </span>
                <button
                  onClick={resetFilters}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition"
                >
                  Volver a búsqueda
                </button>
              </div>

              {/* Levels grid lists */}
              <div className="flex-1 overflow-y-auto my-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pr-2 scrollbar-thin">
                {filteredLevels.length > 0 ? (
                  filteredLevels.map(level => {
                    const isDownloaded = downloadedLevels.includes(level.id);
                    return (
                      <div
                        key={level.id}
                        onClick={() => setSelectedLevel(level)}
                        className="p-3 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl flex items-center justify-between cursor-pointer group transition"
                      >
                        <div className="flex items-center gap-3">
                          <DifficultyFace diff={level.difficulty} size={8} />
                          <div>
                            <div className="text-sm font-black text-white group-hover:text-cyan-300 transition">
                              {level.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Por: <span className="text-slate-300 font-bold">{level.author || 'Jax'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400">
                          <div className="flex items-center gap-0.5" title="Downloads">
                            <Download className="w-3 h-3 text-green-400" />
                            <span>{level.downloads ? level.downloads.toLocaleString() : '0'}</span>
                          </div>
                          <div className="flex items-center gap-0.5" title="Likes">
                            <ThumbsUp className="w-3 h-3 text-yellow-400" />
                            <span>{level.likes ? level.likes.toLocaleString() : '0'}</span>
                          </div>
                          {isDownloaded && <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md font-bold">DESCARGADO</span>}
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition" />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-16 text-center text-slate-500 font-mono text-xs">
                    Ningún nivel coincide con tus filtros de búsqueda. Inténtalo con otros valores.
                  </div>
                )}
              </div>

              <div className="text-center text-[10px] text-slate-500">
                Haz clic en cualquier nivel de la lista para ver sus detalles, comentarios, descargarlo o jugarlo.
              </div>
            </div>
          )}

        </div>
      ) : (
        
        /* VIEW CONDITIONAL: 2. DETAILED LEVEL PAGE VIEW (Matches Screenshot_2026_0712_230058.png) */
        <div className="relative z-10 flex flex-col h-full p-6 justify-between text-white">
          
          {/* TOP BAR: LEVEL TITLE AND AUTHOR */}
          <div className="text-center relative">
            <h1 className="text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-500 select-none"
                style={{ WebkitTextStroke: '1px black', filter: 'drop-shadow(0 2px 2px #000)' }}>
              LEVEL {selectedLevel.difficulty.toUpperCase()}
            </h1>
            <p className="text-xs font-bold tracking-widest text-slate-400 uppercase -mt-0.5">
              BY {selectedLevel.author || 'Jax'}
            </p>

            {/* Back button to search (X) */}
            <button
              onClick={() => setSelectedLevel(null)}
              className="absolute right-0 top-0 p-2 bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white rounded-full border-2 border-black active:scale-95 transition shadow-lg"
              title="Cerrar detalles"
              style={{ boxShadow: '0 3px 0 #000' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* MAIN GRID BLOCK: CORE PLAY BUTTON & STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center my-auto">
            
            {/* LEFT SIDE: DIFFICULTY FACE & STARS REWARD */}
            <div className="flex flex-col items-center justify-center gap-1 bg-black/20 p-4 rounded-2xl border border-blue-900/40">
              <DifficultyFace diff={selectedLevel.difficulty} size={13} />
              <div className="text-xs font-black font-mono tracking-wider text-cyan-400 uppercase mt-2">
                {selectedLevel.difficulty === 'demon' ? 'DEMON' : 'NORMAL'}
              </div>
              <div className="flex items-center gap-1 px-2.5 py-0.5 bg-yellow-500/20 border border-yellow-500/40 rounded-full">
                <span className="text-xs font-bold text-yellow-400">{selectedLevel.starsReward || '3'}</span>
                <span className="text-xs text-yellow-400">★</span>
              </div>
            </div>

            {/* CENTER PANEL: THE ICONIC CIRCLE PLAY BUTTON */}
            <div className="flex flex-col items-center justify-center">
              <button
                onClick={() => handlePlayLevel(selectedLevel)}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-b from-green-400 to-green-600 border-[5px] border-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition duration-150 cursor-pointer group"
                style={{ boxShadow: '0 8px 0 #000, 0 15px 25px rgba(0,0,0,0.5)' }}
                title="Jugar nivel"
              >
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-yellow-400 border-3 border-black flex items-center justify-center shadow-inner relative group-hover:rotate-6 transition">
                  {/* Play triangle */}
                  <Play className="w-9 h-9 text-black fill-current translate-x-1" />
                  {/* Glow Reflex */}
                  <div className="absolute inset-0 bg-white/20 -translate-y-full rotate-45 group-hover:translate-y-full transition-transform duration-1000" />
                </div>
              </button>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-4 animate-pulse">PULSA PARA JUGAR</span>
            </div>

            {/* RIGHT SIDE: STATS & COSMETIC REWARDS */}
            <div className="bg-black/25 p-4 rounded-2xl border border-blue-900/40 flex flex-col gap-2.5 text-xs font-mono">
              <div className="flex items-center justify-between text-green-400">
                <div className="flex items-center gap-1.5 font-bold">
                  <Download className="w-4 h-4" /> DESCARGAS:
                </div>
                <span className="font-bold text-white">{(selectedLevel.downloads || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-yellow-400">
                <div className="flex items-center gap-1.5 font-bold">
                  <ThumbsUp className="w-4 h-4" /> ME GUSTA:
                </div>
                <span className="font-bold text-white">{(selectedLevel.likes || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-cyan-400">
                <div className="flex items-center gap-1.5 font-bold">
                  <Clock className="w-4 h-4" /> LONGITUD:
                </div>
                <span className="font-bold text-white">{selectedLevel.lengthLabel || 'Medium'}</span>
              </div>
              <div className="flex items-center justify-between text-pink-400">
                <div className="flex items-center gap-1.5 font-bold">
                  <Gem className="w-4 h-4" /> RECOMPENSA:
                </div>
                <span className="font-bold text-white flex items-center gap-1">
                  <span>+{selectedLevel.orbsReward || '100'}</span>
                  <span className="text-[10px] text-pink-500">💎</span>
                </span>
              </div>
            </div>

          </div>

          {/* PROGRESS BARS (Matches Screenshot_2026_0712_230058.png) */}
          <div className="w-full max-w-2xl mx-auto flex flex-col gap-2 mb-3">
            {/* Normal mode progress */}
            <div>
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 font-mono px-2">
                <span>NORMAL MODE</span>
                <span className="text-emerald-400 font-extrabold">{progress.normalProgress}%</span>
              </div>
              <div className="w-full bg-black/40 h-5 border border-slate-700/50 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-300"
                  style={{ width: `${progress.normalProgress}%` }}
                >
                  {progress.normalProgress > 10 && <span className="text-[9px] font-bold text-black">{progress.normalProgress}%</span>}
                </div>
              </div>
            </div>

            {/* Practice Mode progress */}
            <div>
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 font-mono px-2">
                <span>PRACTICE MODE</span>
                <span className="text-cyan-400 font-extrabold">{progress.practiceProgress}%</span>
              </div>
              <div className="w-full bg-black/40 h-5 border border-slate-700/50 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-300"
                  style={{ width: `${progress.practiceProgress || 0}%` }}
                >
                  {progress.practiceProgress > 10 && <span className="text-[9px] font-bold text-black">{progress.practiceProgress}%</span>}
                </div>
              </div>
            </div>
          </div>

          {/* LOWER INFO BOX: STEREO MADNESS WITH GREEN [MORE] BUTTON */}
          <div className="bg-gradient-to-b from-amber-900/35 to-amber-950/45 border-[2.5px] border-amber-800 rounded-2xl p-3.5 flex justify-between items-center w-full max-w-3xl mx-auto shadow-lg relative">
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold text-amber-200 truncate leading-none uppercase select-all">
                {selectedLevel.name}
              </h2>
              <p className="text-[10px] font-mono font-bold text-yellow-600 uppercase mt-1">
                BY: {selectedLevel.author || 'Jax'}
              </p>
            </div>

            {/* More info trigger (Greener [MORE] button!) */}
            <button
              onClick={() => setShowComments(true)}
              className="px-5 py-2.5 bg-gradient-to-b from-green-400 to-green-600 border-2 border-black rounded-xl hover:scale-105 active:scale-95 text-xs font-black tracking-widest text-white uppercase select-none cursor-pointer"
              style={{ boxShadow: '0 3px 0 #000' }}
            >
              [MORE]
            </button>
          </div>

          {/* RIGHT ACTION COLUMN BUTTONS BLOCK */}
          <div className="absolute right-4 top-20 flex flex-col gap-3.5">
            {/* Download Level locally only if not downloaded */}
            {!downloadedLevels.includes(selectedLevel.id) && (
              <button
                onClick={() => handleDownloadOnly(selectedLevel)}
                className="p-3 bg-gradient-to-b from-green-400 to-green-600 hover:scale-110 active:scale-90 transition rounded-full border-2 border-black text-black"
                style={{ boxShadow: '0 3.5px 0 #000' }}
                title="Descargar nivel en local"
              >
                <Download className="w-5 h-5 text-white" />
              </button>
            )}

            {/* Like button rating */}
            <button
              onClick={() => handleLikeLevel(selectedLevel.id, true)}
              className={`p-3 rounded-full border-2 border-black hover:scale-110 active:scale-90 transition text-white ${hasRated[selectedLevel.id] === 'like' ? 'bg-yellow-500' : 'bg-gradient-to-b from-amber-400 to-amber-600'}`}
              style={{ boxShadow: '0 3.5px 0 #000' }}
              title="Dar me gusta"
            >
              <ThumbsUp className="w-5 h-5 text-white fill-current" />
            </button>

            {/* Dislike button rating */}
            <button
              onClick={() => handleLikeLevel(selectedLevel.id, false)}
              className={`p-3 rounded-full border-2 border-black hover:scale-110 active:scale-90 transition text-white ${hasRated[selectedLevel.id] === 'dislike' ? 'bg-red-500' : 'bg-gradient-to-b from-rose-500 to-rose-700'}`}
              style={{ boxShadow: '0 3.5px 0 #000' }}
              title="No me gusta"
            >
              <ThumbsDown className="w-5 h-5 text-white fill-current" />
            </button>

            {/* Leaderboard button */}
            <button
              onClick={() => setShowLeaderboard(true)}
              className="p-3 bg-gradient-to-b from-yellow-300 to-yellow-500 hover:scale-110 active:scale-90 transition rounded-full border-2 border-black text-black"
              style={{ boxShadow: '0 3.5px 0 #000' }}
              title="Tabla de clasificación"
            >
              <Trophy className="w-5 h-5 text-black" />
            </button>

            {/* General Info button */}
            <button
              onClick={() => alert(`Información del nivel:\nNombre: ${selectedLevel.name}\nAutor: ${selectedLevel.author}\nDificultad: ${selectedLevel.difficulty.toUpperCase()}\nElementos construidos: ${selectedLevel.elements.length}\nFecha: ${selectedLevel.uploadedAt || 'Reciente'}`)}
              className="p-3 bg-gradient-to-b from-cyan-400 to-cyan-600 hover:scale-110 active:scale-90 transition rounded-full border-2 border-black text-black"
              style={{ boxShadow: '0 3.5px 0 #000' }}
              title="Información detallada"
            >
              <Info className="w-5 h-5 text-white" />
            </button>
          </div>

        </div>
      )}

      {/* COMMENTS MODAL POPUP ([MORE] ACTION) */}
      {showComments && selectedLevel && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 p-6 flex flex-col justify-between text-white animate-fade-in">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-black uppercase tracking-widest text-cyan-300">
                  Comentarios: {selectedLevel.name}
                </h3>
              </div>
              <button
                onClick={() => setShowComments(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition"
              >
                Cerrar comentarios
              </button>
            </div>

            {/* Comments List */}
            <div className="max-h-[320px] overflow-y-auto space-y-3 pr-2 font-mono scrollbar-thin">
              {selectedLevel.comments && selectedLevel.comments.length > 0 ? (
                selectedLevel.comments.map((comment, index) => (
                  <div key={index} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="font-extrabold text-cyan-400">{comment.username}</span>
                      <span className="text-slate-500 text-[10px]">{comment.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed break-words">{comment.text}</p>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-600 text-xs">
                  Aún no hay comentarios en este nivel. ¡Escribe el primero!
                </div>
              )}
            </div>
          </div>

          {/* Comments Submission Form */}
          <div className="border-t border-slate-800 pt-4 flex gap-2.5">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escribe tu comentario sobre el nivel..."
              className="flex-1 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl outline-none text-xs text-yellow-300 focus:border-cyan-500 font-mono placeholder:text-slate-500"
              maxLength={120}
            />
            <button
              onClick={handlePostComment}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              Enviar
            </button>
          </div>
        </div>
      )}

      {/* LEADERBOARD / RECORDS MODAL POPUP (TROPHY ICON) */}
      {showLeaderboard && selectedLevel && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 p-6 flex flex-col justify-between text-white animate-fade-in">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-black uppercase tracking-widest text-yellow-300">
                  Tabla de Clasificación
                </h3>
              </div>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition"
              >
                Cerrar tabla
              </button>
            </div>

            <p className="text-slate-400 text-xs font-mono mb-4">
              Jugadores top con mejores récords en <span className="text-white font-extrabold">{selectedLevel.name}</span>:
            </p>

            {/* Leaderboard records */}
            <div className="space-y-2.5 font-mono">
              {[
                { rank: 1, name: 'RobTop', score: '100% Completado', attempts: 5, date: '2026-06-25', badge: '🥇' },
                { rank: 2, name: 'Viprin', score: '100% Completado', attempts: 18, date: '2026-07-01', badge: '🥈' },
                { rank: 3, name: 'Zobros', score: '100% Completado', attempts: 32, date: '2026-07-08', badge: '🥉' },
                { rank: 4, name: username || 'Tú', score: progress.completed ? '100% Completado' : progress.normalProgress > 0 ? `${progress.normalProgress}% Completado` : 'Sin puntuación', attempts: progress.attemptsCount, date: 'Hoy', badge: '👤' },
              ]
                .sort((a, b) => {
                  const valA = a.score.includes('100%') ? 100 : parseFloat(a.score) || 0;
                  const valB = b.score.includes('100%') ? 100 : parseFloat(b.score) || 0;
                  if (valB !== valA) return valB - valA;
                  return a.attempts - b.attempts; // less attempts is better
                })
                .map((row, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3.5 rounded-xl border ${row.name === (username || 'Tú') ? 'bg-yellow-500/10 border-yellow-500/40' : 'bg-slate-900 border-slate-800'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base select-none">{row.badge}</span>
                      <span className="text-xs font-black text-slate-400">#{index + 1}</span>
                      <span className="text-sm font-bold text-white uppercase">{row.name}</span>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-yellow-400 font-extrabold">{row.score}</div>
                      <div className="text-[10px] text-slate-500">{row.attempts} intentos total</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-500 font-mono">
            ¡Sigue jugando y reintentando este nivel para mejorar tu posición y subir tu récord en la tabla de clasificación!
          </div>
        </div>
      )}

    </div>
  );
}
