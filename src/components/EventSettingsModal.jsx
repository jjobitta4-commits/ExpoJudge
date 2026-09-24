import React, { useState } from 'react';
import { X, Settings, Download, Upload, Trash2, Calendar, MapPin, Building2, Check, RefreshCw } from 'lucide-react';
import { downloadFile } from '../utils/storage';

export default function EventSettingsModal({
  isOpen,
  onClose,
  eventConfig,
  onUpdateEventConfig,
  appData,
  onImportAppData,
  onResetAllData,
}) {
  const [eventName, setEventName] = useState(eventConfig?.eventName || '');
  const [organizer, setOrganizer] = useState(eventConfig?.organizer || '');
  const [venue, setVenue] = useState(eventConfig?.venue || '');
  const [date, setDate] = useState(eventConfig?.date || new Date().toISOString().split('T')[0]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveConfig = (e) => {
    e.preventDefault();
    onUpdateEventConfig({
      eventName: eventName.trim() || 'Project Expo 2026',
      organizer: organizer.trim(),
      venue: venue.trim(),
      date,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(appData, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(jsonStr, `expojudge_backup_${dateStr}.json`, 'application/json');
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.teams || !parsed.scores) {
          alert('Invalid ExpoJudge backup file structure.');
          return;
        }
        if (window.confirm('Importing this backup will merge or overwrite current local data. Continue?')) {
          onImportAppData(parsed);
          alert('Data imported successfully!');
          onClose();
        }
      } catch (err) {
        alert('Failed to parse backup JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Event Settings & Data Management</h2>
              <p className="text-xs text-slate-400">Customize expo details & backup local records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Event Configuration Form */}
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Official Exhibition Details
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Event Name
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. National Project Expo 2026"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Organizing Body / Cell
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="e.g. Department of Innovation"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Venue / Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Innovation Hall B"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Event Date
              </label>
              <div className="relative max-w-xs">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {savedSuccess ? (
                <span className="text-xs font-medium text-emerald-600 flex items-center">
                  <Check className="w-4 h-4 mr-1" /> Settings saved!
                </span>
              ) : <div />}
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                Save Exhibition Details
              </button>
            </div>
          </form>

          <hr className="border-slate-200" />

          {/* Backup & Transfer Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Backup & Tablet Sync
            </h3>
            <p className="text-xs text-slate-500">
              Transfer scores between tablets or save a backup copy of all judges and marks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleExportJSON}
                className="flex items-center justify-center space-x-2 p-3 border border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-900 transition"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Export Backup (JSON)</span>
              </button>

              <label className="flex items-center justify-center space-x-2 p-3 border border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-900 transition cursor-pointer">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Import / Restore (JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Danger Zone */}
          <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200/80 space-y-2">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center">
              <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-600" /> Reset Device Data
            </h4>
            <p className="text-xs text-rose-700">
              Clear all locally stored scores, judges, and teams on this browser.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all data on this device? This cannot be undone.')) {
                  onResetAllData();
                  onClose();
                }
              }}
              className="py-1.5 px-3 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-semibold transition"
            >
              Reset All Local Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
