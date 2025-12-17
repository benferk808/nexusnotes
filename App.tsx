import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Note, Category, CategoryConfig } from './types';
import { getNotes, saveNotes, deleteNote, getSettings, saveSettings, initDB, getCategories, saveCategories } from './services/storageService';
import { TabNavigation } from './components/TabNavigation';
import { NoteCard } from './components/NoteCard';
import { NoteEditor } from './components/NoteEditor';
import { QuickRecorder } from './components/QuickRecorder';
import { ConfirmationModal } from './components/ConfirmationModal';
import { SettingsModal } from './components/SettingsModal';
import { CategoryManager } from './components/CategoryManager';
import { CalendarModal } from './components/CalendarModal';
import { Plus, Search, Moon, Sun, Download, Upload, Mic, Settings as SettingsIcon, Calendar, CalendarDays } from 'lucide-react';
import * as Icons from 'lucide-react';
import { APP_TITLE } from './constants';

// Color mappings for dynamic styling
const colorStyles: Record<string, { text: string; bg: string; gradient: string }> = {
  purple: { text: 'text-purple-500', bg: 'bg-purple-500', gradient: 'from-purple-900/20' },
  blue: { text: 'text-blue-500', bg: 'bg-blue-500', gradient: 'from-blue-900/20' },
  green: { text: 'text-green-500', bg: 'bg-green-500', gradient: 'from-green-900/20' },
  red: { text: 'text-red-500', bg: 'bg-red-500', gradient: 'from-red-900/20' },
  orange: { text: 'text-orange-500', bg: 'bg-orange-500', gradient: 'from-orange-900/20' },
  yellow: { text: 'text-yellow-500', bg: 'bg-yellow-500', gradient: 'from-yellow-900/20' },
  pink: { text: 'text-pink-500', bg: 'bg-pink-500', gradient: 'from-pink-900/20' },
  cyan: { text: 'text-cyan-500', bg: 'bg-cyan-500', gradient: 'from-cyan-900/20' },
};

