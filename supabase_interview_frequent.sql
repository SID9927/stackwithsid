-- ==============================================================================
-- ADD FREQUENT TOGGLE SUPPORT
-- ==============================================================================

-- 1. Add the is_frequent column
ALTER TABLE public.interview_questions ADD COLUMN IF NOT EXISTS is_frequent BOOLEAN DEFAULT false;

-- 2. Optional: Mark some existing ones as frequent for testing
-- UPDATE public.interview_questions SET is_frequent = true WHERE difficulty = 'Beginner' LIMIT 5;
