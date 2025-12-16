const CACHE_NAME = 'omninotes-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// IndexedDB config
const DB_NAME = 'OmniNotesDB';
const STORE_NAME = 'notes';

// Open IndexedDB
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Get all notes from IndexedDB
const getNotesFromDB = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('SW: Error reading notes from DB', error);
    return [];
  }
};

// Update note in IndexedDB (mark as notified)
const markNoteAsNotified = async (noteId) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(noteId);

      getRequest.onsuccess = () => {
        const note = getRequest.result;
        if (note && note.reminder) {
          note.reminder.notified = true;
          const putRequest = store.put(note);
          putRequest.onsuccess = () => resolve(true);
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(false);
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('SW: Error updating note', error);
    return false;
  }
};

// Check reminders and show notifications
const checkReminders = async () => {
  // Check if we have notification permission
  if (Notification.permission !== 'granted') {
    console.log('SW: No notification permission, skipping reminder check');
    return;
  }

  try {
    const notes = await getNotesFromDB();
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    for (const note of notes) {
      if (note.reminder?.enabled && !note.reminder.notified) {
        const reminderDate = new Date(note.reminder.datetime);

        if (reminderDate <= now && reminderDate >= fiveMinutesAgo) {
          // Show notification
          self.registration.showNotification(`Recordatorio: ${note.title}`, {
            body: note.content || 'Tienes un recordatorio programado',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: `reminder-${note.id}`,
            requireInteraction: true,
            data: { noteId: note.id },
            actions: [
              { action: 'open', title: 'Abrir' },
              { action: 'dismiss', title: 'Descartar' }
            ]
          });

          // Mark as notified
          await markNoteAsNotified(note.id);
          console.log('SW: Reminder notification sent for:', note.title);
        }
      }
    }
  } catch (error) {
    console.error('SW: Error checking reminders', error);
  }
};

// Start periodic reminder check
let reminderInterval = null;
const startReminderCheck = () => {
  if (reminderInterval) return;
  reminderInterval = setInterval(checkReminders, 60000); // Check every minute
  checkReminders(); // Check immediately on start
  console.log('SW: Reminder checking started');
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();

  // Start reminder checking when SW activates
  startReminderCheck();
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open or focus the app
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Handle messages from main app
self.addEventListener('message', (event) => {
  if (event.data === 'START_REMINDER_CHECK') {
    startReminderCheck();
  }
});

self.addEventListener('fetch', (event) => {
  // Para una SPA (Single Page App), las navegaciones deben devolver index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Estrategia Stale-while-revalidate para recursos
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cacheamos respuestas válidas de CDN y propias
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
          // Si falla la red, devolvemos lo que haya en caché aunque sea undefined (el navegador lo manejará)
          return cachedResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});