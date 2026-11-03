import React, { useState, useEffect } from 'react';
import { useYesado } from '../context/YesadoContext';
import { Plus, User, Calendar, Folder, ArrowRight, Hammer, RefreshCw, Flag, X, Sparkles } from 'lucide-react';
import { TaskPriority } from '../types';

export interface AddTaskQuickProps {
  isModal?: boolean;
  onClose?: () => void;
  defaultKind?: 'project' | 'chore';
  onTaskAdded?: () => void;
  onOpenModal?: (kind?: 'project' | 'chore') => void;
}

export const AddTaskQuick: React.FC<AddTaskQuickProps> = ({
  isModal = false,
  onClose,
  defaultKind = 'project',
  onTaskAdded,
  onOpenModal,
}) => {
  const {
    projects,
    people,
    selectedProjectId,
    addTask,
    theme,
  } = useYesado();

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(() => {
    if (selectedProjectId !== 'all') return selectedProjectId;
    const uncategorizedProj = projects.find(p => p.id.startsWith('uncategorized'));
    return uncategorizedProj?.id || 'uncategorized';
  });
  const [assigneeId, setAssigneeId] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [kind, setKind] = useState<'project' | 'chore'>(defaultKind);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [showDesktopDetails, setShowDesktopDetails] = useState(false);

  const isDark = theme === 'dark';

  // Sync default kind if prop changes
  useEffect(() => {
    setKind(defaultKind);
  }, [defaultKind]);

  // Auto-sync project selection if sidebar selection switches
  useEffect(() => {
    if (selectedProjectId !== 'all') {
      setProjectId(selectedProjectId);
    } else {
      const uncategorizedProj = projects.find(p => p.id.startsWith('uncategorized'));
      setProjectId(uncategorizedProj?.id || 'uncategorized');
    }
  }, [selectedProjectId, projects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask(title, projectId, assigneeId, targetDate, kind, priority);
    
    // Reset state
    setTitle('');
    setPriority('medium');
    setTargetDate('');
    setAssigneeId('');

    if (onTaskAdded) onTaskAdded();
    if (onClose) onClose();
  };

  // Quick preset dates generator
  const setQuickDate = (preset: 'today' | 'tomorrow' | 'weekend') => {
    const d = new Date();
    if (preset === 'today') {
      // today
    } else if (preset === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (preset === 'weekend') {
      const day = d.getDay();
      const diff = 6 - day; // elements to Saturday
      d.setDate(d.getDate() + (diff <= 0 ? 7 : diff));
    }
    
    const tzoffset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 10);
    setTargetDate(localISOTime);
  };

  // ==========================================
  // 1. MODAL / BOTTOM SHEET PRESENTATION
  // ==========================================
  if (isModal) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-4" id="modal-quick-add-form">
        {/* Header Tabs */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-[#18181c] border border-stone-200 dark:border-[#26262b] w-full">
            <button
              type="button"
              onClick={() => setKind('project')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                kind === 'project'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Hammer className="w-3.5 h-3.5" />
              One-time Project
            </button>
            <button
              type="button"
              onClick={() => setKind('chore')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                kind === 'chore'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Everyday Chore
            </button>
          </div>
        </div>

        {/* Task Input Box */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            {kind === 'chore' ? 'Chore Description' : 'Task Name'}
          </label>
          <input
            type="text"
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              kind === 'chore'
                ? "e.g. Empty dishwasher, Change HVAC filter, Water lawn..."
                : "e.g. Paint front porch deck, Install dimmer switches..."
            }
            className={`w-full text-base font-semibold p-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
              isDark
                ? 'bg-[#18181c] border-[#2a2a30] text-white focus:ring-emerald-500/40 placeholder-stone-500'
                : 'bg-stone-50 border-stone-200 text-stone-900 focus:ring-emerald-500/30 placeholder-stone-400'
            }`}
          />
        </div>

        {/* Priority Segmented Control */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Priority Level</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'low' as TaskPriority, label: 'Low', color: 'text-blue-500', activeBg: 'bg-blue-500 text-white' },
              { id: 'medium' as TaskPriority, label: 'Medium', color: 'text-amber-500', activeBg: 'bg-amber-500 text-white' },
              { id: 'high' as TaskPriority, label: 'High', color: 'text-rose-500', activeBg: 'bg-rose-500 text-white' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriority(p.id)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  priority === p.id
                    ? `${p.activeBg} border-transparent shadow-xs`
                    : isDark
                    ? 'bg-[#18181c] border-[#26262b] text-stone-400 hover:text-white'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Project & Assignee row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Project */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
              <Folder className="w-3 h-3" /> Project
            </label>
            <div className={`flex items-center px-3 py-2.5 rounded-xl border transition-colors ${isDark ? 'bg-[#18181c] border-[#26262b]' : 'bg-stone-50 border-stone-200'}`}>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className={`w-full bg-transparent text-xs font-medium focus:outline-none cursor-pointer ${isDark ? 'text-stone-200' : 'text-stone-850'}`}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className={isDark ? 'bg-[#18181c] text-white' : 'bg-white text-stone-850'}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
              <User className="w-3 h-3" /> Assignee
            </label>
            <div className={`flex items-center px-3 py-2.5 rounded-xl border transition-colors ${isDark ? 'bg-[#18181c] border-[#26262b]' : 'bg-stone-50 border-stone-200'}`}>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className={`w-full bg-transparent text-xs font-medium focus:outline-none cursor-pointer ${isDark ? 'text-stone-200' : 'text-stone-850'}`}
              >
                <option value="" className={isDark ? 'bg-[#18181c] text-stone-400' : 'bg-white text-stone-400'}>Assign to anyone</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id} className={isDark ? 'bg-[#18181c] text-white' : 'bg-white text-stone-850'}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Target Date & Presets */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Target Date
            </label>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setQuickDate('today')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer ${isDark ? 'bg-[#222226] text-stone-300 hover:text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setQuickDate('tomorrow')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer ${isDark ? 'bg-[#222226] text-stone-300 hover:text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setQuickDate('weekend')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer ${isDark ? 'bg-[#222226] text-stone-300 hover:text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
              >
                Weekend
              </button>
            </div>
          </div>
          <div className={`flex items-center px-3 py-2.5 rounded-xl border transition-colors ${isDark ? 'bg-[#18181c] border-[#26262b]' : 'bg-stone-50 border-stone-200'}`}>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className={`w-full bg-transparent text-xs font-medium focus:outline-none cursor-pointer ${isDark ? 'text-stone-200 scheme-dark' : 'text-stone-850'}`}
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex items-center gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                isDark ? 'bg-[#1e1e23] text-stone-300 hover:bg-[#26262d]' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!title.trim()}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              !title.trim()
                ? 'opacity-40 cursor-not-allowed bg-stone-300 dark:bg-stone-800 text-stone-500'
                : kind === 'project'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold shadow-emerald-500/20'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold shadow-amber-500/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            {kind === 'project' ? 'Add Project Task' : 'Add Routine Chore'}
          </button>
        </div>
      </form>
    );
  }

  // ==========================================
  // 2. INLINE PRESENTATION (DESKTOP & COMPACT MOBILE)
  // ==========================================
  const containerStyle = kind === 'project'
    ? isDark 
      ? 'bg-[#15201b]/80 border-emerald-500/40 shadow-[0_8px_30px_rgba(16,185,129,0.1)] hover:border-emerald-400' 
      : 'bg-[#f4fbf8] border-emerald-500/30 shadow-[0_8px_30px_rgba(16,185,129,0.05)] hover:border-emerald-500/50'
    : isDark 
      ? 'bg-[#221c12]/80 border-amber-500/40 shadow-[0_8px_30px_rgba(245,158,11,0.1)] hover:border-amber-400' 
      : 'bg-[#fdfaf2] border-amber-500/30 shadow-[0_8px_30px_rgba(245,158,11,0.05)] hover:border-amber-500/50';

  return (
    <div>
      {/* MOBILE COMPACT TRIGGER (Takes only ~44px height instead of 400px!) */}
      <div className="md:hidden" id="mobile-compact-quick-add">
        <div
          onClick={() => onOpenModal ? onOpenModal('project') : null}
          className={`flex items-center justify-between p-2.5 px-3.5 rounded-2xl border-2 transition-all cursor-pointer shadow-xs ${
            isDark
              ? 'bg-[#18181c]/90 border-emerald-500/30 hover:border-emerald-400/60'
              : 'bg-white border-emerald-500/30 hover:border-emerald-500/60'
          }`}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <span className={`text-xs font-semibold truncate ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Add a new task or chore...
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenModal) onOpenModal('project');
              }}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
            >
              + Task
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenModal) onOpenModal('chore');
              }}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
            >
              + Chore
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP FULL INLINE PRESENTATION */}
      <form
        onSubmit={handleSubmit}
        className={`hidden md:block rounded-2xl border-2 p-4 shadow-xl relative overflow-hidden transition-all duration-300 ${containerStyle}`}
        id="quick-add-task-form"
      >
        {/* Dynamic Top Glow Line */}
        <div className={`absolute top-0 left-0 right-0 h-1 transition-colors duration-300 ${kind === 'project' ? 'bg-emerald-500' : 'bg-amber-500'}`} />

        {/* Kind Selector Tabs & Expand Details Toggle */}
        <div className="flex items-center justify-between mb-3" id="quick-add-kind-tabs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setKind('project')}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                kind === 'project'
                  ? isDark
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isDark
                    ? 'bg-transparent text-stone-500 border-transparent hover:text-stone-300'
                    : 'bg-transparent text-stone-500 border-transparent hover:text-stone-800'
              }`}
              id="kind-tab-project"
            >
              <Hammer className="w-3.5 h-3.5" />
              One-time Project
            </button>
            <button
              type="button"
              onClick={() => setKind('chore')}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                kind === 'chore'
                  ? isDark
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                  : isDark
                    ? 'bg-transparent text-stone-500 border-transparent hover:text-stone-300'
                    : 'bg-transparent text-stone-500 border-transparent hover:text-stone-800'
              }`}
              id="kind-tab-chore"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              Everyday Chore
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowDesktopDetails(!showDesktopDetails)}
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
              showDesktopDetails || assigneeId || targetDate || priority !== 'medium'
                ? 'text-emerald-500 font-bold bg-emerald-500/10'
                : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            {showDesktopDetails ? '– Less options' : '+ Assignee, date, priority'}
          </button>
        </div>

        {/* Input Row */}
        <div className="flex gap-3 items-center" id="quick-add-input-row">
          <div className="relative flex-1" id="quick-add-title-wrapper">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                kind === 'chore'
                  ? "Type a routine chore... (e.g. Empty dishwasher, Mow backyard, Clean gutters)"
                  : "Type a project task... (e.g. Paint porch deck, Repair screen door, Install lights)"
              }
              className={`w-full text-sm font-medium bg-transparent pr-10 focus:outline-none focus:ring-0 transition-colors ${
                isDark ? 'text-white placeholder-stone-500' : 'text-stone-900 placeholder-stone-400'
              }`}
              id="quick-task-title-input"
            />
            {title.trim() && (
              <button
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-lg transition-transform hover:scale-105 cursor-pointer shadow-xs"
                id="submit-quick-task-btn"
              >
                <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Details Row */}
        {(showDesktopDetails || title.trim().length > 0) && (
          <div className={`flex flex-wrap items-center justify-between gap-2.5 mt-3 pt-2.5 border-t transition-colors animate-fade-in ${isDark ? 'border-[#222226]' : 'border-stone-150'}`} id="quick-add-options-row">
            <div className="flex flex-wrap gap-2 items-center" id="selectors-container">
              {/* Project dropdown */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${isDark ? 'bg-[#121215] border-[#222226]' : 'bg-white border-stone-200'}`} id="project-combo">
                <Folder className="w-3.5 h-3.5 text-stone-400" />
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className={`bg-transparent text-xs focus:outline-none cursor-pointer pr-1 transition-colors ${isDark ? 'text-stone-300' : 'text-stone-700'}`}
                  id="quick-task-project-select"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className={isDark ? 'bg-[#121215] text-stone-200' : 'bg-white text-stone-850'}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee dropdown */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${isDark ? 'bg-[#121215] border-[#222226]' : 'bg-white border-stone-200'}`} id="assignee-combo">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className={`bg-transparent text-xs focus:outline-none cursor-pointer pr-1 transition-colors ${isDark ? 'text-stone-300' : 'text-stone-700'}`}
                  id="quick-task-assignee-select"
                >
                  <option value="" className={isDark ? 'bg-[#121215] text-stone-500' : 'bg-white text-stone-400'}>Assign to...</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id} className={isDark ? 'bg-[#121215] text-stone-200' : 'bg-white text-stone-850'}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target date field */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${isDark ? 'bg-[#121215] border-[#222226]' : 'bg-white border-stone-200'}`} id="date-combo">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className={`bg-transparent text-xs focus:outline-none cursor-pointer ${isDark ? 'text-stone-300 scheme-dark' : 'text-stone-700'}`}
                  id="quick-task-date-input"
                />
              </div>

              {/* Priority selector */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${isDark ? 'bg-[#121215] border-[#222226]' : 'bg-white border-stone-200'}`} id="priority-combo">
                <Flag className={`w-3.5 h-3.5 ${
                  priority === 'high' 
                    ? 'text-rose-500' 
                    : priority === 'medium' 
                    ? 'text-amber-500' 
                    : 'text-blue-500'
                }`} />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className={`bg-transparent text-xs font-semibold focus:outline-none cursor-pointer pr-1 transition-colors ${
                    priority === 'high' 
                      ? 'text-rose-500' 
                      : priority === 'medium' 
                      ? isDark ? 'text-amber-400' : 'text-amber-700' 
                      : 'text-blue-500'
                  }`}
                  id="quick-task-priority-select"
                >
                  <option value="high" className={isDark ? 'bg-[#121215] text-rose-400' : 'bg-white text-rose-750 font-bold'}>🔴 High</option>
                  <option value="medium" className={isDark ? 'bg-[#121215] text-amber-400' : 'bg-white text-amber-750 font-bold'}>🟡 Medium</option>
                  <option value="low" className={isDark ? 'bg-[#121215] text-blue-400' : 'bg-white text-blue-750 font-bold'}>🔵 Low</option>
                </select>
              </div>
            </div>

            {/* Quick Date Presets Chips */}
            <div className="flex gap-1.5 items-center" id="quick-preset-chips">
              <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Presets:</span>
              <button
                type="button"
                onClick={() => {
                  const todayStr = new Date().toISOString().slice(0, 10);
                  setTargetDate(todayStr);
                }}
                className={`text-[10px] px-2 py-0.5 rounded transition-colors font-medium cursor-pointer ${
                  isDark ? 'bg-[#222226] text-stone-300 hover:text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setQuickDate('tomorrow')}
                className={`text-[10px] px-2 py-0.5 rounded transition-colors font-medium cursor-pointer ${
                  isDark ? 'bg-[#222226] text-stone-300 hover:text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setQuickDate('weekend')}
                className={`text-[10px] px-2 py-0.5 rounded transition-colors font-medium cursor-pointer ${
                  isDark ? 'bg-[#222226] text-stone-300 hover:text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
              >
                Weekend
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
