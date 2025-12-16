import React, { useState, useEffect, useRef } from 'react';
import { Note, Category, MediaAttachment, NoteItem, Reminder } from '../types';
import { Mic, Image as ImageIcon, X, Save, Trash2, Plus, Check, FileAudio, CalendarDays } from 'lucide-react';
import { ReminderPicker } from './ReminderPicker';

interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
  initialNote?: Note | null;
  activeCategory: Category;
  onDelete?: (id: string) => void; // Add onDelete prop
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ isOpen, onClose, onSave, initialNote, activeCategory, onDelete }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [items, setItems] = useState<NoteItem[]>([]);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [reminder, setReminder] = useState<Reminder | undefined>(undefined);
  const [isRecording, setIsRecording] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Speech Recognition Setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialNote) {
        setTitle(initialNote.title);
        setContent(initialNote.content);
        setSubcategory(initialNote.subcategory || '');
        setAttachments(initialNote.attachments);
        setItems(initialNote.items || []);
        setScheduledDate(initialNote.scheduledDate || '');
        setReminder(initialNote.reminder);
      } else {
        resetForm();
        setSubcategory(getDefaultSubcategory(activeCategory));
      }
    }
  }, [isOpen, initialNote, activeCategory]);

  const getDefaultSubcategory = (cat: Category) => {
    if (cat === 'gaming') return 'Juego';
    if (cat === 'work') return 'Tarea';
    return 'General';
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSubcategory('');
    setAttachments([]);
    setItems([]);
    setScheduledDate('');
    setReminder(undefined);
  };

  // --- Handlers ---

  const handleSave = () => {
    const newNote: Note = {
      id: initialNote?.id || crypto.randomUUID(),
      category: initialNote?.category || activeCategory,
      subcategory,
      title: title || 'Nota Sin Título',
      content,
      items,
      attachments,
      isPinned: initialNote?.isPinned || false,
      scheduledDate: scheduledDate || undefined,
      reminder,
      createdAt: initialNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(newNote);
    onClose();
  };

  const handleDelete = () => {
      if (initialNote && onDelete) {
          onDelete(initialNote.id);
          onClose();
      }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAttachments(prev => [...prev, {
          id: crypto.randomUUID(),
          type: 'image',
          data: base64,
          mimeType: file.type,
          createdAt: new Date().toISOString()
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop Recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start Recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // 1. Setup Audio Recorder
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
             const base64 = reader.result as string;
             setAttachments(prev => [...prev, {
               id: crypto.randomUUID(),
               type: 'audio',
               data: base64,
               mimeType: 'audio/webm',
               createdAt: new Date().toISOString()
             }]);
          };
          reader.readAsDataURL(audioBlob);
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone", err);
        alert("Could not access microphone.");
      }
    }
  };

  const handleAddItem = () => {
    setItems([...items, { id: crypto.randomUUID(), text: '', completed: false }]);
  };

  const updateItem = (id: string, text: string) => {
    setItems(items.map(item => item.id === id ? { ...item, text } : item));
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {initialNote ? 'Editar Nota' : 'Nueva Nota'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Metadata Row */}
          <div className="flex gap-2">
            <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase">Categoria</label>
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 text-sm font-medium capitalize">
                    {activeCategory}
                </div>
            </div>
            <div className="flex-[2]">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase">Etiqueta</label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder={activeCategory === 'gaming' ? 'Ej. Minecraft' : 'Ej. Urgente'}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                />
            </div>
          </div>

          {/* Scheduled Date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase flex items-center gap-1">
              <CalendarDays size={12} />
              Fecha Programada
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white text-sm"
              />
              {scheduledDate && (
                <button
                  onClick={() => setScheduledDate('')}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Quitar fecha"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {scheduledDate && (
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Esta tarea es para el {new Date(scheduledDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            )}
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">Recordatorio (Notificacion)</label>
            <ReminderPicker reminder={reminder} onChange={setReminder} />
          </div>

          {/* Title */}
          <div>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la nota..."
              className="w-full text-xl font-bold bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-white"
            />
          </div>

          {/* Content Area */}
          <div className="min-h-[120px]">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Descripción o notas..."
              className="w-full h-full min-h-[120px] bg-transparent resize-none outline-none text-gray-700 dark:text-gray-300 leading-relaxed"
            />
          </div>

          {/* Checklist Items */}
          <div className="space-y-2">
            {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 group">
                    <button onClick={() => toggleItem(item.id)} className={`flex-shrink-0 text-gray-400 ${item.completed ? 'text-green-500' : ''}`}>
                        {item.completed ? <div className="bg-green-500 rounded text-white p-0.5"><Check size={12}/></div> : <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>}
                    </button>
                    <input 
                        type="text" 
                        value={item.text}
                        onChange={(e) => updateItem(item.id, e.target.value)}
                        className={`flex-1 bg-transparent outline-none border-b border-transparent focus:border-gray-200 dark:focus:border-gray-700 ${item.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}
                    />
                    <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500">
                        <X size={14} />
                    </button>
                </div>
            ))}
            <button onClick={handleAddItem} className="flex items-center gap-2 text-sm text-blue-500 font-medium hover:text-blue-600 pt-2">
                <Plus size={16} /> Agregar Tarea / Item
            </button>
          </div>

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              {attachments.map(att => (
                <div key={att.id} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 flex flex-col items-center justify-center gap-2">
                   {att.type === 'image' ? (
                     <div className="w-full aspect-video overflow-hidden rounded">
                        <img src={att.data} alt="adjunto" className="w-full h-full object-cover" />
                     </div>
                   ) : (
                     <div className="w-full aspect-video flex flex-col items-center justify-center gap-2 text-gray-500 bg-gray-100 dark:bg-gray-800 rounded">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                            <FileAudio size={20} />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-xs font-semibold">Nota de Audio</span>
                            <audio src={att.data} controls className="w-32 h-6 mt-1 scale-75 origin-top" />
                        </div>
                     </div>
                   )}
                   <button 
                     onClick={() => removeAttachment(att.id)}
                     className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-sm hover:bg-red-600 transition-colors z-10"
                   >
                     <Trash2 size={12} />
                   </button>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Toolbar Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center gap-2">
          <div className="flex gap-2">
            {/* Image Upload */}
            <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                title="Adjuntar Imagen"
            >
                <ImageIcon size={20} />
            </button>

            {/* Mic / Record */}
            <button 
                onClick={toggleRecording}
                className={`p-3 rounded-xl shadow-sm transition-all flex items-center gap-2 border ${isRecording 
                    ? 'bg-red-500 text-white border-red-500 animate-pulse' 
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                title="Grabar Audio"
            >
                <Mic size={20} />
            </button>
          </div>

          <div className="flex gap-2">
             {initialNote && (
                 <button 
                    onClick={handleDelete}
                    className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                 >
                    <Trash2 size={20} />
                 </button>
             )}
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <Save size={20} />
                <span>Guardar</span>
              </button>
          </div>
        </div>

      </div>
    </div>
  );
};
