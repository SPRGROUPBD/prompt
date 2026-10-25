import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../../context/WorkspaceContext';
import { PromptItem } from '../../../types';
import { renderCategoryIcon } from '../../../utils/iconMap';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const AllPromptsSection: React.FC = () => {
  const {
    prompts,
    categories,
    deletePrompt,
    togglePublish,
    setSelectedPromptForEdit,
    setAdminSection,
    setActivePromptDetail,
  } = useWorkspace();

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterPublished, setFilterPublished] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return prompts.filter((p) => {
      if (filterCat && p.categoryId !== filterCat) return false;
      if (filterPublished === 'published' && !p.published) return false;
      if (filterPublished === 'unpublished' && p.published) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchId = p.id.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        const matchContent = p.fullContent.toLowerCase().includes(q);
        if (!matchTitle && !matchId && !matchDesc && !matchContent) return false;
      }
      return true;
    });
  }, [prompts, filterCat, filterPublished, search]);

  const handleEdit = (p: PromptItem) => {
    setSelectedPromptForEdit(p);
    setAdminSection('new-prompt');
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      deletePrompt(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">All Prompts</h2>
          <p className="text-xs text-slate-400">
            Total of {prompts.length} prompts in library ({prompts.filter((p) => p.published).length} live).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedPromptForEdit(null);
            setAdminSection('new-prompt');
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Prompt</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, prompt text, or ID..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none focus:border-indigo-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filterPublished}
          onChange={(e) => setFilterPublished(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none focus:border-indigo-500"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published Only</option>
          <option value="unpublished">Drafts Only</option>
        </select>
      </div>

      {/* Prompts Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold tracking-wider uppercase">
                <th className="py-3 px-4">Prompt</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Stats</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No prompts found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const cat = categories.find((c) => c.id === p.categoryId);
                  const isVid =
                    p.thumbnail.startsWith('data:video/') ||
                    /\.(mp4|webm|ogg|mov)(\?|$)/i.test(p.thumbnail);
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-850 transition-colors group"
                    >
                      {/* Thumbnail & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-800 flex items-center justify-center">
                            {p.thumbnail ? (
                              isVid ? (
                                <video
                                  src={p.thumbnail}
                                  className="w-full h-full object-cover"
                                  muted
                                />
                              ) : (
                                <img
                                  src={p.thumbnail}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              )
                            ) : (
                              renderCategoryIcon(cat?.icon || 'Folder', {
                                className: 'w-4 h-4 text-slate-500',
                              })
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <div className="font-semibold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">
                              {p.title}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono truncate">
                              ID: {p.id} · Order: {p.displayOrder}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-slate-300">
                        <span className="flex items-center gap-1.5">
                          {renderCategoryIcon(cat?.icon || 'Folder', {
                            className: 'w-3.5 h-3.5 text-indigo-400',
                          })}
                          <span>{cat?.name || 'Uncategorized'}</span>
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3 text-slate-400">
                        <span className="text-slate-300 font-medium">{p.type}</span>
                        {p.featured && (
                          <span className="ml-1 text-[10px] text-indigo-400 font-semibold uppercase">
                            [Featured]
                          </span>
                        )}
                        {p.popular && (
                          <span className="ml-1 text-[10px] text-purple-400 font-semibold uppercase">
                            [Hot]
                          </span>
                        )}
                      </td>

                      {/* Stats */}
                      <td className="py-3 px-3 text-slate-400 tabular-nums">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-slate-500" />
                            {p.views.toLocaleString()}
                          </span>
                          <span className="text-slate-700">·</span>
                          <span className="flex items-center gap-1">
                            <Copy className="w-3 h-3 text-slate-500" />
                            {p.copies.toLocaleString()}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => togglePublish(p.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                            p.published
                              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                          title="Click to toggle published status"
                        >
                          {p.published ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setActivePromptDetail(p)}
                            title="Preview in Viewer Modal"
                            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(p)}
                            title="Edit prompt"
                            className="p-1.5 rounded-md text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(p.id)}
                            title="Delete prompt"
                            className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white">Delete this prompt?</h3>
            <p className="text-xs text-slate-400">
              This will permanently delete this prompt from your library and viewer. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