export const App: React.FC = () => {
  // State
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isQuickRecordOpen, setIsQuickRecordOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  // Delete Confirmation State
  const [deleteModalState, setDeleteModalState] = useState<{isOpen: boolean, noteId: string | null}>({ 
    isOpen: false, 
    noteId: null 
  });

  const [darkMode, setDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialization
  useEffect(() => {
    const init = async () => {
        await initDB(); // Migrate/Init DB and Supabase
        const loadedNotes = await getNotes();
        setNotes(loadedNotes);

        // Load categories (async - syncs with cloud)
        const loadedCategories = await getCategories();
        setCategories(loadedCategories);
        if (loadedCategories.length > 0) {
          setActiveCategory(loadedCategories[0].id);
        }

        const settings = getSettings();
        setDarkMode(settings.darkMode);
        setIsLoading(false);
    };
    init();
  }, []);

  // Effects
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const currentSettings = getSettings();
    saveSettings({ ...currentSettings, darkMode });
  }, [darkMode]);

  // --- CRUD Operations ---

  const handleSaveNote = async (note: Note) => {
    let updatedNotes;
    // Always update date when saving
    const noteToSave = { ...note, updatedAt: new Date().toISOString() };

    // Check if note already exists in the array (not just if editingNote is set)
    const noteExists = notes.some(n => n.id === noteToSave.id);

    if (noteExists) { // Editing existing note
        updatedNotes = notes.map(n => n.id === noteToSave.id ? noteToSave : n);
    } else { // New note (including from calendar)
        updatedNotes = [noteToSave, ...notes];
    }

    setNotes(updatedNotes);
    await saveNotes(updatedNotes);
    setEditingNote(null);
  };

  // Trigger the delete modal instead of deleting immediately
  const handleRequestDelete = (e: React.MouseEvent | null, id: string) => {
    if (e) e.stopPropagation();
    setDeleteModalState({ isOpen: true, noteId: id });
  };

  // Actual Delete Execution
  const handleConfirmDelete = async () => {
    const id = deleteModalState.noteId;
    if (!id) return;

    // Delete from local IndexedDB AND from Supabase cloud
    const updatedNotes = await deleteNote(id, notes);
    setNotes(updatedNotes);

    // Also close editor if we deleted the note currently being edited
    if (editingNote && editingNote.id === id) {
        setIsEditorOpen(false);
        setEditingNote(null);
    }
  };

  // Agile: Toggle Checkbox directly from Dashboard
  const handleToggleItem = async (noteId: string, itemId: string) => {
    const updatedNotes = notes.map(note => {
        if (note.id !== noteId) return note;
        return {
            ...note,
            items: note.items.map(item => 
                item.id === itemId ? { ...item, completed: !item.completed } : item
            ),
            updatedAt: new Date().toISOString() // Updates sort order on toggle
        };
    });
    setNotes(updatedNotes);
    await saveNotes(updatedNotes);
  };

  // --- Backup System (Free & Offline) ---

  const handleExportData = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `NexusNotes_Backup_${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    alert("Copia descargada. Tus datos SIGUEN en este dispositivo.");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const importedNotes = JSON.parse(event.target?.result as string);
            if (Array.isArray(importedNotes)) {
                if(confirm(`Se encontraron ${importedNotes.length} notas. ¿Quieres reemplazar o fusionar?\n\nCancelar = Fusionar (Suma notas nuevas)\nAceptar = Reemplazar (Borra las actuales y pone las del archivo)`)) {
                    setNotes(importedNotes);
                    await saveNotes(importedNotes);
                } else {
                    const currentIds = new Set(notes.map(n => n.id));
                    const newNotes = importedNotes.filter(n => !currentIds.has(n.id));
                    const merged = [...newNotes, ...notes];
                    setNotes(merged);
                    await saveNotes(merged);
                    alert(`Se agregaron ${newNotes.length} notas nuevas.`);
                }
            } else {
                alert("Formato incorrecto.");
            }
        } catch (err) {
            console.error(err);
            alert("Error al leer el archivo.");
        }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Get the "target date" for a note (scheduledDate or reminder date)
  const getTargetDate = (note: Note): Date | null => {
    if (note.scheduledDate) {
      return new Date(note.scheduledDate + 'T00:00:00');
    }
    if (note.reminder?.enabled) {
      return new Date(note.reminder.datetime);
    }
    return null;
  };

  // Format date key for grouping
  const formatDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Format date label for display
  const formatDateLabel = (dateKey: string): string => {
    if (dateKey === 'no-date') return 'Sin fecha programada';

    const date = new Date(dateKey + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === tomorrow.toDateString()) return 'Mañana';

    // Check if past
    if (date < today) {
      return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) + ' (pasado)';
    }

    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  // Grouped Notes by date
  const groupedNotes = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter notes first
    const filtered = notes
      .filter(n => n.category === activeCategory)
      .filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.subcategory?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Group by date
    const groups = new Map<string, Note[]>();

    filtered.forEach(note => {
      const targetDate = getTargetDate(note);
      const key = targetDate ? formatDateKey(targetDate) : 'no-date';

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(note);
    });

    // Convert to array and sort groups
    const groupArray = Array.from(groups.entries()).map(([dateKey, groupNotes]) => ({
      dateKey,
      label: formatDateLabel(dateKey),
      notes: groupNotes.sort((a, b) => {
        // Within group, sort by updatedAt
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }),
      targetDate: dateKey === 'no-date' ? null : new Date(dateKey + 'T00:00:00'),
    }));

    // Sort groups: future dates first (closest first), then past dates, then no-date
    return groupArray.sort((a, b) => {
      // No-date always last
      if (a.dateKey === 'no-date') return 1;
      if (b.dateKey === 'no-date') return -1;

      const aIsFuture = a.targetDate! >= today;
      const bIsFuture = b.targetDate! >= today;

      // Future dates come first
      if (aIsFuture && !bIsFuture) return -1;
      if (!aIsFuture && bIsFuture) return 1;

      // Both future or both past - sort by date
      if (aIsFuture && bIsFuture) {
        return a.targetDate!.getTime() - b.targetDate!.getTime(); // Closest first
      }

      // Both past - most recent first
      return b.targetDate!.getTime() - a.targetDate!.getTime();
    });
  }, [notes, activeCategory, searchQuery]);

  // Handle category save
  const handleSaveCategories = async (newCategories: CategoryConfig[]) => {
    await saveCategories(newCategories);
    setCategories(newCategories);
    // If active category was deleted, switch to first available
    if (!newCategories.find(c => c.id === activeCategory) && newCategories.length > 0) {
      setActiveCategory(newCategories[0].id);
    }
  };

  // Create note from calendar
  const handleCreateFromCalendar = (date: Date, categoryId: string) => {
    // scheduledDate is just the date (YYYY-MM-DD format)
    const scheduledDate = date.toISOString().split('T')[0];

    const newNote: Note = {
      id: crypto.randomUUID(),
      category: categoryId,
      subcategory: '',
      title: '',
      content: '',
      items: [],
      attachments: [],
      isPinned: false,
      scheduledDate: scheduledDate, // Fecha para la cual es la tarea
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // No reminder by default - user can add one in the editor if they want notification
    };

    setActiveCategory(categoryId);
    setEditingNote(newNote);
    setIsEditorOpen(true);
  };

  // Get current category config
  const currentCategory = useMemo(() => {
    return categories.find(c => c.id === activeCategory);
  }, [categories, activeCategory]);

  // Dynamic Theme Background
  const getThemeBackground = () => {
    if (!darkMode) return 'bg-gray-50';
    if (!currentCategory) return 'bg-[#121212]';
    const colors = colorStyles[currentCategory.color] || colorStyles.blue;
    return `bg-[#121212] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${colors.gradient} via-[#121212] to-[#121212]`;
  };

  const getCategoryIcon = () => {
    if (!currentCategory) return null;
    const IconComponent = (Icons as any)[currentCategory.icon];
    if (!IconComponent) return null;
    const colors = colorStyles[currentCategory.color] || colorStyles.blue;
    return <IconComponent className={colors.text} size={24} />;
  };

  if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">Cargando base de datos...</div>;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 flex flex-col ${getThemeBackground()}`}>
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#1a1a1a]/60 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-xl">
               {getCategoryIcon()}
            </div>
            <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                {APP_TITLE}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {groupedNotes.reduce((sum, g) => sum + g.notes.length, 0)} notas en {currentCategory?.label || activeCategory}
                </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportFile} 
                accept=".json" 
                className="hidden" 
            />
            
            {/* Calendar Button */}
            <button onClick={() => setIsCalendarOpen(true)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" title="Calendario">
                <Calendar size={20} />
            </button>

            {/* Settings Button */}
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" title="Configuración">
                <SettingsIcon size={20} />
            </button>

            <button onClick={handleExportData} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors hidden sm:block" title="Descargar Copia">
                <Download size={20} />
            </button>
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1"></div>

            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full text-gray-500 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4">
        
        {/* Navigation */}
        <TabNavigation categories={categories} activeCategory={activeCategory} onChange={setActiveCategory} />

        {/* Search */}
        <div className="relative mb-6 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Buscar en ${currentCategory?.label || activeCategory}...`}
                className="w-full bg-white dark:bg-[#1a1a1a] border border-transparent dark:border-white/5 rounded-xl py-3 pl-10 pr-4 shadow-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder-gray-500"
            />
        </div>

        {/* Notes Grid - Grouped by Date */}
        <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {groupedNotes.length === 0 ? (
                <div className="text-center py-16 opacity-50 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Search className="text-gray-400" size={32}/>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No hay notas aquí</p>
                    <p className="text-sm mt-1 text-gray-400">Toca el + para crear la primera</p>
                </div>
            ) : (
                groupedNotes.map(group => (
                    <div key={group.dateKey} className="space-y-3">
                        {/* Date Header */}
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                            group.dateKey === 'no-date'
                                ? 'bg-gray-100 dark:bg-gray-800/50'
                                : group.label === 'Hoy'
                                    ? 'bg-blue-100 dark:bg-blue-900/30'
                                    : group.label === 'Mañana'
                                        ? 'bg-purple-100 dark:bg-purple-900/30'
                                        : group.label.includes('(pasado)')
                                            ? 'bg-gray-100 dark:bg-gray-800/50'
                                            : 'bg-green-100 dark:bg-green-900/30'
                        }`}>
                            <CalendarDays size={16} className={`${
                                group.dateKey === 'no-date'
                                    ? 'text-gray-500'
                                    : group.label === 'Hoy'
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : group.label === 'Mañana'
                                            ? 'text-purple-600 dark:text-purple-400'
                                            : group.label.includes('(pasado)')
                                                ? 'text-gray-500'
                                                : 'text-green-600 dark:text-green-400'
                            }`} />
                            <span className={`text-sm font-semibold capitalize ${
                                group.dateKey === 'no-date'
                                    ? 'text-gray-600 dark:text-gray-400'
                                    : group.label === 'Hoy'
                                        ? 'text-blue-700 dark:text-blue-300'
                                        : group.label === 'Mañana'
                                            ? 'text-purple-700 dark:text-purple-300'
                                            : group.label.includes('(pasado)')
                                                ? 'text-gray-600 dark:text-gray-400'
                                                : 'text-green-700 dark:text-green-300'
                            }`}>
                                {group.label}
                            </span>
                            <span className="text-xs text-gray-400 ml-auto">
                                {group.notes.length} {group.notes.length === 1 ? 'nota' : 'notas'}
                            </span>
                        </div>

                        {/* Notes in this group */}
                        <div className="grid grid-cols-1 gap-3 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                            {group.notes.map(note => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    onClick={(n) => { setEditingNote(n); setIsEditorOpen(true); }}
                                    onDelete={handleRequestDelete}
                                    onToggleItem={handleToggleItem}
                                />
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>

      </main>

      {/* Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-40">
          
          {/* Quick Voice Mode (Driving) */}
          <button 
            onClick={() => setIsQuickRecordOpen(true)}
            className="w-14 h-14 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-lg shadow-red-600/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 group"
            title="Modo Voz Rápida (Conducir)"
          >
            <Mic size={24} className="group-hover:animate-pulse"/>
          </button>

          {/* New Note */}
          <button 
            onClick={() => { setEditingNote(null); setIsEditorOpen(true); }}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          >
            <Plus size={28} />
          </button>
      </div>

      {/* Modals */}
      <NoteEditor 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        onSave={handleSaveNote}
        onDelete={(id) => handleRequestDelete(null, id)}
        initialNote={editingNote}
        activeCategory={activeCategory}
      />
      
      <QuickRecorder 
        isOpen={isQuickRecordOpen}
        onClose={() => setIsQuickRecordOpen(false)}
        onSave={handleSaveNote}
        activeCategory={activeCategory}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
      />

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        notes={notes}
        categories={categories}
        onCreateNote={handleCreateFromCalendar}
      />

      {isCategoryManagerOpen && (
        <CategoryManager
          categories={categories}
          notes={notes}
          onSave={handleSaveCategories}
          onClose={() => setIsCategoryManagerOpen(false)}
        />
      )}

      <ConfirmationModal 
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ ...deleteModalState, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar nota?"
        message="Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminarla permanentemente?"
      />

    </div>
  );
};