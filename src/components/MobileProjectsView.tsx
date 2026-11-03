import React, { useState } from 'react';
import { useYesado } from '../context/YesadoContext';
import { Folder, Plus, Check, ChevronRight, Sparkles, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MobileProjectsViewProps {
  onSelectProjectAndGoToTasks: (projectId: string) => void;
}

const COLOR_OPTIONS = ['emerald', 'amber', 'blue', 'rose', 'indigo', 'violet', 'orange', 'stone'];

export const MobileProjectsView: React.FC<MobileProjectsViewProps> = ({
  onSelectProjectAndGoToTasks,
}) => {
  const {
    projects,
    tasks,
    selectedProjectId,
    setSelectedProjectId,
    addProject,
    deleteProject,
    theme,
  } = useYesado();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjColor, setNewProjColor] = useState('emerald');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isDark = theme === 'dark';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    const np = await addProject(newProjName.trim(), newProjDesc.trim(), newProjColor);
    setNewProjName('');
    setNewProjDesc('');
    setShowAddForm(false);
    if (np) {
      onSelectProjectAndGoToTasks(np.id);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteProject(id);
    setConfirmDeleteId(null);
  };

  // Stats across all
  const allTasksCount = tasks.length;
  const allDoneCount = tasks.filter(t => t.status === 'completed').length;
  const allPercent = allTasksCount > 0 ? Math.round((allDoneCount / allTasksCount) * 100) : 0;

  return (
    <div className="space-y-4 pb-12 animate-fade-in" id="mobile-projects-view">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>
            House Projects
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Organize renovations, repairs, and rooms
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
          <span>{showAddForm ? 'Cancel' : 'New Project'}</span>
        </button>
      </div>

      {/* Add New Project Inline Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className={`p-4 rounded-2xl border-2 space-y-3 overflow-hidden ${
              isDark ? 'bg-[#18181c] border-emerald-500/40' : 'bg-white border-emerald-500/40 shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5" />
                Create New Project
              </span>
            </div>

            <input
              type="text"
              value={newProjName}
              autoFocus
              onChange={(e) => setNewProjName(e.target.value)}
              placeholder="e.g. Master Bathroom, Backyard Patio, Nursery..."
              className={`w-full text-sm font-semibold p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                isDark ? 'bg-[#121215] border-[#2a2a30] text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
              }`}
            />

            <input
              type="text"
              value={newProjDesc}
              onChange={(e) => setNewProjDesc(e.target.value)}
              placeholder="Brief description (optional)..."
              className={`w-full text-xs p-2 rounded-xl border focus:outline-none ${
                isDark ? 'bg-[#121215] border-[#2a2a30] text-stone-300' : 'bg-stone-50 border-stone-200 text-stone-700'
              }`}
            />

            {/* Color picker */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 mr-1">Color:</span>
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewProjColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                    c === 'emerald' ? 'bg-emerald-500' :
                    c === 'amber' ? 'bg-amber-500' :
                    c === 'blue' ? 'bg-blue-500' :
                    c === 'rose' ? 'bg-rose-500' :
                    c === 'indigo' ? 'bg-indigo-500' :
                    c === 'violet' ? 'bg-violet-500' :
                    c === 'orange' ? 'bg-orange-500' : 'bg-stone-500'
                  } ${newProjColor === c ? 'scale-110 border-white dark:border-stone-900 shadow-md ring-2 ring-emerald-400' : 'border-transparent opacity-75 hover:opacity-100'}`}
                >
                  {newProjColor === c && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  isDark ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newProjName.trim()}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-stone-950 disabled:opacity-40 cursor-pointer"
              >
                Add Project
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* "All House Projects" Master Card */}
      <div
        onClick={() => onSelectProjectAndGoToTasks('all')}
        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
          selectedProjectId === 'all'
            ? isDark
              ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm'
              : 'bg-emerald-50/70 border-emerald-500/50 shadow-sm'
            : isDark
            ? 'bg-[#18181c] border-[#222226] hover:border-stone-700'
            : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  All House Projects
                </h3>
                {selectedProjectId === 'all' && (
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500 text-stone-950">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400">
                {allDoneCount} of {allTasksCount} total tasks completed ({allPercent}%)
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-500 transition-colors" />
        </div>
        <div className={`w-full h-1.5 rounded-full mt-3 overflow-hidden ${isDark ? 'bg-stone-800' : 'bg-stone-100'}`}>
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${allPercent}%` }}
          />
        </div>
      </div>

      {/* Individual Project Cards */}
      <div className="space-y-2.5">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1">
          Projects ({projects.length})
        </h3>

        {projects.map((proj) => {
          const projTasks = tasks.filter((t) => t.projectId === proj.id);
          const total = projTasks.length;
          const completed = projTasks.filter((t) => t.status === 'completed').length;
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
          const isSelected = selectedProjectId === proj.id;

          const colorMap: Record<string, string> = {
            emerald: 'bg-emerald-500',
            amber: 'bg-amber-500',
            blue: 'bg-blue-500',
            rose: 'bg-rose-500',
            indigo: 'bg-indigo-500',
            violet: 'bg-violet-500',
            orange: 'bg-orange-500',
            stone: 'bg-stone-500',
          };
          const bgDot = colorMap[proj.colorClass || 'emerald'] || 'bg-emerald-500';

          return (
            <div
              key={proj.id}
              onClick={() => onSelectProjectAndGoToTasks(proj.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer group relative ${
                isSelected
                  ? isDark
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                    : 'bg-emerald-50/60 border-emerald-500/40 shadow-sm'
                  : isDark
                  ? 'bg-[#18181c] border-[#222226] hover:border-stone-700'
                  : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-3.5 h-3.5 rounded-full ${bgDot} mt-1 shrink-0 ring-4 ${
                    isDark ? 'ring-stone-800' : 'ring-stone-100'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-stone-900'}`}>
                        {proj.name}
                      </h4>
                      {isSelected && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500 text-stone-950 shrink-0">
                          Active
                        </span>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">
                        {proj.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-1">
                      <span>{completed} of {total} done</span>
                      <span>•</span>
                      <span className={pct === 100 ? 'text-emerald-500 font-bold' : ''}>{pct}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {confirmDeleteId === proj.id ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(proj.id, e)}
                        className="px-2 py-1 text-[10px] font-bold bg-rose-500 text-white rounded-lg"
                      >
                        Delete?
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="p-1 text-stone-400 hover:text-stone-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    !proj.id.startsWith('uncategorized') && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(proj.id);
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-400 opacity-60 hover:opacity-100 transition-opacity"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )
                  )}
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-500 transition-colors ml-1" />
                </div>
              </div>

              {/* Progress bar */}
              <div className={`w-full h-1.5 rounded-full mt-3 overflow-hidden ${isDark ? 'bg-stone-800' : 'bg-stone-100'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    pct === 100 ? 'bg-emerald-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
