import React, { useState } from 'react';
import { useYesado } from '../context/YesadoContext';
import {
  Home,
  Users,
  Plus,
  Pencil,
  Check,
  X,
  Mail,
  UserPlus,
  Shield,
  Sun,
  Moon,
  LogOut,
  MapPin,
  Building,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MobileHouseViewProps {
  onFilterPersonAndGoToTasks: (personId: string) => void;
}

export const MobileHouseView: React.FC<MobileHouseViewProps> = ({
  onFilterPersonAndGoToTasks,
}) => {
  const {
    houses,
    activeHouseId,
    setActiveHouseId,
    addHouse,
    updateHouse,
    addCollaboratorToHouse,
    removeCollaboratorFromHouse,
    people,
    addPerson,
    deletePerson,
    filterPersonId,
    setFilterPersonId,
    theme,
    toggleTheme,
    user,
    logout,
    tasks,
  } = useYesado();

  const [showEditHouse, setShowEditHouse] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editType, setEditType] = useState('');

  const [showAddHouse, setShowAddHouse] = useState(false);
  const [newHouseName, setNewHouseName] = useState('');

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');

  const isDark = theme === 'dark';
  const activeHouse = houses.find((h) => h.id === activeHouseId);

  // Initialize edit form when opening
  const handleOpenEdit = () => {
    if (activeHouse) {
      setEditName(activeHouse.name);
      setEditAddress(activeHouse.address || '');
      setEditType(activeHouse.propertyType || '');
    }
    setShowEditHouse(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !activeHouseId) return;
    await updateHouse(activeHouseId, {
      name: editName.trim(),
      address: editAddress.trim(),
      propertyType: editType.trim(),
    });
    setShowEditHouse(false);
  };

  const handleCreateHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHouseName.trim()) return;
    await addHouse(newHouseName.trim());
    setNewHouseName('');
    setShowAddHouse(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeHouseId) return;
    await addCollaboratorToHouse(activeHouseId, inviteEmail.trim().toLowerCase());
    setInviteEmail('');
    setShowInviteForm(false);
  };

  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    await addPerson(newPersonName.trim());
    setNewPersonName('');
    setShowAddPerson(false);
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in" id="mobile-house-view">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>
          House & Family
        </h2>
        <p className="text-xs text-stone-400 mt-0.5">
          Manage your home settings, partner invites, and family
        </p>
      </div>

      {/* 1. Active House Card */}
      <div
        className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${
          isDark ? 'bg-[#18181c] border-emerald-500/40 shadow-sm' : 'bg-white border-emerald-500/40 shadow-sm'
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <Home className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  {activeHouse?.name || 'Primary Residence'}
                </h3>
              </div>
              {activeHouse?.address ? (
                <p className="text-xs text-stone-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                  <span>{activeHouse.address}</span>
                </p>
              ) : (
                <p className="text-xs text-stone-400 mt-1 italic">No street address set</p>
              )}
              {activeHouse?.propertyType && (
                <p className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 mt-0.5">
                  <Building className="w-3 h-3" />
                  <span>{activeHouse.propertyType}</span>
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenEdit}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              isDark ? 'bg-[#222226] text-stone-300 hover:text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* Edit House Drawer */}
        <AnimatePresence>
          {showEditHouse && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSaveEdit}
              className="mt-4 pt-4 border-t dark:border-[#26262b] border-stone-200 space-y-3"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">House Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full text-xs font-semibold p-2.5 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-[#121215] border-[#2a2a30] text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                  }`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Street Address</label>
                <input
                  type="text"
                  value={editAddress}
                  placeholder="e.g. 742 Evergreen Terrace"
                  onChange={(e) => setEditAddress(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-[#121215] border-[#2a2a30] text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                  }`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Property Type</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none cursor-pointer ${
                    isDark ? 'bg-[#121215] border-[#2a2a30] text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                  }`}
                >
                  <option value="">Select type...</option>
                  <option value="Single Family Home">Single Family Home</option>
                  <option value="Condo / Townhouse">Condo / Townhouse</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Vacation Home / Cabin">Vacation Home / Cabin</option>
                  <option value="Rental Property">Rental Property</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditHouse(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-stone-950"
                >
                  Save Changes
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Switch Homes / Add Another Home */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Your Homes ({houses.length})
          </span>
          <button
            type="button"
            onClick={() => setShowAddHouse(!showAddHouse)}
            className="text-xs font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Home</span>
          </button>
        </div>

        {/* Add House input */}
        <AnimatePresence>
          {showAddHouse && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateHouse}
              className={`p-3 rounded-xl border flex items-center gap-2 ${
                isDark ? 'bg-[#18181c] border-emerald-500/40' : 'bg-white border-emerald-500/40'
              }`}
            >
              <input
                type="text"
                value={newHouseName}
                autoFocus
                onChange={(e) => setNewHouseName(e.target.value)}
                placeholder="House nickname (e.g. Lake House, Mountain Cabin)..."
                className={`flex-1 text-xs p-2 rounded-lg border focus:outline-none ${
                  isDark ? 'bg-[#121215] border-[#2a2a30] text-white' : 'bg-stone-50 border-stone-200'
                }`}
              />
              <button
                type="submit"
                disabled={!newHouseName.trim()}
                className="px-3 py-2 rounded-lg text-xs font-bold bg-emerald-500 text-stone-950 disabled:opacity-40"
              >
                Add
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-2">
          {houses.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setActiveHouseId(h.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                h.id === activeHouseId
                  ? 'bg-emerald-500 text-stone-950 border-emerald-500 shadow-sm'
                  : isDark
                  ? 'bg-[#18181c] border-[#26262b] text-stone-300 hover:text-white'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 shadow-xs'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{h.name}</span>
              {h.id === activeHouseId && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Collaborators (Spouse, Partner, Roommates) */}
      <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-[#18181c] border-[#222226]' : 'bg-white border-stone-200 shadow-xs'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />
            <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-stone-900'}`}>
              House Collaborators
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="text-xs font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite</span>
          </button>
        </div>

        <p className="text-xs text-stone-400 leading-relaxed">
          Invite your partner, spouse, or roommates so you can both edit tasks and tick off chores in real-time.
        </p>

        {/* Invite Form */}
        <AnimatePresence>
          {showInviteForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleInvite}
              className="p-3 rounded-xl border border-dashed border-emerald-500/40 space-y-2 bg-emerald-500/5"
            >
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  autoFocus
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Partner's Google email address..."
                  className={`flex-1 text-xs p-2 rounded-lg border focus:outline-none ${
                    isDark ? 'bg-[#121215] border-[#2a2a30] text-white' : 'bg-white border-stone-200'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!inviteEmail.trim()}
                  className="px-3 py-2 rounded-lg text-xs font-bold bg-emerald-500 text-stone-950 disabled:opacity-40"
                >
                  Send Invite
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Collaborators List */}
        <div className="space-y-1.5 pt-1">
          {activeHouse?.ownerEmail && (
            <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
              isDark ? 'bg-[#141417] border-[#26262b]' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-[10px]">
                  {activeHouse.ownerEmail[0].toUpperCase()}
                </div>
                <span className="font-medium truncate">{activeHouse.ownerEmail}</span>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                Owner
              </span>
            </div>
          )}

          {activeHouse?.collaborators && activeHouse.collaborators.length > 0 && (
            activeHouse.collaborators.map((collab) => (
              <div
                key={collab}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  isDark ? 'bg-[#141417] border-[#26262b]' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-[10px]">
                    {collab[0].toUpperCase()}
                  </div>
                  <span className="font-medium truncate">{collab}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeCollaboratorFromHouse(activeHouseId, collab)}
                  className="text-stone-400 hover:text-rose-400 p-1"
                  title="Remove collaborator"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Family Members (Assignees) */}
      <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-[#18181c] border-[#222226]' : 'bg-white border-stone-200 shadow-xs'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />
            <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-stone-900'}`}>
              Family Members ({people.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowAddPerson(!showAddPerson)}
            className="text-xs font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Person</span>
          </button>
        </div>

        <p className="text-xs text-stone-400 leading-relaxed">
          Tap a member to view all tasks currently assigned to them.
        </p>

        {/* Add Person input */}
        <AnimatePresence>
          {showAddPerson && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreatePerson}
              className="p-3 rounded-xl border border-dashed border-emerald-500/40 flex items-center gap-2 bg-emerald-500/5"
            >
              <input
                type="text"
                value={newPersonName}
                autoFocus
                onChange={(e) => setNewPersonName(e.target.value)}
                placeholder="Name (e.g. Maya, David, Kids)..."
                className={`flex-1 text-xs p-2 rounded-lg border focus:outline-none ${
                  isDark ? 'bg-[#121215] border-[#2a2a30] text-white' : 'bg-white border-stone-200'
                }`}
              />
              <button
                type="submit"
                disabled={!newPersonName.trim()}
                className="px-3 py-2 rounded-lg text-xs font-bold bg-emerald-500 text-stone-950 disabled:opacity-40"
              >
                Add
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-2">
          {people.map((p) => {
            const memberTasks = tasks.filter((t) => t.assigneeId === p.id && t.status !== 'completed');
            const isFiltered = filterPersonId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onFilterPersonAndGoToTasks(p.id)}
                className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                  isFiltered
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 font-bold'
                    : isDark
                    ? 'bg-[#141417] border-[#26262b] text-stone-300 hover:border-stone-700'
                    : 'bg-stone-50 border-stone-200 text-stone-850 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${p.colorClass || 'bg-emerald-500 text-white'}`}>
                    {p.name[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">{p.name}</span>
                    <span className="text-[10px] text-stone-400">{memberTasks.length} pending</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Account & Appearance */}
      <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-[#18181c] border-[#222226]' : 'bg-white border-stone-200 shadow-xs'}`}>
        <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-stone-900'}`}>
          Preferences & Account
        </h3>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2 text-xs">
            {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span className="font-semibold">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isDark ? 'bg-[#222226] text-stone-300 border-stone-700 hover:text-white' : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
            }`}
          >
            Switch to {isDark ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* User Account & Logout */}
        {user && (
          <div className="pt-2 border-t dark:border-[#26262b] border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center font-bold text-xs">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="text-xs">
                <span className="font-bold block truncate max-w-[140px]">{user.displayName || 'Homeowner'}</span>
                <span className="text-[10px] text-stone-400 truncate max-w-[140px] block">{user.email}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className="p-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
