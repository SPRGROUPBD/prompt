import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  Sparkles,
  Eye,
  ShieldCheck,
  Columns2,
  Plus,
  Star,
  LogIn,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

export const WorkspaceHeader: React.FC = () => {
  const {
    workspaceMode,
    setWorkspaceMode,
    setAdminSection,
    setSelectedPromptForEdit,
    prompts,
    favoritePromptIds,
    currentUser,
    isUserAdmin,
    setAuthModalOpen,
    setAuthModalMode,
    logout,
  } = useWorkspace();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const publishedCount = prompts.filter((p) => p.published).length;
  const favCount = favoritePromptIds.length;

  const handleQuickAdd = () => {
    if (!isUserAdmin) return;
    setSelectedPromptForEdit(null);
    setAdminSection('new-prompt');
    setWorkspaceMode('admin');
  };

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-indigo-100" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
                PromptStudio
              </span>
              {isUserAdmin ? (
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Admin Active
                </span>
              ) : (
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  AI Library
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {publishedCount} Prompts Live in Firebase
            </span>
          </div>
        </div>

        {/* Zone 2: Workspace View Switcher - ONLY VISIBLE TO FIXED ADMIN */}
        {isUserAdmin && (
          <nav
            className="hidden md:flex items-center p-1 bg-slate-950/70 border border-slate-800/80 rounded-xl"
            aria-label="Workspace views"
          >
            <button
              type="button"
              onClick={() => setWorkspaceMode('viewer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                workspaceMode === 'viewer'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Viewer Panel</span>
            </button>

            <button
              type="button"
              onClick={() => setWorkspaceMode('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                workspaceMode === 'admin'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Studio</span>
            </button>

            <button
              type="button"
              onClick={() => setWorkspaceMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                workspaceMode === 'split'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title="Side-by-side view: Edit in Admin & see live Website simultaneously"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
          </nav>
        )}

        {/* Zone 3: Primary Actions (Auth, Favorites, Add Prompt for Admin) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Add Prompt - ONLY FOR ADMIN */}
          {isUserAdmin && (
            <button
              type="button"
              onClick={handleQuickAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-lg shadow-sm shadow-indigo-500/25 transition-all whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Prompt</span>
            </button>
          )}

          {/* User Account / Auth Control */}
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs text-slate-200 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-[11px] text-white uppercase">
                  {currentUser.email ? currentUser.email[0] : 'U'}
                </div>
                <span className="hidden lg:inline max-w-[120px] truncate text-slate-300">
                  {currentUser.displayName || currentUser.email}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-2 z-50 text-xs space-y-1">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <div className="font-semibold text-white truncate">
                      {currentUser.displayName || 'Member'}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {currentUser.email}
                    </div>
                    <div className="mt-1">
                      {isUserAdmin ? (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                          Administrator
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          Member Account
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setWorkspaceMode('viewer');
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>My Favorites ({favCount})</span>
                  </button>

                  {/* Admin Studio only in dropdown if user is actually admin */}
                  {isUserAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setWorkspaceMode('admin');
                      }}
                      className="w-full text-left px-3 py-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 flex items-center gap-2 font-medium"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin Studio</span>
                    </button>
                  )}

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenAuth('signin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Hamburger (for admin only if they want to switch view on mobile) */}
          {isUserAdmin && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              title="Admin Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Navigation for Admin */}
      {isUserAdmin && mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setWorkspaceMode('viewer');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium ${
                workspaceMode === 'viewer' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Viewer Panel</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setWorkspaceMode('admin');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium ${
                workspaceMode === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Studio</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
