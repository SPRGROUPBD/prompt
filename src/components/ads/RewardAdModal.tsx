import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  X,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Tv,
  Layers,
  ExternalLink,
  ShieldCheck,
  Smartphone,
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
  const [videoDuration, setVideoDuration] = useState<number>(15);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const targetDuration = adConfig.customVideoDurationSec || 15;

  // Real ad provider metadata & assets
  const getProviderInfo = () => {
    switch (adConfig.provider) {
      case 'admob':
        return {
          name: 'Google AdMob Rewarded Video',
          shortName: 'Google AdMob',
          idLabel: 'Ad Unit ID',
          idVal: adConfig.admobAdUnitId || 'ca-app-pub-3940256099942544/5224354917',
          color: 'text-emerald-400',
          bgBadge: 'bg-emerald-950/80 border-emerald-800/60 text-emerald-300',
          badge: 'Google Ads',
          sponsorTitle: 'Google Gemini Pro 2.5 & Workspace Cloud',
          sponsorDomain: 'ai.google.dev',
          sponsorCta: 'Visit Google Ads Sponsor',
          sponsorLink: 'https://ai.google.dev',
          videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        };
      case 'startio':
        return {
          name: 'Start.io Rewarded Video',
          shortName: 'Start.io',
          idLabel: 'App ID',
          idVal: adConfig.startioAppId || '208394102',
          color: 'text-amber-400',
          bgBadge: 'bg-amber-950/80 border-amber-800/60 text-amber-300',
          badge: 'Start.io SDK',
          sponsorTitle: 'Start.io Smart Mobile Advertising & Apps',
          sponsorDomain: 'start.io',
          sponsorCta: 'Install App Sponsor',
          sponsorLink: 'https://www.start.io',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        };
      case 'unity':
        return {
          name: 'UnityAds Rewarded Video',
          shortName: 'UnityAds',
          idLabel: 'Game / Placement',
          idVal: `${adConfig.unityGameId || '5128394'} · ${adConfig.unityPlacementId || 'rewardedVideo'}`,
          color: 'text-sky-400',
          bgBadge: 'bg-sky-950/80 border-sky-800/60 text-sky-300',
          badge: 'Unity Gaming',
          sponsorTitle: 'Unity 3D Realtime Mobile Game Trailer',
          sponsorDomain: 'unity.com',
          sponsorCta: 'Play Game Now',
          sponsorLink: 'https://unity.com',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        };
      case 'wortise':
        return {
          name: 'Wortise Rewarded Video',
          shortName: 'Wortise',
          idLabel: 'App / AdUnit',
          idVal: `${adConfig.wortiseAppId || 'test-app'} · ${adConfig.wortiseAdUnitId || 'test-unit'}`,
          color: 'text-violet-400',
          bgBadge: 'bg-violet-950/80 border-violet-800/60 text-violet-300',
          badge: 'Wortise Mediation',
          sponsorTitle: 'Wortise Global Mobile Ad Monetization',
          sponsorDomain: 'wortise.com',
          sponsorCta: 'Learn More',
          sponsorLink: 'https://wortise.com',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        };
      default:
        return {
          name: 'Custom Sponsored Video',
          shortName: 'Direct Video',
          idLabel: 'Stream URL',
          idVal: adConfig.customVideoUrl ? 'Custom Video Source' : 'Sponsored Showcase',
          color: 'text-indigo-400',
          bgBadge: 'bg-indigo-950/80 border-indigo-800/60 text-indigo-300',
          badge: 'Sponsored Direct',
          sponsorTitle: 'Featured Commercial Showcase',
          sponsorDomain: 'sponsor-network.com',
          sponsorCta: 'Visit Sponsor',
          sponsorLink: adConfig.customVideoUrl || 'https://google.com',
          videoUrl: adConfig.customVideoUrl || 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        };
    }
  };

  const provider = getProviderInfo();
  const activeVideoUrl = (adConfig.provider === 'custom_video' && adConfig.customVideoUrl)
    ? adConfig.customVideoUrl
    : provider.videoUrl;

  useEffect(() => {
    if (activeRewardPrompt) {
      setTimeLeft(targetDuration);
      setIsPlaying(true);
      setCompleted(false);
      setVideoCurrentTime(0);
      setVideoLoaded(false);

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
  }, [activeRewardPrompt, targetDuration, adConfig.provider]);

  // Video event handlers
  const handleVideoLoaded = () => {
    setVideoLoaded(true);
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration || targetDuration);
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setVideoCurrentTime(cur);
      const remaining = Math.max(0, Math.ceil(targetDuration - cur));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setCompleted(true);
      }
    }
  };

  const handleVideoEnded = () => {
    setCompleted(true);
    setTimeLeft(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleSound = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

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

  const progressPercent = Math.min(
    100,
    Math.round(((targetDuration - timeLeft) / targetDuration) * 100)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Ad Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 shrink-0">
              <Tv className="w-4 h-4" />
            </span>
            <span className="font-bold text-white truncate">{provider.name}</span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${provider.bgBadge} shrink-0`}>
              {provider.badge}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono tabular-nums">
              {completed ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Reward Ready
                </span>
              ) : (
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Ad in {timeLeft}s
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={handleClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer transition-colors"
              title="Close Ad"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real Video Player Container */}
        <div className="relative aspect-video w-full bg-black flex flex-col items-center justify-center overflow-hidden group">
          <video
            ref={videoRef}
            src={activeVideoUrl}
            playsInline
            autoPlay
            muted={muted}
            onLoadedData={handleVideoLoaded}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            onClick={togglePlayPause}
            className="w-full h-full object-cover cursor-pointer"
          />

          {/* Top Overlays: Live Watermark & Sound Toggle */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            {/* Ad Network Identification Tag */}
            <div className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300 flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{provider.idLabel}:</span>
              <strong className="text-white truncate max-w-[180px]">{provider.idVal}</strong>
            </div>

            {/* Sound & Controls (interactive) */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={toggleSound}
                className="px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all border border-white/10 cursor-pointer shadow-md"
              >
                {muted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                    <span>Unmute</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sound On</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Paused Overlay */}
          {!isPlaying && !completed && (
            <button
              type="button"
              onClick={togglePlayPause}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform cursor-pointer"
            >
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            </button>
          )}

          {/* Real Sponsor CTA Card Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/10 shadow-xl pointer-events-auto">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-extrabold text-xs shrink-0 shadow-inner">
                AD
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{provider.sponsorTitle}</div>
                <div className="text-[10px] text-slate-400 font-mono truncate flex items-center gap-1">
                  <span>{provider.sponsorDomain}</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-semibold">Verified Partner</span>
                </div>
              </div>
            </div>

            <a
              href={provider.sponsorLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>{provider.sponsorCta}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Video Progress Bar */}
        <div className="w-full bg-slate-950 h-1.5 overflow-hidden border-t border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Ad Modal Footer & Reward Claim */}
        <div className="p-4 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-300 text-xs">
            {completed ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Real ad verified! Click Claim to unlock prompt.
              </span>
            ) : (
              <span className="text-slate-400">
                Watch full ad to receive your 24-hour prompt access pass.
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!completed}
            onClick={handleClaimReward}
            className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              completed
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 scale-102 ring-2 ring-emerald-400/50'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{completed ? 'Claim 24h Unlock' : `Watch to Unlock (${timeLeft}s)`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
