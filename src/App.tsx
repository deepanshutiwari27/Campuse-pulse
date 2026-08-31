import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { StudentView } from './components/student/StudentView';
import { CounselorDashboard } from './components/counselor/CounselorDashboard';
import { PeerSupportView } from './components/student/PeerSupportView';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { CrisisSafetyModal } from './components/student/CrisisSafetyModal';
import { AuthModal } from './components/AuthModal';
import { CheckIn, StudentCounselorProfile, StudentFollowUpStatus, UserProfile, UserRole } from './types';
import { DataService, SupabaseAuth, subscribeToDataChanges } from './lib/supabase';

const rolePaths: Record<UserRole, string> = { student: '/student', counsellor: '/counsellor', peer_supporter: '/peer-support', admin: '/admin' };
const goTo = (path: string) => { if (window.location.pathname !== path) window.history.replaceState({}, '', path); };

const AdminPage = ({ profileCount }: { profileCount: number }) => <section className="max-w-3xl mx-auto bg-white border border-slate-200 shadow-sm p-6 sm:p-8"><p className="text-xs uppercase tracking-widest font-mono text-indigo-700">Administrator workspace</p><h1 className="mt-2 text-2xl font-bold text-slate-900">Campus wellbeing administration</h1><p className="mt-3 text-slate-600">This restricted area is reserved for institutional account and access management.</p><div className="mt-6 border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{profileCount} student profiles are available to the authorized care team.</div></section>;

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [studentProfiles, setStudentProfiles] = useState<StudentCounselorProfile[]>([]);
  const [authReady, setAuthReady] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const refreshData = async () => setStudentProfiles(await DataService.getStudentProfiles());

  useEffect(() => {
    refreshData();
    const unsubscribe = subscribeToDataChanges(refreshData);
    SupabaseAuth.getAuthenticatedUser().then(setCurrentUser).catch(() => setCurrentUser(null)).finally(() => setAuthReady(true));
    return unsubscribe;
  }, []);

  const handleSignOut = async () => { await SupabaseAuth.signOut(); setCurrentUser(null); goTo('/login'); };
  const handleSubmitCheckin = async (data: Omit<CheckIn, 'id' | 'createdAt'>) => { await DataService.submitCheckIn(data); };
  const handleUpdateStatus = async (studentId: string, status: StudentFollowUpStatus) => { await DataService.updateStudentStatus(studentId, status); };
  const handleFlagSuspicious = async (studentId: string, isSuspicious: boolean, reason?: string) => { await DataService.flagSuspiciousStudent(studentId, isSuspicious, reason); };
  const handleAddNote = async (studentId: string, noteText: string, actionTaken: string, riskRating: 'critical' | 'moderate' | 'low') => { await DataService.addCounselorNote(studentId, noteText, actionTaken, riskRating); };
  const handleAssignPeer = async (studentId: string, peerName: string) => { await DataService.assignPeerSupporter(studentId, peerName); };
  const handleScheduleMeeting = async (studentId: string, slotId: string, notes?: string) => { await DataService.scheduleAppointment(studentId, slotId, notes); };

  if (!authReady) return <div className="min-h-screen bg-slate-950" />;
  if (!currentUser) {
    goTo('/login');
    return <AuthModal isOpen onClose={() => undefined} currentUserId={undefined} onSuccess={(user) => { setCurrentUser(user); goTo(rolePaths[user.role]); }} />;
  }

  const expectedPath = rolePaths[currentUser.role];
  if (window.location.pathname !== expectedPath) goTo(expectedPath);
  const currentStudentProfile = studentProfiles.find((student) => student.id === currentUser.id) || studentProfiles[0];

  return <div className="app-shell min-h-screen text-[#1e293b] flex flex-col antialiased">
    <Navbar currentUser={currentUser} onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)} onOpenCrisisModal={() => setIsCrisisModalOpen(true)} onSignOut={handleSignOut} />
    <main className="app-main flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-12">
      {currentUser.role === 'student' && currentStudentProfile && <StudentView studentProfile={currentStudentProfile} currentUser={currentUser} onSubmitCheckin={handleSubmitCheckin} onNavigateToPeerSupport={() => undefined} />}
      {currentUser.role === 'counsellor' && <CounselorDashboard studentProfiles={studentProfiles} onUpdateStatus={handleUpdateStatus} onAddNote={handleAddNote} onAssignPeer={handleAssignPeer} onScheduleMeeting={handleScheduleMeeting} onFlagSuspicious={handleFlagSuspicious} />}
      {currentUser.role === 'peer_supporter' && <PeerSupportView />}
      {currentUser.role === 'admin' && <AdminPage profileCount={studentProfiles.length} />}
    </main>
    <SupabaseConfigModal isOpen={isSupabaseModalOpen} onClose={() => setIsSupabaseModalOpen(false)} />
    <CrisisSafetyModal isOpen={isCrisisModalOpen} onClose={() => setIsCrisisModalOpen(false)} />
  </div>;
}
