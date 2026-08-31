import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Star, 
  Send, 
  ShieldCheck, 
  Clock, 
  Coffee, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { PeerSupporter } from '../../types';
import { DataService } from '../../lib/supabase';

export const PeerSupportView: React.FC = () => {
  const peerList = DataService.getPeerSupporters();
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [activeChatPeer, setActiveChatPeer] = useState<PeerSupporter | null>(null);
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'peer'; text: string; time: string }[]>([
    {
      sender: 'peer',
      text: "Hey! I'm Maya. I'm a junior studying psych. If discrete math or campus adjustment is stressing you out, I'm here. How's your week going?",
      time: 'Just now',
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const topics = ['All', 'First-Year Adjustment', 'Stress & Overwhelm', 'STEM Burnout', 'Exam Anxiety', 'Loneliness & Social Connection'];

  const filteredPeers = peerList.filter(p => {
    if (selectedTopic === 'All') return true;
    return p.topics.some(t => t.toLowerCase().includes(selectedTopic.toLowerCase()));
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChatPeer) return;

    const userMsg = inputMessage.trim();
    const newHistory = [
      ...chatMessages,
      { sender: 'user' as const, text: userMsg, time: 'Just now' }
    ];
    setChatMessages(newHistory);
    setInputMessage('');

    // Simulate warm, peer response
    setTimeout(() => {
      let reply = "I totally get that feeling. In my freshman year, I hit the exact same wall around midterms. Want to grab 10 minutes at the campus cafe or just keep chatting here?";
      if (userMsg.toLowerCase().includes('sleep') || userMsg.toLowerCase().includes('tired')) {
        reply = "Sleep debt is brutal on concentration. Please don't pull another all-nighter tonight—your brain retains way more with even 5 hours of rest. Have you considered asking your professor for a 24h extension?";
      } else if (userMsg.toLowerCase().includes('math') || userMsg.toLowerCase().includes('code')) {
        reply = "Computer Science weed-out projects can make you feel like everyone else understands it and you're the only one stuck. But trust me, 80% of the lab is feeling the same way!";
      }

      setChatMessages(prev => [
        ...prev,
        { sender: 'peer' as const, text: reply, time: 'Just now' }
      ]);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner - Geometric Balance Panel */}
      <div className="bg-[#0f172a] border border-slate-800 p-6 sm:p-7 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-heading">Anonymous Peer Support</h2>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                <span className="h-1.5 w-1.5 bg-emerald-400 animate-pulse" />
                <span>3 ACTIVE ONLINE</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Trained upperclass peers who've navigated heavy workloads, exam burnout, and campus adjustment. Initial connections are completely anonymous.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700 p-3 flex items-center space-x-2.5 text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="font-mono text-[11px]">FERPA Compliant • Mutual Anonymity</span>
          </div>
        </div>

        {/* Topic Filter Chips */}
        <div className="mt-5 flex flex-wrap items-center gap-1.5 pt-4 border-t border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 mr-1">TOPIC:</span>
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-2.5 py-1 text-xs font-mono transition-all border ${
                selectedTopic === topic
                  ? 'bg-white text-slate-900 font-bold border-white'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-700'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Supporters List + Chat Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Peer Supporters Cards */}
        <div className={`space-y-3 ${activeChatPeer ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
          <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between font-heading">
            <span>Available Peer Supporters ({filteredPeers.length})</span>
            <span className="text-xs font-mono text-slate-500">Tap to start conversation</span>
          </h3>

          <div className={`grid gap-3 ${activeChatPeer ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
            {filteredPeers.map((peer) => {
              const isSelected = activeChatPeer?.id === peer.id;

              return (
                <div
                  key={peer.id}
                  className={`bg-white border p-4 transition-all flex flex-col justify-between ${
                    isSelected ? 'border-indigo-600 bg-indigo-50/10' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs font-mono border border-indigo-200">
                          {peer.realName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 font-heading">{peer.anonymousName}</h4>
                          <p className="text-xs font-mono text-slate-500">{peer.year} • {peer.course}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 text-xs text-amber-600 font-mono font-bold">
                        <Star className="h-3 w-3 fill-amber-500" />
                        <span>{peer.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 mt-2.5 leading-relaxed">
                      "{peer.bio}"
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {peer.topics.map((t) => (
                        <span key={t} className="px-1.5 py-0.2 text-[10px] font-mono uppercase bg-slate-100 text-slate-700 border border-slate-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 flex items-center space-x-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      <span>{peer.chatsCount} chats supported</span>
                    </span>

                    <button
                      onClick={() => {
                        setActiveChatPeer(peer);
                        setChatMessages([
                          {
                            sender: 'peer',
                            text: `Hi! I'm ${peer.realName.split(' ')[0]}. Here to listen and help brainstorm practical next steps for your week. What's on your mind?`,
                            time: 'Just now'
                          }
                        ]);
                      }}
                      className="px-3 py-1 bg-[#0f172a] hover:bg-indigo-700 text-white text-xs font-semibold border border-slate-800 flex items-center space-x-1 transition-colors"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Start Chat</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Anonymous Chat Window */}
        {activeChatPeer && (
          <div className="lg:col-span-2 bg-white border border-slate-200 flex flex-col h-[520px] overflow-hidden">
            
            {/* Chat Header */}
            <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 bg-indigo-700 text-white font-bold flex items-center justify-center text-xs font-mono">
                  {activeChatPeer.realName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-xs text-slate-900 font-heading">{activeChatPeer.anonymousName}</h4>
                    <span className="h-1.5 w-1.5 bg-emerald-500" />
                  </div>
                  <p className="text-[10px] font-mono text-slate-500">
                    {activeChatPeer.course} • Anonymous Connection
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveChatPeer(null)}
                  className="text-xs font-mono text-slate-500 hover:text-slate-900 px-2 py-1 border border-slate-300 bg-white"
                >
                  Close Chat
                </button>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
              <div className="text-center my-1">
                <span className="bg-slate-200 text-slate-800 px-2.5 py-0.5 text-[10px] font-mono border border-slate-300">
                  ANONYMOUS PEER CHAT • FERPA SAFE &amp; CONFIDENTIAL
                </span>
              </div>

              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md p-3 border text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#0f172a] text-white border-slate-800'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className={`block text-[9px] font-mono mt-1 ${
                      msg.sender === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                    }`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-2.5 border-t border-slate-200 bg-white flex items-center space-x-2">
              <input
                type="text"
                placeholder={`Send anonymous message to ${activeChatPeer.anonymousName.split(' ')[0]}...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold border border-indigo-700 disabled:opacity-40 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>

          </div>
        )}

      </div>

    </div>
  );
};
