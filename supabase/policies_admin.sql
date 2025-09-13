-- Admin policies for content + storage (client-side writes)
-- Replace only if your admin user ID changes.

-- Ensure required extension for gen_random_uuid()
create extension if not exists "pgcrypto";

-- Create enum + table if they do not exist
create type if not exists public.content_type as enum ('movie','anime');

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

-- Enable RLS and public read policy
alter table public.content enable row level security;

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'content' and policyname = 'Content: public read'
  ) then
    drop policy "Content: public read" on public.content;
  end if;
  create policy "Content: public read" on public.content for select using (true);
end $$;

-- Ensure 'media' bucket exists
insert into storage.buckets (id, name, public)
values ('media','media', true)
on conflict (id) do nothing;

-- Content: allow writes for the specified admin user
-- Admin: insert/update/delete as separate policies
do $$
begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='content' and policyname='Content: admin insert') then
    drop policy "Content: admin insert" on public.content;
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='content' and policyname='Content: admin update') then
    drop policy "Content: admin update" on public.content;
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='content' and policyname='Content: admin delete') then
    drop policy "Content: admin delete" on public.content;
  end if;

  create policy "Content: admin insert" on public.content
  for insert with check (auth.uid() = 'f6111366-cba9-43af-bac5-2dc119742839');

  create policy "Content: admin update" on public.content
  for update using (auth.uid() = 'f6111366-cba9-43af-bac5-2dc119742839')
  with check (auth.uid() = 'f6111366-cba9-43af-bac5-2dc119742839');

  create policy "Content: admin delete" on public.content
  for delete using (auth.uid() = 'f6111366-cba9-43af-bac5-2dc119742839');
end $$;

-- Storage: allow admin user to write to 'media' bucket
do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Storage: admin write media'
  ) then
    drop policy "Storage: admin write media" on storage.objects;
  end if;

  create policy "Storage: admin write media" on storage.objects
  for all
  using (
    bucket_id = 'media'
    and auth.uid() = 'f6111366-cba9-43af-bac5-2dc119742839'
  )
  with check (
    bucket_id = 'media'
    and auth.uid() = 'f6111366-cba9-43af-bac5-2dc119742839'
  );
end $$;

-- Note:
-- - Policies are ORed together. Keeping service_role-only policies is fine; this adds an admin exception.
-- - After changing policies or app_metadata, sign out/in in the app to refresh your JWT.
