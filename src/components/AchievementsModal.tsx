import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Skull, 
  Wrench, 
  Trophy, 
  Award, 
  Globe, 
  Star, 
  ShoppingCart, 
  Check, 
  Lock, 
  X,
  TrendingUp,
  Award as RewardIcon
} from 'lucide-react';
import { Achievement, ACHIEVEMENTS, getAchievementProgress } from '../achievements';
import { UserProfile } from '../types';
import { audio } from '../audio';

interface AchievementsModalProps {
  profile: UserProfile;
  onClaimAchievement: (id: string, reward: number) => void;
  onClose: () => void;
}

const IconComponent = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case 'Skull': return <Skull className={className} />;
    case 'Wrench': return <Wrench className={className} />;
    case 'Trophy': return <Trophy className={className} />;
    case 'Award': return <Award className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'Star': return <Star className={className} />;
    case 'ShoppingCart': return <ShoppingCart className={className} />;
    default: return <Award className={className} />;
  }
};

export function AchievementsModal({ profile, onClaimAchievement, onClose }: AchievementsModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'pending' | 'claimed'>('all');

  const claimedList = profile.claimedAchievements || [];

  // Statistics summaries
  const totalDeaths = profile.totalDeaths || 0;
  const totalLevelsCreated = profile.totalLevelsCreated || 0;
  const totalCompleted = profile.completedCount || 0;
  const totalXP = profile.xp || 0;
  const totalUploaded = profile.totalLevelsUploaded || 0;
  const totalCoins = profile.totalCoins || 0;
  const totalOrbsSpent = profile.orbsSpent || 0;

  // Filter list
  const filteredAchievements = ACHIEVEMENTS.filter(achievement => {
    const currentVal = getAchievementProgress(achievement, profile);
    const isCompleted = currentVal >= achievement.target;
    const isClaimed = claimedList.includes(achievement.id);

    if (activeTab === 'completed') {
      return isCompleted && !isClaimed;
    }
    if (activeTab === 'pending') {
      return !isCompleted;
    }
    if (activeTab === 'claimed') {
      return isClaimed;
    }
    return true; // 'all'
  });

  const getUnclaimedCount = () => {
    return ACHIEVEMENTS.filter(achievement => {
      const currentVal = getAchievementProgress(achievement, profile);
      const isCompleted = currentVal >= achievement.target;
      const isClaimed = claimedList.includes(achievement.id);
      return isCompleted && !isClaimed;
    }).length;
  };

  const unclaimedCount = getUnclaimedCount();

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 text-white">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="w-full max-w-2xl bg-slate-900 border-[4px] border-slate-800 rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl relative"
      >
        {/* CLOSE BUTTON */}
        <button 
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-1.5 rounded-full cursor-pointer transition border border-slate-700/60 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-cyan-900/60 to-blue-900/60 p-5 border-b border-slate-800 relative">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/10 p-2.5 rounded-2xl border border-cyan-500/30">
              <Award className="w-7 h-7 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                Logros y Hitos
              </h2>
              <p className="text-[10px] sm:text-xs text-cyan-200/70 font-mono uppercase tracking-widest">
                Geometry Block Challenge System
              </p>
            </div>
          </div>
        </div>

        {/* STATS HERO PANEL */}
        <div className="bg-slate-950 p-4 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
          <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800/60">
            <div className="text-[9px] text-slate-400 uppercase">Muertes</div>
            <div className="text-sm font-black text-rose-400">{totalDeaths}</div>
          </div>
          <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800/60">
            <div className="text-[9px] text-slate-400 uppercase">Creados</div>
            <div className="text-sm font-black text-amber-400">{totalLevelsCreated}</div>
          </div>
          <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800/60">
            <div className="text-[9px] text-slate-400 uppercase">Superados</div>
            <div className="text-sm font-black text-emerald-400">{totalCompleted}</div>
          </div>
          <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800/60">
            <div className="text-[9px] text-slate-400 uppercase">Monedas</div>
            <div className="text-sm font-black text-yellow-400">{totalCoins}</div>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="bg-slate-900 px-4 py-3 flex gap-2 overflow-x-auto border-b border-slate-800 shrink-0">
          {(['all', 'completed', 'pending', 'claimed'] as const).map(tab => {
            const isSelected = activeTab === tab;
            let label = 'Todos';
            if (tab === 'completed') label = `Listos (${unclaimedCount})`;
            if (tab === 'pending') label = 'En Progreso';
            if (tab === 'claimed') label = 'Reclamados';

            return (
              <button
                key={tab}
                onClick={() => {
                  audio.playClick();
                  setActiveTab(tab);
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer shrink-0 border select-none ${
                  isSelected 
                    ? 'bg-gradient-to-b from-cyan-400 to-cyan-600 text-black border-black font-extrabold shadow-sm' 
                    : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 border-transparent'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ACHIEVEMENT LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/40">
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-mono">
              <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30 text-cyan-400" />
              <p className="text-xs uppercase tracking-wider">No hay logros en esta categoría</p>
            </div>
          ) : (
            filteredAchievements.map(achievement => {
              const currentVal = getAchievementProgress(achievement, profile);
              const progressPct = Math.min(100, Math.floor((currentVal / achievement.target) * 100));
              const isCompleted = currentVal >= achievement.target;
              const isClaimed = claimedList.includes(achievement.id);

              return (
                <div 
                  key={achievement.id}
                  className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
                    isClaimed 
                      ? 'bg-slate-950/40 border-slate-800/50 opacity-75' 
                      : isCompleted 
                        ? 'bg-cyan-950/30 border-cyan-500/40 shadow-md shadow-cyan-500/5 animate-pulse-slow' 
                        : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  {/* ICON AREA */}
                  <div className={`p-3 rounded-xl shrink-0 border relative ${
                    isClaimed 
                      ? 'bg-slate-900 border-slate-800 text-slate-500' 
                      : isCompleted 
                        ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/40' 
                        : 'bg-slate-950 text-slate-400 border-slate-800/80'
                  }`}>
                    <IconComponent name={achievement.iconName} className="w-5 h-5" />
                    
                    {isClaimed && (
                      <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-black rounded-full p-0.5 border border-slate-900">
                        <Check className="w-2.5 h-2.5 stroke-[4]" />
                      </div>
                    )}
                  </div>

                  {/* DETAILS MIDDLE */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                      <h4 className={`text-xs sm:text-sm font-bold uppercase truncate tracking-wide ${
                        isClaimed ? 'text-slate-400 line-through' : 'text-white'
                      }`}>
                        {achievement.title}
                      </h4>
                      <span className="font-mono text-[9px] text-slate-400 whitespace-nowrap">
                        {currentVal} / {achievement.target}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mb-2 pr-2">
                      {achievement.desc}
                    </p>

                    {/* PROGRESS BAR */}
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/40">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isClaimed 
                            ? 'bg-slate-600' 
                            : isCompleted 
                              ? 'bg-gradient-to-r from-cyan-400 to-blue-500' 
                              : 'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* ACTION BUTTON RIGHT */}
                  <div className="shrink-0 text-right">
                    {isClaimed ? (
                      <div className="text-[9px] font-mono font-bold uppercase text-emerald-500 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-900/30 select-none">
                        Reclamado
                      </div>
                    ) : isCompleted ? (
                      <button
                        onClick={() => {
                          audio.playCoinCollect();
                          onClaimAchievement(achievement.id, achievement.reward);
                        }}
                        className="px-3 py-2 bg-gradient-to-b from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black border border-black rounded-xl font-black text-[9.5px] uppercase tracking-wider transition cursor-pointer hover:scale-105 active:scale-95 shadow-[0_2px_0_#000]"
                      >
                        RECLAMAR +{achievement.reward} 💠
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-0.5 text-slate-500 text-[10px] font-mono">
                        <Lock className="w-3.5 h-3.5 text-slate-600" />
                        <span>+{achievement.reward} 💠</span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0 font-mono text-[10px]">
          <div className="flex items-center gap-1 text-cyan-400">
            <span>Tus Diamantes:</span>
            <span className="font-bold text-sm text-cyan-300 ml-1">💠 {profile.diamonds}</span>
          </div>
          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg uppercase tracking-wider cursor-pointer transition text-[9px] font-bold border border-slate-700/50"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
