import React, { useState } from 'react';
import { Plus, Trash2, Edit3, X, Users, AlertCircle, Check } from 'lucide-react';
import { formatIdentifier } from '../../utils/storage';

export default function TeamManagerModal({
  isOpen,
  onClose,
  teams,
  onAddTeam,
  onUpdateTeam,
  onDeleteTeam,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);

  // Form State
  const [teamName, setTeamName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [members, setMembers] = useState('');
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setTeamName('');
    setProjectTitle('');
    setIdentifier('');
    setMembers('');
    setFormError('');
    setIsAdding(false);
    setEditingTeamId(null);
  };

  const handleStartEdit = (team) => {
    setEditingTeamId(team.id);
    setTeamName(team.teamName);
    setProjectTitle(team.projectTitle);
    setIdentifier(team.identifier || '');
    setMembers(team.members || '');
    setIsAdding(true);
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!teamName.trim() || !projectTitle.trim()) {
      setFormError('Team Name and Project Title are required.');
      return;
    }

    const payload = {
      teamName: teamName.trim(),
      projectTitle: projectTitle.trim(),
      identifier: identifier.trim(), // Optional! Can be blank.
      members: members.trim(),
    };

    if (editingTeamId) {
      onUpdateTeam(editingTeamId, payload);
    } else {
      onAddTeam(payload);
    }

    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn font-sans text-slate-800">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 p-5 text-slate-800 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Manage Teams &amp; Projects</h2>
              <p className="text-xs text-slate-500">
                Setup exhibition teams for evaluation ({teams.length} registered)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-wrap gap-2">
          {!isAdding ? (
            <button
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
              className="inline-flex items-center space-x-1.5 py-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Team on the Fly</span>
            </button>
          ) : (
            <span className="text-xs font-semibold text-indigo-900">
              {editingTeamId ? 'Editing Team Information' : 'Adding New Team to Roster'}
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Add / Edit Form */}
          {isAdding && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-200/80 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Team Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Apex Robotics"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Team No. / Table No. <span className="text-slate-400 font-normal lowercase">(optional - leave blank if not used)</span>
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. Table A-04 or Team #12 (or leave empty)"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Autonomous Solar Powered Water Filtration System"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Team Members <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  placeholder="e.g. Alice Wong, Bob Dylan, Charlie Rose"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {formError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingTeamId ? 'Update Team' : 'Save & Add Team'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Teams List */}
          <div className="space-y-2.5">
            {teams.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">No teams registered yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Click 'Add New Team' above to register project expo teams to begin evaluation.
                </p>
              </div>
            ) : (
              teams.map((team, idx) => (
                <div
                  key={team.id}
                  className="p-3.5 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{idx + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm truncate">
                        {team.teamName}
                      </h4>
                      {/* CRUCIAL REQUIREMENT: Hide entirely if blank, don't show N/A */}
                      {formatIdentifier(team.identifier) && (
                        <span className="text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                          {formatIdentifier(team.identifier)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {team.projectTitle}
                    </p>
                    {team.members && (
                      <p className="text-[11px] text-slate-500 truncate">
                        <span className="font-medium text-slate-600">Members:</span> {team.members}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleStartEdit(team)}
                      title="Edit Team"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete team "${team.teamName}"?`)) {
                          onDeleteTeam(team.id);
                        }
                      }}
                      title="Delete Team"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-end">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
          >
            Done Managing Teams
          </button>
        </div>
      </div>
    </div>
  );
}
