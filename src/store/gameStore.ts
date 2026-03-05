import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AvatarConfig {
  skin: string;
  hair: string;
  hair_style?: string;
  eyes: string;
  mouth: string;
  outfit: string;
  accessory: string;
  bg: string;
  name: string;
}

export interface Building {
  id: string;
  type: string;
  x: number;
  y: number;
  level: number;
}

export interface ModuleProgress {
  [moduleId: string]: {
    [sectionId: string]: {
      completed: boolean;
      score: number;
      bestScore: number;
    };
  };
}

export interface DailyTask {
  id: string;
  date: string;
  completed: boolean;
  reward: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface GameState {
  isRegistered: boolean;
  avatar: AvatarConfig;
  coins: number;
  xp: number;
  level: number;
  streak: number;
  lastPlayDate: string;
  moduleProgress: ModuleProgress;
  buildings: Building[];
  dailyTasksCompleted: string[];
  lastDailyReset: string;

  register: (name: string, avatar: AvatarConfig) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addXp: (amount: number) => void;
  completeSection: (moduleId: string, sectionId: string, score: number) => void;
  addBuilding: (building: Building) => void;
  removeBuilding: (id: string) => void;
  updateBuildingPosition: (id: string, x: number, y: number) => void;
  upgradeBuilding: (id: string) => void;
  markDailyCompleted: (taskId: string) => void;
  updateAvatar: (avatar: AvatarConfig) => void;
  updateStreak: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      isRegistered: false,
      avatar: {
        skin: 'light',
        hair: 'black',
        hair_style: 'short',
        eyes: 'normal',
        mouth: '😊',
        outfit: 'casual',
        accessory: 'none',
        bg: '#6366f1',
        name: '',
      },
      coins: 0,
      xp: 0,
      level: 1,
      streak: 0,
      lastPlayDate: '',
      moduleProgress: {},
      buildings: [],
      dailyTasksCompleted: [],
      lastDailyReset: '',

      register: (name, avatar) => set({ isRegistered: true, avatar: { ...avatar, name }, coins: 100 }),
      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),
      spendCoins: (amount) => {
        const s = get();
        if (s.coins >= amount) { set({ coins: s.coins - amount }); return true; }
        return false;
      },
      addXp: (amount) => set((s) => {
        const newXp = s.xp + amount;
        const newLevel = Math.floor(newXp / 500) + 1;
        return { xp: newXp, level: newLevel };
      }),
      completeSection: (moduleId, sectionId, score) => set((s) => {
        const prev = s.moduleProgress[moduleId]?.[sectionId];
        const best = prev ? Math.max(prev.bestScore, score) : score;
        return {
          moduleProgress: {
            ...s.moduleProgress,
            [moduleId]: {
              ...s.moduleProgress[moduleId],
              [sectionId]: { completed: score >= 60, score, bestScore: best },
            },
          },
        };
      }),
      addBuilding: (building) => set((s) => ({ buildings: [...s.buildings, building] })),
      removeBuilding: (id) => set((s) => ({ buildings: s.buildings.filter((b) => b.id !== id) })),
      updateBuildingPosition: (id, x, y) => set((s) => ({
        buildings: s.buildings.map((b) => b.id === id ? { ...b, x, y } : b),
      })),
      upgradeBuilding: (id) => set((s) => ({
        buildings: s.buildings.map((b) => b.id === id ? { ...b, level: b.level + 1 } : b),
      })),
      markDailyCompleted: (taskId) => set((s) => ({
        dailyTasksCompleted: [...s.dailyTasksCompleted, taskId],
      })),
      updateAvatar: (avatar) => set({ avatar }),
      updateStreak: () => set((s) => {
        const today = new Date().toDateString();
        const last = s.lastPlayDate;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (last === today) return {};
        const streak = last === yesterday ? s.streak + 1 : 1;
        return { streak, lastPlayDate: today };
      }),
    }),
    { name: 'ege-arena-storage' }
  )
);
