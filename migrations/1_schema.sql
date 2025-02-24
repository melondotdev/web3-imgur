-- Enable the extension for UUID generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the posts table
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  username text NOT NULL,
  image_url text NOT NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  votes integer DEFAULT 0
);

-- Enable RLS on posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read posts
CREATE POLICY "Public: read posts" ON posts
  FOR SELECT
  USING (true);

-- Allow service role to perform all operations on posts
CREATE POLICY "Service: full access on posts" ON posts
  FOR ALL
  TO service_role
  USING (true);

-- Create the comments table with a foreign key to posts
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read comments
CREATE POLICY "Public: read comments" ON comments
  FOR SELECT
  USING (true);

-- Allow service role to perform all operations on comments
CREATE POLICY "Service: full access on comments" ON comments
  FOR ALL
  TO service_role
  USING (true);
