import { useState, useEffect } from 'react';
import { useSentenceStore } from '@/stores/sentenceStore';

export default function Sentence() {
  const { saveSentence, getTodaySentence, sentences } = useSentenceStore();
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const todaySentence = getTodaySentence();
    if (todaySentence) {
      setContent(todaySentence.content);
      setSaved(true);
    }
  }, [getTodaySentence]);

  const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
  const hour = new Date().getHours();
  const isEvening = hour >= 20;

  const handleSave = () => {
    if (!content.trim()) return;
    saveSentence(content.trim());
    setSaved(true);
  };

  // 最近7天的一句话
  const recentSentences = [...sentences]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#3D3228]">一句话</h1>
        <p className="text-sm text-[#A89882] mt-1">{today}</p>
      </div>

      {/* 输入区 */}
      {isEvening || saved ? (
        <div className="bg-white border border-[#E8DDD0] rounded-xl p-5">
          <p className="text-xs text-[#A89882] mb-3">今天，一句话</p>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value.slice(0, 100));
              setSaved(false);
            }}
            placeholder="任何想说的话..."
            className="w-full bg-[#FAF2E8] border border-[#E8DDD0] rounded-lg px-4 py-3 text-sm text-[#3D3228] placeholder-[#C4B8A6] focus:outline-none focus:border-[#F97316]/50 transition-colors resize-none h-24"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] text-[#C4B8A6]">{content.length}/100</span>
            <button
              onClick={handleSave}
              disabled={!content.trim() || saved}
              className="px-4 py-1.5 rounded-lg bg-[#F97316] text-white text-xs disabled:opacity-30 hover:bg-[#EA6C0A] transition-colors"
            >
              {saved ? '已保存' : '保存'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E8DDD0] rounded-xl p-8 text-center">
          <p className="text-[#C4B8A6] text-sm">20:00 后可以记录今天的一句话</p>
          <p className="text-[#D4CBBE] text-xs mt-1">不急，晚上再来</p>
        </div>
      )}

      {/* 近期记录 */}
      {recentSentences.length > 0 && (
        <div className="mt-10">
          <p className="text-xs text-[#A89882] mb-4">近期</p>
          <div className="space-y-3">
            {recentSentences.map((s) => {
              const dateLabel = new Date(s.date).toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric',
                weekday: 'short',
              });
              return (
                <div
                  key={s.id}
                  className="px-4 py-3 bg-white border border-[#E8DDD0] rounded-xl"
                >
                  <p className="text-[10px] text-[#C4B8A6] mb-1.5">{dateLabel}</p>
                  <p className="text-sm text-[#5C4F3D]">{s.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
