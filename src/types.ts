export type PromptType = 'Image' | 'Video' | 'Text' | 'Coding' | 'Audio' | '3D' | 'Marketing';

export type PromptAccessType = 'Free' | 'Reward Locked';

export interface PromptCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
  displayOrder: number;
  enabled: boolean;
  color?: string;
}

export interface PromptItem {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  fullContent: string;
  negativePrompt?: string;
  recommendedModel?: string;
  type: PromptType;
  accessType: PromptAccessType;
  thumbnail: string;
  displayOrder: number;
  featured: boolean;
  popular: boolean;
  published: boolean;
  views: number;
  copies: number;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export type RewardAdProvider = 'custom_video' | 'unity' | 'startio' | 'adsterra' | 'google';

export interface RewardAdConfig {
  provider: RewardAdProvider;
  placementId: string;
  enabled: boolean;
  customVideoUrl: string;
  customVideoDurationSec: number;
  customVideoType: 'youtube' | 'direct' | 'facebook';
  dailyUnlockLimit: number;
  unlockDurationMs: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  isAdmin: boolean;
  createdAt?: number;
}

export type WorkspaceMode = 'viewer' | 'admin' | 'split';
export type AdminSection = 'dashboard' | 'prompts' | 'new-prompt' | 'categories' | 'ads' | 'settings';
export type ViewerNavFilter = 'all' | 'latest' | 'popular' | 'featured' | 'free' | 'favorites';
export type ViewDisplayMode = 'grid' | 'list';
