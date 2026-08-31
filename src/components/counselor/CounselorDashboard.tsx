import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  UserCheck, 
  Users, 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  Calendar, 
  MessageSquare, 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  UserPlus, 
  Stethoscope,
  Activity,
  ArrowRight,
  Flame,
  FileText,
  Flag,
  ShieldAlert,
  SlidersHorizontal,
  Radio,
  Sparkles,
  GraduationCap,
  Laptop,
  Scan
} from 'lucide-react';
import { StudentCounselorProfile, StudentFollowUpStatus, AnomalySeverity, StudentBehaviorLog } from '../../types';
import { StudentDetailModal } from './StudentDetailModal';
import { ScheduleCheckinModal } from './ScheduleCheckinModal';
import { AssignPeerModal } from './AssignPeerModal';
import { AddNoteModal } from './AddNoteModal';

interface CounselorDashboardProps {
  studentProfiles: StudentCounselorProfile[];
  onUpdateStatus: (studentId: string, status: StudentFollowUpStatus) => void;
  onAddNote: (studentId: string, noteText: string, actionTaken: string, riskRating: 'critical' | 'moderate' | 'low') => void;
  onAssignPeer: (studentId: string, peerName: string) => void;
  onScheduleMeeting: (studentId: string, slotId: string, notes?: string) => void;
  onFlagSuspicious?: (studentId: string, isSuspicious: boolean, reason?: string) => void;
}

