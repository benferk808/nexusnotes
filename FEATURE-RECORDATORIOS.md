# Feature: Sistema de Recordatorios con Notificaciones

> Estado: PENDIENTE DE IMPLEMENTACION
> Prioridad: Alta
> Fecha: 12 Dic 2025

---

## Objetivo

Agregar recordatorios a Nexus Notes que notifiquen al usuario en fecha/hora programada, incluso con la app cerrada. Similar a Google Calendar pero integrado en la app de notas.

---

## Caso de Uso Principal

> "Voy conduciendo a un cliente y tengo un recordatorio programado para las 10:00.
> El cel suena/vibra, miro y veo la notificacion que dice 'Pasar por farmacia'.
> Toco la notificacion, se abre la app y puedo marcar Completado, Postergar o Editar."

---

## Dispositivos del Usuario

| Dispositivo | Sistema | PWA Instalada | Notificaciones |
|-------------|---------|---------------|----------------|
| PC | Windows | Si | Funciona con navegador abierto |
| Celular | Android | Si | Funciona con app cerrada |
| Tablet | Android | Si | Funciona con app cerrada |

**Nota:** No usa iOS, por lo que no hay limitaciones de Apple.

---

## Solucion Tecnica

### Sin servicios externos
- NO Firebase
- NO backend propio
- NO servicios de push
- Todo local con Service Worker + IndexedDB

### APIs a usar
- **Notifications API** - Mostrar notificaciones nativas
- **Service Worker** - Ejecutar en background
- **IndexedDB** - Ya lo usamos, guardar recordatorios ahi

---

## Modelo de Datos (cambios)

Agregar campo opcional `reminder` a la interface Note:

```typescript
interface Note {
  // ... campos existentes ...
  reminder?: {
    enabled: boolean;
    datetime: string;      // ISO format: "2025-12-15T10:00:00"
    notified: boolean;     // Ya se envio la notificacion?
    snoozedUntil?: string; // Si se pospuso, nueva fecha
  };
}
```

---

## Componentes a Crear/Modificar

### 1. ReminderPicker.tsx (NUEVO)
- Selector de fecha (calendario simple)
- Selector de hora
- Toggle activar/desactivar
- Boton "Quitar recordatorio"

### 2. NoteEditor.tsx (MODIFICAR)
- Agregar icono de campana/reloj
- Al tocar, abre ReminderPicker
- Mostrar indicador si tiene recordatorio activo

### 3. NoteCard.tsx (MODIFICAR)
- Mostrar icono si la nota tiene recordatorio
- Mostrar fecha/hora del recordatorio

### 4. service-worker.js (MODIFICAR)
- Chequeo periodico de recordatorios pendientes
- Disparar notificacion cuando llegue la hora
- Manejar acciones: Completar, Postergar, Abrir

### 5. NotificationService.ts (NUEVO)
- Pedir permiso de notificaciones
- Registrar/cancelar recordatorios
- Logica de snooze (postergar)

---

## Flujo de Usuario

### Crear recordatorio:
1. Usuario abre/crea nota
2. Toca icono de campana
3. Selecciona fecha y hora
4. Guarda nota
5. Recordatorio queda programado

### Recibir notificacion:
1. Llega la hora programada
2. Service Worker detecta el recordatorio
3. Muestra notificacion con sonido/vibracion
4. Notificacion muestra: Titulo de la nota + acciones

### Acciones en notificacion:
- **Completar** - Marca item como completado (si es checklist) o quita recordatorio
- **Postergar 1h** - Reprograma +1 hora
- **Abrir** - Abre la app en esa nota

---

## Implementacion por Pasos

### Paso 1: Permiso de notificaciones
- Agregar boton en Settings para activar notificaciones
- Pedir permiso al usuario
- Guardar estado del permiso

### Paso 2: UI de recordatorios
- Crear ReminderPicker
- Integrar en NoteEditor
- Mostrar indicador en NoteCard

### Paso 3: Logica de Service Worker
- Modificar service-worker.js
- Agregar chequeo periodico (cada 1 minuto)
- Disparar notificaciones

### Paso 4: Acciones de notificacion
- Implementar Completar
- Implementar Postergar
- Implementar Abrir app

### Paso 5: Sync con Supabase
- Los recordatorios se sincronizan como parte de la nota
- Funciona entre dispositivos

---

## Consideraciones Tecnicas

### Service Worker en Android
- Las PWA instaladas mantienen el SW activo
- Android permite "wake up" del SW para notificaciones
- Funciona con app cerrada

### Precision del tiempo
- El chequeo cada 1 minuto puede tener +/- 1 min de desfase
- Aceptable para recordatorios tipo agenda
- No es para alarmas de precision de segundos

### Bateria
- El chequeo periodico consume bateria minima
- Android optimiza esto para PWAs instaladas

### Offline
- Recordatorios funcionan 100% offline
- No dependen de conexion a internet
- Se sincronizan cuando hay conexion

---

## UI Propuesta

### En NoteEditor:
```
[Icono Campana] Recordatorio: 15 Dic 2025, 10:00 AM  [X]
```

### En NoteCard:
```
+------------------------------------------+
| Mi Nota                           [Bell] |
| Contenido preview...                     |
| 15 Dic, 10:00                           |
+------------------------------------------+
```

### Notificacion Android:
```
+------------------------------------------+
| Nexus Notes                              |
| Pasar por farmacia                       |
| Recordatorio programado                  |
|                                          |
| [Completar]  [+1 hora]  [Abrir]         |
+------------------------------------------+
```

---

## Estimacion

| Paso | Tiempo estimado |
|------|-----------------|
| Permiso notificaciones | 30 min |
| UI ReminderPicker | 1 hora |
| Integrar en Editor/Card | 30 min |
| Service Worker | 1-2 horas |
| Acciones notificacion | 1 hora |
| Testing y ajustes | 1 hora |

**Total estimado:** 1 sesion de trabajo

---

## Para la proxima sesion

1. Leer CLAUDE.md (contexto general de la app)
2. Leer este archivo (FEATURE-RECORDATORIOS.md)
3. Empezar por Paso 1: Permiso de notificaciones
4. Seguir en orden hasta completar

---

## Referencias

- [Notifications API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Service Worker MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Notifications en Android](https://web.dev/push-notifications-overview/)
