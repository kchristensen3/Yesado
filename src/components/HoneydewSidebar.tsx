import React, { useState } from 'react';
import { useHoneydew } from '../context/HoneydewContext';
import { Folder, Users, Plus, Trash2, Tag, Check, X, ShieldAlert, Sun, Moon, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HoneydewLogo } from './HoneydewLogo';

const AVATAR_BG_TEMPLATES = [
  'bg-emerald-500 text-white',
  'bg-rose-500 text-white',
  'bg-amber-400 text-slate-900',
  'bg-blue-500 text-white',
  'bg-violet-500 text-white',
  'bg-orange-500 text-white',
  'bg-indigo-500 text-white',
];

export const HoneydewSidebar: React.FC = () => {
  const {
    projects,
    tasks,
    people,
    houses,
    activeHouseId,
    setActiveHouseId,
    addHouse,
    addCollaboratorToHouse,
    removeCollaboratorFromHouse,
    updateHouse,
    selectedProjectId,
    setSelectedProjectId,
    addProject,
    deleteProject,
    updateProject,
    addPerson,
    deletePerson,
    updatePerson,
    theme,
    toggleTheme,
    user,
    logout,
    filterPersonId,
    setFilterPersonId,
  } = useHoneydew();

  const handlePersonClick = (id: string) => {
    if (filterPersonId === id) {
      setFilterPersonId('all');
    } else {
      setFilterPersonId(id);
    }
  };

  const [newProjName, setNewProjName] = useState('');
  const [newProjColor, setNewProjColor] = useState('emerald');
  const [showProjInput, setShowProjInput] = useState(false);

  const [newPersonName, setNewPersonName] = useState('');
  const [showPersonInput, setShowPersonInput] = useState(false);

  // House states
  const [showAddHouseInput, setShowAddHouseInput] = useState(false);
  const [newHouseName, setNewHouseName] = useState('');
  
  const [showAddCollabForm, setShowAddCollabForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const [showEditHouse, setShowEditHouse] = useState(false);
  const [editHouseName, setEditHouseName] = useState('');
  const [editHouseAddress, setEditHouseAddress] = useState('');
  const [editHousePropertyType, setEditHousePropertyType] = useState('');

  const activeHouse = houses.find((h) => h.id === activeHouseId);

  const handleCreateHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHouseName.trim()) return;
    await addHouse(newHouseName);
    setNewHouseName('');
    setShowAddHouseInput(false);
  };

  const handleInviteCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeHouseId) return;
    await addCollaboratorToHouse(activeHouseId, inviteEmail);
    setInviteEmail('');
    setShowAddCollabForm(false);
  };

  // Edit states
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjName, setEditProjName] = useState('');
  const [editProjColor, setEditProjColor] = useState('emerald');
  const [editProjDesc, setEditProjDesc] = useState('');

  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [editPersonName, setEditPersonName] = useState('');
  const [editPersonColor, setEditPersonColor] = useState('');

  const handleUpdateProject = async (id: string) => {
    if (!editProjName.trim()) return;
    await updateProject(id, {
      name: editProjName.trim(),
      colorClass: editProjColor,
      description: editProjDesc.trim(),
    });
    setEditingProjectId(null);
  };

  const handleUpdatePerson = async (id: string) => {
    if (!editPersonName.trim()) return;
    await updatePerson(id, {
      name: editPersonName.trim(),
      colorClass: editPersonColor,
    });
    setEditingPersonId(null);
  };

  const isDark = theme === 'dark';

  // Helper to count pending tasks in a project
  const getPendingCount = (projId: string) => {
    if (projId === 'all') {
      return tasks.filter((t) => t.status !== 'completed').length;
    }
    return tasks.filter((t) => t.projectId === projId && t.status !== 'completed').length;
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    const np = await addProject(newProjName, '', newProjColor);
    if (np) {
      setSelectedProjectId(np.id);
    }
    setNewProjName('');
    setShowProjInput(false);
  };

  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    await addPerson(newPersonName);
    setNewPersonName('');
    setShowPersonInput(false);
  };

  return (
    <div className={`flex flex-col h-full p-5 border-r transition-all duration-300 ${isDark ? 'bg-[#141416] text-stone-200 border-[#222226]' : 'bg-[#f4f4f5] text-stone-700 border-stone-200'}`} id="sidebar-container">
      {/* Dynamic App Title */}
      <div className="flex items-center gap-3 mb-6" id="sidebar-header">
        <div className={`p-1.5 rounded-xl border transition-colors ${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-250'}`} id="sidebar-logo">
          <HoneydewLogo className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className={`text-xl font-bold tracking-wide transition-colors ${isDark ? 'text-white' : 'text-stone-800'}`} id="sidebar-title">Yesado</h1>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">Yes I do!</span>
          </div>
          <p className="text-xs text-stone-400 font-medium" id="sidebar-subtitle">Family House Projects</p>
        </div>
      </div>

      {/* Property/House Switcher */}
      <div className={`mb-6 p-3 rounded-xl border transition-colors ${isDark ? 'bg-[#18181b]/65 border-[#222226]' : 'bg-white border-stone-200/95 shadow-xs'}`} id="house-switcher-container">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-450 mb-1.5 flex items-center justify-between">
          <span>Active House</span>
          <button 
            onClick={() => setShowAddHouseInput(!showAddHouseInput)}
            className="text-emerald-500 hover:text-emerald-400 font-extrabold cursor-pointer flex items-center gap-0.5 text-[9px]"
            id="trigger-add-house-btn"
          >
            <Plus className="w-2.5 h-2.5" /> ADD
          </button>
        </label>
        
        {showAddHouseInput ? (
          <form onSubmit={handleCreateHouse} className="flex gap-1.5 mb-2.5" id="house-add-form">
            <input
              type="text"
              placeholder="e.g. Primary, Beach Cabin"
              value={newHouseName}
              onChange={(e) => setNewHouseName(e.target.value)}
              className={`flex-1 text-xs px-2 py-1.5 rounded border focus:outline-none focus:border-emerald-500 font-medium ${isDark ? 'bg-[#121214] text-white border-[#2c2c34]' : 'bg-stone-50 border-stone-250 text-stone-900'}`}
              autoFocus
              required
              id="new-house-input"
            />
            <button type="submit" className="px-2 py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs" id="submit-new-house">
              Add
            </button>
            <button type="button" onClick={() => setShowAddHouseInput(false)} className="p-1 px-1.5 rounded cursor-pointer border border-stone-500/20 text-stone-400 hover:text-stone-250" id="cancel-new-house">
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <div className="space-y-2" id="house-selector-with-actions">
            <div className="flex gap-2 items-center" id="house-dropdown-row">
              <div className="relative flex-1" id="house-select-box-wrapper">
                <select
                  value={activeHouseId}
                  onChange={(e) => {
                    setActiveHouseId(e.target.value);
                    setSelectedProjectId('all'); // Reset project filter on swap
                    setShowEditHouse(false); // Close edit mode upon switching house
                  }}
                  className={`w-full text-xs font-semibold rounded-lg p-2 pr-8 border focus:outline-none focus:border-emerald-500 bg-transparent cursor-pointer appearance-none ${isDark ? 'text-white border-[#2a2a30]' : 'text-stone-900 border-stone-250 bg-white'}`}
                  id="house-select-dropdown"
                >
                  {houses.map((h) => (
                    <option key={h.id} value={h.id} className={isDark ? 'bg-[#18181b] text-white' : 'bg-white text-stone-900'}>
                      {h.name} {h.ownerId === user?.uid ? '🔑' : '👥'}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-stone-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>

              {activeHouse && (
                <button
                  type="button"
                  onClick={() => {
                    setEditHouseName(activeHouse.name || '');
                    setEditHouseAddress(activeHouse.address || '');
                    setEditHousePropertyType(activeHouse.propertyType || '');
                    setShowEditHouse(!showEditHouse);
                  }}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    showEditHouse
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : isDark
                      ? 'border-[#2a2a30] text-stone-400 hover:text-white hover:bg-stone-800'
                      : 'border-stone-255 text-stone-500 hover:text-stone-900 hover:bg-stone-50 shadow-xs'
                  }`}
                  title="Configure Home Address and Settings"
                  id="edit-house-details-toggle"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Existing House Metadata Bullets (when not in edit mode) */}
            {activeHouse && (activeHouse.address || activeHouse.propertyType) && !showEditHouse && (
              <div className={`p-2 rounded-lg border space-y-1 text-left ${isDark ? 'bg-[#111112]/50 border-stone-550/10' : 'bg-stone-50/50 border-stone-150'}`} id="active-house-meta-bullets">
                {activeHouse.propertyType && (
                  <div className="flex items-center gap-1.5 text-[9.5px] font-semibold text-stone-400 uppercase tracking-widest" id="active-house-meta-type">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>Type: <strong className={isDark ? 'text-stone-200 font-semibold' : 'text-stone-750 font-bold'}>{activeHouse.propertyType}</strong></span>
                  </div>
                )}
                {activeHouse.address && (
                  <div className="flex items-start gap-1.5 text-[10px] text-stone-400 font-medium leading-tight" id="active-house-meta-address">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 shrink-0" />
                    <span className="break-all italic select-all">{activeHouse.address}</span>
                  </div>
                )}
              </div>
            )}

            {/* Custom Edit Accordion Panel */}
            <AnimatePresence>
              {showEditHouse && activeHouse && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                  id="edit-house-panel-accordion"
                >
                  <div className={`p-3 rounded-lg border space-y-2.5 my-1 text-left ${isDark ? 'bg-[#121214] border-[#222226]' : 'bg-stone-50 border-stone-200'}`} id="edit-house-panel">
                    <div className="flex items-center justify-between" id="edit-house-header">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-450 flex items-center gap-1">
                        <Pencil className="w-2.5 h-2.5" /> Edit Home Info
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowEditHouse(false)}
                        className="text-[9px] text-stone-450 hover:text-stone-300 font-bold"
                      >
                        CLOSE
                      </button>
                    </div>

                    <div className="space-y-2" id="edit-house-fields">
                      {/* Name input */}
                      <div className="space-y-1">
                        <label className="block text-[8px] font-extrabold uppercase tracking-widest text-stone-450">Home Name</label>
                        <input
                          type="text"
                          value={editHouseName}
                          onChange={(e) => setEditHouseName(e.target.value)}
                          placeholder="e.g. My Cozy Home"
                          className={`w-full text-xs px-2 py-1.5 rounded border focus:outline-none focus:border-emerald-500 font-semibold ${isDark ? 'bg-[#18181b] text-white border-[#2c2c34]' : 'bg-white border-stone-250 text-stone-900'}`}
                          required
                        />
                      </div>

                      {/* Property Type Dropdown */}
                      <div className="space-y-1">
                        <label className="block text-[8px] font-extrabold uppercase tracking-widest text-stone-450">Property Type</label>
                        <select
                          value={editHousePropertyType}
                          onChange={(e) => setEditHousePropertyType(e.target.value)}
                          className={`w-full text-xs px-1.5 py-1.5 rounded border focus:outline-none focus:border-emerald-500 font-medium ${isDark ? 'bg-[#18181b] text-white border-[#2c2c34]' : 'bg-white border-stone-200 text-stone-900'}`}
                        >
                          <option value="">Select type...</option>
                          <option value="Single Family">Single Family</option>
                          <option value="Townhouse">Townhouse</option>
                          <option value="Condo">Condo</option>
                          <option value="Apartment">Apartment</option>
                          <option value="Duplex">Duplex</option>
                          <option value="Cottage">Cottage / Cabin</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Address input */}
                      <div className="space-y-1">
                        <label className="block text-[8px] font-extrabold uppercase tracking-widest text-stone-450">Address / Location</label>
                        <input
                          type="text"
                          value={editHouseAddress}
                          onChange={(e) => setEditHouseAddress(e.target.value)}
                          placeholder="e.g. 123 Maple Rd, Seattle"
                          className={`w-full text-xs px-2 py-1.5 rounded border focus:outline-none focus:border-emerald-500 font-medium ${isDark ? 'bg-[#18181b] text-white border-[#2c2c34]' : 'bg-white border-stone-250 text-stone-900'}`}
                        />
                      </div>
                    </div>

                    <div className="pt-1" id="edit-house-actions">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!editHouseName.trim()) return;
                          await updateHouse(activeHouse.id, {
                            name: editHouseName.trim(),
                            propertyType: editHousePropertyType,
                            address: editHouseAddress.trim()
                          });
                          setShowEditHouse(false);
                        }}
                        className="w-full py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] transition-colors cursor-pointer uppercase tracking-wider"
                      >
                        Save Configuration
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Collaborators Management Section */}
        {activeHouse && (
          <div className="mt-3 pt-2.5 border-t border-dashed border-stone-500/10" id="collaborators-mini-section">
            <div className="flex items-center justify-between pointer-events-auto">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-stone-450 flex items-center gap-1">
                <Users className="w-3 h-3" /> Shared Members
              </span>
              <button
                onClick={() => setShowAddCollabForm(!showAddCollabForm)}
                className="text-[9px] text-emerald-500 font-extrabold hover:text-emerald-400 cursor-pointer flex items-center gap-0.5"
                id="toggle-collab-invite-btn"
              >
                <Plus className="w-2.5 h-2.5" /> INVITE
              </button>
            </div>

            {showAddCollabForm && (
              <form onSubmit={handleInviteCollaborator} className="flex gap-1.5 mt-2" id="collab-add-form">
                <input
                  type="email"
                  placeholder="collaborator@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className={`flex-1 text-[10px] px-2 py-1.5 rounded border focus:outline-none focus:border-emerald-500 font-medium ${isDark ? 'bg-[#121214] text-white border-[#2c2c34]' : 'bg-stone-50 border-stone-250 text-stone-900'}`}
                  autoFocus
                  required
                  id="collab-email-input"
                />
                <button type="submit" className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] rounded" id="submit-collab-invite">
                  Invite
                </button>
              </form>
            )}

            <div className="mt-2 space-y-1 max-h-[85px] overflow-y-auto pr-1" id="collaborators-pills-list">
              {activeHouse.collaborators.map((cEmail) => {
                const isMe = cEmail === user?.email?.toLowerCase();
                const isHouseOwner = activeHouse.ownerId === user?.uid;
                return (
                  <div key={cEmail} className={`flex items-center justify-between px-2 py-1 rounded text-[10px] font-medium border ${isDark ? 'bg-[#111112] border-[#222226]' : 'bg-stone-50 border-stone-200'}`} id={`collab-pill-${cEmail}`}>
                    <span className="truncate flex-1 pr-1.5" title={cEmail}>
                      {cEmail} {isMe && <span className="text-[8px] text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded ml-1">Me</span>}
                    </span>
                    {isHouseOwner && !isMe ? (
                      <button
                        type="button"
                        onClick={() => removeCollaboratorFromHouse(activeHouse.id, cEmail)}
                        className="text-stone-450 hover:text-red-500 cursor-pointer p-0.5"
                        title="Remove Collaborator"
                        id={`remove-collab-${cEmail}`}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto space-y-7 pr-1" id="sidebar-projects-section">
        <div>
          <div className="flex items-center justify-between mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-stone-400" id="projects-header">
            <span className="flex items-center gap-1.5"><Folder className="w-3.5 h-3.5" /> Projects</span>
            <button
              onClick={() => setShowProjInput(!showProjInput)}
              className={`transition-colors p-1 ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}
              id="add-project-btn"
              title="Add New Project"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <AnimatePresence>
            {showProjInput && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateProject}
                className={`p-3 rounded-lg border mb-3 space-y-2.5 transition-colors ${isDark ? 'bg-[#1b1b1f] border-[#2d2d35]' : 'bg-white border-stone-200 shadow-sm'}`}
                id="new-project-form"
              >
                <input
                  type="text"
                  placeholder="e.g. Backyard deck"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className={`w-full text-xs font-medium rounded p-2 border focus:outline-none focus:border-emerald-500 transition-colors ${isDark ? 'bg-[#131316] text-white border-[#222226]' : 'bg-stone-50 text-stone-900 border-stone-250'}`}
                  autoFocus
                  id="new-project-name-input"
                />
                
                <div className="flex justify-between items-center" id="new-project-color-picker">
                  <span className="text-[10px] text-stone-400">Accent:</span>
                  <div className="flex gap-1.5">
                    {['emerald', 'amber', 'blue', 'stone', 'rose', 'indigo', 'violet', 'orange'].map((color) => {
                      const colorMap: Record<string, string> = {
                        emerald: 'bg-emerald-400',
                        amber: 'bg-amber-400',
                        blue: 'bg-blue-400',
                        stone: 'bg-stone-400',
                        rose: 'bg-rose-400',
                        indigo: 'bg-indigo-400',
                        violet: 'bg-violet-400',
                        orange: 'bg-orange-400',
                      };
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewProjColor(color)}
                          className={`w-4 h-4 rounded-full ${colorMap[color]} transition-transform ${newProjColor === color ? `ring-2 ${isDark ? 'ring-white' : 'ring-stone-600'} scale-110` : 'opacity-70 hover:opacity-100'}`}
                          title={color}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-1.5" id="new-project-actions">
                  <button
                    type="button"
                    onClick={() => setShowProjInput(false)}
                    className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="submit"
                    className="px-2 py-0.5 rounded text-[10px] bg-emerald-500 text-slate-900 font-semibold hover:bg-emerald-400 transition-colors cursor-pointer"
                  >
                    Create
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <ul className="space-y-1" id="projects-list-items">
            {/* "All Projects" category */}
            <li>
              <button
                onClick={() => setSelectedProjectId('all')}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                  selectedProjectId === 'all'
                    ? `${isDark ? 'bg-emerald-500/10 text-white' : 'bg-emerald-500/10 text-emerald-800'} font-medium border-l-2 border-emerald-500`
                    : `${isDark ? 'text-stone-400 hover:text-stone-200 hover:bg-[#18181b]' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'}`
                }`}
                id="project-all-btn"
              >
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`} />
                  All House Projects
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-md transition-colors ${isDark ? 'bg-[#1f1f24] text-stone-400' : 'bg-stone-200 text-stone-600'}`}>{getPendingCount('all')}</span>
              </button>
            </li>

            {projects.map((p) => {
              const colorMap: Record<string, string> = {
                emerald: 'bg-emerald-400',
                amber: 'bg-amber-400',
                blue: 'bg-blue-400',
                stone: 'bg-stone-400',
                rose: 'bg-rose-400',
                indigo: 'bg-indigo-400',
                violet: 'bg-violet-400',
                orange: 'bg-orange-400',
              };
              
              const isSelected = selectedProjectId === p.id;
              
              if (editingProjectId === p.id) {
                return (
                  <li key={p.id} className={`p-3 rounded-lg border mb-2 space-y-2.5 transition-colors ${isDark ? 'bg-[#1b1b1f] border-[#2d2d35]' : 'bg-white border-stone-200 shadow-sm'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Edit Project</span>
                      <button
                        onClick={() => setEditingProjectId(null)}
                        className="text-stone-400 hover:text-stone-600"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={editProjName}
                      onChange={(e) => setEditProjName(e.target.value)}
                      placeholder="Project name"
                      className={`w-full text-xs font-medium rounded p-1.5 border focus:outline-none focus:border-emerald-500 transition-colors ${isDark ? 'bg-[#131316] text-white border-[#222226]' : 'bg-stone-50 text-stone-900 border-stone-250'}`}
                      autoFocus
                    />
                    <textarea
                      value={editProjDesc}
                      onChange={(e) => setEditProjDesc(e.target.value)}
                      placeholder="Project description"
                      rows={2}
                      className={`w-full text-xs font-medium rounded p-1.5 border focus:outline-none focus:border-emerald-500 transition-colors ${isDark ? 'bg-[#131316] text-white border-[#222226]' : 'bg-stone-50 text-stone-900 border-stone-250'}`}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-stone-400">Accent:</span>
                      <div className="flex gap-1">
                        {['emerald', 'amber', 'blue', 'stone', 'rose', 'indigo', 'violet', 'orange'].map((color) => {
                          const itemColorMap: Record<string, string> = {
                            emerald: 'bg-emerald-400',
                            amber: 'bg-amber-400',
                            blue: 'bg-blue-400',
                            stone: 'bg-stone-400',
                            rose: 'bg-rose-400',
                            indigo: 'bg-indigo-400',
                            violet: 'bg-violet-400',
                            orange: 'bg-orange-400',
                          };
                          return (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setEditProjColor(color)}
                              className={`w-3.5 h-3.5 rounded-full ${itemColorMap[color]} transition-transform ${editProjColor === color ? `ring-2 ${isDark ? 'ring-white' : 'ring-stone-600'} scale-110` : 'opacity-70 hover:opacity-100'}`}
                              title={color}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingProjectId(null)}
                        className={`px-2 py-0.5 rounded text-[10px] border font-semibold ${isDark ? 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200' : 'bg-stone-50 border-stone-250 text-stone-600 hover:bg-stone-100'}`}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateProject(p.id)}
                        className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-500 text-slate-900 font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </li>
                );
              }

              return (
                <li key={p.id} className="group relative">
                  <div
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? `${isDark ? 'bg-[#1b1b1f] text-white' : 'bg-stone-200 text-stone-900'} font-medium border-l-2`
                        : `${isDark ? 'text-stone-400 hover:text-stone-200 hover:bg-[#18181b]' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'}`
                    }`}
                    style={{ borderLeftColor: isSelected ? `var(--color-${p.colorClass}-500)` : undefined }}
                    id={`project-btn-${p.id}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedProjectId(p.id);
                      }
                    }}
                  >
                    <span className="flex items-center gap-2 truncate pr-16">
                      <span className={`w-1.5 h-1.5 rounded-full ${colorMap[p.colorClass] || 'bg-stone-400'}`} />
                      <span className="truncate">{p.name}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md transition-colors ${isDark ? 'bg-[#1f1f24] text-stone-400' : 'bg-stone-100 border border-stone-200 text-stone-600'}`}>{getPendingCount(p.id)}</span>
                      {!p.id.startsWith('uncategorized') && (
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProjectId(p.id);
                              setEditProjName(p.name);
                              setEditProjDesc(p.description || '');
                              setEditProjColor(p.colorClass);
                            }}
                            className={`opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-0.5 ${isDark ? 'hover:text-emerald-400 text-stone-500' : 'hover:text-emerald-600 text-stone-400'}`}
                            title="Edit Project"
                            id={`edit-project-trigger-${p.id}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete the project "${p.name}"? Tasks inside will be preserved and moved to general.`)) {
                                deleteProject(p.id);
                              }
                            }}
                            className={`opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-0.5 ${isDark ? 'hover:text-red-400 text-stone-500' : 'hover:text-red-650 text-stone-400'}`}
                            title="Delete Project"
                            id={`delete-project-${p.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Family Board / People */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-stone-400" id="people-header">
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Family Members</span>
            <button
              onClick={() => setShowPersonInput(!showPersonInput)}
              className={`transition-colors p-1 ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}
              id="add-person-btn"
              title="Add Family Member"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <AnimatePresence>
            {showPersonInput && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreatePerson}
                className={`p-3 rounded-lg border mb-3 space-y-2.5 transition-colors ${isDark ? 'bg-[#1b1b1f] border-[#2d2d35]' : 'bg-white border-stone-200 shadow-sm'}`}
                id="new-person-form"
              >
                <input
                  type="text"
                  placeholder="Name (e.g., Yazmin)"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  className={`w-full text-xs font-medium rounded p-2 border focus:outline-none focus:border-rose-400 transition-colors ${isDark ? 'bg-[#131114] text-white border-[#222226]' : 'bg-stone-50 text-stone-900 border-stone-250'}`}
                  autoFocus
                  id="new-person-name-input"
                />
                
                <div className="flex justify-end gap-1.5" id="new-person-actions">
                  <button
                    type="button"
                    onClick={() => setShowPersonInput(false)}
                    className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="submit"
                    className="px-2 py-0.5 rounded text-[10px] bg-emerald-500 text-slate-900 font-semibold hover:bg-emerald-400 transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-2" id="people-list-container">
            {people.map((person) => {
              const initials = person.name.slice(0, 2).toUpperCase();
              
              if (editingPersonId === person.id) {
                return (
                  <div
                    key={person.id}
                    className={`p-3 rounded-lg border space-y-2.5 transition-colors ${isDark ? 'bg-[#1b1b1f] border-[#2d2d35]' : 'bg-white border-stone-200 shadow-sm'}`}
                    id={`person-row-edit-${person.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Edit Member</span>
                      <button
                        onClick={() => setEditingPersonId(null)}
                        className="text-stone-400 hover:text-stone-600"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={editPersonName}
                      onChange={(e) => setEditPersonName(e.target.value)}
                      placeholder="Name"
                      className={`w-full text-xs font-medium rounded p-1.5 border focus:outline-none focus:border-rose-400 transition-colors ${isDark ? 'bg-[#131114] text-white border-stone-850' : 'bg-stone-50 text-stone-900 border-stone-250'}`}
                      autoFocus
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] text-stone-400">Avatar Color:</span>
                      <div className="flex flex-wrap gap-1">
                        {AVATAR_BG_TEMPLATES.map((colorBg) => {
                          return (
                            <button
                              key={colorBg}
                              type="button"
                              onClick={() => setEditPersonColor(colorBg)}
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold ${colorBg} transition-all hover:scale-110 ${editPersonColor === colorBg ? 'ring-2 ring-emerald-500 scale-110' : 'opacity-70'}`}
                            >
                              {initials}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingPersonId(null)}
                        className={`px-2 py-0.5 rounded text-[10px] border font-semibold ${isDark ? 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200' : 'bg-stone-50 border-stone-250 text-stone-600 hover:bg-stone-100'}`}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdatePerson(person.id)}
                        className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-500 text-slate-900 font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                );
              }

              const isSelected = filterPersonId === person.id;

              return (
                <div
                  key={person.id}
                  onClick={() => handlePersonClick(person.id)}
                  className={`group flex items-center justify-between p-2 rounded-lg border transition-all duration-305 cursor-pointer select-none ${
                    isSelected
                      ? isDark
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-white shadow-[0_2px_8px_rgba(16,185,129,0.05)] font-bold'
                        : 'bg-emerald-50 border-emerald-250 text-emerald-950 font-bold'
                      : isDark
                        ? 'bg-[#18181b] border-[#222226] text-[#a1a1aa] hover:text-stone-200 hover:bg-[#1c1c21]'
                        : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 shadow-xs'
                  }`}
                  id={`person-row-${person.id}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handlePersonClick(person.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${person.colorClass}`} id={`person-avatar-${person.id}`}>
                      {initials}
                    </span>
                    <span className={`text-sm font-medium truncate transition-colors`} id={`person-name-${person.id}`}>{person.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPersonId(person.id);
                        setEditPersonName(person.name);
                        setEditPersonColor(person.colorClass);
                      }}
                      className={`opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all p-0.5 cursor-pointer ${isDark ? 'hover:text-emerald-400 text-stone-500' : 'hover:text-emerald-600 text-stone-400'}`}
                      title="Edit Member"
                      id={`edit-person-trigger-${person.id}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remove ${person.name} from assignee list? Their assigned tasks will remain but become unassigned.`)) {
                          deletePerson(person.id);
                        }
                      }}
                      className={`opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all p-0.5 cursor-pointer ${isDark ? 'hover:text-red-400 text-stone-500' : 'hover:text-red-650 text-stone-400'}`}
                      title="Remove Member"
                      id={`delete-person-${person.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User profile section if logged in */}
      {user && (
        <div className={`mt-5 pt-4 border-t flex items-center justify-between transition-colors ${isDark ? 'border-[#222226]' : 'border-stone-200'}`} id="sidebar-user-section">
          <div className="flex items-center gap-2 overflow-hidden">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-7 h-7 rounded-full border border-stone-550/20"
                referrerPolicy="no-referrer"
                id="user-avatar-img"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold" id="user-avatar-fallback">
                {user.displayName?.slice(0, 1).toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex flex-col min-w-0" id="user-info-text">
              <span className={`text-xs font-semibold truncate leading-none ${isDark ? 'text-stone-200' : 'text-stone-850'}`}>{user.displayName || 'Member'}</span>
              <span className="text-[9px] text-stone-500 truncate leading-tight mt-0.5">{user.email}</span>
            </div>
          </div>
          
          <button
            onClick={logout}
            className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors shrink-0 cursor-pointer ${
              isDark 
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 border-rose-500/25' 
                : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
            }`}
            id="sidebar-signout-btn"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Footer controls: theme switcher + storage backup state */}
      <div className={`mt-4 pt-4 border-t flex items-center justify-between text-[10px] font-medium transition-colors ${isDark ? 'border-[#222226] text-stone-500' : 'border-stone-200 text-stone-500'}`} id="footer-sync">
        <div className="flex items-center gap-1.5" id="sync-pill">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Realtime Cloud Sync
        </div>

        {/* Dynamic Sun/Moon Toggle Switch */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-all hover:scale-105 cursor-pointer ${
            isDark 
              ? 'bg-[#1c1c1f] hover:bg-[#25252a] text-amber-400 border-[#2b2b32]' 
              : 'bg-white hover:bg-stone-100 text-indigo-600 border-stone-200 shadow-xs'
          }`}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          id="theme-toggler"
        >
          {isDark ? (
            <>
              <Sun className="w-3 h-3 text-amber-400" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3 h-3 text-indigo-500" />
              <span>Dark</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
