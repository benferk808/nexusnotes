// Category is now dynamic - stored as string ID
export type Category = string;

export interface CategoryConfig {
  id: string;
  label: string;
  icon: string;      // Lucide icon name
  color: string;     // Tailwind color class (e.g., 'purple', 'blue', 'green')
}

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

export interface Reminder {
  enabled: boolean;
  datetime: string;      // ISO format: "2025-12-15T10:00:00"
  notified: boolean;     // Ya se envio la notificacion?
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
  scheduledDate?: string;  // Fecha para la cual es la tarea (ISO format: "2025-12-15")
  reminder?: Reminder;     // Recordatorio/notificacion opcional
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
  notificationsEnabled?: boolean;
}

export interface SyncStatus {
  lastSync: string | null;
  status: 'idle' | 'syncing' | 'error' | 'success';
  message?: string;
}