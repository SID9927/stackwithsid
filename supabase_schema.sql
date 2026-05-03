-- ==============================================================================
-- DATABASE SCHEMA SCRIPT FOR STACKWITHSID
-- Run this script in your Supabase SQL Editor.
-- ==============================================================================

-- 1. Create the function to automatically update 'updated_at' timestamps
-- This handles your requirement: "when i modify time that and not and also"
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. ARTICLES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    excerpt TEXT,
    published BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for articles to auto-update 'updated_at'
CREATE TRIGGER update_articles_modtime
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published articles
CREATE POLICY "Public can view published articles" 
ON public.articles FOR SELECT 
USING (published = true);

-- Allow authenticated users (Admins) to do everything
CREATE POLICY "Admins can manage all articles" 
ON public.articles FOR ALL 
USING (auth.role() = 'authenticated');

-- ==============================================================================
-- 3. INTERVIEW QUESTIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT,
    hiring_insight TEXT,
    difficulty TEXT DEFAULT 'Beginner',
    stack TEXT DEFAULT 'React',
    company TEXT,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for interview_questions to auto-update 'updated_at'
CREATE TRIGGER update_interview_modtime
BEFORE UPDATE ON public.interview_questions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for interview_questions
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published questions
CREATE POLICY "Public can view published interview questions" 
ON public.interview_questions FOR SELECT 
USING (published = true);

-- Allow authenticated users (Admins) to do everything
CREATE POLICY "Admins can manage all interview questions" 
ON public.interview_questions FOR ALL 
USING (auth.role() = 'authenticated');
