-- Create comment_votes table
CREATE TABLE comment_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  voter_address TEXT NOT NULL,
  voter_signature TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(comment_id, voter_address)
);

-- Create index for faster lookups
CREATE INDEX comment_votes_comment_id_idx ON comment_votes(comment_id);
CREATE INDEX comment_votes_voter_address_idx ON comment_votes(voter_address);

-- Function to create a comment vote
CREATE OR REPLACE FUNCTION create_comment_vote(
  comment_id UUID,
  voter_signature TEXT,
  voter_address TEXT
) RETURNS VOID AS $$
BEGIN
  -- Insert the vote record
  INSERT INTO comment_votes (comment_id, voter_signature, voter_address)
  VALUES (comment_id, voter_signature, voter_address);
  
  -- Increment the vote count
  UPDATE comments
  SET votes = votes + 1
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to remove a comment vote
CREATE OR REPLACE FUNCTION remove_comment_vote(
  comment_id UUID,
  voter_address TEXT
) RETURNS VOID AS $$
BEGIN
  -- Delete the vote record
  DELETE FROM comment_votes
  WHERE comment_id = $1 AND voter_address = $2;
  
  -- Decrement the vote count
  UPDATE comments
  SET votes = votes - 1
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;