# Nexus Notes v2.0

> App de notas offline-first con sync cloud | React 19 + TypeScript + Supabase

---

## Links de Produccion

| Recurso | URL |
|---------|-----|
| **App Live** | https://nexusnotes-steel.vercel.app/ |
| **GitHub** | https://github.com/benferk808/nexusnotes |
| **Supabase** | https://supabase.com/dashboard (proyecto: Sistema-compras-mare) |

---

## Cuentas

| Servicio | Email | Usuario |
|----------|-------|---------|
| GitHub | fnosieski@hotmail.com | benferk808 |
| Vercel | fnosieski@hotmail.com | - |
| Supabase | (cuenta FERABEN) | proyecto compartido |

---

## Supabase Config

```
URL: https://qjiovckirghjxamqcfuv.supabase.co

API Key (anon):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqaW92Y2tpcmdoanhhbXFjZnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjEwOTEsImV4cCI6MjA2OTkzNzA5MX0.5GhcsREBY_nnfCiTjuwogWlT6fBzv2lT3xljWQISU1s

Tabla: notes (id TEXT PK, updated_at TIMESTAMP, data JSONB)
RLS: Desactivado
```

---

## Estructura del Proyecto (v2.0)

```
C:\Users\Usuario\Omninotes\
├── App.tsx                 # Componente principal, estado global, CRUD, agrupacion por fecha
├── index.tsx               # Entry point React
├── index.html              # HTML base + meta PWA
├── types.ts                # Interfaces TypeScript (Note, Reminder, CategoryConfig, etc.)
├── constants.ts            # APP_TITLE, DEFAULT_CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS
├── manifest.json           # Config PWA (root, legacy)
├── service-worker.js       # SW offline (root, legacy)
│
├── components/
│   ├── NoteCard.tsx        # Tarjeta de nota con badges de fecha/recordatorio
│   ├── NoteEditor.tsx      # Modal editor con fecha programada y recordatorio
│   ├── TabNavigation.tsx   # Tabs dinamicos segun categorias
│   ├── QuickRecorder.tsx   # Grabador voz (modo conduccion)
│   ├── SettingsModal.tsx   # Config Supabase + Notificaciones + Categorias
│   ├── ConfirmationModal.tsx
│   ├── CalendarModal.tsx   # [NUEVO] Vista calendario mensual
│   ├── CategoryManager.tsx # [NUEVO] CRUD de categorias
│   └── ReminderPicker.tsx  # [NUEVO] Selector de fecha/hora recordatorio
│
├── services/
│   ├── storageService.ts   # IndexedDB + sync Supabase + getCategories/saveCategories
│   ├── supabaseService.ts  # Cliente Supabase
│   └── notificationService.ts # [NUEVO] Logica de notificaciones
│
└── public/
    ├── icon-192.png
    ├── icon-512.png
    ├── manifest.json
    └── service-worker.js   # SW con verificacion de recordatorios
```

---

## Stack

| Tech | Version |
|------|---------|
| React | 19.2.1 |
| TypeScript | 5.8.2 |
| Vite | 6.4.1 |
| Tailwind | 3.x (CDN) |
| Lucide React | 0.556.0 |
| Supabase JS | 2.39.0 |
| Hosting | Vercel |

---

## Modelo de Datos (v2.0)

```typescript
// Categorias ahora son dinamicas
type Category = string;

interface CategoryConfig {
  id: string;
  label: string;
  icon: string;      // Nombre de icono Lucide (ej: 'Gamepad2')
  color: string;     // Color Tailwind (ej: 'purple', 'blue', 'green')
}

interface Reminder {
  enabled: boolean;
  datetime: string;      // ISO format: "2025-12-15T10:00:00"
  notified: boolean;     // Ya se envio la notificacion?
}

interface Note {
  id: string;
  category: Category;
  subcategory?: string;
  title: string;
  content: string;
  items: NoteItem[];
  attachments: MediaAttachment[];
  isPinned: boolean;
  scheduledDate?: string;  // [NUEVO] Fecha para la tarea (ISO: "2025-12-15")
  reminder?: Reminder;     // [NUEVO] Recordatorio con notificacion
  createdAt: string;
  updatedAt: string;
}

interface NoteItem {
  id: string;
  text: string;
  completed: boolean;
}

interface MediaAttachment {
  id: string;
  type: 'image' | 'audio';
  data: string;  // base64
  mimeType: string;
  createdAt: string;
}
```

---

## Funcionalidades v2.0

### Nuevas en v2.0:
- **Calendario:** Vista mensual, navegar meses/años, ver tareas por dia, crear notas desde calendario
- **Fecha Programada:** Campo `scheduledDate` para indicar para que dia es la tarea (sin notificacion)
- **Recordatorios:** Campo `reminder` con fecha/hora y notificacion push
- **Categorias Dinamicas:** Agregar, editar, eliminar categorias con colores e iconos personalizados
- **Agrupacion por Fecha:** Notas agrupadas visualmente (Hoy, Mañana, fechas futuras, sin fecha)
- **Notificaciones Push:** Permiso en Settings, Service Worker verifica recordatorios

