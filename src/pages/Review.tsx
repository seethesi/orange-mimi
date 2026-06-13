import { useState, useEffect } from 'react';
import { useReviewStore, getWeekStart } from '@/stores/reviewStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// 极简小周历：月历按周高亮，点击直接跳转该周
function MiniWeekCalendar({
  currentWeekStart,
  onSelectWeek,
}: {
  currentWeekStart: string;
  onSelectWeek: (weekStart: string) => void;
}) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const thisWeekStart = getWeekStart();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const monthLabel = `${viewYear}年${viewMonth + 1}月`;

  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  const weeks: { date: string; day: number; isCurrentMonth: boolean }[][] = [];
  let currentWeek: { date: string; day: number; isCurrentMonth: boolean }[] = [];

  for (let i = 0; i < startWeekday; i++) {
    const d = new Date(viewYear, viewMonth, 1 - startWeekday + i);
    currentWeek.push({ date: d.toISOString().split('T')[0], day: d.getDate(), isCurrentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(viewYear, viewMonth, day);
    currentWeek.push({ date: d.toISOString().split('T')[0], day, isCurrentMonth: true });
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      const d = new Date(viewYear, viewMonth + 1, currentWeek.length + 1);
      currentWeek.push({ date: d.toISOString().split('T')[0], day: d.getDate(), isCurrentMonth: false });
    }
    weeks.push(currentWeek);
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  return (
    <div className="bg-white border border-[#E8DDD0] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-[#FAF2E8] transition-colors">
          <ChevronLeft className="w-4 h-4 text-[#A89882]" />
        </button>
        <span className="text-xs font-medium text-[#3D3228]">{monthLabel}</span>
        <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-[#FAF2E8] transition-colors">
          <ChevronRight className="w-4 h-4 text-[#A89882]" />
        </button>
      </div>

      {/* 周头 */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['一', '二', '三', '四', '五', '六', '日'].map((d) => (
          <div key={d} className="text-center text-[9px] text-[#C4B8A6] py-1">{d}</div>
        ))}
      </div>

      {/* 日期格子 - 按周高亮 */}
      {weeks.map((week, wi) => {
        const weekStart = week[0].date;
        const isSelected = weekStart === currentWeekStart;
        const isCurrentWeek = weekStart === thisWeekStart;
        const hasToday = week.some((d) => d.date === todayStr);

        return (
          <div
            key={wi}
            className="grid grid-cols-7 gap-0.5 cursor-pointer"
            onClick={() => onSelectWeek(weekStart)}
          >
            {week.map((day, di) => (
              <div
                key={di}
                className={`text-center text-[10px] py-1.5 rounded-md transition-all duration-200 ${
                  isSelected && day.isCurrentMonth
                    ? 'bg-[#F97316] text-white font-medium'
                    : hasToday && day.date === todayStr
                    ? 'bg-[#F97316]/10 text-[#F97316] font-medium'
                    : isCurrentWeek && day.isCurrentMonth
                    ? 'bg-[#FDF6EE] text-[#3D3228]'
                    : day.isCurrentMonth
                    ? 'text-[#5C4F3D] hover:bg-[#FAF2E8]'
                    : 'text-[#D4CBBE]'
                }`}
              >
                {day.day}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default function Review() {
  const { reviews, saveReview, getWeekReview, calculateWeekStats } = useReviewStore();
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart());
  const [bestDay, setBestDay] = useState('');
  const [bestDayNote, setBestDayNote] = useState('');
  const [worstDay, setWorstDay] = useState('');
  const [worstDayNote, setWorstDayNote] = useState('');
  const [summary, setSummary] = useState('');

  useEffect(() => {
    const existing = getWeekReview(currentWeekStart);
    if (existing) {
      setBestDay(existing.bestDay || '');
      setBestDayNote(existing.bestDayNote || '');
      setWorstDay(existing.worstDay || '');
      setWorstDayNote(existing.worstDayNote || '');
      setSummary(existing.summary || '');
    } else {
      setBestDay('');
      setBestDayNote('');
      setWorstDay('');
      setWorstDayNote('');
      setSummary('');
    }
  }, [currentWeekStart, getWeekReview]);

  const stats = calculateWeekStats(currentWeekStart);

  const handleSave = () => {
    saveReview({
      weekStart: currentWeekStart,
      averageEnergy: stats.averageEnergy,
      energyTrend: stats.energyTrend,
      categoryDistribution: stats.categoryDistribution,
      energyDistribution: stats.energyDistribution,
      bestDay: bestDay || undefined,
      bestDayNote: bestDayNote || undefined,
      worstDay: worstDay || undefined,
      worstDayNote: worstDayNote || undefined,
      summary: summary || undefined,
    });
  };

  const weekLabel = (() => {
    const start = new Date(currentWeekStart);
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`;
  })();

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 md:py-12">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#3D3228]">周复盘</h1>
        <p className="text-sm text-[#F97316] mt-1 font-medium">{weekLabel}</p>
      </div>

      {/* 极简周历 */}
      <div className="mb-8">
        <MiniWeekCalendar
          currentWeekStart={currentWeekStart}
          onSelectWeek={setCurrentWeekStart}
        />
      </div>

      {/* 自动汇总 */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-white border border-[#E8DDD0] rounded-xl p-4">
          <p className="text-[10px] text-[#A89882] mb-2">本周平均能量</p>
          <p className="text-2xl font-light text-[#3D3228]">
            {stats.averageEnergy > 0 ? stats.averageEnergy.toFixed(1) : '—'}
            <span className="text-xs text-[#A89882] ml-1">/10</span>
          </p>
        </div>

        <div className="bg-white border border-[#E8DDD0] rounded-xl p-4">
          <p className="text-[10px] text-[#A89882] mb-2">能量趋势</p>
          <p className="text-2xl font-light text-[#3D3228]">
            {stats.energyTrend !== 0 ? (
              <>
                {stats.energyTrend > 0 ? '+' : ''}
                {stats.energyTrend.toFixed(1)}
              </>
            ) : (
              '—'
            )}
          </p>
        </div>

        <div className="bg-white border border-[#E8DDD0] rounded-xl p-4">
          <p className="text-[10px] text-[#A89882] mb-2">任务分类</p>
          {Object.keys(stats.categoryDistribution).length > 0 ? (
            <div className="space-y-1">
              {Object.entries(stats.categoryDistribution).map(([k, v]) => (
                <p key={k} className="text-xs text-[#5C4F3D]">{k}: {v}</p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#C4B8A6]">暂无数据</p>
          )}
        </div>

        <div className="bg-white border border-[#E8DDD0] rounded-xl p-4">
          <p className="text-[10px] text-[#A89882] mb-2">耗能等级</p>
          {Object.keys(stats.energyDistribution).length > 0 ? (
            <div className="space-y-1">
              {Object.entries(stats.energyDistribution).map(([k, v]) => (
                <p key={k} className="text-xs text-[#5C4F3D]">
                  {k === '充电' ? '🟢' : k === '普通' ? '⚪' : '🔴'} {k}: {v}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#C4B8A6]">暂无数据</p>
          )}
        </div>
      </div>

      {/* 手动感受 */}
      <div className="space-y-4">
        <p className="text-xs text-[#A89882]">手动感受</p>

        <div className="bg-white border border-[#E8DDD0] rounded-xl p-4">
          <p className="text-xs text-[#5C4F3D] mb-2">本周最好的一天是哪天？</p>
          <div className="flex gap-1.5 mb-2">
            {weekDays.map((d) => (
              <button
                key={d}
                onClick={() => setBestDay(`周${d}`)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] border transition-all duration-200 ${
                  bestDay === `周${d}`
                    ? 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30 font-medium'
                    : 'bg-[#FAF2E8] text-[#8B7E6F] border-[#E8DDD0] hover:border-[#D4C5B0]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={bestDayNote}
            onChange={(e) => setBestDayNote(e.target.value)}
            placeholder="发生了什么？"
            className="w-full bg-[#FAF2E8] border border-[#E8DDD0] rounded-lg px-3 py-2 text-xs text-[#3D3228] placeholder-[#C4B8A6] focus:outline-none focus:border-[#F97316]/50 transition-colors"
          />
        </div>

        <div className="bg-white border border-[#E8DDD0] rounded-xl p-4">
          <p className="text-xs text-[#5C4F3D] mb-2">本周最消耗的一天是哪天？</p>
          <div className="flex gap-1.5 mb-2">
            {weekDays.map((d) => (
              <button
                key={d}
                onClick={() => setWorstDay(`周${d}`)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] border transition-all duration-200 ${
                  worstDay === `周${d}`
                    ? 'bg-red-50 text-red-400 border-red-200 font-medium'
                    : 'bg-[#FAF2E8] text-[#8B7E6F] border-[#E8DDD0] hover:border-[#D4C5B0]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={worstDayNote}
            onChange={(e) => setWorstDayNote(e.target.value)}
            placeholder="发生了什么？"
            className="w-full bg-[#FAF2E8] border border-[#E8DDD0] rounded-lg px-3 py-2 text-xs text-[#3D3228] placeholder-[#C4B8A6] focus:outline-none focus:border-[#F97316]/50 transition-colors"
          />
        </div>

        <div className="bg-white border border-[#E8DDD0] rounded-xl p-4">
          <p className="text-xs text-[#5C4F3D] mb-2">用一句话总结本周</p>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="..."
            className="w-full bg-[#FAF2E8] border border-[#E8DDD0] rounded-lg px-3 py-2 text-xs text-[#3D3228] placeholder-[#C4B8A6] focus:outline-none focus:border-[#F97316]/50 transition-colors resize-none h-16"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2.5 rounded-xl bg-[#F97316] text-white text-sm hover:bg-[#EA6C0A] transition-colors"
        >
          保存复盘
        </button>
      </div>
    </div>
  );
}
