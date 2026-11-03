import React from 'react';
import { CheckSquare, RefreshCw, Plus, Folder, Home } from 'lucide-react';
import { useHoneydew } from '../context/HoneydewContext';

export type MobileTab = 'tasks' | 'chores' | 'projects' | 'house';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  onOpenAddModal: () => void;
  taskCount?: number;
  choreCount?: number;
  projectCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  taskCount = 0,
  choreCount = 0,
  projectCount = 0,
}) => {
  const { theme, houses, activeHouseId } = useHoneydew();
  const isDark = theme === 'dark';
  const activeHouse = houses.find(h => h.id === activeHouseId);

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl px-2 py-1 flex items-center justify-around transition-colors duration-200 select-none pb-[max(env(safe-area-inset-bottom),8px)] ${
        isDark ? 'bg-[#121215]/95 border-[#222226]' : 'bg-white/95 border-stone-200 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]'
      }`}
      id="mobile-bottom-tabs"
    >
      {/* 1. Tasks Tab */}
      <button
        type="button"
        onClick={() => onTabChange('tasks')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 relative transition-all cursor-pointer ${
          activeTab === 'tasks'
            ? 'text-emerald-500 font-bold'
            : isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-800'
        }`}
        id="bottom-tab-tasks"
      >
        <div className="relative">
          <CheckSquare className={`w-5 h-5 transition-transform ${activeTab === 'tasks' ? 'scale-110' : ''}`} />
          {taskCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-extrabold flex items-center justify-center bg-emerald-500 text-stone-950 shadow-xs">
              {taskCount > 99 ? '99+' : taskCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-1 tracking-tight">Tasks</span>
        {activeTab === 'tasks' && (
          <span className="absolute bottom-0 w-8 h-0.5 bg-emerald-500 rounded-full" />
        )}
      </button>

      {/* 2. Chores Tab */}
      <button
        type="button"
        onClick={() => onTabChange('chores')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 relative transition-all cursor-pointer ${
          activeTab === 'chores'
            ? 'text-amber-500 font-bold'
            : isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-800'
        }`}
        id="bottom-tab-chores"
      >
        <div className="relative">
          <RefreshCw className={`w-5 h-5 transition-transform ${activeTab === 'chores' ? 'scale-110' : ''}`} />
          {choreCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-extrabold flex items-center justify-center bg-amber-500 text-stone-950 shadow-xs">
              {choreCount > 99 ? '99+' : choreCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-1 tracking-tight">Chores</span>
        {activeTab === 'chores' && (
          <span className="absolute bottom-0 w-8 h-0.5 bg-amber-500 rounded-full" />
        )}
      </button>

      {/* 3. Center Elevated + Add Action */}
      <div className="flex-1 flex items-center justify-center px-1">
        <button
          type="button"
          onClick={onOpenAddModal}
          className="w-12 h-12 -mt-5 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-stone-950 flex items-center justify-center shadow-lg shadow-emerald-500/35 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white dark:border-[#141416]"
          id="bottom-tab-add"
          title="Add New Task or Chore"
        >
          <Plus className="w-6 h-6 stroke-[2.75]" />
        </button>
      </div>

      {/* 4. Projects Tab */}
      <button
        type="button"
        onClick={() => onTabChange('projects')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 relative transition-all cursor-pointer ${
          activeTab === 'projects'
            ? 'text-emerald-500 font-bold'
            : isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-800'
        }`}
        id="bottom-tab-projects"
      >
        <div className="relative">
          <Folder className={`w-5 h-5 transition-transform ${activeTab === 'projects' ? 'scale-110' : ''}`} />
          {projectCount > 0 && (
            <span className={`absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center ${
              isDark ? 'bg-stone-800 text-stone-300' : 'bg-stone-200 text-stone-700'
            }`}>
              {projectCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-1 tracking-tight">Projects</span>
        {activeTab === 'projects' && (
          <span className="absolute bottom-0 w-8 h-0.5 bg-emerald-500 rounded-full" />
        )}
      </button>

      {/* 5. House & Family Tab */}
      <button
        type="button"
        onClick={() => onTabChange('house')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 relative transition-all cursor-pointer ${
          activeTab === 'house'
            ? 'text-emerald-500 font-bold'
            : isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-800'
        }`}
        id="bottom-tab-house"
      >
        <div className="relative">
          <Home className={`w-5 h-5 transition-transform ${activeTab === 'house' ? 'scale-110' : ''}`} />
          {activeHouse && (
            <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-[#141416]" />
          )}
        </div>
        <span className="text-[10px] mt-1 tracking-tight">House</span>
        {activeTab === 'house' && (
          <span className="absolute bottom-0 w-8 h-0.5 bg-emerald-500 rounded-full" />
        )}
      </button>
    </nav>
  );
};
