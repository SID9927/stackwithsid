-- ==============================================================================
-- ADD INTERACTION TABLES FOR INTERVIEW QUESTIONS
-- ==============================================================================

-- 1. INTERVIEW LIKES TABLE
CREATE TABLE IF NOT EXISTS public.interview_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.interview_questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(question_id, user_id)
);

ALTER TABLE public.interview_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view interview likes" 
ON public.interview_likes FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can toggle their own interview likes" 
ON public.interview_likes FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. INTERVIEW BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.interview_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.interview_questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(question_id, user_id)
);

ALTER TABLE public.interview_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interview bookmarks" 
ON public.interview_bookmarks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own interview bookmarks" 
ON public.interview_bookmarks FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. INTERVIEW COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.interview_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.interview_questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.interview_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.interview_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view interview comments" 
ON public.interview_comments FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can post interview comments" 
ON public.interview_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update/delete their own interview comments" 
ON public.interview_comments FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
