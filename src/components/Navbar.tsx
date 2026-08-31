import React from 'react';
import { Activity, Database, LogOut, ShieldAlert } from 'lucide-react';
import { UserProfile } from '../types';
import { isSupabaseLive } from '../lib/supabase';

interface NavbarProps {
  currentUser: UserProfile;
  onOpenSupabaseModal: () => void;
  onOpenCrisisModal: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onOpenSupabaseModal, onOpenCrisisModal, onSignOut }) => {
  const isLive = isSupabaseLive();
  return <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_0_rgb(15_23_42/0.03)] backdrop-blur">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center space-x-3 shrink-0">
        <div className="h-9 w-9 rounded-lg bg-[#0f172a] border border-slate-800 flex items-center justify-center"><Activity className="h-4 w-4 text-indigo-400" /></div>
        <div><div className="text-lg font-bold tracking-tight text-slate-900 font-heading">CampusPulse</div><p className="text-[11px] text-slate-500 hidden sm:block">Signed in as {currentUser.name} · {currentUser.role.replace('_', ' ')}</p></div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button onClick={onOpenSupabaseModal} className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium border ${isLive ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-amber-50 border-amber-300 text-amber-900'}`}><Database className="h-3.5 w-3.5" />{isLive ? 'Supabase: Live' : 'Supabase: Sandbox'}</button>
        <button onClick={onOpenCrisisModal} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"><ShieldAlert className="h-3.5 w-3.5" /><span className="hidden sm:inline">Crisis Support</span></button>
        <button onClick={onSignOut} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"><LogOut className="h-3.5 w-3.5" /><span className="hidden sm:inline">Sign out</span></button>
      </div>
    </div>
  </header>;
};
