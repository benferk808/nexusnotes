import { Note, AppSettings } from '../types';
import { initSupabase, syncNotesToCloud, fetchNotesFromCloud, deleteNoteFromCloud } from './supabaseService';

const DB_NAME = 'OmniNotesDB';
const STORE_NAME = 'notes';
const DB_VERSION = 1;
const SETTINGS_KEY = 'omninotes_settings_v2'; // Bumped version

// --- IndexedDB Helpers ---

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const initDB = async (): Promise<void> => {
    // Initialize Supabase if settings exist
    const settings = getSettings();
    if (settings.supabaseConfig?.enabled) {
        initSupabase(settings.supabaseConfig);
    }

    // Migration Logic: Check if LocalStorage has data
    const lsData = localStorage.getItem('omninotes_data_v1');
    if (lsData) {
        try {
            const notes = JSON.parse(lsData);
            if (Array.isArray(notes) && notes.length > 0) {
                await saveNotesLocal(notes);
            }
            localStorage.removeItem('omninotes_data_v1');
        } catch (e) {
            console.error("Migration failed", e);
        }
    }
};

// --- CRUD Local ---

const getNotesLocal = async (): Promise<Note[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as Note[]);
        request.onerror = () => reject(request.error);
    });
};

const saveNotesLocal = async (notes: Note[]): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear(); 
    if (notes.length === 0) { resolve(); return; }
    let completed = 0;
    notes.forEach(note => {
        const request = store.put(note);
        request.onsuccess = () => {
            completed++;
            if (completed === notes.length) resolve();
        };
        request.onerror = () => reject(request.error);
    });
  });
};

// --- Hybrid CRUD ---

export const getNotes = async (): Promise<Note[]> => {
    // 1. Always load local first (Instant UI)
    let notes = await getNotesLocal();

    // 2. If connected to cloud, try to fetch and merge
    const settings = getSettings();
    if (settings.supabaseConfig?.enabled) {
        try {
            const cloudNotes = await fetchNotesFromCloud();
            if (cloudNotes) {
                // Cloud is source of truth for WHICH notes exist
                // Local can have newer VERSIONS of notes that exist in cloud
                const cloudNoteMap = new Map<string, Note>();
                cloudNotes.forEach(n => cloudNoteMap.set(n.id, n));

                const mergedNotes: Note[] = [];
                const notesToUpload: Note[] = [];
                let hasLocalChanges = false;

                // Process cloud notes (these definitely should exist)
                cloudNotes.forEach(cloudNote => {
                    const localNote = notes.find(n => n.id === cloudNote.id);
                    if (localNote && new Date(localNote.updatedAt) > new Date(cloudNote.updatedAt)) {
                        // Local is newer, keep local version and mark for upload
                        mergedNotes.push(localNote);
                        notesToUpload.push(localNote);
                    } else {
                        // Cloud is newer or same, use cloud version
                        mergedNotes.push(cloudNote);
                        if (localNote) hasLocalChanges = true;
                    }
                });

                // Check for local-only notes (not in cloud)
                // These were deleted on another device - don't include them
                const deletedCount = notes.filter(n => !cloudNoteMap.has(n.id)).length;
                if (deletedCount > 0) {
                    console.log(`Sync: Removed ${deletedCount} notes deleted on other devices`);
                    hasLocalChanges = true;
                }

                // Update local cache if there were changes
                if (hasLocalChanges || deletedCount > 0) {
                    await saveNotesLocal(mergedNotes);
                    console.log("Synced with cloud: Local cache updated.");
                }

                // Upload local changes to cloud (fire and forget)
                if (notesToUpload.length > 0) {
                    syncNotesToCloud(notesToUpload).then(() => {
                        console.log(`Synced ${notesToUpload.length} newer local notes to cloud`);
                    });
                }

                notes = mergedNotes;
            }
        } catch (e) {
            console.warn("Could not sync with cloud on load", e);
        }
    }

    return notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const saveNotes = async (notes: Note[]): Promise<void> => {
    // 1. Save Local (Instant)
    await saveNotesLocal(notes);

    // 2. Push to Cloud (Fire and forget, or handle error silently)
    const settings = getSettings();
    if (settings.supabaseConfig?.enabled) {
        syncNotesToCloud(notes).then((res) => {
            if (res.error) console.error("Cloud save failed", res.error);
            else console.log("Cloud save success");
        });
    }
};

export const deleteNote = async (noteId: string, currentNotes: Note[]): Promise<Note[]> => {
    // 1. Filter out the note locally
    const updatedNotes = currentNotes.filter(n => n.id !== noteId);

    // 2. Save to IndexedDB
    await saveNotesLocal(updatedNotes);

    // 3. Delete from Cloud (if connected)
    const settings = getSettings();
    if (settings.supabaseConfig?.enabled) {
        deleteNoteFromCloud(noteId).then((res) => {
            if (res.error) console.error("Cloud delete failed", res.error);
            else console.log("Cloud delete success");
        });
    }

    return updatedNotes;
};

// --- Settings ---

export const getSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : { darkMode: true, lastSync: null };
  } catch {
    return { darkMode: true, lastSync: null };
  }
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  // If config changed, re-init supabase
  if (settings.supabaseConfig) {
      initSupabase(settings.supabaseConfig);
  }
};