import React, { useRef, useEffect } from 'react';
import { drawCube } from '../skins';
import { PlayerSkins, UserProfile } from '../types';
import { Trophy } from 'lucide-react';

// Player Level Helper Formulas
export const XP_PER_LEVEL = 200;

export function getPlayerLevel(xp: number) {
  const level = Math.min(100, Math.floor(xp / XP_PER_LEVEL) + 1);
  const xpInCurrentLevel = xp % XP_PER_LEVEL;
  const xpNeededForNextLevel = XP_PER_LEVEL;
  const progressPercent = level === 100 ? 100 : (xpInCurrentLevel / xpNeededForNextLevel) * 100;
  return { level, xpInCurrentLevel, xpNeededForNextLevel, progressPercent };
}

interface PlayerSkinCanvasProps {
  skins: PlayerSkins;
  size?: number;
  className?: string;
}

export const PlayerSkinCanvas: React.FC<PlayerSkinCanvasProps> = ({ skins, size = 32, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Draw cube in center
    const cx = size / 2;
    const cy = size / 2;
    drawCube(ctx, cx, cy, size * 0.75, skins.cube, skins.primaryColor, skins.secondaryColor, 0);
  }, [skins, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{ imageRendering: 'pixelated', width: size, height: size }}
    />
  );
};

interface PlayerLevelBarProps {
  profile: UserProfile;
  skins: PlayerSkins;
  onClick: () => void;
}

export const PlayerLevelBar: React.FC<PlayerLevelBarProps> = ({ profile, skins, onClick }) => {
  const { level, xpInCurrentLevel, xpNeededForNextLevel, progressPercent } = getPlayerLevel(profile.xp || 0);

  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3.5 bg-[#121315]/80 hover:bg-[#18191c]/90 border border-purple-800/40 px-4 py-2 rounded-2xl cursor-pointer transition-all hover:scale-[1.03] active:scale-98 select-none shadow-lg group shrink-0 relative overflow-hidden"
    >
      {/* Absolute back flash glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-cyan-500/5 to-purple-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1.5s]" />

      {/* Profile avatar frame */}
      <div className="flex flex-col items-center shrink-0 relative">
        <div className="w-11 h-11 bg-gradient-to-b from-slate-900 to-slate-950 border-[2.5px] border-purple-600 rounded-xl flex items-center justify-center shadow-md relative overflow-hidden group-hover:border-cyan-400 transition-colors">
          <PlayerSkinCanvas skins={skins} size={36} className="transform group-hover:rotate-12 group-hover:scale-105 transition-all duration-300" />
        </div>
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 border border-purple-500 px-1.5 py-0.5 rounded-full mt-[-6px] z-10 shadow">
          <span className="text-[8px] font-black tracking-wider text-yellow-300 uppercase leading-none font-sans">
            {level === 100 ? 'MAX' : `LVL ${level}`}
          </span>
        </div>
      </div>

      {/* XP Bar & Name Info */}
      <div className="flex flex-col gap-1 w-[160px] sm:w-[200px]">
        <div className="flex justify-between items-end leading-none">
          <span className="text-xs font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200 uppercase truncate">
            {profile.username}
          </span>
          <span className="text-[9px] font-bold font-mono text-cyan-400">
            {level === 100 ? 'MAX LVL' : `${xpInCurrentLevel}/${xpNeededForNextLevel} XP`}
          </span>
        </div>

        {/* Outer XP Progress Bar */}
        <div className="w-full h-3.5 bg-black/50 border border-slate-800/80 rounded-full overflow-hidden p-[2px] shadow-inner relative flex items-center">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500 transition-all duration-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Subtle percentage text overlay */}
          <span className="absolute inset-0 flex items-center justify-center text-[7.5px] font-black text-white/90 font-mono tracking-tighter">
            {level === 100 ? 'Nivel Máximo reached' : `${Math.floor(progressPercent)}%`}
          </span>
        </div>
      </div>
    </div>
  );
};
