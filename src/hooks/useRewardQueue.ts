import { create } from 'zustand';

interface Reward {
  type: 'item' | 'hint';
  title: string;
  description: string;
  icon?: string;
}

interface RewardQueueState {
  queue: Reward[];
  currentReward: Reward | null;
  addReward: (reward: Reward) => void;
  showNext: () => void;
  clear: () => void;
}

export const useRewardQueue = create<RewardQueueState>((set, get) => ({
  queue: [],
  currentReward: null,
  
  addReward: (reward) => {
    const state = get();
    if (state.currentReward === null) {
      // Si aucune récompense n'est affichée, l'afficher immédiatement
      set({ currentReward: reward });
    } else {
      // Sinon, l'ajouter à la file d'attente
      set({ queue: [...state.queue, reward] });
    }
  },
  
  showNext: () => {
    const state = get();
    if (state.queue.length > 0) {
      const [nextReward, ...restQueue] = state.queue;
      set({ currentReward: nextReward, queue: restQueue });
    } else {
      set({ currentReward: null });
    }
  },
  
  clear: () => {
    set({ queue: [], currentReward: null });
  },
}));
