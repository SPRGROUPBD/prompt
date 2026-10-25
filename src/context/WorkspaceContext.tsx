import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PromptItem, PromptCategory, WorkspaceMode, AdminSection, RewardAdConfig, UserProfile } from '../types';
import { INITIAL_PROMPTS, INITIAL_CATEGORIES, DEFAULT_AD_CONFIG } from '../data/seedData';
import { auth, rtdb, FIXED_ADMIN_EMAIL, FIXED_ADMIN_UID, isAdminUser } from '../services/firebase';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { ref, onValue, set, update as rtdbUpdate } from 'firebase/database';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface WorkspaceContextType {
  prompts: PromptItem[];
  categories: PromptCategory[];
  isLoadingData: boolean;
  workspaceMode: WorkspaceMode;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  adminSection: AdminSection;
  setAdminSection: (section: AdminSection) => void;
  selectedPromptForEdit: PromptItem | null;
  setSelectedPromptForEdit: (prompt: PromptItem | null) => void;
  activePromptDetail: PromptItem | null;
  setActivePromptDetail: (prompt: PromptItem | null) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  
  // Prompt CRUD (saves directly to Firebase Realtime Database)
  addPrompt: (promptData: Omit<PromptItem, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'copies'>) => Promise<PromptItem>;
  updatePrompt: (id: string, updates: Partial<PromptItem>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  togglePublish: (id: string) => Promise<void>;
  incrementStat: (id: string, field: 'views' | 'copies') => void;
  
  // Category CRUD
  addCategory: (categoryData: Omit<PromptCategory, 'id'>) => Promise<PromptCategory>;
  updateCategory: (id: string, updates: Partial<PromptCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Favorites (In-memory + Firebase sync, NO local storage)
  favoritePromptIds: string[];
  toggleFavorite: (promptId: string) => void;
  isFavorite: (promptId: string) => boolean;

  // Reward Ad & Unlocks (In-memory + Firebase sync, NO local storage)
  adConfig: RewardAdConfig;
  updateAdConfig: (updates: Partial<RewardAdConfig>, silent?: boolean) => Promise<void>;
  activeRewardPrompt: PromptItem | null;
  setActiveRewardPrompt: (prompt: PromptItem | null) => void;
  unlockedPromptIds: string[];
  unlockPrompt: (promptId: string) => void;
  isPromptUnlocked: (prompt: PromptItem) => boolean;

  // Authentication
  currentUser: User | null;
  userProfile: UserProfile | null;
  isUserAdmin: boolean;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: 'signin' | 'signup' | 'forgot';
  setAuthModalMode: (mode: 'signin' | 'signup' | 'forgot') => void;
  logout: () => Promise<void>;

  // Firebase Init Helper for Admin
  initializeFirebaseDefaults: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

// Helper to sanitize any payload before writing to Firebase RTDB (prevents "undefined property" crashes)
export function sanitizeForFirebase<T>(val: T): T {
  if (val === undefined) {
    return '' as unknown as T;
  }
  if (val === null || typeof val !== 'object') {
    return val;
  }
  if (Array.isArray(val)) {
    return val
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirebase(item)) as unknown as T;
  }
  const cleanObj: Record<string, any> = {};
  for (const [k, v] of Object.entries(val as Record<string, any>)) {
    if (v === undefined) {
      cleanObj[k] = '';
    } else if (v !== null && typeof v === 'object') {
      cleanObj[k] = sanitizeForFirebase(v);
    } else {
      cleanObj[k] = v;
    }
  }
  return cleanObj as T;
}

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // All prompts & categories loaded strictly from Firebase Realtime Database
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // App MUST always open first in Viewer mode
  const [workspaceMode, setWorkspaceModeState] = useState<WorkspaceMode>('viewer');

  // Admin section
  const [adminSection, setAdminSection] = useState<AdminSection>('dashboard');
  const [selectedPromptForEdit, setSelectedPromptForEdit] = useState<PromptItem | null>(null);
  const [activePromptDetail, setActivePromptDetail] = useState<PromptItem | null>(null);

  // Favorites (In-memory, synced to RTDB promptManager/users/${uid}/favorites)
  const [favoritePromptIds, setFavoritePromptIds] = useState<string[]>([]);

  // Reward Ad Configuration (Strictly from Firebase Realtime Database)
  const [adConfig, setAdConfig] = useState<RewardAdConfig>(DEFAULT_AD_CONFIG);
  const [activeRewardPrompt, setActiveRewardPrompt] = useState<PromptItem | null>(null);

  // Unlocked prompt IDs (via reward ads - session in-memory only)
  const [unlockedPromptIds, setUnlockedPromptIds] = useState<string[]>([]);

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Strict Admin Check: Email 'mail.sajjadahmed@gmail.com' or fixed UID
  const isUserAdmin = Boolean(currentUser && isAdminUser(currentUser));

  // If user is not admin, guarantee workspaceMode is locked to 'viewer'
  useEffect(() => {
    if (!isUserAdmin && workspaceMode !== 'viewer') {
      setWorkspaceModeState('viewer');
    }
  }, [isUserAdmin, workspaceMode]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // Sync favorites from RTDB
        const onFavs = (snapshot: any) => {
          const data = snapshot.val();
          if (data && Array.isArray(data)) {
            setFavoritePromptIds(data);
          }
        };
        try {
          onValue(ref(rtdb, `PROMPT_MANAGER/users/${user.uid}/favorites`), onFavs);
          onValue(ref(rtdb, `promptManager/users/${user.uid}/favorites`), onFavs, () => {});
        } catch (err) {
          console.debug('Favorites sync note:', err);
        }
      } else {
        setFavoritePromptIds([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Firebase Realtime Database Listener for Prompts
  useEffect(() => {
    setIsLoadingData(true);
    const onPrompts = (snapshot: any) => {
      const data = snapshot.val();
      if (data && typeof data === 'object') {
        setPrompts(Object.values(data) as PromptItem[]);
        setIsLoadingData(false);
      }
    };

    const unsubLegacy = onValue(ref(rtdb, 'PROMPT_MANAGER/prompts_public'), onPrompts);
    const unsubLegacy2 = onValue(ref(rtdb, 'PROMPT_MANAGER/prompts'), onPrompts);
    let unsubPrimary: (() => void) | undefined;
    try {
      unsubPrimary = onValue(ref(rtdb, 'promptManager/prompts'), onPrompts, () => {});
    } catch (e) {}

    return () => {
      unsubLegacy();
      unsubLegacy2();
      if (unsubPrimary) unsubPrimary();
    };
  }, []);

  // Firebase Realtime Database Listener for Categories
  useEffect(() => {
    const onCategories = (snapshot: any) => {
      const data = snapshot.val();
      if (data && typeof data === 'object') {
        setCategories(Object.values(data) as PromptCategory[]);
      }
    };

    const unsubLegacy = onValue(ref(rtdb, 'PROMPT_MANAGER/categories'), onCategories);
    let unsubPrimary: (() => void) | undefined;
    try {
      unsubPrimary = onValue(ref(rtdb, 'promptManager/categories'), onCategories, () => {});
    } catch (e) {}

    return () => {
      unsubLegacy();
      if (unsubPrimary) unsubPrimary();
    };
  }, []);

  // Firebase Realtime Database Listener for Ad Settings
  useEffect(() => {
    const onAdData = (snapshot: any) => {
      const data = snapshot.val();
      if (data && typeof data === 'object') {
        setAdConfig((prev) => ({ ...prev, ...data }));
      }
    };

    const unsubAd = onValue(ref(rtdb, 'PROMPT_MANAGER/adSettings'), onAdData);
    const unsubReward = onValue(ref(rtdb, 'PROMPT_MANAGER/settings/rewardAd'), onAdData);
    let unsubPrimary: (() => void) | undefined;
    try {
      unsubPrimary = onValue(ref(rtdb, 'promptManager/adSettings'), onAdData, () => {});
    } catch (e) {}

    return () => {
      unsubAd();
      unsubReward();
      if (unsubPrimary) unsubPrimary();
    };
  }, []);

  // Mode switcher
  const setWorkspaceMode = (mode: WorkspaceMode) => {
    if (!isUserAdmin && mode !== 'viewer') {
      showToast('Admin Panel is restricted to authorized administrator.', 'error');
      setWorkspaceModeState('viewer');
      return;
    }
    setWorkspaceModeState(mode);
  };

  // Add Prompt directly to Firebase Realtime Database
  const addPrompt = async (promptData: Omit<PromptItem, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'copies'>): Promise<PromptItem> => {
    if (!navigator.onLine) {
      showToast('Connection unavailable. Firebase Cloud Save required.', 'error');
      throw new Error('Connection unavailable. Firebase Cloud Save required.');
    }

    const newId = 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const newPrompt: PromptItem = {
      ...promptData,
      id: newId,
      recommendedModel: promptData.recommendedModel || '',
      negativePrompt: promptData.negativePrompt || '',
      description: promptData.description || '',
      thumbnail: promptData.thumbnail || '',
      views: 0,
      copies: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const sanitized = sanitizeForFirebase(newPrompt);

    let saved = false;
    const targets = [
      `PROMPT_MANAGER/prompts_public/${newId}`,
      `PROMPT_MANAGER/prompts/${newId}`,
      `promptManager/prompts/${newId}`,
    ];
    for (const t of targets) {
      try {
        await set(ref(rtdb, t), sanitized);
        saved = true;
      } catch (err: any) {
        console.debug(`Notice on ${t}:`, err?.message);
      }
    }

    if (saved) {
      setPrompts((prev) => [newPrompt, ...prev.filter((p) => p.id !== newId)]);
      showToast('Settings saved successfully to Firebase Cloud!', 'success');
      return newPrompt;
    } else {
      showToast('Firebase Save Failed! Please check your connection.', 'error');
      throw new Error('Firebase Save Failed! Please check your connection.');
    }
  };

  // Update Prompt directly in Firebase Realtime Database
  const updatePrompt = async (id: string, updates: Partial<PromptItem>) => {
    if (!navigator.onLine) {
      showToast('Connection unavailable. Firebase Cloud Save required.', 'error');
      return;
    }

    const current = prompts.find((p) => p.id === id);
    if (!current) return;
    const updated: PromptItem = {
      ...current,
      ...updates,
      recommendedModel: updates.recommendedModel !== undefined ? (updates.recommendedModel || '') : (current.recommendedModel || ''),
      negativePrompt: updates.negativePrompt !== undefined ? (updates.negativePrompt || '') : (current.negativePrompt || ''),
      description: updates.description !== undefined ? (updates.description || '') : (current.description || ''),
      thumbnail: updates.thumbnail !== undefined ? (updates.thumbnail || '') : (current.thumbnail || ''),
      updatedAt: Date.now(),
    };
    const sanitized = sanitizeForFirebase(updated);

    let saved = false;
    const targets = [
      `PROMPT_MANAGER/prompts_public/${id}`,
      `PROMPT_MANAGER/prompts/${id}`,
      `promptManager/prompts/${id}`,
    ];
    for (const t of targets) {
      try {
        await set(ref(rtdb, t), sanitized);
        saved = true;
      } catch (err: any) {
        console.debug(`Notice on ${t}:`, err?.message);
      }
    }

    if (saved) {
      setPrompts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast('Settings saved successfully to Firebase Cloud!', 'success');
    } else {
      showToast('Firebase Save Failed! Please check your connection.', 'error');
    }
  };

  // Delete Prompt from Firebase Realtime Database
  const deletePrompt = async (id: string) => {
    if (!navigator.onLine) {
      showToast('Connection unavailable. Firebase Cloud Save required.', 'error');
      return;
    }

    const targets = [
      `PROMPT_MANAGER/prompts_public/${id}`,
      `PROMPT_MANAGER/prompts/${id}`,
      `promptManager/prompts/${id}`,
    ];
    let deleted = false;
    for (const t of targets) {
      try {
        await set(ref(rtdb, t), null);
        deleted = true;
      } catch (err: any) {
        console.debug(`Notice on ${t}:`, err?.message);
      }
    }

    if (deleted) {
      setPrompts((prev) => prev.filter((p) => p.id !== id));
      showToast('Settings saved successfully to Firebase Cloud!', 'success');
    } else {
      showToast('Firebase Save Failed! Please check your connection.', 'error');
    }
  };

  // Toggle Publish in Firebase Realtime Database
  const togglePublish = async (id: string) => {
    if (!navigator.onLine) {
      showToast('Connection unavailable. Firebase Cloud Save required.', 'error');
      return;
    }

    const p = prompts.find((x) => x.id === id);
    if (!p) return;
    const next = !p.published;

    const targets = [
      `PROMPT_MANAGER/prompts_public/${id}`,
      `PROMPT_MANAGER/prompts/${id}`,
      `promptManager/prompts/${id}`,
    ];
    let updated = false;
    for (const t of targets) {
      try {
        await rtdbUpdate(ref(rtdb, t), { published: next, updatedAt: Date.now() });
        updated = true;
      } catch (err: any) {
        console.debug(`Notice on ${t}:`, err?.message);
      }
    }

    if (updated) {
      setPrompts((prev) => prev.map((item) => (item.id === id ? { ...item, published: next } : item)));
      showToast('Settings saved successfully to Firebase Cloud!', 'success');
    } else {
      showToast('Firebase Save Failed! Please check your connection.', 'error');
    }
  };

  // Increment Stat in Firebase Realtime Database
  const incrementStat = (id: string, field: 'views' | 'copies') => {
    const p = prompts.find((x) => x.id === id);
    if (!p) return;
    const nextVal = (p[field] || 0) + 1;
    const now = Date.now();
    const isRecent = p.lastViewedAt && now - p.lastViewedAt < 86400000;
    const nextRecentViews = field === 'views' ? (isRecent ? (p.recentViews24h || 0) + 1 : 1) : (p.recentViews24h || 0);

    setPrompts((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: nextVal,
              recentViews24h: nextRecentViews,
              lastViewedAt: field === 'views' ? now : item.lastViewedAt,
            }
          : item
      )
    );
    try {
      const updates: Record<string, any> = { [field]: nextVal };
      if (field === 'views') {
        updates['recentViews24h'] = nextRecentViews;
        updates['lastViewedAt'] = now;
      }
      rtdbUpdate(ref(rtdb, `PROMPT_MANAGER/prompts_public/${id}`), sanitizeForFirebase(updates)).catch(() => {});
      rtdbUpdate(ref(rtdb, `PROMPT_MANAGER/prompts/${id}`), sanitizeForFirebase(updates)).catch(() => {});
      rtdbUpdate(ref(rtdb, `promptManager/prompts/${id}`), sanitizeForFirebase(updates)).catch(() => {});
    } catch (e) {}
  };

  // Category CRUD
  const addCategory = async (categoryData: Omit<PromptCategory, 'id'>): Promise<PromptCategory> => {
    if (!navigator.onLine) {
      showToast('Connection unavailable. Firebase Cloud Save required.', 'error');
      throw new Error('Connection unavailable. Firebase Cloud Save required.');
    }

    const id = 'cat_' + Date.now().toString(36);
    const newCat: PromptCategory = {
      ...categoryData,
      id,
    };
    const sanitized = sanitizeForFirebase(newCat);

    let saved = false;
    const targets = [
      `PROMPT_MANAGER/categories/${id}`,
      `promptManager/categories/${id}`,
    ];
    for (const t of targets) {
      try {
        await set(ref(rtdb, t), sanitized);
        saved = true;
      } catch (err: any) {
        console.debug(`Notice on ${t}:`, err?.message);
      }
    }

    if (saved) {
      setCategories((prev) => [...prev, newCat]);
      showToast('Settings saved successfully to Firebase Cloud!', 'success');
      return newCat;
    } else {
      showToast('Firebase Save Failed! Please check your connection.', 'error');
      throw new Error('Firebase Save Failed! Please check your connection.');
    }
  };

  const updateCategory = async (id: string, updates: Partial<PromptCategory>) => {
    if (!navigator.onLine) {
      showToast('Connection unavailable. Firebase Cloud Save required.', 'error');
      return;
    }

    const c = categories.find((item) => item.id === id);
    if (!c) return;
    const updated = { ...c, ...updates };
    const sanitized = sanitizeForFirebase(updated);

    let saved = false;
    const targets = [
      `PROMPT_MANAGER/categories/${id}`,
      `promptManager/categories/${id}`,
    ];
    for (const t of targets) {
      try {
        await set(ref(rtdb, t), sanitized);
        saved = true;
      } catch (err: any) {
        console.debug(`Notice on ${t}:`, err?.message);
      }
    }

    if (saved) {
      setCategories((prev) => prev.map((item) => (item.id === id ? updated : item)));
      showToast('Settings saved successfully to Firebase Cloud!', 'success');
    } else {
      showToast('Firebase Save Failed! Please check your connection.', 'error');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!navigator.onLine) {
      showToast('Connection unavailable. Firebase Cloud Save required.', 'error');
      return;
    }

    const targets = [
      `PROMPT_MANAGER/categories/${id}`,
      `promptManager/categories/${id}`,
    ];
    let deleted = false;
    for (const t of targets) {
      try {
        await set(ref(rtdb, t), null);
        deleted = true;
      } catch (err: any) {
        console.debug(`Notice on ${t}:`, err?.message);
      }
    }

    if (deleted) {
      setCategories((prev) => prev.filter((item) => item.id !== id));
      showToast('Settings saved successfully to Firebase Cloud!', 'success');
    } else {
      showToast('Firebase Save Failed! Please check your connection.', 'error');
    }
  };

  // Favorites (In-memory + Firebase sync if authenticated, NO local storage)
  const toggleFavorite = (promptId: string) => {
    setFavoritePromptIds((prev) => {
      const exists = prev.includes(promptId);
      const updated = exists ? prev.filter((id) => id !== promptId) : [...prev, promptId];
      if (exists) {
        showToast('Removed from favorites', 'info');
      } else {
        showToast('Saved to your favorites ⭐', 'success');
      }
      if (currentUser) {
        set(ref(rtdb, `PROMPT_MANAGER/users/${currentUser.uid}/favorites`), updated).catch(() => {});
        set(ref(rtdb, `promptManager/users/${currentUser.uid}/favorites`), updated).catch(() => {});
      }
      return updated;
    });
  };

  const isFavorite = (promptId: string): boolean => {
    return favoritePromptIds.includes(promptId);
  };

  // Ad Settings (Saves to both PROMPT_MANAGER and promptManager)
  const updateAdConfig = async (updates: Partial<RewardAdConfig>, silent = false) => {
    if (!isUserAdmin) {
      if (!silent) {
        showToast('Please sign in as mail.sajjadahmed@gmail.com to save Ad Settings.', 'error');
        setAuthModalOpen(true);
      }
      return;
    }

    if (!navigator.onLine) {
      if (!silent) {
        showToast('Connection unavailable. Firebase Cloud Save required.', 'error');
      }
      return;
    }

    const updated = { ...adConfig, ...updates };
    const sanitized = sanitizeForFirebase(updated);

    let savedToCloud = false;
    const targets = [
      'PROMPT_MANAGER/adSettings',
      'PROMPT_MANAGER/rewardAds',
      'PROMPT_MANAGER/settings/rewardAd',
      'promptManager/adSettings',
      'promptManager/rewardAds',
    ];

    for (const target of targets) {
      try {
        await set(ref(rtdb, target), sanitized);
        savedToCloud = true;
      } catch (err: any) {
        console.debug(`Notice on target ${target}:`, err?.message);
      }
    }

    if (savedToCloud) {
      setAdConfig(updated);
      if (!silent) {
        showToast('Ad settings saved successfully to Firebase Cloud!', 'success');
      }
    } else {
      if (!silent) {
        showToast('Firebase Save Failed! Please check your connection.', 'error');
      }
    }
  };

  const unlockPrompt = (promptId: string) => {
    if (!unlockedPromptIds.includes(promptId)) {
      setUnlockedPromptIds((prev) => [...prev, promptId]);
    }
  };

  const isPromptUnlocked = (prompt: PromptItem): boolean => {
    if (prompt.accessType !== 'Reward Locked') return true;
    if (isUserAdmin) return true;
    return unlockedPromptIds.includes(prompt.id);
  };

  // Logout
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setWorkspaceModeState('viewer');
      showToast('Signed out successfully.', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  // Helper for admin to populate Firebase if RTDB is currently empty
  const initializeFirebaseDefaults = async () => {
    if (!isUserAdmin) {
      showToast('Only administrator can populate database.', 'error');
      return;
    }
    if (!navigator.onLine) {
      showToast('Connection unavailable. Firebase Cloud Save required.', 'error');
      return;
    }
    try {
      const updates: Record<string, any> = {};
      INITIAL_CATEGORIES.forEach((c) => {
        updates[`PROMPT_MANAGER/categories/${c.id}`] = c;
        updates[`promptManager/categories/${c.id}`] = c;
      });
      INITIAL_PROMPTS.forEach((p) => {
        updates[`PROMPT_MANAGER/prompts_public/${p.id}`] = p;
        updates[`PROMPT_MANAGER/prompts/${p.id}`] = p;
        updates[`promptManager/prompts/${p.id}`] = p;
      });
      updates[`PROMPT_MANAGER/adSettings`] = DEFAULT_AD_CONFIG;
      updates[`PROMPT_MANAGER/rewardAds`] = DEFAULT_AD_CONFIG;
      updates[`promptManager/adSettings`] = DEFAULT_AD_CONFIG;
      updates[`promptManager/rewardAds`] = DEFAULT_AD_CONFIG;

      await rtdbUpdate(ref(rtdb), updates);
      showToast('Settings saved successfully to Firebase Cloud!', 'success');
    } catch (err: any) {
      console.error('Initialization error:', err);
      showToast('Firebase Save Failed! Please check your connection.', 'error');
    }
  };

  const userProfile: UserProfile | null = currentUser
    ? {
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || currentUser.email?.split('@')[0],
        isAdmin: isAdminUser(currentUser),
      }
    : null;

  return (
    <WorkspaceContext.Provider
      value={{
        prompts,
        categories,
        isLoadingData,
        workspaceMode,
        setWorkspaceMode,
        adminSection,
        setAdminSection,
        selectedPromptForEdit,
        setSelectedPromptForEdit,
        activePromptDetail,
        setActivePromptDetail,
        toasts,
        showToast,
        removeToast,
        addPrompt,
        updatePrompt,
        deletePrompt,
        togglePublish,
        incrementStat,
        addCategory,
        updateCategory,
        deleteCategory,
        favoritePromptIds,
        toggleFavorite,
        isFavorite,
        adConfig,
        updateAdConfig,
        activeRewardPrompt,
        setActiveRewardPrompt,
        unlockedPromptIds,
        unlockPrompt,
        isPromptUnlocked,
        currentUser,
        userProfile,
        isUserAdmin,
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        logout,
        initializeFirebaseDefaults,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
