import React, { useState } from 'react';
import { useWorkspace } from '../../../context/WorkspaceContext';
import { PromptCategory } from '../../../types';
import { renderCategoryIcon } from '../../../utils/iconMap';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const CategoriesSection: React.FC = () => {
  const { categories, prompts, addCategory, updateCategory, deleteCategory } =
    useWorkspace();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PromptCategory | null>(null);

  // Modal Form State
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Folder');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [enabled, setEnabled] = useState(true);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setIcon('Folder');
    setDescription('');
    setDisplayOrder(categories.length + 1);
    setEnabled(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (c: PromptCategory) => {
    setEditingCategory(c);
    setName(c.name);
    setIcon(c.icon || 'Folder');
    setDescription(c.description || '');
    setDisplayOrder(c.displayOrder || 1);
    setEnabled(c.enabled !== false);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: name.trim(),
        icon,
        description: description.trim(),
        displayOrder: Number(displayOrder) || 1,
        enabled,
      });
    } else {
      addCategory({
        name: name.trim(),
        icon,
        description: description.trim(),
        displayOrder: Number(displayOrder) || 1,
        enabled,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string, catName: string) => {
    const promptsInCat = prompts.filter((p) => p.categoryId === id).length;
    if (
      window.confirm(
        `Delete category "${catName}"? ${
          promptsInCat > 0
            ? `${promptsInCat} prompts in this category will become uncategorized.`
            : ''
        }`
      )
    ) {
      deleteCategory(id);
    }
  };

  const iconOptions = [
    { label: 'Image (AI Art)', value: 'Image' },
    { label: 'Video (Cinematic)', value: 'Video' },
    { label: 'Code2 (Coding & Tech)', value: 'Code2' },
    { label: 'BookOpen (Writing)', value: 'BookOpen' },
    { label: 'Sparkles (Marketing)', value: 'Sparkles' },
    { label: 'TrendingUp (Business & SEO)', value: 'TrendingUp' },
    { label: 'Boxes (3D & Spatial)', value: 'Boxes' },
    { label: 'Music (Audio)', value: 'Music' },
    { label: 'FileText (General Text)', value: 'Text' },
    { label: 'Folder (Default)', value: 'Folder' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Categories</h2>
          <p className="text-xs text-slate-400">
            Organize prompts into curated collections with custom icons and ordering.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((c) => {
            const count = prompts.filter((p) => p.categoryId === c.id).length;
            return (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3 shadow-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                      {renderCategoryIcon(c.icon, { className: 'w-4 h-4' })}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{c.name}</h4>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Order #{c.displayOrder}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      c.enabled
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {c.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                {c.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
                )}

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="tabular-nums">{count} {count === 1 ? 'prompt' : 'prompts'}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                      title="Edit category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-slate-800 transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marketing & Copy"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Icon
                  </label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-indigo-500 outline-none"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description for this category..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-indigo-500 outline-none"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500"
                />
                <span>Enabled (Visible to public viewers in categories bar)</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
