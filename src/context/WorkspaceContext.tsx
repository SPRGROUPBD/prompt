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
  workspaceMode: WorkspaceMode;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  adminSection: AdminSection;
  setAdminSection: (section: AdminSection) => void;
  selectedPromptForEdit: PromptItem | null;
  setSelectedPromptForEdit: (prompt: PromptItem | null) => void;
  activePromptDetail: PromptItem | null;
  setActivePromptDetail: (prompt: PromptItem | null) => void;
  adminAccessOpen: boolean;
  setAdminAccessOpen: (open: boolean) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  
  // Prompt CRUD
  addPrompt: (promptData: Omit<PromptItem, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'copies'>) => PromptItem;
  updatePrompt: (id: string, updates: Partial<PromptItem>) => void;
  deletePrompt: (id: string) => void;
  togglePublish: (id: string) => void;
  incrementStat: (id: string, field: 'views' | 'copies') => void;
  
  // Category CRUD
  addCategory: (categoryData: Omit<PromptCategory, 'id'>) => PromptCategory;
  updateCategory: (id: string, updates: Partial<PromptCategory>) => void;
  deleteCategory: (id: string) => void;
  
  // Favorites
  favoritePromptIds: string[];
  toggleFavorite: (promptId: string) => void;
  isFavorite: (promptId: string) => boolean;

  // Reward Ad & Unlocks
  adConfig: RewardAdConfig;
  updateAdConfig: (updates: Partial<RewardAdConfig>) => void;
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

  // Storage & Export
  resetToSeedData: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonStr: string) => boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

