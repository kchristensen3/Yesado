/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HoneydewProvider, useHoneydew } from './context/HoneydewContext';
import { HoneydewSidebar } from './components/HoneydewSidebar';
import { AddTaskQuick } from './components/AddTaskQuick';
import { TaskListing } from './components/TaskListing';
import { HoneydewLogo } from './components/HoneydewLogo';
import {
  Menu,
  X,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  HelpCircle,
  Home,
  CheckSquare,
  BarChart3,
  Calendar,
  RotateCcw,
  Sun,
  Moon,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Trophy,
  Sparkles,
  Smile,
  Plus,
  Folder,
  Users,
  ChevronRight,
  UserPlus,
  LogOut,
  RefreshCw,
  Hammer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MobileBottomNav, MobileTab } from './components/MobileBottomNav';
import { MobileProjectsView } from './components/MobileProjectsView';
import { MobileHouseView } from './components/MobileHouseView';

function HoneydewDashboard() {
  const {
    tasks,
    projects,
    people,
    houses,
    activeHouseId,
    setActiveHouseId,
    selectedProjectId,
    setSelectedProjectId,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    theme,
    toggleTheme,
    filterPersonId,
    setFilterPersonId,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
  } = useHoneydew();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('tasks');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalKind, setAddModalKind] = useState<'project' | 'chore'>('project');
  const [mobileTaskSegment, setMobileTaskSegment] = useState<'all' | 'projects' | 'chores' | 'completed'>('all');
  const [showSearch, setShowSearch] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const activeHouse = houses.find((h) => h.id === activeHouseId);
  const totalRemainingChores = tasks.filter(t => (t.kind || 'project') === 'chore' && t.status !== 'completed').length;
  const totalRemainingTasks = tasks.filter(t => t.status !== 'completed').length;
  const totalChores = tasks.filter(t => (t.kind || 'project') === 'chore').length;
  const completedChores = tasks.filter(t => (t.kind || 'project') === 'chore' && t.status === 'completed').length;
  const choresPercent = totalChores > 0 ? Math.round((completedChores / totalChores) * 100) : 0;

  const handleOpenAddModal = (kind: 'project' | 'chore' = 'project') => {
    setAddModalKind(kind);
    setShowAddModal(true);
  };

  const handleSelectProjectAndGoToTasks = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveMobileTab('tasks');
  };

  const handleFilterPersonAndGoToTasks = (personId: string) => {
    setFilterPersonId(personId);
    setActiveMobileTab('tasks');
  };

  const isDark = theme === 'dark';
  const isFilterActive = filterPersonId !== 'all' || filterStatus !== 'all' || filterPriority !== 'all' || selectedProjectId !== 'all';

  // Get metadata for active scope
  const activeProject = projects.find((p) => p.id === selectedProjectId);
  const activeTitle = activeProject ? activeProject.name : 'All House Projects';
  const activeDesc = activeProject ? activeProject.description : 'Master coordinate of all home improvement and repair items.';

  // Filter tasks in current scope to calculate stats
  const scopeTasks = tasks.filter((t) => selectedProjectId === 'all' || t.projectId === selectedProjectId);
  const totalScope = scopeTasks.length;
  const completedScope = scopeTasks.filter((t) => t.status === 'completed').length;
  const activeScope = scopeTasks.filter((t) => t.status === 'in_progress').length;
  const pendingScope = scopeTasks.filter((t) => t.status === 'pending').length;

  const percentCompleted = totalScope > 0 ? Math.round((completedScope / totalScope) * 100) : 0;

  const completedTasks = scopeTasks.filter((t) => t.status === 'completed');
  const remainingTasks = scopeTasks.filter((t) => t.status !== 'completed');
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = remainingTasks.filter((t) => t.targetDate && t.targetDate < todayStr);
  const highPriorityTasks = remainingTasks.filter((t) => t.priority === 'high' && !(t.targetDate && t.targetDate < todayStr));
  const otherRemainingTasks = remainingTasks.filter((t) => t.priority !== 'high' && !(t.targetDate && t.targetDate < todayStr));

  // Real date representation
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans select-none transition-colors duration-300 ${isDark ? 'bg-[#0E0E10] text-[#E4E4E7]' : 'bg-[#fafafa] text-stone-800'}`} id="honeydew-canvas">
      
      {/* 1. Desktop Sidebar */}
      <div className="hidden md:block w-76 shrink-0 h-full" id="desktop-sidebar-pane">
        <HoneydewSidebar />
      </div>

      {/* 2. Mobile Project Drawer (AnimatePresence Overlay) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex" id="mobile-sidebar-overlay">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-80 max-w-[85vw] h-full"
            >
              <div className="absolute right-4 top-4 z-50 p-2 text-stone-400 hover:text-white" id="mobile-close-btn">
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <HoneydewSidebar />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Main Action Canvas */}
      <div className="flex-1 flex flex-col h-full min-w-0" id="main-content-layout">
        
        {/* Mobile Navigation Header */}
        <header className={`md:hidden flex items-center justify-between px-4 py-3 border-b transition-colors ${isDark ? 'bg-[#141416] border-[#222226]' : 'bg-white border-stone-200 shadow-xs'}`} id="mobile-navbar">
          <div className="flex items-center gap-2" id="mobile-nav-logo">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`p-1 px-1.5 rounded transition-colors ${isDark ? 'hover:bg-[#1a1a1f] text-stone-200' : 'hover:bg-stone-100 text-stone-700'}`}
              id="mobile-hamburger-btn"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <HoneydewLogo className="w-6 h-6" />
            <span className={`text-sm font-semibold tracking-wide ${isDark ? 'text-white' : 'text-stone-850'}`}>Yesado</span>
            {activeHouse && (
              <button
                type="button"
                onClick={() => setActiveMobileTab('house')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border max-w-[130px] truncate transition-colors cursor-pointer ${
                  activeMobileTab === 'house'
                    ? 'bg-emerald-500 text-stone-950 border-emerald-500'
                    : isDark
                    ? 'bg-[#18181c] border-[#2a2a30] text-stone-300'
                    : 'bg-stone-100 border-stone-200 text-stone-700'
                }`}
                title="Tap to manage house"
              >
                🏠 {activeHouse.name}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2" id="mobile-nav-tools">
            {/* Quick Toggle on mobile navigation header */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded transition-colors ${isDark ? 'text-stone-400 hover:text-amber-400' : 'text-stone-500 hover:text-indigo-600'}`}
              id="mobile-theme-toggle"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-indigo-500" />}
            </button>

            <button
              onClick={() => {
                setShowSearch(!showSearch);
                if (activeMobileTab !== 'tasks') {
                  setActiveMobileTab('tasks');
                }
              }}
              className={`p-1.5 rounded transition-all ${showSearch ? 'text-emerald-400 bg-emerald-500/10' : 'text-stone-400 hover:text-stone-200'}`}
              id="mobile-search-toggle"
              title="Toggle Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Global Banner and Task Completion Progress */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-12" id="main-scrollable-body">
          <div className="max-w-3xl mx-auto px-4 py-5 md:py-9 space-y-5 md:space-y-6" id="inner-content-wrapper">

            {/* A. MOBILE PROJECTS TAB */}
            {activeMobileTab === 'projects' && (
              <div className="md:hidden">
                <MobileProjectsView onSelectProjectAndGoToTasks={handleSelectProjectAndGoToTasks} />
              </div>
            )}

            {/* B. MOBILE HOUSE & FAMILY TAB */}
            {activeMobileTab === 'house' && (
              <div className="md:hidden">
                <MobileHouseView onFilterPersonAndGoToTasks={handleFilterPersonAndGoToTasks} />
              </div>
            )}

            {/* C. MOBILE CHORES TAB */}
            {activeMobileTab === 'chores' && (
              <div className="md:hidden space-y-4">
                <div className={`flex items-start justify-between border-b pb-4 transition-colors ${isDark ? 'border-[#222226]' : 'border-stone-200'}`}>
                  <div>
                    <div className="flex items-center gap-2 text-stone-400 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>Recurring House Checklist</span>
                    </div>
                    <h2 className={`text-2xl font-extrabold tracking-tight mt-1 ${isDark ? 'text-white' : 'text-stone-900'}`}>
                      Everyday Chores
                    </h2>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Daily and weekly habits to keep the home running smoothly
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenAddModal('chore')}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add Chore</span>
                  </button>
                </div>

                {/* Chores Progress Gauge */}
                {totalChores > 0 && (
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#18181c] border-[#222226]' : 'bg-white border-stone-200 shadow-xs'}`}>
                    <div className="flex justify-between items-center text-xs font-bold mb-2">
                      <span className="text-stone-400 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                        Chores Progress
                      </span>
                      <span className={choresPercent === 100 ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                        {completedChores} of {totalChores} done ({choresPercent}%)
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-stone-800' : 'bg-stone-100'}`}>
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${choresPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <TaskListing forcedKind="chore" hideKindTabs />
              </div>
            )}

            {/* D. TASKS TAB (Active on mobile if tab is 'tasks', always visible on desktop) */}
            <div className={activeMobileTab === 'tasks' ? 'space-y-5 md:space-y-6' : 'hidden md:block md:space-y-6'}>
              {/* Dashboard Welcome Segment */}
              <div className={`flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b pb-5 transition-colors ${isDark ? 'border-[#222226]' : 'border-stone-200'}`} id="dashboard-header-block">
                <div className="space-y-1.5" id="welcome-caption">
                  <div className="flex items-center gap-2 text-stone-400 text-xs font-semibold tracking-wide">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-emerald-500' : 'bg-emerald-600'}`} />
                    <span>{formattedToday}</span>
                  </div>
                  <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2.5 transition-colors ${isDark ? 'text-white' : 'text-stone-900'}`} id="header-selected-title">
                    {activeTitle}
                  </h2>
                  {activeDesc && (
                    <p className={`text-xs md:text-sm leading-relaxed max-w-xl transition-colors ${isDark ? 'text-stone-400' : 'text-stone-500'}`} id="header-selected-desc">
                      {activeDesc}
                    </p>
                  )}
                </div>

                {/* Progress visualizer */}
                {totalScope > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowProgressModal(true)}
                    className={`p-3 md:p-4.5 rounded-xl border shrink-0 min-w-[180px] md:min-w-[200px] text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group relative overflow-hidden ${
                      isDark 
                        ? 'bg-[#141416]/90 border-[#222226] hover:border-emerald-500/30 hover:bg-[#1a1a1d]' 
                        : 'bg-white border-stone-200 hover:border-emerald-500/30 hover:bg-stone-50 shadow-xs'
                    }`}
                    id="completion-gauge"
                    title="Click for full beautiful project overview & insights!"
                  >
                    <div className="flex justify-between items-center text-xs font-semibold mb-2" id="gauge-metrics">
                      <span className="text-stone-400 group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                        Progress
                        <Sparkles className="w-3 h-3 text-emerald-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                      <span className={isDark ? 'text-emerald-400 group-hover:text-emerald-300' : 'text-emerald-600 font-bold group-hover:text-emerald-700'}>{percentCompleted}% Done</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden transition-colors ${isDark ? 'bg-[#222226]' : 'bg-stone-100'}`} id="gauge-track">
                      <div
                        className="bg-emerald-400 h-full transition-all duration-500 ease-out rounded-full shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                        style={{ width: `${percentCompleted}%` }}
                        id="gauge-fill"
                      />
                    </div>
                    <p className="text-[10px] mt-1.5 transition-colors flex items-center justify-between text-stone-500 group-hover:text-stone-400">
                      <span className="text-[9px] font-medium text-emerald-400/90 tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">Click to Expand ✦</span>
                      <span>{completedScope} of {totalScope} tasks resolved</span>
                    </p>
                  </button>
                )}
              </div>

              {/* Mobile Top Segment Tabs for Quick Switching */}
              <div className="md:hidden flex items-center gap-1 p-1 rounded-xl bg-stone-100 dark:bg-[#18181c] border border-stone-200 dark:border-[#26262b] overflow-x-auto scrollbar-none" id="mobile-task-segment-tabs">
                <button
                  type="button"
                  onClick={() => setMobileTaskSegment('all')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer text-center ${
                    mobileTaskSegment === 'all'
                      ? 'bg-emerald-500 text-stone-950 font-extrabold shadow-xs'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  All ({totalScope})
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTaskSegment('projects')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    mobileTaskSegment === 'projects'
                      ? 'bg-emerald-500 text-stone-950 font-extrabold shadow-xs'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Hammer className="w-3 h-3" />
                  Projects ({scopeTasks.filter(t => (t.kind || 'project') === 'project').length})
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTaskSegment('chores')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    mobileTaskSegment === 'chores'
                      ? 'bg-amber-500 text-stone-950 font-extrabold shadow-xs'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <RefreshCw className="w-3 h-3" />
                  Chores ({scopeTasks.filter(t => (t.kind || 'project') === 'chore').length})
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTaskSegment('completed')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer text-center ${
                    mobileTaskSegment === 'completed'
                      ? 'bg-emerald-500 text-stone-950 font-extrabold shadow-xs'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  Done ({completedScope})
                </button>
              </div>

              {/* Section: Add New Project Task (Super easy entry, compact on mobile) */}
              <div className="space-y-2" id="add-task-drawer">
                <div className="hidden md:flex items-center justify-between px-1" id="add-task-caption-row">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Quick Add Item</h3>
                  <span className="text-[10px] text-stone-400">Press ENTER or click arrow to save</span>
                </div>
                <AddTaskQuick onOpenModal={handleOpenAddModal} />
              </div>

            {/* Controls Filter & Sorting Options Toolbar */}
            <div className="flex flex-col gap-2.5" id="toolbar-wrapper">
              <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-2.5 rounded-xl border transition-all ${isDark ? 'bg-[#141416] border-[#222226]' : 'bg-white border-stone-200 shadow-xs'}`} id="toolbar">
                
                {/* Compact search expander */}
                <div className="flex items-center gap-2 w-full sm:w-auto" id="search-bar-assembly">
                  <div className={`relative flex-1 sm:max-w-[220px] flex items-center border rounded-lg px-2.5 py-1.5 transition-colors ${showSearch || 'sm:block hidden'} ${isDark ? 'bg-[#1c1c21] border-[#26262a]' : 'bg-stone-50 border-stone-200'}`} id="search-input-box">
                    <Search className="w-3.5 h-3.5 text-stone-400 shrink-0 mr-2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tasks..."
                      className={`w-full text-xs font-medium bg-transparent focus:outline-none placeholder-stone-400 ${isDark ? 'text-stone-200' : 'text-stone-800'}`}
                      id="search-input-field"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-stone-400 hover:text-stone-600 px-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Interactive Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end relative" id="action-buttons-group">
                  
                  {/* SORT TRIGGER BUTTON */}
                  <div className="relative" id="sort-control">
                    <button
                      onClick={() => {
                        setShowSortDropdown(!showSortDropdown);
                        setShowFilterDropdown(false);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        sortBy !== 'custom'
                          ? isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : isDark ? 'bg-[#18181c] border-[#26262a] text-stone-400 hover:text-stone-200 hover:bg-[#222226]' : 'bg-white border-stone-200 text-stone-600 hover:text-stone-800 hover:bg-stone-50 shadow-xs'
                      }`}
                      id="sort-btn-trigger"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <span>Sort</span>
                      <ChevronDown className="w-3 h-3 text-stone-400 transition-transform" />
                    </button>

                    <AnimatePresence>
                      {showSortDropdown && (
                        <>
                          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowSortDropdown(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.96 }}
                            transition={{ duration: 0.12 }}
                            className={`absolute right-0 mt-1.5 w-48 rounded-xl border p-1 shadow-xl z-50 transition-colors ${
                              isDark ? 'bg-[#18181c] border-[#2d2d34] text-white' : 'bg-white border-stone-200 text-stone-800 shadow-lg shadow-stone-100'
                            }`}
                            style={{ top: '100%' }}
                            id="sort-dropdown-options"
                          >
                            <div className="px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-widest text-stone-400">Sort By</div>
                            {[
                              { id: 'custom', label: 'Recent First', desc: 'Creation Order' },
                              { id: 'status', label: 'Work Status', desc: 'Pending to Done' },
                              { id: 'priority', label: 'Priority Level', desc: 'High to Low' },
                              { id: 'date', label: 'Planned Date', desc: 'Calendar Target' },
                            ].map((option) => (
                              <button
                                key={option.id}
                                onClick={() => {
                                  setSortBy(option.id as any);
                                  setShowSortDropdown(false);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                                  sortBy === option.id
                                    ? isDark ? 'bg-[#222226] text-emerald-400' : 'bg-emerald-50 text-emerald-800 font-bold'
                                    : isDark ? 'hover:bg-[#222226] text-stone-300' : 'hover:bg-stone-50 text-stone-700'
                                }`}
                              >
                                <div className="flex flex-col">
                                  <span>{option.label}</span>
                                  <span className="text-[9px] text-stone-500 font-normal">{option.desc}</span>
                                </div>
                                {sortBy === option.id && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* FILTER TRIGGER BUTTON */}
                  <div className="relative" id="filter-control">
                    <button
                      onClick={() => {
                        setShowFilterDropdown(!showFilterDropdown);
                        setShowSortDropdown(false);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isFilterActive
                          ? isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                          : isDark ? 'bg-[#18181c] border-[#26262a] text-stone-400 hover:text-stone-200 hover:bg-[#222226]' : 'bg-white border-stone-200 text-stone-600 hover:text-stone-800 hover:bg-stone-50 shadow-xs'
                      }`}
                      id="filter-btn-trigger"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Filter</span>
                      {(filterPersonId !== 'all' || filterStatus !== 'all' || filterPriority !== 'all') && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      <ChevronDown className="w-3 h-3 text-stone-400 transition-transform" />
                    </button>

                    <AnimatePresence>
                      {showFilterDropdown && (
                        <>
                          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowFilterDropdown(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.96 }}
                            transition={{ duration: 0.12 }}
                            className={`absolute right-0 mt-1.5 w-64 rounded-xl border p-3.5 shadow-xl z-50 transition-colors ${
                              isDark ? 'bg-[#18181c] border-[#2a2a2f] text-white' : 'bg-white border-stone-200 text-stone-800 shadow-lg shadow-stone-100'
                            }`}
                            style={{ top: '100%' }}
                            id="filter-dropdown-options"
                          >
                            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-stone-500/10">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Filter checklist</span>
                              <button
                                onClick={() => {
                                  setFilterPersonId('all');
                                  setFilterStatus('all');
                                  setFilterPriority('all');
                                  setSelectedProjectId('all');
                                }}
                                className="text-[10px] text-rose-500 hover:text-rose-450 font-bold cursor-pointer"
                              >
                                Clean Filters
                              </button>
                            </div>
                            
                            <div className="space-y-3 text-xs">
                              {/* Filter by Family Member */}
                              <div className="space-y-1">
                                <span className="font-extrabold text-[10px] text-stone-400 uppercase tracking-wide">Family Member</span>
                                <div className="flex flex-wrap gap-1">
                                  <button
                                    onClick={() => setFilterPersonId('all')}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-all cursor-pointer ${
                                      filterPersonId === 'all'
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-450 font-bold'
                                        : isDark ? 'bg-stone-900 border-stone-850 text-stone-400 hover:border-stone-700' : 'bg-stone-50 border-stone-250 text-stone-600 hover:bg-stone-100'
                                    }`}
                                  >
                                    Everyone
                                  </button>
                                  {people.map((p) => (
                                    <button
                                      key={p.id}
                                      onClick={() => setFilterPersonId(p.id)}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-all cursor-pointer ${
                                        filterPersonId === p.id
                                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-450 font-bold'
                                          : isDark ? 'bg-stone-900 border-stone-850 text-stone-400 hover:border-stone-700' : 'bg-stone-50 border-stone-250 text-stone-600 hover:bg-stone-100'
                                      }`}
                                    >
                                      {p.name}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Filter by Work Status */}
                              <div className="space-y-1">
                                <span className="font-extrabold text-[10px] text-stone-400 uppercase tracking-wide">Work Status</span>
                                <div className="flex flex-wrap gap-1">
                                  {[
                                    { id: 'all', label: 'Any' },
                                    { id: 'pending', label: 'Pending' },
                                    { id: 'in_progress', label: 'Active' },
                                    { id: 'completed', label: 'Done' },
                                  ].map((option) => (
                                    <button
                                      key={option.id}
                                      onClick={() => setFilterStatus(option.id)}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-all cursor-pointer ${
                                        filterStatus === option.id
                                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-450 font-bold'
                                          : isDark ? 'bg-stone-900 border-stone-850 text-stone-400 hover:border-stone-700' : 'bg-stone-50 border-stone-250 text-stone-600 hover:bg-stone-100'
                                      }`}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Filter by Priority */}
                              <div className="space-y-1">
                                <span className="font-extrabold text-[10px] text-stone-400 uppercase tracking-wide">Priority Level</span>
                                <div className="flex flex-wrap gap-1">
                                  {[
                                    { id: 'all', label: 'Any' },
                                    { id: 'high', label: 'High' },
                                    { id: 'medium', label: 'Medium' },
                                    { id: 'low', label: 'Low' },
                                  ].map((option) => (
                                    <button
                                      key={option.id}
                                      onClick={() => setFilterPriority(option.id)}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-all cursor-pointer ${
                                        filterPriority === option.id
                                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-450 font-bold'
                                          : isDark ? 'bg-stone-900 border-stone-850 text-stone-400 hover:border-stone-700' : 'bg-stone-50 border-stone-250 text-stone-600 hover:bg-stone-100'
                                      }`}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Filter by Project */}
                              <div className="space-y-1">
                                <span className="font-extrabold text-[10px] text-stone-400 uppercase tracking-wide">Project Scope</span>
                                <select
                                  value={selectedProjectId}
                                  onChange={(e) => setSelectedProjectId(e.target.value)}
                                  className={`w-full text-xs p-1.5 rounded-md border focus:outline-none focus:border-emerald-505 transition-colors ${
                                    isDark ? 'bg-stone-900 border-stone-800 text-stone-200' : 'bg-stone-50 border-stone-200 text-stone-800 font-medium'
                                  }`}
                                >
                                  <option value="all">All House Projects</option>
                                  {projects.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                </div>

              </div>

              {/* Robust Active Filter Badges Grid */}
              {isFilterActive && (
                <div className="flex flex-wrap items-center gap-1.5 px-1" id="active-filter-pills-row">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#a1a1aa] flex items-center gap-1">
                    Filters On:
                  </span>
                  
                  {filterPersonId !== 'all' && (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                      isDark ? 'bg-[#1b1b1f] border-stone-800 text-stone-300 hover:border-stone-700' : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300 shadow-xs'
                    }`}>
                      <span>Who: <strong className={isDark ? 'text-emerald-400' : 'text-emerald-800'}>{people.find(p => p.id === filterPersonId)?.name || 'Unknown'}</strong></span>
                      <button onClick={() => setFilterPersonId('all')} className="text-stone-400 hover:text-stone-600 transition-colors shrink-0 cursor-pointer">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}

                  {filterStatus !== 'all' && (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                      isDark ? 'bg-[#1b1b1f] border-stone-800 text-stone-300 hover:border-stone-700' : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300 shadow-xs'
                    }`}>
                      <span>Status: <strong className={isDark ? 'text-emerald-400' : 'text-emerald-800'}>{filterStatus === 'pending' ? 'Pending' : filterStatus === 'in_progress' ? 'Active' : 'Completed'}</strong></span>
                      <button onClick={() => setFilterStatus('all')} className="text-stone-400 hover:text-stone-600 transition-colors shrink-0 cursor-pointer">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}

                  {filterPriority !== 'all' && (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                      isDark ? 'bg-[#1b1b1f] border-stone-800 text-stone-300 hover:border-stone-700' : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300 shadow-xs'
                    }`}>
                      <span>Priority: <strong className={`uppercase ${filterPriority === 'high' ? 'text-red-500' : filterPriority === 'medium' ? 'text-amber-500' : 'text-blue-500'}`}>{filterPriority}</strong></span>
                      <button onClick={() => setFilterPriority('all')} className="text-stone-400 hover:text-stone-600 transition-colors shrink-0 cursor-pointer">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}

                  {selectedProjectId !== 'all' && (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                      isDark ? 'bg-[#1b1b1f] border-stone-800 text-stone-300 hover:border-stone-700' : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300 shadow-xs'
                    }`}>
                      <span>Project: <strong className={isDark ? 'text-emerald-400' : 'text-emerald-800'}>{projects.find(p => p.id === selectedProjectId)?.name || 'Unknown'}</strong></span>
                      <button onClick={() => setSelectedProjectId('all')} className="text-stone-400 hover:text-stone-600 transition-colors shrink-0 cursor-pointer">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setFilterPersonId('all');
                      setFilterStatus('all');
                      setFilterPriority('all');
                      setSelectedProjectId('all');
                    }}
                    className={`text-[9px] font-bold text-rose-500 hover:text-rose-450 px-1.5 py-0.5 rounded transition-all cursor-pointer`}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* Checklist Section */}
            <div className="space-y-3.5" id="tasks-deck">
              <div className="flex items-center justify-between px-0.5" id="checklist-caption-row">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">House Tasks Checklist</h3>
                <span className="text-[10px] text-stone-400">Click task to expand updates & notes</span>
              </div>
              <TaskListing
                forcedKind={
                  mobileTaskSegment === 'projects'
                    ? 'project'
                    : mobileTaskSegment === 'chores'
                    ? 'chore'
                    : undefined
                }
              />
            </div>

            </div> {/* Closes activeMobileTab === 'tasks' wrapper */}

          </div>
        </div>

        {/* Mobile Bottom Navigation Bar (Tabs) */}
        <MobileBottomNav
          activeTab={activeMobileTab}
          onTabChange={setActiveMobileTab}
          onOpenAddModal={() => handleOpenAddModal(activeMobileTab === 'chores' ? 'chore' : 'project')}
          taskCount={totalRemainingTasks}
          choreCount={totalRemainingChores}
          projectCount={projects.length}
        />

        {/* Add Task / Chore Bottom Sheet Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" id="add-task-modal-overlay">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddModal(false)}
                className="fixed inset-0 bg-black/65 backdrop-blur-xs"
              />
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className={`relative w-full max-w-lg rounded-t-3xl sm:rounded-2xl border p-5 max-h-[90vh] overflow-y-auto shadow-2xl z-10 transition-colors ${
                  isDark ? 'bg-[#141416] border-[#222226] text-white' : 'bg-white border-stone-200 text-stone-900'
                }`}
              >
                <div className="w-12 h-1 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mb-3 sm:hidden" />
                <div className="flex items-center justify-between pb-3 border-b dark:border-[#222226] border-stone-200 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <h3 className="text-base font-extrabold tracking-tight">Add New Item</h3>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <AddTaskQuick
                  isModal={true}
                  onClose={() => setShowAddModal(false)}
                  defaultKind={addModalKind}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Project Progress Floating Modal */}
      <AnimatePresence>
        {showProgressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" id="progress-modal-overlay">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProgressModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`relative max-w-lg w-full rounded-2xl border p-6 flex flex-col max-h-[85vh] overflow-hidden transition-all ${
                isDark ? 'bg-[#141416] border-[#222226] text-white shadow-2xl' : 'bg-white border-stone-200 text-stone-800 shadow-2xl'
              }`}
              id="progress-modal-card"
            >
              {/* Header row */}
              <div className="flex items-start justify-between pb-3 border-b border-dashed border-stone-500/10" id="progress-modal-header">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Project Progress Overview
                  </span>
                  <h3 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>
                    {activeTitle}
                  </h3>
                </div>
                
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="p-1 px-1.5 rounded-lg text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body (Scrollable content) */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin scrollbar-thumb-stone-500/20" id="modal-scroll-body">
                
                {/* 1. Progress representation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center" id="modal-dashboard-insights">
                  {/* Radial Progress Gauge */}
                  <div className="flex flex-col items-center justify-center py-2" id="modal-radial-gauge">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          className={isDark ? "stroke-stone-800" : "stroke-stone-100"}
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <motion.circle
                          cx="56"
                          cy="56"
                          r="48"
                          className="stroke-emerald-400"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 48}
                          initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - percentCompleted / 100) }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-2xl font-extrabold tracking-tight">{percentCompleted}%</span>
                        <p className="text-[9px] uppercase tracking-wider text-stone-400">Done</p>
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-stone-400 mt-2 font-medium">
                      {completedScope} completed • {remainingTasks.length} left
                    </p>
                  </div>

                  {/* Dynamic upbeat encouragement */}
                  {(() => {
                    const getEncouragement = (pct: number) => {
                      if (pct === 100) {
                        return {
                          title: "Outstanding Achievement! 🎉",
                          message: "You've fully completed this project list! Step back, take a breath, and admire your craft. Your home is in incredible shape because of your dedication.",
                          vibe: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        };
                      }
                      if (pct >= 80) {
                        return {
                          title: "Almost there! Amazing focus 🌟",
                          message: "You are on the absolute home stretch of this list! The finish line is fully in sight. Phenomenal work keeping up with your home's needs.",
                          vibe: "bg-teal-500/10 text-teal-400 border-teal-500/20"
                        };
                      }
                      if (pct >= 50) {
                        return {
                          title: "Halfway mark passed! 🚀",
                          message: "Splendid job! You've crossed the halfway threshold. You are executing beautifully, making consistent, lasting progress on your home.",
                          vibe: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        };
                      }
                      if (pct >= 25) {
                        return {
                          title: "Great momentum! 💪",
                          message: "You are building excellent compound traction! Every single task checked off makes your living space more comfortable and pleasant.",
                          vibe: "bg-amber-500/10 text-amber-550 border-amber-500/20"
                        };
                      }
                      if (pct > 0) {
                        return {
                          title: "First steps, strong start! 🌱",
                          message: "Each checked task is a great win! There's no rush—taking care of a home is a steady journey, and you're moving forward beautifully.",
                          vibe: "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        };
                      }
                      return {
                        title: "Ready when you are! 📝",
                        message: "A perfect fresh slate. Take things one task at a time, at your own perfect pace. We're here to help you coordinate your space.",
                        vibe: "bg-stone-500/10 text-stone-400 border-stone-500/20"
                      };
                    };
                    const enc = getEncouragement(percentCompleted);
                    return (
                      <div className={`p-4 rounded-xl border flex flex-col justify-center h-full text-center md:text-left ${enc.vibe}`} id="modal-encouragement-card">
                        <h4 className="font-bold text-sm tracking-tight flex items-center justify-center md:justify-start gap-1.5">
                          <Smile className="w-4 h-4" />
                          {enc.title}
                        </h4>
                        <p className="text-xs leading-relaxed mt-1.5 opacity-90">
                          {enc.message}
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* 2. Remaining / Focus Items (Overdue & High Priority) */}
                {(() => {
                  const getAssigneeName = (assigneeId?: string) => {
                    if (!assigneeId) return '';
                    const person = people.find(p => p.id === assigneeId);
                    return person ? `assigned to ${person.name}` : '';
                  };

                  return (
                    <>
                      {(overdueTasks.length > 0 || highPriorityTasks.length > 0) && (
                        <div className="space-y-2" id="modal-focus-section">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 px-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                            High Priority & Overdue Focus
                          </h4>
                          
                          <div className="space-y-1.5" id="modal-focus-list">
                            {overdueTasks.map(t => (
                              <div 
                                key={t.id}
                                className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs transition-colors ${
                                  isDark ? 'bg-rose-950/15 border-rose-500/20 text-rose-200' : 'bg-rose-50/50 border-rose-200 text-rose-900'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                  <span className="truncate font-semibold">{t.title}</span>
                                  {t.assigneeId && (
                                    <span className="text-[10px] opacity-75 italic truncate">({getAssigneeName(t.assigneeId)})</span>
                                  )}
                                </div>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 font-bold uppercase shrink-0">
                                  Overdue ({t.targetDate})
                                </span>
                              </div>
                            ))}

                            {highPriorityTasks.map(t => (
                              <div 
                                key={t.id}
                                className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs transition-colors ${
                                  isDark ? 'bg-amber-950/15 border-amber-500/20 text-amber-200' : 'bg-amber-50/50 border-amber-200 text-amber-900'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <span className="truncate font-semibold">{t.title}</span>
                                  {t.assigneeId && (
                                    <span className="text-[10px] opacity-75 italic truncate">({getAssigneeName(t.assigneeId)})</span>
                                  )}
                                </div>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 font-bold uppercase shrink-0">
                                  High Priority
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3. General remaining list */}
                      {otherRemainingTasks.length > 0 && (
                        <div className="space-y-2" id="modal-remaining-section">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1">
                            Active Backlog ({otherRemainingTasks.length})
                          </h4>
                          <div className={`p-1.5 rounded-xl border max-h-40 overflow-y-auto space-y-1 ${isDark ? 'bg-[#18181b] border-[#222226]' : 'bg-stone-50 border-stone-200'}`} id="modal-remaining-list">
                            {otherRemainingTasks.map(t => (
                              <div 
                                key={t.id}
                                className={`p-2 rounded-md flex items-center justify-between gap-3 text-xs ${
                                  isDark ? 'hover:bg-[#1f1f23]' : 'hover:bg-white'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-stone-450 shrink-0" />
                                  <span className={`truncate font-medium ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>{t.title}</span>
                                  {t.assigneeId && (
                                    <span className="text-[9px] opacity-65 italic truncate">({getAssigneeName(t.assigneeId)})</span>
                                  )}
                                </div>
                                {t.targetDate && (
                                  <span className="text-[9px] opacity-60 shrink-0">{t.targetDate}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 4. Completed tasks gallery */}
                      <div className="space-y-2" id="modal-completed-section">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5 px-1">
                          <Trophy className="w-3.5 h-3.5" />
                          Completed Wins ({completedTasks.length})
                        </h4>
                        
                        {completedTasks.length > 0 ? (
                          <div className={`p-1.5 rounded-xl border max-h-40 overflow-y-auto space-y-1 ${isDark ? 'bg-[#18181b] border-[#222226]' : 'bg-stone-50/60 border-stone-200'}`} id="modal-completed-list">
                            {completedTasks.map(t => (
                              <div 
                                key={t.id}
                                className="p-2 rounded-md flex items-center gap-2 text-xs opacity-75 line-through decoration-emerald-500/40 text-stone-400"
                              >
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span className="truncate">{t.title}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className={`p-4 rounded-xl border text-center text-xs italic ${isDark ? 'bg-[#18181b]/50 border-dashed border-stone-800 text-stone-500' : 'bg-stone-50/50 border-dashed border-stone-200 text-stone-500'}`} id="modal-completed-empty">
                            No tasks completed yet. Let's make today your first checkmark victory! ✨
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Footer buttons */}
              <div className="pt-3 border-t border-dashed border-stone-500/10 flex justify-end" id="progress-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowProgressModal(false)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-1.5 ${
                    isDark 
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-lg shadow-emerald-500/10' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/10'
                  }`}
                >
                  Keep up the great work! ✨
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HoneydewAppContent() {
  const { user, loading, login, logout, theme, loginError, setLoginError, firestoreError, setFirestoreError } = useHoneydew();
  const isDark = theme === 'dark';

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen text-center transition-colors duration-300 ${isDark ? 'bg-[#0E0E10] text-[#E4E4E7]' : 'bg-[#fafafa]'}`} id="app-loading-screen">
        <div className="flex flex-col items-center gap-4" id="loading-spinner-wrapper">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-wide">Syncing house coordinates...</p>
        </div>
      </div>
    );
  }

  if (firestoreError) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen p-6 transition-colors duration-300 ${isDark ? 'bg-[#0E0E10] text-[#E4E4E7]' : 'bg-[#fafafa] text-stone-850'}`} id="app-firestore-error-screen">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-xl w-full p-8 rounded-2xl border flex flex-col space-y-6 transition-all ${isDark ? 'bg-[#141416]/90 border-[#222226]' : 'bg-white border-stone-200 shadow-md'}`}
          id="firestore-error-card"
        >
          <div className="flex items-start gap-4">
            <div className={`p-4 rounded-xl border shrink-0 ${isDark ? 'bg-[#ef4444]/15 border-[#ef4444]/30' : 'bg-red-50 border-red-200'}`} id="firestore-error-icon">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <div className="space-y-2 text-left">
              <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>Firestore Database Setup</h1>
              <p className="text-stone-400 text-xs">A permissions or database setup issue occurred while loading records for <strong className="font-bold text-amber-500">honeydew-31ad7</strong>:</p>
            </div>
          </div>

          <div className={`p-4 rounded-xl border text-left text-xs font-mono select-all overflow-x-auto max-h-[120px] ${isDark ? 'bg-red-950/20 border-red-500/20 text-red-300' : 'bg-red-50 border-red-200 text-red-900'}`}>
            {firestoreError}
          </div>

          <div className="border-t border-dashed border-stone-500/15 pt-4 text-left space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500">How to Fix This in Your Firebase Console:</h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <p className="font-bold text-emerald-500 flex items-center gap-1.5">
                  1. Initialize Firestore Database (CRITICAL)
                </p>
                <p className="text-stone-400 leading-relaxed">
                  Go to your Firebase Console for project <strong className="font-bold text-amber-500 bg-amber-500/10 px-1 rounded">honeydew-31ad7</strong>. Click on <strong className="font-bold">Firestore Database</strong> in the left main menu, then click the <strong className="font-bold text-emerald-400">Create database</strong> button. Complete the steps to provision the <strong className="font-bold">"(default)"</strong> instance of Cloud Firestore.
                </p>
              </div>

              <div className="w-full border-t border-stone-500/10 my-2" />

              <div className="space-y-1.5">
                <p className="font-bold text-emerald-500">
                  2. Wait & Refresh
                </p>
                <p className="text-stone-400 leading-relaxed">
                  Once your database is created, the system's compiled <code className="font-mono bg-stone-500/15 p-0.5 rounded">firestore.rules</code> are already active. Click "Retry Connection" below or refresh the app page!
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => {
                setFirestoreError(null);
                // Trigger a full page reload or trigger state refresh
                window.location.reload();
              }}
              className={`px-4 py-2.5 rounded-lg font-bold text-xs cursor-pointer ${
                isDark ? 'bg-stone-800 hover:bg-stone-700 text-stone-300' : 'bg-stone-100 hover:bg-stone-200 text-stone-750'
              }`}
            >
              Retry Connection
            </button>
            <button
              onClick={() => logout()}
              className="px-4 py-2.5 rounded-lg font-bold text-xs bg-red-650 text-white hover:bg-red-650"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen p-6 transition-colors duration-300 ${isDark ? 'bg-[#0E0E10] text-[#E4E4E7]' : 'bg-[#fafafa] text-stone-850'}`} id="app-signin-screen">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-md w-full p-8 rounded-2xl border flex flex-col items-center text-center space-y-6 transition-all ${isDark ? 'bg-[#141416]/90 border-[#222226]' : 'bg-white border-stone-200 shadow-md'}`}
          id="signin-card"
        >
          {/* Logo element matches brand */}
          <div className="flex items-center justify-center" id="signin-logo">
            <HoneydewLogo className="w-16 h-16 shadow-sm rounded-2xl" />
          </div>

          <div className="space-y-2" id="signin-promo-caption">
            <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>Yesado!</h1>
            <p className="text-stone-450 text-sm font-medium">Coordinate, collaborate, and say &ldquo;Yesado!&rdquo; to getting home projects and chores done together.</p>
          </div>

          <div className="w-full border-t border-dashed border-stone-500/20 my-2" />

          <button
            onClick={login}
            className={`w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] cursor-pointer shadow-xs ${
              isDark 
                ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            id="google-signin-btn"
          >
            {/* Google Logo Icon */}
            <svg className="w-5 h-5 shrink-0 bg-white p-0.5 rounded-full" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>

          {loginError && (
            <div className={`text-left p-4.5 rounded-xl border text-[11px] leading-relaxed space-y-2.5 max-h-[280px] overflow-y-auto ${isDark ? 'bg-red-950/20 border-red-500/30 text-red-200' : 'bg-red-50 border-red-250 text-red-950'}`} id="login-error-container">
              <div className="flex items-center gap-2 font-bold text-red-500">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-xs">Authentication Setup Required</span>
              </div>
              <p className="opacity-90">{loginError}</p>
              
              {loginError && (loginError.includes("Unauthorized Domain") || loginError.includes("closed before completion")) && (
                <div className={`mt-3 pt-3 border-t ${isDark ? 'border-red-500/25 text-stone-300' : 'border-red-200 text-stone-700'} space-y-2.5`}>
                  <p className="font-bold text-xs uppercase tracking-wider text-rose-450">Two-Step Verification Checklist:</p>
                  
                  <div className="space-y-1">
                    <p className="font-bold">1. Enable Google Sign-In Provider</p>
                    <p className="opacity-80">Go to your Firebase Console for project <strong className="font-bold text-amber-500">honeydew-31ad7</strong> &gt; <strong className="font-bold">Authentication</strong> &gt; <strong className="font-bold">Sign-in method</strong> &gt; Add standard Google provider &gt; click Enable, configure support email, and save.</p>
                  </div>
                  
                  <div className="space-y-1 pt-1.5 border-t border-dashed border-red-500/10">
                    <p className="font-bold">2. Add Authorized Domains</p>
                    <p className="opacity-80">Navigate to <strong className="font-bold">Authentication</strong> &gt; <strong className="font-bold">Settings</strong> &gt; <strong className="font-bold">Authorized Domains</strong>, and add these exact hostnames:</p>
                    <div className="mt-1 space-y-1">
                      <div className={`p-1.5 font-mono rounded text-[10px] select-all flex items-center justify-between ${isDark ? 'bg-[#0b0c10] text-emerald-400' : 'bg-white text-emerald-700 shadow-2xs border border-stone-200'}`}>
                        <span>ais-dev-3gw47djahsr4g5wth5fxl3-524604980633.us-east1.run.app</span>
                        <span className="text-[8px] uppercase tracking-wider opacity-60">Copy</span>
                      </div>
                      <div className={`p-1.5 font-mono rounded text-[10px] select-all flex items-center justify-between ${isDark ? 'bg-[#0b0c10] text-emerald-400' : 'bg-white text-emerald-700 shadow-2xs border border-stone-200'}`}>
                        <span>ais-pre-3gw47djahsr4g5wth5fxl3-524604980633.us-east1.run.app</span>
                        <span className="text-[8px] uppercase tracking-wider opacity-60">Copy</span>
                      </div>
                    </div>
                  </div>

                  <p className="italic opacity-85 mt-2 bg-yellow-950/10 dark:bg-yellow-950/30 p-2 rounded-lg border border-yellow-500/15 text-[10.5px]">
                    Note: If currently inside the AI Studio sidebar preview, cross-origin communication policies will block the auth loop. Please click <strong className="font-bold">Open App in new tab</strong> (top right) to perform sign-in successfully!
                  </p>
                </div>
              )}
              
              <button 
                type="button" 
                onClick={() => setLoginError(null)}
                className="mt-1 font-bold underline cursor-pointer text-[10px] uppercase opacity-75 hover:opacity-100 block"
              >
                Dismiss Error
              </button>
            </div>
          )}

          <p className="text-[11px] text-stone-500">
            A secure cloud account will be configured automatically to save and synchronize your checklist.
          </p>
        </motion.div>
      </div>
    );
  }

  return <HoneydewDashboard />;
}

export default function App() {
  return (
    <HoneydewProvider>
      <HoneydewAppContent />
    </HoneydewProvider>
  );
}
