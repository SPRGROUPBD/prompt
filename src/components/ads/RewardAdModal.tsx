import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  X,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Tv,
  Layers,
} from 'lucide-react';

export const RewardAdModal: React.FC = () => {
  const {
    activeRewardPrompt,
    setActiveRewardPrompt,
    unlockPrompt,
    adConfig,
    showToast,
    setActivePromptDetail,
  } = useWorkspace();

  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [completed, setCompleted] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const duration = adConfig.customVideoDurationSec || 15;

  useEffect(() => {
    if (activeRewardPrompt) {
      setTimeLeft(duration);
      setIsPlaying(true);
      setCompleted(false);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeRewardPrompt, duration]);

  if (!activeRewardPrompt) return null;

  const handleClaimReward = () => {
    unlockPrompt(activeRewardPrompt.id);
    showToast(`"${activeRewardPrompt.title}" unlocked successfully!`, 'success');
    const p = activeRewardPrompt;
    setActiveRewardPrompt(null);
    setActivePromptDetail(p);
  };

  const handleClose = () => {
    if (!completed) {
      if (!window.confirm('Closing the video early will cancel the unlock. Close anyway?')) {
        return;
      }
    }
    setActiveRewardPrompt(null);
  };

  const progressPercent = Math.min(100, Math.round(((duration - timeLeft) / duration) * 100));

  // Determine provider label & branding
  const getProviderInfo = () => {
    switch (adConfig.provider) {
      case 'unity':
        return { name: 'Unity Ads Rewarded SDK', color: 'text-sky-400', badge: 'Unity Ads' };
      case 'startio':
        return { name: 'Start.io Interactive Ad', color: 'text-amber-400', badge: 'Start.io' };
      case 'adsterra':
        return { name: 'Adsterra Video Network', color: 'text-pink-400', badge: 'Adsterra' };
      case 'google':
        return { name: 'Google Rewarded Ads (AdMob)', color: 'text-emerald-400', badge: 'Google Ads' };
      default:
        return { name: 'Sponsored Video Network', color: 'text-indigo-400', badge: 'Sponsored' };
    }
  };

  const provider = getProviderInfo();

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Ad Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-500/10 text-indigo-400">
              <Tv className="w-3.5 h-3.5" />
            </span>
            <span className="font-semibold text-slate-200">{provider.name}</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              {provider.badge}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {completed ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Reward Ready
                </span>
              ) : (
                `Reward in ${timeLeft}s`
              )}
            </span>
            <button
              type="button"
              onClick={handleClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              title="Close Ad"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video / Interactive Ad Player Surface */}
        <div className="relative aspect-video w-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
          {/* Simulated Ad Visual Content */}
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/60 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 animate-pulse">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1 max-w-sm">
              <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400">
                Unlock Premium Template
              </span>
              <h3 className="text-base font-bold text-white leading-tight">
                {activeRewardPrompt.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2">
                Watching this sponsored showcase grants 24 hours of unlimited access to this prompt template.
              </p>
            </div>

            {/* Ad Network Watermark */}
            <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-2">
              <span>Placement: {adConfig.placementId || 'ca-app-pub-dev'}</span>
              <span>·</span>
              <span className="text-indigo-400 font-mono">24h Pass</span>
            </div>
          </div>

          {/* Sound toggle button */}
          <button
            type="button"
            onClick={() => setMuted(!muted)}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-950/80 text-slate-400 hover:text-white backdrop-blur-xs transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-2 overflow-hidden border-t border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Ad Footer */}
        <div className="p-4 bg-slate-900 flex items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 text-xs">
            {completed ? (
              <span className="text-emerald-400 font-medium">
                ✓ Video finished! Click claim to unlock prompt.
              </span>
            ) : (
              <span>Keep this window open to receive your prompt unlock.</span>
            )}
          </div>

          <button
            type="button"
            disabled={!completed}
            onClick={handleClaimReward}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              completed
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Claim Unlock</span>
          </button>
        </div>
      </div>
    </div>
  );
};
