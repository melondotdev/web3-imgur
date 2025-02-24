create table post_votes (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade,
  voter_address text not null,
  created_at timestamp with time zone default now(),
  unique(post_id, voter_address)
);