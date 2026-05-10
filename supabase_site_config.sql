-- ==============================================================================
-- SITE CONFIGURATION TABLE
-- ==============================================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.site_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- 3. Policies
DROP POLICY IF EXISTS "Allow public read of site config" ON public.site_config;
CREATE POLICY "Allow public read of site config" ON public.site_config
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated all on site config" ON public.site_config;
CREATE POLICY "Allow authenticated all on site config" ON public.site_config
    FOR ALL USING (auth.role() = 'authenticated');

-- 4. Initial seed for general settings
INSERT INTO public.site_config (key, value)
VALUES ('general', '{
    "site_name": "StackWithSid",
    "site_description": "Master the stack with Sid. Premium dev articles, interview prep, and tech guides.",
    "contact_email": "hello@stackwithsid.com",
    "github_url": "https://github.com/your-username",
    "linkedin_url": "https://linkedin.com/in/your-profile",
    "twitter_url": "https://twitter.com/your-handle"
}')
ON CONFLICT (key) DO NOTHING;
