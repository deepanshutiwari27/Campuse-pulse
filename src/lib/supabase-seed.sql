-- CampusPulse demo identities for Supabase Auth.
-- Run supabase-schema.sql first, then run this file in the Supabase SQL Editor.
-- These are development-only credentials; rotate or remove them before production.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  demo_user RECORD;
BEGIN
  FOR demo_user IN
    SELECT * FROM (VALUES
      ('11111111-1111-4111-8111-111111111111'::uuid, 'student.demo@campuspulse.test',    'Student2026!',   'Demo Student',     'student',        '2nd Year', 'B.S. Computer Science', 'Student #101'),
      ('22222222-2222-4222-8222-222222222222'::uuid, 'counsellor.demo@campuspulse.test', 'Counselor2026!', 'Demo Counsellor',  'counsellor',     NULL,       NULL,                    'Care Team #01'),
      ('33333333-3333-4333-8333-333333333333'::uuid, 'peer.demo@campuspulse.test',       'Peer2026!',       'Demo Peer Mentor', 'peer_supporter', '3rd Year', 'B.A. Psychology',       'Peer Mentor #01'),
      ('44444444-4444-4444-8444-444444444444'::uuid, 'admin.demo@campuspulse.test',      'Admin2026!',      'Demo Administrator','admin',         NULL,       NULL,                    'Admin #01')
    ) AS users(id, email, password, name, profile_role, year, course, anonymous_id)
  LOOP
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', demo_user.id, 'authenticated', 'authenticated',
      demo_user.email, crypt(demo_user.password, gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('name', demo_user.name), now(), now()
    ) ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, encrypted_password = EXCLUDED.encrypted_password,
      email_confirmed_at = now(), updated_at = now();

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
    VALUES (
      demo_user.id, demo_user.id,
      jsonb_build_object('sub', demo_user.id::text, 'email', demo_user.email, 'email_verified', true),
      'email', demo_user.email, now(), now()
    ) ON CONFLICT (provider, provider_id) DO UPDATE SET user_id = EXCLUDED.user_id, updated_at = now();

    INSERT INTO public.profiles (id, name, email, role, year, course, anonymous_id)
    VALUES (demo_user.id, demo_user.name, demo_user.email, demo_user.profile_role, demo_user.year, demo_user.course, demo_user.anonymous_id)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role,
      year = EXCLUDED.year, course = EXCLUDED.course, anonymous_id = EXCLUDED.anonymous_id,
      updated_at = now();
  END LOOP;
END $$;
