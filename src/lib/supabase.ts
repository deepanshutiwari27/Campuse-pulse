import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import {
  StudentCounselorProfile,
  StudentBehaviorLog,
  CheckIn,
  CounselorNote,
  UserProfile,
  PeerSupporter,
  CounselorAppointmentSlot,
  StudentFollowUpStatus,
  UserRole,
  ClassAttendanceRecord,
  AssignmentRecord
} from '../types';
import {
  INITIAL_STUDENT_PROFILES,
  INITIAL_USERS,
  INITIAL_PEER_SUPPORTERS,
  INITIAL_APPOINTMENT_SLOTS
} from '../data/mockData';
import { evaluateAcademicTelemetryAndMasking } from '../data/academicData';

// Check environment variables
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if valid credentials exist
export const isConfiguredCredentials = (url?: string, key?: string): boolean => {
  if (!url || !key) return false;
  if (url.includes('your-project') || key.includes('your-supabase-anon-key') || key.includes('MY_')) {
    return false;
  }
  return url.startsWith('http') && key.length > 20;
};

let activeSupabaseClient: SupabaseClient | null = null;

if (isConfiguredCredentials(envUrl, envKey)) {
  try {
    activeSupabaseClient = createClient(envUrl, envKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.warn('Failed to initialize live Supabase client, running in local sandbox mode:', err);
  }
}

export const getSupabaseClient = (): SupabaseClient | null => activeSupabaseClient;

export const isSupabaseLive = (): boolean => activeSupabaseClient !== null;

// Local storage keys for persistent sandbox mode
const STORAGE_KEYS = {
  CURRENT_USER: 'campuspulse_current_user_id',
  AUTH_SESSION: 'campuspulse_auth_session_v1',
  AUTH_USERS: 'campuspulse_auth_registered_users_v1',
  PROFILES: 'campuspulse_student_profiles_v3',
  LOGS: 'campuspulse_behavior_logs_v3',
  PEERS: 'campuspulse_peers_v2',
  SLOTS: 'campuspulse_slots_v2',
};

// Initialize sandbox local storage if empty
const initializeSandboxData = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, 'usr_student_alex');
  }
  // Store default users
  if (!localStorage.getItem(STORAGE_KEYS.AUTH_USERS)) {
    localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(INITIAL_USERS));
  }
  const cachedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
  if (!cachedProfiles) {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_STUDENT_PROFILES));
  } else {
    try {
      const parsed = JSON.parse(cachedProfiles);
      // Auto-upgrade if cached state lacks academic telemetry or survey masking demonstration
      if (!parsed[0]?.academicTelemetry || !parsed.some((p: StudentCounselorProfile) => p.anomalyCategory === 'masking_discrepancy')) {
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_STUDENT_PROFILES));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_STUDENT_PROFILES));
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.PEERS)) {
    localStorage.setItem(STORAGE_KEYS.PEERS, JSON.stringify(INITIAL_PEER_SUPPORTERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SLOTS)) {
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(INITIAL_APPOINTMENT_SLOTS));
  }
};

initializeSandboxData();

// Listener callbacks for state sync across components
type StateListener = () => void;
const listeners: Set<StateListener> = new Set();

export const subscribeToDataChanges = (callback: StateListener): (() => void) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

const notifyListeners = () => {
  listeners.forEach(fn => fn());
};

// ==============================================================================
// Supabase Authentication Service (Live or Sandbox Mock)
// ==============================================================================

export interface AuthState {
  user: UserProfile | null;
  sessionToken: string | null;
  isLiveSupabase: boolean;
}

