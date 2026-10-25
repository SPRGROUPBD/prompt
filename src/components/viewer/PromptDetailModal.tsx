import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PromptItem } from '../../types';
import { renderCategoryIcon } from '../../utils/iconMap';
import {
  X,
  Copy,
  Check,
  Share2,
  Edit3,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  Cpu,
  Star,
  Lock,
  Play,
  TrendingUp,
  Flame,
} from 'lucide-react';

interface PromptDetailModalProps {
  prompt: PromptItem | null;
  onClose: () => void;
}

export const PromptDetailModal: React.FC<PromptDetailModalProps> = ({ prompt, onClose }) => {
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
    isUserAdmin,
  } = useWorkspace();
  const [copied, setCopied] = useState(false);

  if (!prompt) return null;

  const category = categories.find((c) => c.id === prompt.categoryId);
  const favorited = isFavorite(prompt.id);
  const unlocked = isPromptUnlocked(prompt);
  const isRewardLocked = prompt.accessType === 'Reward Locked' && !unlocked;

  // Trending condition: viewed more than 50 times in the last 24 hours
  const isTrending = Boolean(
    (prompt.recentViews24h && prompt.recentViews24h > 50) ||
    (prompt.views > 50 && prompt.lastViewedAt && Date.now() - prompt.lastViewedAt < 86400000) ||
    (prompt.popular && prompt.views > 50)
  );
  const views24hCount = prompt.recentViews24h || (prompt.views > 50 ? Math.min(prompt.views, 128) : prompt.views);

  const handleCopy = async () => {
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
      showToast('Prompt copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: prompt.title,
          text: prompt.description,
          url: shareUrl,
        });
      } catch (err) {
        // cancelled
      }
    } else {
      navigator.clipboard?.writeText(shareUrl);
      showToast('Link copied to clipboard!', 'info');
    }
  };

  const handleEditInAdmin = () => {
    if (!isUserAdmin) return;
    setSelectedPromptForEdit(prompt);
    setAdminSection('new-prompt');
    setWorkspaceMode('admin');
    onClose();
  };

  const handleUnlockClick = () => {
    setActiveRewardPrompt(prompt);
  };

  const isVideo =
    prompt.thumbnail.startsWith('data:video/') ||
    /\.(mp4|webm|ogg|mov)(\?|$)/i.test(prompt.thumbnail);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              {renderCategoryIcon(category?.icon || 'Folder', { className: 'w-4 h-4' })}
            </span>
            <div className="text-xs text-slate-400 font-medium">
              <span>{category?.name || 'Uncategorized'}</span>
              <span className="mx-1.5">·</span>
              <span>{prompt.type}</span>
              {prompt.accessType === 'Reward Locked' && (
                <>
                  <span className="mx-1.5">·</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1 inline-flex">
                    <Lock className="w-3 h-3" /> Reward Locked
                  </span>
                </>
              )}
              {isTrending && (
                <>
                  <span className="mx-1.5 text-slate-600">·</span>
                  <span
                    title={`Trending: ${views24hCount}+ views in the last 24 hours`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30"
                  >
                    <TrendingUp className="w-3 h-3 text-rose-400 animate-pulse" />
                    <span>Trending</span>
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Star Favorite Button */}
            <button
              type="button"
              onClick={() => toggleFavorite(prompt.id)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition-colors"
              title={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                className={`w-4 h-4 ${
                  favorited ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
                }`}
              />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Title & Description */}
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
              {prompt.title}
            </h2>
            {prompt.description && (
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                {prompt.description}
              </p>
            )}
          </div>

          {/* Media preview */}
          {prompt.thumbnail && (
            <div className="w-full max-h-72 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
              {isVideo ? (
                <video
                  src={prompt.thumbnail}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full max-h-72 object-contain"
                />
              ) : (
                <img
                  src={prompt.thumbnail}
                  alt={prompt.title}
                  className="w-full h-full max-h-72 object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          )}

          {/* Metrics bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 py-2.5 px-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>{prompt.views.toLocaleString()} views</span>
            </div>
            <span className="text-slate-700">·</span>
            <div className="flex items-center gap-1.5">
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{prompt.copies.toLocaleString()} copies</span>
            </div>
            {prompt.recommendedModel && (
              <>
                <span className="text-slate-700">·</span>
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-indigo-300">{prompt.recommendedModel}</span>
                </div>
              </>
            )}
            <span className="text-slate-700">·</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
            </div>
            {isTrending && (
              <>
                <span className="text-slate-700">·</span>
                <div
                  className="flex items-center gap-1.5 text-rose-400 font-medium"
                  title="Over 50 views in the last 24 hours"
                >
                  <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>Trending ({views24hCount} views in 24h)</span>
                </div>
              </>
            )}
          </div>

          {/* Full Prompt Content (Locked overlay vs unlocked code) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold tracking-wider uppercase">
              <span>Full Prompt Template</span>
              {isRewardLocked ? (
                <span className="text-[11px] text-amber-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Reward Ad Required
                </span>
              ) : (
                <span className="text-[11px] text-slate-500 lowercase">
                  {prompt.fullContent.split(/\s+/).filter(Boolean).length} words
                </span>
              )}
            </div>

            {isRewardLocked ? (
              <div className="relative rounded-xl overflow-hidden border border-amber-500/30 bg-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shadow-md">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-bold text-white">This Prompt is Reward Locked</h4>
                  <p className="text-xs text-slate-400">
                    Watch a brief sponsored video ad (Start.io, Unity, Adsterra, or Google Ads) to unlock full access and copy this prompt template for 24 hours.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUnlockClick}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Watch Short Ad to Unlock (15s)</span>
                </button>
              </div>
            ) : (
              <div className="relative group">
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs sm:text-sm font-mono leading-relaxed whitespace-pre-wrap select-all max-h-64 overflow-y-auto">
                  {prompt.fullContent}
                </pre>
              </div>
            )}
          </div>

          {/* Negative prompt if present and unlocked */}
          {!isRewardLocked && prompt.negativePrompt && (
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
                Negative Prompt / Avoid
              </span>
              <pre className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-red-300 text-xs font-mono leading-relaxed whitespace-pre-wrap select-all">
                {prompt.negativePrompt}
              </pre>
            </div>
          )}

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              {prompt.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-md"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            {isUserAdmin && (
              <button
                type="button"
                onClick={handleEditInAdmin}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                title="Open this prompt directly in Admin Studio"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Edit in Admin</span>
              </button>
            )}
          </div>

          {isRewardLocked ? (
            <button
              type="button"
              onClick={handleUnlockClick}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Unlock to Copy</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg shadow-sm transition-all ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Full Prompt</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
