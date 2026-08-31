-- ==============================================================================
-- CampusPulse Supabase PostgreSQL Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'counsellor', 'peer_supporter', 'admin')),
  year TEXT,
  course TEXT,
  avatar TEXT,
  peer_support_enabled BOOLEAN DEFAULT false,
  anonymous_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a least-privilege student profile whenever an OAuth provider (such as
-- Google) creates a user. Counselor and peer roles must be assigned by a
-- trusted administrator after signup; they are never accepted from OAuth data.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, avatar, anonymous_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(COALESCE(NEW.email, ''), '@', 1), 'Campus member'),
    COALESCE(NEW.email, ''),
    'student',
    NEW.raw_user_meta_data ->> 'avatar_url',
    'Student #' || upper(substr(replace(NEW.id::text, '-', ''), 1, 6))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();

-- 2. STUDENT WELLBEING CHECK-INS TABLE
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

-- 3. STUDENT BEHAVIOR LOGS & ANOMALY EVENTS TABLE
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
  anomaly_details JSONB,
  status TEXT DEFAULT 'stable' CHECK (status IN ('needs_follow_up', 'peer_support_suggested', 'contact_requested', 'reviewed', 'stable')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COUNSELOR CASE NOTES & ANOMALY REVIEWS
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

-- 5. SUPPORT REQUESTS & COUNSELOR APPOINTMENTS
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
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_behavior_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_profiles ENABLE ROW LEVEL SECURITY;

-- POLICIES:
-- This helper keeps privileged access decisions on the database rather than in
-- the browser route. It must only ever read the authenticated user's profile.
CREATE OR REPLACE FUNCTION public.is_care_team()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('counsellor', 'admin')
  );
$$;

-- 1. Students can manage only their own check-ins; care team members can read them.
CREATE POLICY "Students can access their own checkins" 
  ON public.checkins FOR ALL 
  USING (auth.uid() = user_id OR public.is_care_team())
  WITH CHECK (auth.uid() = user_id);

-- 2. Counselors can view student checkins and behavior logs
CREATE POLICY "Counselors can view all logs" 
  ON public.student_behavior_logs FOR SELECT 
  USING (public.is_care_team());

-- 3. Counselors can manage notes
CREATE POLICY "Counselors can manage notes" 
  ON public.counselor_notes FOR ALL 
  USING (public.is_care_team())
  WITH CHECK (public.is_care_team());

-- 4. Public profiles readable by authenticated users
CREATE POLICY "Members can read permitted profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_care_team());
