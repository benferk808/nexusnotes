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
        // Run in background so we don't block UI, but for this simpler implementation
        // we might want to wait if it's the very first load. 
        // Let's do a smart merge: Get Cloud, if Cloud has newer items, update Local.
        try {
            const cloudNotes = await fetchNotesFromCloud();
            if (cloudNotes) {
                // Merge Logic: create a map of all notes by ID
                const noteMap = new Map<string, Note>();
                
                // Add local notes
                notes.forEach(n => noteMap.set(n.id, n));
                
                let hasChanges = false;
                
                // Overlay cloud notes if they are newer
                cloudNotes.forEach(cloudNote => {
                    const localNote = noteMap.get(cloudNote.id);
                    if (!localNote || new Date(cloudNote.updatedAt) > new Date(localNote.updatedAt)) {
                        noteMap.set(cloudNote.id, cloudNote);
                        hasChanges = true;
                    }
                });
                
                if (hasChanges) {
                    notes = Array.from(noteMap.values());
                    // Update local cache
                    await saveNotesLocal(notes); 
                    console.log("Synced with cloud: Notes updated.");
                }
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