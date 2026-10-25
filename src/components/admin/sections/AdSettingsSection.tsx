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
} from 'lucide-react';

export const AdSettingsSection: React.FC = () => {
  const { adConfig, updateAdConfig, showToast, setActiveRewardPrompt, prompts } =
    useWorkspace();

  const [provider, setProvider] = useState<RewardAdProvider>(adConfig.provider || 'custom_video');
  const [placementId, setPlacementId] = useState(adConfig.placementId || '');
  const [enabled, setEnabled] = useState(adConfig.enabled !== false);
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
      placementId: placementId.trim(),
      enabled,
      customVideoUrl: customVideoUrl.trim(),
      customVideoDurationSec: Number(customVideoDurationSec) || 15,
      dailyUnlockLimit: Number(dailyUnlockLimit) || 20,
    });
  };

  const handleTestAd = () => {
    const targetPrompt = prompts[0];
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
          <h2 className="text-xl font-bold text-white tracking-tight">Reward Ads & Ad Network</h2>
          <p className="text-xs text-slate-400">
            Configure Start.io, Unity Ads, Adsterra, Google AdMob, or custom video reward callbacks.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestAd}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5 text-indigo-400" />
          <span>Test Reward Ad Flow</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Main Configuration Card */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ad Network Provider
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as RewardAdProvider)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none"
              >
                <option value="custom_video">Custom / Sponsored Video (YouTube, MP4)</option>
                <option value="unity">Unity Ads Rewarded SDK</option>
                <option value="startio">Start.io Rewarded Interstitial</option>
                <option value="adsterra">Adsterra Video Network</option>
                <option value="google">Google Rewarded Ads (AdMob)</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Determines the interactive video presentation and reward callback flow.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Placement ID / App ID
              </label>
              <input
                type="text"
                value={placementId}
                onChange={(e) => setPlacementId(e.target.value)}
                placeholder="e.g. ca-app-pub-3940256099942544/5224354917"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Provided by your ad network dashboard (Unity, Start.io, Adsterra, AdMob).
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sponsored Video URL (for Custom Video mode)
              </label>
              <input
                type="text"
                value={customVideoUrl}
                onChange={(e) => setCustomVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or .mp4"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Daily Unlock Limit
                </label>
                <input
                  type="number"
                  min={1}
                  value={dailyUnlockLimit}
                  onChange={(e) => setDailyUnlockLimit(parseInt(e.target.value) || 20)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Network Guides Info Card */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
          <span className="font-semibold text-slate-300">Supported Network Integrations:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div>
              <strong className="text-indigo-300">Start.io:</strong> Uses rewarded video & interstitial placement tags for web and mobile.
            </div>
            <div>
              <strong className="text-indigo-300">Unity Ads:</strong> Interactive rewarded game and app video callbacks.
            </div>
            <div>
              <strong className="text-indigo-300">Adsterra:</strong> Direct video link and social bar video integrations.
            </div>
            <div>
              <strong className="text-indigo-300">Custom Video:</strong> Paste any YouTube Shorts or MP4 clip to require watching before unlock.
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Ad Settings</span>
        </button>
      </form>
    </div>
  );
};
