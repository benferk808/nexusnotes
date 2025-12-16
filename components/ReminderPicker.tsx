import React, { useState, useEffect } from 'react';
import { Reminder } from '../types';
import { Bell, BellOff, X, Calendar, Clock } from 'lucide-react';

interface ReminderPickerProps {
  reminder?: Reminder;
  onChange: (reminder: Reminder | undefined) => void;
}

export const ReminderPicker: React.FC<ReminderPickerProps> = ({ reminder, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (reminder?.enabled && reminder.datetime) {
      const dt = new Date(reminder.datetime);
      setDate(dt.toISOString().split('T')[0]);
      setTime(dt.toTimeString().slice(0, 5));
    } else {
      // Default to tomorrow at 9:00
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      setDate(tomorrow.toISOString().split('T')[0]);
      setTime('09:00');
    }
  }, [reminder, isOpen]);

  const handleSave = () => {
    if (date && time) {
      const datetime = new Date(`${date}T${time}:00`).toISOString();
      onChange({
        enabled: true,
        datetime,
        notified: false
      });
      setIsOpen(false);
    }
  };

  const handleRemove = () => {
    onChange(undefined);
    setIsOpen(false);
  };

  const formatReminder = (r: Reminder) => {
    const dt = new Date(r.datetime);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = dt.toDateString() === today.toDateString();
    const isTomorrow = dt.toDateString() === tomorrow.toDateString();

    let dateStr = '';
    if (isToday) {
      dateStr = 'Hoy';
    } else if (isTomorrow) {
      dateStr = 'Manana';
    } else {
      dateStr = dt.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    }

    const timeStr = dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr}, ${timeStr}`;
  };

  const isPast = reminder?.enabled && new Date(reminder.datetime) < new Date();

  return (
    <div className="relative">
      {/* Trigger Button */}
      {reminder?.enabled ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isPast
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
          }`}
        >
          <Bell size={16} className={isPast ? 'text-red-500' : 'text-amber-500'} />
          {formatReminder(reminder)}
          <X
            size={14}
            className="ml-1 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 transition-colors"
        >
          <BellOff size={16} />
          Agregar recordatorio
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl p-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bell className="text-amber-500" size={20} />
                Recordatorio
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Date Input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  <Calendar size={16} />
                  Fecha
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Time Input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  <Clock size={16} />
                  Hora
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Quick Options */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Hoy 18:00', hours: 0, time: '18:00' },
                  { label: 'Manana 9:00', hours: 24, time: '09:00' },
                  { label: 'Manana 14:00', hours: 24, time: '14:00' },
                ].map((opt) => {
                  const d = new Date();
                  if (opt.hours > 0) d.setDate(d.getDate() + 1);
                  const dateStr = d.toISOString().split('T')[0];
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => {
                        setDate(dateStr);
                        setTime(opt.time);
                      }}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              {reminder?.enabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex-1 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  Quitar
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
