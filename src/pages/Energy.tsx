import { useState } from 'react';
import { useEnergyStore } from '@/stores/energyStore';
import { toLocalDate } from '@/lib/dateUtils';
import type { TimeSlot } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

const scoreGuide: Record<number, string> = {
  1: '身体非常沉重，睁眼费力，不想动',
  2: '身体沉重，勉强能坐起来，思维模糊',
  3: '明显疲惫，能做简单的事（吃饭洗漱），复杂的事做不了',
  4: '说不上累也不轻松，能做事但容易走神',
  5: '感觉正常，没有明显疲惫也没有明显充沛',
  6: '感觉还不错，做事比较顺畅，偶尔有动力',
  7: '明显有劲，思维清晰，有动力做事',
  8: '很轻盈，思维活跃，想做事情',
  9: '充满能量，思维极其清晰，感觉什么都能做',
  10: '完全满电，内心平静又兴奋，强烈生命力',
};

const timeSlots: { value: TimeSlot; label: string; time: string }[] = [
  { value: 'morning', label: '起床能量', time: '起床后1小时' },
  { value: 'afternoon', label: '下午能量', time: '14:00' },
  { value: 'evening', label: '晚间能量', time: '20:00' },
];

function EnergySlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1"
      />
      <span className="text-3xl font-light text-[#F97316] w-8 text-right">{value}</span>
    </div>
  );
}

export default function Energy() {
  const { records, recordEnergy, getTodayRecord } = useEnergyStore();
  const [scores, setScores] = useState<Record<TimeSlot, number>>({
    morning: getTodayRecord('morning')?.score || 5,
    afternoon: getTodayRecord('afternoon')?.score || 5,
    evening: getTodayRecord('evening')?.score || 5,
  });
  const [showGuide, setShowGuide] = useState(false);

  const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

  const handleSave = (slot: TimeSlot) => {
    recordEnergy(slot, scores[slot]);
  };

  // 获取最近7天的能量数据
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return toLocalDate(d);
  });

  const weekRecords = last7Days.map((date) => {
    const dayRecords = records.filter((r) => r.date === date);
    return {
      date,
      morning: dayRecords.find((r) => r.timeSlot === 'morning')?.score,
      afternoon: dayRecords.find((r) => r.timeSlot === 'afternoon')?.score,
      evening: dayRecords.find((r) => r.timeSlot === 'evening')?.score,
    };
  });

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 md:py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#3D3228]">能量</h1>
            <p className="text-sm text-[#A89882] mt-1">{today}</p>
          </div>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1 text-xs text-[#A89882] hover:text-[#F97316] transition-colors"
          >
            评分标准
            {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 评分标准 */}
        {showGuide && (
          <div className="mt-4 bg-white border border-[#E8DDD0] rounded-xl p-4 space-y-1.5">
            {Object.entries(scoreGuide).map(([score, desc]) => (
              <div key={score} className="flex gap-2 text-xs">
                <span className="w-5 text-[#F97316] font-medium text-right flex-shrink-0">{score}</span>
                <span className="text-[#8B7E6F]">{desc}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 今日能量记录 */}
      <div className="space-y-4">
        {timeSlots.map((slot) => {
          const existing = getTodayRecord(slot.value);
          return (
            <div
              key={slot.value}
              className="bg-white border border-[#E8DDD0] rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-[#3D3228]">{slot.label}</p>
                  <p className="text-[10px] text-[#A89882] mt-0.5">{slot.time}</p>
                </div>
                {existing && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-200">
                    已记录
                  </span>
                )}
              </div>
              <EnergySlider
                value={scores[slot.value]}
                onChange={(v) =>
                  setScores((prev) => ({ ...prev, [slot.value]: v }))
                }
              />
              <button
                onClick={() => handleSave(slot.value)}
                className="mt-3 w-full py-2 rounded-lg bg-[#F97316]/10 text-[#F97316] text-xs hover:bg-[#F97316]/20 transition-colors"
              >
                {existing ? '更新' : '记录'}
              </button>
            </div>
          );
        })}
      </div>

      {/* 近7天概览 */}
      <div className="mt-10">
        <p className="text-xs text-[#A89882] mb-4">近7天</p>
        <div className="flex gap-1.5">
          {weekRecords.map((day) => {
            const dayLabel = new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'narrow' });
            const allScores = [day.morning, day.afternoon, day.evening].filter(
              (s) => s !== undefined
            ) as number[];
            const avg = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;
            const height = avg > 0 ? Math.max(8, (avg / 10) * 60) : 4;

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-sm transition-all duration-300"
                  style={{
                    height: `${height}px`,
                    backgroundColor: avg > 0
                      ? `rgba(249, 115, 22, ${0.15 + (avg / 10) * 0.55})`
                      : '#E8DDD0',
                  }}
                />
                <span className="text-[9px] text-[#A89882]">{dayLabel}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
