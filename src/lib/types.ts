// Database types for SchoolHub

export interface Child {
  id: string;
  user_id: string;
  name: string;
  school_name: string;
  webuntis_school: string | null;
  webuntis_server: string | null;
  platform: string | null;
  platform_config: Record<string, string> | null;
  class_name: string | null;
  last_synced_at: string | null;
  created_at: string;
}

export interface Lesson {
  id: string;
  child_id: string;
  subject: string;
  teacher: string | null;
  room: string | null;
  day_of_week: number; // 1=Monday, 5=Friday
  lesson_number: number;
  start_time: string;
  end_time: string;
  synced_at: string;
}

export interface Substitution {
  id: string;
  child_id: string;
  date: string;
  lesson_number: number;
  original_subject: string | null;
  new_subject: string | null;
  original_teacher: string | null;
  new_teacher: string | null;
  new_room: string | null;
  type: "cancelled" | "substituted" | "room_change" | "other";
  info_text: string | null;
  synced_at: string;
}

export interface Message {
  id: string;
  child_id: string;
  external_id: string | null;
  title: string;
  body: string;
  sender: string | null;
  date: string;
  read: boolean;
  synced_at: string;
}

export interface Homework {
  id: string;
  child_id: string;
  external_id: string | null;
  subject: string;
  description: string;
  due_date: string;
  completed: boolean;
  synced_at: string;
}
