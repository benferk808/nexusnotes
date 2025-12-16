import React, { useState, useMemo } from 'react';
import { Note, CategoryConfig } from '../types';
import { X, ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  categories: CategoryConfig[];
  onCreateNote: (date: Date, category: string) => void;
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Color mappings
const colorStyles: Record<string, { bg: string; text: string; light: string }> = {
  purple: { bg: 'bg-purple-500', text: 'text-purple-500', light: 'bg-purple-100 dark:bg-purple-900/30' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-100 dark:bg-blue-900/30' },
  green: { bg: 'bg-green-500', text: 'text-green-500', light: 'bg-green-100 dark:bg-green-900/30' },
  red: { bg: 'bg-red-500', text: 'text-red-500', light: 'bg-red-100 dark:bg-red-900/30' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-500', light: 'bg-orange-100 dark:bg-orange-900/30' },
  yellow: { bg: 'bg-yellow-500', text: 'text-yellow-500', light: 'bg-yellow-100 dark:bg-yellow-900/30' },
  pink: { bg: 'bg-pink-500', text: 'text-pink-500', light: 'bg-pink-100 dark:bg-pink-900/30' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-500', light: 'bg-cyan-100 dark:bg-cyan-900/30' },
};

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  notes,
  categories,
  onCreateNote,
}) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Get notes by date (scheduledDate or reminder)
  const notesByDate = useMemo(() => {
    const map = new Map<string, Note[]>();
    notes.forEach(note => {
      let date: Date | null = null;

      // Priority: scheduledDate first, then reminder
      if (note.scheduledDate) {
        date = new Date(note.scheduledDate + 'T00:00:00');
      } else if (note.reminder?.enabled) {
        date = new Date(note.reminder.datetime);
      }

      if (date) {
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push(note);
      }
    });
    return map;
  }, [notes]);

  // Calendar calculation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Padding days from previous month
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentDate]);

  const navigateMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const navigateYear = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear() + delta, currentDate.getMonth(), 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const handleDayClick = (date: Date) => {
    // If clicking the same date, toggle off
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      setSelectedDate(null);
      setShowCategoryPicker(false);
    } else {
      setSelectedDate(date);
      setShowCategoryPicker(false); // First show date info, then user clicks "Nueva nota"
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    if (selectedDate) {
      onCreateNote(selectedDate, categoryId);
      setShowCategoryPicker(false);
      setSelectedDate(null);
      onClose();
    }
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const getNotesForDate = (date: Date) => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return notesByDate.get(key) || [];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md max-h-[90vh] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="text-blue-500" size={24} />
            Calendario
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateYear(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              title="Anio anterior"
            >
              <ChevronLeft size={16} />
              <ChevronLeft size={16} className="-ml-3" />
            </button>
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <button
            onClick={goToToday}
            className="px-4 py-2 text-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span className="font-bold text-gray-900 dark:text-white">
              {MONTHS[currentDate.getMonth()]}
            </span>
            <span className="ml-2 text-gray-500 dark:text-gray-400">
              {currentDate.getFullYear()}
            </span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => navigateYear(1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              title="Anio siguiente"
            >
              <ChevronRight size={16} />
              <ChevronRight size={16} className="-ml-3" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
          {DAYS.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 p-4">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const notesOnDate = getNotesForDate(date);
            const hasNotes = notesOnDate.length > 0;
            const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDayClick(date)}
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center relative
                  transition-all hover:scale-105 active:scale-95
                  ${isSelected && !isToday(date)
                    ? 'bg-amber-500 text-white font-bold shadow-lg shadow-amber-500/30 ring-2 ring-amber-300'
                    : isToday(date)
                      ? 'bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/30'
                      : isPast
                        ? 'text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <span className="text-sm">{date.getDate()}</span>
                {hasNotes && (
                  <div className="flex gap-0.5 mt-0.5">
                    {notesOnDate.slice(0, 3).map((note, i) => {
                      const category = categories.find(c => c.id === note.category);
                      const colors = colorStyles[category?.color || 'blue'];
                      return (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${colors.bg}`}
                        />
                      );
                    })}
                    {notesOnDate.length > 3 && (
                      <span className="text-[8px] text-gray-400">+{notesOnDate.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Date Info */}
        {selectedDate && !showCategoryPicker && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">
                {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
              <button
                onClick={() => setShowCategoryPicker(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus size={18} />
                Nueva nota
              </button>
            </div>

            {/* Show notes for selected date */}
            {getNotesForDate(selectedDate).length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tareas programadas:</p>
                {getNotesForDate(selectedDate).map(note => {
                  const category = categories.find(c => c.id === note.category);
                  const colors = colorStyles[category?.color || 'blue'];
                  return (
                    <div key={note.id} className={`p-2 rounded-lg ${colors.light}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${colors.bg}`} />
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {note.title || 'Sin titulo'}
                        </span>
                        {note.reminder?.enabled && (
                          <span className="text-xs text-amber-600 ml-auto">
                            {new Date(note.reminder.datetime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Category Picker */}
        {showCategoryPicker && selectedDate && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 animate-in slide-in-from-bottom-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Crear nota para el <span className="font-semibold">{selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
            </p>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Selecciona categoria:</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(category => {
                const colors = colorStyles[category.color] || colorStyles.blue;
                const IconComponent = (Icons as any)[category.icon];
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors ${colors.light}`}
                  >
                    {IconComponent && <IconComponent size={18} className={colors.text} />}
                    <span className="font-medium text-gray-800 dark:text-gray-200">{category.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => { setShowCategoryPicker(false); setSelectedDate(null); }}
              className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
