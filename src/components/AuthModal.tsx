import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Key, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Database,
  Chrome
} from 'lucide-react';
import { SupabaseAuth, isSupabaseLive } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  currentUserId?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUserId
}) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'quick'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isLive = isSupabaseLive();
  const allUsers = SupabaseAuth.getAllUsers();

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your campus email address.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    const result = await SupabaseAuth.signInWithPassword(email, password);
    setLoading(false);

    if (result.success && result.user) {
      setSuccessMsg(`Signed in as ${result.user.name} (${result.user.role})`);
      setTimeout(() => {
        onSuccess(result.user!);
        onClose();
      }, 500);
    } else {
      setErrorMsg(result.error || 'Unable to sign in. Please verify your email and password.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Email and password are required.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    const result = await SupabaseAuth.signUp(email, password, 'student', name);
    setLoading(false);

    if (result.success && result.user) {
      setSuccessMsg(`Account created for ${result.user.name}!`);
      setTimeout(() => {
        onSuccess(result.user!);
        onClose();
      }, 500);
    } else {
      setErrorMsg(result.error || 'Unable to create account with Supabase.');
    }
  };

  const handleQuickLogin = (user: UserProfile) => {
    SupabaseAuth.setCurrentUser(user.id);
    setSuccessMsg(`Switched to ${user.name} (${user.role.replace('_', ' ')})`);
    setTimeout(() => {
      onSuccess(user);
      onClose();
    }, 400);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    const result = await SupabaseAuth.signInWithGoogle();
    if (!result.success) {
      setLoading(false);
      setErrorMsg(result.error || 'Unable to start Google sign-in.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Geometric Balance Header */}
        <div className="bg-[#0f172a] text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <LogIn className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight font-heading">
                CampusPulse Supabase Authentication
              </h2>
              <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-300 mt-0.5">
                <span className={`inline-block h-1.5 w-1.5 ${isLive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span>{isLive ? 'Supabase Auth: LIVE' : 'Supabase Auth: Sandbox Mode (Keys Pending)'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white border border-transparent hover:border-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-mono font-semibold">
          <button
            type="button"
            onClick={() => { setTab('signin'); setErrorMsg(null); }}
            className={`flex-1 py-3 px-3 border-b-2 text-center transition-colors ${
              tab === 'signin'
                ? 'border-indigo-600 bg-white text-indigo-950 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setErrorMsg(null); }}
            className={`flex-1 py-3 px-3 border-b-2 text-center transition-colors ${
              tab === 'signup'
                ? 'border-indigo-600 bg-white text-indigo-950 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setTab('quick'); setErrorMsg(null); }}
            className={`flex-1 py-3 px-3 border-b-2 text-center transition-colors ${
              tab === 'quick'
                ? 'border-indigo-600 bg-white text-indigo-950 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            1-Click Personas
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Supabase Status Banner */}
          <div className="p-3 bg-slate-50 border border-slate-200 text-xs flex items-start space-x-2.5">
            <Database className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-slate-600 text-[11px] leading-relaxed">
              <strong className="text-slate-800">Supabase Integration Active: </strong>
              {isLive ? (
                <span>Connected to your live Supabase project database and user authentication.</span>
              ) : (
                <span>API keys are ready to be configured later. You can sign in, register accounts, or switch personas right now in full-fidelity sandbox mode.</span>
              )}
            </div>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {tab === 'signin' && (
            <div className="space-y-3.5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={!isLive || loading}
                title={!isLive ? 'Configure Supabase before enabling Google sign-in' : undefined}
                className="w-full py-2.5 bg-white hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 text-slate-800 font-semibold text-xs border border-slate-300 transition-colors flex items-center justify-center space-x-2"
              >
                <Chrome className="h-3.5 w-3.5 text-rose-600" />
                <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>

              {!isLive && (
                <p className="text-[10px] text-slate-500 text-center font-mono">
                  Available after Supabase project credentials are configured.
                </p>
              )}

              <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                <span>or email</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                  Campus Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. alex.rivera@campus.edu or counseling.thorne@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder={isLive ? 'Supabase account password' : 'Enter any password for sandbox demo'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#0f172a] hover:bg-indigo-700 text-white font-semibold text-xs border border-slate-800 transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Authenticating with Supabase...</span>
                ) : (
                  <>
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Sign In to CampusPulse</span>
                  </>
                )}
              </button>
              </form>
            </div>
          )}

          {/* TAB 2: SIGN UP */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes or Dr. Taylor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                  Campus Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jordan.hayes@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Create a password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                New registrations create student accounts. Privileged roles are assigned by a campus administrator.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#0f172a] hover:bg-indigo-700 text-white font-semibold text-xs border border-slate-800 transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Registering user with Supabase...</span>
                ) : (
                  <>
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Create Supabase Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: QUICK TEST PERSONAS */}
          {tab === 'quick' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 mb-2 font-mono">
                Instantly switch authentication sessions to test role-based access control and anomaly telemetry:
              </p>

              {allUsers.map((user) => {
                const isSelected = user.id === currentUserId;
                const isCounselor = user.role === 'counsellor';
                const isStudent = user.role === 'student';

                return (
                  <div
                    key={user.id}
                    onClick={() => handleQuickLogin(user)}
                    className={`p-3 border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40'
                        : 'border-slate-200 hover:border-slate-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-10 w-10 object-cover border border-slate-300 shrink-0"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900 font-heading">
                            {user.name}
                          </span>
                          <span className={`px-1.5 py-0.2 text-[9px] font-mono uppercase font-bold border ${
                            isCounselor 
                              ? 'bg-indigo-100 text-indigo-900 border-indigo-300' 
                              : isStudent 
                              ? 'bg-slate-100 text-slate-800 border-slate-300'
                              : 'bg-purple-100 text-purple-900 border-purple-300'
                          }`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-500">
                          {user.email} {user.anonymousId ? `• ${user.anonymousId}` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 flex items-center space-x-1 shrink-0"
                    >
                      <span>{isSelected ? 'Active' : 'Switch'}</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Row-Level Security (RLS) Enforced</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
