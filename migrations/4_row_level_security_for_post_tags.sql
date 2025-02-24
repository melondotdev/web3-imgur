-- Enable Row Level Security on the post_tags table
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- Create a policy to grant full access (SELECT, INSERT, UPDATE, DELETE) to service_role
CREATE POLICY "service_role_full_access_post_tags"
ON public.post_tags
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create a policy to grant read-only access (SELECT) to public (anon) users
CREATE POLICY "public_read_access_post_tags"
ON public.post_tags
FOR SELECT
TO public
USING (true);
