import React, { useRef, useEffect, useState } from 'react';
import { UserProfile, PlayerSkins } from '../types';
import { getPlayerLevel } from './PlayerLevelBar';
import { PlayerSkinCanvas } from './PlayerLevelBar';
import { X, Trophy, Gift, CheckCircle2, Lock, Sparkles, Star, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface Reward {
  level: number;
  orbs: number;
  diamonds: number;
  stars: number;
  title: string;
}

export function getLevelReward(lvl: number): Reward {
  if (lvl === 100) {
    return {
      level: 100,
      orbs: 1500,
      diamonds: 150,
      stars: 15,
      title: '👑 CUBO REY LEYENDA (+1500 Orbes, +150 Diamantes, +15 Estrellas)',
    };
  } else if (lvl % 10 === 0) {
    return {
      level: lvl,
      orbs: 600,
      diamonds: 50,
      stars: 6,
      title: `🔥 COFRE MÍTICO Nivel ${lvl}`,
    };
  } else if (lvl % 5 === 0) {
    return {
      level: lvl,
      orbs: 350,
      diamonds: 25,
      stars: 3,
      title: `🌟 COFRE ÉPICO Nivel ${lvl}`,
    };
  } else {
    // Normal level rewards
    const tier = lvl % 5;
    return {
      level: lvl,
      orbs: 100 + tier * 30,
      diamonds: 5 + (lvl % 4) * 3,
      stars: 1,
      title: `Caja de Poder Nivel ${lvl}`,
    };
  }
}

interface LevelRewardsModalProps {
  profile: UserProfile;
  skins: PlayerSkins;
  onClaim: (rewardLevel: number, reward: Reward) => void;
  onClose: () => void;
}

export const LevelRewardsModal: React.FC<LevelRewardsModalProps> = ({ profile, skins, onClaim, onClose }) => {
  const { level: playerLevel } = getPlayerLevel(profile.xp || 0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const claimedRewards = profile.claimedRewards || [];

  // Generate array for levels 1 to 100 (excluding Level 1 as it is the start point, so rewards start at Level 2)
  const rewardsList: Reward[] = [];
  for (let l = 2; l <= 100; l++) {
    rewardsList.push(getLevelReward(l));
  }

  // Auto-scroll to current level row when modal opens
  useEffect(() => {
    if (scrollContainerRef.current) {
      // Find the row for their current level
      const targetElement = document.getElementById(`reward-level-${playerLevel}`);
      if (targetElement) {
        // Smoothly center the row
        targetElement.scrollIntoView({ behavior: 'auto', block: 'center' });
      }
    }
  }, [playerLevel]);

  return (
    <div className="absolute inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-4 border-purple-800 rounded-3xl shadow-2xl flex flex-col justify-between max-h-[90vh] overflow-hidden animate-scale-up"
        style={{ boxShadow: '0 0 35px rgba(126,34,206,0.25)' }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-purple-900/30 flex justify-between items-center bg-black/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-950/60 border border-purple-500/40 rounded-xl flex items-center justify-center">
              <Gift className="w-5.5 h-5.5 text-yellow-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 leading-none">
                CAMINO DE RECOMPENSAS
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1 leading-none">
                Sube de nivel jugando y reclama cofres legendarios hasta el nivel 100
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 bg-slate-900 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded-xl border border-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Level Info Ribbon */}
        <div className="bg-purple-950/40 px-5 py-3 border-b border-purple-900/20 flex flex-col sm:flex-row gap-3 justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black/60 border border-purple-500/30 rounded-xl flex items-center justify-center">
              <PlayerSkinCanvas skins={skins} size={32} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wide block leading-none">PROGRESO DEL JUGADOR</span>
              <span className="text-sm font-black text-white leading-none">
                {profile.username}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-purple-400 tracking-wider">NIVEL ACTUAL</span>
              <span className="text-xl font-black text-yellow-400 leading-none font-mono tracking-tight">
                {playerLevel === 100 ? 'MÁXIMO' : playerLevel}
              </span>
            </div>
            <div className="w-[1px] h-8 bg-purple-900/40" />
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-purple-400 tracking-wider">TOTAL XP</span>
              <span className="text-sm font-black text-cyan-300 leading-none font-mono">
                {profile.xp || 0} XP
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable list of rewards */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 scrollbar-thin scroll-smooth select-none min-h-0 bg-black/20"
        >
          {rewardsList.map((reward) => {
            const isUnlocked = playerLevel >= reward.level;
            const isClaimed = claimedRewards.includes(reward.level);
            const canClaim = isUnlocked && !isClaimed;

            // Compute reward highlights
            const isMilestone = reward.level % 10 === 0 || reward.level === 100;
            const isHalfMilestone = reward.level % 5 === 0 && !isMilestone;

            let borderClass = 'border-slate-800/80 bg-[#111317]/50';
            let numBgClass = 'bg-slate-950 text-slate-400 border-slate-800';
            
            if (isUnlocked) {
              if (isMilestone) {
                borderClass = 'border-amber-500/50 bg-gradient-to-r from-amber-950/20 via-slate-900/60 to-[#111317]/50 shadow-[0_0_12px_rgba(245,158,11,0.05)]';
                numBgClass = 'bg-amber-950/80 text-yellow-300 border-amber-600/40';
              } else if (isHalfMilestone) {
                borderClass = 'border-purple-600/50 bg-gradient-to-r from-purple-950/20 via-slate-900/60 to-[#111317]/50';
                numBgClass = 'bg-purple-950/80 text-purple-300 border-purple-600/40';
              } else {
                borderClass = 'border-purple-900/20 bg-[#14161f]/60 hover:border-purple-800/40 transition-colors';
                numBgClass = 'bg-purple-950/40 text-purple-300 border-purple-900/40';
              }
            }

            return (
              <div 
                key={reward.level}
                id={`reward-level-${reward.level}`}
                className={`flex flex-col sm:flex-row justify-between items-stretch sm:items-center p-3.5 rounded-2xl border-2 gap-3 transition-all ${borderClass}`}
              >
                {/* Level badge and detail */}
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-black text-sm border-2 shrink-0 shadow-inner font-mono ${numBgClass}`}>
                    <span className="text-[7.5px] font-bold text-slate-500 uppercase leading-none mb-0.5">LVL</span>
                    <span className="leading-none">{reward.level}</span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className={`text-[9px] font-black uppercase tracking-wider leading-none flex items-center gap-1 ${
                      isMilestone ? 'text-yellow-400' : isHalfMilestone ? 'text-purple-400' : 'text-slate-400'
                    }`}>
                      {isMilestone ? (
                        <>🏆 RECOMPENSA MÍTICA</>
                      ) : isHalfMilestone ? (
                        <>🌟 RECOMPENSA ÉPICA</>
                      ) : (
                        <>📦 COFRE NORMAL</>
                      )}
                    </span>
                    <span className="text-xs font-bold text-white uppercase tracking-wide leading-tight">
                      {reward.title}
                    </span>
                    
                    {/* Visual icons of contents */}
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full border border-white/5 font-mono text-[9px] font-black text-pink-400">
                        <span>💎</span>
                        <span>+{reward.orbs}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full border border-white/5 font-mono text-[9px] font-black text-cyan-400">
                        <span>💠</span>
                        <span>+{reward.diamonds}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full border border-white/5 font-mono text-[9px] font-black text-yellow-400">
                        <span>⭐</span>
                        <span>+{reward.stars}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Claim action or status */}
                <div className="flex items-center justify-end shrink-0 sm:pl-3">
                  {isClaimed ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 text-slate-500 rounded-xl border border-slate-800 text-xs font-black uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                      Reclamado
                    </div>
                  ) : canClaim ? (
                    <button
                      onClick={() => onClaim(reward.level, reward)}
                      className="px-4 py-2 bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-500 border-2 border-black rounded-xl font-black text-[10px] tracking-wider text-black hover:scale-105 active:scale-95 transition cursor-pointer shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 animate-pulse flex items-center gap-1 uppercase"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      RECLAMAR
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/40 text-slate-600 rounded-xl border border-slate-900/80 text-[10px] font-black uppercase tracking-wider">
                      <Lock className="w-3 h-3 text-slate-700" />
                      Bloqueado
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-purple-900/30 bg-black/30 shrink-0 text-center text-[10px] text-purple-400/80 uppercase font-bold tracking-widest leading-none">
          ✨ ¡El progreso de XP se guarda en tu cuenta local en la nube! ✨
        </div>
      </div>
    </div>
  );
};
