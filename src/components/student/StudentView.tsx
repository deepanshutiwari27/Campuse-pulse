import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  TrendingDown, 
  TrendingUp, 
  BookOpen, 
  Wind, 
  Users, 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle2, 
  Bot, 
  ShieldAlert, 
  Calendar,
  ArrowRight,
  HeartHandshake,
  GraduationCap,
  Laptop,
  Scan,
  XCircle,
  AlertOctagon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { StudentCounselorProfile, CheckIn, UserProfile } from '../../types';
import { CheckInModal } from './CheckInModal';
import { WorkloadPlannerModal } from './WorkloadPlannerModal';
import { ResetBreathingModal } from './ResetBreathingModal';
import { CounselorBookingModal } from './CounselorBookingModal';
import { CrisisSafetyModal } from './CrisisSafetyModal';
import { AIAssistantDrawer } from './AIAssistantDrawer';

interface StudentViewProps {
  studentProfile: StudentCounselorProfile;
  currentUser: UserProfile;
  onSubmitCheckin: (checkinData: Omit<CheckIn, 'id' | 'createdAt'>) => void;
  onNavigateToPeerSupport: () => void;
}

export const StudentView: React.FC<StudentViewProps> = ({
  studentProfile,
  currentUser,
  onSubmitCheckin,
  onNavigateToPeerSupport,
}) => {
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [isWorkloadOpen, setIsWorkloadOpen] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isCounselorOpen, setIsCounselorOpen] = useState(false);
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  const c = studentProfile.currentCheckin;
  const b = studentProfile.baseline;

  // Compute baseline differences
  const moodDelta = Number((c.moodScore - b.avgMood).toFixed(1));
  const sleepDelta = Number((c.sleepHours - b.avgSleep).toFixed(1));
  const pressureDelta = Number((c.academicPressure - b.avgAcademicPressure).toFixed(1));
  const socialDelta = Number((c.socialConnection - b.avgSocialConnection).toFixed(1));

  // 7-Day Trend Chart data showing the divergence
  const trendHistoryData = [
    { day: 'Mon', mood: 7.0, sleep: 7.5, pressure: 4.0, overwhelm: 3.5 },
    { day: 'Tue', mood: 6.8, sleep: 6.5, pressure: 5.5, overwhelm: 4.0 },
    { day: 'Wed', mood: 6.0, sleep: 5.0, pressure: 7.0, overwhelm: 6.0 },
    { day: 'Thu', mood: 4.5, sleep: 4.0, pressure: 8.5, overwhelm: 7.5 },
    { day: 'Fri', mood: 3.5, sleep: 3.5, pressure: 9.0, overwhelm: 8.5 },
    { day: 'Sat', mood: 3.0, sleep: 3.0, pressure: 9.2, overwhelm: 9.0 },
    { day: 'Today', mood: c.moodScore, sleep: c.sleepHours, pressure: c.academicPressure, overwhelm: c.overwhelm },
  ];

  return (
    <div className="dashboard-page space-y-6 pb-16">
      
      {/* Hero Greeting & Quick Check-in CTA - Geometric Balance Panel */}
      <div className="hero-panel bg-[#0f172a] border border-slate-800 p-6 sm:p-7 text-white relative">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            <img
              src={studentProfile.avatar}
              alt={studentProfile.name}
              className="h-14 w-14 object-cover border border-slate-700 shrink-0"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-heading">
                  Welcome back, {studentProfile.name.split(' ')[0]}
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase font-semibold bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                  {studentProfile.year}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                {studentProfile.course} • Campus Wellbeing Baseline Companion
              </p>
              <div className="flex items-center space-x-3 mt-2 text-[11px] font-mono text-slate-400">
                <span className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Last check-in: {studentProfile.lastCheckinDate}</span>
                </span>
                <span>•</span>
                <span>Personal Baseline ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="btn-open-checkin"
              onClick={() => setIsCheckinOpen(true)}
              className="primary-action px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs border border-indigo-500 transition-colors flex items-center space-x-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Take 60-Sec Check-in</span>
            </button>

            <button
              onClick={() => setIsAIOpen(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <Bot className="h-3.5 w-3.5 text-indigo-400" />
              <span>AI Navigator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Baseline Comparison Section */}
      <div className="bg-white border border-slate-200 p-5 sm:p-6 space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 font-heading">Your Wellbeing Baseline Comparison</h2>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-mono px-2 py-0.2 border border-slate-300 font-semibold uppercase">
                {b.baselinePeriod}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              CampusPulse evaluates your wellbeing against your individual history, not arbitrary population standards.
            </p>
          </div>

          <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300">
            ⚠️ NOTICEABLE BASELINE SHIFT
          </span>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Mood Card */}
          <div className="interactive-card bg-slate-50 p-3.5 border border-slate-200 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Mood</span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 bg-rose-100 text-rose-800 border border-rose-300">
                {moodDelta} vs base
              </span>
            </div>
            <div className="mt-2 flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold font-heading text-slate-900">{c.moodScore}</span>
              <span className="text-xs font-mono text-slate-400">/ 10 (Base: {b.avgMood})</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 h-1.5 mt-2.5 overflow-hidden">
              <div 
                className="bg-indigo-600 h-1.5 transition-all"
                style={{ width: `${(c.moodScore / 10) * 100}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-2">
              Status: {c.mood.replace('_', ' ')}
            </p>
          </div>

          {/* Sleep Card */}
          <div className="interactive-card bg-slate-50 p-3.5 border border-slate-200 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Sleep Duration</span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 bg-rose-100 text-rose-800 border border-rose-300">
                {sleepDelta} hrs
              </span>
            </div>
            <div className="mt-2 flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold font-heading text-slate-900">{c.sleepHours}</span>
              <span className="text-xs font-mono text-slate-400">hrs (Base: {b.avgSleep}h)</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 mt-2.5 overflow-hidden">
              <div 
                className="bg-rose-500 h-1.5 transition-all"
                style={{ width: `${(c.sleepHours / 10) * 100}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-rose-700 font-semibold mt-2">
              Sleep debt: 4.9 hours
            </p>
          </div>

          {/* Academic Pressure Card */}
          <div className="interactive-card bg-slate-50 p-3.5 border border-slate-200 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Academic Pressure</span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 bg-rose-100 text-rose-800 border border-rose-300">
                +{pressureDelta} pts
              </span>
            </div>
            <div className="mt-2 flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold font-heading text-rose-600">{c.academicPressure}</span>
              <span className="text-xs font-mono text-slate-400">/ 10 (Base: {b.avgAcademicPressure})</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 mt-2.5 overflow-hidden">
              <div 
                className="bg-rose-600 h-1.5 transition-all"
                style={{ width: `${(c.academicPressure / 10) * 100}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-2 truncate">
              Stressor: {c.primaryStressor}
            </p>
          </div>

          {/* Social Connection Card */}
          <div className="interactive-card bg-slate-50 p-3.5 border border-slate-200 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Social Connection</span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 bg-amber-100 text-amber-800 border border-amber-300">
                {socialDelta} pts
              </span>
            </div>
            <div className="mt-2 flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold font-heading text-slate-900">{c.socialConnection}</span>
              <span className="text-xs font-mono text-slate-400">/ 10 (Base: {b.avgSocialConnection})</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 mt-2.5 overflow-hidden">
              <div 
                className="bg-amber-500 h-1.5 transition-all"
                style={{ width: `${(c.socialConnection / 10) * 100}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-2">
              Isolation risk: moderate
            </p>
          </div>

        </div>

        {/* CampusPulse Non-Clinical Insight */}
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 border-t border-r border-b border-amber-200 flex items-start space-x-3.5">
          <div className="p-1.5 bg-amber-100 text-amber-800 border border-amber-300 shrink-0 mt-0.5">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-amber-950 text-xs font-heading">CampusPulse Baseline Insight</h3>
              <span className="text-[10px] font-mono bg-amber-200/60 text-amber-900 px-1.5 py-0.2 border border-amber-300 font-semibold">
                Non-Clinical Observation
              </span>
            </div>
            <p className="text-xs text-amber-950 mt-1 leading-relaxed">
              "Your academic pressure has increased significantly this week (+5.4 points above your baseline), while your sleep has decreased to 2.5 hours. You've reported feeling more overwhelmed than usual."
            </p>
            <p className="text-[11px] text-amber-900/80 mt-1 italic">
              Remember: This is a stress response to workload spikes, not a reflection of your capability. See recommended micro-steps below.
            </p>
          </div>
        </div>

      </div>

      {/* Objective Academic Telemetry & Coursework Ground Truth */}
      {studentProfile.academicTelemetry && (
        <div className="bg-white border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-slate-900 text-white shrink-0">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Academic Telemetry &amp; Institutional Milestones
                </h3>
                <p className="text-xs text-slate-500">
                  Classes attended and LMS coursework status tracked alongside your daily check-in
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 border ${
                studentProfile.academicTelemetry.objectiveAcademicRisk === 'critical'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : studentProfile.academicTelemetry.objectiveAcademicRisk === 'high'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                Academic Status: {studentProfile.academicTelemetry.objectiveAcademicRisk}
              </span>
            </div>
          </div>

          {/* Academic Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Classes Attended Card */}
            <div className="bg-slate-50 border border-slate-200 p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-[10px] font-mono font-bold text-slate-500 uppercase">
                  <Scan className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Classes Attended</span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 border ${
                  studentProfile.academicTelemetry.attendanceRate < 60
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : studentProfile.academicTelemetry.attendanceRate < 80
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {studentProfile.academicTelemetry.attendanceRate}% Rate
                </span>
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <div className="text-xl font-bold font-heading text-slate-900">
                  {studentProfile.academicTelemetry.classesAttended} / {studentProfile.academicTelemetry.totalClassesScheduled} Scheduled
                </div>
                <div className="text-xs font-mono text-slate-600">
                  {studentProfile.academicTelemetry.consecutiveClassesMissed > 0 ? (
                    <span className="text-rose-600 font-bold">{studentProfile.academicTelemetry.consecutiveClassesMissed} missed in a row</span>
                  ) : (
                    <span className="text-emerald-700">Consistent</span>
                  )}
                </div>
              </div>

              <div className="w-full bg-slate-200 h-1.5 mt-2.5 overflow-hidden">
                <div 
                  className={`h-1.5 transition-all ${
                    studentProfile.academicTelemetry.attendanceRate < 60 ? 'bg-rose-600' : studentProfile.academicTelemetry.attendanceRate < 80 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, studentProfile.academicTelemetry.attendanceRate))}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Verified by Campus RFID / Bluetooth</span>
                <span className="uppercase text-slate-700">Trend: {studentProfile.academicTelemetry.attendanceTrend.replace('_', ' ')}</span>
              </div>
            </div>

            {/* LMS Assignments Submitted Card */}
            <div className="bg-slate-50 border border-slate-200 p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-[10px] font-mono font-bold text-slate-500 uppercase">
                  <Laptop className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Assignments Submitted</span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 border ${
                  studentProfile.academicTelemetry.assignmentCompletionRate < 50
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : studentProfile.academicTelemetry.assignmentCompletionRate < 80
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {studentProfile.academicTelemetry.assignmentCompletionRate}% Completed
                </span>
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <div className="text-xl font-bold font-heading text-slate-900">
                  {studentProfile.academicTelemetry.assignmentsSubmitted} / {studentProfile.academicTelemetry.totalAssignmentsDue} Due
                </div>
                <div className="text-xs font-mono">
                  {studentProfile.academicTelemetry.missingAssignmentsCount > 0 ? (
                    <span className="text-rose-600 font-bold">{studentProfile.academicTelemetry.missingAssignmentsCount} Overdue Missing</span>
                  ) : (
                    <span className="text-emerald-700 font-medium">No missing items</span>
                  )}
                </div>
              </div>

              <div className="w-full bg-slate-200 h-1.5 mt-2.5 overflow-hidden">
                <div 
                  className={`h-1.5 transition-all ${
                    studentProfile.academicTelemetry.assignmentCompletionRate < 50 ? 'bg-rose-600' : studentProfile.academicTelemetry.assignmentCompletionRate < 80 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, studentProfile.academicTelemetry.assignmentCompletionRate))}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Late submissions: {studentProfile.academicTelemetry.lateSubmissionsCount}</span>
                <span>Canvas LMS Integration</span>
              </div>
            </div>

          </div>

          {/* Academic Ground Truth Notification */}
          <div className="p-3 bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start space-x-2.5">
            <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-800">Holistic Safety Net: </strong>
              Because students experiencing heavy stress don't always fill out self-reported surveys or may downplay how overwhelmed they are, 
              CampusPulse connects institutional attendance and coursework records to ensure proactive support reaches you before academic penalties accumulate.
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Trend Visualizer */}
      <div className="bg-white border border-slate-200 p-5 sm:p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-heading">7-Day Wellbeing Trajectory</h3>
            <p className="text-xs text-slate-500">
              Tracking how academic pressure and sleep divergence formed leading up to today's anomaly
            </p>
          </div>
          <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-600">
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 bg-rose-500" />
              <span>Academic Pressure</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 bg-teal-600" />
              <span>Sleep Hours</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 bg-indigo-600" />
              <span>Mood (1-10)</span>
            </span>
          </div>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendHistoryData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }} domain={[0, 10]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '0px', 
                  color: '#fff', 
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="pressure" 
                name="Academic Pressure" 
                stroke="#e11d48" 
                strokeWidth={2.5} 
                dot={{ r: 3, fill: '#e11d48' }} 
              />
              <Line 
                type="monotone" 
                dataKey="sleep" 
                name="Sleep Hours" 
                stroke="#0d9488" 
                strokeWidth={2} 
                dot={{ r: 3, fill: '#0d9488' }} 
              />
              <Line 
                type="monotone" 
                dataKey="mood" 
                name="Mood Score" 
                stroke="#6366f1" 
                strokeWidth={2} 
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#6366f1' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contextual Support Recommendations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-heading">Recommended Support Actions</h3>
            <p className="text-xs text-slate-500">
              Personalized based on your detected stress factors: high academic pressure + sleep debt
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 border border-indigo-200">
            Workload Overload Mode
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Action 1: Organize Workload */}
          <div className="bg-white border border-slate-200 p-4 hover:border-slate-400 transition-all flex flex-col justify-between">
            <div>
              <div className="h-8 w-8 bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center mb-2.5">
                <BookOpen className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900 font-heading">Organize My Workload</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Break large assignments into 25-minute micro sprints with structured pacing.
              </p>
            </div>
            <button
              onClick={() => setIsWorkloadOpen(true)}
              className="mt-3.5 w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
            >
              <span>Launch Workload</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Action 2: Short Reset */}
          <div className="bg-white border border-slate-200 p-4 hover:border-slate-400 transition-all flex flex-col justify-between">
            <div>
              <div className="h-8 w-8 bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-2.5">
                <Wind className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900 font-heading">Take a Short Reset</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                A 2-minute box breathing cycle designed to quiet somatic panic and lower heart rate.
              </p>
            </div>
            <button
              onClick={() => setIsBreathingOpen(true)}
              className="mt-3.5 w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
            >
              <span>Start 2-Min Reset</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Action 3: Peer Support */}
          <div className="bg-white border border-slate-200 p-4 hover:border-slate-400 transition-all flex flex-col justify-between">
            <div>
              <div className="h-8 w-8 bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center mb-2.5">
                <Users className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900 font-heading">Talk to a Peer Supporter</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Connect anonymously with upperclass students like Maya Chen who survived your courses.
              </p>
            </div>
            <button
              onClick={onNavigateToPeerSupport}
              className="mt-3.5 w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
            >
              <span>Find Peer Mentors</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Action 4: Campus Counselor */}
          <div className="bg-white border border-slate-200 p-4 hover:border-slate-400 transition-all flex flex-col justify-between">
            <div>
              <div className="h-8 w-8 bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center mb-2.5">
                <Stethoscope className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900 font-heading">Talk to a Counselor</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Campus Counseling Center has appointments open tomorrow at 11:30 AM with Dr. Thorne.
              </p>
            </div>
            <button
              onClick={() => setIsCounselorOpen(true)}
              className="mt-3.5 w-full py-1.5 bg-[#0f172a] hover:bg-indigo-700 text-white text-xs font-semibold border border-slate-800 transition-colors flex items-center justify-center space-x-1"
            >
              <span>Book Appointment</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Crisis Safety Layer Footer Banner */}
      <div className="bg-rose-50 border-l-4 border-rose-500 border-t border-r border-b border-rose-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-1.5 bg-rose-100 text-rose-700 border border-rose-300 shrink-0 mt-0.5">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-rose-950 font-heading">In Urgent Distress or Feeling Unsafe?</h4>
            <p className="text-xs text-rose-900/90 mt-0.5">
              Campus 24/7 Crisis line: (555) 019-CARE • 988 Suicide &amp; Crisis Lifeline • Free and confidential.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCrisisOpen(true)}
          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold border border-rose-700 transition-colors shrink-0"
        >
          View Crisis Resources
        </button>
      </div>

      {/* Modals & Drawers */}
      <CheckInModal
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
        userId={studentProfile.id}
        onSubmit={onSubmitCheckin}
      />

      <WorkloadPlannerModal
        isOpen={isWorkloadOpen}
        onClose={() => setIsWorkloadOpen(false)}
      />

      <ResetBreathingModal
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />

      <CounselorBookingModal
        isOpen={isCounselorOpen}
        onClose={() => setIsCounselorOpen(false)}
        studentId={studentProfile.id}
        onBookSuccess={(detail) => {
          // Success handled in modal
        }}
      />

      <CrisisSafetyModal
        isOpen={isCrisisOpen}
        onClose={() => setIsCrisisOpen(false)}
      />

      <AIAssistantDrawer
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        currentUser={currentUser}
        onOpenWorkload={() => {
          setIsAIOpen(false);
          setIsWorkloadOpen(true);
        }}
        onOpenBreathing={() => {
          setIsAIOpen(false);
          setIsBreathingOpen(true);
        }}
        onOpenCounselor={() => {
          setIsAIOpen(false);
          setIsCounselorOpen(true);
        }}
      />

    </div>
  );
};
