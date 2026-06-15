import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyTask, EnergyLevel, TaskCategory } from '@/types';

import { toLocalDate } from '@/lib/dateUtils';

function getToday(): string {
  return toLocalDate(new Date());
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface TaskState {
  tasks: DailyTask[];
  addTask: (name: string, category: TaskCategory) => void;
  updateTask: (id: string, updates: Partial<Pick<DailyTask, 'name' | 'category'>>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string, energyLevel: EnergyLevel, durationMinutes: number, note?: string) => void;
  uncompleteTask: (id: string) => void;
  cleanup: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (name, category) => {
        const task: DailyTask = {
          id: generateId(),
          name,
          category,
          completed: false,
          date: getToday(),
          createdAt: Date.now(),
        };
        set({ tasks: [...get().tasks, task] });
      },

      updateTask: (id, updates) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        });
      },

      deleteTask: (id) => {
        set({ tasks: get().tasks.filter((t) => t.id !== id) });
      },

      completeTask: (id, energyLevel, durationMinutes, note) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === id ? { ...t, completed: true, energyLevel, durationMinutes, note } : t
          ),
        });
      },

      uncompleteTask: (id) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === id ? { ...t, completed: false, energyLevel: undefined, durationMinutes: undefined, note: undefined } : t
          ),
        });
      },

      cleanup: () => {
        const today = getToday();
        // 只清理未完成的非今日任务，已完成的保留给统计
        set({
          tasks: get().tasks.filter((t) => {
            if (!t.completed && t.date !== today) return false;
            return true;
          }),
        });
      },
    }),
    { name: 'orange-mimi-tasks' }
  )
);
