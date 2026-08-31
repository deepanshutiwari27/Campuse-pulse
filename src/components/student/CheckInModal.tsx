import React, { useState } from 'react';
import { X, Sparkles, Check, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { MoodType, CheckIn } from '../../types';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSubmit: (checkinData: Omit<CheckIn, 'id' | 'createdAt'>) => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSubmit,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [mood, setMood] = useState<MoodType>('okay');
  const [moodScore, setMoodScore] = useState<number>(5);
  const [sleepHours, setSleepHours] = useState<number>(5.5);
  const [sleepQuality, setSleepQuality] = useState<number>(5);
  const [academicPressure, setAcademicPressure] = useState<number>(8);
  const [socialConnection, setSocialConnection] = useState<number>(4);
  const [energy, setEnergy] = useState<number>(4);
  const [overwhelm, setOverwhelm] = useState<number>(7);
  const [primaryStressor, setPrimaryStressor] = useState<string>('Workload & Deadlines');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const moodOptions: { type: MoodType; label: string; emoji: string; score: number; color: string }[] = [
    { type: 'great', label: 'Great', emoji: '😄', score: 9, color: 'hover:border-emerald-500 hover:bg-emerald-50' },
    { type: 'good', label: 'Good', emoji: '🙂', score: 7, color: 'hover:border-teal-500 hover:bg-teal-50' },
    { type: 'okay', label: 'Okay', emoji: '😐', score: 5, color: 'hover:border-blue-500 hover:bg-blue-50' },
    { type: 'low', label: 'Low', emoji: '😔', score: 3, color: 'hover:border-amber-500 hover:bg-amber-50' },
    { type: 'very_low', label: 'Very Low', emoji: '😞', score: 2, color: 'hover:border-rose-500 hover:bg-rose-50' },
  ];

  const stressors = [
    'Workload & Deadlines',
    'Exams & Midterms',
    'Sleep & Exhaustion',
    'Loneliness & Friends',
    'Finances & Jobs',
    'Family & Home',
    'Imposter Syndrome',
    'None / In the groove'
  ];

  const handleFinish = () => {
    onSubmit({
      userId,
      mood,
      moodScore,
      sleepHours,
      sleepQuality,
      academicPressure,
      socialConnection,
      energy,
      overwhelm,
      primaryStressor,
      notes: notes.trim() ? notes.trim() : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl flex flex-col">
        
        {/* Header with 60-Second Badge */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-700">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-sm font-heading">60-Second Wellbeing Check-in</h3>
                <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2">
                  STEP {step} / 3
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-500">
                Calibrates against your individual baseline
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

        {/* Progress Bar */}
        <div className="h-1 w-full bg-slate-200">
          <div 
            className="h-1 bg-indigo-600 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Body Content by Step */}
        <div className="p-5 sm:p-6 space-y-5 text-slate-800">
          
          {/* STEP 1: Mood & Sleep */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 font-heading mb-2.5">
                  How are you feeling overall today?
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {moodOptions.map((opt) => (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => {
                        setMood(opt.type);
                        setMoodScore(opt.score);
                      }}
                      className={`p-2.5 border flex flex-col items-center justify-center transition-all ${
                        mood === opt.type
                          ? 'border-indigo-600 bg-indigo-50/70 font-semibold'
                          : 'border-slate-200 bg-white hover:border-slate-400'
                      }`}
                    >
                      <span className="text-xl mb-1">{opt.emoji}</span>
                      <span className="text-[11px] font-mono text-slate-800">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep Hours Slider */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 font-heading">
                    How many hours of sleep did you get last night?
                  </label>
                  <span className={`text-xs font-mono font-bold ${sleepHours < 5 ? 'text-rose-600' : 'text-indigo-700'}`}>
                    {sleepHours} hours
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>0 hrs (All-nighter)</span>
                  <span>6 hrs</span>
                  <span>10+ hrs</span>
                </div>
              </div>

              {/* Energy Level Slider */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 font-heading">
                    Current energy level
                  </label>
                  <span className="text-xs font-mono font-bold text-slate-800">{energy} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energy}
                  onChange={(e) => setEnergy(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Workload, Overwhelm & Social */}
          {step === 2 && (
            <div className="space-y-4">
              
              {/* Academic Pressure */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 font-heading">
                    How heavy does your academic pressure feel right now?
                  </label>
                  <span className={`text-xs font-mono font-bold ${academicPressure >= 8 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {academicPressure} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={academicPressure}
                  onChange={(e) => setAcademicPressure(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>1 (Manageable)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Overwhelming)</span>
                </div>
              </div>

              {/* Overwhelm level */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 font-heading">
                    Overwhelm level
                  </label>
                  <span className={`text-xs font-mono font-bold ${overwhelm >= 8 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {overwhelm} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={overwhelm}
                  onChange={(e) => setOverwhelm(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Social Connection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 font-heading">
                    How connected do you feel to friends or peers?
                  </label>
                  <span className={`text-xs font-mono font-bold ${socialConnection <= 3 ? 'text-amber-600' : 'text-slate-800'}`}>
                    {socialConnection} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={socialConnection}
                  onChange={(e) => setSocialConnection(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>1 (Isolated)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Connected)</span>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: Primary Stressor & Optional Note */}
          {step === 3 && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-900 font-heading mb-2">
                  What is affecting you most right now?
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {stressors.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPrimaryStressor(s)}
                      className={`p-2 text-xs text-left font-mono border transition-all ${
                        primaryStressor === s
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold'
                          : 'border-slate-200 text-slate-700 hover:border-slate-400 bg-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 font-heading mb-1">
                  Confidential notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="E.g., multiple deadlines due this week, feel like I'm falling behind..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="p-2.5 bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-900 flex items-center space-x-2 font-mono">
                <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>
                  Calculated against your individual baseline over the past 14 days.
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 flex items-center space-x-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-300 transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-3.5 py-1.5 bg-[#0f172a] hover:bg-indigo-700 text-white text-xs font-semibold border border-slate-800 flex items-center space-x-1.5 transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold border border-indigo-700 flex items-center space-x-1.5 transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Complete Check-in</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
