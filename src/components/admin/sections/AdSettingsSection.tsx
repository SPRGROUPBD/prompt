import React, { useState } from 'react';
import { useWorkspace } from '../../../context/WorkspaceContext';
import { RewardAdProvider } from '../../../types';
import {
  Tv,
  Save,
  Play,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Smartphone,
  Layers,
  Sparkles,
} from 'lucide-react';

export const AdSettingsSection: React.FC = () => {
  const { adConfig, updateAdConfig, showToast, setActiveRewardPrompt, prompts } =
    useWorkspace();

  const [provider, setProvider] = useState<RewardAdProvider>(adConfig.provider || 'admob');
  const [enabled, setEnabled] = useState(adConfig.enabled !== false);

  // AdMob
  const [admobAdUnitId, setAdmobAdUnitId] = useState(adConfig.admobAdUnitId || '');

  // Start.io
  const [startioAppId, setStartioAppId] = useState(adConfig.startioAppId || '');

  // UnityAds
  const [unityGameId, setUnityGameId] = useState(adConfig.unityGameId || '');
  const [unityPlacementId, setUnityPlacementId] = useState(adConfig.unityPlacementId || '');

  // Wortise
  const [wortiseAppId, setWortiseAppId] = useState(adConfig.wortiseAppId || '');
  const [wortiseAdUnitId, setWortiseAdUnitId] = useState(adConfig.wortiseAdUnitId || '');

  // Custom Video & General
  const [customVideoUrl, setCustomVideoUrl] = useState(adConfig.customVideoUrl || '');
  const [customVideoDurationSec, setCustomVideoDurationSec] = useState<number>(
    adConfig.customVideoDurationSec || 15
  );
  const [dailyUnlockLimit, setDailyUnlockLimit] = useState<number>(
    adConfig.dailyUnlockLimit || 20
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdConfig({
      provider,
      enabled,
      admobAdUnitId: admobAdUnitId.trim(),
      startioAppId: startioAppId.trim(),
      unityGameId: unityGameId.trim(),
      unityPlacementId: unityPlacementId.trim(),
      wortiseAppId: wortiseAppId.trim(),
      wortiseAdUnitId: wortiseAdUnitId.trim(),
      customVideoUrl: customVideoUrl.trim(),
      customVideoDurationSec: Number(customVideoDurationSec) || 15,
      dailyUnlockLimit: Number(dailyUnlockLimit) || 20,
    });
  };

  const handleTestAd = () => {
    const targetPrompt = prompts.find((p) => p.accessType === 'Reward Locked') || prompts[0];
    if (targetPrompt) {
      setActiveRewardPrompt(targetPrompt);
    } else {
      showToast('No prompts in library to test unlock with', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Rewarded Video Ads & Network Settings
          </h2>
          <p className="text-xs text-slate-400">
            Configure SDK credentials for AdMob, Start.io, UnityAds, and Wortise rewarded video ad units.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestAd}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5 text-indigo-400" />
          <span>Test Rewarded Ad Flow</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Active Provider & Global Master Switch */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Active Ad Network</h3>
            </div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500"
              />
              <span>Reward Ads Enabled</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Active Rewarded Video Network
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { id: 'admob', label: 'AdMob', desc: 'Google Ads' },
                { id: 'startio', label: 'Start.io', desc: 'Rewarded Video' },
                { id: 'unity', label: 'UnityAds', desc: 'Game Network' },
                { id: 'wortise', label: 'Wortise', desc: 'Mediation / Ads' },
                { id: 'custom_video', label: 'Custom Video', desc: 'Direct / MP4' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setProvider(item.id as RewardAdProvider)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    provider === item.id
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">{item.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* REWARDED VIDEO ADS CONFIGURATION SECTION */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">REWARDED VIDEO ADS</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              SDK &amp; Web Ad Unit Configuration
            </span>
          </div>

          {/* 1. Google AdMob */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-white">Google AdMob</span>
              </div>
              {provider === 'admob' && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Active Provider
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admob Ad unit ID:
              </label>
              <input
                type="text"
                value={admobAdUnitId}
                onChange={(e) => setAdmobAdUnitId(e.target.value)}
                placeholder="ca-app-pub-3940256099942544/5224354917"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Your rewarded video ad unit ID created inside Google AdMob dashboard.
              </span>
            </div>
          </div>

          {/* 2. Start.io */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs font-bold text-white">Start.io</span>
              </div>
              {provider === 'startio' && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Active Provider
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Start.io App ID:
              </label>
              <input
                type="text"
                value={startioAppId}
                onChange={(e) => setStartioAppId(e.target.value)}
                placeholder="e.g. 208394102"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Start.io Portal App ID for rewarded video / interstitial delivery.
              </span>
            </div>
          </div>

          {/* 3. UnityAds */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span className="text-xs font-bold text-white">UnityAds</span>
              </div>
              {provider === 'unity' && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  Active Provider
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  UnityAds Game ID:
                </label>
                <input
                  type="text"
                  value={unityGameId}
                  onChange={(e) => setUnityGameId(e.target.value)}
                  placeholder="e.g. 5128394"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Placement ID:
                </label>
                <input
                  type="text"
                  value={unityPlacementId}
                  onChange={(e) => setUnityPlacementId(e.target.value)}
                  placeholder="e.g. Rewarded_Android or rewardedVideo"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* 4. Wortise */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                <span className="text-xs font-bold text-white">Wortise</span>
              </div>
              {provider === 'wortise' && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30">
                  Active Provider
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Wortise App ID:
                </label>
                <input
                  type="text"
                  value={wortiseAppId}
                  onChange={(e) => setWortiseAppId(e.target.value)}
                  placeholder="e.g. test-app-wortise-123"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  AdUnit ID:
                </label>
                <input
                  type="text"
                  value={wortiseAdUnitId}
                  onChange={(e) => setWortiseAdUnitId(e.target.value)}
                  placeholder="e.g. test-rewarded-ad-unit"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* 5. Custom Video / Fallback */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span className="text-xs font-bold text-white">Custom / Direct Video Showcase</span>
              </div>
              {provider === 'custom_video' && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Active Provider
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sponsored Video URL (MP4 or Direct Stream)
                </label>
                <input
                  type="text"
                  value={customVideoUrl}
                  onChange={(e) => setCustomVideoUrl(e.target.value)}
                  placeholder="https://example.com/ad-video.mp4"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Duration (Seconds)
                </label>
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={customVideoDurationSec}
                  onChange={(e) => setCustomVideoDurationSec(parseInt(e.target.value) || 15)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Daily limits */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-semibold text-white">Daily Unlock Limit Per User</h4>
            <p className="text-[11px] text-slate-400">
              Maximum rewarded unlocks a user can claim within a 24-hour cycle.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={100}
              value={dailyUnlockLimit}
              onChange={(e) => setDailyUnlockLimit(parseInt(e.target.value) || 20)}
              className="w-20 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white text-center font-bold focus:border-indigo-500 outline-none"
            />
            <span className="text-xs text-slate-400">unlocks / day</span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Ad Settings to Firebase</span>
          </button>

          <span className="text-[11px] text-slate-500">
            Realtime sync active with Firebase Realtime Database
          </span>
        </div>
      </form>
    </div>
  );
};
