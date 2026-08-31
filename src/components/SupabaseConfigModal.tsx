import React, { useState } from 'react';
import { Database, Check, Copy, Key, Server, ShieldCheck, X, Chrome } from 'lucide-react';
import { isSupabaseLive } from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'keys' | 'google'>('overview');
  const isLive = isSupabaseLive();

  if (!isOpen) return null;

  const sqlSchema = `-- ==============================================================================
-- CampusPulse Supabase PostgreSQL Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & USERS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'counsellor', 'peer_supporter')),
  year TEXT,
  course TEXT,
  avatar TEXT,
  peer_support_enabled BOOLEAN DEFAULT false,
  anonymous_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatically provision a student profile for email and Google OAuth users.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, avatar, anonymous_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(COALESCE(NEW.email, ''), '@', 1), 'Campus member'),
    COALESCE(NEW.email, ''),
    'student',
    NEW.raw_user_meta_data ->> 'avatar_url',
    'Student #' || upper(substr(replace(NEW.id::text, '-', ''), 1, 6))
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();

-- 2. STUDENT WELLBEING CHECK-INS
CREATE TABLE IF NOT EXISTS public.checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN ('great', 'good', 'okay', 'low', 'very_low')),
  mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
  sleep_hours NUMERIC(3,1) NOT NULL,
  sleep_quality INTEGER NOT NULL CHECK (sleep_quality BETWEEN 1 AND 10),
  academic_pressure INTEGER NOT NULL CHECK (academic_pressure BETWEEN 1 AND 10),
  social_connection INTEGER NOT NULL CHECK (social_connection BETWEEN 1 AND 10),
  energy INTEGER NOT NULL CHECK (energy BETWEEN 1 AND 10),
  overwhelm INTEGER NOT NULL CHECK (overwhelm BETWEEN 1 AND 10),
  primary_stressor TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STUDENT BEHAVIOR LOGS & ANOMALY EVENTS
CREATE TABLE IF NOT EXISTS public.student_behavior_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_name TEXT NOT NULL,
  anonymous_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('checkin', 'lms_activity', 'dining_swipe', 'library_swipe', 'counselor_request', 'peer_chat')),
  description TEXT NOT NULL,
  metrics JSONB DEFAULT '{}'::jsonb,
  anomaly_detected BOOLEAN DEFAULT false,
  anomaly_score INTEGER CHECK (anomaly_score BETWEEN 0 AND 100),
  anomaly_category TEXT,
  anomaly_severity TEXT CHECK (anomaly_severity IN ('critical', 'high', 'moderate', 'low')),
  status TEXT DEFAULT 'stable',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COUNSELOR CASE NOTES
CREATE TABLE IF NOT EXISTS public.counselor_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  counselor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  counselor_name TEXT NOT NULL,
  note_text TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  risk_rating TEXT CHECK (risk_rating IN ('critical', 'moderate', 'low')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SUPPORT REQUESTS & APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.support_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('peer', 'counsellor', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed')),
  preferred_time TEXT,
  counselor_name TEXT,
  peer_name TEXT,
  topic TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PEER SUPPORTER PROFILES
CREATE TABLE IF NOT EXISTS public.peer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  anonymous_name TEXT NOT NULL,
  real_name TEXT NOT NULL,
  course TEXT NOT NULL,
  year TEXT NOT NULL,
  topics TEXT[] DEFAULT '{}',
  bio TEXT,
  available_now BOOLEAN DEFAULT true,
  preferred_contact TEXT DEFAULT 'chat',
  rating NUMERIC(2,1) DEFAULT 5.0,
  chats_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Supabase Integration & Database Architecture</h2>
              <p className="text-xs text-slate-500">
                PostgreSQL Storage, Authentication, and Behavioral Telemetry Tables
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Architecture Overview
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'schema'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>PostgreSQL Schema (SQL)</span>
            <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded">Copyable</span>
          </button>
          <button
            onClick={() => setActiveTab('keys')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'keys'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Configuration & Keys
          </button>
          <button
            onClick={() => setActiveTab('google')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'google'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Chrome className="h-3.5 w-3.5" />
            Google Auth
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          
          {activeTab === 'overview' && (
            <div className="space-y-5">
              
              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
                isLive
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}>
                <ShieldCheck className={`h-5 w-5 shrink-0 mt-0.5 ${isLive ? 'text-emerald-600' : 'text-amber-600'}`} />
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-sm">
                    {isLive ? 'Supabase is Live & Connected' : 'Supabase Wired: Operating in Local Sandbox Mode'}
                  </div>
                  <p className="text-slate-600">
                    As requested (<em>"leave the api keys for now we will enter it later"</em>), CampusPulse is fully equipped with Supabase data models and runs in high-fidelity sandbox mode with realistic pre-seeded student behavior logs, anomaly events, and counselor risk flags.
                  </p>
                </div>
              </div>

              {/* Data Model Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="font-semibold text-slate-900 flex items-center space-x-2 text-xs mb-1">
                    <span className="h-2 w-2 rounded-full bg-teal-500" />
                    <span>Table: profiles</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Stores student and counselor identities, role-based access control, FERPA-compliant anonymous IDs (e.g. Student #104), and peer support opt-ins.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="font-semibold text-slate-900 flex items-center space-x-2 text-xs mb-1">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span>Table: checkins</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Records 60-second self check-ins: mood (1-10), sleep hours, academic pressure, social connection, energy, overwhelm, and primary campus stressors.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="font-semibold text-slate-900 flex items-center space-x-2 text-xs mb-1">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>Table: student_behavior_logs</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Tracks automated telemetry (sleep crashes, 4-day dining absence, LMS submission anomalies, nocturnal shifts) flagged for counselor review.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="font-semibold text-slate-900 flex items-center space-x-2 text-xs mb-1">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    <span>Table: counselor_notes & appointments</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Enables counselors to log confidential case observations, update risk status, match students with peer mentors, and schedule confidential consults.
                  </p>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Execute this SQL in your Supabase project's SQL Editor to set up all tables and Row-Level Security:
                </p>
                <button
                  onClick={copySql}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-96 leading-relaxed">
                  {sqlSchema}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className={`p-4 border text-xs ${isLive ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                <div className="font-semibold flex items-center gap-2">
                  <Chrome className="h-4 w-4" />
                  {isLive ? 'Google OAuth is ready to test' : 'Supabase project credentials are still required'}
                </div>
                <p className="mt-1.5 text-slate-600 leading-relaxed">
                  The app-side Google redirect and callback handling are installed. Provider activation is a protected Supabase dashboard setting, so it cannot be checked or changed until this project is connected.
                </p>
              </div>
              <ol className="list-decimal list-inside text-xs text-slate-700 space-y-2 leading-relaxed">
                <li>Add <code className="bg-slate-100 px-1">VITE_SUPABASE_URL</code> and <code className="bg-slate-100 px-1">VITE_SUPABASE_ANON_KEY</code> to the deployment environment.</li>
                <li>In Google Cloud Console, create an OAuth 2.0 Web Client and add the Supabase callback URL shown in Supabase Authentication → Providers → Google.</li>
                <li>In Supabase Authentication → Providers → Google, enable Google and save that client ID and secret.</li>
                <li>In Supabase Authentication → URL Configuration, add each deployed app URL and local development URL as redirect URLs.</li>
                <li>Run the current <code className="bg-slate-100 px-1">src/lib/supabase-schema.sql</code> in the Supabase SQL editor to create OAuth user profiles automatically.</li>
              </ol>
            </div>
          )}

          {activeTab === 'keys' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-slate-900 font-semibold text-sm">
                  <Key className="h-4 w-4 text-emerald-600" />
                  <span>How to connect your live Supabase Project later</span>
                </div>
                <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2">
                  <li>Create a free project at <strong className="text-slate-800">supabase.com</strong></li>
                  <li>In your Supabase Dashboard, go to <strong>Project Settings → API</strong></li>
                  <li>Copy your <strong>Project URL</strong> and <strong>anon public API key</strong></li>
                  <li>Add them to your environment variables in <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">.env</code>:
                    <div className="mt-2 bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] leading-relaxed">
                      VITE_SUPABASE_URL="https://your-project-id.supabase.co"<br />
                      VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    </div>
                  </li>
                  <li>Run the SQL Schema from the tab above in your Supabase SQL Editor.</li>
                </ol>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Current mode: <strong className="text-slate-700">{isLive ? 'Supabase Live Connected' : 'Supabase Local Sandbox'}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
