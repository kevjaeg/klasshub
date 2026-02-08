-- SchoolHub Database Schema
-- Run this in your Supabase SQL Editor (supabase.com/dashboard → SQL Editor)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Children table: stores info about each child linked to a parent
create table public.children (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  school_name text not null,
  webuntis_school text, -- WebUntis school short name
  webuntis_server text, -- WebUntis server (e.g., "neilo.webuntis.com")
  class_name text,
  last_synced_at timestamptz,
  created_at timestamptz default now() not null
);

-- Lessons table: timetable entries for each child
create table public.lessons (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  subject text not null,
  teacher text,
  room text,
  day_of_week integer not null, -- 1=Monday, 5=Friday
  lesson_number integer not null,
  start_time time not null,
  end_time time not null,
  synced_at timestamptz default now() not null
);

-- Substitutions table: changes to the regular timetable
create table public.substitutions (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  date date not null,
  lesson_number integer not null,
  original_subject text,
  new_subject text,
  original_teacher text,
  new_teacher text,
  new_room text,
  type text not null check (type in ('cancelled', 'substituted', 'room_change', 'other')),
  info_text text,
  synced_at timestamptz default now() not null
);

-- Create indexes for performance
create index idx_children_user_id on public.children(user_id);
create index idx_lessons_child_id on public.lessons(child_id);
create index idx_substitutions_child_id_date on public.substitutions(child_id, date);

-- Row Level Security (RLS) - CRITICAL for DSGVO compliance
-- Users can only see their own data

alter table public.children enable row level security;
alter table public.lessons enable row level security;
alter table public.substitutions enable row level security;

-- Children: users can only CRUD their own children
create policy "Users can view own children"
  on public.children for select
  using (auth.uid() = user_id);

create policy "Users can insert own children"
  on public.children for insert
  with check (auth.uid() = user_id);

create policy "Users can update own children"
  on public.children for update
  using (auth.uid() = user_id);

create policy "Users can delete own children"
  on public.children for delete
  using (auth.uid() = user_id);

-- Lessons: users can only see lessons of their own children
create policy "Users can view lessons of own children"
  on public.lessons for select
  using (
    exists (
      select 1 from public.children
      where children.id = lessons.child_id
      and children.user_id = auth.uid()
    )
  );

create policy "Users can insert lessons for own children"
  on public.lessons for insert
  with check (
    exists (
      select 1 from public.children
      where children.id = lessons.child_id
      and children.user_id = auth.uid()
    )
  );

create policy "Users can delete lessons of own children"
  on public.lessons for delete
  using (
    exists (
      select 1 from public.children
      where children.id = lessons.child_id
      and children.user_id = auth.uid()
    )
  );

-- Substitutions: same pattern
create policy "Users can view substitutions of own children"
  on public.substitutions for select
  using (
    exists (
      select 1 from public.children
      where children.id = substitutions.child_id
      and children.user_id = auth.uid()
    )
  );

create policy "Users can insert substitutions for own children"
  on public.substitutions for insert
  with check (
    exists (
      select 1 from public.children
      where children.id = substitutions.child_id
      and children.user_id = auth.uid()
    )
  );

create policy "Users can delete substitutions of own children"
  on public.substitutions for delete
  using (
    exists (
      select 1 from public.children
      where children.id = substitutions.child_id
      and children.user_id = auth.uid()
    )
  );
