// src/components/UserProfileModal.jsx
import React, { useState, useMemo } from 'react';
import {
  X,
  History,
  Calendar,
  Filter,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Droplets,
  Utensils,
  Syringe,
  Activity,
  SlidersHorizontal,
  User
} from 'lucide-react';

export default function UserProfileModal({
  isOpen,
  onClose,
  logs = [],
  onUpdateLog,
  onDeleteLog,
  userProfile = {},
  onUpdateUserProfile,
}) {
  const [activeSubTab, setActiveSubTab] = useState('HISTORICAL_LOG'); // 'HISTORICAL_LOG' | 'BIOMETRICS'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: userProfile?.name || 'Athlete DK',
    weightKg: userProfile?.weightKg || 84,
    heightCm: userProfile?.heightCm || 182,
    age: userProfile?.age || 46,
    targetWeightKg: userProfile?.targetWeightKg || 78,
  });

  const filteredLogs = useMemo(() => {
    return [...logs]
      .filter((entry) => {
        if (categoryFilter !== 'ALL' && entry.category !== categoryFilter) return false;
        const entryDate = entry.timestamp ? entry.timestamp.slice(0, 10) : '';
        if (startDate && entryDate < startDate) return false;
        if (endDate && entryDate > endDate) return false;
        return true;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [logs, startDate, endDate, categoryFilter]);

  if (!isOpen) return null;

  const startEditing = (entry) => {
    setEditingId(entry.id);
    setEditDraft({ ...entry });
  };

  const saveEdit = () => {
    if (!editingId || !onUpdateLog) return;
    onUpdateLog(editingId, editDraft);
    setEditingId(null);
    setEditDraft({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'WATER':
        return <Droplets className="w-3.5 h-3.5 text-sky-600" />;
      case 'NUTRITION':
        return <Utensils className="w-3.5 h-3.5 text-teal-600" />;
      case 'PEPTIDE':
        return <Syringe className="w-3.5 h-3.5 text-indigo-600" />;
      case 'ACTIVITY':
        return <Activity className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <History className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4.5 bg-[#F4F8FB] border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-600 text-white shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Historical Log & Profile Settings
              </h2>
              <p className="text-xs text-slate-500">
                Retrospective CRUD operations across nutrition, hydration, peptide protocols, and activities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-200/70 p-1 rounded-2xl flex items-center gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveSubTab('HISTORICAL_LOG')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeSubTab === 'HISTORICAL_LOG'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Historical Log ({logs.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('BIOMETRICS')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeSubTab === 'BIOMETRICS'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Profile & Goals
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
              aria-label="Close Historical Log View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeSubTab === 'HISTORICAL_LOG' && (
          <>
            {/* Filter Controls (Date Range & Category) */}
            <div className="px-6 py-3.5 border-b border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 font-bold bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 font-bold bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
                  Filter Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 font-bold bg-white"
                >
                  <option value="ALL">All Categories ({logs.length})</option>
                  <option value="WATER">Hydration (Water)</option>
                  <option value="NUTRITION">Nutrition & Meals</option>
                  <option value="PEPTIDE">Peptides</option>
                  <option value="ACTIVITY">Activity & Steps</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setCategoryFilter('ALL');
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              </div>
            </div>

            {/* Historical Entries Ledger Table / List */}
            <div className="p-6 overflow-y-auto flex-1">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-16 rounded-3xl border border-dashed border-slate-200 bg-[#F4F8FB]/50 space-y-2">
                  <p className="text-sm font-extrabold text-slate-700">No historical records match your filter criteria.</p>
                  <p className="text-xs text-slate-500">
                    Log new entries using the persistent + button or top hydration action bar.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((entry) => {
                    const isEditing = editingId === entry.id;
                    return (
                      <div
                        key={entry.id}
                        className="rounded-2xl border border-slate-200 p-4 bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-slate-300"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1">
                              {getCategoryIcon(entry.category)}
                              <span>{entry.category}</span>
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>

                          {!isEditing ? (
                            <div className="pt-0.5">
                              <div className="text-sm font-extrabold text-slate-900">{entry.title}</div>
                              <div className="text-xs text-slate-600 mt-0.5 font-medium">{entry.summary}</div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2">
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500">
                                  Title / Name
                                </label>
                                <input
                                  type="text"
                                  value={editDraft.title || ''}
                                  onChange={(e) =>
                                    setEditDraft((d) => ({ ...d, title: e.target.value }))
                                  }
                                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-900 font-bold"
                                />
                              </div>

                              {entry.category === 'WATER' && (
                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-slate-500">
                                    Volume (ml)
                                  </label>
                                  <input
                                    type="number"
                                    value={editDraft.amountMl || 0}
                                    onChange={(e) => {
                                      const amountMl = Number(e.target.value);
                                      setEditDraft((d) => ({
                                        ...d,
                                        amountMl,
                                        summary: `${amountMl} ml water intake`,
                                      }));
                                    }}
                                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-900 font-bold"
                                  />
                                </div>
                              )}

                              {entry.category === 'NUTRITION' && (
                                <>
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500">
                                      Calories (kcal)
                                    </label>
                                    <input
                                      type="number"
                                      value={editDraft.calories || 0}
                                      onChange={(e) => {
                                        const calories = Number(e.target.value);
                                        setEditDraft((d) => ({
                                          ...d,
                                          calories,
                                          summary: `${calories} kcal • ${d.protein || 0}g P • ${d.carbs || 0}g C • ${d.fats || 0}g F`,
                                        }));
                                      }}
                                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-900 font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500">
                                      Protein (g)
                                    </label>
                                    <input
                                      type="number"
                                      value={editDraft.protein || 0}
                                      onChange={(e) => {
                                        const protein = Number(e.target.value);
                                        setEditDraft((d) => ({
                                          ...d,
                                          protein,
                                          summary: `${d.calories || 0} kcal • ${protein}g P • ${d.carbs || 0}g C • ${d.fats || 0}g F`,
                                        }));
                                      }}
                                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-900 font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500">
                                      Leucine (mg)
                                    </label>
                                    <input
                                      type="number"
                                      value={editDraft.leucineMg || 0}
                                      onChange={(e) =>
                                        setEditDraft((d) => ({
                                          ...d,
                                          leucineMg: Number(e.target.value),
                                        }))
                                      }
                                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-900 font-bold"
                                    />
                                  </div>
                                </>
                              )}

                              {entry.category === 'PEPTIDE' && (
                                <>
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500">
                                      Dose (mcg)
                                    </label>
                                    <input
                                      type="number"
                                      value={editDraft.doseMcg || 0}
                                      onChange={(e) => {
                                        const doseMcg = Number(e.target.value);
                                        setEditDraft((d) => ({
                                          ...d,
                                          doseMcg,
                                          summary: `${doseMcg} mcg • Site: ${d.site || 'SubQ'}`,
                                        }));
                                      }}
                                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-900 font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500">
                                      Site Note
                                    </label>
                                    <input
                                      type="text"
                                      value={editDraft.site || ''}
                                      onChange={(e) => {
                                        const site = e.target.value;
                                        setEditDraft((d) => ({
                                          ...d,
                                          site,
                                          summary: `${d.doseMcg || 0} mcg • Site: ${site}`,
                                        }));
                                      }}
                                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-900 font-bold"
                                    />
                                  </div>
                                </>
                              )}

                              {entry.category === 'ACTIVITY' && (
                                <>
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500">
                                      Duration (min)
                                    </label>
                                    <input
                                      type="number"
                                      value={editDraft.durationMin || 0}
                                      onChange={(e) => {
                                        const durationMin = Number(e.target.value);
                                        setEditDraft((d) => ({
                                          ...d,
                                          durationMin,
                                          summary: `${durationMin} mins • ${d.steps || 0} steps`,
                                        }));
                                      }}
                                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-900 font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500">
                                      Steps
                                    </label>
                                    <input
                                      type="number"
                                      value={editDraft.steps || 0}
                                      onChange={(e) => {
                                        const steps = Number(e.target.value);
                                        setEditDraft((d) => ({
                                          ...d,
                                          steps,
                                          summary: `${d.durationMin || 0} mins • ${steps} steps`,
                                        }));
                                      }}
                                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-900 font-bold"
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Inline Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {!isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => startEditing(entry)}
                                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition flex items-center gap-1"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteLog && onDeleteLog(entry.id)}
                                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={saveEdit}
                                className="px-4 py-1.5 rounded-full text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1 shadow-2xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Save</span>
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Profile & Goals SubTab */}
        {activeSubTab === 'BIOMETRICS' && (
          <div className="p-6 overflow-y-auto space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onUpdateUserProfile) onUpdateUserProfile(profileForm);
                onClose();
              }}
              className="space-y-4 max-w-lg"
            >
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Athlete Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={profileForm.weightKg}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, weightKg: Number(e.target.value) }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Target Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={profileForm.targetWeightKg}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, targetWeightKg: Number(e.target.value) }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-full text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-700 transition"
              >
                Save Profile Parameters
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
