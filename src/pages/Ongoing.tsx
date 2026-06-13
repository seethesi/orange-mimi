import { useEffect, useState } from 'react';
import { useOngoingStore } from '@/stores/ongoingStore';
import { useTaskStore } from '@/stores/taskStore';
import { Plus, Check, ArrowRight, MoreHorizontal, Undo2 } from 'lucide-react';
import type { TaskCategory } from '@/types';

const categoryOptions: { value: TaskCategory; label: string }[] = [
  { value: 'survival', label: '生存' },
  { value: 'creation', label: '创作' },
  { value: 'recovery', label: '恢复' },
];

const categoryLabel: Record<string, string> = {
  survival: '生存',
  creation: '创作',
  recovery: '恢复',
};

const categoryColor: Record<TaskCategory, string> = {
  survival: 'bg-amber-50 text-amber-600 border-amber-200',
  creation: 'bg-violet-50 text-violet-500 border-violet-200',
  recovery: 'bg-teal-50 text-teal-500 border-teal-200',
};

// 编辑进行中事项弹窗
function EditOngoingModal({
  item,
  onClose,
}: {
  item: { id: string; name: string; category?: TaskCategory };
  onClose: () => void;
}) {
  const { updateItem, deleteItem } = useOngoingStore();
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState<TaskCategory | undefined>(item.category);

  const handleSave = () => {
    if (!name.trim()) return;
    updateItem(item.id, { name: name.trim(), category });
    onClose();
  };

  const handleDelete = () => {
    deleteItem(item.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-[#E8DDD0] rounded-2xl w-[380px] p-6 animate-fade-in shadow-lg">
        <h3 className="text-base font-medium text-[#3D3228] mb-4">编辑事项</h3>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#FAF2E8] border border-[#E8DDD0] rounded-lg px-4 py-3 text-sm text-[#3D3228] focus:outline-none focus:border-[#F97316]/50 transition-colors"
          autoFocus
        />

        <div className="mt-4">
          <label className="text-xs text-[#A89882] mb-2 block">分类（可选，推到今日时使用）</label>
          <div className="flex gap-2">
            {categoryOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCategory(category === opt.value ? undefined : opt.value)}
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

export default function Ongoing() {
  const { items, addItem, completeItem, uncompleteItem, cleanup } = useOngoingStore();
  const addTask = useTaskStore((s) => s.addTask);
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; category?: TaskCategory } | null>(null);

  useEffect(() => {
    cleanup();
  }, [cleanup]);

  const activeItems = items.filter((i) => !i.completed);
  const completedItems = items.filter((i) => i.completed);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addItem(newName.trim());
    setNewName('');
    setShowInput(false);
  };

  const handlePushToToday = (item: { name: string; category?: TaskCategory }) => {
    addTask(item.name, item.category || 'survival');
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#3D3228]">进行中</h1>
        <p className="text-sm text-[#A89882] mt-1">不追着你，想推的时候再推</p>
      </div>

      {/* 添加 */}
      {showInput ? (
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="什么事？"
            className="flex-1 bg-[#FAF2E8] border border-[#E8DDD0] rounded-lg px-4 py-2.5 text-sm text-[#3D3228] placeholder-[#A89882] focus:outline-none focus:border-[#F97316]/50 transition-colors"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="px-4 py-2.5 rounded-lg bg-[#F97316] text-white text-sm disabled:opacity-30 hover:bg-[#EA6C0A] transition-colors"
          >
            添加
          </button>
          <button
            onClick={() => { setShowInput(false); setNewName(''); }}
            className="px-3 py-2.5 rounded-lg bg-[#FAF2E8] text-[#8B7E6F] text-sm hover:bg-[#F0E6D8] transition-colors"
          >
            取消
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="flex items-center gap-2 text-sm text-[#A89882] hover:text-[#F97316] transition-colors mb-6"
        >
          <Plus className="w-4 h-4" />
          添加事项
        </button>
      )}

      {/* 进行中列表 */}
      <div className="space-y-2">
        {activeItems.length === 0 && !showInput && (
          <div className="text-center py-16">
            <p className="text-[#C4B8A6] text-sm">没有进行中的事项</p>
          </div>
        )}
        {activeItems.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-3 px-4 py-3.5 bg-white border border-[#E8DDD0] rounded-xl transition-all duration-200 hover:border-[#D4C5B0] hover:shadow-sm"
          >
            <span className="text-sm text-[#3D3228] flex-1">{item.name}</span>

            {/* 分类标签 */}
            {item.category && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${categoryColor[item.category]}`}>
                {categoryLabel[item.category]}
              </span>
            )}

            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handlePushToToday(item)}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-[#F97316]/10 text-[#F97316] hover:bg-[#F97316]/20 transition-colors"
              >
                <ArrowRight className="w-3 h-3" />
                推到今天
              </button>
              <button
                onClick={() => completeItem(item.id)}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-colors"
              >
                <Check className="w-3 h-3" />
                完成
              </button>
              <button
                onClick={() => setEditingItem(item)}
                className="p-1 rounded-lg hover:bg-[#FAF2E8] transition-colors"
              >
                <MoreHorizontal className="w-3.5 h-3.5 text-[#A89882]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 已完成 */}
      {completedItems.length > 0 && (
        <div className="mt-10">
          <p className="text-xs text-[#C4B8A6] mb-3">已完成</p>
          <div className="space-y-1.5">
            {completedItems.map((item) => (
              <div
                key={item.id}
                className="group flex items-center gap-3 px-4 py-2.5 text-sm text-[#C4B8A6] line-through bg-white/60 border border-[#E8DDD0]/60 rounded-xl"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="flex-1">{item.name}</span>
                <button
                  onClick={() => uncompleteItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-[#FAF2E8] text-[#A89882] hover:text-[#F97316] hover:bg-[#F97316]/10"
                >
                  <Undo2 className="w-3 h-3" />
                  撤销
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 编辑弹窗 */}
      {editingItem && (
        <EditOngoingModal item={editingItem} onClose={() => setEditingItem(null)} />
      )}
    </div>
  );
}
