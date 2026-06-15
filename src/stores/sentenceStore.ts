import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailySentence } from '@/types';

import { toLocalDate } from '@/lib/dateUtils';

function getToday(): string {
  return toLocalDate(new Date());
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface SentenceState {
  sentences: DailySentence[];
  saveSentence: (content: string) => void;
  getTodaySentence: () => DailySentence | undefined;
}

export const useSentenceStore = create<SentenceState>()(
  persist(
    (set, get) => ({
      sentences: [],

      saveSentence: (content) => {
        const today = getToday();
        const existing = get().sentences.find((s) => s.date === today);
        if (existing) {
          set({
            sentences: get().sentences.map((s) =>
              s.id === existing.id ? { ...s, content } : s
            ),
          });
        } else {
          const sentence: DailySentence = {
            id: generateId(),
            date: today,
            content,
            createdAt: Date.now(),
          };
          set({ sentences: [...get().sentences, sentence] });
        }
      },

      getTodaySentence: () => {
        const today = getToday();
        return get().sentences.find((s) => s.date === today);
      },
    }),
    { name: 'orange-mimi-sentence' }
  )
);
