import React, { useState, useEffect } from 'react';
import { X, Wind, Heart, RotateCcw } from 'lucide-react';

interface ResetBreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetBreathingModal: React.FC<ResetBreathingModalProps> = ({ isOpen, onClose }) => {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [secondsLeft, setSecondsLeft] = useState<number>(4);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || !isActive) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Switch phase
          setPhase((currentPhase) => {
            if (currentPhase === 'Inhale') return 'Hold';
            if (currentPhase === 'Hold') return 'Exhale';
            if (currentPhase === 'Exhale') return 'Rest';
            setCyclesCompleted((c) => c + 1);
            return 'Inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isActive]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full border border-slate-300 shadow-2xl flex flex-col text-center">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm font-heading">
            <Wind className="h-4 w-4 text-indigo-600" />
            <span>2-Minute Somatic Reset (Box Breathing)</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-700 border border-transparent hover:border-slate-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Visual Animation Circle / Geometric Box */}
        <div className="p-6 sm:p-8 flex flex-col items-center justify-center space-y-5">
          <div className="relative flex items-center justify-center h-44 w-44">
            
            {/* Animated expanding outer geometric box */}
            <div 
              className={`absolute border border-indigo-300 transition-all duration-1000 ease-in-out ${
                phase === 'Inhale' 
                  ? 'h-40 w-40 bg-indigo-50/80 scale-105' 
                  : phase === 'Hold' 
                  ? 'h-40 w-40 bg-indigo-100/60 scale-105 border-indigo-400' 
                  : phase === 'Exhale' 
                  ? 'h-28 w-28 bg-slate-100 scale-95 border-slate-300' 
                  : 'h-28 w-28 bg-slate-50 scale-90 border-slate-200'
              }`} 
            />

            {/* Inner Core Box */}
            <div className="relative z-10 flex flex-col items-center justify-center h-28 w-28 bg-[#0f172a] text-white border border-slate-800 shadow-md">
              <span className="text-xs uppercase tracking-widest font-mono font-bold text-indigo-300">{phase}</span>
              <span className="text-3xl font-heading font-extrabold mt-0.5">{secondsLeft}s</span>
            </div>

          </div>

          <div>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Box breathing down-regulates sympathetic nervous system activation and reduces acute stress hormone spikes.
            </p>
            <div className="mt-2.5 inline-flex items-center space-x-1.5 text-[11px] font-mono font-semibold text-indigo-900 bg-indigo-50 px-2.5 py-1 border border-indigo-200">
              <Heart className="h-3 w-3 text-rose-600 fill-rose-600" />
              <span>CYCLES COMPLETED: {cyclesCompleted}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsActive(!isActive)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
            >
              {isActive ? 'Pause' : 'Resume'}
            </button>

            <button
              onClick={() => {
                setPhase('Inhale');
                setSecondsLeft(4);
                setCyclesCompleted(0);
                setIsActive(true);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 hover:bg-slate-100 flex items-center space-x-1 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-center">
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-[#0f172a] hover:bg-indigo-700 text-white text-xs font-semibold border border-slate-800 transition-colors"
          >
            Finished Reset
          </button>
        </div>

      </div>
    </div>
  );
};
