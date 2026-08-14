-- ============================================================
-- Marks Entry — Supabase database setup
-- Run this once: Supabase dashboard → SQL Editor → New query → paste → Run.
-- ============================================================

-- 1) Projects table (one row per saved workbook)
create table if not exists public.projects (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name       text not null,
  file_path  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Row Level Security: every user can see ONLY their own projects
alter table public.projects enable row level security;
drop policy if exists "own_select" on public.projects;
drop policy if exists "own_insert" on public.projects;
drop policy if exists "own_update" on public.projects;
drop policy if exists "own_delete" on public.projects;
create policy "own_select" on public.projects for select using  (user_id = auth.uid());
create policy "own_insert" on public.projects for insert with check (user_id = auth.uid());
create policy "own_update" on public.projects for update using  (user_id = auth.uid());
create policy "own_delete" on public.projects for delete using  (user_id = auth.uid());

-- 3) Enforce a maximum of 3 projects per user
create or replace function public.enforce_project_limit()
returns trigger language plpgsql security definer as $$
begin
  if (select count(*) from public.projects where user_id = new.user_id) >= 3 then
    raise exception 'Project limit reached (maximum 3). Delete a project first.';
  end if;
  return new;
end; $$;
drop trigger if exists project_limit on public.projects;
create trigger project_limit before insert on public.projects
  for each row execute function public.enforce_project_limit();

-- 4) Private storage bucket that holds each project's .xlsx
insert into storage.buckets (id, name, public)
  values ('workbooks','workbooks',false)
  on conflict (id) do nothing;

-- 5) Storage RLS: a user can read/write only files inside their own user-id folder
drop policy if exists "own_files" on storage.objects;
create policy "own_files" on storage.objects for all
  using      (bucket_id = 'workbooks' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'workbooks' and (storage.foldername(name))[1] = auth.uid()::text);

-- Done. Free tier gives you 500MB database + 1GB file storage — plenty for a few workbooks.
