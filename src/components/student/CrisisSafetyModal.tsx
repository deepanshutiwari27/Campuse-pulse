import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Users, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { CAMPUS_CRISIS_CONTACTS } from '../../data/mockData';

interface CrisisSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrisisSafetyModal: React.FC<CrisisSafetyModalProps> = ({ isOpen, onClose }) => {
  const [locationShared, setLocationShared] = useState(false);
  const [friendAlerted, setFriendAlerted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 flex items-center justify-center p-4">
      <div className="bg-white max-w-xl w-full border border-rose-300 shadow-2xl flex flex-col">
        
        {/* Escalation Banner */}
        <div className="p-5 sm:p-6 bg-rose-950 text-white border-b border-rose-800 flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            <div className="p-2 bg-rose-900 border border-rose-700 text-white shrink-0 mt-0.5">
              <ShieldAlert className="h-5 w-5 text-rose-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-heading tracking-tight">
                Immediate Crisis &amp; Safety Escalation
              </h2>
              <p className="text-xs text-rose-200 mt-1 leading-relaxed font-sans">
                If you are experiencing acute distress, panic, or feel unsafe, direct confidential support is available 24/7.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-rose-300 hover:text-white border border-transparent hover:border-rose-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Contacts Grid */}
        <div className="p-5 sm:p-6 space-y-4 text-slate-800 text-xs">
          
          <div className="space-y-2.5">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-heading flex items-center space-x-2">
              <Phone className="h-3.5 w-3.5 text-rose-600" />
              <span>Direct Emergency &amp; Crisis Helplines</span>
            </h3>

            <div className="space-y-2">
              {CAMPUS_CRISIS_CONTACTS.map((c) => (
                <div
                  key={c.name}
                  className="p-3 border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-xs font-heading">{c.name}</span>
                      <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 border border-rose-300">
                        {c.badge}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{c.description}</p>
                    <div className="text-xs font-mono font-bold text-rose-800 mt-0.5">
                      {c.number}
                    </div>
                  </div>

                  <a
                    href={`tel:${c.number.replace(/[^0-9]/g, '')}`}
                    className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold border border-rose-800 shrink-0 flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>{c.actionText}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Safety Actions */}
          <div className="pt-3 border-t border-slate-200">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-heading mb-2">
              Support Network &amp; Campus Escort
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              
              {/* Contact a Trusted Person */}
              <button
                onClick={() => setFriendAlerted(true)}
                className={`p-2.5 border text-left flex items-start space-x-2.5 transition-all ${
                  friendAlerted ? 'bg-indigo-50 border-indigo-400 text-indigo-950' : 'bg-slate-50 border-slate-200 hover:border-slate-400 text-slate-800'
                }`}
              >
                <Users className="h-4 w-4 shrink-0 mt-0.5 text-indigo-700" />
                <div>
                  <div className="font-bold text-xs font-heading">Contact Trusted Peer</div>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    {friendAlerted ? 'Alert drafted to designated contact.' : 'Send pre-written check-in message.'}
                  </p>
                </div>
              </button>

              {/* Share My Campus Location */}
              <button
                onClick={() => setLocationShared(true)}
                className={`p-2.5 border text-left flex items-start space-x-2.5 transition-all ${
                  locationShared ? 'bg-indigo-50 border-indigo-400 text-indigo-950' : 'bg-slate-50 border-slate-200 hover:border-slate-400 text-slate-800'
                }`}
              >
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <div className="font-bold text-xs font-heading">Request Safe Escort</div>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    {locationShared ? 'Campus Escort dispatched.' : 'Share location with Safety Patrol.'}
                  </p>
                </div>
              </button>

            </div>
          </div>

          {/* Ethical Disclaimer */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 leading-relaxed">
            <strong>CampusPulse Protocol:</strong> AI systems do not provide medical care or crisis therapy. During acute crises, human clinical counselors are immediately prioritized.
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            Available 24 hours / 7 days.
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-[#0f172a] hover:bg-indigo-700 text-white text-xs font-semibold border border-slate-800 transition-colors"
          >
            I Understand / Close
          </button>
        </div>

      </div>
    </div>
  );
};
