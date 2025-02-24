create or replace function increment_post_votes(
  post_id uuid,
  voter_signature text,
  voter_address text
)
returns void
language plpgsql
security definer
as $$
begin
  -- Here you might want to add signature verification logic
  -- and check if the user has already voted
  
  update posts
  set votes = votes + 1
  where id = post_id;
end;
$$;