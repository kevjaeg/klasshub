// Shared types for all school platform adapters

export type PlatformId = "webuntis" | "iserv" | "schulmanager" | "moodle" | "sdui";

export interface PlatformInfo {
  id: PlatformId;
  name: string;
  description: string;
  fields: PlatformField[];
  color: string;
}

export interface PlatformField {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "url";
  required: boolean;
  helpText?: string;
}

export interface PlatformCredentials {
  username: string;
  password: string;
  [key: string]: string; // platform-specific fields (server, school, instance URL, etc.)
}

export interface SyncResult {
  lessons: LessonData[];
  substitutions: SubstitutionData[];
  messages?: MessageData[];
  homework?: HomeworkData[];
}

export interface LessonData {
  subject: string;
  teacher: string | null;
  room: string | null;
  dayOfWeek: number; // 1=Monday, 5=Friday
  lessonNumber: number;
  startTime: string; // "08:00"
  endTime: string; // "08:45"
}

export interface SubstitutionData {
  date: string; // "2025-01-15"
  lessonNumber: number;
  originalSubject: string | null;
  newSubject: string | null;
  originalTeacher: string | null;
  newTeacher: string | null;
  newRoom: string | null;
  type: "cancelled" | "substituted" | "room_change" | "other";
  infoText: string | null;
}

export interface MessageData {
  id: string;
  title: string;
  body: string;
  sender: string | null;
  date: string;
  read: boolean;
}

export interface HomeworkData {
  id: string;
  subject: string;
  description: string;
  dueDate: string;
  completed: boolean;
}

// Adapter interface – every platform must implement this
export interface PlatformAdapter {
  readonly id: PlatformId;
  sync(
    config: Record<string, string>,
    credentials: PlatformCredentials
  ): Promise<SyncResult>;
}
