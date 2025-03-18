create table public.users (
  id uuid default uuid_generate_v4() primary key,
  wallet_address text unique not null,
  username text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_login timestamp with time zone,
  avatar_url text
);

-- Set up RLS (Row Level Security)
alter table public.users enable row level security;

-- Create policies
create policy "Users can read their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id); 