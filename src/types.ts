/**
 * CampusPulse — Data Types & Interface Definitions
 */

export type UserRole = 'student' | 'counsellor' | 'peer_supporter' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  year?: string;
  course?: string;
  avatar?: string;
  peerSupportEnabled?: boolean;
  anonymousId?: string;
  title?: string;
  department?: string;
  googleId?: string;
  isGoogleAccount?: boolean;
}

export interface AdminCredential {
  email: string;
  password: string;
  name: string;
  role: 'counsellor' | 'admin';
  title: string;
  department: string;
}

export interface GoogleStudentAccount {
  id: string;
  name: string;
  email: string;
  year: string;
  course: string;
  anonymousId: string;
  avatar: string;
  scenarioTag: string;
}

export type MoodType = 'great' | 'good' | 'okay' | 'low' | 'very_low';

export interface CheckIn {
  id: string;
  userId: string;
  mood: MoodType;
  moodScore: number; // 1 - 10
  sleepHours: number;
  sleepQuality: number; // 1 - 10
  academicPressure: number; // 1 - 10
  socialConnection: number; // 1 - 10
  energy: number; // 1 - 10
  overwhelm: number; // 1 - 10
  primaryStressor: string;
  notes?: string;
  createdAt: string; // ISO date
}

export interface PersonalBaseline {
  studentId: string;
  baselinePeriod: string; // e.g. "Weeks 1 - 2"
  avgMood: number;
  avgSleep: number;
  avgAcademicPressure: number;
  avgSocialConnection: number;
  avgEnergy: number;
  avgOverwhelm: number;
  totalCheckinsCount: number;
  lastCalculated: string;
}

export type AnomalySeverity = 'critical' | 'high' | 'moderate' | 'low';

export type AnomalyCategory = 
  | 'sleep_crash' 
  | 'overwhelm_spike' 
  | 'social_withdrawal' 
  | 'academic_distress' 
  | 'nocturnal_inversion' 
  | 'dining_inactivity'
  | 'facility_inactivity'
  | 'missed_milestones'
  | 'sentiment_plummet'
  | 'attendance_cliff'
  | 'academic_disengagement'
  | 'masking_discrepancy';

export interface AnomalyFlag {
  severity: AnomalySeverity;
  category: AnomalyCategory;
  title: string;
  description: string;
  baselineDelta: string;
  timestamp: string;
}

export type StudentFollowUpStatus = 
  | 'needs_follow_up' 
  | 'peer_support_suggested' 
  | 'contact_requested' 
  | 'reviewed' 
  | 'stable';

export type BehaviorEventType = 
  | 'checkin' 
  | 'lms_activity' 
  | 'class_attendance'
  | 'assignment_submission'
  | 'dining_swipe' 
  | 'library_swipe' 
  | 'facility_swipe'
  | 'counselor_request' 
  | 'counselor_alert'
  | 'masking_alert'
  | 'peer_chat';

// Class Attendance Record
export interface ClassAttendanceRecord {
  id: string;
  courseCode: string;
  courseName: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  verificationMethod: 'rfid_turnstile' | 'ble_beacon' | 'seat_sensor' | 'faculty_roster';
  room?: string;
}

// Assignment Record
export interface AssignmentRecord {
  id: string;
  courseCode: string;
  title: string;
  dueDate: string;
  submittedAt?: string;
  status: 'submitted_on_time' | 'submitted_late' | 'overdue_missing' | 'upcoming';
  submissionHour?: string; // e.g. "03:40 AM"
  grade?: string;
}

// Full Academic Telemetry (Objective Institutional Datapoints)
export interface AcademicTelemetry {
  classesAttended: number;
  totalClassesScheduled: number;
  attendanceRate: number; // percentage 0 - 100
  consecutiveClassesMissed: number;
  attendanceTrend: 'severely_dropped' | 'declining' | 'stable' | 'improving';
  assignmentsSubmitted: number;
  totalAssignmentsDue: number;
  assignmentCompletionRate: number; // percentage 0 - 100
  missingAssignmentsCount: number;
  lateSubmissionsCount: number;
  recentClasses: ClassAttendanceRecord[];
  recentAssignments: AssignmentRecord[];
  // Objective anomaly & masking flags
  objectiveAcademicRisk: 'critical' | 'high' | 'moderate' | 'low';
  isMaskingSuspected: boolean; // Flagged because self-report claims all is well while objective telemetry fails
  maskingConfidence: number; // 0 - 100
  maskingReason?: string;
}

export interface StudentBehaviorLog {
  id: string;
  studentId: string;
  studentName: string;
  anonymousId: string;
  timestamp: string;
  eventType: BehaviorEventType;
  description: string;
  metrics?: {
    mood?: number;
    sleepHours?: number;
    academicPressure?: number;
    socialScore?: number;
    overwhelm?: number;
  };
  anomalyDetected: boolean;
  anomalyScore?: number; // 0 - 100
  anomalyDetails?: AnomalyFlag;
  status: StudentFollowUpStatus;
}

export interface CounselorNote {
  id: string;
  studentId: string;
  counselorId: string;
  counselorName: string;
  noteText: string;
  actionTaken: string;
  riskRating: 'critical' | 'moderate' | 'low';
  createdAt: string;
}

export interface StudentCounselorProfile {
  id: string;
  anonymousId: string;
  name: string;
  email: string;
  year: string;
  course: string;
  avatar: string;
  anomalyScore: number; // 0-100 overall composite anomaly index
  anomalyCategory: AnomalyCategory | 'stable';
  primaryAnomaly: string;
  isSuspicious: boolean; // Flagged as suspicious for counselor review
  suspiciousReason?: string;
  riskLevel: AnomalySeverity;
  status: StudentFollowUpStatus;
  lastCheckinDate: string;
  flagsCount: number;
  currentCheckin: CheckIn;
  baseline: PersonalBaseline;
  academicTelemetry: AcademicTelemetry; // Objective institutional telemetry (classes attended, assignments submitted, masking flags)
  recentLogs: StudentBehaviorLog[];
  counselorNotes: CounselorNote[];
  peerAssigned?: string;
  meetingScheduled?: string;
}

export interface PeerSupporter {
  id: string;
  anonymousName: string;
  realName: string;
  course: string;
  year: string;
  topics: string[];
  bio: string;
  availableNow: boolean;
  preferredContact: 'chat' | 'walk' | 'coffee';
  rating: number;
  chatsCount: number;
}

export interface SupportRequest {
  id: string;
  userId: string;
  userName: string;
  type: 'peer' | 'counsellor' | 'urgent';
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed';
  preferredTime?: string;
  counselorName?: string;
  peerName?: string;
  topic: string;
  notes?: string;
  createdAt: string;
}

export interface CounselorAppointmentSlot {
  id: string;
  counselorId: string;
  counselorName: string;
  specialty: string;
  date: string;
  time: string;
  available: boolean;
  roomOrVirtual: string;
}
