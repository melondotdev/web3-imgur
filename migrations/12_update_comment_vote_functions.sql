-- Update create_comment_vote function to be SECURITY DEFINER
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update remove_comment_vote function to use explicit table references
CREATE OR REPLACE FUNCTION remove_comment_vote(
  comment_id UUID,
  voter_address TEXT
) RETURNS VOID AS $$
BEGIN
  -- Delete the vote record
  DELETE FROM comment_votes
  WHERE comment_votes.comment_id = remove_comment_vote.comment_id 
    AND comment_votes.voter_address = remove_comment_vote.voter_address;
  
  -- Decrement the vote count
  UPDATE comments
  SET votes = votes - 1
  WHERE comments.id = remove_comment_vote.comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;