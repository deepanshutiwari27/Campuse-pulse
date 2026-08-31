import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';
import { CounselorAppointmentSlot } from '../../types';
import { DataService } from '../../lib/supabase';

interface CounselorBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  onBookSuccess: (slotText: string) => void;
}

export const CounselorBookingModal: React.FC<CounselorBookingModalProps> = ({
  isOpen,
  onClose,
  studentId,
  onBookSuccess,
}) => {
  const slots = DataService.getAppointmentSlots().filter(s => s.available);
  const [selectedSlotId, setSelectedSlotId] = useState<string>(slots[0]?.id || '');
  const [booked, setBooked] = useState<boolean>(false);
  const [bookedDetails, setBookedDetails] = useState<string>('');

  if (!isOpen) return null;

  const handleBook = async () => {
    if (!selectedSlotId) return;
    const slot = slots.find(s => s.id === selectedSlotId);
    if (!slot) return;

    await DataService.scheduleAppointment(studentId, selectedSlotId);
    const detail = `${slot.date} at ${slot.time} with ${slot.counselorName}`;
    setBookedDetails(detail);
    setBooked(true);
    onBookSuccess(detail);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-700">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-heading">Talk to a Campus Counselor</h3>
              <p className="text-[11px] font-mono text-slate-500">
                Confidential, no-cost consultations for registered students
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

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs text-slate-700">
          
          {booked ? (
            <div className="text-center py-6 space-y-3">
              <div className="h-12 w-12 bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 font-heading">
                Appointment Successfully Reserved!
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Your consultation is confirmed for <strong className="text-slate-900">{bookedDetails}</strong>. A calendar invite has been dispatched to your student email.
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-mono max-w-sm mx-auto">
                LOCATION: Campus Student Wellbeing Center, Room 204 (or secure Zoom link).
              </div>
              <button
                onClick={onClose}
                className="mt-3 px-5 py-1.5 bg-[#0f172a] hover:bg-indigo-700 text-white text-xs font-semibold border border-slate-800 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between bg-indigo-50/70 border border-indigo-200 p-2.5 text-indigo-950 font-mono text-xs">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 bg-emerald-600" />
                  <span className="font-bold">Next Available Consultation: Tomorrow — 11:30 AM</span>
                </div>
                <span className="text-[10px] font-bold bg-white border border-indigo-300 px-1.5 py-0.2">
                  FREE
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-800 font-heading mb-2">
                  Select an Available Counselor Slot:
                </label>
                <div className="space-y-2">
                  {slots.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSlotId(s.id)}
                      className={`w-full p-3 border text-left flex items-center justify-between transition-all ${
                        selectedSlotId === s.id
                          ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-medium'
                          : 'border-slate-200 hover:border-slate-400 bg-white text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold flex items-center space-x-2 font-heading">
                          <span>{s.date} at {s.time}</span>
                          <span className="text-slate-500 font-mono text-[11px]">({s.counselorName})</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 flex items-center space-x-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span>{s.roomOrVirtual}</span>
                        </div>
                        <div className="text-[10px] font-mono text-indigo-700 mt-0.5">
                          Specialty: {s.specialty}
                        </div>
                      </div>
                      {selectedSlotId === s.id && (
                        <div className="h-5 w-5 bg-indigo-600 text-white flex items-center justify-center shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 flex items-start space-x-2 text-[11px] font-mono text-slate-600">
                <ShieldCheck className="h-4 w-4 shrink-0 text-slate-700 mt-0.5" />
                <span>
                  All campus counseling consultations are strictly confidential under FERPA and clinical privacy standards.
                </span>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        {!booked && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!selectedSlotId}
              onClick={handleBook}
              className="px-4 py-1.5 bg-[#0f172a] hover:bg-indigo-700 text-white text-xs font-semibold border border-slate-800 disabled:opacity-50 transition-colors"
            >
              Confirm Appointment
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
