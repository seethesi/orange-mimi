// 每日任务
export interface DailyTask {
  id: string;
  name: string;
  energyLevel?: 'charge' | 'normal' | 'drain'; // 完成时选择
  category: 'survival' | 'creation' | 'recovery';
  durationMinutes?: number;
  note?: string; // 完成时可选心得
  completed: boolean;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

// 进行中事项
export interface OngoingItem {
  id: string;
  name: string;
  category?: 'survival' | 'creation' | 'recovery'; // 可预设分类
  completed: boolean;
  completedAt?: number;
  createdAt: number;
}

// 能量记录
export interface EnergyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  timeSlot: 'morning' | 'afternoon' | 'evening';
  score: number; // 1-10
  createdAt: number;
}

// 每日一句话
export interface DailySentence {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  createdAt: number;
}

// 周复盘
export interface WeeklyReview {
  id: string;
  weekStart: string; // YYYY-MM-DD
  averageEnergy?: number;
  energyTrend?: number;
  categoryDistribution?: Record<string, number>;
  energyDistribution?: Record<string, number>;
  bestDay?: string;
  bestDayNote?: string;
  worstDay?: string;
  worstDayNote?: string;
  summary?: string;
  createdAt: number;
}

export type EnergyLevel = NonNullable<DailyTask['energyLevel']>;
export type TaskCategory = DailyTask['category'];
export type TimeSlot = EnergyRecord['timeSlot'];
