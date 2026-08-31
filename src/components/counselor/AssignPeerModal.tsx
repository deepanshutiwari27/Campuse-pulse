import React, { useState } from 'react';
import { X, UserPlus, Check, Star } from 'lucide-react';
import { StudentCounselorProfile } from '../../types';
import { DataService } from '../../lib/supabase';

interface AssignPeerModalProps {
  student: StudentCounselorProfile;
  anonymousMode: boolean;
  onClose: () => void;
  onConfirm: (peerName: string) => void;
}

export const AssignPeerModal: React.FC<AssignPeerModalProps> = ({
  student,
  anonymousMode,
  onClose,
  onConfirm,
}) => {
  const peers = DataService.getPeerSupporters();
  const [selectedPeer, setSelectedPeer] = useState<string>(peers[0]?.realName || '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-700">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-heading">Assign Campus Peer Supporter</h3>
              <p className="text-xs font-mono text-slate-500">
                Match for: {anonymousMode ? student.anonymousId : student.name}
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
          <p className="text-slate-600">
            Select a trained student peer supporter who shares academic focus, course year, or coping strategies:
          </p>

          <div className="space-y-2">
            {peers.map((peer) => (
              <button
                key={peer.id}
                onClick={() => setSelectedPeer(peer.realName)}
                className={`w-full p-3 border text-left flex items-start justify-between transition-all ${
                  selectedPeer === peer.realName
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium'
                    : 'border-slate-200 hover:border-slate-400 bg-white text-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 font-heading">{peer.realName}</span>
                    <span className="text-slate-500 font-mono text-[11px]">({peer.course})</span>
                    <span className="flex items-center text-amber-600 font-mono text-[10px]">
                      <Star className="h-3 w-3 fill-amber-500 mr-0.5" />
                      {peer.rating}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">{peer.bio}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {peer.topics.map(t => (
                      <span key={t} className="bg-slate-100 text-slate-700 text-[10px] font-mono uppercase px-1.5 py-0.2 border border-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedPeer === peer.realName && (
                  <div className="h-5 w-5 bg-indigo-600 text-white flex items-center justify-center shrink-0 ml-2">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            <strong>Privacy Guarantee:</strong> Peer connections are mediated through CampusPulse anonymous messaging unless both students explicitly opt into in-person introductions.
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
            onClick={() => onConfirm(selectedPeer)}
            className="px-4 py-1.5 text-xs font-semibold bg-[#0f172a] hover:bg-indigo-700 text-white border border-slate-800 transition-colors"
          >
            Assign Peer &amp; Notify
          </button>
        </div>

      </div>
    </div>
  );
};
