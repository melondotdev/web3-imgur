-- Enable RLS on comment_votes table
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting votes
CREATE POLICY "Anyone can insert comment votes"
ON comment_votes
FOR INSERT
TO public
WITH CHECK (true);

-- Create policy for selecting votes
CREATE POLICY "Anyone can view comment votes"
ON comment_votes
FOR SELECT
TO public
USING (true);

-- Create policy for deleting votes
CREATE POLICY "Users can delete their own votes"
ON comment_votes
FOR DELETE
TO public
USING (voter_address = current_user);

-- Grant usage on the functions
GRANT EXECUTE ON FUNCTION create_comment_vote TO public;
GRANT EXECUTE ON FUNCTION remove_comment_vote TO public;