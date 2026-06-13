import { useEffect, useState } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import AddTaskModal, { CompleteTaskModal, EditTaskModal } from '@/components/AddTaskModal';
import { Plus, Check, MoreHorizontal, ChevronDown, ChevronUp, Undo2 } from 'lucide-react';
import type { DailyTask, TaskCategory } from '@/types';

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

export default function Today() {
  const { tasks, completeTask, uncompleteTask, cleanup } = useTaskStore();
  const [showAdd, setShowAdd] = useState(false);
  const [completingTask, setCompletingTask] = useState<DailyTask | null>(null);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    cleanup();
  }, [cleanup]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => !t.completed && t.date === todayStr);
  const completedToday = tasks.filter((t) => t.completed && t.date === todayStr);
  const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

  const handleComplete = (energyLevel: 'charge' | 'normal' | 'drain', minutes: number, note?: string) => {
    if (completingTask) {
      completeTask(completingTask.id, energyLevel, minutes, note);
      setCompletingTask(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 md:py-12">
      {/* 日期标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#3D3228]">今日</h1>
        <p className="text-sm text-[#A89882] mt-1">{today}</p>
      </div>

      {/* 任务列表 */}
      <div className="space-y-2">
        {todayTasks.length === 0 && completedToday.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#C4B8A6] text-sm">还没有任务</p>
            <p className="text-[#D4CBBE] text-xs mt-1">点击下方按钮添加</p>
          </div>
        )}
        {todayTasks.map((task) => (
          <div
            key={task.id}
            className="group flex items-center gap-3 px-4 py-3.5 bg-white border border-[#E8DDD0] rounded-xl transition-all duration-200 hover:border-[#D4C5B0] hover:shadow-sm"
          >
            <button
              onClick={() => setCompletingTask(task)}
              className="w-5 h-5 rounded-full border-2 border-[#D4C5B0] flex items-center justify-center transition-all duration-200 hover:border-[#F97316] flex-shrink-0"
            >
              <Check className="w-3 h-3 text-transparent group-hover:text-[#F97316]/50 transition-colors" />
            </button>

            <div className="flex-1 min-w-0">
              <span className="text-sm text-[#3D3228]">{task.name}</span>
            </div>

            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${categoryColor[task.category]}`}>
              {categoryLabel[task.category]}
            </span>

            <button
              onClick={() => setEditingTask(task)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-[#FAF2E8]"
            >
              <MoreHorizontal className="w-4 h-4 text-[#A89882]" />
            </button>
          </div>
        ))}
      </div>

      {/* 添加按钮 */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 md:bottom-8 right-8 w-12 h-12 rounded-full bg-[#F97316] text-white flex items-center justify-center shadow-lg shadow-[#F97316]/20 hover:bg-[#EA6C0A] transition-all duration-200 hover:scale-105 z-40"
      >
        <Plus className="w-5 h-5" />
      </button>

      {/* 已完成 - 页面最底部 */}
      {completedToday.length > 0 && (
        <div className="mt-12 pb-8">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-1 text-[10px] text-[#D4CBBE] hover:text-[#C4B8A6] transition-colors mx-auto"
          >
            {showCompleted ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            已完成
          </button>
          {showCompleted && (
            <div className="space-y-1.5 mt-2">
              {completedToday.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-3 px-4 py-2 bg-white/40 border border-[#E8DDD0]/40 rounded-xl"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                  <span className="text-xs text-[#C4B8A6] line-through flex-1">{task.name}</span>
                  <button
                    onClick={() => uncompleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-2 py-0.5 rounded text-[#C4B8A6] hover:text-[#F97316]"
                  >
                    撤销
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 弹窗 */}
      {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} />}
      {completingTask && (
        <CompleteTaskModal
          onConfirm={handleComplete}
          onClose={() => setCompletingTask(null)}
        />
      )}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
