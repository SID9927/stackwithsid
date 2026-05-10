-- ==============================================================================
-- ADD SLUG SUPPORT TO INTERVIEW QUESTIONS
-- ==============================================================================

-- 1. Add the slug column
ALTER TABLE public.interview_questions ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 2. Generate slugs for existing questions
-- This uses a regex to lowercase and replace non-alphanumeric characters with hyphens
UPDATE public.interview_questions 
SET slug = lower(regexp_replace(question, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- 3. Trim hyphens from ends
UPDATE public.interview_questions
SET slug = trim(both '-' from slug)
WHERE slug LIKE '-%' OR slug LIKE '%-';

-- 4. Handle duplicates (if any) by appending ID fragment
UPDATE public.interview_questions q1
SET slug = slug || '-' || left(id::text, 4)
WHERE EXISTS (
    SELECT 1 FROM public.interview_questions q2 
    WHERE q1.id <> q2.id AND q1.slug = q2.slug
);