export const CounselorDashboard: React.FC<CounselorDashboardProps> = ({
  studentProfiles,
  onUpdateStatus,
  onAddNote,
  onAssignPeer,
  onScheduleMeeting,
  onFlagSuspicious
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [suspiciousFilter, setSuspiciousFilter] = useState<'all' | 'suspicious_only' | 'normal'>('all');
  const [academicFilter, setAcademicFilter] = useState<'all' | 'masking_only' | 'low_attendance' | 'missing_work'>('all');
  const [telemetryEventType, setTelemetryEventType] = useState<string>('all');
  const [anonymousMode, setAnonymousMode] = useState<boolean>(true); // Privacy-by-design default!

  // Active Modals state
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<StudentCounselorProfile | null>(null);
  const [selectedStudentForSchedule, setSelectedStudentForSchedule] = useState<StudentCounselorProfile | null>(null);
  const [selectedStudentForPeer, setSelectedStudentForPeer] = useState<StudentCounselorProfile | null>(null);
  const [selectedStudentForNote, setSelectedStudentForNote] = useState<StudentCounselorProfile | null>(null);

  // Filter students
  const filteredStudents = studentProfiles.filter(student => {
    const matchesSearch = 
      student.anonymousId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.primaryAnomaly.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.suspiciousReason && student.suspiciousReason.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSeverity = severityFilter === 'all' || student.riskLevel === severityFilter;
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesSuspicious = 
      suspiciousFilter === 'all' ? true :
      suspiciousFilter === 'suspicious_only' ? Boolean(student.isSuspicious) :
      !student.isSuspicious;

    const matchesAcademic = 
      academicFilter === 'all' ? true :
      academicFilter === 'masking_only' ? Boolean(student.academicTelemetry?.isMaskingSuspected) :
      academicFilter === 'low_attendance' ? (student.academicTelemetry ? student.academicTelemetry.attendanceRate < 70 : false) :
      academicFilter === 'missing_work' ? (student.academicTelemetry ? student.academicTelemetry.missingAssignmentsCount >= 2 : false) :
      true;

    return matchesSearch && matchesSeverity && matchesStatus && matchesSuspicious && matchesAcademic;
  });

  // Calculate stats
  const suspiciousStudents = studentProfiles.filter(s => s.isSuspicious);
  const criticalCount = studentProfiles.filter(s => s.riskLevel === 'critical').length;
  const highCount = studentProfiles.filter(s => s.riskLevel === 'high').length;
  const needsFollowupCount = studentProfiles.filter(s => s.status === 'needs_follow_up').length;
  const maskingCount = studentProfiles.filter(s => s.academicTelemetry?.isMaskingSuspected).length;
  const academicRiskCount = studentProfiles.filter(s => s.academicTelemetry && (s.academicTelemetry.objectiveAcademicRisk === 'critical' || s.academicTelemetry.objectiveAcademicRisk === 'high')).length;

  // Flatten all recent logs for telemetry stream
  const allRecentLogs: StudentBehaviorLog[] = studentProfiles
    .flatMap(s => s.recentLogs)
    .filter(log => {
      if (telemetryEventType === 'all') return true;
      if (telemetryEventType === 'anomalies') return log.anomalyDetected;
      return log.eventType === telemetryEventType;
    })
    .sort((a, b) => (a.timestamp.includes('Today') ? -1 : 1))
    .slice(0, 10);

  const handleToggleFlag = (student: StudentCounselorProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFlagSuspicious) {
      const nextState = !student.isSuspicious;
      const defaultReason = nextState ? 'Counselor clinical priority flag for multi-factor observation' : undefined;
      onFlagSuspicious(student.id, nextState, defaultReason);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Counselor Profile Header - Geometric Balance Panel */}
      <div className="bg-[#0f172a] border border-slate-800 p-6 sm:p-7 text-white relative">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="h-14 w-14 bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
              <Stethoscope className="h-7 w-7 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-heading">
                  Counselor Profile: Dr. Aris Thorne
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold bg-indigo-950 text-indigo-300 border border-indigo-400/40">
                  Lead Clinical Psychologist
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Student Psychological Services &amp; Early Wellbeing Intervention • Campus Anomaly Detection System
              </p>
              <div className="flex items-center space-x-3 mt-2 text-[11px] font-mono text-slate-400">
                <span className="flex items-center space-x-1">
                  <Activity className="h-3 w-3 text-emerald-400" />
                  <span>Telemetry Engine: ACTIVE</span>
                </span>
                <span>•</span>
                <span>Baseline Window: 14-Day Rolling</span>
                <span>•</span>
                <span>Non-Diagnostic Telemetry</span>
              </div>
            </div>
          </div>

          {/* Privacy Mode Toggle */}
          <div className="bg-slate-900 border border-slate-800 p-3 flex items-center justify-between gap-3 shrink-0">
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                {anonymousMode ? <EyeOff className="h-3.5 w-3.5 text-amber-400" /> : <Eye className="h-3.5 w-3.5 text-teal-400" />}
                <span>{anonymousMode ? 'FERPA Anonymous Mode' : 'Identified Counselor View'}</span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                {anonymousMode ? 'Masking identities (#104, #447)' : 'Displaying full student names & emails'}
              </p>
            </div>
            <button
              id="btn-toggle-privacy-mode"
              onClick={() => setAnonymousMode(!anonymousMode)}
              className={`px-3 py-1 text-xs font-mono font-semibold transition-all border ${
                anonymousMode
                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/50 hover:bg-amber-900/60'
                  : 'bg-teal-950/60 text-teal-300 border-teal-500/50 hover:bg-teal-900/60'
              }`}
            >
              {anonymousMode ? 'Reveal Names' : 'Anonymize'}
            </button>
          </div>
        </div>

        {/* Campus Wellbeing Overview KPI Bar */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3 pt-5 border-t border-slate-800">
          
          <div className="bg-slate-900/90 border border-slate-800 p-3.5">
            <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Students Monitored</div>
            <div className="text-2xl font-bold font-heading text-white mt-1">{studentProfiles.length} Cohorts</div>
            <div className="text-[10px] text-slate-400 mt-1">Multi-sensor campus telemetry</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5">
            <div className="text-[11px] font-mono uppercase text-rose-400 tracking-wider flex items-center space-x-1">
              <Flag className="h-3 w-3 text-rose-400" />
              <span>Flagged Suspicious</span>
            </div>
            <div className="text-2xl font-bold font-heading text-rose-400 mt-1">{suspiciousStudents.length} Students</div>
            <div className="text-[10px] text-rose-300/80 mt-1">High anomaly deviation index</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5">
            <div className="text-[11px] font-mono uppercase text-amber-400 tracking-wider flex items-center space-x-1">
              <ShieldAlert className="h-3 w-3 text-amber-400" />
              <span>Survey Masking Flags</span>
            </div>
            <div className="text-2xl font-bold font-heading text-amber-400 mt-1">{maskingCount} Flagged</div>
            <div className="text-[10px] text-amber-300/80 mt-1">Self-report vs telemetry mismatch</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5">
            <div className="text-[11px] font-mono uppercase text-sky-400 tracking-wider flex items-center space-x-1">
              <GraduationCap className="h-3 w-3 text-sky-400" />
              <span>Academic Telemetry</span>
            </div>
            <div className="text-2xl font-bold font-heading text-sky-400 mt-1">{academicRiskCount} At Risk</div>
            <div className="text-[10px] text-sky-300/80 mt-1">Attendance / LMS disengagement</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5">
            <div className="text-[11px] font-mono uppercase text-indigo-300 tracking-wider flex items-center space-x-1">
              <UserPlus className="h-3 w-3 text-indigo-400" />
              <span>Outreach Required</span>
            </div>
            <div className="text-2xl font-bold font-heading text-indigo-300 mt-1">{needsFollowupCount} Pending</div>
            <div className="text-[10px] text-indigo-300/80 mt-1">Awaiting counselor consult</div>
          </div>

        </div>
      </div>

      {/* Flagged Suspicious Students Priority Hub */}
      <div className="bg-rose-50 border-2 border-rose-400 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200 pb-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-rose-600 text-white shrink-0 mt-0.5 border border-rose-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold text-rose-950 font-heading tracking-tight">
                  Flagged Suspicious Students — Clinical Anomaly Triage
                </h2>
                <span className="px-2 py-0.2 bg-rose-600 text-white font-mono text-[10px] font-bold uppercase">
                  {suspiciousStudents.length} Flagged
                </span>
              </div>
              <p className="text-xs text-rose-900 mt-0.5">
                The anomaly model flags students when multi-vector behavioral divergence exceeds safety thresholds (e.g. 72h dorm confinement, acute sleep crashes, consecutive missed lab practicums, or sudden dining withdrawal).
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {
                setSuspiciousFilter(suspiciousFilter === 'suspicious_only' ? 'all' : 'suspicious_only');
              }}
              className={`px-3 py-1.5 text-xs font-semibold font-mono border transition-colors flex items-center space-x-1.5 ${
                suspiciousFilter === 'suspicious_only'
                  ? 'bg-rose-700 text-white border-rose-800'
                  : 'bg-white text-rose-800 border-rose-300 hover:bg-rose-100'
              }`}
            >
              <Flag className="h-3.5 w-3.5" />
              <span>{suspiciousFilter === 'suspicious_only' ? 'Viewing Suspicious Only' : 'Filter Suspicious Only'}</span>
            </button>
          </div>
        </div>

        {/* Quick Suspicious Students Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {suspiciousStudents.slice(0, 6).map((student) => (
            <div 
              key={student.id}
              onClick={() => setSelectedStudentForDetail(student)}
              className="bg-white border border-rose-300 hover:border-rose-500 p-3.5 flex flex-col justify-between space-y-2 cursor-pointer transition-all group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900 font-heading">
                      {anonymousMode ? student.anonymousId : student.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{student.year}</span>
                  </div>
                  <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[10px] font-mono font-bold">
                    Score: {student.anomalyScore}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-rose-800 mt-1 line-clamp-1">
                  {student.primaryAnomaly}
                </div>

                {student.suspiciousReason && (
                  <p className="text-[11px] text-slate-600 font-mono mt-1 line-clamp-2 bg-rose-50/70 p-1.5 border border-rose-200">
                    <strong className="text-rose-900">Flag reason: </strong>
                    {student.suspiciousReason}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  {student.status.replace(/_/g, ' ')}
                </span>
                <span className="text-indigo-700 font-semibold text-[11px] group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                  <span>Inspect Telemetry</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 border border-slate-200">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="input-counselor-search"
            type="text"
            placeholder="Search by student ID (#104), student name, course, anomaly trigger, or suspicious reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Suspicious Filter Pill */}
          <div className="flex items-center space-x-1 bg-slate-50 border border-slate-300 px-2 py-1">
            <span className="text-[11px] font-mono text-slate-500 mr-1">Suspicious:</span>
            <select
              id="select-suspicious-filter"
              value={suspiciousFilter}
              onChange={(e) => setSuspiciousFilter(e.target.value as any)}
              className="text-xs bg-transparent border-0 text-slate-800 font-semibold focus:ring-0 cursor-pointer font-mono"
            >
              <option value="all">All Students ({studentProfiles.length})</option>
              <option value="suspicious_only">Flagged Suspicious Only ({suspiciousStudents.length})</option>
              <option value="normal">Stable Baselines</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-slate-50 border border-slate-300 px-2 py-1">
            <span className="text-[11px] font-mono text-slate-500 mr-1">Severity:</span>
            <select
              id="select-severity-filter"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-xs bg-transparent border-0 text-slate-800 font-semibold focus:ring-0 cursor-pointer font-mono"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Anomaly (&gt;85)</option>
              <option value="high">High Anomaly (75-85)</option>
              <option value="moderate">Moderate Shift</option>
              <option value="low">Stable / Normal</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-slate-50 border border-slate-300 px-2 py-1">
            <span className="text-[11px] font-mono text-slate-500 mr-1">Status:</span>
            <select
              id="select-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-transparent border-0 text-slate-800 font-semibold focus:ring-0 cursor-pointer font-mono"
            >
              <option value="all">All Statuses</option>
              <option value="needs_follow_up">Needs Follow-Up</option>
              <option value="contact_requested">Contact Requested</option>
              <option value="peer_support_suggested">Suggested Peer Support</option>
              <option value="reviewed">Reviewed / Notes Logged</option>
              <option value="stable">Stable</option>
            </select>
          </div>

          {/* Academic Telemetry Filter */}
          <div className="flex items-center space-x-1 bg-slate-50 border border-slate-300 px-2 py-1">
            <span className="text-[11px] font-mono text-slate-500 mr-1">Academic:</span>
            <select
              id="select-academic-filter"
              value={academicFilter}
              onChange={(e) => setAcademicFilter(e.target.value as any)}
              className="text-xs bg-transparent border-0 text-slate-800 font-semibold focus:ring-0 cursor-pointer font-mono"
            >
              <option value="all">All Academic Profiles</option>
              <option value="masking_only">⚠️ Masking Discrepancy Only ({maskingCount})</option>
              <option value="low_attendance">Low Class Attendance (&lt;70%)</option>
              <option value="missing_work">Missing LMS Assignments (≥2)</option>
            </select>
          </div>

          {(severityFilter !== 'all' || statusFilter !== 'all' || suspiciousFilter !== 'all' || academicFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSeverityFilter('all');
                setStatusFilter('all');
                setSuspiciousFilter('all');
                setAcademicFilter('all');
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 border border-indigo-200 bg-indigo-50"
            >
              Reset Filters
            </button>
          )}

        </div>
      </div>

      {/* Student Behavioral Telemetry Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2 font-heading">
            <span>Student Behavioral Anomaly Telemetry Logs</span>
            <span className="text-[11px] font-mono text-slate-600 bg-slate-100 border border-slate-300 px-2 py-0.2">
              Showing {filteredStudents.length} of {studentProfiles.length} Students
            </span>
          </h2>
          <span className="text-xs text-slate-500 hidden sm:inline font-mono">
            Click any row to open comprehensive timeline &amp; sensor divergence
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 text-center text-slate-500">
            <ShieldCheck className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
            <p className="font-semibold text-slate-800">No students match your filter criteria.</p>
            <p className="text-xs text-slate-500 mt-1 font-mono">Try resetting severity or status filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredStudents.map((student) => {
              const isCritical = student.riskLevel === 'critical';
              const isHigh = student.riskLevel === 'high';
              const isModerate = student.riskLevel === 'moderate';

              return (
                <div
                  key={student.id}
                  id={`student-card-${student.id}`}
                  className={`bg-white border transition-all p-4 ${
                    student.isSuspicious
                      ? 'border-rose-400 bg-rose-50/15'
                      : isCritical 
                      ? 'border-rose-300 bg-rose-50/10' 
                      : isHigh 
                      ? 'border-amber-300 bg-amber-50/10' 
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Left: Student Identity & Anomaly Gauge */}
                    <div className="flex items-start space-x-3.5">
                      
                      {/* Avatar or Anonymous Badge */}
                      <div className="relative shrink-0">
                        {anonymousMode ? (
                          <div className={`h-12 w-12 flex flex-col items-center justify-center font-bold text-xs border ${
                            student.isSuspicious
                              ? 'bg-rose-100 text-rose-900 border-rose-400'
                              : isCritical 
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : isHigh
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}>
                            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">ID</span>
                            <span className="font-mono font-bold">{student.anonymousId.replace('Student #', '#')}</span>
                          </div>
                        ) : (
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="h-12 w-12 object-cover border border-slate-300"
                          />
                        )}
                        
                        {/* Anomaly Badge */}
                        <div 
                          title={`Anomaly Score: ${student.anomalyScore}/100`}
                          className={`absolute -bottom-1 -right-1 px-1 py-0.2 text-[9px] font-mono font-bold text-white ${
                            isCritical ? 'bg-rose-600' : isHigh ? 'bg-amber-600' : 'bg-emerald-600'
                          }`}
                        >
                          {student.anomalyScore}
                        </div>
                      </div>

                      {/* Info & Anomalies */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 font-heading">
                            {anonymousMode ? student.anonymousId : student.name}
                          </h3>
                          
                          <span className="text-xs text-slate-500 font-mono">
                            {student.year} • {student.course}
                          </span>

                          {/* Suspicious Student Flag Badge */}
                          {student.isSuspicious && (
                            <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-600 text-white border border-rose-700 flex items-center space-x-1">
                              <Flag className="h-3 w-3 inline" />
                              <span>SUSPICIOUS FLAGGED</span>
                            </span>
                          )}

                          {/* Survey Masking Discrepancy Badge */}
                          {student.academicTelemetry?.isMaskingSuspected && (
                            <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500 text-white border border-amber-600 flex items-center space-x-1">
                              <ShieldAlert className="h-3 w-3 inline" />
                              <span>SURVEY MASKING DETECTED</span>
                            </span>
                          )}

                          {/* Risk Badge */}
                          <span className={`px-1.5 py-0.2 text-[10px] font-mono font-bold uppercase tracking-wider border ${
                            isCritical 
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : isHigh 
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : isModerate
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}>
                            {student.riskLevel} Anomaly
                          </span>

                          {/* Status Pill */}
                          <span className="px-1.5 py-0.2 text-[10px] font-mono uppercase font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                            {student.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Primary Anomaly Flag Text */}
                        <div className="mt-1 flex items-start space-x-1.5 text-xs">
                          <AlertTriangle className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${isCritical ? 'text-rose-600' : 'text-amber-600'}`} />
                          <span className="font-semibold text-slate-800">
                            {student.primaryAnomaly}
                          </span>
                        </div>

                        {/* Suspicious Reason Callout */}
                        {student.isSuspicious && student.suspiciousReason && (
                          <div className="mt-1 text-[11px] font-mono text-rose-800 bg-rose-50 px-2 py-0.5 border border-rose-200">
                            <strong>Flag Detail: </strong>{student.suspiciousReason}
                          </div>
                        )}

                        {/* Recent Notes or Actions */}
                        {student.counselorNotes && student.counselorNotes.length > 0 && (
                          <div className="mt-1 flex items-center space-x-1 text-[11px] text-slate-500 font-mono">
                            <FileText className="h-3 w-3 text-indigo-600" />
                            <span>Last note: "{student.counselorNotes[0].noteText.slice(0, 60)}..."</span>
                          </div>
                        )}

                        {student.meetingScheduled && (
                          <div className="mt-1 flex items-center space-x-1 text-[11px] text-emerald-800 font-mono font-medium">
                            <Calendar className="h-3 w-3 text-emerald-600" />
                            <span>Appointment booked: {student.meetingScheduled}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle: Key Metric Delta & Academic Telemetry Comparison */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-slate-200 bg-slate-50 p-2 border border-slate-200 text-center shrink-0 min-w-[280px]">
                      <div className="px-2">
                        <div className="text-[9px] font-mono uppercase font-bold text-slate-400">Sleep (Cur / Base)</div>
                        <div className={`text-xs font-mono font-bold mt-0.5 ${
                          student.currentCheckin.sleepHours < 5 ? 'text-rose-600' : 'text-slate-800'
                        }`}>
                          {student.currentCheckin.sleepHours}h <span className="text-[10px] text-slate-400 font-normal">/ {student.baseline.avgSleep}h</span>
                        </div>
                      </div>

                      <div className="px-2">
                        <div className="text-[9px] font-mono uppercase font-bold text-slate-400">Pressure (1-10)</div>
                        <div className={`text-xs font-mono font-bold mt-0.5 ${
                          student.currentCheckin.academicPressure >= 8 ? 'text-rose-600' : 'text-slate-800'
                        }`}>
                          {student.currentCheckin.academicPressure} <span className="text-[10px] text-slate-400 font-normal">/ {student.baseline.avgAcademicPressure}</span>
                        </div>
                      </div>

                      {/* Objective Classes Attended */}
                      <div className="px-2">
                        <div className="text-[9px] font-mono uppercase font-bold text-slate-400 flex items-center justify-center space-x-1">
                          <Scan className="h-2.5 w-2.5" />
                          <span>Classes Attended</span>
                        </div>
                        <div className={`text-xs font-mono font-bold mt-0.5 ${
                          (student.academicTelemetry?.attendanceRate || 100) < 60 
                            ? 'text-rose-600' 
                            : (student.academicTelemetry?.attendanceRate || 100) < 80 
                            ? 'text-amber-600' 
                            : 'text-emerald-700'
                        }`}>
                          {student.academicTelemetry?.classesAttended ?? '-'}/{student.academicTelemetry?.totalClassesScheduled ?? '-'}
                          <span className="text-[10px] text-slate-400 font-normal"> ({student.academicTelemetry?.attendanceRate ?? 0}%)</span>
                        </div>
                      </div>

                      {/* Objective Assignments Submitted */}
                      <div className="px-2">
                        <div className="text-[9px] font-mono uppercase font-bold text-slate-400 flex items-center justify-center space-x-1">
                          <Laptop className="h-2.5 w-2.5" />
                          <span>Assignments</span>
                        </div>
                        <div className={`text-xs font-mono font-bold mt-0.5 ${
                          (student.academicTelemetry?.missingAssignmentsCount || 0) > 0 
                            ? 'text-rose-600' 
                            : 'text-emerald-700'
                        }`}>
                          {student.academicTelemetry?.assignmentsSubmitted ?? '-'}/{student.academicTelemetry?.totalAssignmentsDue ?? '-'}
                          <span className="text-[10px] text-slate-400 font-normal">
                            {(student.academicTelemetry?.missingAssignmentsCount || 0) > 0 ? ` (${student.academicTelemetry?.missingAssignmentsCount} overdue)` : ' (All done)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Action Controls */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      
                      {/* Flag / Unflag Suspicious button */}
                      {onFlagSuspicious && (
                        <button
                          type="button"
                          onClick={(e) => handleToggleFlag(student, e)}
                          title={student.isSuspicious ? 'Clear suspicious flag' : 'Flag this student as suspicious for outreach'}
                          className={`p-1.5 text-xs font-semibold border transition-colors flex items-center space-x-1 ${
                            student.isSuspicious
                              ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <Flag className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedStudentForDetail(student)}
                        className="px-2.5 py-1.5 bg-[#0f172a] hover:bg-indigo-700 text-white text-xs font-semibold border border-slate-800 transition-colors flex items-center space-x-1"
                      >
                        <span>Investigate</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => setSelectedStudentForSchedule(student)}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors flex items-center space-x-1"
                      >
                        <Calendar className="h-3.5 w-3.5 text-slate-600" />
                        <span>Schedule</span>
                      </button>

                      <button
                        onClick={() => setSelectedStudentForPeer(student)}
                        className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold transition-colors flex items-center space-x-1"
                      >
                        <UserPlus className="h-3.5 w-3.5 text-purple-600" />
                        <span>Assign Peer</span>
                      </button>

                      <button
                        onClick={() => setSelectedStudentForNote(student)}
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs transition-colors"
                        title="Add counselor observation note"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </button>

                      {/* Status quick changer */}
                      <select
                        value={student.status}
                        onChange={(e) => onUpdateStatus(student.id, e.target.value as StudentFollowUpStatus)}
                        className="text-xs bg-white border border-slate-300 px-2 py-1 font-mono font-medium text-slate-800 cursor-pointer focus:ring-0 focus:border-indigo-600"
                      >
                        <option value="needs_follow_up">Needs Follow-Up</option>
                        <option value="contact_requested">Contact Requested</option>
                        <option value="peer_support_suggested">Suggested Peer</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="stable">Mark Stable</option>
                      </select>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Behavioral Telemetry Feed (Live Stream of multi-source logs) */}
      <div className="bg-white border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 font-heading">
              <Activity className="h-4 w-4 text-indigo-600" />
              <span>Campus Behavior Telemetry Stream</span>
            </h3>
            <p className="text-xs text-slate-500">
              Continuous multi-source sensor logs: LMS activity, dorm turnstiles, dining scans, self check-ins, and counselor alerts
            </p>
          </div>

          {/* Event Filter Toggles */}
          <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono">
            <button
              onClick={() => setTelemetryEventType('all')}
              className={`px-2 py-0.5 border ${telemetryEventType === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              All Events
            </button>
            <button
              onClick={() => setTelemetryEventType('anomalies')}
              className={`px-2 py-0.5 border ${telemetryEventType === 'anomalies' ? 'bg-rose-600 text-white border-rose-700' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'}`}
            >
              🚩 Anomalies Only
            </button>
            <button
              onClick={() => setTelemetryEventType('lms_activity')}
              className={`px-2 py-0.5 border ${telemetryEventType === 'lms_activity' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              LMS Telemetry
            </button>
            <button
              onClick={() => setTelemetryEventType('facility_swipe')}
              className={`px-2 py-0.5 border ${telemetryEventType === 'facility_swipe' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              Facility Swipes
            </button>
            <button
              onClick={() => setTelemetryEventType('dining_swipe')}
              className={`px-2 py-0.5 border ${telemetryEventType === 'dining_swipe' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              Dining Scans
            </button>
            <button
              onClick={() => setTelemetryEventType('checkin')}
              className={`px-2 py-0.5 border ${telemetryEventType === 'checkin' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              Check-ins
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {allRecentLogs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-start justify-between gap-4 hover:bg-slate-50 px-2 transition-colors">
              <div className="flex items-start space-x-3">
                <div className={`p-1 shrink-0 mt-0.5 border ${
                  log.anomalyDetected ? 'bg-rose-50 text-rose-700 border-rose-300' : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}>
                  {log.anomalyDetected ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 font-mono">
                      {anonymousMode ? log.anonymousId : log.studentName}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-mono text-[11px]">{log.timestamp}</span>
                    <span className="uppercase text-[9px] font-mono tracking-wider font-semibold text-slate-600 bg-slate-100 border border-slate-300 px-1 py-0.2">
                      {log.eventType.replace('_', ' ')}
                    </span>
                    {log.anomalyDetected && (
                      <span className="text-[9px] font-mono font-bold text-rose-700 bg-rose-50 px-1 border border-rose-200">
                        ANOMALY
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 mt-0.5">{log.description}</p>
                  {log.anomalyDetails && (
                    <div className="mt-1 inline-flex items-center px-1.5 py-0.2 bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-mono">
                      Delta: {log.anomalyDetails.baselineDelta}
                    </div>
                  )}
                </div>
              </div>

              {log.anomalyDetected && (
                <span className="shrink-0 text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 border border-rose-200">
                  Score: {log.anomalyScore}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Student Deep-Dive Detail Modal */}
      {selectedStudentForDetail && (
        <StudentDetailModal
          student={selectedStudentForDetail}
          anonymousMode={anonymousMode}
          onClose={() => setSelectedStudentForDetail(null)}
          onSchedule={() => {
            const s = selectedStudentForDetail;
            setSelectedStudentForDetail(null);
            setSelectedStudentForSchedule(s);
          }}
          onAssignPeer={() => {
            const s = selectedStudentForDetail;
            setSelectedStudentForDetail(null);
            setSelectedStudentForPeer(s);
          }}
          onAddNote={() => {
            const s = selectedStudentForDetail;
            setSelectedStudentForDetail(null);
            setSelectedStudentForNote(s);
          }}
          onToggleSuspicious={(studentId, isSuspicious, reason) => {
            if (onFlagSuspicious) {
              onFlagSuspicious(studentId, isSuspicious, reason);
            }
            setSelectedStudentForDetail({
              ...selectedStudentForDetail,
              isSuspicious,
              suspiciousReason: reason || selectedStudentForDetail.suspiciousReason
            });
          }}
        />
      )}

      {/* Schedule Check-in Modal */}
      {selectedStudentForSchedule && (
        <ScheduleCheckinModal
          student={selectedStudentForSchedule}
          anonymousMode={anonymousMode}
          onClose={() => setSelectedStudentForSchedule(null)}
          onConfirm={(slotId, notes) => {
            onScheduleMeeting(selectedStudentForSchedule.id, slotId, notes);
            setSelectedStudentForSchedule(null);
          }}
        />
      )}

      {/* Assign Peer Modal */}
      {selectedStudentForPeer && (
        <AssignPeerModal
          student={selectedStudentForPeer}
          anonymousMode={anonymousMode}
          onClose={() => setSelectedStudentForPeer(null)}
          onConfirm={(peerName) => {
            onAssignPeer(selectedStudentForPeer.id, peerName);
            setSelectedStudentForPeer(null);
          }}
        />
      )}

      {/* Add Counselor Note Modal */}
      {selectedStudentForNote && (
        <AddNoteModal
          student={selectedStudentForNote}
          anonymousMode={anonymousMode}
          onClose={() => setSelectedStudentForNote(null)}
          onConfirm={(noteText, actionTaken, riskRating) => {
            onAddNote(selectedStudentForNote.id, noteText, actionTaken, riskRating);
            setSelectedStudentForNote(null);
          }}
        />
      )}

    </div>
  );
};
