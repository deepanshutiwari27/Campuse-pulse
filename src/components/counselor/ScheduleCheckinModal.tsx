import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Check } from 'lucide-react';
import { StudentCounselorProfile } from '../../types';
import { DataService } from '../../lib/supabase';

interface ScheduleCheckinModalProps {
  student: StudentCounselorProfile;
  anonymousMode: boolean;
  onClose: () => void;
  onConfirm: (slotId: string, notes?: string) => void;
}

export const ScheduleCheckinModal: React.FC<ScheduleCheckinModalProps> = ({
  student,
  anonymousMode,
  onClose,
  onConfirm,
}) => {
  const slots = DataService.getAppointmentSlots().filter(s => s.available);
  const [selectedSlotId, setSelectedSlotId] = useState<string>(slots[0]?.id || '');
  const [inviteNote, setInviteNote] = useState(
    "Hi there, I noticed your recent check-in indicated a high-pressure week with disrupted sleep. I'd love to offer a low-pressure, 20-minute consultation to help break down workload or just listen."
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-700">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-heading">Schedule Confidential Check-in</h3>
              <p className="text-xs font-mono text-slate-500">
                Outreach for: {anonymousMode ? student.anonymousId : student.name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-700 border border-transparent hover:border-slate-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          
          <div>
            <label className="block font-bold text-slate-800 mb-2 font-heading">
              Select Available Counseling Slot
            </label>
            <div className="space-y-2">
              {slots.length === 0 ? (
                <div className="p-3 bg-slate-50 border border-slate-200 text-slate-500 font-mono">
                  No slots currently open.
                </div>
              ) : (
                slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`w-full p-3 border text-left flex items-center justify-between transition-all ${
                      selectedSlotId === slot.id
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium'
                        : 'border-slate-200 hover:border-slate-400 bg-white text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center space-x-2 font-heading">
                        <span>{slot.date} at {slot.time}</span>
                        <span className="text-[11px] font-mono text-slate-500">({slot.counselorName})</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 flex items-center space-x-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        <span>{slot.roomOrVirtual}</span>
                      </div>
                    </div>
                    {selectedSlotId === slot.id && (
                      <div className="h-5 w-5 bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1 font-heading">
              Confidential Invitation Message (Non-Stigmatizing)
            </label>
            <textarea
              rows={4}
              value={inviteNote}
              onChange={(e) => setInviteNote(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none"
            />
            <p className="text-[11px] font-mono text-slate-400 mt-1">
              Students receive this as an optional, supportive invitation in their CampusPulse portal.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!selectedSlotId}
            onClick={() => onConfirm(selectedSlotId, inviteNote)}
            className="px-4 py-1.5 text-xs font-semibold bg-[#0f172a] hover:bg-indigo-700 text-white border border-slate-800 disabled:opacity-50 transition-colors"
          >
            Confirm &amp; Send Outreach
          </button>
        </div>

      </div>
    </div>
  );
};
