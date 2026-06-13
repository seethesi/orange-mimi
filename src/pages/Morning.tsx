import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnergyStore } from '@/stores/energyStore';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

const morningTips = [
  '闭眼感受呼吸3次',
  '伸个大大的懒腰',
  '摸摸咪咪',
  '感受一下床品的质感',
  '想一件今天期待的小事',
];

export default function Morning() {
  const navigate = useNavigate();
  const { recordEnergy, getTodayRecord } = useEnergyStore();
  const [score, setScore] = useState(getTodayRecord('morning')?.score || 5);
  const [showTips, setShowTips] = useState(false);
  const [saved, setSaved] = useState(!!getTodayRecord('morning'));

  const handleSave = () => {
    recordEnergy('morning', score);
    setSaved(true);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';

  return (
    <div className="min-h-screen bg-[#FDF6EE] text-[#3D3228] flex flex-col items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        {/* 问候 */}
        <p className="text-4xl mb-2">🐱</p>
        <h1 className="text-2xl font-light text-[#3D3228] mb-8">{greeting}</h1>

        {/* 能量评分 */}
        <div className="mb-8">
          <p className="text-sm text-[#A89882] mb-4">今天身体有多少电？</p>
          <div className="flex items-center gap-4 mb-3">
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={score}
              onChange={(e) => { setScore(Number(e.target.value)); setSaved(false); }}
              className="flex-1 accent-[#F97316]"
            />
            <span className="text-3xl font-light text-[#F97316] w-8 text-right">{score}</span>
          </div>
          <button
            onClick={handleSave}
            className={`text-xs px-4 py-1.5 rounded-full transition-all duration-200 ${
              saved
                ? 'bg-emerald-50 text-emerald-500'
                : 'bg-[#F97316]/10 text-[#F97316] hover:bg-[#F97316]/20'
            }`}
          >
            {saved ? '已记录' : '记录'}
          </button>
        </div>

        {/* 分隔线 */}
        <div className="border-t border-[#E8DDD0] my-6" />

        {/* 提示 - 默认折叠 */}
        <button
          onClick={() => setShowTips(!showTips)}
          className="flex items-center gap-1 text-xs text-[#A89882] hover:text-[#8B7E6F] transition-colors mx-auto"
        >
          🌅 起床前可以试试
          {showTips ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showTips && (
          <div className="mt-3 space-y-2">
            {morningTips.map((tip, i) => (
              <p key={i} className="text-xs text-[#A89882]">{tip}</p>
            ))}
          </div>
        )}

        {/* 进入今日 */}
        <div className="mt-10">
          <button
            onClick={() => navigate('/today')}
            className="inline-flex items-center gap-2 text-sm text-[#A89882] hover:text-[#F97316] transition-colors"
          >
            进入今日
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
