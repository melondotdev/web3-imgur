-- Enable the uuid-ossp extension if it's not already enabled
create extension if not exists "uuid-ossp";

-- Create the posts table
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  wallet_address text not null,
  image_url text not null,
  comment text not null,
  created_at timestamptz not null default now()
);

-- Grant usage on the public schema to the service_role.
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant full privileges on all tables in the public schema to the service_role.
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Grant full privileges on all sequences in the public schema (for SERIAL columns) to the service_role.
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Disable Row Level Security on the analysis table.
ALTER TABLE public.analysis DISABLE ROW LEVEL SECURITY;