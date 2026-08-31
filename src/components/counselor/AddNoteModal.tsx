import React, { useState } from 'react';
import { X, FileText, AlertCircle } from 'lucide-react';
import { StudentCounselorProfile } from '../../types';

interface AddNoteModalProps {
  student: StudentCounselorProfile;
  anonymousMode: boolean;
  onClose: () => void;
  onConfirm: (noteText: string, actionTaken: string, riskRating: 'critical' | 'moderate' | 'low') => void;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  student,
  anonymousMode,
  onClose,
  onConfirm,
}) => {
  const [noteText, setNoteText] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [riskRating, setRiskRating] = useState<'critical' | 'moderate' | 'low'>('moderate');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    onConfirm(noteText.trim(), actionTaken.trim(), riskRating);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-700">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-heading">Confidential Case Note</h3>
              <p className="text-xs font-mono text-slate-500">
                Log entry for: {anonymousMode ? student.anonymousId : student.name}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-slate-700">
          
          <div>
            <label className="block font-bold text-slate-800 mb-1 font-heading">
              Clinical / Behavioral Observation Note *
            </label>
            <textarea
              required
              rows={4}
              placeholder="E.g., Student has experienced a severe 3-day sleep drop accompanying exam pressure. Reached out with low-pressure coffee check-in invitation."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1 font-heading">
              Action Taken or Follow-up Plan
            </label>
            <input
              type="text"
              placeholder="E.g., Sent calendar invite, coordinated with Academic Resource Center"
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1 font-heading">
              Counselor Assessed Risk Rating
            </label>
            <select
              value={riskRating}
              onChange={(e) => setRiskRating(e.target.value as 'critical' | 'moderate' | 'low')}
              className="w-full p-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 font-mono focus:bg-white focus:border-indigo-600"
            >
              <option value="critical">Critical (Immediate follow-up scheduled)</option>
              <option value="moderate">Moderate (Monitoring & peer support suggested)</option>
              <option value="low">Low (Standard campus pacing)</option>
            </select>
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-950 flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-indigo-700" />
            <span>
              Notes are stored securely in Supabase with counselor-level RLS encryption. Students are never shown clinical diagnostic labels.
            </span>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!noteText.trim()}
              className="px-4 py-1.5 text-xs font-semibold bg-[#0f172a] hover:bg-indigo-700 text-white border border-slate-800 disabled:opacity-50 transition-colors"
            >
              Save Case Note
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
