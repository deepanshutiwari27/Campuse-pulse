import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertOctagon, 
  TrendingDown, 
  TrendingUp, 
  Scan, 
  Radio, 
  Laptop, 
  AlertTriangle,
  PlusCircle,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import { AcademicTelemetry, CheckIn, ClassAttendanceRecord, AssignmentRecord } from '../../types';
import { DataService } from '../../lib/supabase';

interface AcademicTelemetryPanelProps {
  telemetry: AcademicTelemetry;
  currentCheckin: CheckIn;
  studentId: string;
  studentName: string;
}

export const AcademicTelemetryPanel: React.FC<AcademicTelemetryPanelProps> = ({
  telemetry,
  currentCheckin,
  studentId,
  studentName,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'assignments'>('attendance');
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simulationMessage, setSimulationMessage] = useState<string | null>(null);

  const isCriticalRisk = telemetry.objectiveAcademicRisk === 'critical';
  const isHighRisk = telemetry.objectiveAcademicRisk === 'high';

  // Interactive simulation to demonstrate real-time telemetry flagging
  const handleSimulateAttendance = async (status: 'absent' | 'present') => {
    setSimulating(true);
    await DataService.recordClassAttendance(studentId, {
      courseCode: 'UNIV 200',
      courseName: 'Core Seminar Lecture',
      date: 'Just now',
      status,
      verificationMethod: 'rfid_turnstile',
      room: 'Lecture Hall 101'
    });
    setSimulationMessage(
      status === 'absent' 
        ? 'Simulated unexcused absence recorded via RFID turnstile scan. Anomaly score re-evaluated.' 
        : 'Simulated lecture attendance recorded via RFID turnstile scan.'
    );
    setSimulating(false);
    setTimeout(() => setSimulationMessage(null), 5000);
  };

  const handleSimulateMissingAssignment = async () => {
    setSimulating(true);
    await DataService.recordAssignmentSubmission(studentId, {
      courseCode: 'UNIV 200',
      title: 'Module 4 Midterm Synthesis Paper',
      dueDate: 'Today, 11:59 PM',
      status: 'overdue_missing',
      grade: '0 / 100 (Unsubmitted)'
    });
    setSimulationMessage('Simulated overdue coursework milestone logged in LMS. Discrepancy flag updated.');
    setSimulating(false);
    setTimeout(() => setSimulationMessage(null), 5000);
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-slate-900 text-white shrink-0">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-heading">
              Institutional Academic Telemetry &amp; Objective Flags
            </h3>
            <p className="text-[11px] font-mono text-slate-500">
              Verified via campus RFID turnstiles, BLE classroom beacons, and LMS sync
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${
            isCriticalRisk 
              ? 'bg-rose-100 text-rose-800 border-rose-300' 
              : isHighRisk 
              ? 'bg-amber-100 text-amber-800 border-amber-300' 
              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
          }`}>
            Academic Risk: {telemetry.objectiveAcademicRisk}
          </span>
        </div>
      </div>

      {/* SURVEY MASKING & DISCREPANCY CALLOUT */}
      {telemetry.isMaskingSuspected && (
        <div className="p-4 bg-amber-50 border-2 border-amber-400 text-slate-800 space-y-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-500 text-white shrink-0 mt-0.5">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 font-heading">
                  High-Confidence Survey Masking Discrepancy
                </h4>
                <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-amber-200 text-amber-900 border border-amber-300">
                  Confidence: {telemetry.maskingConfidence}%
                </span>
              </div>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                <strong>Why this student was flagged: </strong>
                Students experiencing crisis frequently submit positive check-ins to conceal distress or avoid intervention. 
                Our telemetry system cross-references self-reports against verified institutional metrics to protect students who mask.
              </p>
            </div>
          </div>

          {/* Side-by-Side Discrepancy Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Left: What the student reported */}
            <div className="bg-white p-3 border border-amber-300">
              <div className="text-[10px] font-mono font-bold text-amber-800 uppercase flex items-center justify-between">
                <span>Self-Reported Check-In (Subjective)</span>
                <span className="text-emerald-700">Claims: "Fine"</span>
              </div>
              <div className="mt-2 space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Reported Mood:</span>
                  <strong className="font-mono text-emerald-700">{currentCheckin.moodScore} / 10 ({currentCheckin.mood})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reported Pressure:</span>
                  <strong className="font-mono text-emerald-700">{currentCheckin.academicPressure} / 10</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reported Overwhelm:</span>
                  <strong className="font-mono text-emerald-700">{currentCheckin.overwhelm} / 10</strong>
                </div>
                {currentCheckin.notes && (
                  <div className="mt-1 pt-1.5 border-t border-slate-100 text-[11px] italic text-slate-600">
                    "{currentCheckin.notes}"
                  </div>
                )}
              </div>
            </div>

            {/* Right: What the campus sensors reveal */}
            <div className="bg-rose-50/60 p-3 border border-rose-300">
              <div className="text-[10px] font-mono font-bold text-rose-800 uppercase flex items-center justify-between">
                <span>Campus Telemetry (Objective Reality)</span>
                <span className="text-rose-700 font-bold">Severe Crisis</span>
              </div>
              <div className="mt-2 space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Lecture Attendance:</span>
                  <strong className="font-mono text-rose-700">
                    {telemetry.attendanceRate}% ({telemetry.classesAttended}/{telemetry.totalClassesScheduled} classes)
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Consecutive Missed:</span>
                  <strong className="font-mono text-rose-700">
                    {telemetry.consecutiveClassesMissed} consecutive lectures
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">LMS Missing Coursework:</span>
                  <strong className="font-mono text-rose-700">
                    {telemetry.missingAssignmentsCount} overdue assignments (0/100)
                  </strong>
                </div>
                <div className="mt-1 pt-1.5 border-t border-rose-200 text-[11px] font-mono text-rose-800">
                  Verification: Turnstile RFID &amp; Canvas LMS API
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Core Academic Telemetry Metrics (Geometric Balance Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* Classes Attended Card */}
        <div className="bg-slate-50 border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono uppercase font-bold text-slate-500 flex items-center space-x-1.5">
              <Scan className="h-3.5 w-3.5 text-indigo-600" />
              <span>Classes Attended</span>
            </div>
            <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 border ${
              telemetry.attendanceRate < 60 
                ? 'bg-rose-100 text-rose-800 border-rose-300' 
                : telemetry.attendanceRate < 80 
                ? 'bg-amber-100 text-amber-800 border-amber-300' 
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}>
              {telemetry.attendanceRate}% Rate
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-heading text-slate-900">
              {telemetry.classesAttended} <span className="text-sm font-normal text-slate-500">/ {telemetry.totalClassesScheduled} Scheduled</span>
            </div>
            <div className="text-xs font-mono text-slate-600">
              {telemetry.consecutiveClassesMissed > 0 ? (
                <span className="text-rose-600 font-bold">
                  {telemetry.consecutiveClassesMissed} consecutive missed
                </span>
              ) : (
                <span className="text-emerald-700">0 consecutive missed</span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-2 mt-2 overflow-hidden">
            <div 
              className={`h-full transition-all ${
                telemetry.attendanceRate < 60 ? 'bg-rose-600' : telemetry.attendanceRate < 80 ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, telemetry.attendanceRate))}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Trend: <strong className="uppercase text-slate-700">{telemetry.attendanceTrend.replace('_', ' ')}</strong></span>
            <span>RFID &amp; Beacon Scans</span>
          </div>
        </div>

        {/* Assignments Submitted Card */}
        <div className="bg-slate-50 border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono uppercase font-bold text-slate-500 flex items-center space-x-1.5">
              <Laptop className="h-3.5 w-3.5 text-indigo-600" />
              <span>Assignments Submitted</span>
            </div>
            <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 border ${
              telemetry.assignmentCompletionRate < 50 
                ? 'bg-rose-100 text-rose-800 border-rose-300' 
                : telemetry.assignmentCompletionRate < 80 
                ? 'bg-amber-100 text-amber-800 border-amber-300' 
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}>
              {telemetry.assignmentCompletionRate}% Completed
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-heading text-slate-900">
              {telemetry.assignmentsSubmitted} <span className="text-sm font-normal text-slate-500">/ {telemetry.totalAssignmentsDue} Due</span>
            </div>
            <div className="text-xs font-mono">
              {telemetry.missingAssignmentsCount > 0 ? (
                <span className="text-rose-600 font-bold">
                  {telemetry.missingAssignmentsCount} Overdue Missing
                </span>
              ) : (
                <span className="text-emerald-700 font-medium">All submitted on time</span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-2 mt-2 overflow-hidden">
            <div 
              className={`h-full transition-all ${
                telemetry.assignmentCompletionRate < 50 ? 'bg-rose-600' : telemetry.assignmentCompletionRate < 80 ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, telemetry.assignmentCompletionRate))}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Late Submissions: <strong className="text-slate-700">{telemetry.lateSubmissionsCount}</strong></span>
            <span>Canvas LMS Sync</span>
          </div>
        </div>

      </div>

      {/* Sub-Tabs: Class Attendance Records vs Assignment Records */}
      <div className="border border-slate-200">
        <div className="bg-slate-100 flex items-center border-b border-slate-200 text-xs font-mono">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2.5 font-bold transition-colors flex items-center space-x-1.5 border-r border-slate-200 ${
              activeTab === 'attendance'
                ? 'bg-white text-slate-900 border-b-2 border-b-indigo-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Scan className="h-3.5 w-3.5" />
            <span>Classroom Scans ({telemetry.recentClasses?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2.5 font-bold transition-colors flex items-center space-x-1.5 border-r border-slate-200 ${
              activeTab === 'assignments'
                ? 'bg-white text-slate-900 border-b-2 border-b-indigo-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Laptop className="h-3.5 w-3.5" />
            <span>Coursework Submissions ({telemetry.recentAssignments?.length || 0})</span>
          </button>
        </div>

        {/* Tab Content: Attendance */}
        {activeTab === 'attendance' && (
          <div className="p-3 bg-white divide-y divide-slate-100">
            {(!telemetry.recentClasses || telemetry.recentClasses.length === 0) ? (
              <div className="py-6 text-center text-xs text-slate-500 font-mono">
                No recent attendance records logged.
              </div>
            ) : (
              telemetry.recentClasses.map((cls) => (
                <div key={cls.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2.5">
                    {cls.status === 'present' && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                    {cls.status === 'absent' && <XCircle className="h-4 w-4 text-rose-600 shrink-0" />}
                    {cls.status === 'late' && <Clock className="h-4 w-4 text-amber-600 shrink-0" />}
                    {cls.status === 'excused' && <HelpCircle className="h-4 w-4 text-blue-600 shrink-0" />}

                    <div>
                      <div className="flex items-center space-x-2">
                        <strong className="text-slate-900 font-mono">{cls.courseCode}</strong>
                        <span className="text-slate-700">{cls.courseName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-2 mt-0.5">
                        <span>{cls.date}</span>
                        {cls.room && <span>• {cls.room}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 border border-slate-200 uppercase">
                      {cls.verificationMethod?.replace('_', ' ') || 'Turnstile'}
                    </span>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 border ${
                      cls.status === 'present' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : cls.status === 'absent' 
                        ? 'bg-rose-50 text-rose-800 border-rose-300' 
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {cls.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content: Assignments */}
        {activeTab === 'assignments' && (
          <div className="p-3 bg-white divide-y divide-slate-100">
            {(!telemetry.recentAssignments || telemetry.recentAssignments.length === 0) ? (
              <div className="py-6 text-center text-xs text-slate-500 font-mono">
                No recent assignment records logged.
              </div>
            ) : (
              telemetry.recentAssignments.map((asg) => (
                <div key={asg.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2.5">
                    {asg.status === 'submitted_on_time' && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                    {asg.status === 'overdue_missing' && <AlertOctagon className="h-4 w-4 text-rose-600 shrink-0" />}
                    {asg.status === 'submitted_late' && <Clock className="h-4 w-4 text-amber-600 shrink-0" />}
                    {asg.status === 'upcoming' && <Clock className="h-4 w-4 text-slate-400 shrink-0" />}

                    <div>
                      <div className="flex items-center space-x-2">
                        <strong className="text-slate-900 font-mono">{asg.courseCode}</strong>
                        <span className="text-slate-800">{asg.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-2 mt-0.5">
                        <span>Due: {asg.dueDate}</span>
                        {asg.submittedAt && <span className="text-indigo-700">• Submitted: {asg.submittedAt}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {asg.grade && (
                      <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 border border-slate-200">
                        {asg.grade}
                      </span>
                    )}
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 border ${
                      asg.status === 'submitted_on_time' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : asg.status === 'overdue_missing' 
                        ? 'bg-rose-50 text-rose-800 border-rose-300' 
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {asg.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Counselor Telemetry Testing / Simulation Controls */}
      <div className="p-3 bg-slate-50 border border-slate-200 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-800 font-heading">Interactive Telemetry Verification: </span>
            <span className="text-slate-500 font-mono text-[11px]">
              Simulate campus RFID gate scan or LMS sync to test flagging logic
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              disabled={simulating}
              onClick={() => handleSimulateAttendance('absent')}
              className="px-2.5 py-1 text-[11px] font-mono font-bold bg-white text-rose-700 border border-rose-300 hover:bg-rose-50 transition-colors"
            >
              + Log Missed Class (RFID)
            </button>
            <button
              disabled={simulating}
              onClick={handleSimulateMissingAssignment}
              className="px-2.5 py-1 text-[11px] font-mono font-bold bg-white text-amber-700 border border-amber-300 hover:bg-amber-50 transition-colors"
            >
              + Log Overdue Work (LMS)
            </button>
            <button
              disabled={simulating}
              onClick={() => handleSimulateAttendance('present')}
              className="px-2.5 py-1 text-[11px] font-mono font-bold bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              + Log Class Attended
            </button>
          </div>
        </div>

        {simulationMessage && (
          <div className="mt-2 p-2 bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] font-mono flex items-center space-x-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
            <span>{simulationMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
