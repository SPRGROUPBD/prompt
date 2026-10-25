import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PromptItem, ViewDisplayMode, ViewerNavFilter } from '../../types';
import { PromptCard } from './PromptCard';
import { PromptDetailModal } from './PromptDetailModal';
import { renderCategoryIcon } from '../../utils/iconMap';
import {
  Search,
  X,
  LayoutGrid,
  List,
  Sparkles,
  TrendingUp,
  Clock,
  Unlock,
  Layers,
  Plus,
  Star,
  RefreshCw,
} from 'lucide-react';

export const ViewerPanel: React.FC = () => {
  const {
    prompts,
    categories,
    isLoadingData,
    activePromptDetail,
    setActivePromptDetail,
    setWorkspaceMode,
    setAdminSection,
    setSelectedPromptForEdit,
    favoritePromptIds,
    isFavorite,
    isUserAdmin,
    initializeFirebaseDefaults,
  } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [navFilter, setNavFilter] = useState<ViewerNavFilter>('all');
  const [viewMode, setViewMode] = useState<ViewDisplayMode>('grid');

  // Filter only published prompts for Viewer
  const publishedPrompts = useMemo(() => {
    return prompts.filter((p) => p.published);
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    return publishedPrompts.filter((p) => {
      // Favorites filter
      if (navFilter === 'favorites') {
        if (!isFavorite(p.id)) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
        return false;
      }

      // Nav filter
      if (navFilter === 'popular' && !p.popular) return false;
      if (navFilter === 'featured' && !p.featured) return false;
      if (navFilter === 'free' && p.accessType !== 'Free') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        const matchContent = p.fullContent.toLowerCase().includes(q);
        const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q));
        const matchModel = p.recommendedModel?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchContent && !matchTags && !matchModel) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (navFilter === 'popular') return b.views - a.views;
      if (navFilter === 'latest') return b.createdAt - a.createdAt;
      return a.displayOrder - b.displayOrder || b.createdAt - a.createdAt;
    });
  }, [publishedPrompts, selectedCategory, navFilter, searchQuery, favoritePromptIds]);

  const totalCopies = useMemo(
    () => publishedPrompts.reduce((acc, p) => acc + (p.copies || 0), 0),
    [publishedPrompts]
  );
  const totalViews = useMemo(
    () => publishedPrompts.reduce((acc, p) => acc + (p.views || 0), 0),
    [publishedPrompts]
  );

  const favoritesCount = useMemo(() => {
    return publishedPrompts.filter((p) => favoritePromptIds.includes(p.id)).length;
  }, [publishedPrompts, favoritePromptIds]);

  const handleOpenDetail = (p: PromptItem) => {
    setActivePromptDetail(p);
  };

  const handleCreatePrompt = () => {
    if (!isUserAdmin) return;
    setSelectedPromptForEdit(null);
    setAdminSection('new-prompt');
    setWorkspaceMode('admin');
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-950 text-slate-100 pb-16">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 py-8 sm:py-12 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto space-y-5">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Curated High-Impact AI Prompts
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Tested templates for image generation, cinematic video, full-stack architecture, and conversion copy. Powered by live Firebase Realtime Database.
            </p>
          </div>

          {/* Search bar & quick stats */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompts by keyword, model (Flux, Claude, Midjourney), or tag..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-100 text-xs sm:text-sm placeholder:text-slate-500 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick KPI Strip */}
            <div className="flex items-center gap-3 sm:gap-4 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 shrink-0 self-start sm:self-auto">
              <div>
                <span className="font-bold text-slate-200 tabular-nums">{publishedPrompts.length}</span> Prompts
              </div>
              <span className="text-slate-700">·</span>
              <div>
                <span className="font-bold text-slate-200 tabular-nums">{totalViews.toLocaleString()}</span> Views
              </div>
              <span className="text-slate-700">·</span>
              <button
                type="button"
                onClick={() => setNavFilter('favorites')}
                className="hover:text-amber-400 transition-colors flex items-center gap-1"
                title="View your starred prompts"
              >
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-slate-200 tabular-nums">{favoritesCount}</span>
              </button>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Categories</span>
            </button>

            {categories
              .filter((c) => c.enabled)
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((c) => {
                const count = publishedPrompts.filter((p) => p.categoryId === c.id).length;
                const isSelected = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {renderCategoryIcon(c.icon, { className: 'w-3.5 h-3.5' })}
                    <span>{c.name}</span>
                    <span className="text-[10px] opacity-70 ml-0.5 tabular-nums">({count})</span>
                  </button>
                );
              })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 w-full space-y-6">
        {/* Controls Toolbar: Nav Tabs & Layout Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setNavFilter('all')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                navFilter === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setNavFilter('favorites')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                navFilter === 'favorites' ? 'bg-amber-500/20 text-amber-300 font-semibold shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Favorites ({favoritesCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setNavFilter('latest')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                navFilter === 'latest' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              Latest
            </button>
            <button
              type="button"
              onClick={() => setNavFilter('popular')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                navFilter === 'popular' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3 h-3 text-purple-400" />
              Popular
            </button>
            <button
              type="button"
              onClick={() => setNavFilter('featured')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                navFilter === 'featured' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Featured
            </button>
            <button
              type="button"
              onClick={() => setNavFilter('free')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                navFilter === 'free' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Unlock className="w-3 h-3 text-emerald-400" />
              Free Prompts
            </button>
          </div>

          {/* Right Toolbar: View mode toggles */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <span className="text-xs text-slate-500 tabular-nums">
              Showing {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt' : 'prompts'}
            </span>
            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid layout"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="List layout"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-72 rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3"
              >
                <div className="w-full h-36 bg-slate-800 rounded-lg" />
                <div className="w-1/3 h-3 bg-slate-800 rounded" />
                <div className="w-3/4 h-4 bg-slate-800 rounded" />
                <div className="w-full h-3 bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              {navFilter === 'favorites' ? (
                <Star className="w-6 h-6 text-amber-400" />
              ) : (
                <Search className="w-6 h-6" />
              )}
            </div>
            <h3 className="text-base font-semibold text-slate-200">
              {navFilter === 'favorites'
                ? 'No favorites saved yet'
                : 'No published prompts in Firebase yet'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {navFilter === 'favorites'
                ? 'Click the star icon on any prompt card or in the detail view to save your favorite prompts here.'
                : searchQuery
                ? `No prompts matched "${searchQuery}". Try clearing search or choose another category.`
                : 'Prompts will appear here in real-time as soon as the administrator publishes them to Firebase.'}
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              {navFilter === 'favorites' ? (
                <button
                  type="button"
                  onClick={() => setNavFilter('all')}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Browse All Prompts
                </button>
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              ) : null}

              {/* Only the fixed administrator sees seed/add buttons */}
              {isUserAdmin && (
                <>
                  <button
                    type="button"
                    onClick={initializeFirebaseDefaults}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Initialize Starter Prompts in Firebase</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCreatePrompt}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add in Admin Studio</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'flex flex-col gap-3'
            }
          >
            {filteredPrompts.map((p) => (
              <PromptCard
                key={p.id}
                prompt={p}
                viewMode={viewMode}
                onViewDetail={handleOpenDetail}
              />
            ))}
          </div>
        )}
      </div>

      {/* Prompt Detail Modal */}
      <PromptDetailModal
        prompt={activePromptDetail}
        onClose={() => setActivePromptDetail(null)}
      />
    </div>
  );
};
