-- Create the tags table.
CREATE TABLE if not exists tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Generate a random UUID as the primary key.
  name TEXT NOT NULL UNIQUE,                       -- Unique tag name.
  created_at TIMESTAMPTZ DEFAULT now(),             -- Timestamp for when the tag was created.
  updated_at TIMESTAMPTZ DEFAULT now()              -- Timestamp for when the tag was last updated.
);

-- Create the post_tags join table.
CREATE TABLE if not exists post_tags (
  post_id UUID NOT NULL,       -- Foreign key to the posts table.
  tag_id UUID NOT NULL,        -- Foreign key to the tags table.
  created_at TIMESTAMPTZ DEFAULT now(),  -- Optional: record when the association was created.
  PRIMARY KEY (post_id, tag_id),         -- Composite primary key to avoid duplicate associations.
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