export const SupabaseAuth = {
  // Get current active user profile
  getCurrentUser(): UserProfile {
    const rawUsers = localStorage.getItem(STORAGE_KEYS.AUTH_USERS);
    let users = INITIAL_USERS;
    if (rawUsers) {
      try {
        users = JSON.parse(rawUsers);
      } catch {
        users = INITIAL_USERS;
      }
    }
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'usr_student_alex';
    const found = users.find(u => u.id === currentId);
    return found || users[0];
  },

  // Set user persona directly
  setCurrentUser(userId: string): UserProfile {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
    notifyListeners();
    return this.getCurrentUser();
  },

  getAllUsers(): UserProfile[] {
    const rawUsers = localStorage.getItem(STORAGE_KEYS.AUTH_USERS);
    if (!rawUsers) return INITIAL_USERS;
    try {
      return JSON.parse(rawUsers);
    } catch {
      return INITIAL_USERS;
    }
  },

  // Supabase Sign In with email and password
  async signInWithPassword(email: string, password?: string): Promise<{ success: boolean; user: UserProfile | null; error?: string }> {
    if (activeSupabaseClient && password) {
      try {
        const { data, error } = await activeSupabaseClient.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          return { success: false, user: null, error: error.message };
        }
        if (data.user) {
          // Fetch or map profile from Supabase
          const { data: profile } = await activeSupabaseClient
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const mappedUser: UserProfile = {
            id: data.user.id,
            name: profile?.name || data.user.user_metadata?.name || email.split('@')[0],
            email: data.user.email || email,
            role: (profile?.role || data.user.user_metadata?.role || 'student') as UserRole,
            year: profile?.year || '1st Year',
            course: profile?.course || 'General Studies',
            avatar: profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            anonymousId: profile?.anonymous_id || `Student #${Math.floor(100 + Math.random() * 900)}`,
          };
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, mappedUser.id);
          notifyListeners();
          return { success: true, user: mappedUser };
        }
      } catch (err: unknown) {
        console.warn('Live Supabase Auth signIn error, falling back to local user store:', err);
      }
    }

    // Sandbox fallback: Match by email or demo account
    const users = this.getAllUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, found.id);
      notifyListeners();
      return { success: true, user: found };
    }

    // Auto-create test sandbox user if email not registered yet
    const newDemoUser: UserProfile = {
      id: 'usr_' + Date.now(),
      name: email.split('@')[0].replace(/[\._-]/g, ' '),
      email,
      role: email.includes('counselor') ? 'counsellor' : email.includes('peer') ? 'peer_supporter' : 'student',
      year: '1st Year',
      course: 'Undergraduate Studies',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      anonymousId: `Student #${Math.floor(100 + Math.random() * 900)}`,
    };
    const updatedUsers = [...users, newDemoUser];
    localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(updatedUsers));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, newDemoUser.id);
    notifyListeners();
    return { success: true, user: newDemoUser };
  },

  // Supabase Sign Up
  async signUp(email: string, password: string, role: UserRole = 'student', name: string = ''): Promise<{ success: boolean; user: UserProfile | null; error?: string }> {
    if (activeSupabaseClient) {
      try {
        const { data, error } = await activeSupabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || email.split('@')[0],
              role,
            }
          }
        });
        if (error) {
          return { success: false, user: null, error: error.message };
        }
        if (data.user) {
          const newUser: UserProfile = {
            id: data.user.id,
            name: name || email.split('@')[0],
            email,
            role,
            year: '1st Year',
            course: 'Computer Science',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            anonymousId: `Student #${Math.floor(100 + Math.random() * 900)}`,
          };
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, newUser.id);
          notifyListeners();
          return { success: true, user: newUser };
        }
      } catch (err: unknown) {
        console.warn('Live Supabase Auth signUp error:', err);
      }
    }

    // Sandbox Sign Up
    const users = this.getAllUsers();
    const newUser: UserProfile = {
      id: 'usr_' + Date.now(),
      name: name || email.split('@')[0].replace(/[\._-]/g, ' '),
      email,
      role,
      year: '1st Year',
      course: 'Academic Studies',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      anonymousId: `Student #${Math.floor(100 + Math.random() * 900)}`,
      peerSupportEnabled: role === 'peer_supporter',
    };
    const updatedUsers = [...users, newUser];
    localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(updatedUsers));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, newUser.id);
    notifyListeners();
    return { success: true, user: newUser };
  },

  // Supabase Sign Out
  async signOut(): Promise<void> {
    if (activeSupabaseClient) {
      try {
        await activeSupabaseClient.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
    // Default back to Alex Rivera
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, 'usr_student_alex');
    notifyListeners();
  }
};

