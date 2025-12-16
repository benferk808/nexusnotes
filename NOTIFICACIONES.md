# Sistema de Notificaciones - Nexus Notes

## Estado Actual: PARCIALMENTE FUNCIONAL

Las notificaciones push fueron implementadas pero tienen limitaciones inherentes a las PWA.

---

## Implementacion Actual

### Archivos involucrados:
- `services/notificationService.ts` - Logica de notificaciones en la app
- `public/service-worker.js` - Verificacion de recordatorios en background
- `components/SettingsModal.tsx` - UI para activar permisos
- `components/ReminderPicker.tsx` - Selector de fecha/hora

### Flujo actual:
1. Usuario activa notificaciones en Settings
2. Se pide permiso del navegador (`Notification.requestPermission()`)
3. Service Worker inicia intervalo de verificacion cada 60 segundos
4. SW lee notas de IndexedDB
5. Si hay recordatorio vencido no notificado → muestra notificacion
6. Marca la nota como `notified: true`

---

## Pruebas Realizadas

### En localhost (PC):
| Escenario | Resultado |
|-----------|-----------|
| App en primer plano | ✅ Funciono |
| App en segundo plano (otra pestaña activa) | ✅ Funciono |
| Navegador minimizado | ✅ Funciono |
| Al activar permisos por primera vez | ✅ Funciono |

### En produccion Vercel (PC):
| Escenario | Resultado |
|-----------|-----------|
| Al activar permisos por primera vez | ✅ Funciono |
| Recordatorios subsiguientes | ❌ No funcionaron |
| App en segundo plano | ❌ No funcionaron |

### En Android (Chrome):
| Escenario | Resultado |
|-----------|-----------|
| App abierta en pantalla | ❌ No funciono (despues de activar) |
| App en segundo plano | ❌ No funciono |
| Pantalla bloqueada | ❌ No funciono |

---

## Problema Identificado

### Causa raiz: Service Workers no son persistentes

Los Service Workers estan diseñados para:
- Responder a eventos (fetch, push, sync)
- Ser terminados por el navegador cuando estan inactivos
- NO correr indefinidamente con `setInterval`

Lo que pasa:
1. SW se registra e inicia `setInterval` cada 60 segundos
2. Despues de unos minutos sin actividad, el navegador "duerme" el SW
3. El intervalo deja de ejecutarse
4. No hay mas verificaciones de recordatorios

### Por que funciono al principio:
- Al activar permisos, el SW estaba recien iniciado y activo
- La primera verificacion encontro recordatorios pendientes
- Despues de un tiempo, el SW fue terminado

---

## Limitaciones de PWA vs Apps Nativas

| Caracteristica | App Nativa | PWA (actual) |
|----------------|------------|--------------|
| Proceso en background | ✅ Siempre corriendo | ❌ Termina cuando inactivo |
| Wake locks | ✅ Puede despertar dispositivo | ❌ No puede |
| Push desde servidor | ✅ Si | ⚠️ Requiere backend |
| Alarmas del sistema | ✅ AlarmManager/JobScheduler | ❌ No disponible |
| Funcionamiento offline | ✅ | ✅ |

---

## Soluciones Posibles

### Opcion 1: Verificar al abrir la app (FACIL)
**Esfuerzo:** Bajo
**Confiabilidad:** Media

Agregar verificacion de recordatorios cuando la app se abre:
```typescript
// En App.tsx useEffect
useEffect(() => {
  const interval = setInterval(() => {
    checkReminders(notes, handleMarkNotified);
  }, 60000);

  // Verificar inmediatamente al abrir
  checkReminders(notes, handleMarkNotified);

  return () => clearInterval(interval);
}, [notes]);
```

**Pros:**
- Facil de implementar
- Funciona mientras la app esta abierta
- No requiere backend

**Contras:**
- Solo funciona con la app abierta
- No notifica si la app esta cerrada

---

### Opcion 2: Firebase Cloud Messaging (RECOMENDADO)
**Esfuerzo:** Alto
**Confiabilidad:** Alta

Implementar notificaciones push reales con servidor:

```
[App] → guarda recordatorio → [Supabase]
                                   ↓
                           [Cloud Function]
                                   ↓
                    (cron cada minuto verifica)
                                   ↓
                         [Firebase Cloud Messaging]
                                   ↓
                              [Dispositivo]
```

**Componentes necesarios:**
1. **Firebase Project** - Configurar FCM
2. **Cloud Function** - Verificar recordatorios cada minuto
3. **Supabase Edge Function** o **Vercel Serverless** - Alternativa a Cloud Functions
4. **Token FCM** - Guardar en cada dispositivo

**Pros:**
- Notificaciones reales como WhatsApp
- Funciona con app cerrada
- Funciona con pantalla bloqueada
- Confiable

**Contras:**
- Requiere cuenta Firebase (gratis hasta cierto limite)
- Mas complejidad
- Necesita backend/serverless

---

### Opcion 3: Background Sync API (EXPERIMENTAL)
**Esfuerzo:** Medio
**Confiabilidad:** Baja-Media

Usar Periodic Background Sync (solo Chrome, requiere PWA instalada):

```typescript
// Registrar sync periodico
await registration.periodicSync.register('check-reminders', {
  minInterval: 60 * 1000 // minimo 1 minuto
});

// En service-worker.js
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-reminders') {
    event.waitUntil(checkReminders());
  }
});
```

**Pros:**
- No requiere servidor propio
- Funciona en background

**Contras:**
- Solo Chrome (no Safari, no Firefox)
- Requiere PWA instalada
- El navegador decide cuando ejecutar (no garantiza el intervalo exacto)
- Puede ser bloqueado por ahorro de bateria

---

## Recomendacion

### Para uso actual:
La app funciona muy bien para **organizar tareas por fecha**. Los badges de fecha programada y los grupos visuales son utiles aunque las notificaciones no lleguen.

**Workflow sugerido:**
1. Usar el calendario para agendar tareas
2. Las tareas de "Hoy" aparecen primero con header azul
3. Abrir la app por la mañana para ver que hay para hoy

### Para futuro (si se necesitan notificaciones reales):
Implementar **Firebase Cloud Messaging** con una Cloud Function que:
1. Lea recordatorios de Supabase cada minuto
2. Envie push a los dispositivos registrados
3. Marque como notificado en Supabase

---

## Referencias

- [Service Worker Lifecycle](https://web.dev/service-worker-lifecycle/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Periodic Background Sync](https://web.dev/periodic-background-sync/)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

---

## Fecha de documentacion
16 de Diciembre 2025
