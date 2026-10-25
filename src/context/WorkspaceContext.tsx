import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PromptItem, PromptCategory, WorkspaceMode, AdminSection, RewardAdConfig, UserProfile } from '../types';
import { INITIAL_PROMPTS, INITIAL_CATEGORIES, DEFAULT_AD_CONFIG } from '../data/seedData';
import { auth, rtdb, FIXED_ADMIN_EMAIL, isAdminUser } from '../services/firebase';
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
  
  // Favorites
  favoritePromptIds: string[];
  toggleFavorite: (promptId: string) => void;
  isFavorite: (promptId: string) => boolean;

  // Reward Ad & Unlocks
  adConfig: RewardAdConfig;
  updateAdConfig: (updates: Partial<RewardAdConfig>) => Promise<void>;
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

const STORAGE_FAVORITES_KEY = 'prompt_manager_favorites_v4';
const STORAGE_UNLOCKS_KEY = 'prompt_manager_unlocks_v4';
const STORAGE_AD_CONFIG_KEY = 'prompt_manager_ad_config_v4';

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
  // All prompts & categories loaded strictly from Firebase Realtime Database (no hardcoded seed default)
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // App MUST always open first in Viewer mode ("fast open viwer mode thakbe")
  const [workspaceMode, setWorkspaceModeState] = useState<WorkspaceMode>('viewer');

  // Admin section
  const [adminSection, setAdminSection] = useState<AdminSection>('dashboard');
  const [selectedPromptForEdit, setSelectedPromptForEdit] = useState<PromptItem | null>(null);
  const [activePromptDetail, setActivePromptDetail] = useState<PromptItem | null>(null);

  // Favorites
  const [favoritePromptIds, setFavoritePromptIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FAVORITES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Reward Ad Configuration (with local persistence fallback)
  const [adConfig, setAdConfig] = useState<RewardAdConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AD_CONFIG_KEY);
      if (saved) return { ...DEFAULT_AD_CONFIG, ...JSON.parse(saved) };
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_AD_CONFIG;
  });
  const [activeRewardPrompt, setActiveRewardPrompt] = useState<PromptItem | null>(null);

  // Unlocked prompt IDs (via reward ads)
  const [unlockedPromptIds, setUnlockedPromptIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_UNLOCKS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Strict Admin Check: ONLY fixed email 'mail.sajjadahmed@gmail.com' is admin
  const isUserAdmin = Boolean(currentUser && isAdminUser(currentUser));

  // If user is not admin, guarantee workspaceMode is locked to 'viewer'
  useEffect(() => {
    if (!isUserAdmin && workspaceMode !== 'viewer') {
      setWorkspaceModeState('viewer');
    }
  }, [isUserAdmin, workspaceMode]);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user favorites from RTDB
        try {
          const favRef = ref(rtdb, `PROMPT_MANAGER/users/${user.uid}/favorites`);
          onValue(favRef, (snapshot) => {
            const data = snapshot.val();
            if (data && Array.isArray(data)) {
              setFavoritePromptIds(data);
            }
          });
        } catch (err) {
          console.debug('Favorites sync note:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Firebase Realtime Database Listener for Prompts
  useEffect(() => {
    setIsLoadingData(true);
    const promptsRef = ref(rtdb, 'PROMPT_MANAGER/prompts_public');
    const unsubscribe = onValue(
      promptsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data && typeof data === 'object') {
          const list = Object.values(data) as PromptItem[];
          setPrompts(list);
        } else {
          setPrompts([]);
        }
        setIsLoadingData(false);
      },
      (error) => {
        console.error('Firebase prompts error:', error);
        setIsLoadingData(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Firebase Realtime Database Listener for Categories
  useEffect(() => {
    const catsRef = ref(rtdb, 'PROMPT_MANAGER/categories');
    const unsubscribe = onValue(
      catsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data && typeof data === 'object') {
          const list = Object.values(data) as PromptCategory[];
          setCategories(list);
        } else {
          setCategories([]);
        }
      },
      (error) => {
        console.error('Firebase categories error:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Firebase Realtime Database Listener for Ad Settings
  useEffect(() => {
    const settingsRef = ref(rtdb, 'PROMPT_MANAGER/settings/rewardAd');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data === 'object') {
        setAdConfig((prev) => ({ ...prev, ...data }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Persist favorites & unlocks locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(favoritePromptIds));
      if (currentUser) {
        set(ref(rtdb, `PROMPT_MANAGER/users/${currentUser.uid}/favorites`), favoritePromptIds).catch(() => {});
      }
    } catch (e) {}
  }, [favoritePromptIds, currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_UNLOCKS_KEY, JSON.stringify(unlockedPromptIds));
    } catch (e) {}
  }, [unlockedPromptIds]);

  const setWorkspaceMode = (mode: WorkspaceMode) => {
    if (!isUserAdmin && mode !== 'viewer') {
      showToast('Admin Panel is restricted to authorized administrator.', 'error');
      setWorkspaceModeState('viewer');
      return;
    }
    setWorkspaceModeState(mode);
  };

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

  // Add Prompt directly to Firebase Realtime Database
  const addPrompt = async (promptData: Omit<PromptItem, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'copies'>): Promise<PromptItem> => {
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

    // Keep UI responsive immediately
    setPrompts((prev) => [newPrompt, ...prev.filter((p) => p.id !== newId)]);

    try {
      await set(ref(rtdb, `PROMPT_MANAGER/prompts_public/${newId}`), sanitized);
      showToast(`Prompt "${newPrompt.title}" saved to Firebase!`, 'success');
    } catch (err: any) {
      console.warn('Firebase addPrompt notice:', err);
      const isPermDenied = err?.message && (err.message.includes('PERMISSION_DENIED') || err.message.includes('Permission denied'));
      if (isPermDenied) {
        showToast('Prompt created locally. Sign in with mail.sajjadahmed@gmail.com for Firebase cloud sync.', 'info');
      } else {
        showToast(`Firebase write note: ${err.message}`, 'error');
      }
    }
    return newPrompt;
  };

  // Update Prompt directly in Firebase Realtime Database
  const updatePrompt = async (id: string, updates: Partial<PromptItem>) => {
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

    // Update in-memory state immediately so UI always updates cleanly
    setPrompts((prev) => prev.map((p) => (p.id === id ? updated : p)));

    try {
      await set(ref(rtdb, `PROMPT_MANAGER/prompts_public/${id}`), sanitized);
      showToast('Prompt updated in Firebase!', 'success');
    } catch (err: any) {
      console.warn('Firebase updatePrompt notice:', err);
      const isPermDenied = err?.message && (err.message.includes('PERMISSION_DENIED') || err.message.includes('Permission denied'));
      if (isPermDenied) {
        showToast('Prompt updated locally. Sign in with mail.sajjadahmed@gmail.com for Firebase cloud sync.', 'info');
      } else {
        showToast(`Firebase update note: ${err.message}`, 'error');
      }
    }
  };

  // Delete Prompt from Firebase Realtime Database
  const deletePrompt = async (id: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    try {
      await set(ref(rtdb, `PROMPT_MANAGER/prompts_public/${id}`), null);
      showToast('Prompt deleted from Firebase.', 'info');
    } catch (err: any) {
      console.warn('Firebase deletePrompt notice:', err);
      const isPermDenied = err?.message && (err.message.includes('PERMISSION_DENIED') || err.message.includes('Permission denied'));
      if (isPermDenied) {
        showToast('Prompt removed locally. Sign in with mail.sajjadahmed@gmail.com for cloud sync.', 'info');
      } else {
        showToast(`Delete note: ${err.message}`, 'error');
      }
    }
  };

  // Toggle Publish in Firebase Realtime Database
  const togglePublish = async (id: string) => {
    const p = prompts.find((x) => x.id === id);
    if (!p) return;
    const next = !p.published;
    setPrompts((prev) => prev.map((item) => (item.id === id ? { ...item, published: next } : item)));
    try {
      await rtdbUpdate(ref(rtdb, `PROMPT_MANAGER/prompts_public/${id}`), {
        published: next,
        updatedAt: Date.now(),
      });
      showToast(next ? 'Prompt published to Viewer.' : 'Prompt unpublished (draft).', 'info');
    } catch (err: any) {
      console.warn('Firebase togglePublish notice:', err);
      const isPermDenied = err?.message && (err.message.includes('PERMISSION_DENIED') || err.message.includes('Permission denied'));
      if (isPermDenied) {
        showToast('Status updated locally. Sign in with mail.sajjadahmed@gmail.com for cloud sync.', 'info');
      } else {
        showToast(`Publish update note: ${err.message}`, 'error');
      }
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
    } catch (e) {}
  };

  // Category CRUD
  const addCategory = async (categoryData: Omit<PromptCategory, 'id'>): Promise<PromptCategory> => {
    const id = 'cat_' + Date.now().toString(36);
    const newCat: PromptCategory = {
      ...categoryData,
      id,
    };
    const sanitized = sanitizeForFirebase(newCat);
    setCategories((prev) => [...prev, newCat]);
    try {
      await set(ref(rtdb, `PROMPT_MANAGER/categories/${id}`), sanitized);
      showToast(`Category "${newCat.name}" saved to Firebase!`, 'success');
    } catch (err: any) {
      console.warn('Firebase addCategory notice:', err);
      const isPermDenied = err?.message && (err.message.includes('PERMISSION_DENIED') || err.message.includes('Permission denied'));
      if (isPermDenied) {
        showToast('Category created locally. Sign in with mail.sajjadahmed@gmail.com for cloud sync.', 'info');
      } else {
        showToast(`Category save note: ${err.message}`, 'error');
      }
    }
    return newCat;
  };

  const updateCategory = async (id: string, updates: Partial<PromptCategory>) => {
    const c = categories.find((item) => item.id === id);
    if (!c) return;
    const updated = { ...c, ...updates };
    const sanitized = sanitizeForFirebase(updated);
    setCategories((prev) => prev.map((item) => (item.id === id ? updated : item)));
    try {
      await set(ref(rtdb, `PROMPT_MANAGER/categories/${id}`), sanitized);
      showToast('Category updated in Firebase.', 'success');
    } catch (err: any) {
      console.warn('Firebase updateCategory notice:', err);
      const isPermDenied = err?.message && (err.message.includes('PERMISSION_DENIED') || err.message.includes('Permission denied'));
      if (isPermDenied) {
        showToast('Category updated locally. Sign in with mail.sajjadahmed@gmail.com for cloud sync.', 'info');
      } else {
        showToast(`Category update note: ${err.message}`, 'error');
      }
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((item) => item.id !== id));
    try {
      await set(ref(rtdb, `PROMPT_MANAGER/categories/${id}`), null);
      showToast('Category deleted from Firebase.', 'info');
    } catch (err: any) {
      console.warn('Firebase deleteCategory notice:', err);
      const isPermDenied = err?.message && (err.message.includes('PERMISSION_DENIED') || err.message.includes('Permission denied'));
      if (isPermDenied) {
        showToast('Category deleted locally. Sign in with mail.sajjadahmed@gmail.com for cloud sync.', 'info');
      } else {
        showToast(`Category delete note: ${err.message}`, 'error');
      }
    }
  };

  // Favorites
  const toggleFavorite = (promptId: string) => {
    setFavoritePromptIds((prev) => {
      const exists = prev.includes(promptId);
      if (exists) {
        showToast('Removed from favorites', 'info');
        return prev.filter((id) => id !== promptId);
      } else {
        showToast('Saved to your favorites ⭐', 'success');
        return [...prev, promptId];
      }
    });
  };

  const isFavorite = (promptId: string): boolean => {
    return favoritePromptIds.includes(promptId);
  };

  // Ad Settings
  const updateAdConfig = async (updates: Partial<RewardAdConfig>) => {
    const updated = { ...adConfig, ...updates };
    setAdConfig(updated);
    try {
      localStorage.setItem(STORAGE_AD_CONFIG_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage adConfig error:', e);
    }

    const sanitized = sanitizeForFirebase(updated);
    try {
      await set(ref(rtdb, 'PROMPT_MANAGER/settings/rewardAd'), sanitized);
      showToast('Ad network settings saved to Firebase!', 'success');
    } catch (err: any) {
      console.warn('Firebase updateAdConfig notice:', err);
      const isPermDenied = err?.message && (err.message.includes('PERMISSION_DENIED') || err.message.includes('Permission denied'));
      if (isPermDenied) {
        if (!isUserAdmin) {
          showToast('Ad settings saved locally in browser! Sign in with mail.sajjadahmed@gmail.com for Firebase cloud sync.', 'info');
        } else {
          showToast('Ad settings saved locally in browser! (Firebase RTDB rules restricted direct cloud write).', 'info');
        }
      } else {
        showToast(`Ad settings saved locally (${err?.message || 'offline'})`, 'info');
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
    try {
      const updates: Record<string, any> = {};
      INITIAL_CATEGORIES.forEach((c) => {
        updates[`PROMPT_MANAGER/categories/${c.id}`] = c;
      });
      INITIAL_PROMPTS.forEach((p) => {
        updates[`PROMPT_MANAGER/prompts_public/${p.id}`] = p;
      });
      updates[`PROMPT_MANAGER/settings/rewardAd`] = DEFAULT_AD_CONFIG;
      await rtdbUpdate(ref(rtdb), updates);
      showToast('Successfully initialized database in Firebase Realtime Database!', 'success');
    } catch (err: any) {
      showToast(`Initialization failed: ${err.message}`, 'error');
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
