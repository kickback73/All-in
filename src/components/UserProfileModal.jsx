// src/components/UserProfileModal.jsx
import React, { useState, useMemo } from 'react';
import {
  X,
  History,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Droplets,
  Utensils,
  Syringe,
  Activity,
} from 'lucide-react';

export default function UserProfileModal({
  isOpen,
  onClose,
  logs = [],
  onUpdateLog,
  onDeleteLog,
  userProfile = {},
  onUpdateUserProfile,
  hydrationGoalMl = 2500,
  onUpdateHydrationGoal,
}) {
  const [activeSubTab, setActiveSubTab] = useState('HISTORICAL_LOG'); // 'HISTORICAL_LOG' | 'BIOMETRICS'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  const [profileForm, setProfileForm] = useState({
    name: userProfile?.name || 'Dan',
    heightDisplay: userProfile?.heightDisplay || "5'11\"",
    weightLbs: userProfile?.weightLbs || 229,
    targetWeightLbs: userProfile?.targetWeightLbs || 200,
    dailyCaloricTarget: userProfile?.dailyCaloricTarget || 1900,
    dailyProteinTarget: userProfile?.dailyProteinTarget || 180,
    dailyCarbTarget: userProfile?.dailyCarbTarget || 145,
    dailyFatTarget: userProfile?.dailyFatTarget || 65,
    dailyStepsTarget: userProfile?.dailyStepsTarget || 10000,
    dailyActiveMinutesTarget: userProfile?.dailyActiveMinutesTarget || 45,
    activeProtocol: userProfile?.activeProtocol || 'Retatrutide 3 mg Weekly',
    waterGoalMl: hydrationGoalMl || 2500,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 text-slate-900">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-4 py-3.5 bg-[#F4F8FB] border-b border-slate-200/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-sky-600 text-white">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">
                Historical Log & Full App Editor
              </h2>
              <p className="text-[11px] text-slate-500">
                Edit any past entry, daily goal, macro target, or biometric
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tab Selector */}
        <div className="px-4 pt-3 bg-white flex gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('HISTORICAL_LOG')}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition ${
              activeSubTab === 'HISTORICAL_LOG'
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-[#F4F8FB] text-slate-700 border-slate-200'
            }`}
          >
            Historical Logs ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('BIOMETRICS')}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition ${
              activeSubTab === 'BIOMETRICS'
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-[#F4F8FB] text-slate-700 border-slate-200'
            }`}
          >
            Edit All Targets & Profile
          </button>
        </div>

        {activeSubTab === 'HISTORICAL_LOG' && (
          <>
            {/* Filter Controls */}
            <div className="p-3 border-b border-slate-100 bg-white grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[9px] font-extrabold uppercase text-slate-500">
                  From
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-bold"
                />
              </div>
              <div>
                <label className="block text-[9px] font-extrabold uppercase text-slate-500">
                  To
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-bold"
                />
              </div>
              <div>
                <label className="block text-[9px] font-extrabold uppercase text-slate-500">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-bold bg-white"
                >
                  <option value="ALL">All ({logs.length})</option>
                  <option value="WATER">Water</option>
                  <option value="NUTRITION">Nutrition</option>
                  <option value="PEPTIDE">Peptides</option>
                  <option value="ACTIVITY">Activity</option>
                </select>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-10 rounded-2xl border border-dashed border-slate-200 bg-[#F4F8FB]/50">
                  <p className="text-xs font-extrabold text-slate-700">No records in this range.</p>
                </div>
              ) : (
                filteredLogs.map((entry) => {
                  const isEditing = editingId === entry.id;
                  return (
                    <div
                      key={entry.id}
                      className="rounded-2xl border border-slate-200 p-3 bg-white shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1">
                          {getCategoryIcon(entry.category)}
                          <span>{entry.category}</span>
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>

                      {!isEditing ? (
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-extrabold text-slate-900">{entry.title}</div>
                            <div className="text-[11px] text-slate-600">{entry.summary}</div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => startEditing(entry)}
                              className="p-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteLog && onDeleteLog(entry.id)}
                              className="p-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 pt-1">
                          <input
                            type="text"
                            value={editDraft.title || ''}
                            onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                            className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-bold"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            {entry.category === 'WATER' && (
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
                                className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold"
                              />
                            )}
                            {entry.category === 'NUTRITION' && (
                              <>
                                <input
                                  type="number"
                                  placeholder="Kcal"
                                  value={editDraft.calories || 0}
                                  onChange={(e) => {
                                    const calories = Number(e.target.value);
                                    setEditDraft((d) => ({
                                      ...d,
                                      calories,
                                      summary: `${calories} kcal • ${d.protein || 0}g P`,
                                    }));
                                  }}
                                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold"
                                />
                                <input
                                  type="number"
                                  placeholder="Protein"
                                  value={editDraft.protein || 0}
                                  onChange={(e) => {
                                    const protein = Number(e.target.value);
                                    setEditDraft((d) => ({
                                      ...d,
                                      protein,
                                      summary: `${d.calories || 0} kcal • ${protein}g P`,
                                    }));
                                  }}
                                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold"
                                />
                              </>
                            )}
                            {entry.category === 'PEPTIDE' && (
                              <>
                                <input
                                  type="number"
                                  placeholder="Dose mcg"
                                  value={editDraft.doseMcg || 0}
                                  onChange={(e) => {
                                    const doseMcg = Number(e.target.value);
                                    setEditDraft((d) => ({
                                      ...d,
                                      doseMcg,
                                      summary: `${doseMcg} mcg • ${d.site || 'SubQ'}`,
                                    }));
                                  }}
                                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold"
                                />
                                <input
                                  type="text"
                                  placeholder="Site"
                                  value={editDraft.site || ''}
                                  onChange={(e) =>
                                    setEditDraft((d) => ({ ...d, site: e.target.value }))
                                  }
                                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold"
                                />
                              </>
                            )}
                            {entry.category === 'ACTIVITY' && (
                              <>
                                <input
                                  type="number"
                                  placeholder="Mins"
                                  value={editDraft.durationMin || 0}
                                  onChange={(e) => {
                                    const durationMin = Number(e.target.value);
                                    setEditDraft((d) => ({
                                      ...d,
                                      durationMin,
                                      summary: `${durationMin} mins • ${d.steps || 0} steps`,
                                    }));
                                  }}
                                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold"
                                />
                                <input
                                  type="number"
                                  placeholder="Steps"
                                  value={editDraft.steps || 0}
                                  onChange={(e) => {
                                    const steps = Number(e.target.value);
                                    setEditDraft((d) => ({
                                      ...d,
                                      steps,
                                      summary: `${d.durationMin || 0} mins • ${steps} steps`,
                                    }));
                                  }}
                                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold"
                                />
                              </>
                            )}
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={saveEdit}
                              className="px-3 py-1 rounded-full text-xs font-extrabold text-white bg-emerald-600"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1 rounded-full text-xs font-bold text-slate-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {activeSubTab === 'BIOMETRICS' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (onUpdateUserProfile) onUpdateUserProfile(profileForm);
              if (onUpdateHydrationGoal) onUpdateHydrationGoal(Number(profileForm.waterGoalMl) || 2500);
              onClose();
            }}
            className="p-4 overflow-y-auto space-y-3"
          >
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600">Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600">Height</label>
                <input
                  type="text"
                  value={profileForm.heightDisplay}
                  onChange={(e) => setProfileForm((p) => ({ ...p, heightDisplay: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600">
                  Current Weight (lbs)
                </label>
                <input
                  type="number"
                  value={profileForm.weightLbs}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, weightLbs: Number(e.target.value) }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600">
                  Goal Weight (lbs)
                </label>
                <input
                  type="number"
                  value={profileForm.targetWeightLbs}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, targetWeightLbs: Number(e.target.value) }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600">
                  Daily Energy Target (kcal)
                </label>
                <input
                  type="number"
                  value={profileForm.dailyCaloricTarget}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, dailyCaloricTarget: Number(e.target.value) }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600">
                  Daily Protein Target (g)
                </label>
                <input
                  type="number"
                  value={profileForm.dailyProteinTarget}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, dailyProteinTarget: Number(e.target.value) }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600">
                  Daily Carbs Target (g)
                </label>
                <input
                  type="number"
                  value={profileForm.dailyCarbTarget}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, dailyCarbTarget: Number(e.target.value) }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600">
                  Daily Fats Target (g)
                </label>
                <input
                  type="number"
                  value={profileForm.dailyFatTarget}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, dailyFatTarget: Number(e.target.value) }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600">
                  Daily Hydration Target (ml)
                </label>
                <input
                  type="number"
                  value={profileForm.waterGoalMl}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, waterGoalMl: Number(e.target.value) }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600">
                  Daily Steps Target
                </label>
                <input
                  type="number"
                  value={profileForm.dailyStepsTarget}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, dailyStepsTarget: Number(e.target.value) }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600">
                Active Weekly Peptide Protocol
              </label>
              <input
                type="text"
                value={profileForm.activeProtocol}
                onChange={(e) => setProfileForm((p) => ({ ...p, activeProtocol: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-2xl text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-700 transition cursor-pointer"
            >
              Save All Targets & Profile Settings
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
