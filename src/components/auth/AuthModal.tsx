import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { auth, FIXED_ADMIN_EMAIL } from '../../services/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    showToast,
    setWorkspaceMode,
  } = useWorkspace();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!authModalOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setConfirmPassword('');
    setErrorMsg('');
  };

  const handleClose = () => {
    resetForm();
    setAuthModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (authModalMode === 'signin') {
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const signedEmail = userCred.user?.email?.toLowerCase().trim();
        const isAdmin = signedEmail === FIXED_ADMIN_EMAIL.toLowerCase();

        if (isAdmin) {
          showToast('Signed in as Administrator. Admin panel unlocked.', 'success');
        } else {
          showToast(`Welcome back, ${email.trim()}!`, 'success');
        }
        // Always maintain viewer view on login unless admin switches
        setWorkspaceMode('viewer');
        handleClose();
      } else if (authModalMode === 'signup') {
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match.');
          setLoading(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (displayName.trim() && userCred.user) {
          await updateProfile(userCred.user, { displayName: displayName.trim() });
        }
        showToast('Account created successfully! Welcome to PromptStudio.', 'success');
        setWorkspaceMode('viewer');
        handleClose();
      } else if (authModalMode === 'forgot') {
        if (!email.trim()) {
          setErrorMsg('Please enter your account email.');
          setLoading(false);
          return;
        }
        await sendPasswordResetEmail(auth, email.trim());
        showToast('Password reset link sent! Please check your inbox.', 'info');
        setAuthModalMode('signin');
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Authentication error';
      if (err.code === 'auth/invalid-email') msg = 'Invalid email address.';
      else if (err.code === 'auth/user-not-found') msg = 'No account found with this email.';
      else if (err.code === 'auth/wrong-password') msg = 'Incorrect password. Try again.';
      else if (err.code === 'auth/email-already-in-use') msg = 'An account already exists with this email.';
      else if (err.code === 'auth/weak-password') msg = 'Password should be at least 6 characters.';
      else if (err.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {authModalMode === 'signin' && 'Sign In'}
              {authModalMode === 'signup' && 'Create Account'}
              {authModalMode === 'forgot' && 'Reset Password'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        {authModalMode !== 'forgot' && (
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setAuthModalMode('signin');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authModalMode === 'signin'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setAuthModalMode('signup');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authModalMode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/40 text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authModalMode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Sajjad Ahmed"
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {authModalMode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                {authModalMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setAuthModalMode('forgot');
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          )}

          {authModalMode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-sm shadow-indigo-600/30"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>
                  {authModalMode === 'signin' && 'Sign In'}
                  {authModalMode === 'signup' && 'Create Account'}
                  {authModalMode === 'forgot' && 'Send Password Reset Link'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {authModalMode === 'forgot' && (
          <button
            type="button"
            onClick={() => {
              setErrorMsg('');
              setAuthModalMode('signin');
            }}
            className="text-xs text-center text-slate-400 hover:text-white"
          >
            ← Back to Sign In
          </button>
        )}
      </div>
    </div>
  );
};
