import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { AdminSection } from '../../types';
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  FolderTree,
  Settings,
  Eye,
  Columns2,
  Tv,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const {
    adminSection,
    setAdminSection,
    setSelectedPromptForEdit,
    prompts,
    categories,
    workspaceMode,
    setWorkspaceMode,
  } = useWorkspace();

  const handleNav = (section: AdminSection) => {
    if (section === 'new-prompt') {
      setSelectedPromptForEdit(null);
    }
    setAdminSection(section);
  };

  const navItems: { id: AdminSection; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'prompts',
      label: 'All Prompts',
      icon: <Layers className="w-4 h-4" />,
      badge: prompts.length,
    },
    {
      id: 'new-prompt',
      label: 'Add Prompt',
      icon: <PlusCircle className="w-4 h-4" />,
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: <FolderTree className="w-4 h-4" />,
      badge: categories.length,
    },
    {
      id: 'ads',
      label: 'Ad Networks',
      icon: <Tv className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings & Data',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-56 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-3 select-none">
      <div className="space-y-4">
        {/* Workspace mode shortcut if in single admin mode */}
        {workspaceMode === 'admin' && (
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-500">
              Workspace View
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setWorkspaceMode('viewer')}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Viewer</span>
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceMode('split')}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                title="View Admin & Website side by side"
              >
                <Columns2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Split</span>
              </button>
            </div>
          </div>
        )}

        {/* Section Links */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider uppercase text-slate-500">
            Admin Navigation
          </div>
          {navItems.map((item) => {
            const isActive = adminSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                      isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Open Info */}
      <div className="pt-3 border-t border-slate-800/80 px-2 space-y-1">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Admin Open
          </span>
          <span className="text-[10px] text-slate-500 font-mono">v3.0</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">
          Manage prompts, ads & categories in this tab.
        </p>
      </div>
    </aside>
  );
};
