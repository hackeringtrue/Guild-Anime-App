-- Ensure required extension for gen_random_uuid()
create extension if not exists "pgcrypto";

-- Profiles table (if not using auth.users public metadata)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_profiles_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where t.tgname = 'profiles_set_updated'
      and c.relname = 'profiles'
      and n.nspname = 'public'
  ) then
    create trigger profiles_set_updated
    before update on public.profiles
    for each row execute function public.handle_profiles_updated_at();
  end if;
end $$;

alter table public.profiles enable row level security;

-- RLS: users can read their own profile and public fields
create policy "Profiles: read own" on public.profiles
  for select
  using (auth.uid() = id);

create policy "Profiles: insert self" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Profiles: update self" on public.profiles
  for update using (auth.uid() = id);

-- Content table
create type public.content_type as enum ('movie','anime');

create table if not exists public.content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type public.content_type not null default 'movie',
  year int,
  poster text,
  banner text,
  preview_url text,
  description text,
  tags text[] default '{}',
  premium_only boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.content enable row level security;

-- Public read for all content rows
create policy "Content: public read" on public.content
  for select using (true);

-- Admin write policies (replace with your admin role if needed)
-- Option 1: Enable writes only for service role (recommended from server)
create policy "Content: service role write" on public.content
  for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Option 2: If you want to allow writes to a specific admin user id(s):
-- create policy "Content: admin write" on public.content for all
--   using (auth.uid() in ('<ADMIN-USER-ID>')) with check (auth.uid() in ('<ADMIN-USER-ID>'));

-- Storage buckets
-- Create a bucket named 'media' for posters, banners, previews
insert into storage.buckets (id, name, public) values ('media','media', true)
on conflict (id) do nothing;

-- Storage policies: public read
create policy "Storage: public read media" on storage.objects
  for select using (bucket_id = 'media');

-- Storage write: service role only by default
create policy "Storage: service write media" on storage.objects
  for all using (bucket_id = 'media' and auth.role() = 'service_role')
  with check (bucket_id = 'media' and auth.role() = 'service_role');