const STORAGE_PROMPTS_KEY = 'prompt_manager_prompts_v3';
const STORAGE_CATS_KEY = 'prompt_manager_categories_v3';
const STORAGE_MODE_KEY = 'prompt_manager_workspace_mode_v3';
const STORAGE_ADMIN_OPEN_KEY = 'prompt_manager_admin_open_v3';
const STORAGE_FAVORITES_KEY = 'prompt_manager_favorites_v3';
const STORAGE_UNLOCKS_KEY = 'prompt_manager_unlocks_v3';
const STORAGE_AD_CONFIG_KEY = 'prompt_manager_ad_config_v3';

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Prompts state
  const [prompts, setPrompts] = useState<PromptItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROMPTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved prompts', e);
    }
    return INITIAL_PROMPTS;
  });

  // Categories state
  const [categories, setCategories] = useState<PromptCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CATS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved categories', e);
    }
    return INITIAL_CATEGORIES;
  });

  // Workspace Mode (Viewer, Admin, or Split)
  const [workspaceMode, setWorkspaceModeState] = useState<WorkspaceMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MODE_KEY) as WorkspaceMode;
      if (saved && ['viewer', 'admin', 'split'].includes(saved)) return saved;
    } catch (e) {
      console.error(e);
    }
    return 'viewer';
  });

  // Admin section
  const [adminSection, setAdminSection] = useState<AdminSection>('dashboard');
  const [selectedPromptForEdit, setSelectedPromptForEdit] = useState<PromptItem | null>(null);
  const [activePromptDetail, setActivePromptDetail] = useState<PromptItem | null>(null);

  // Admin Access Open for users
  const [adminAccessOpen, setAdminAccessOpenState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ADMIN_OPEN_KEY);
      if (saved !== null) return saved === 'true';
    } catch (e) {
      console.error(e);
    }
    return true;
  });

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

  // Reward Ad Configuration
  const [adConfig, setAdConfig] = useState<RewardAdConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AD_CONFIG_KEY);
      if (saved) return { ...DEFAULT_AD_CONFIG, ...JSON.parse(saved) };
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_AD_CONFIG;
  });

  // Active prompt for reward ad
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

  // Listen to Firebase Auth state
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        if (user) {
          // Sync favorites from Firebase RTDB if available
          try {
            const favRef = ref(rtdb, `PROMPT_MANAGER/users/${user.uid}/favorites`);
            onValue(favRef, (snapshot) => {
              const data = snapshot.val();
              if (data && Array.isArray(data)) {
                setFavoritePromptIds(data);
              }
            });
          } catch (err) {
            console.debug('RTDB favorites sync skipped', err);
          }
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase auth listener init notice', e);
    }
  }, []);

  // Sync prompts from Firebase RTDB on initial mount
  useEffect(() => {
    try {
      const promptsRef = ref(rtdb, 'PROMPT_MANAGER/prompts_public');
      const unsubscribe = onValue(promptsRef, (snapshot) => {
        const data = snapshot.val();
        if (data && typeof data === 'object') {
          const list = Object.values(data) as PromptItem[];
          if (list.length > 0) {
            setPrompts(list);
          }
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.debug('Firebase RTDB prompts sync fallback to local', err);
    }
  }, []);

  // Persist state to localStorage & Firebase
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROMPTS_KEY, JSON.stringify(prompts));
    } catch (e) {
      console.warn(e);
    }
  }, [prompts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CATS_KEY, JSON.stringify(categories));
    } catch (e) {
      console.warn(e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(favoritePromptIds));
      if (currentUser) {
        set(ref(rtdb, `PROMPT_MANAGER/users/${currentUser.uid}/favorites`), favoritePromptIds).catch(() => {});
      }
    } catch (e) {
      console.warn(e);
    }
  }, [favoritePromptIds, currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_UNLOCKS_KEY, JSON.stringify(unlockedPromptIds));
    } catch (e) {
      console.warn(e);
    }
  }, [unlockedPromptIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_AD_CONFIG_KEY, JSON.stringify(adConfig));
    } catch (e) {
      console.warn(e);
    }
  }, [adConfig]);

  const setWorkspaceMode = (mode: WorkspaceMode) => {
    setWorkspaceModeState(mode);
    try {
      localStorage.setItem(STORAGE_MODE_KEY, mode);
    } catch (e) {
      console.error(e);
    }
  };

  const setAdminAccessOpen = (open: boolean) => {
    setAdminAccessOpenState(open);
    try {
      localStorage.setItem(STORAGE_ADMIN_OPEN_KEY, String(open));
    } catch (e) {
      console.error(e);
    }
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

  // Add Prompt
  const addPrompt = (promptData: Omit<PromptItem, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'copies'>): PromptItem => {
    const newId = 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const newPrompt: PromptItem = {
      ...promptData,
      id: newId,
      views: 0,
      copies: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setPrompts((prev) => [newPrompt, ...prev]);
    // Save to Firebase RTDB
    try {
      set(ref(rtdb, `PROMPT_MANAGER/prompts_public/${newId}`), newPrompt).catch(() => {});
    } catch (e) {}

    showToast(`Prompt "${newPrompt.title}" created successfully!`, 'success');
    return newPrompt;
  };

  // Update Prompt
  const updatePrompt = (id: string, updates: Partial<PromptItem>) => {
    let updatedItem: PromptItem | null = null;
    setPrompts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updatedItem = {
            ...p,
            ...updates,
            updatedAt: Date.now(),
          };
          return updatedItem;
        }
        return p;
      })
    );
    if (updatedItem) {
      try {
        rtdbUpdate(ref(rtdb, `PROMPT_MANAGER/prompts_public/${id}`), updatedItem).catch(() => {});
      } catch (e) {}
    }
    showToast('Prompt updated successfully!', 'success');
  };

  // Delete Prompt
  const deletePrompt = (id: string) => {
    const target = prompts.find((p) => p.id === id);
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    try {
      set(ref(rtdb, `PROMPT_MANAGER/prompts_public/${id}`), null).catch(() => {});
    } catch (e) {}
    showToast(`Deleted prompt "${target?.title || id}".`, 'info');
  };

  // Toggle Publish
  const togglePublish = (id: string) => {
    setPrompts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const next = !p.published;
          showToast(next ? 'Prompt published to Viewer.' : 'Prompt unpublished (draft).', 'info');
          const updated = { ...p, published: next, updatedAt: Date.now() };
          try {
            rtdbUpdate(ref(rtdb, `PROMPT_MANAGER/prompts_public/${id}`), { published: next }).catch(() => {});
          } catch (e) {}
          return updated;
        }
        return p;
      })
    );
  };

  // Increment Stat
  const incrementStat = (id: string, field: 'views' | 'copies') => {
    setPrompts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newVal = (p[field] || 0) + 1;
          try {
            rtdbUpdate(ref(rtdb, `PROMPT_MANAGER/prompts_public/${id}`), { [field]: newVal }).catch(() => {});
          } catch (e) {}
          return { ...p, [field]: newVal };
        }
        return p;
      })
    );
  };

  // Add Category
  const addCategory = (categoryData: Omit<PromptCategory, 'id'>): PromptCategory => {
    const id = 'cat_' + Date.now().toString(36);
    const newCat: PromptCategory = {
      ...categoryData,
      id,
    };
    setCategories((prev) => [...prev, newCat]);
    try {
      set(ref(rtdb, `PROMPT_MANAGER/categories/${id}`), newCat).catch(() => {});
    } catch (e) {}
    showToast(`Category "${newCat.name}" added!`, 'success');
    return newCat;
  };

  // Update Category
  const updateCategory = (id: string, updates: Partial<PromptCategory>) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          try {
            rtdbUpdate(ref(rtdb, `PROMPT_MANAGER/categories/${id}`), updated).catch(() => {});
          } catch (e) {}
          return updated;
        }
        return c;
      })
    );
    showToast('Category updated.', 'success');
  };

  // Delete Category
  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      set(ref(rtdb, `PROMPT_MANAGER/categories/${id}`), null).catch(() => {});
    } catch (e) {}
    showToast('Category deleted.', 'info');
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

  // Unlocks & Reward ads
  const updateAdConfig = (updates: Partial<RewardAdConfig>) => {
    setAdConfig((prev) => ({ ...prev, ...updates }));
    showToast('Ad network configuration saved!', 'success');
  };

  const unlockPrompt = (promptId: string) => {
    if (!unlockedPromptIds.includes(promptId)) {
      setUnlockedPromptIds((prev) => [...prev, promptId]);
    }
  };

  const isUserAdmin = Boolean(
    adminAccessOpen || (currentUser && isAdminUser(currentUser))
  );

  const isPromptUnlocked = (prompt: PromptItem): boolean => {
    if (prompt.accessType !== 'Reward Locked') return true;
    if (isUserAdmin) return true;
    return unlockedPromptIds.includes(prompt.id);
  };

  // Logout
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      showToast('Signed out successfully.', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  // Reset to seed data
  const resetToSeedData = () => {
    setPrompts(INITIAL_PROMPTS);
    setCategories(INITIAL_CATEGORIES);
    setAdConfig(DEFAULT_AD_CONFIG);
    localStorage.removeItem(STORAGE_PROMPTS_KEY);
    localStorage.removeItem(STORAGE_CATS_KEY);
    localStorage.removeItem(STORAGE_AD_CONFIG_KEY);
    showToast('Reset library to default starter prompts & categories.', 'success');
  };

  // Export JSON
  const exportDatabaseJson = (): string => {
    const data = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      categories,
      prompts,
      adConfig,
    };
    return JSON.stringify(data, null, 2);
  };

  // Import JSON
  const importDatabaseJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.prompts) && Array.isArray(parsed.categories)) {
        setPrompts(parsed.prompts);
        setCategories(parsed.categories);
        if (parsed.adConfig) {
          setAdConfig(parsed.adConfig);
        }
        showToast(`Imported ${parsed.prompts.length} prompts & ${parsed.categories.length} categories!`, 'success');
        return true;
      }
      showToast('Invalid JSON structure. Needs "prompts" and "categories" arrays.', 'error');
      return false;
    } catch (e) {
      showToast('Failed to parse JSON file.', 'error');
      return false;
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
        workspaceMode,
        setWorkspaceMode,
        adminSection,
        setAdminSection,
        selectedPromptForEdit,
        setSelectedPromptForEdit,
        activePromptDetail,
        setActivePromptDetail,
        adminAccessOpen,
        setAdminAccessOpen,
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
        resetToSeedData,
        exportDatabaseJson,
        importDatabaseJson,
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
