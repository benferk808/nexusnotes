import React from 'react';
import { Note } from '../types';
import { Clock, Image as ImageIcon, Mic, Trash2, Check, Bell, CalendarDays } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onClick: (note: Note) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onToggleItem: (noteId: string, itemId: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onClick, onDelete, onToggleItem }) => {
  const hasImages = note.attachments.some(a => a.type === 'image');
  const hasAudio = note.attachments.some(a => a.type === 'audio');
  const hasReminder = note.reminder?.enabled;
  const hasScheduledDate = !!note.scheduledDate;

  // Format relative time loosely
  const date = new Date(note.createdAt);
  const timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

  // Format scheduled date (just date, no time)
  const formatScheduledDate = () => {
    if (!note.scheduledDate) return null;
    const dt = new Date(note.scheduledDate + 'T00:00:00'); // Add time to avoid timezone issues
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = dt.toDateString() === today.toDateString();
    const isTomorrow = dt.toDateString() === tomorrow.toDateString();
    const isPast = dt < today;

    let dateStr = '';
    if (isToday) {
      dateStr = 'Hoy';
    } else if (isTomorrow) {
      dateStr = 'Manana';
    } else {
      dateStr = dt.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    }
    return { text: dateStr, isPast };
  };

  // Format reminder date
  const formatReminderDate = () => {
    if (!note.reminder?.enabled) return null;
    const dt = new Date(note.reminder.datetime);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = dt.toDateString() === today.toDateString();
    const isTomorrow = dt.toDateString() === tomorrow.toDateString();
    const isPast = dt < today;

    let dateStr = '';
    if (isToday) {
      dateStr = 'Hoy';
    } else if (isTomorrow) {
      dateStr = 'Manana';
    } else {
      dateStr = dt.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
    const timeStr = dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return { text: `${dateStr} ${timeStr}`, isPast };
  };

  const scheduledInfo = formatScheduledDate();
  const reminderInfo = formatReminderDate();

  const handleCheckboxClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation(); // Stop opening the editor
    onToggleItem(note.id, itemId);
  };

  return (
    <div 
      onClick={() => onClick(note)}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer active:scale-[0.98] group relative"
    >
      <div className="flex justify-between items-start mb-2 pr-6">
        <div>
          <div className="flex flex-wrap gap-1 mb-1">
            {note.subcategory && (
              <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {note.subcategory}
              </span>
            )}
            {hasScheduledDate && scheduledInfo && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                scheduledInfo.isPast
                  ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
              }`}>
                <CalendarDays size={10} />
                {scheduledInfo.text}
              </span>
            )}
            {hasReminder && reminderInfo && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                reminderInfo.isPast
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
              }`}>
                <Bell size={10} />
                {reminderInfo.text}
              </span>
            )}
          </div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-1">{note.title || "Sin titulo"}</h3>
        </div>
      </div>

      {/* Always visible delete button, positioned absolute top-right for easy access */}
      <button 
          onClick={(e) => onDelete(e, note.id)}
          className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-2 -mr-2 -mt-2 transition-colors"
      >
          <Trash2 size={20} />
      </button>

      {/* Content Preview */}
      {note.content && (
         <div className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3 whitespace-pre-line">
            {note.content}
         </div>
      )}

      {/* Checklist Preview - Interactive now! */}
      {note.items.length > 0 && (
        <div className="mt-2 space-y-2 mb-3">
            {note.items.slice(0, 5).map((item) => (
                <div 
                    key={item.id} 
                    className="flex items-start gap-2 text-sm"
                    onClick={(e) => handleCheckboxClick(e, item.id)}
                >
                     <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-400 dark:border-gray-500'}`}>
                        {item.completed && <Check size={10} className="text-white"/>}
                     </div>
                     <span className={`flex-1 leading-tight ${item.completed ? 'line-through opacity-50 text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
                        {item.text}
                     </span>
                </div>
            ))}
            {note.items.length > 5 && <span className="text-xs opacity-50 pl-6">+{note.items.length - 5} ítems más...</span>}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400 mt-2 border-t border-gray-100 dark:border-gray-700 pt-2">
        <div className="flex gap-3">
          {hasImages && <span className="flex items-center gap-1"><ImageIcon size={14}/> Img</span>}
          {hasAudio && <span className="flex items-center gap-1"><Mic size={14}/> Audio</span>}
        </div>
        <div className="flex items-center gap-1">
            <Clock size={12} />
            {timeStr}
        </div>
      </div>
    </div>
  );
};
