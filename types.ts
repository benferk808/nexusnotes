export type Category = 'gaming' | 'work' | 'personal';

export interface MediaAttachment {
  id: string;
  type: 'image' | 'audio';
  data: string; // Base64
  mimeType: string;
  createdAt: string;
  transcription?: string; // For audio
}

export interface NoteItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  category: Category;
  subcategory?: string; // e.g., Game Name, "Supermarket", etc.
  title: string;
  content: string; // Main text content or description
  items: NoteItem[]; // For checklists
  attachments: MediaAttachment[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupabaseConfig {
  url: string;
  key: string;
  enabled: boolean;
}

export interface AppSettings {
  darkMode: boolean;
  lastSync: string | null;
  supabaseConfig?: SupabaseConfig;
}

export interface SyncStatus {
  lastSync: string | null;
  status: 'idle' | 'syncing' | 'error' | 'success';
  message?: string;
}