import React from 'react';
import { 
  X, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Calendar, 
  UserPlus, 
  TrendingDown, 
  TrendingUp, 
  ShieldAlert,
  Activity,
  CheckCircle2,
  Flag
} from 'lucide-react';
import { StudentCounselorProfile } from '../../types';
import { AcademicTelemetryPanel } from './AcademicTelemetryPanel';

interface StudentDetailModalProps {
  student: StudentCounselorProfile;
  anonymousMode: boolean;
  onClose: () => void;
  onSchedule: () => void;
  onAssignPeer: () => void;
  onAddNote: () => void;
  onToggleSuspicious?: (studentId: string, isSuspicious: boolean, reason?: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  anonymousMode,
  onClose,
  onSchedule,
  onAssignPeer,
  onAddNote,
  onToggleSuspicious,
}) => {
  const isCritical = student.riskLevel === 'critical';
  const isHigh = student.riskLevel === 'high';

  // Compare deltas
  const sleepDelta = Number((student.currentCheckin.sleepHours - student.baseline.avgSleep).toFixed(1));
  const pressureDelta = Number((student.currentCheckin.academicPressure - student.baseline.avgAcademicPressure).toFixed(1));
  const overwhelmDelta = Number((student.currentCheckin.overwhelm - student.baseline.avgOverwhelm).toFixed(1));
  const socialDelta = Number((student.currentCheckin.socialConnection - student.baseline.avgSocialConnection).toFixed(1));
  const moodDelta = Number((student.currentCheckin.moodScore - student.baseline.avgMood).toFixed(1));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 flex items-center justify-center p-4">
      <div className="bg-white max-w-3xl w-full border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className={`p-5 sm:p-6 border-b flex items-start justify-between ${
          isCritical ? 'bg-rose-50 border-rose-200' : isHigh ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-start space-x-4">
            <div className="relative">
              {anonymousMode ? (
                <div className={`h-12 w-12 flex flex-col items-center justify-center font-mono font-bold text-xs border ${
                  isCritical ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}>
                  <span className="text-[9px] text-slate-500">ID</span>
                  <span>{student.anonymousId.replace('Student #', '#')}</span>
                </div>
              ) : (
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="h-12 w-12 object-cover border border-slate-300"
                />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
                  {anonymousMode ? student.anonymousId : student.name}
                </h2>
                <span className={`px-2 py-0.2 text-[10px] font-mono font-bold uppercase ${
                  isCritical ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {student.riskLevel} RISK
                </span>
                <span className="px-2 py-0.2 text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-300">
                  ANOMALY: {student.anomalyScore}/100
                </span>
                {student.isSuspicious && (
                  <span className="px-2 py-0.2 text-[10px] font-mono font-bold uppercase bg-rose-600 text-white border border-rose-700 flex items-center space-x-1">
                    <Flag className="h-3 w-3 inline" />
                    <span>FLAGGED SUSPICIOUS</span>
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-slate-500 mt-1">
                {student.year} • {student.course} • Last Check-in: {student.lastCheckinDate}
              </p>
              <p className="text-xs font-semibold text-rose-700 mt-1">
                Trigger: {student.primaryAnomaly}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onToggleSuspicious && (
              <button
                type="button"
                onClick={() => onToggleSuspicious(student.id, !student.isSuspicious, student.isSuspicious ? undefined : 'Flagged during clinical record review')}
                className={`px-2.5 py-1 text-xs font-semibold font-mono border transition-colors flex items-center space-x-1 ${
                  student.isSuspicious
                    ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Flag className="h-3.5 w-3.5" />
                <span>{student.isSuspicious ? 'Suspicious (Flagged)' : 'Flag Suspicious'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 border border-transparent hover:border-slate-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Suspicious Student Reason Callout Banner */}
        {student.isSuspicious && student.suspiciousReason && (
          <div className="bg-rose-50 border-b border-rose-300 px-5 py-3 text-xs flex items-start space-x-2.5">
            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-950 font-heading">Suspicious Student Anomaly Alert: </strong>
              <span className="text-rose-900">{student.suspiciousReason}</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          
          {/* Baseline vs Current Divergence */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading">
                Personal Baseline vs Current Telemetry
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                Baseline over {student.baseline.totalCheckinsCount} check-ins
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              {/* Sleep */}
              <div className="bg-slate-50 border border-slate-200 p-3 text-center">
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">Sleep Duration</div>
                <div className="text-lg font-bold font-heading text-slate-900 mt-0.5">
                  {student.currentCheckin.sleepHours} hrs
                </div>
                <div className={`text-[11px] font-mono font-semibold mt-0.5 flex items-center justify-center space-x-1 ${
                  sleepDelta < 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  {sleepDelta < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                  <span>{sleepDelta > 0 ? `+${sleepDelta}` : sleepDelta}h vs base ({student.baseline.avgSleep}h)</span>
                </div>
              </div>

              {/* Academic Pressure */}
              <div className="bg-slate-50 border border-slate-200 p-3 text-center">
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">Academic Pressure</div>
                <div className="text-lg font-bold font-heading text-slate-900 mt-0.5">
                  {student.currentCheckin.academicPressure} / 10
                </div>
                <div className={`text-[11px] font-mono font-semibold mt-0.5 flex items-center justify-center space-x-1 ${
                  pressureDelta > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  {pressureDelta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{pressureDelta > 0 ? `+${pressureDelta}` : pressureDelta} vs base ({student.baseline.avgAcademicPressure})</span>
                </div>
              </div>

              {/* Overwhelm */}
              <div className="bg-slate-50 border border-slate-200 p-3 text-center">
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">Reported Overwhelm</div>
                <div className="text-lg font-bold font-heading text-slate-900 mt-0.5">
                  {student.currentCheckin.overwhelm} / 10
                </div>
                <div className={`text-[11px] font-mono font-semibold mt-0.5 flex items-center justify-center space-x-1 ${
                  overwhelmDelta > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  <span>{overwhelmDelta > 0 ? `+${overwhelmDelta}` : overwhelmDelta} vs base ({student.baseline.avgOverwhelm})</span>
                </div>
              </div>

              {/* Social Connection */}
              <div className="bg-slate-50 border border-slate-200 p-3 text-center">
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">Social Connection</div>
                <div className="text-lg font-bold font-heading text-slate-900 mt-0.5">
                  {student.currentCheckin.socialConnection} / 10
                </div>
                <div className={`text-[11px] font-mono font-semibold mt-0.5 flex items-center justify-center space-x-1 ${
                  socialDelta < 0 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  <span>{socialDelta > 0 ? `+${socialDelta}` : socialDelta} vs base ({student.baseline.avgSocialConnection})</span>
                </div>
              </div>

            </div>

            {/* Student's Self-Reported Check-In Note */}
            {student.currentCheckin.notes && (
              <div className="mt-3 p-3 bg-amber-50 border-l-4 border-amber-500 border-t border-r border-b border-amber-200 text-xs">
                <span className="font-bold text-amber-950 font-heading">Student's Self-Reported Note: </span>
                <span className="italic text-amber-900">"{student.currentCheckin.notes}"</span>
                <div className="mt-1 text-[11px] font-mono text-amber-800">
                  Primary stressor: <strong>{student.currentCheckin.primaryStressor}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Academic Telemetry & Objective Sensor Records (Classes & Assignments) */}
          {student.academicTelemetry && (
            <AcademicTelemetryPanel
              telemetry={student.academicTelemetry}
              currentCheckin={student.currentCheckin}
              studentId={student.id}
              studentName={student.name}
            />
          )}

          {/* Chronological Behavioral Telemetry Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading mb-2.5">
              Behavioral Events &amp; Telemetry Timeline
            </h3>

            <div className="border border-slate-200 divide-y divide-slate-200">
              {student.recentLogs.map((log) => (
                <div key={log.id} className="p-3 flex items-start justify-between gap-3 bg-white hover:bg-slate-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className={`p-1.5 shrink-0 mt-0.5 border ${
                      log.anomalyDetected ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {log.anomalyDetected ? <AlertTriangle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs font-mono text-slate-900">{log.timestamp}</span>
                        <span className="uppercase text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 border border-slate-200">
                          {log.eventType.replace('_', ' ')}
                        </span>
                        {log.anomalyDetected && (
                          <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 border border-rose-300">
                            ANOMALY FLAGGED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-800 mt-1">{log.description}</p>
                      {log.anomalyDetails && (
                        <p className="text-[11px] font-mono text-rose-700 mt-0.5">
                          {log.anomalyDetails.description} ({log.anomalyDetails.baselineDelta})
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Counselor Case Notes History */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading">
                Counselor Case Notes &amp; Interventions ({student.counselorNotes?.length || 0})
              </h3>
              <button
                onClick={onAddNote}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900"
              >
                + Add Case Note
              </button>
            </div>

            {(!student.counselorNotes || student.counselorNotes.length === 0) ? (
              <div className="p-3 bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-mono">
                No counselor notes recorded yet. Add an initial assessment note above.
              </div>
            ) : (
              <div className="space-y-2">
                {student.counselorNotes.map((note) => (
                  <div key={note.id} className="p-3 bg-indigo-50/40 border border-indigo-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950 font-heading">{note.counselorName}</span>
                      <span className="text-slate-500 font-mono text-[10px]">{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-800 mt-1">{note.noteText}</p>
                    {note.actionTaken && (
                      <div className="mt-1 text-indigo-900 text-[11px]">
                        <strong>Action taken: </strong>{note.actionTaken}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-mono text-slate-500">
            STATUS: <strong className="text-slate-800 uppercase">{student.status.replace(/_/g, ' ')}</strong>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onAssignPeer}
              className="px-3 py-1.5 text-xs font-semibold bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 transition-colors flex items-center space-x-1.5"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Assign Peer Mentor</span>
            </button>

            <button
              onClick={onSchedule}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#0f172a] hover:bg-indigo-700 text-white border border-slate-800 transition-colors flex items-center space-x-1.5"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Schedule Outreach</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
