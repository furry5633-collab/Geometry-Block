/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  target: number;
  reward: number;
  type: 
    | 'deaths' 
    | 'created_levels' 
    | 'completed_levels' 
    | 'xp' 
    | 'uploaded_levels' 
    | 'coins' 
    | 'orbs_spent';
  iconName: 'Skull' | 'Wrench' | 'Trophy' | 'Award' | 'Globe' | 'Star' | 'ShoppingCart';
}

export const ACHIEVEMENTS: Achievement[] = [
  // DEATHS
  {
    id: 'deaths_1',
    title: 'Primeros Tropiezos',
    desc: 'Choca y muere 5 veces intentando superar niveles',
    target: 5,
    reward: 5,
    type: 'deaths',
    iconName: 'Skull'
  },
  {
    id: 'deaths_2',
    title: 'Cuestión de Práctica',
    desc: 'Choca y muere 25 veces en total',
    target: 25,
    reward: 15,
    type: 'deaths',
    iconName: 'Skull'
  },
  {
    id: 'deaths_3',
    title: 'Obstinado Profesional',
    desc: 'Choca y muere 100 veces',
    target: 100,
    reward: 40,
    type: 'deaths',
    iconName: 'Skull'
  },
  {
    id: 'deaths_4',
    title: '¡El Rey del Choque!',
    desc: 'Choca y muere 300 veces (¡la constancia es la clave!)',
    target: 300,
    reward: 100,
    type: 'deaths',
    iconName: 'Skull'
  },

  // CREATED LEVELS
  {
    id: 'created_1',
    title: 'Aprendiz de Arquitecto',
    desc: 'Crea tu primer nivel personalizado en el Editor',
    target: 1,
    reward: 10,
    type: 'created_levels',
    iconName: 'Wrench'
  },
  {
    id: 'created_2',
    title: 'Diseñador de Desafíos',
    desc: 'Crea 5 niveles personalizados',
    target: 5,
    reward: 30,
    type: 'created_levels',
    iconName: 'Wrench'
  },
  {
    id: 'created_3',
    title: 'Mente Maestra',
    desc: 'Crea 10 niveles personalizados',
    target: 10,
    reward: 75,
    type: 'created_levels',
    iconName: 'Wrench'
  },

  // COMPLETED LEVELS
  {
    id: 'completed_1',
    title: 'Primer Paso',
    desc: 'Completa cualquier nivel al 100%',
    target: 1,
    reward: 15,
    type: 'completed_levels',
    iconName: 'Trophy'
  },
  {
    id: 'completed_2',
    title: 'Dominación Geométrica',
    desc: 'Supera 5 niveles diferentes al 100%',
    target: 5,
    reward: 40,
    type: 'completed_levels',
    iconName: 'Trophy'
  },
  {
    id: 'completed_3',
    title: 'Leyenda Viviente',
    desc: 'Supera 12 niveles diferentes al 100%',
    target: 12,
    reward: 100,
    type: 'completed_levels',
    iconName: 'Trophy'
  },

  // USER XP
  {
    id: 'xp_1',
    title: 'Ascenso Inicial',
    desc: 'Acumula un total de 500 XP jugando',
    target: 500,
    reward: 10,
    type: 'xp',
    iconName: 'Award'
  },
  {
    id: 'xp_2',
    title: 'Poder Acumulado',
    desc: 'Acumula un total de 2000 XP jugando',
    target: 2000,
    reward: 35,
    type: 'xp',
    iconName: 'Award'
  },
  {
    id: 'xp_3',
    title: 'Gran Maestro del Bloque',
    desc: 'Llega a 6000 XP de jugador',
    target: 6000,
    reward: 90,
    type: 'xp',
    iconName: 'Award'
  },

  // UPLOADED LEVELS
  {
    id: 'uploaded_1',
    title: 'Creador Público',
    desc: 'Sube 1 de tus niveles a los servidores online',
    target: 1,
    reward: 20,
    type: 'uploaded_levels',
    iconName: 'Globe'
  },
  {
    id: 'uploaded_2',
    title: 'Fama Global',
    desc: 'Comparte 3 niveles en los servidores online',
    target: 3,
    reward: 50,
    type: 'uploaded_levels',
    iconName: 'Globe'
  },

  // COINS COLLECTED
  {
    id: 'coins_1',
    title: 'Buscador de Tesoros',
    desc: 'Recolecta 1 moneda secreta dorada',
    target: 1,
    reward: 10,
    type: 'coins',
    iconName: 'Star'
  },
  {
    id: 'coins_2',
    title: 'Acaparador de Oro',
    desc: 'Recolecta 5 monedas secretas doradas',
    target: 5,
    reward: 35,
    type: 'coins',
    iconName: 'Star'
  },
  {
    id: 'coins_3',
    title: 'Soberano de la Fortuna',
    desc: 'Recolecta 12 monedas secretas doradas',
    target: 12,
    reward: 80,
    type: 'coins',
    iconName: 'Star'
  },

  // ORBS SPENT
  {
    id: 'spent_1',
    title: 'Estilo Propio',
    desc: 'Gasta 100 orbes en la tienda desbloqueando skins',
    target: 100,
    reward: 15,
    type: 'orbs_spent',
    iconName: 'ShoppingCart'
  },
  {
    id: 'spent_2',
    title: 'Coleccionista Obsesivo',
    desc: 'Gasta 500 orbes en la tienda desbloqueando skins',
    target: 500,
    reward: 50,
    type: 'orbs_spent',
    iconName: 'ShoppingCart'
  }
];

export function getAchievementProgress(achievement: Achievement, profile: any): number {
  if (!profile) return 0;
  
  switch (achievement.type) {
    case 'deaths':
      return profile.totalDeaths || 0;
    case 'created_levels':
      return profile.totalLevelsCreated || 0;
    case 'completed_levels':
      return profile.completedCount || 0;
    case 'xp':
      return profile.xp || 0;
    case 'uploaded_levels':
      return profile.totalLevelsUploaded || 0;
    case 'coins':
      return profile.totalCoins || 0;
    case 'orbs_spent':
      return profile.orbsSpent || 0;
    default:
      return 0;
  }
}