### Existentes desde v1.0:
- **Notas:** CRUD completo, subcategorias/tags
- **Checklists:** Items con toggle desde dashboard y editor
- **Audio:** Grabacion WebM, modo conduccion pantalla completa
- **Imagenes:** Adjuntar y eliminar, vista previa
- **Busqueda:** Filtro en tiempo real por titulo/contenido
- **Tema:** Oscuro/claro con toggle
- **Storage:** IndexedDB local (offline-first)
- **Sync:** Supabase bidireccional, config desde Settings
- **Backup:** Export/Import JSON
- **PWA:** Instalable, funciona offline, iconos custom

---

## UI de Notas - Badges

| Badge | Color | Icono | Significado |
|-------|-------|-------|-------------|
| Fecha Programada | Violeta | CalendarDays | Para que dia es la tarea |
| Recordatorio futuro | Naranja/Amber | Bell | Notificacion pendiente |
| Recordatorio pasado | Rojo | Bell | Ya paso la hora |
| Subcategoria | Azul | - | Etiqueta/tag |

---

## Agrupacion de Notas

Las notas se agrupan automaticamente por fecha:

| Grupo | Color Header | Orden |
|-------|--------------|-------|
| Hoy | Azul | 1ro |
| Mañana | Violeta | 2do |
| Fechas futuras | Verde | Por fecha cercana |
| Fechas pasadas | Gris | Por fecha reciente |
| Sin fecha | Gris | Ultimo |

---

## Comandos

```bash
npm install      # Instalar dependencias
npm run dev      # Dev server (localhost:5173)
npm run build    # Build produccion (dist/)
npm run preview  # Preview build local
```

---

## Deploy

Automatico via Vercel. Al hacer push a `main`:

```bash
git add .
git commit -m "descripcion"
git push
```

Vercel detecta y deploya en ~30 segundos.

---

## Arquitectura

```
[Usuario] → [PWA/Browser]
              ↓
         [IndexedDB] ← fuente de verdad local
              ↓
         [Supabase] ← sync opcional cuando hay conexion
```

- **Offline-first:** Todo funciona sin internet
- **Sync inteligente:** Merge por timestamp updatedAt
- **Sin backend propio:** Estatico + Supabase

---

## Warnings Conocidos (no criticos)

1. **Tailwind CDN** - "should not be used in production" → funciona OK
2. **Multiple GoTrueClient** - warning de Supabase dev → no afecta
3. **Bundle size** - 1.3MB JS, considerar code-splitting en futuro

---

## Limitaciones Conocidas

### Notificaciones Push (ver NOTIFICACIONES.md)
- Las notificaciones solo funcionan con la app abierta
- Service Worker se "duerme" cuando esta inactivo
- Para notificaciones confiables se necesitaria Firebase Cloud Messaging

---

## Backlog Futuro

- [ ] Instalar Tailwind como dependencia (eliminar CDN)
- [ ] Code-splitting para reducir bundle
- [ ] Firebase Cloud Messaging para notificaciones push reales
- [ ] Autenticacion opcional
- [ ] Temas de colores custom

---

## Historial

| Fecha | Version | Cambios |
|-------|---------|---------|
| 16 Dic 2025 | 2.0.0 | Calendario, Recordatorios, Categorias Dinamicas, Agrupacion por Fecha |
| 12 Dic 2025 | 1.0.1 | Fix: Sync de eliminacion entre dispositivos |
| 11 Dic 2025 | 1.0.0 | Release inicial: GitHub + Vercel + iconos PWA |
| 10 Dic 2025 | 0.9 | Config Supabase, limpieza Gemini |

---

## Bugs Resueltos (Referencia Tecnica)

### Bug: Notas del calendario no se guardaban (16 Dic 2025)

**Sintoma:** Al crear una nota desde el calendario, se abria el editor pero al guardar no aparecia la nota.

**Causa:** `handleSaveNote` verificaba `if (editingNote)` para decidir si era edicion o creacion. Las notas del calendario tenian `editingNote` seteado (con el objeto pre-poblado), pero el ID no existia en el array de notas, entonces el `.map()` no encontraba la nota para actualizar.

**Solucion:** Cambiar la logica a verificar si la nota realmente existe en el array:
```typescript
const noteExists = notes.some(n => n.id === noteToSave.id);
if (noteExists) {
    updatedNotes = notes.map(...); // Actualizar existente
} else {
    updatedNotes = [noteToSave, ...notes]; // Agregar nueva
}
```

### Bug: Notas eliminadas reaparecen (12 Dic 2025)

**Sintoma:** Al eliminar una nota, parecia eliminarse, pero al refrescar la app volvia a aparecer.

**Causa:** `syncNotesToCloud()` solo hacia UPSERT, nunca DELETE.

**Solucion:** Nueva funcion `deleteNoteFromCloud()` y logica de merge mejorada.

---

## Creditos

- Desarrollo inicial: Gemini 2.5 Pro
- v2.0 (Calendario, Categorias, Recordatorios): Claude Opus 4.5 (Anthropic)
- Uso: Personal y comercial libre