// ==============================================================================
// Supabase Data Service (Storing and Retrieving Behavioral Logs & Profiles)
// ==============================================================================

export const DataService = {
  getCurrentUser(): UserProfile {
    return SupabaseAuth.getCurrentUser();
  },

  setCurrentUser(userId: string): UserProfile {
    return SupabaseAuth.setCurrentUser(userId);
  },

  getAllUsers(): UserProfile[] {
    return SupabaseAuth.getAllUsers();
  },

  // Retrieve Student Profiles with Anomalies
  async getStudentProfiles(): Promise<StudentCounselorProfile[]> {
    if (activeSupabaseClient) {
      try {
        const { data, error } = await activeSupabaseClient
          .from('student_behavior_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          // If table populated, can integrate
        }
      } catch (e) {
        console.warn('Supabase fetch error, fallback to local storage:', e);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_STUDENT_PROFILES));
      return INITIAL_STUDENT_PROFILES;
    }
    try {
      const parsed = JSON.parse(raw);
      // If cached version is older or missing Priya or missing academicTelemetry or missing Zoe's masking flag, refresh
      if (
        !parsed.some((p: StudentCounselorProfile) => p.id === 'usr_student_priya') ||
        !parsed[0]?.academicTelemetry ||
        !parsed.some((p: StudentCounselorProfile) => p.anomalyCategory === 'masking_discrepancy')
      ) {
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_STUDENT_PROFILES));
        return INITIAL_STUDENT_PROFILES;
      }
      return parsed;
    } catch {
      return INITIAL_STUDENT_PROFILES;
    }
  },

  // Retrieve all behavior logs (optionally filtered by studentId)
  async getBehaviorLogs(studentId?: string): Promise<StudentBehaviorLog[]> {
    const profiles = await this.getStudentProfiles();
    if (studentId) {
      const student = profiles.find(p => p.id === studentId);
      return student ? student.recentLogs : [];
    }
    return profiles.flatMap(p => p.recentLogs);
  },

  // Counselor flags or unflags a suspicious student
  async flagSuspiciousStudent(studentId: string, isSuspicious: boolean, reason?: string): Promise<void> {
    const profiles = await this.getStudentProfiles();
    const student = profiles.find(p => p.id === studentId);
    if (student) {
      student.isSuspicious = isSuspicious;
      if (reason) {
        student.suspiciousReason = reason;
      }
      if (isSuspicious) {
        student.flagsCount = Math.max(1, student.flagsCount + 1);
        student.status = 'needs_follow_up';
      }
      
      const newLog: StudentBehaviorLog = {
        id: 'log_suspicious_' + Date.now(),
        studentId: student.id,
        studentName: student.name,
        anonymousId: student.anonymousId,
        timestamp: 'Just now',
        eventType: 'counselor_alert',
        description: isSuspicious 
          ? `Counselor flagged student as SUSPICIOUS: ${reason || 'Heightened behavioral anomaly indicator'}`
          : 'Counselor cleared suspicious flag after clinical review.',
        anomalyDetected: isSuspicious,
        anomalyScore: student.anomalyScore,
        status: student.status,
      };
      student.recentLogs = [newLog, ...student.recentLogs];

      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      notifyListeners();

      if (activeSupabaseClient) {
        try {
          await activeSupabaseClient.from('student_behavior_logs').insert([{
            student_id: student.id,
            student_name: student.name,
            anonymous_id: student.anonymousId,
            event_type: 'counselor_alert',
            description: newLog.description,
            anomaly_detected: isSuspicious,
            anomaly_score: student.anomalyScore,
            status: student.status
          }]);
        } catch (e) {
          console.warn('Supabase sync error on flagSuspiciousStudent:', e);
        }
      }
    }
  },

  // Record a student self check-in
  async submitCheckIn(checkin: Omit<CheckIn, 'id' | 'createdAt'>): Promise<{
    checkin: CheckIn;
    baselineComparison: {
      moodDelta: number;
      sleepDelta: number;
      academicPressureDelta: number;
      socialDelta: number;
      hasAnomaly: boolean;
      insight: string;
    };
  }> {
    const profiles = await this.getStudentProfiles();
    const studentIndex = profiles.findIndex(p => p.id === checkin.userId);

    const newCheckin: CheckIn = {
      ...checkin,
      id: 'chk_' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    let insight = "Your reported wellbeing is balanced and consistent with your baseline.";
    let hasAnomaly = false;
    let moodDelta = 0;
    let sleepDelta = 0;
    let academicPressureDelta = 0;
    let socialDelta = 0;

    if (studentIndex >= 0) {
      const student = profiles[studentIndex];
      const b = student.baseline;

      moodDelta = Number((newCheckin.moodScore - b.avgMood).toFixed(1));
      sleepDelta = Number((newCheckin.sleepHours - b.avgSleep).toFixed(1));
      academicPressureDelta = Number((newCheckin.academicPressure - b.avgAcademicPressure).toFixed(1));
      socialDelta = Number((newCheckin.socialConnection - b.avgSocialConnection).toFixed(1));

      // Anomaly detection rules against personal baseline:
      if (sleepDelta <= -3 || academicPressureDelta >= 3.5 || newCheckin.overwhelm >= 8.5) {
        hasAnomaly = true;
        insight = `Your academic pressure has increased by ${Math.abs(academicPressureDelta)} pts while your sleep has dropped by ${Math.abs(sleepDelta)} hrs compared to your personal baseline. You are reporting feeling significantly overwhelmed.`;
      } else if (socialDelta <= -3.5) {
        hasAnomaly = true;
        insight = `You seem to be feeling less connected to others this week (${socialDelta} pts vs baseline). We have supportive campus peers ready to chat.`;
      } else if (newCheckin.moodScore <= 3) {
        hasAnomaly = true;
        insight = `You've indicated having a difficult day. Remember that early support is available without judgment.`;
      }

      student.currentCheckin = newCheckin;
      student.lastCheckinDate = 'Just now';

      // 1. Evaluate objective academic telemetry & survey masking discrepancy
      if (student.academicTelemetry) {
        const maskingEval = evaluateAcademicTelemetryAndMasking(newCheckin, student.academicTelemetry);
        student.academicTelemetry.isMaskingSuspected = maskingEval.isMaskingSuspected;
        student.academicTelemetry.maskingConfidence = maskingEval.maskingConfidence;
        student.academicTelemetry.maskingReason = maskingEval.maskingReason;
        student.academicTelemetry.objectiveAcademicRisk = maskingEval.objectiveAcademicRisk;

        if (maskingEval.isMaskingSuspected) {
          student.isSuspicious = true;
          student.anomalyCategory = 'masking_discrepancy';
          student.anomalyScore = Math.max(student.anomalyScore, maskingEval.computedAnomalyScore);
          student.suspiciousReason = maskingEval.maskingReason;
          student.riskLevel = 'critical';
          student.status = 'needs_follow_up';
          student.primaryAnomaly = 'Acute Telemetry Mismatch: Self-Reported Wellness vs Objective Academic Collapse';
          student.flagsCount += 1;

          const maskLog: StudentBehaviorLog = {
            id: 'log_mask_' + Date.now(),
            studentId: student.id,
            studentName: student.name,
            anonymousId: student.anonymousId,
            timestamp: 'Just now',
            eventType: 'masking_alert',
            description: `AUTOMATED DISCREPANCY FLAG: Student reported positive mood (${newCheckin.moodScore}/10) and low pressure (${newCheckin.academicPressure}/10), but university telemetry records ${student.academicTelemetry.attendanceRate.toFixed(0)}% attendance and ${student.academicTelemetry.missingAssignmentsCount} missing assignments.`,
            anomalyDetected: true,
            anomalyScore: student.anomalyScore,
            anomalyDetails: {
              severity: 'critical',
              category: 'masking_discrepancy',
              title: 'Survey Masking Discrepancy Alert',
              description: maskingEval.maskingReason || 'Objective data strongly contradicts self-reported wellness.',
              baselineDelta: `Att: ${student.academicTelemetry.attendanceRate.toFixed(0)}% | Overdue: ${student.academicTelemetry.missingAssignmentsCount} | Masking Conf: ${maskingEval.maskingConfidence}%`,
              timestamp: 'Just now',
            },
            status: 'needs_follow_up',
          };
          student.recentLogs = [maskLog, ...student.recentLogs];
        }
      }

      if (hasAnomaly) {
        student.anomalyScore = Math.min(99, Math.max(75, Math.round(student.anomalyScore + 10)));
        student.flagsCount += 1;
        student.riskLevel = student.anomalyScore >= 85 ? 'critical' : 'high';
        student.status = 'needs_follow_up';
        student.isSuspicious = true;
        student.suspiciousReason = student.suspiciousReason || `Personal baseline deviation: Sleep delta ${sleepDelta}h, Academic pressure delta ${academicPressureDelta}pts.`;

        const newLog: StudentBehaviorLog = {
          id: 'log_' + Date.now(),
          studentId: student.id,
          studentName: student.name,
          anonymousId: student.anonymousId,
          timestamp: 'Just now',
          eventType: 'checkin',
          description: `Self check-in anomaly detected: Sleep ${newCheckin.sleepHours}h (delta ${sleepDelta}h), Academic pressure ${newCheckin.academicPressure}/10.`,
          anomalyDetected: true,
          anomalyScore: student.anomalyScore,
          anomalyDetails: {
            severity: student.riskLevel,
            category: sleepDelta <= -3 ? 'sleep_crash' : 'overwhelm_spike',
            title: 'Significant Personal Baseline Deviation',
            description: insight,
            baselineDelta: `Sleep: ${sleepDelta > 0 ? '+' : ''}${sleepDelta}h | Pressure: ${academicPressureDelta > 0 ? '+' : ''}${academicPressureDelta}`,
            timestamp: 'Just now',
          },
          status: 'needs_follow_up',
        };
        student.recentLogs = [newLog, ...student.recentLogs];
      }

      profiles[studentIndex] = student;
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      notifyListeners();
    }

    if (activeSupabaseClient) {
      try {
        await activeSupabaseClient.from('checkins').insert([
          {
            user_id: newCheckin.userId,
            mood: newCheckin.mood,
            mood_score: newCheckin.moodScore,
            sleep_hours: newCheckin.sleepHours,
            sleep_quality: newCheckin.sleepQuality,
            academic_pressure: newCheckin.academicPressure,
            social_connection: newCheckin.socialConnection,
            energy: newCheckin.energy,
            overwhelm: newCheckin.overwhelm,
            primary_stressor: newCheckin.primaryStressor,
            notes: newCheckin.notes,
          }
        ]);
      } catch (err) {
        console.warn('Could not insert checkin into Supabase:', err);
      }
    }

    return {
      checkin: newCheckin,
      baselineComparison: {
        moodDelta,
        sleepDelta,
        academicPressureDelta,
        socialDelta,
        hasAnomaly,
        insight,
      }
    };
  },

  // Counselor adds note to student
  async addCounselorNote(studentId: string, noteText: string, actionTaken: string, riskRating: 'critical' | 'moderate' | 'low'): Promise<CounselorNote> {
    const profiles = await this.getStudentProfiles();
    const student = profiles.find(p => p.id === studentId);
    
    const newNote: CounselorNote = {
      id: 'note_' + Date.now(),
      studentId,
      counselorId: 'usr_counselor_thorne',
      counselorName: 'Dr. Aris Thorne',
      noteText,
      actionTaken,
      riskRating,
      createdAt: new Date().toISOString(),
    };

    if (student) {
      student.counselorNotes = [newNote, ...(student.counselorNotes || [])];
      student.status = 'reviewed';
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      notifyListeners();
    }

    if (activeSupabaseClient) {
      try {
        await activeSupabaseClient.from('counselor_notes').insert([
          {
            student_id: studentId,
            counselor_name: 'Dr. Aris Thorne',
            note_text: noteText,
            action_taken: actionTaken,
            risk_rating: riskRating
          }
        ]);
      } catch (err) {
        console.warn('Could not sync counselor note with Supabase:', err);
      }
    }

    return newNote;
  },

  // Update student status
  async updateStudentStatus(studentId: string, status: StudentFollowUpStatus): Promise<void> {
    const profiles = await this.getStudentProfiles();
    const student = profiles.find(p => p.id === studentId);
    if (student) {
      student.status = status;
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      notifyListeners();
    }
  },

  // Assign peer supporter
  async assignPeerSupporter(studentId: string, peerName: string): Promise<void> {
    const profiles = await this.getStudentProfiles();
    const student = profiles.find(p => p.id === studentId);
    if (student) {
      student.peerAssigned = peerName;
      student.status = 'peer_support_suggested';
      
      const newLog: StudentBehaviorLog = {
        id: 'log_peer_' + Date.now(),
        studentId,
        studentName: student.name,
        anonymousId: student.anonymousId,
        timestamp: 'Just now',
        eventType: 'peer_chat',
        description: `Counselor matched student with Peer Supporter: ${peerName} for workload & stress guidance.`,
        anomalyDetected: false,
        status: 'peer_support_suggested',
      };
      student.recentLogs = [newLog, ...student.recentLogs];

      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      notifyListeners();
    }
  },

  // Schedule counselor appointment
  async scheduleAppointment(studentId: string, slotId: string, notes?: string): Promise<void> {
    const profiles = await this.getStudentProfiles();
    const student = profiles.find(p => p.id === studentId);
    const slots = this.getAppointmentSlots();
    const slot = slots.find(s => s.id === slotId);

    if (slot) {
      slot.available = false;
      localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
    }

    if (student && slot) {
      student.meetingScheduled = `${slot.date} at ${slot.time} with ${slot.counselorName}`;
      student.status = 'contact_requested';

      const newLog: StudentBehaviorLog = {
        id: 'log_sched_' + Date.now(),
        studentId,
        studentName: student.name,
        anonymousId: student.anonymousId,
        timestamp: 'Just now',
        eventType: 'counselor_request',
        description: `Counseling appointment confirmed: ${slot.date} at ${slot.time} with ${slot.counselorName}. (${slot.roomOrVirtual})`,
        anomalyDetected: false,
        status: 'contact_requested',
      };
      student.recentLogs = [newLog, ...student.recentLogs];

      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      notifyListeners();
    }
  },

  getAppointmentSlots(): CounselorAppointmentSlot[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SLOTS);
    if (!raw) return INITIAL_APPOINTMENT_SLOTS;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_APPOINTMENT_SLOTS;
    }
  },

  getPeerSupporters(): PeerSupporter[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PEERS);
    if (!raw) return INITIAL_PEER_SUPPORTERS;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PEER_SUPPORTERS;
    }
  },

  // Reset sandbox back to default seed data
  resetDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_STUDENT_PROFILES));
    localStorage.setItem(STORAGE_KEYS.PEERS, JSON.stringify(INITIAL_PEER_SUPPORTERS));
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(INITIAL_APPOINTMENT_SLOTS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, 'usr_student_alex');
    notifyListeners();
  },

  // Objective Telemetry: Log a live class attendance scan
  async recordClassAttendance(
    studentId: string,
    record: Omit<ClassAttendanceRecord, 'id'>
  ): Promise<void> {
    const profiles = await this.getStudentProfiles();
    const student = profiles.find(p => p.id === studentId);
    if (!student || !student.academicTelemetry) return;

    const newAttendance: ClassAttendanceRecord = {
      ...record,
      id: 'cls_' + Date.now(),
    };

    const telemetry = student.academicTelemetry;
    telemetry.recentClasses = [newAttendance, ...(telemetry.recentClasses || [])];
    telemetry.totalClassesScheduled += 1;
    if (record.status === 'present') {
      telemetry.classesAttended += 1;
      telemetry.consecutiveClassesMissed = 0;
    } else if (record.status === 'absent') {
      telemetry.consecutiveClassesMissed += 1;
    } else if (record.status === 'late') {
      telemetry.classesAttended += 0.5;
      telemetry.consecutiveClassesMissed = 0;
    }

    telemetry.attendanceRate = Number(((telemetry.classesAttended / telemetry.totalClassesScheduled) * 100).toFixed(1));
    telemetry.attendanceTrend = telemetry.attendanceRate < 60 ? 'severely_dropped' : telemetry.attendanceRate < 80 ? 'declining' : 'stable';

    // Automated flagging if consecutive absences or critical attendance cliff detected
    if (telemetry.consecutiveClassesMissed >= 3 || telemetry.attendanceRate < 65) {
      telemetry.objectiveAcademicRisk = telemetry.consecutiveClassesMissed >= 4 || telemetry.attendanceRate < 50 ? 'critical' : 'high';
      student.isSuspicious = true;
      student.status = 'needs_follow_up';
      student.anomalyScore = Math.max(student.anomalyScore, telemetry.objectiveAcademicRisk === 'critical' ? 92 : 80);
      student.suspiciousReason = `Objective Attendance Anomaly: ${telemetry.consecutiveClassesMissed} consecutive lecture absences (${telemetry.attendanceRate}% overall attendance rate).`;

      const alertLog: StudentBehaviorLog = {
        id: 'log_att_' + Date.now(),
        studentId: student.id,
        studentName: student.name,
        anonymousId: student.anonymousId,
        timestamp: 'Just now',
        eventType: 'class_attendance',
        description: `ATTENDANCE ANOMALY: ${record.courseCode} absence flagged by ${record.verificationMethod || 'campus sensor'}. Missed streak: ${telemetry.consecutiveClassesMissed}.`,
        anomalyDetected: true,
        anomalyScore: student.anomalyScore,
        anomalyDetails: {
          severity: telemetry.objectiveAcademicRisk,
          category: 'attendance_cliff',
          title: 'Consecutive Attendance Drop',
          description: `${student.name} missed ${telemetry.consecutiveClassesMissed} consecutive scheduled sessions in ${record.courseName}.`,
          baselineDelta: `Attendance: ${telemetry.attendanceRate}% | Streak: ${telemetry.consecutiveClassesMissed} missed`,
          timestamp: 'Just now',
        },
        status: 'needs_follow_up'
      };
      student.recentLogs = [alertLog, ...student.recentLogs];
    }

    // Re-evaluate survey masking discrepancy against current check-in
    if (student.currentCheckin) {
      const maskingCheck = evaluateAcademicTelemetryAndMasking(student.currentCheckin, telemetry);
      if (maskingCheck.isMaskingSuspected) {
        telemetry.isMaskingSuspected = true;
        telemetry.maskingConfidence = maskingCheck.maskingConfidence;
        telemetry.maskingReason = maskingCheck.maskingReason;
        student.anomalyCategory = 'masking_discrepancy';
        student.isSuspicious = true;
        student.anomalyScore = Math.max(student.anomalyScore, maskingCheck.computedAnomalyScore);
        student.suspiciousReason = maskingCheck.maskingReason;
        student.primaryAnomaly = 'Acute Telemetry Mismatch: Self-Reported Wellness vs Objective Academic Disengagement';
      }
    }

    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    notifyListeners();
  },

  // Objective Telemetry: Log LMS assignment submission or missed deadline
  async recordAssignmentSubmission(
    studentId: string,
    record: Omit<AssignmentRecord, 'id'>
  ): Promise<void> {
    const profiles = await this.getStudentProfiles();
    const student = profiles.find(p => p.id === studentId);
    if (!student || !student.academicTelemetry) return;

    const newAssignment: AssignmentRecord = {
      ...record,
      id: 'asg_' + Date.now(),
    };

    const telemetry = student.academicTelemetry;
    telemetry.recentAssignments = [newAssignment, ...(telemetry.recentAssignments || [])];
    telemetry.totalAssignmentsDue += 1;

    if (record.status === 'submitted_on_time') {
      telemetry.assignmentsSubmitted += 1;
    } else if (record.status === 'submitted_late') {
      telemetry.assignmentsSubmitted += 1;
      telemetry.lateSubmissionsCount += 1;
    } else if (record.status === 'overdue_missing') {
      telemetry.missingAssignmentsCount += 1;
    }

    telemetry.assignmentCompletionRate = Number(((telemetry.assignmentsSubmitted / telemetry.totalAssignmentsDue) * 100).toFixed(1));
    
    // Automated flagging if coursework deadlines are missed repeatedly
    if (telemetry.missingAssignmentsCount >= 2) {
      telemetry.objectiveAcademicRisk = telemetry.missingAssignmentsCount >= 3 ? 'critical' : 'high';
      student.isSuspicious = true;
      student.status = 'needs_follow_up';
      student.anomalyScore = Math.max(student.anomalyScore, telemetry.objectiveAcademicRisk === 'critical' ? 90 : 78);
      student.suspiciousReason = `Objective LMS Telemetry: ${telemetry.missingAssignmentsCount} overdue unsubmitted assignments in LMS portal.`;

      const alertLog: StudentBehaviorLog = {
        id: 'log_asg_' + Date.now(),
        studentId: student.id,
        studentName: student.name,
        anonymousId: student.anonymousId,
        timestamp: 'Just now',
        eventType: 'assignment_submission',
        description: `LMS DEADLINE MISSED: ${record.title} (${record.courseCode}) flagged as overdue unsubmitted. Total missing: ${telemetry.missingAssignmentsCount}.`,
        anomalyDetected: true,
        anomalyScore: student.anomalyScore,
        anomalyDetails: {
          severity: telemetry.objectiveAcademicRisk,
          category: 'academic_disengagement',
          title: 'Multiple Overdue Coursework Deadlines',
          description: `Student missed deadline for ${record.courseCode}.`,
          baselineDelta: `Missing: ${telemetry.missingAssignmentsCount} | Submission Rate: ${telemetry.assignmentCompletionRate}%`,
          timestamp: 'Just now',
        },
        status: 'needs_follow_up'
      };
      student.recentLogs = [alertLog, ...student.recentLogs];
    }

    // Re-evaluate survey masking discrepancy against current check-in
    if (student.currentCheckin) {
      const maskingCheck = evaluateAcademicTelemetryAndMasking(student.currentCheckin, telemetry);
      if (maskingCheck.isMaskingSuspected) {
        telemetry.isMaskingSuspected = true;
        telemetry.maskingConfidence = maskingCheck.maskingConfidence;
        telemetry.maskingReason = maskingCheck.maskingReason;
        student.anomalyCategory = 'masking_discrepancy';
        student.isSuspicious = true;
        student.anomalyScore = Math.max(student.anomalyScore, maskingCheck.computedAnomalyScore);
        student.suspiciousReason = maskingCheck.maskingReason;
        student.primaryAnomaly = 'Acute Telemetry Mismatch: Self-Reported Wellness vs Objective Academic Disengagement';
      }
    }

    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    notifyListeners();
  }
};
