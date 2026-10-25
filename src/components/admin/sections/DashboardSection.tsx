import React from 'react';
import { useWorkspace } from '../../../context/WorkspaceContext';
import {
  Layers,
  FolderTree,
  Eye,
  Copy,
  PlusCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const DashboardSection: React.FC = () => {
  const {
    prompts,
    categories,
    setAdminSection,
    setSelectedPromptForEdit,
    setWorkspaceMode,
  } = useWorkspace();

  const totalPrompts = prompts.length;
  const publishedPrompts = prompts.filter((p) => p.published).length;
  const totalViews = prompts.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalCopies = prompts.reduce((acc, p) => acc + (p.copies || 0), 0);

  const topPrompts = [...prompts]
    .sort((a, b) => (b.copies || 0) - (a.copies || 0))
    .slice(0, 5);

  const handleEditPrompt = (p: typeof prompts[0]) => {
    setSelectedPromptForEdit(p);
    setAdminSection('new-prompt');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Admin Dashboard</h2>
          <p className="text-xs text-slate-400">
            Real-time library metrics and workspace health overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWorkspaceMode('viewer')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>Open Viewer</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedPromptForEdit(null);
              setAdminSection('new-prompt');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add New Prompt</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Prompts</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">{totalPrompts}</div>
          <div className="text-[11px] text-slate-500">
            <span className="text-emerald-400 font-medium">{publishedPrompts}</span> published live
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Categories</span>
            <FolderTree className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">{categories.length}</div>
          <div className="text-[11px] text-slate-500">
            {categories.filter((c) => c.enabled).length} active categories
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Views</span>
            <Eye className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">{totalViews.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500">Direct library views</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Copies</span>
            <Copy className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">{totalCopies.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500">Clipboard usage triggers</div>
        </div>
      </div>

      {/* Two Column Section: Top Prompts & Categories Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Prompts by Copies */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Most Copied Prompts</span>
            </h3>
            <button
              type="button"
              onClick={() => setAdminSection('prompts')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {topPrompts.map((p, idx) => {
              const cat = categories.find((c) => c.id === p.categoryId);
              return (
                <div
                  key={p.id}
                  onClick={() => handleEditPrompt(p)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-slate-500 w-4 text-center">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors truncate">
                        {p.title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {cat?.name || 'General'} · {p.type}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 tabular-nums shrink-0">
                    <span className="flex items-center gap-1">
                      <Copy className="w-3 h-3 text-slate-500" />
                      {p.copies}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded ${
                        p.published
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {p.published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-purple-400" />
              <span>Category Distribution</span>
            </h3>
            <button
              type="button"
              onClick={() => setAdminSection('categories')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Manage
            </button>
          </div>

          <div className="space-y-2">
            {categories.map((c) => {
              const count = prompts.filter((p) => p.categoryId === c.id).length;
              const percent = totalPrompts > 0 ? Math.round((count / totalPrompts) * 100) : 0;
              return (
                <div key={c.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{c.name}</span>
                    <span className="text-slate-500 tabular-nums">{count} prompts ({percent}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
