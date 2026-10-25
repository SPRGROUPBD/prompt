import React, { useState } from 'react';
import { useWorkspace } from '../../../context/WorkspaceContext';
import { FIXED_ADMIN_EMAIL } from '../../../services/firebase';
import {
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react';

export const SettingsSection: React.FC = () => {
  const {
    prompts,
    categories,
    initializeFirebaseDefaults,
    showToast,
    currentUser,
  } = useWorkspace();

  const handleExportDownload = () => {
    const data = {
      version: '4.0',
      exportedAt: new Date().toISOString(),
      categories,
      prompts,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptstudio_firebase_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Database exported to JSON file!', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Admin & Firebase Realtime Database Settings</h2>
        <p className="text-xs text-slate-400">
          Role-based security configuration, Firebase Realtime Database synchronization, and backup tools.
        </p>
      </div>

      {/* Role-Based Security Card */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Role-Based Access Control (RBAC) Active
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Only the fixed administrator email (<code className="text-emerald-400 font-mono">{FIXED_ADMIN_EMAIL}</code>) can view and access the Admin Studio and editing capabilities. All other signed-in users are restricted to Viewer mode.
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            Enforced
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 space-y-1">
          <div className="text-slate-300 font-medium">
            Active Administrator Session:
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {currentUser?.email || FIXED_ADMIN_EMAIL} (UID: {currentUser?.uid || 'authenticated'})
          </div>
        </div>
      </div>

      {/* Firebase Realtime Database Status & Initializer */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Database className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Firebase Realtime Database Status</h3>
        </div>

        <p className="text-xs text-slate-400">
          Live sync to node <code className="text-indigo-300 font-mono">PROMPT_MANAGER</code> at <code className="text-slate-300 font-mono">chat-881cc-default-rtdb.europe-west1.firebasedatabase.app</code>. Currently loaded: <strong className="text-white tabular-nums">{prompts.length}</strong> prompts and <strong className="text-white tabular-nums">{categories.length}</strong> categories.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={initializeFirebaseDefaults}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/60 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Seed Starter Data to Firebase RTDB</span>
          </button>

          <button
            type="button"
            onClick={handleExportDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Firebase Backup (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
