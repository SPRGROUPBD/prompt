import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../../context/WorkspaceContext';
import { PromptItem, PromptType, PromptAccessType } from '../../../types';
import { renderCategoryIcon } from '../../../utils/iconMap';
import {
  Save,
  Trash2,
  X,
  Upload,
  Link,
  Eye,
  Sparkles,
  TrendingUp,
  Lock,
  Unlock,
} from 'lucide-react';

export const PromptEditorSection: React.FC = () => {
  const {
    prompts,
    categories,
    selectedPromptForEdit,
    setSelectedPromptForEdit,
    addPrompt,
    updatePrompt,
    deletePrompt,
    setAdminSection,
    showToast,
  } = useWorkspace();

  const isEditing = Boolean(selectedPromptForEdit);

  // Form State
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState<PromptType>('Coding');
  const [accessType, setAccessType] = useState<PromptAccessType>('Free');
  const [description, setDescription] = useState('');
  const [fullContent, setFullContent] = useState('');
  const [recommendedModel, setRecommendedModel] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [featured, setFeatured] = useState(false);
  const [popular, setPopular] = useState(false);
  const [published, setPublished] = useState(true);
  const [tagsInput, setTagsInput] = useState('');

  // Auto calculate display order based on category
  const calculateNextDisplayOrder = (catId: string) => {
    const inCategory = prompts.filter((p) => p.categoryId === catId);
    return inCategory.length + 1;
  };

  useEffect(() => {
    if (selectedPromptForEdit) {
      setTitle(selectedPromptForEdit.title || '');
      setCategoryId(selectedPromptForEdit.categoryId || '');
      setType(selectedPromptForEdit.type || 'Coding');
      setAccessType(selectedPromptForEdit.accessType || 'Free');
      setDescription(selectedPromptForEdit.description || '');
      setFullContent(selectedPromptForEdit.fullContent || '');
      setRecommendedModel(selectedPromptForEdit.recommendedModel || '');
      setNegativePrompt(selectedPromptForEdit.negativePrompt || '');
      setThumbnail(selectedPromptForEdit.thumbnail || '');
      setDisplayOrder(selectedPromptForEdit.displayOrder || 1);
      setFeatured(Boolean(selectedPromptForEdit.featured));
      setPopular(Boolean(selectedPromptForEdit.popular));
      setPublished(selectedPromptForEdit.published !== false);
      setTagsInput(selectedPromptForEdit.tags ? selectedPromptForEdit.tags.join(', ') : '');
    } else {
      // New prompt defaults
      const defaultCatId = categories[0]?.id || '';
      setTitle('');
      setCategoryId(defaultCatId);
      setType('Coding');
      setAccessType('Free');
      setDescription('');
      setFullContent('');
      setRecommendedModel('Claude 3.5 Sonnet / GPT-4o');
      setNegativePrompt('');
      setThumbnail('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80');
      setDisplayOrder(calculateNextDisplayOrder(defaultCatId));
      setFeatured(false);
      setPopular(false);
      setPublished(true);
      setTagsInput('Prompt, AI, Production');
    }
  }, [selectedPromptForEdit, categories]);

  const handleCategoryChange = (newCatId: string) => {
    setCategoryId(newCatId);
    if (!isEditing) {
      setDisplayOrder(calculateNextDisplayOrder(newCatId));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds 5MB limit. Please choose a smaller image or video.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setThumbnail(reader.result);
        showToast('Thumbnail loaded from file!', 'success');
      }
    };
    reader.onerror = () => {
      showToast('Failed to read file', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Please enter a prompt title', 'error');
      return;
    }
    if (!fullContent.trim()) {
      showToast('Please enter the full prompt content', 'error');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (isEditing && selectedPromptForEdit) {
      updatePrompt(selectedPromptForEdit.id, {
        title: title.trim(),
        categoryId,
        type,
        accessType,
        description: description.trim(),
        fullContent,
        recommendedModel: recommendedModel.trim() || undefined,
        negativePrompt: negativePrompt.trim() || undefined,
        thumbnail,
        displayOrder: Number(displayOrder) || 1,
        featured,
        popular,
        published,
        tags,
      });
      setAdminSection('prompts');
    } else {
      addPrompt({
        title: title.trim(),
        categoryId,
        type,
        accessType,
        description: description.trim(),
        fullContent,
        recommendedModel: recommendedModel.trim() || undefined,
        negativePrompt: negativePrompt.trim() || undefined,
        thumbnail,
        displayOrder: Number(displayOrder) || 1,
        featured,
        popular,
        published,
        tags,
      });
      setAdminSection('prompts');
    }
  };

  const handleDelete = () => {
    if (selectedPromptForEdit && window.confirm(`Permanently delete "${selectedPromptForEdit.title}"?`)) {
      deletePrompt(selectedPromptForEdit.id);
      setSelectedPromptForEdit(null);
      setAdminSection('prompts');
    }
  };

  const currentCategory = categories.find((c) => c.id === categoryId);
  const isVideo =
    thumbnail.startsWith('data:video/') || /\.(mp4|webm|ogg|mov)(\?|$)/i.test(thumbnail);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isEditing ? 'Edit Prompt' : 'Add New Prompt'}
          </h2>
          <p className="text-xs text-slate-400">
            {isEditing
              ? `Editing: ${selectedPromptForEdit?.title} (ID: ${selectedPromptForEdit?.id})`
              : 'Add a new template to the library. Changes appear immediately in Viewer.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedPromptForEdit(null);
            setAdminSection('prompts');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Prompt Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cinematic Tokyo Rain Street Photography"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Category & Type Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Prompt Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as PromptType)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                >
                  <option value="Image">Image</option>
                  <option value="Video">Video</option>
                  <option value="Coding">Coding</option>
                  <option value="Text">Text</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Audio">Audio</option>
                  <option value="3D">3D</option>
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
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Access Type Selector: Free vs Reward Locked */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Access & Monetization Model
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccessType('Free')}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                    accessType === 'Free'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-xs'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Unlock className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <div className="font-semibold">Free Prompt</div>
                    <div className="text-[10px] text-slate-400">Instant copy for everyone</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAccessType('Reward Locked')}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                    accessType === 'Reward Locked'
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 shadow-xs'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <div className="font-semibold">Reward Locked</div>
                    <div className="text-[10px] text-slate-400">Users watch ad video to unlock</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Short Description
              </label>
              <textarea
                rows={2}
                maxLength={400}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="One or two sentences summarizing the prompt intent and output."
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Full Prompt Content */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Prompt Template Text <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={6}
                value={fullContent}
                onChange={(e) => setFullContent(e.target.value)}
                placeholder="Paste the complete prompt with instructions, parameters, and syntax..."
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 outline-none leading-relaxed"
              />
            </div>

            {/* Model & Tags Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recommended Model
                </label>
                <input
                  type="text"
                  value={recommendedModel}
                  onChange={(e) => setRecommendedModel(e.target.value)}
                  placeholder="e.g. Midjourney v6.1, Claude 3.5 Sonnet, Flux.1"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Street Photography, Tokyo, Cyberpunk"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Negative Prompt (optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Negative Prompt / Negative Constraints (optional)
              </label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="e.g. blurry, cartoon, oversaturated, deformed hands"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Thumbnail Upload or URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Thumbnail Asset (Image URL or File Upload)
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://... or upload local image/video below"
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                />
                <label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer transition-colors shrink-0">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Checkboxes for featured, popular, published */}
            <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500"
                />
                <span>Published (Visible in Viewer)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500"
                />
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>Featured</span>
                </span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500"
                />
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-purple-400" />
                  <span>Popular / Hot</span>
                </span>
              </label>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Update Prompt' : 'Save New Prompt'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedPromptForEdit(null);
                  setAdminSection('prompts');
                }}
                className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </form>

        {/* Right 1 Col: Real-time Live Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold tracking-wider uppercase">
            <span>Live Card Preview</span>
            <span className="text-[11px] text-emerald-400 font-normal">Real-Time</span>
          </div>

          <div className="p-1 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="relative rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-md">
              {/* Thumbnail */}
              <div className="relative w-full aspect-[16/10] bg-slate-900 overflow-hidden border-b border-slate-800">
                {thumbnail ? (
                  isVideo ? (
                    <video
                      src={thumbnail}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={thumbnail}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    {renderCategoryIcon(currentCategory?.icon || 'Folder', {
                      className: 'w-10 h-10',
                    })}
                  </div>
                )}

                <div className="absolute top-2 left-2 flex items-center gap-1">
                  {accessType === 'Reward Locked' && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-500/90 text-white">
                      <Lock className="w-2.5 h-2.5" /> Locked
                    </span>
                  )}
                  {featured && (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-600/90 text-white">
                      Featured
                    </span>
                  )}
                  {popular && (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-purple-600/90 text-white">
                      Hot
                    </span>
                  )}
                  {!published && (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="text-indigo-400 font-medium flex items-center gap-1">
                    {renderCategoryIcon(currentCategory?.icon || 'Folder', {
                      className: 'w-3 h-3',
                    })}
                    {currentCategory?.name || 'Category'}
                  </span>
                  <span>·</span>
                  <span>{type}</span>
                </div>

                <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">
                  {title || 'Prompt Title Preview'}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {description || fullContent || 'Description or prompt template will appear here...'}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>0 views · 0 copies</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      accessType === 'Reward Locked'
                        ? 'bg-amber-600 text-white'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {accessType === 'Reward Locked' ? 'Unlock with Ad' : 'Copy'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
