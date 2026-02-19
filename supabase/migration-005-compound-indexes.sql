-- Migration 005: Compound indexes for common query patterns
-- Speeds up dashboard, homework, messages, and timetable queries

-- Lessons: dashboard + timetable filter by child + day_of_week
create index if not exists idx_lessons_child_id_day
  on public.lessons(child_id, day_of_week);

-- Homework: dashboard sorts by due_date, filters by completed
create index if not exists idx_homework_child_id_due_date
  on public.homework(child_id, due_date);

-- Messages: message list orders by date descending
create index if not exists idx_messages_child_id_date
  on public.messages(child_id, date desc);
