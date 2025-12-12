import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Note, Category } from './types';
import { getNotes, saveNotes, getSettings, saveSettings, initDB } from './services/storageService';
import { TabNavigation } from './components/TabNavigation';
import { NoteCard } from './components/NoteCard';
import { NoteEditor } from './components/NoteEditor';
import { QuickRecorder } from './components/QuickRecorder';
import { ConfirmationModal } from './components/ConfirmationModal';
import { SettingsModal } from './components/SettingsModal';
import { Plus, Search, Moon, Sun, Download, Upload, Mic, Gamepad2, Briefcase, User, Settings as SettingsIcon } from 'lucide-react';
import { APP_TITLE } from './constants';

export const App: React.FC = () => {
  // State
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('gaming');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isQuickRecordOpen, setIsQuickRecordOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

    if (editingNote) { // Editing existing
        updatedNotes = notes.map(n => n.id === noteToSave.id ? noteToSave : n);
    } else if (notes.some(n => n.id === noteToSave.id)) { 
         // ID collision or re-save, safer to map
         updatedNotes = notes.map(n => n.id === noteToSave.id ? noteToSave : n);
    } else { // New note
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

    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes);
    await saveNotes(updatedNotes);
    
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

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter(n => n.category === activeCategory)
      .filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.subcategory?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      // Sort logic: Newest (Last Updated) first
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, activeCategory, searchQuery]);

  // Dynamic Theme Background
  const getThemeBackground = () => {
    if (!darkMode) return 'bg-gray-50';
    switch (activeCategory) {
      case 'gaming': return 'bg-[#121016] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#121212] to-[#121212]';
      case 'work': return 'bg-[#101216] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#121212] to-[#121212]';
      case 'personal': return 'bg-[#101612] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-[#121212] to-[#121212]';
      default: return 'bg-[#121212]';
    }
  };

  const getCategoryIcon = () => {
      switch (activeCategory) {
          case 'gaming': return <Gamepad2 className="text-purple-500" size={24} />;
          case 'work': return <Briefcase className="text-blue-500" size={24} />;
          case 'personal': return <User className="text-green-500" size={24} />;
      }
  }

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
                    {filteredNotes.length} notas en {activeCategory}
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
        <TabNavigation activeCategory={activeCategory} onChange={setActiveCategory} />

        {/* Search */}
        <div className="relative mb-6 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Buscar en ${activeCategory}...`}
                className="w-full bg-white dark:bg-[#1a1a1a] border border-transparent dark:border-white/5 rounded-xl py-3 pl-10 pr-4 shadow-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder-gray-500"
            />
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 gap-3 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredNotes.length === 0 ? (
                <div className="text-center py-16 opacity-50 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Search className="text-gray-400" size={32}/>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No hay notas aquí</p>
                    <p className="text-sm mt-1 text-gray-400">Toca el + para crear la primera</p>
                </div>
            ) : (
                filteredNotes.map(note => (
                    <NoteCard 
                        key={note.id} 
                        note={note} 
                        onClick={(n) => { setEditingNote(n); setIsEditorOpen(true); }}
                        onDelete={handleRequestDelete}
                        onToggleItem={handleToggleItem}
                    />
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
      />

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