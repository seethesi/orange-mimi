import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OngoingItem, TaskCategory } from '@/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface OngoingState {
  items: OngoingItem[];
  addItem: (name: string, category?: TaskCategory) => void;
  updateItem: (id: string, updates: Partial<Pick<OngoingItem, 'name' | 'category'>>) => void;
  deleteItem: (id: string) => void;
  completeItem: (id: string) => void;
  uncompleteItem: (id: string) => void;
  cleanup: () => void;
}

export const useOngoingStore = create<OngoingState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (name, category) => {
        const item: OngoingItem = {
          id: generateId(),
          name,
          category,
          completed: false,
          createdAt: Date.now(),
        };
        set({ items: [...get().items, item] });
      },

      updateItem: (id, updates) => {
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        });
      },

      deleteItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      completeItem: (id) => {
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, completed: true, completedAt: Date.now() } : item
          ),
        });
      },

      uncompleteItem: (id) => {
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, completed: false, completedAt: undefined } : item
          ),
        });
      },

      cleanup: () => {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        set({
          items: get().items.filter((item) => {
            if (item.completed && item.completedAt && item.completedAt < thirtyDaysAgo) return false;
            return true;
          }),
        });
      },
    }),
    { name: 'orange-mimi-ongoing' }
  )
);
