-- Migration 002: Multi-platform support
-- Adds platform selection and generic config storage to children table

-- Add platform column (nullable, defaults populated below)
alter table public.children add column if not exists platform text;
alter table public.children add column if not exists platform_config jsonb default '{}'::jsonb;

-- Migrate existing WebUntis data to new columns
update public.children
set
  platform = 'webuntis',
  platform_config = jsonb_build_object(
    'server', webuntis_server,
    'school', webuntis_school
  )
where webuntis_server is not null and webuntis_school is not null;
