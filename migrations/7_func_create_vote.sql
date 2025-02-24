create or replace function create_vote(
  post_id uuid,
  voter_signature text,
  voter_address text
)
returns void
language plpgsql
security definer
as $$
begin
  -- Insert vote record
  insert into post_votes (post_id, voter_address)
  values (post_id, voter_address);

  -- Increment post votes
  update posts
  set votes = votes + 1
  where id = post_id;
end;
$$;