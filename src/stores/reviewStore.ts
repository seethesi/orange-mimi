import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WeeklyReview } from '@/types';
import { useTaskStore } from './taskStore';
import { useEnergyStore } from './energyStore';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getWeekStart(date?: Date): string {
  const d = date || new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split('T')[0];
}

interface ReviewState {
  reviews: WeeklyReview[];
  saveReview: (review: Omit<WeeklyReview, 'id' | 'createdAt'>) => void;
  getWeekReview: (weekStart: string) => WeeklyReview | undefined;
  calculateWeekStats: (weekStart: string) => {
    averageEnergy: number;
    energyTrend: number;
    categoryDistribution: Record<string, number>;
    energyDistribution: Record<string, number>;
  };
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: [],

      saveReview: (reviewData) => {
        const existing = get().reviews.find((r) => r.weekStart === reviewData.weekStart);
        if (existing) {
          set({
            reviews: get().reviews.map((r) =>
              r.weekStart === reviewData.weekStart ? { ...r, ...reviewData } : r
            ),
          });
        } else {
          const review: WeeklyReview = {
            id: generateId(),
            ...reviewData,
            createdAt: Date.now(),
          };
          set({ reviews: [...get().reviews, review] });
        }
      },

      getWeekReview: (weekStart) => {
        return get().reviews.find((r) => r.weekStart === weekStart);
      },

      calculateWeekStats: (weekStart) => {
        const energyStore = useEnergyStore.getState();
        const taskStore = useTaskStore.getState();

        // 本周能量记录
        const weekEnergyRecords = energyStore.getWeekRecords(weekStart);
        const prevWeekEnergyRecords = energyStore.getPreviousWeekRecords(weekStart);

        // 本周平均能量
        const averageEnergy =
          weekEnergyRecords.length > 0
            ? weekEnergyRecords.reduce((sum, r) => sum + r.score, 0) / weekEnergyRecords.length
            : 0;

        // 上周平均能量
        const prevAverageEnergy =
          prevWeekEnergyRecords.length > 0
            ? prevWeekEnergyRecords.reduce((sum, r) => sum + r.score, 0) / prevWeekEnergyRecords.length
            : 0;

        const energyTrend = Math.round((averageEnergy - prevAverageEnergy) * 10) / 10;

        // 本周已完成的任务
        const weekEndDate = new Date(weekStart);
        weekEndDate.setDate(weekEndDate.getDate() + 7);
        const weekEndStr = weekEndDate.toISOString().split('T')[0];

        const weekTasks = taskStore.tasks.filter(
          (t) => t.completed && t.date >= weekStart && t.date < weekEndStr
        );

        // 任务分类分布
        const categoryDistribution: Record<string, number> = {};
        weekTasks.forEach((t) => {
          const label = t.category === 'survival' ? '生存' : t.category === 'creation' ? '创作' : '恢复';
          categoryDistribution[label] = (categoryDistribution[label] || 0) + 1;
        });

        // 耗能等级分布
        const energyDistribution: Record<string, number> = {};
        weekTasks.forEach((t) => {
          const label = t.energyLevel === 'charge' ? '充电' : t.energyLevel === 'normal' ? '普通' : '消耗';
          energyDistribution[label] = (energyDistribution[label] || 0) + 1;
        });

        return { averageEnergy, energyTrend, categoryDistribution, energyDistribution };
      },
    }),
    { name: 'orange-mimi-review' }
  )
);

export { getWeekStart };
