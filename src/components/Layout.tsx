import { NavLink, Outlet } from 'react-router-dom';
import { Sun, ListChecks, ArrowRightLeft, Zap, MessageSquare, BarChart3, Download, Upload } from 'lucide-react';
import { exportData, importData } from '@/lib/dataIO';
import { useRef, useState } from 'react';

const navItems = [
  { to: '/today', label: '今日', icon: ListChecks },
  { to: '/ongoing', label: '进行中', icon: ArrowRightLeft },
  { to: '/energy', label: '能量', icon: Zap },
  { to: '/sentence', label: '一句话', icon: MessageSquare },
  { to: '/review', label: '复盘', icon: BarChart3 },
];

export default function Layout() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState('');

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await importData(file);
    setImportMsg(result.message);
    setTimeout(() => setImportMsg(''), 3000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex h-screen bg-[#FDF6EE] text-[#3D3228]">
      {/* 侧边栏 - 桌面端 */}
      <nav className="hidden md:flex flex-col w-56 border-r border-[#E8DDD0] bg-[#FAF2E8] p-6">
        <div className="flex items-center gap-2 mb-10">
          <Sun className="w-6 h-6 text-[#F97316]" />
          <span className="text-lg font-semibold tracking-wide text-[#F97316]">橘猫</span>
        </div>
        <div className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#F97316]/10 text-[#F97316] font-medium'
                    : 'text-[#8B7E6F] hover:text-[#5C4F3D] hover:bg-[#F0E6D8]'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* 数据导出导入 */}
        <div className="mt-auto pt-6 border-t border-[#E8DDD0]">
          <p className="text-[10px] text-[#A89882] mb-2 px-3">数据</p>
          <button
            onClick={exportData}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[#8B7E6F] hover:text-[#5C4F3D] hover:bg-[#F0E6D8] transition-all duration-200 w-full"
          >
            <Download className="w-3.5 h-3.5" />
            导出数据
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[#8B7E6F] hover:text-[#5C4F3D] hover:bg-[#F0E6D8] transition-all duration-200 w-full"
          >
            <Upload className="w-3.5 h-3.5" />
            导入数据
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          {importMsg && (
            <p className={`text-[10px] px-3 mt-1 ${importMsg === '导入成功' ? 'text-emerald-500' : 'text-red-400'}`}>
              {importMsg}
            </p>
          )}
        </div>
      </nav>

      {/* 内容区 */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* 底部导航 - 手机端 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FAF2E8]/95 backdrop-blur-sm border-t border-[#E8DDD0] px-2 py-2 z-50">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 ${
                  isActive ? 'text-[#F97316]' : 'text-[#A89882]'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
          {/* 手机端数据按钮 */}
          <button
            onClick={exportData}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs text-[#A89882]"
          >
            <Download className="w-5 h-5" />
            导出
          </button>
        </div>
      </nav>
    </div>
  );
}
