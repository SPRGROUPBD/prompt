import React, { useState } from 'react';
import { useWorkspace } from '../../../context/WorkspaceContext';
import {
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Eye,
  Key,
} from 'lucide-react';

export const SettingsSection: React.FC = () => {
  const {
    adminAccessOpen,
    setAdminAccessOpen,
    resetToSeedData,
    exportDatabaseJson,
    importDatabaseJson,
    showToast,
    prompts,
    categories,
    setWorkspaceMode,
  } = useWorkspace();

  const [importJsonText, setImportJsonText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);

  const handleExportDownload = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptstudio_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Database exported to JSON file!', 'success');
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) {
      showToast('Please paste valid JSON', 'error');
      return;
    }
    const success = importDatabaseJson(importJsonText);
    if (success) {
      setImportJsonText('');
      setShowImportArea(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDatabaseJson(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Workspace Settings & Data</h2>
        <p className="text-xs text-slate-400">
          Manage access permissions, backup/restore the prompt database, or reset demo content.
        </p>
      </div>

      {/* Admin Access Mode Card */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Admin Open Access for Users
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                As configured (<code className="text-emerald-400 font-mono">admin open hobe for users</code>), the Admin Studio is unlocked and directly accessible to all users in this workspace tab without requiring password roadblocks.
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            Active · Open
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
          <div className="text-slate-300 font-medium flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span>Legacy Admin Credentials Reference:</span>
          </div>
          <p className="font-mono text-[11px] text-slate-500">
            Email: <span className="text-slate-300">mail.sajjadahmed@gmail.com</span> · Password: <span className="text-slate-300">user@900</span>
          </p>
          <p className="text-[11px] text-slate-500">
            Because open mode is enabled, you can edit, add, and publish prompts right away from the same tab.
          </p>
        </div>
      </div>

      {/* Data Backup & Migration */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <FileJson className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Database Backup & Restore</h3>
        </div>

        <p className="text-xs text-slate-400">
          Current database contains <strong className="text-slate-200">{prompts.length}</strong> prompts across <strong className="text-slate-200">{categories.length}</strong> categories.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Database (JSON)</span>
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>Import JSON File</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => setShowImportArea(!showImportArea)}
            className="text-xs text-slate-400 hover:text-slate-200 underline"
          >
            {showImportArea ? 'Hide Paste Box' : 'Paste Raw JSON'}
          </button>
        </div>

        {showImportArea && (
          <div className="space-y-2 pt-2">
            <textarea
              rows={4}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste valid prompt database JSON here..."
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:border-indigo-500 outline-none"
            />
            <button
              type="button"
              onClick={handleImportSubmit}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              Apply Imported JSON
            </button>
          </div>
        )}
      </div>

      {/* Danger Zone: Reset to Default */}
      <div className="p-5 rounded-xl bg-slate-900 border border-red-900/30 space-y-3">
        <div className="flex items-center gap-2 pb-1 text-red-400 font-semibold text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Reset Library to Defaults</span>
        </div>
        <p className="text-xs text-slate-400">
          Restore the library back to the original 8+ high-impact starter prompts and 6 core categories. Any custom changes will be replaced.
        </p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset all prompts and categories to starter seed data?')) {
              resetToSeedData();
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-300 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset to Seed Data</span>
        </button>
      </div>
    </div>
  );
};
