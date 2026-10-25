import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { AdminPanel } from '../admin/AdminPanel';
import { ViewerPanel } from '../viewer/ViewerPanel';
import {
  Maximize2,
  Minimize2,
  ShieldCheck,
  Eye,
  RefreshCw,
} from 'lucide-react';

export const SplitWorkspaceView: React.FC = () => {
  const { setWorkspaceMode, prompts } = useWorkspace();

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-950 text-slate-100 overflow-hidden">
      {/* Split Workspace Banner / Toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-200">Side-by-Side Live Workspace:</span>
          <span className="hidden sm:inline text-slate-400">
            Changes made in Admin Studio (left) update the Viewer Panel (right) in real-time.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setWorkspaceMode('admin')}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            title="Full Admin Mode"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Focus Admin</span>
          </button>
          <span className="text-slate-700">|</span>
          <button
            type="button"
            onClick={() => setWorkspaceMode('viewer')}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            title="Full Viewer Mode"
          >
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Focus Viewer</span>
          </button>
        </div>
      </div>

      {/* Dual Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 overflow-hidden">
        {/* Left Pane: Admin Studio */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-[calc(100vh-6.5rem)]">
          <div className="sticky top-0 z-20 px-4 py-2 bg-slate-900/95 backdrop-blur-xs border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Studio (Editor & Management)
            </span>
            <button
              type="button"
              onClick={() => setWorkspaceMode('admin')}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              title="Expand Admin to full screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 flex min-w-0">
            <AdminPanel />
          </div>
        </div>

        {/* Right Pane: Live Website Viewer */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-[calc(100vh-6.5rem)]">
          <div className="sticky top-0 z-20 px-4 py-2 bg-slate-900/95 backdrop-blur-xs border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Live Website Viewer ({prompts.filter((p) => p.published).length} Published)
            </span>
            <button
              type="button"
              onClick={() => setWorkspaceMode('viewer')}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              title="Expand Viewer to full screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 flex min-w-0">
            <ViewerPanel />
          </div>
        </div>
      </div>
    </div>
  );
};
