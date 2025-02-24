-- Function to create a comment vote
create or replace function create_comment_vote(
  comment_id uuid,
  voter_signature text,
  voter_address text
) returns void as $$
begin
  -- Insert the vote record
  insert into comment_votes (comment_id, voter_signature, voter_address)
  values (comment_id, voter_signature, voter_address);
  
  -- Increment the vote count
  update comments
  set votes = votes + 1
  where id = comment_id;
end;
$$ language plpgsql;

-- Function to remove a comment vote
create or replace function remove_comment_vote(
  comment_id uuid,
  voter_address text
) returns void as $$
begin
  -- Delete the vote record
  delete from comment_votes
  where comment_id = $1 and voter_address = $2;
  
  -- Decrement the vote count
  update comments
  set votes = votes - 1
  where id = comment_id;
end;
$$ language plpgsql;