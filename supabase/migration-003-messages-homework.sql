-- Migration 003: Messages + Homework tables
-- Adds support for school messages and homework assignments

-- Messages table: notifications/messages from the school platform
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  external_id text,
  title text not null,
  body text not null default '',
  sender text,
  date timestamptz not null default now(),
  read boolean not null default false,
  synced_at timestamptz default now() not null
);

-- Homework table: assignments from the school platform
create table public.homework (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  external_id text,
  subject text not null,
  description text not null default '',
  due_date date not null,
  completed boolean not null default false,
  synced_at timestamptz default now() not null
);

-- Indexes
create index idx_messages_child_id on public.messages(child_id);
create index idx_homework_child_id on public.homework(child_id);

-- Row Level Security
alter table public.messages enable row level security;
alter table public.homework enable row level security;

-- Messages RLS policies
create policy "Users can view messages of own children"
  on public.messages for select
  using (
    exists (
      select 1 from public.children
      where children.id = messages.child_id
      and children.user_id = auth.uid()
    )
  );

create policy "Users can insert messages for own children"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.children
      where children.id = messages.child_id
      and children.user_id = auth.uid()
    )
  );

create policy "Users can update messages of own children"
  on public.messages for update
  using (
    exists (
      select 1 from public.children
      where children.id = messages.child_id
      and children.user_id = auth.uid()
    )
  );

create policy "Users can delete messages of own children"
  on public.messages for delete
  using (
    exists (
      select 1 from public.children
      where children.id = messages.child_id
      and children.user_id = auth.uid()
    )
  );

-- Homework RLS policies
create policy "Users can view homework of own children"
  on public.homework for select
  using (
    exists (
      select 1 from public.children
      where children.id = homework.child_id
      and children.user_id = auth.uid()
    )
  );

create policy "Users can insert homework for own children"
  on public.homework for insert
  with check (
    exists (
      select 1 from public.children
      where children.id = homework.child_id
      and children.user_id = auth.uid()
    )
  );

create policy "Users can update homework of own children"
  on public.homework for update
  using (
    exists (
      select 1 from public.children
      where children.id = homework.child_id
      and children.user_id = auth.uid()
    )
  );

create policy "Users can delete homework of own children"
  on public.homework for delete
  using (
    exists (
      select 1 from public.children
      where children.id = homework.child_id
      and children.user_id = auth.uid()
    )
  );
