import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EnergyRecord, TimeSlot } from '@/types';

import { toLocalDate } from '@/lib/dateUtils';

function getToday(): string {
  return toLocalDate(new Date());
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface EnergyState {
  records: EnergyRecord[];
  recordEnergy: (timeSlot: TimeSlot, score: number) => void;
  getTodayRecord: (timeSlot: TimeSlot) => EnergyRecord | undefined;
  getWeekRecords: (weekStart: string) => EnergyRecord[];
  getPreviousWeekRecords: (weekStart: string) => EnergyRecord[];
}

export const useEnergyStore = create<EnergyState>()(
  persist(
    (set, get) => ({
      records: [],

      recordEnergy: (timeSlot, score) => {
        const today = getToday();
        const existing = get().records.find(
          (r) => r.date === today && r.timeSlot === timeSlot
        );
        if (existing) {
          set({
            records: get().records.map((r) =>
              r.id === existing.id ? { ...r, score } : r
            ),
          });
        } else {
          const record: EnergyRecord = {
            id: generateId(),
            date: today,
            timeSlot,
            score,
            createdAt: Date.now(),
          };
          set({ records: [...get().records, record] });
        }
      },

      getTodayRecord: (timeSlot) => {
        const today = getToday();
        return get().records.find(
          (r) => r.date === today && r.timeSlot === timeSlot
        );
      },

      getWeekRecords: (weekStart) => {
        const start = new Date(weekStart);
        const end = new Date(weekStart);
        end.setDate(end.getDate() + 7);
        const startStr = weekStart;
        const endStr = toLocalDate(end);
        return get().records.filter((r) => r.date >= startStr && r.date < endStr);
      },

      getPreviousWeekRecords: (weekStart) => {
        const prevStart = new Date(weekStart);
        prevStart.setDate(prevStart.getDate() - 7);
        const prevStartStr = toLocalDate(prevStart);
        return get().getWeekRecords(prevStartStr);
      },
    }),
    { name: 'orange-mimi-energy' }
  )
);
