export interface UserSettings {
  postsPerBatch: number;
  batchCount: 1 | 2;
  schedules: BatchSchedule[];
  sourceWebsites: string[];
  writingStyle: string;
  postLength: "short" | "medium" | "long";
  emailAddress: string;
}

export interface BatchSchedule {
  id: string;
  date: string; // ISO date string
  time: string; // HH:MM format
  enabled: boolean;
}

export interface GeneratedPost {
  id: string;
  batchId: string;
  topic: string;
  content: string;
  createdAt: string;
  status: "draft" | "edited" | "used";
  editHistory: PostEdit[];
}

export interface PostEdit {
  timestamp: string;
  userMessage: string;
  newContent: string;
}

export interface Batch {
  id: string;
  scheduledFor: string;
  generatedAt: string | null;
  posts: GeneratedPost[];
  status: "scheduled" | "generating" | "complete" | "sent";
}

export const DEFAULT_SETTINGS: UserSettings = {
  postsPerBatch: 5,
  batchCount: 1,
  schedules: [],
  sourceWebsites: [],
  writingStyle: "",
  postLength: "medium",
  emailAddress: "",
};

export const AUDIENCE = "New York Life financial advisors";
