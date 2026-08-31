import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  BookOpen, 
  Calendar, 
  Coffee, 
  Clock,
  ShieldCheck
} from 'lucide-react';
import { UserProfile } from '../../types';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onOpenWorkload: () => void;
  onOpenBreathing: () => void;
  onOpenCounselor: () => void;
}

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  suggestedAction?: {
    label: string;
    actionType: 'workload' | 'breathing' | 'counselor';
  };
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenWorkload,
  onOpenBreathing,
  onOpenCounselor,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: `Hi ${currentUser.name.split(' ')[0]}! I'm your CampusPulse Academic & Wellbeing Navigator. I noticed your recent check-in showed high academic workload and reduced sleep. How can I help you tackle today?`,
      suggestedAction: {
        label: '📚 Break Down an Overwhelming Assignment',
        actionType: 'workload',
      }
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let reply = "I hear you. When deadlines stack up, everything feels urgent all at once. Let's pick just ONE deliverable to focus on for the next 25 minutes.";
      let action: ChatMessage['suggestedAction'] = undefined;

      const lower = userText.toLowerCase();
      if (lower.includes('sleep') || lower.includes('tired') || lower.includes('exhausted') || lower.includes('can\'t sleep')) {
        reply = "Pulling back-to-back late nights actually cuts problem-solving speed by nearly 40%. Even taking a 2-minute breathing reset right now can reset your nervous system.";
        action = { label: '🧘 Start 2-Minute Box Breathing', actionType: 'breathing' };
      } else if (lower.includes('panic') || lower.includes('scared') || lower.includes('failing') || lower.includes('counselor')) {
        reply = "You don't have to carry this distress by yourself. Our Campus Counseling Center has slots open tomorrow with Dr. Aris Thorne. Would you like to reserve a 20-minute consult?";
        action = { label: '🧑‍⚕️ View Counseling Center Slots', actionType: 'counselor' };
      } else if (lower.includes('math') || lower.includes('assignment') || lower.includes('project') || lower.includes('homework')) {
        reply = "Let's de-escalate this assignment together. Instead of trying to finish the entire project tonight, we can break it into 3 micro-sprints with built-in breaks.";
        action = { label: '📚 Open Workload De-Escalator', actionType: 'workload' };
      }

      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: reply, suggestedAction: action }
      ]);
    }, 900);
  };

  const handleActionClick = (actionType: 'workload' | 'breathing' | 'counselor') => {
    if (actionType === 'workload') onOpenWorkload();
    if (actionType === 'breathing') onOpenBreathing();
    if (actionType === 'counselor') onOpenCounselor();
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-300 flex flex-col">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#0f172a] text-white border border-slate-800">
            <Bot className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="font-bold text-slate-900 text-sm font-heading">CampusPulse Companion</h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 font-mono font-bold">
                NAVIGATOR
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-500">
              Academic de-escalation &amp; wellness navigation
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

      {/* Safety Notice Banner */}
      <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-[10px] font-mono text-slate-600 flex items-center space-x-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
        <span>NON-CLINICAL SUPPORT • Actionable stress reduction, not therapy.</span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs text-slate-800 bg-[#fdfdfd]">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 border ${
                m.sender === 'user'
                  ? 'bg-[#0f172a] text-white border-slate-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-800 shadow-xs'
              }`}
            >
              <p className="leading-relaxed font-sans">{m.text}</p>
            </div>

            {/* Quick Action Button */}
            {m.suggestedAction && (
              <button
                onClick={() => handleActionClick(m.suggestedAction!.actionType)}
                className="mt-1.5 text-xs font-bold font-mono text-indigo-700 bg-indigo-50 border border-indigo-300 hover:bg-indigo-100 px-2.5 py-1 transition-colors flex items-center space-x-1"
              >
                <span>{m.suggestedAction.label}</span>
              </button>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono">
            <span className="h-1.5 w-1.5 bg-indigo-500 animate-bounce" />
            <span className="h-1.5 w-1.5 bg-indigo-500 animate-bounce delay-100" />
            <span className="h-1.5 w-1.5 bg-indigo-500 animate-bounce delay-200" />
            <span>CampusPulse is analyzing...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 bg-white border-t border-slate-200 flex items-center space-x-1.5 overflow-x-auto text-[11px] font-mono">
        <button
          onClick={() => setInput("I'm completely overwhelmed by assignments.")}
          className="shrink-0 bg-slate-50 hover:bg-slate-100 text-slate-700 px-2 py-1 border border-slate-200"
        >
          "Overwhelmed"
        </button>
        <button
          onClick={() => setInput("I haven't been sleeping well this week.")}
          className="shrink-0 bg-slate-50 hover:bg-slate-100 text-slate-700 px-2 py-1 border border-slate-200"
        >
          "Can't sleep"
        </button>
        <button
          onClick={() => setInput("How do I book a counselor appointment?")}
          className="shrink-0 bg-slate-50 hover:bg-slate-100 text-slate-700 px-2 py-1 border border-slate-200"
        >
          "Counselor slots"
        </button>
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-slate-50 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Ask for workload planning, somatic reset, or resources..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 bg-white border border-slate-300 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2 bg-[#0f172a] hover:bg-indigo-700 text-white text-xs font-semibold border border-slate-800 disabled:opacity-40 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

    </div>
  );
};
