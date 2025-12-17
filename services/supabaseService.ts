import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Note, SupabaseConfig, CategoryConfig } from '../types';

let supabase: SupabaseClient | null = null;

export const initSupabase = (config: SupabaseConfig) => {
  if (config.enabled && config.url && config.key) {
    try {
      supabase = createClient(config.url, config.key);
      return true;
    } catch (e) {
      console.error("Failed to init Supabase", e);
      return false;
    }
  }
  supabase = null;
  return false;
};

export const syncNotesToCloud = async (notes: Note[]) => {
  if (!supabase) return { error: "Not connected" };

  try {
    // 1. Get existing remote notes to check for conflicts (Simple Strategy: Latest Update Wins)
    // For this personal app, we will do a bulk upsert logic based on ID.
    
    // We transform notes to the SQL schema format
    const rows = notes.map(note => ({
      id: note.id,
      updated_at: note.updatedAt,
      data: note // We store the whole JSON object
    }));

    const { error } = await supabase
      .from('notes')
      .upsert(rows, { onConflict: 'id' });

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Cloud Sync Error (Upload):", error);
    return { error };
  }
};

export const deleteNoteFromCloud = async (noteId: string) => {
  if (!supabase) return { error: "Not connected" };

  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Cloud Sync Error (Delete):", error);
    return { error };
  }
};

export const fetchNotesFromCloud = async (): Promise<Note[] | null> => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*');

    if (error) throw error;

    if (data) {
        // Map back from SQL rows to Note objects
        return data.map((row: any) => row.data as Note);
    }
    return [];
  } catch (error) {
    console.error("Cloud Sync Error (Download):", error);
    return null;
  }
};

// ============ CATEGORIES SYNC ============

export const fetchCategoriesFromCloud = async (): Promise<CategoryConfig[] | null> => {
  if (!supabase) return null;

  try {
    // No usar .single() para evitar error 406 cuando la tabla está vacía
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', 'default');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    // data es un array, tomamos el primer elemento si existe
    if (data && data.length > 0 && data[0].data) {
      console.log('✓ Categories loaded from cloud:', data[0].data.length, 'categories');
      return data[0].data as CategoryConfig[];
    }

    console.log('No categories found in cloud, will use local');
    return null;
  } catch (error) {
    console.error("Cloud Sync Error (Categories Download):", error);
    return null;
  }
};

export const saveCategoriesToCloud = async (categories: CategoryConfig[]): Promise<boolean> => {
  if (!supabase) {
    console.warn('Categories sync skipped: Supabase not initialized');
    return false;
  }

  try {
    console.log('Saving categories to cloud:', categories.length, 'categories');
    const { error } = await supabase
      .from('categories')
      .upsert({
        id: 'default',
        updated_at: new Date().toISOString(),
        data: categories
      }, { onConflict: 'id' });

    if (error) throw error;

    console.log('✓ Categories synced to cloud successfully');
    return true;
  } catch (error) {
    console.error("✗ Cloud Sync Error (Categories Upload):", error);
    return false;
  }
};