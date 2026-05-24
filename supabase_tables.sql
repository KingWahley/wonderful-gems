-- SQL Script to create tables for Form Submissions
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  package TEXT,
  destinations TEXT,
  dates TEXT,
  budget TEXT,
  message TEXT,
  status TEXT DEFAULT 'new', -- 'new', 'read', 'replied'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) for private traveler details
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to allow safe, idempotent reruns
DROP POLICY IF EXISTS "Allow public insert to inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow admin full access to inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow local dev read/write to inquiries" ON inquiries;

-- Policy: Allow travelers (anyone) to send inquiries
CREATE POLICY "Allow public insert to inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

-- Policy: Allow authenticated admin users full access
CREATE POLICY "Allow admin full access to inquiries" ON inquiries
  FOR ALL TO authenticated USING (true);

-- Explicitly grant table permissions to the public role (required for Stitch proxies and any connection role)
GRANT ALL ON inquiries TO public;

-- Policy (DEVELOPMENT ONLY): If you do not have Supabase Auth set up in your CMS yet,
-- you can uncomment the policy below to allow local reads/management without logging in.
-- REMOVE OR DISABLE THIS POLICY BEFORE GOING TO PRODUCTION!
-- CREATE POLICY "Allow local dev read/write to inquiries" ON inquiries
--   FOR ALL TO anon USING (true);


-- 2. Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to allow safe reruns
DROP POLICY IF EXISTS "Allow public insert to newsletter_subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow admin full access to newsletter_subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow local dev read/write to newsletter_subscribers" ON newsletter_subscribers;

-- Policy: Allow anyone to subscribe
CREATE POLICY "Allow public insert to newsletter_subscribers" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Policy: Allow authenticated admins full access
CREATE POLICY "Allow admin full access to newsletter_subscribers" ON newsletter_subscribers
  FOR ALL TO authenticated USING (true);

-- Explicitly grant table permissions to standard Supabase roles and the public role (required for Stitch proxies and custom connection roles)
GRANT ALL ON newsletter_subscribers TO public;

-- Policy (DEVELOPMENT ONLY): Uncomment to allow local CMS reads/deletes without Auth
-- CREATE POLICY "Allow local dev read/write to newsletter_subscribers" ON newsletter_subscribers
--   FOR ALL TO anon USING (true);

