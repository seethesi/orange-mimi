import { useState } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import type { EnergyLevel, TaskCategory } from '@/types';
import { Plus, Check } from 'lucide-react';

const categoryOptions: { value: TaskCategory; label: string }[] = [
  { value: 'survival', label: '生存' },
  { value: 'creation', label: '创作' },
  { value: 'recovery', label: '恢复' },
];

const energyLevelOptions: { value: EnergyLevel; label: string; dot: string; color: string }[] = [
  { value: 'charge', label: '充电', dot: '🟢', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { value: 'normal', label: '普通', dot: '⚪', color: 'bg-stone-50 text-stone-500 border-stone-200' },
  { value: 'drain', label: '消耗', dot: '🔴', color: 'bg-red-50 text-red-500 border-red-200' },
];

// 添加任务弹窗：先输入名称，再选分类（不选耗能等级）
export default function AddTaskModal({ onClose }: { onClose: () => void }) {
  const addTask = useTaskStore((s) => s.addTask);
  const [step, setStep] = useState<'name' | 'category'>('name');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TaskCategory>('survival');

  const handleSubmit = () => {
    if (!name.trim()) return;
    addTask(name.trim(), category);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-[#E8DDD0] rounded-t-2xl md:rounded-2xl w-full md:w-[440px] p-6 animate-slide-up shadow-lg">
        {step === 'name' ? (
          <>
            <h3 className="text-base font-medium text-[#3D3228] mb-5">添加今日任务</h3>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="做什么？"
              className="w-full bg-[#FAF2E8] border border-[#E8DDD0] rounded-lg px-4 py-3 text-sm text-[#3D3228] placeholder-[#A89882] focus:outline-none focus:border-[#F97316]/50 transition-colors"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) setStep('category');
              }}
            />
            <button
              onClick={() => name.trim() && setStep('category')}
              disabled={!name.trim()}
              className="w-full mt-4 py-3 rounded-xl bg-[#F97316] text-white text-sm font-medium transition-all duration-200 hover:bg-[#EA6C0A] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              下一步
            </button>
          </>
        ) : (
          <>
            <h3 className="text-base font-medium text-[#3D3228] mb-1">{name}</h3>
            <p className="text-xs text-[#A89882] mb-5">选择分类</p>
            <div
              className="flex gap-2"
              onKeyDown={(e) => {
                if (e.key === '1') setCategory('survival');
                else if (e.key === '2') setCategory('creation');
                else if (e.key === '3') setCategory('recovery');
                else if (e.key === 'Enter') handleSubmit();
              }}
            >
              {categoryOptions.map((opt, i) => (
                <button
                  key={opt.value}
                  onClick={() => setCategory(opt.value)}
                  className={`flex-1 py-3 rounded-lg text-sm border transition-all duration-200 ${
                    category === opt.value
                      ? 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30 font-medium'
                      : 'bg-[#FAF2E8] text-[#8B7E6F] border-[#E8DDD0] hover:border-[#D4C5B0]'
                  }`}
                >
                  {opt.label}
                  <span className="text-[10px] text-[#C4B8A6] ml-1">{i + 1}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setStep('name')}
                className="flex-1 py-3 rounded-xl text-sm text-[#8B7E6F] bg-[#FAF2E8] border border-[#E8DDD0] hover:bg-[#F0E6D8] transition-colors"
              >
                返回
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl bg-[#F97316] text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#EA6C0A] transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// 完成任务弹窗：选耗能等级 + 输入耗时 + 可选心得
export function CompleteTaskModal({
  onConfirm,
  onClose,
}: {
  onConfirm: (energyLevel: EnergyLevel, minutes: number, note?: string) => void;
  onClose: () => void;
}) {
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('normal');
  const [minutes, setMinutes] = useState(30);
  const [manualInput, setManualInput] = useState(false);
  const [manualMinutes, setManualMinutes] = useState('');
  const [note, setNote] = useState('');

  const displayMinutes = manualInput ? (parseInt(manualMinutes) || 0) : minutes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-[#E8DDD0] rounded-2xl w-[380px] p-6 animate-fade-in shadow-lg max-h-[85vh] overflow-y-auto">
        <h3 className="text-base font-medium text-[#3D3228] mb-1">完成了</h3>
        <p className="text-xs text-[#A89882] mb-4">这次感觉怎么样？</p>

        {/* 耗能等级 */}
        <div className="flex gap-2 mb-5">
          {energyLevelOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setEnergyLevel(opt.value)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs border transition-all duration-200 ${
                energyLevel === opt.value
                  ? opt.color
                  : 'bg-[#FAF2E8] text-[#8B7E6F] border-[#E8DDD0] hover:border-[#D4C5B0]'
              }`}
            >
              <span className="text-[10px]">{opt.dot}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {/* 耗时 */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-[#A89882]">花了多少分钟？</p>
          <button
            onClick={() => setManualInput(!manualInput)}
            className="text-[10px] text-[#F97316] hover:underline"
          >
            {manualInput ? '用滑块' : '手动输入'}
          </button>
        </div>

        {manualInput ? (
          <input
            type="number"
            value={manualMinutes}
            onChange={(e) => setManualMinutes(e.target.value)}
            placeholder="输入分钟数"
            min={1}
            className="w-full bg-[#FAF2E8] border border-[#E8DDD0] rounded-lg px-4 py-3 text-sm text-[#3D3228] placeholder-[#A89882] focus:outline-none focus:border-[#F97316]/50 transition-colors text-center"
            autoFocus
          />
        ) : (
          <>
            <div className="text-center mb-4">
              <span className="text-5xl font-light text-[#F97316]">{minutes}</span>
              <span className="text-sm text-[#A89882] ml-1">分钟</span>
            </div>
            <input
              type="range"
              min={5}
              max={480}
              step={5}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-[#A89882] mt-1 px-0.5">
              <span>5</span>
              <span>480</span>
            </div>
          </>
        )}

        {/* 心得（可选） */}
        <div className="mt-4">
          <p className="text-xs text-[#A89882] mb-2">写点什么？（可选）</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 200))}
            placeholder="心得、感受..."
            className="w-full bg-[#FAF2E8] border border-[#E8DDD0] rounded-lg px-3 py-2 text-xs text-[#3D3228] placeholder-[#C4B8A6] focus:outline-none focus:border-[#F97316]/50 transition-colors resize-none h-14"
          />
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm text-[#8B7E6F] bg-[#FAF2E8] border border-[#E8DDD0] hover:bg-[#F0E6D8] transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(energyLevel, displayMinutes || 30, note.trim() || undefined)}
            className="flex-1 py-2.5 rounded-xl text-sm text-white bg-[#F97316] flex items-center justify-center gap-1.5 hover:bg-[#EA6C0A] transition-colors"
          >
            <Check className="w-4 h-4" />
            确认
          </button>
        </div>
      </div>
    </div>
  );
}

// 编辑任务弹窗
export function EditTaskModal({
  task,
  onClose,
}: {
  task: { id: string; name: string; category: TaskCategory };
  onClose: () => void;
}) {
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const [name, setName] = useState(task.name);
  const [category, setCategory] = useState<TaskCategory>(task.category);

  const handleSave = () => {
    if (!name.trim()) return;
    updateTask(task.id, { name: name.trim(), category });
    onClose();
  };

  const handleDelete = () => {
    deleteTask(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-[#E8DDD0] rounded-2xl w-[380px] p-6 animate-fade-in shadow-lg">
        <h3 className="text-base font-medium text-[#3D3228] mb-4">编辑任务</h3>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#FAF2E8] border border-[#E8DDD0] rounded-lg px-4 py-3 text-sm text-[#3D3228] focus:outline-none focus:border-[#F97316]/50 transition-colors"
          autoFocus
        />

        <div className="mt-4">
          <label className="text-xs text-[#A89882] mb-2 block">分类</label>
          <div className="flex gap-2">
            {categoryOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCategory(opt.value)}
                className={`flex-1 py-2 rounded-lg text-xs border transition-all duration-200 ${
                  category === opt.value
                    ? 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30 font-medium'
                    : 'bg-[#FAF2E8] text-[#8B7E6F] border-[#E8DDD0] hover:border-[#D4C5B0]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleDelete}
            className="py-2.5 px-4 rounded-xl text-sm text-red-400 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors"
          >
            删除
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl text-sm text-[#8B7E6F] bg-[#FAF2E8] border border-[#E8DDD0] hover:bg-[#F0E6D8] transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="py-2.5 px-4 rounded-xl text-sm text-white bg-[#F97316] hover:bg-[#EA6C0A] disabled:opacity-30 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
