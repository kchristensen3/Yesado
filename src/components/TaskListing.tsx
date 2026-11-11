import React, { useState } from 'react';
import { useYesado } from '../context/YesadoContext';
import { Task, TaskStatus } from '../types';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  User,
  Trash2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Tag,
  Plus,
  Edit2,
  Check,
  X,
  AlertCircle,
  Hammer,
  RefreshCw,
  Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface TaskListingProps {
  forcedKind?: 'all' | 'project' | 'chore';
  hideKindTabs?: boolean;
}

export const TaskListing: React.FC<TaskListingProps> = ({
  forcedKind,
  hideKindTabs = false,
}) => {
  const {
    tasks,
    projects,
    people,
    selectedProjectId,
    searchQuery,
    sortBy,
    updateTaskStatus,
    updateTaskDetails,
    deleteTask,
    addTaskNote,
    deleteTaskNote,
    theme,
    filterPersonId,
    filterStatus,
    setFilterStatus,
    filterPriority,
  } = useYesado();

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState<Record<string, string>>({});
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | 'project' | 'chore'>('all');

  const activeKind = forcedKind || kindFilter;

  const isDark = theme === 'dark';

  // Find object details
  const getProject = (id: string) => projects.find((p) => p.id === id);
  const getPerson = (id?: string) => people.find((p) => p.id === id);

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const handleStartEdit = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTaskId(task.id);
    setEditedTitle(task.title);
  };

  const handleSaveEdit = (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editedTitle.trim()) {
      updateTaskDetails(taskId, { title: editedTitle.trim() });
    }
    setEditingTaskId(null);
  };

  const handleAddNote = (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    const content = newNoteText[taskId];
    if (!content || !content.trim()) return;
    addTaskNote(taskId, content);
    setNewNoteText((prev) => ({ ...prev, [taskId]: '' }));
  };

  // Filter & Sort Tasks
  const filteredTasks = tasks.filter((t) => {
    const projectMatch = selectedProjectId === 'all' || t.projectId === selectedProjectId;
    const searchMatch = !searchQuery.trim() || t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const assigneeMatch = filterPersonId === 'all' || t.assigneeId === filterPersonId;
    
    let statusMatch = true;
    if (filterStatus === 'all') {
      statusMatch = true;
    } else if (filterStatus === 'active') {
      statusMatch = t.status !== 'completed';
    } else if (filterStatus === 'completed') {
      statusMatch = t.status === 'completed';
    } else {
      statusMatch = t.status === filterStatus;
    }

    const priorityMatch = filterPriority === 'all' || (t.priority || 'medium') === filterPriority;
    return projectMatch && searchMatch && assigneeMatch && statusMatch && priorityMatch;
  });

  // Calculate hidden completed tasks count in current scope when filter is 'active'
  const hiddenCompletedCount = tasks.filter((t) => {
    const projectMatch = selectedProjectId === 'all' || t.projectId === selectedProjectId;
    const searchMatch = !searchQuery.trim() || t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const assigneeMatch = filterPersonId === 'all' || t.assigneeId === filterPersonId;
    const kindMatch = activeKind === 'all' || (t.kind || 'project') === activeKind;
    const priorityMatch = filterPriority === 'all' || (t.priority || 'medium') === filterPriority;
    return projectMatch && searchMatch && assigneeMatch && kindMatch && priorityMatch && t.status === 'completed';
  }).length;

  const totalCount = filteredTasks.length;
  const projectCount = filteredTasks.filter((t) => (t.kind || 'project') === 'project').length;
  const choreCount = filteredTasks.filter((t) => (t.kind || 'project') === 'chore').length;

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'status') {
      // Pending / In progress top, completed bottom
      const statusWeight = { in_progress: 0, pending: 1, completed: 2 };
      return statusWeight[a.status] - statusWeight[b.status];
    }
    if (sortBy === 'priority') {
      const priorityWeight = { high: 0, medium: 1, low: 2 };
      const aWeight = priorityWeight[a.priority || 'medium'];
      const bWeight = priorityWeight[b.priority || 'medium'];
      if (aWeight !== bWeight) return aWeight - bWeight;
      return b.createdAt.localeCompare(a.createdAt);
    }
    if (sortBy === 'date') {
      // Target date sorting (empty dates go to end)
      if (!a.targetDate) return 1;
      if (!b.targetDate) return -1;
      return a.targetDate.localeCompare(b.targetDate);
    }
    // 'custom' / default tracking: chronological (recent first)
    return b.createdAt.localeCompare(a.createdAt);
  });

  const kindFilteredTasks = sortedTasks.filter((t) => {
    if (activeKind === 'all') return true;
    return (t.kind || 'project') === activeKind;
  });

  // Calculate relative date tags (e.g. "Today", "Overdue", etc.)
  const getDateLabelAndStyle = (dateStr?: string, isCompleted?: boolean) => {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    
    if (isNaN(target.getTime())) {
      return { label: dateStr, style: isDark ? 'text-stone-400 bg-stone-900 border-stone-800' : 'text-stone-600 bg-stone-100 border-stone-200' };
    }

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (isCompleted) {
      return { label: dateStr, style: isDark ? 'text-stone-500 bg-[#1f1f23] border-stone-800' : 'text-stone-400 bg-stone-100 border-stone-200 line-through' };
    }

    if (diffDays < 0) {
      return { label: `Overdue (${dateStr})`, style: 'text-rose-500 bg-rose-500/10 border-rose-500/20 font-medium' };
    } else if (diffDays === 0) {
      return { label: 'Today', style: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 font-bold' };
    } else if (diffDays === 1) {
      return { label: 'Tomorrow', style: 'text-amber-500 bg-amber-500/10 border-amber-500/20 font-semibold' };
    } else if (diffDays <= 7) {
      // Display weekday
      const weekday = target.toLocaleDateString('en-US', { weekday: 'long' });
      return { label: weekday, style: 'text-blue-500 bg-blue-500/10 border-blue-505/20 font-medium' };
    } else {
      return { label: dateStr, style: isDark ? 'text-stone-400 bg-[#1a1a1f] border-[#222226]' : 'text-stone-600 bg-stone-100/60 border-stone-200' };
    }
  };

  return (
    <div className="space-y-4" id="task-listing-core">
      {sortedTasks.length === 0 ? (
        <div className={`flex flex-col items-center justify-center p-10 md:p-12 text-center rounded-2xl border transition-colors ${isDark ? 'bg-[#18181c] border-[#2d2d34]' : 'bg-white border-stone-200 shadow-sm'}`} id="empty-state">
          <div className={`p-4 rounded-full border mb-3.5 transition-colors ${
            filterStatus === 'active' && hiddenCompletedCount > 0
              ? 'bg-emerald-500/10 border-emerald-500/25'
              : isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
          }`} id="empty-state-icon">
            {filterStatus === 'active' && hiddenCompletedCount > 0 ? (
              <CheckCircle2 className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            ) : (
              <svg className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <h3 className={`text-base md:text-lg font-bold mb-1.5 transition-colors ${isDark ? 'text-white' : 'text-stone-800'}`} id="empty-state-title">
            {filterStatus === 'active' && hiddenCompletedCount > 0
              ? 'All caught up!'
              : 'No matching tasks'}
          </h3>
          <p className="text-xs md:text-sm text-stone-400 max-w-sm mb-3.5" id="empty-state-desc">
            {filterStatus === 'active' && hiddenCompletedCount > 0
              ? `All ${hiddenCompletedCount} task${hiddenCompletedCount === 1 ? ' is' : 's are'} completed in this view.`
              : searchQuery
              ? `No house tasks matching "${searchQuery}" in this view.`
              : "All clear! Quickly enter a task in the panel above to populate items."}
          </p>
          {filterStatus === 'active' && hiddenCompletedCount > 0 && (
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-stone-950 transition-all cursor-pointer shadow-xs"
            >
              View {hiddenCompletedCount} Completed Task{hiddenCompletedCount === 1 ? '' : 's'}
            </button>
          )}
        </div>
      ) : kindFilteredTasks.length === 0 ? (
        <div className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border transition-colors ${isDark ? 'bg-[#18181c] border-[#2d2d34]' : 'bg-white border-stone-200 shadow-sm'}`} id="empty-state-filter">
          <div className={`p-4 rounded-full border mb-4 transition-colors ${isDark ? 'bg-stone-850/40 border-stone-700' : 'bg-stone-100 border-stone-200'}`} id="empty-state-filter-icon">
            <AlertCircle className="w-8 h-8 text-stone-500 animate-bounce" />
          </div>
          <h3 className={`text-lg font-bold mb-1.5 transition-colors ${isDark ? 'text-white' : 'text-stone-800'}`} id="empty-state-filter-title">No items found</h3>
          <p className="text-sm text-stone-400 max-w-sm" id="empty-state-filter-desc">
            {kindFilter === 'project' 
              ? "There are no bigger one-time projects in this view." 
              : "There are no routine everyday chores in this view."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5" id="tasks-scroll-grid">
          {kindFilteredTasks.map((task) => {
            const project = getProject(task.projectId);
            const assignee = getPerson(task.assigneeId);
            const isExpanded = expandedTaskId === task.id;
            const isEditing = editingTaskId === task.id;
            const dateBadge = getDateLabelAndStyle(task.targetDate, task.status === 'completed');

            return (
              <motion.div
                key={task.id}
                layoutId={`task_wrapper_${task.id}`}
                className={`rounded-xl border transition-all duration-300 ${
                  task.status === 'completed'
                    ? `${isDark ? 'border-[#222226] bg-[#141416]/50 opacity-75' : 'border-stone-150 bg-stone-100/55 opacity-75'}`
                    : isExpanded
                    ? `${isDark ? 'border-emerald-500/20 bg-[#1a1a1f] shadow-lg shadow-black/20' : 'border-emerald-500/30 bg-white shadow-md shadow-stone-100'}`
                    : `${isDark ? 'border-[#26262a] bg-[#18181c] hover:border-[#383842]' : 'border-stone-200 bg-white hover:border-stone-300 shadow-xs'}`
                }`}
                id={`task-card-${task.id}`}
              >
                {/* Main Task Line */}
                <div
                  onClick={() => toggleExpand(task.id)}
                  className="flex items-start gap-3.5 p-4 cursor-pointer select-none"
                  id={`task-header-row-${task.id}`}
                >
                  {/* Status Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed');
                    }}
                    className={`mt-0.5 transition-colors p-0.5 ${isDark ? 'text-stone-400 hover:text-emerald-400' : 'text-stone-400 hover:text-emerald-600'}`}
                    id={`checkbox-btn-${task.id}`}
                    title={task.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className={`w-5.5 h-5.5 ${isDark ? 'text-emerald-400 fill-emerald-400/10' : 'text-emerald-600 fill-emerald-50'}`} />
                    ) : task.status === 'in_progress' ? (
                      <Clock className="w-5.5 h-5.5 text-amber-500 fill-amber-500/10 animate-spin-slow" />
                    ) : (
                      <Circle className={`w-5.5 h-5.5 transition-colors ${isDark ? 'text-[#3f3f46] hover:text-stone-300' : 'text-stone-300 hover:text-stone-600'}`} />
                    )}
                  </button>

                  <div className="flex-1 min-w-0" id={`task-title-area-${task.id}`}>
                    {isEditing ? (
                      <form
                        onSubmit={(e) => handleSaveEdit(task.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2"
                        id={`edit-form-${task.id}`}
                      >
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className={`w-full text-sm p-2.5 rounded border border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors ${isDark ? 'bg-[#131115] text-white' : 'bg-stone-50 text-stone-900'}`}
                          autoFocus
                          placeholder="Task title"
                          id={`edit-input-${task.id}`}
                        />
                        <button type="submit" className="p-1 px-3 bg-emerald-500 text-slate-900 rounded text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer">
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTaskId(null);
                          }}
                          className={`p-1 text-xs transition-colors ${isDark ? 'text-stone-400 hover:text-white' : 'text-stone-500 hover:text-stone-800'}`}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <div className="flex flex-col gap-1" id={`title-container-${task.id}`}>
                        <div className="flex items-start gap-2 w-full" id={`title-with-flag-row-${task.id}`}>
                          <Flag
                            className={`w-3.5 h-3.5 mt-1 shrink-0 ${
                              task.status === 'completed'
                                ? 'text-stone-500/40 fill-stone-500/10'
                                : (task.priority || 'medium') === 'high'
                                ? 'text-rose-500 fill-rose-500/20'
                                : (task.priority || 'medium') === 'medium'
                                ? 'text-amber-500 fill-amber-500/20'
                                : 'text-blue-500 fill-blue-500/20'
                            }`}
                            id={`priority-flag-${task.id}`}
                          />
                          <span
                            className={`text-sm md:text-[14.5px] font-semibold leading-relaxed break-words transition-colors ${
                              task.status === 'completed' 
                                ? 'line-through text-stone-400' 
                                : isDark ? 'text-stone-200' : 'text-stone-800 font-bold'
                            }`}
                            id={`task-title-${task.id}`}
                          >
                            {task.title}
                          </span>
                        </div>
                        
                        {/* Tags / Subtitle descriptors row */}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5" id={`badges-row-${task.id}`}>
                          {/* Task Classification Badge */}
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md border transition-all ${
                              (task.kind || 'project') === 'chore'
                                ? isDark
                                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-sm'
                                  : 'text-amber-700 bg-amber-50 border-amber-200 shadow-xs'
                                : isDark
                                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-sm'
                                  : 'text-emerald-700 bg-emerald-50 border-emerald-200 shadow-xs'
                            }`}
                            id={`kind-badge-${task.id}`}
                          >
                            {(task.kind || 'project') === 'chore' ? (
                              <>
                                <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" />
                                Chore
                              </>
                            ) : (
                              <>
                                <Hammer className="w-2.5 h-2.5" />
                                Project
                              </>
                            )}
                          </span>

                          {/* Project Tag Name (Only if searching globally) */}
                          {selectedProjectId === 'all' && project && (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${isDark ? 'text-stone-400 bg-stone-900/60 border-stone-800/80' : 'text-stone-600 bg-stone-100 border-stone-200'}`}
                              id={`project-tag-${task.id}`}
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {project.name}
                            </span>
                          )}

                          {/* Planned schedules indicator */}
                          {dateBadge && (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border text-[11px] ${dateBadge.style}`}
                              id={`date-tag-${task.id}`}
                            >
                              <Calendar className="w-2.5 h-2.5" />
                              {dateBadge.label}
                            </span>
                          )}

                          {/* Task status tag indicator */}
                          {task.status === 'in_progress' && (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20" id="in-progress-badge">
                              Working on it
                            </span>
                          )}

                          {/* Notes Count badge */}
                          {task.notes.length > 0 && (
                            <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded transition-colors ${isDark ? 'text-stone-400 bg-[#222226]' : 'text-stone-600 bg-stone-100 border border-stone-150'}`} id={`notes-count-${task.id}`}>
                              <MessageSquare className="w-2.5 h-2.5 text-stone-400" />
                              {task.notes.length} note{task.notes.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right side controls */}
                  <div className="flex items-center gap-2" id={`actions-column-${task.id}`}>
                    {/* Assignee initials badge */}
                    {assignee ? (
                      <span
                        className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[10px] font-bold border shadow ${assignee.colorClass} ${isDark ? 'border-stone-800' : 'border-stone-100'}`}
                        title={`Assigned to ${assignee.name}`}
                        id={`user-initials-${task.id}`}
                      >
                        {assignee.name.slice(0, 2).toUpperCase()}
                      </span>
                    ) : (
                      <span className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[10px] border border-dashed transition-colors ${isDark ? 'bg-[#1a1a1f] text-stone-600 border-stone-800' : 'bg-stone-50 text-stone-400 border-stone-200'}`} title="Unassigned">
                        <User className="w-3.5 h-3.5" />
                      </span>
                    )}

                    {/* Simple inline edit trigger */}
                    {!isEditing && (
                      <button
                        onClick={(e) => handleStartEdit(task, e)}
                        className={`p-1 transition-all ${isDark ? 'text-stone-500 hover:text-white' : 'text-stone-400 hover:text-stone-900'}`}
                        title="Edit Task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Toggle expanding arrow */}
                    <button className="text-stone-500 hover:text-stone-300 transition-colors p-1" id={`dropdown-trigger-${task.id}`}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details & Notes Area */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`border-t p-4 text-xs space-y-4 rounded-b-xl transition-all duration-300 ${isDark ? 'border-[#222226] bg-[#131114]' : 'border-stone-200 bg-stone-50/60'}`}
                      id={`task-expanded-body-${task.id}`}
                    >
                      {/* Dynamic Parameters Edit Frame (Assignee, target date, project list, task type, priority, and status) */}
                      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 p-3 rounded-lg border transition-all duration-300 ${isDark ? 'bg-[#18181c] border-[#222226]' : 'bg-white border-stone-200 shadow-xs'}`} id="settings-grid">
                        
                        {/* Assignee Selector */}
                        <div className="space-y-1.5" id="assignee-select-section">
                          <label className={`font-bold tracking-wide transition-colors ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Assignee</label>
                          <select
                            value={task.assigneeId || ''}
                            onChange={(e) => updateTaskDetails(task.id, { assigneeId: e.target.value || '' })}
                            className={`w-full p-2 rounded-md border focus:outline-none transition-colors ${isDark ? 'bg-[#131316] text-stone-200 border-[#2c2c34]' : 'bg-stone-50 text-stone-800 border-stone-200'}`}
                            id={`assignee-pick-${task.id}`}
                          >
                            <option value="">Unassigned</option>
                            {people.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Date Plan */}
                        <div className="space-y-1.5" id="date-select-section">
                          <label className={`font-bold tracking-wide transition-colors ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Plan Date</label>
                          <input
                            type="date"
                            value={task.targetDate || ''}
                            onChange={(e) => updateTaskDetails(task.id, { targetDate: e.target.value })}
                            className={`w-full p-2 rounded-md border focus:outline-none transition-colors ${isDark ? 'bg-[#131316] text-stone-200 border-[#2c2c34] scheme-dark' : 'bg-stone-50 text-stone-800 border-stone-200'}`}
                            id={`date-pick-${task.id}`}
                          />
                        </div>

                        {/* Project Selector */}
                        <div className="space-y-1.5" id="project-select-section">
                          <label className={`font-bold tracking-wide transition-colors ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Project List</label>
                          <select
                            value={task.projectId || ''}
                            onChange={(e) => updateTaskDetails(task.id, { projectId: e.target.value })}
                            className={`w-full p-2 rounded-md border focus:outline-none transition-colors ${isDark ? 'bg-[#131316] text-stone-200 border-[#2c2c34]' : 'bg-stone-50 text-stone-800 border-stone-200'}`}
                            id={`project-pick-${task.id}`}
                          >
                            {projects.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Task Type selector */}
                        <div className="space-y-1.5" id="type-select-section">
                          <label className={`font-bold tracking-wide transition-colors ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Task Type</label>
                          <select
                            value={task.kind || 'project'}
                            onChange={(e) => updateTaskDetails(task.id, { kind: e.target.value as 'chore' | 'project' })}
                            className={`w-full p-2 rounded-md border focus:outline-none transition-colors ${isDark ? 'bg-[#131316] text-stone-200 border-[#2c2c34]' : 'bg-stone-50 text-stone-800 border-stone-200'}`}
                            id={`kind-pick-${task.id}`}
                          >
                            <option value="project">🔨 One-time Project</option>
                            <option value="chore">🧹 Everyday Chore</option>
                          </select>
                        </div>

                        {/* Priority Selector */}
                        <div className="space-y-1.5" id={`priority-select-section-${task.id}`}>
                          <label className={`font-bold tracking-wide transition-colors ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Priority Level</label>
                          <select
                            value={task.priority || 'medium'}
                            onChange={(e) => updateTaskDetails(task.id, { priority: e.target.value as 'high' | 'medium' | 'low' })}
                            className={`w-full p-2 rounded-md border focus:outline-none transition-colors font-semibold ${
                              (task.priority || 'medium') === 'high'
                                ? 'text-rose-500'
                                : (task.priority || 'medium') === 'medium'
                                ? isDark ? 'text-amber-400' : 'text-amber-700'
                                : 'text-blue-500'
                            } ${isDark ? 'bg-[#131316] text-stone-200 border-[#2c2c34]' : 'bg-stone-50 text-stone-800 border-stone-200'}`}
                            id={`priority-pick-${task.id}`}
                          >
                            <option value="high">🔴 High Priority</option>
                            <option value="medium">🟡 Medium Priority</option>
                            <option value="low">🔵 Low Priority</option>
                          </select>
                        </div>

                        {/* Status dropdown */}
                        <div className="space-y-1.5" id="status-select-section">
                          <label className={`font-bold tracking-wide transition-colors ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Work Status</label>
                          <select
                            value={task.status || 'pending'}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                            className={`w-full p-2 rounded-md border focus:outline-none transition-colors font-semibold ${
                              (task.status || 'pending') === 'completed'
                                ? 'text-emerald-500'
                                : (task.status || 'pending') === 'in_progress'
                                ? 'text-amber-500'
                                : isDark ? 'text-stone-300' : 'text-stone-600'
                            } ${isDark ? 'bg-[#131316] text-stone-200 border-[#2c2c34]' : 'bg-stone-50 text-stone-800 border-stone-200'}`}
                            id={`status-pick-${task.id}`}
                          >
                            <option value="pending">⚪ Pending</option>
                            <option value="in_progress">🟡 Active</option>
                            <option value="completed">🟢 Done</option>
                          </select>
                        </div>
                      </div>

                      {/* Notes / Updates Log */}
                      <div className="space-y-2.5" id="notes-sub-panel">
                        <h4 className={`font-bold flex items-center gap-1.5 transition-colors ${isDark ? 'text-stone-300' : 'text-stone-800'}`}>
                          <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                          Update Notes & Details
                        </h4>

                        {/* Notes List */}
                        {task.notes.length > 0 && (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1" id={`notes-scroll-${task.id}`}>
                            {task.notes.map((note) => {
                              const noteTime = new Date(note.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              });
                              return (
                                <div
                                  key={note.id}
                                  className={`p-2.5 rounded-lg border relative group/note transition-all ${isDark ? 'bg-[#18181c] border-[#222226]' : 'bg-white border-stone-150 shadow-xs'}`}
                                  id={`note-row-${note.id}`}
                                >
                                  <p className={`text-[12.5px] leading-normal mb-1 pr-6 transition-colors ${isDark ? 'text-stone-300' : 'text-stone-700 font-medium'}`}>{note.content}</p>
                                  <div className="flex items-center justify-between text-[10px] text-stone-500 font-medium">
                                    <span>Added {noteTime}</span>
                                    <button
                                      onClick={() => deleteTaskNote(task.id, note.id)}
                                      className={`opacity-0 group-hover/note:opacity-100 transition-opacity p-0.5 ${isDark ? 'text-stone-605 hover:text-red-400' : 'text-stone-400 hover:text-red-600'}`}
                                      title="Delete note"
                                      id={`del-note-${note.id}`}
                                      type="button"
                                    >
                                      <Trash2 className="w-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Add Note Form */}
                        <form onSubmit={(e) => handleAddNote(task.id, e)} className="flex gap-2" id="new-note-form">
                          <input
                            type="text"
                            placeholder="Add progress note or update..."
                            value={newNoteText[task.id] || ''}
                            onChange={(e) =>
                              setNewNoteText((prev) => ({ ...prev, [task.id]: e.target.value }))
                            }
                            className={`flex-1 p-2 rounded-md border focus:outline-none focus:border-emerald-500 text-xs transition-colors ${isDark ? 'bg-[#18181c] text-stone-200 border-[#2c2c31]' : 'bg-white text-stone-850 border-stone-205 shadow-xs'}`}
                            id={`note-input-${task.id}`}
                          />
                          <button
                            type="submit"
                            className={`px-3.5 rounded-md border transition-colors inline-flex items-center gap-1 text-xs font-bold cursor-pointer ${isDark ? 'bg-[#222226] hover:bg-[#2d2d34] text-white border-[#2c2c31]' : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-250'}`}
                            id={`add-note-btn-${task.id}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </button>
                        </form>
                      </div>

                      {/* Delete Task Trigger Bar */}
                      <div className={`flex justify-between items-center pt-3 border-t transition-colors ${isDark ? 'border-[#222226]/50' : 'border-stone-200'}`} id="controls-panel">
                        <span className="text-[10px] text-stone-500 font-semibold">
                          Created {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete the task "${task.title}" permanently?`)) {
                              deleteTask(task.id);
                            }
                          }}
                          className={`font-semibold inline-flex items-center gap-1 transition-colors py-1 cursor-pointer text-xs ${isDark ? 'text-stone-500 hover:text-red-400' : 'text-stone-500 hover:text-red-600'}`}
                          id={`del-task-${task.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Project Task
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Subtle indicator when completed tasks are hidden in active view */}
      {filterStatus === 'active' && sortedTasks.length > 0 && hiddenCompletedCount > 0 && (
        <div
          className={`flex items-center justify-between p-3 px-4 rounded-xl border text-xs transition-colors ${
            isDark ? 'bg-[#141417] border-[#222226] text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-600 shadow-xs'
          }`}
          id="hidden-completed-banner"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              <strong className={isDark ? 'text-stone-300' : 'text-stone-700'}>{hiddenCompletedCount}</strong> completed {hiddenCompletedCount === 1 ? 'task is' : 'tasks are'} hidden
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className="font-bold text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer text-xs"
          >
            Show All
          </button>
        </div>
      )}
    </div>
  );
};
