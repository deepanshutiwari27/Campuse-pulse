import React from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Database, 
  RefreshCw, 
  UserCheck, 
  GraduationCap, 
  Stethoscope, 
  HeartHandshake
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { isSupabaseLive } from '../lib/supabase';

interface NavbarProps {
  currentUser: UserProfile;
  onSwitchUser: (userId: string) => void;
  allUsers: UserProfile[];
  onOpenSupabaseModal: () => void;
  onOpenCrisisModal: () => void;
  onOpenAuthModal?: () => void;
  onResetData: () => void;
  activeViewRole: UserRole;
  onSwitchRoleTab: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  allUsers,
  onOpenSupabaseModal,
  onOpenCrisisModal,
  onOpenAuthModal,
  onResetData,
  activeViewRole,
  onSwitchRoleTab
}) => {
  const isLive = isSupabaseLive();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Product Philosophy */}
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-[#0f172a] border border-slate-800 flex items-center justify-center text-indigo-400 shadow-none shrink-0">
              <Activity className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-slate-900 font-heading">CampusPulse</span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-none text-[10px] font-semibold tracking-wide uppercase bg-slate-100 text-slate-700 border border-slate-300">
                  Anomaly Detection
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Detect → Understand → Support → Connect
              </p>
            </div>
          </div>

          {/* Role Navigation View Selector */}
          <nav className="flex items-center space-x-0 bg-slate-100 p-0.5 border border-slate-200 text-xs font-semibold">
            <button
              id="nav-role-student"
              onClick={() => {
                onSwitchRoleTab('student');
                const student = allUsers.find(u => u.role === 'student');
                if (student) onSwitchUser(student.id);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 border transition-all ${
                activeViewRole === 'student'
                  ? 'bg-white text-slate-900 border-slate-300 shadow-none font-bold'
                  : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
              <span>Student View</span>
            </button>

            <button
              id="nav-role-counselor"
              onClick={() => {
                onSwitchRoleTab('counsellor');
                const counselor = allUsers.find(u => u.role === 'counsellor');
                if (counselor) onSwitchUser(counselor.id);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 border transition-all ${
                activeViewRole === 'counsellor'
                  ? 'bg-white text-indigo-900 border-slate-300 shadow-none font-bold'
                  : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Stethoscope className="h-3.5 w-3.5 text-indigo-600" />
              <span className="flex items-center space-x-1.5">
                <span>Counselor Profile</span>
                <span className="h-1.5 w-1.5 bg-rose-600 inline-block" />
              </span>
            </button>

            <button
              id="nav-role-peer"
              onClick={() => {
                onSwitchRoleTab('peer_supporter');
                const peer = allUsers.find(u => u.role === 'peer_supporter');
                if (peer) onSwitchUser(peer.id);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 border transition-all hidden md:flex ${
                activeViewRole === 'peer_supporter'
                  ? 'bg-white text-purple-900 border-slate-300 shadow-none font-bold'
                  : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <HeartHandshake className="h-3.5 w-3.5 text-purple-600" />
              <span>Peer Support</span>
            </button>
          </nav>

          {/* Right utility items: Supabase Status & Crisis Button */}
          <div className="flex items-center space-x-2">
            
            {/* Supabase Status Pill */}
            <button
              id="btn-supabase-status"
              onClick={onOpenSupabaseModal}
              title="Click to view Supabase connection details and SQL schema"
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-mono font-medium border transition-colors ${
                isLive
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {isLive ? 'Supabase: Live' : 'Supabase: Sandbox'}
              </span>
              <span className="sm:hidden">
                {isLive ? 'Live DB' : 'Supabase'}
              </span>
              <span className={`h-1.5 w-1.5 ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </button>

            {/* Crisis Help Button */}
            <button
              id="btn-crisis-help"
              onClick={onOpenCrisisModal}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 transition-colors"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
              <span className="hidden sm:inline">Crisis Support</span>
            </button>

            {/* User Profile dropdown selector & Auth */}
            <div className="relative flex items-center space-x-2 pl-2 border-l border-slate-200">
              <select
                id="select-user-persona"
                value={currentUser.id}
                onChange={(e) => {
                  const selected = allUsers.find(u => u.id === e.target.value);
                  if (selected) {
                    onSwitchUser(selected.id);
                    onSwitchRoleTab(selected.role);
                  }
                }}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 font-medium cursor-pointer focus:ring-0 focus:border-slate-400 px-2 py-1 pr-6"
              >
                <option value="usr_student_alex">Alex (Student #104 - 48h Crash)</option>
                <option value="usr_student_priya">Priya (Student #447 - Suspicious 97)</option>
                <option value="usr_counselor_thorne">Dr. Thorne (Lead Counselor)</option>
                <option value="usr_peer_maya">Maya (Peer Supporter #12)</option>
              </select>

              {onOpenAuthModal && (
                <button
                  id="btn-open-auth-modal"
                  onClick={onOpenAuthModal}
                  title="Supabase Authentication (Sign In / Register / Switch)"
                  className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition-colors flex items-center space-x-1"
                >
                  <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Auth</span>
                </button>
              )}
            </div>

            {/* Reset Demo Data */}
            <button
              id="btn-reset-demo"
              onClick={onResetData}
              title="Reset sample logs & anomaly flags"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
