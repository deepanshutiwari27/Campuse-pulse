import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StudentView } from './components/student/StudentView';
import { CounselorDashboard } from './components/counselor/CounselorDashboard';
import { PeerSupportView } from './components/student/PeerSupportView';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { CrisisSafetyModal } from './components/student/CrisisSafetyModal';
import { AuthModal } from './components/AuthModal';
import { 
  UserProfile, 
  UserRole, 
  StudentCounselorProfile, 
  CheckIn, 
  StudentFollowUpStatus 
} from './types';
import { DataService, subscribeToDataChanges } from './lib/supabase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DataService.getCurrentUser());
  const [activeViewRole, setActiveViewRole] = useState<UserRole>('counsellor'); // Counselor default as requested to highlight anomalies and suspicious students
  const [studentProfiles, setStudentProfiles] = useState<StudentCounselorProfile[]>([]);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Load data
  const refreshData = async () => {
    const profiles = await DataService.getStudentProfiles();
    setStudentProfiles(profiles);
    setCurrentUser(DataService.getCurrentUser());
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = subscribeToDataChanges(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, []);

  // Handle persona switch
  const handleSwitchUser = (userId: string) => {
    const updated = DataService.setCurrentUser(userId);
    setCurrentUser(updated);
    setActiveViewRole(updated.role);
  };

  // Submit Check-in
  const handleSubmitCheckin = async (checkinData: Omit<CheckIn, 'id' | 'createdAt'>) => {
    await DataService.submitCheckIn(checkinData);
  };

  // Counselor actions
  const handleUpdateStatus = async (studentId: string, status: StudentFollowUpStatus) => {
    await DataService.updateStudentStatus(studentId, status);
  };

  const handleFlagSuspicious = async (studentId: string, isSuspicious: boolean, reason?: string) => {
    await DataService.flagSuspiciousStudent(studentId, isSuspicious, reason);
  };

  const handleAddNote = async (
    studentId: string, 
    noteText: string, 
    actionTaken: string, 
    riskRating: 'critical' | 'moderate' | 'low'
  ) => {
    await DataService.addCounselorNote(studentId, noteText, actionTaken, riskRating);
  };

  const handleAssignPeer = async (studentId: string, peerName: string) => {
    await DataService.assignPeerSupporter(studentId, peerName);
  };

  const handleScheduleMeeting = async (studentId: string, slotId: string, notes?: string) => {
    await DataService.scheduleAppointment(studentId, slotId, notes);
  };

  const handleResetData = () => {
    if (window.confirm('Reset sample student logs and anomaly flags back to default?')) {
      DataService.resetDemoData();
      setActiveViewRole('counsellor');
    }
  };

  // Find active student profile (defaults to Alex Rivera or first student)
  const currentStudentProfile = 
    studentProfiles.find(s => s.id === currentUser.id) || 
    studentProfiles[0];

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#1e293b] flex flex-col antialiased selection:bg-indigo-600 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        allUsers={DataService.getAllUsers()}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenCrisisModal={() => setIsCrisisModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onResetData={handleResetData}
        activeViewRole={activeViewRole}
        onSwitchRoleTab={(role) => setActiveViewRole(role)}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        
        {/* STUDENT VIEW */}
        {activeViewRole === 'student' && currentStudentProfile && (
          <StudentView
            studentProfile={currentStudentProfile}
            currentUser={currentUser}
            onSubmitCheckin={handleSubmitCheckin}
            onNavigateToPeerSupport={() => setActiveViewRole('peer_supporter')}
          />
        )}

        {/* COUNSELOR PROFILE & DASHBOARD */}
        {activeViewRole === 'counsellor' && (
          <CounselorDashboard
            studentProfiles={studentProfiles}
            onUpdateStatus={handleUpdateStatus}
            onAddNote={handleAddNote}
            onAssignPeer={handleAssignPeer}
            onScheduleMeeting={handleScheduleMeeting}
            onFlagSuspicious={handleFlagSuspicious}
          />
        )}

        {/* PEER SUPPORT VIEW */}
        {activeViewRole === 'peer_supporter' && (
          <PeerSupportView />
        )}

      </main>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setActiveViewRole(user.role);
        }}
        currentUserId={currentUser.id}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      <CrisisSafetyModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900 tracking-tight">CampusPulse</span>
            <span className="text-slate-300">•</span>
            <span>Early Student Wellbeing &amp; Behavioral Anomaly Detection</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="hover:text-indigo-600 transition-colors font-medium border-b border-transparent hover:border-indigo-600"
            >
              Supabase SQL Schema &amp; API Setup
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setIsCrisisModalOpen(true)}
              className="hover:text-rose-600 transition-colors font-medium border-b border-transparent hover:border-rose-600"
            >
              Crisis Emergency Hotlines
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
