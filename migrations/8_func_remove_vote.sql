create or replace function remove_vote(
  post_id uuid,
  voter_address text
)
returns void
language plpgsql
security definer
as $$
begin
  -- Delete vote record
  delete from post_votes
  where post_votes.post_id = remove_vote.post_id 
  and post_votes.voter_address = remove_vote.voter_address;

  -- Decrement post votes
  update posts
  set votes = votes - 1
  where posts.id = remove_vote.post_id;
end;
$$;