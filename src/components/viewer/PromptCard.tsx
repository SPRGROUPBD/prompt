import React, { useState } from 'react';
import { PromptItem, ViewDisplayMode } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { renderCategoryIcon } from '../../utils/iconMap';
import {
  Copy,
  Check,
  Eye,
  Edit3,
  Sparkles,
  TrendingUp,
  Star,
  Lock,
  Unlock,
  Play,
} from 'lucide-react';

interface PromptCardProps {
  prompt: PromptItem;
  viewMode: ViewDisplayMode;
  onViewDetail: (prompt: PromptItem) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, viewMode, onViewDetail }) => {
  const {
    categories,
    incrementStat,
    setSelectedPromptForEdit,
    setAdminSection,
    setWorkspaceMode,
    showToast,
    isFavorite,
    toggleFavorite,
    isPromptUnlocked,
    setActiveRewardPrompt,
  } = useWorkspace();

  const [copied, setCopied] = useState(false);

  const category = categories.find((c) => c.id === prompt.categoryId);
  const favorited = isFavorite(prompt.id);
  const unlocked = isPromptUnlocked(prompt);
  const isRewardLocked = prompt.accessType === 'Reward Locked' && !unlocked;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRewardLocked) {
      setActiveRewardPrompt(prompt);
      return;
    }
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(prompt.fullContent);
      }
      incrementStat(prompt.id, 'copies');
      setCopied(true);
      showToast(`Copied "${prompt.title}"!`, 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast('Copy failed', 'error');
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(prompt.id);
  };

  const handleUnlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveRewardPrompt(prompt);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPromptForEdit(prompt);
    setAdminSection('new-prompt');
    setWorkspaceMode('admin');
  };

  const isVideo =
    prompt.thumbnail.startsWith('data:video/') ||
    /\.(mp4|webm|ogg|mov)(\?|$)/i.test(prompt.thumbnail);

  if (viewMode === 'list') {
    return (
      <article
        onClick={() => onViewDetail(prompt)}
        className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-sm hover:shadow-md"
      >
        {/* Thumbnail */}
        <div className="relative w-full sm:w-36 h-28 shrink-0 rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
          {prompt.thumbnail ? (
            isVideo ? (
              <video
                src={prompt.thumbnail}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={prompt.thumbnail}
                alt={prompt.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
              {renderCategoryIcon(category?.icon || 'Folder', { className: 'w-8 h-8' })}
            </div>
          )}

          {/* Locked / Featured Badges */}
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
            {isRewardLocked ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-500/90 text-white backdrop-blur-xs">
                <Lock className="w-2.5 h-2.5" /> Locked
              </span>
            ) : prompt.featured ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/90 text-white backdrop-blur-xs">
                <Sparkles className="w-2.5 h-2.5" /> Featured
              </span>
            ) : null}
          </div>

          {/* Star Button on Thumbnail */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
            className="absolute top-1.5 right-1.5 p-1 rounded-md bg-slate-950/80 text-slate-400 hover:text-amber-400 backdrop-blur-xs transition-colors"
          >
            <Star
              className={`w-3.5 h-3.5 ${
                favorited ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="text-indigo-400 flex items-center gap-1">
              {renderCategoryIcon(category?.icon || 'Folder', { className: 'w-3 h-3' })}
              {category?.name || 'General'}
            </span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>{prompt.type}</span>
            {prompt.recommendedModel && (
              <>
                <span aria-hidden="true" className="text-slate-700">·</span>
                <span className="text-slate-500 hidden md:inline truncate max-w-[140px]">
                  {prompt.recommendedModel}
                </span>
              </>
            )}
          </div>

          <h3 className="mt-1 text-sm font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
            {prompt.title}
          </h3>

          <p className="mt-1 text-xs text-slate-400 line-clamp-1">
            {prompt.description || prompt.fullContent}
          </p>

          <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 tabular-nums">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-slate-600" />
              {prompt.views.toLocaleString()}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Copy className="w-3 h-3 text-slate-600" />
              {prompt.copies.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col items-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          {isRewardLocked ? (
            <button
              type="button"
              onClick={handleUnlockClick}
              className="w-full sm:w-28 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm shadow-amber-500/20"
            >
              <Play className="w-3 h-3 fill-slate-950" />
              <span>Unlock (Ad)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCopy}
              className={`w-full sm:w-28 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(prompt);
            }}
            className="w-full sm:w-28 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </button>
        </div>
      </article>
    );
  }

  // Grid View (Default)
  return (
    <article
      onClick={() => onViewDetail(prompt)}
      className="group relative flex flex-col justify-between rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-[16/10] bg-slate-950 overflow-hidden border-b border-slate-800/80">
        {prompt.thumbnail ? (
          isVideo ? (
            <video
              src={prompt.thumbnail}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={prompt.thumbnail}
              alt={prompt.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
            {renderCategoryIcon(category?.icon || 'Folder', { className: 'w-10 h-10' })}
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            {isRewardLocked ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-amber-500/90 text-white backdrop-blur-xs shadow-sm">
                <Lock className="w-2.5 h-2.5" /> Locked
              </span>
            ) : prompt.featured ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-indigo-600/90 text-white backdrop-blur-xs shadow-sm">
                <Sparkles className="w-2.5 h-2.5" /> Featured
              </span>
            ) : null}

            {prompt.popular && (
              <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-purple-600/90 text-white backdrop-blur-xs shadow-sm">
                <TrendingUp className="w-2.5 h-2.5" /> Hot
              </span>
            )}
          </div>

          <div className="pointer-events-auto flex items-center gap-1">
            <button
              type="button"
              onClick={handleToggleFavorite}
              title={favorited ? 'Remove from favorites' : 'Add to favorites'}
              className="p-1.5 rounded-md bg-slate-950/80 hover:bg-slate-900 text-slate-400 hover:text-amber-400 backdrop-blur-xs transition-colors"
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  favorited ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
                }`}
              />
            </button>
            <button
              type="button"
              onClick={handleEdit}
              title="Edit in Admin"
              className="p-1.5 rounded-md bg-slate-950/80 hover:bg-indigo-600 text-slate-400 hover:text-white backdrop-blur-xs transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="text-indigo-400 flex items-center gap-1">
              {renderCategoryIcon(category?.icon || 'Folder', { className: 'w-3 h-3' })}
              {category?.name || 'General'}
            </span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>{prompt.type}</span>
          </div>

          <h3 className="mt-2 text-sm font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1 leading-snug">
            {prompt.title}
          </h3>

          <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {prompt.description || prompt.fullContent}
          </p>
        </div>

        {/* Footer info & action */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 tabular-nums">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-slate-600" />
              {prompt.views.toLocaleString()}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Copy className="w-3 h-3 text-slate-600" />
              {prompt.copies.toLocaleString()}
            </span>
          </div>

          <div>
            {isRewardLocked ? (
              <button
                type="button"
                onClick={handleUnlockClick}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-xs"
              >
                <Play className="w-2.5 h-2.5 fill-slate-950" />
                <span>Unlock (Ad)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCopy}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
