import { Note } from '../types';

// Check if notifications are supported
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window;
};

// Get current permission status
export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported in this browser');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Show a notification
export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (getNotificationPermission() !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    const notification = new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options,
    });

    // Auto close after 10 seconds
    setTimeout(() => notification.close(), 10000);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

// Check and trigger notifications for due reminders
export const checkReminders = (notes: Note[], onReminderTriggered: (noteId: string) => void): void => {
  const now = new Date();

  notes.forEach(note => {
    if (note.reminder?.enabled && !note.reminder.notified) {
      const reminderDate = new Date(note.reminder.datetime);

      // If reminder time has passed (within last 5 minutes to avoid old notifications)
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      if (reminderDate <= now && reminderDate >= fiveMinutesAgo) {
        // Show notification
        showNotification(`Recordatorio: ${note.title}`, {
          body: note.content || 'Tienes un recordatorio programado',
          tag: `reminder-${note.id}`,
          requireInteraction: true,
        });

        // Mark as notified
        onReminderTriggered(note.id);
      }
    }
  });
};

// Register for periodic sync (if supported)
export const registerPeriodicSync = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator && 'periodicSync' in (navigator as any)) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).periodicSync.register('check-reminders', {
        minInterval: 60 * 1000, // 1 minute
      });
      console.log('Periodic sync registered');
      return true;
    } catch (error) {
      console.warn('Periodic sync not available:', error);
      return false;
    }
  }
  return false;
};
