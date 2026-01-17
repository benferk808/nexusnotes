# Nexus Notes v2.1.0

> App de notas offline-first con sync cloud | React 19 + TypeScript + Supabase

---

## Contexto Empresarial

**Nexus Notes** es parte del ecosistema **FERABEN/MARE** y cumple un doble propósito:

1. **Mantener Supabase activo:** Comparte la cuenta de Supabase con el Sistema de Compras. Al usarla regularmente, evita que la base de datos entre en modo "pausa" por inactividad.

2. **App de notas personal:** Una herramienta útil para gestionar notas de trabajo, gaming y vida personal con sincronización entre dispositivos.

**Visión futura:** Potencial para convertirse en una app pública/gratuita para otros usuarios, manteniendo una versión separada para uso personal.

---

## Links de Producción

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
| Supabase | (cuenta FERABEN - Sistema Compras) | proyecto compartido |

---

## Ubicación del Proyecto

```
C:\Users\Usuario\FERABEN_MARE\nexus\
```

**Parte del ecosistema:**
```
FERABEN_MARE/
├── _DOCUMENTACION/
├── mare-catalog-v2/
├── feraben-crm-v2-test/
├── ERP-ferabensrl-claude/
├── mare-website/
├── sistema-compras-mare/
└── nexus/                  ← Esta app
```

---

## Stack Tecnológico

| Tech | Versión | Propósito |
|------|---------|-----------|
| React | 19.2.1 | Framework UI |
| TypeScript | ~5.8.2 | Tipado estático |
| Vite | 6.2.0 | Bundler y dev server |
| Tailwind CSS | 3.x (CDN) | Estilos |
| Lucide React | 0.556.0 | Iconos |
| Supabase JS | 2.39.0 | Backend/DB |
| IndexedDB | Nativo | Storage local |
| Vercel | - | Hosting |

---

## Estructura del Proyecto

```
nexus/
├── App.tsx                 # Componente principal (567 líneas)
├── index.tsx               # Entry point React + SW registration
├── index.html              # HTML base + meta PWA + Tailwind CDN
├── types.ts                # Interfaces TypeScript (63 líneas)
├── constants.ts            # Categorías default, colores, iconos (39 líneas)
├── manifest.json           # Config PWA (root)
│
├── components/
│   ├── NoteCard.tsx        # Tarjeta de nota (165 líneas)
│   ├── NoteEditor.tsx      # Modal editor con multimedia (370+ líneas)
│   ├── TabNavigation.tsx   # Tabs dinámicos (48 líneas)
│   ├── QuickRecorder.tsx   # Grabador voz modo conducción (135 líneas)
│   ├── SettingsModal.tsx   # Config Supabase + Notificaciones (200+ líneas)
│   ├── ConfirmationModal.tsx # Modal confirmación (53 líneas)
│   ├── CalendarModal.tsx   # Vista calendario mensual (250+ líneas)
│   ├── CategoryManager.tsx # CRUD de categorías (250+ líneas)
│   └── ReminderPicker.tsx  # Selector fecha/hora recordatorio (203 líneas)
│
├── services/
│   ├── storageService.ts   # IndexedDB + sync híbrido (260 líneas)
│   ├── supabaseService.ts  # Cliente Supabase CRUD (141 líneas)
│   └── notificationService.ts # Lógica notificaciones (99 líneas)
│
├── public/
│   ├── icon-192.png        # Icono PWA 192x192
│   ├── icon-512.png        # Icono PWA 512x512
│   ├── manifest.json       # Manifest PWA
│   └── service-worker.js   # SW para cache offline (62 líneas)
│
├── CLAUDE.md               # Este archivo
├── NOTIFICACIONES.md       # Doc sistema notificaciones
└── FEATURE-RECORDATORIOS.md # Roadmap notificaciones
```

**Total líneas de código:** ~2,500-3,000 LOC

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         Usuario                              │
│                           ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    PWA / Browser                        ││
│  │  ┌─────────────────────────────────────────────────┐   ││
│  │  │ React App (App.tsx)                             │   ││
│  │  │ ├── Estado global (notes, categories)           │   ││
│  │  │ ├── Componentes UI                              │   ││
│  │  │ └── Handlers CRUD                               │   ││
│  │  └─────────────────────────────────────────────────┘   ││
│  │                      ↓                                  ││
│  │  ┌─────────────────────────────────────────────────┐   ││
│  │  │ Storage Service (storageService.ts)             │   ││
│  │  │ ├── Abstracción de storage                      │   ││
│  │  │ └── Lógica de sincronización híbrida            │   ││
│  │  └─────────────────────────────────────────────────┘   ││
│  │           ↓                         ↓                   ││
│  │  ┌──────────────────┐    ┌─────────────────────┐       ││
│  │  │ IndexedDB        │    │ Supabase            │       ││
│  │  │ (Local/Instant)  │←──→│ (Cloud/Background)  │       ││
│  │  │ DB: OmniNotesDB  │    │ Tablas: notes,      │       ││
│  │  │ Store: notes     │    │         categories  │       ││
│  │  └──────────────────┘    └─────────────────────┘       ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Principios:**
- **Offline-first:** Todo funciona sin internet
- **Local es instantáneo:** UI responde inmediatamente
- **Cloud es background:** Sincronización no bloquea UI
- **Last-Write-Wins:** Conflictos se resuelven por timestamp

---

## Supabase Config

```
URL: https://qjiovckirghjxamqcfuv.supabase.co

Tablas:
├── notes (id TEXT PK, updated_at TIMESTAMP, data JSONB)
└── categories (id TEXT PK DEFAULT 'default', updated_at TIMESTAMP, data JSONB)

RLS: Desactivado (proyecto personal)
Cuenta: Compartida con Sistema de Compras
```

### SQL para crear tablas:

```sql
-- Tabla notes
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL
);

-- Tabla categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT 'default',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL
);
```

---

## Modelo de Datos

```typescript
// Categoría dinámica
interface CategoryConfig {
  id: string;           // 'gaming', 'work', 'personal', 'cat_1702234890'
  label: string;        // 'Gaming', 'Trabajo', 'Personal'
  icon: string;         // Nombre Lucide: 'Gamepad2', 'Briefcase', 'User'
  color: string;        // Tailwind: 'purple', 'blue', 'green', 'red'
}

// Recordatorio
interface Reminder {
  enabled: boolean;
  datetime: string;     // ISO: "2025-12-15T10:00:00"
  notified: boolean;    // Ya se envió notificación?
}

// Nota principal
interface Note {
  id: string;
  category: string;
  subcategory?: string;
  title: string;
  content: string;
  items: NoteItem[];
  attachments: MediaAttachment[];
  isPinned: boolean;
  scheduledDate?: string;   // Fecha para la tarea (YYYY-MM-DD)
  reminder?: Reminder;      // Recordatorio con notificación
  createdAt: string;
  updatedAt: string;
}

// Item de checklist
interface NoteItem {
  id: string;
  text: string;
  completed: boolean;
}

// Adjunto multimedia
interface MediaAttachment {
  id: string;
  type: 'image' | 'audio';
  data: string;         // Base64 encoded
  mimeType: string;     // 'image/png', 'audio/webm'
  createdAt: string;
  transcription?: string; // Para audio (no implementado)
}

// Configuración de app
interface AppSettings {
  darkMode: boolean;
  lastSync: string | null;
  supabaseConfig?: SupabaseConfig;
  notificationsEnabled?: boolean;
}
```

---

## Funcionalidades

### Core
| Feature | Descripción |
|---------|-------------|
| CRUD Notas | Crear, editar, eliminar notas |
| Checklists | Items con toggle desde dashboard |
| Categorías dinámicas | Crear, editar, eliminar con icono/color custom |
| Búsqueda | Filtro tiempo real por título/contenido |
| Dark/Light mode | Toggle en header |

### Multimedia
| Feature | Descripción |
|---------|-------------|
| Grabación de voz | Modo conducción (pantalla roja fullscreen) |
| Adjuntar imágenes | Upload → Base64 → Preview |
| Adjuntar audio | Grabación WebM desde micrófono |

### Organización
| Feature | Descripción |
|---------|-------------|
| Calendario mensual | Vista de notas por día, crear desde calendario |
| Fecha programada | Campo `scheduledDate` para scheduling |
| Recordatorios | Fecha/hora con notificación (parcialmente funcional) |
| Agrupación por fecha | Hoy, Mañana, Futuro, Pasado, Sin fecha |

### Sincronización
| Feature | Descripción |
|---------|-------------|
| IndexedDB | Storage local instantáneo |
| Supabase sync | Background sync multi-dispositivo |
| Export JSON | Backup completo descargable |
| Import JSON | Restaurar/fusionar backups |

### PWA
| Feature | Descripción |
|---------|-------------|
| Instalable | Manifest + iconos |
| Offline | Service Worker con cache |
| Responsive | Funciona en móvil y desktop |

---

## Flujos de Uso Principales

### Flujo 1: Nota rápida de voz (conduciendo)
```
1. Toca botón Mic (rojo) → QuickRecorder abre
2. Pantalla fullscreen roja, timer corriendo
3. Habla → Toca STOP
4. Audio guardado → Nota creada automáticamente
5. Sync a Supabase en background
```

### Flujo 2: Tarea con checklist
```
1. Toca botón + (azul) → NoteEditor abre
2. Escribe título + contenido
3. Agrega items con "+Agregar item"
4. Guarda
5. En dashboard: toggle items directamente sin abrir editor
```

### Flujo 3: Programar tarea para mañana
```
1. Abre editor (nueva o existente)
2. Setea fecha programada (input date)
3. Opcionalmente agrega recordatorio (fecha + hora)
4. Guarda
5. Nota aparece bajo "Mañana" en dashboard
```

### Flujo 4: Multi-dispositivo
```
Dispositivo A: Crea nota → IndexedDB + Supabase
Dispositivo B: Abre app → Fetch Supabase → Merge → Ve nota de A
```

---

## Estrategia de Sincronización

### getNotes() - Flujo híbrido
```
1. Carga IndexedDB (instantáneo, UI lista)
2. Si Supabase configurado:
   ├── Fetch cloud en paralelo
   ├── Merge: cloud es verdad sobre EXISTENCIA
   ├── Local mantiene versiones MÁS NUEVAS (por updatedAt)
   ├── Notas solo en local → Se eliminan (borradas en otro device)
   └── Sube locales más nuevas a cloud
3. Retorna notas mergeadas, ordenadas
```

### saveNotes() - Write-through
```
1. Guarda en IndexedDB (inmediato, blocking)
2. Sube a Supabase (background, fire & forget)
```

### deleteNote() - Cascada
```
1. Filtra del array local
2. Guarda array en IndexedDB
3. DELETE de Supabase (background)
```

---

## UI - Badges de Notas

| Badge | Color | Icono | Significado |
|-------|-------|-------|-------------|
| Fecha programada | Violeta | CalendarDays | Para qué día es la tarea |
| Recordatorio futuro | Naranja | Bell | Notificación pendiente |
| Recordatorio pasado | Rojo/Gris | Bell | Ya pasó la hora |
| Subcategoría | Azul | - | Etiqueta/tag |
| Img | Azul | - | Tiene imagen adjunta |
| Audio | Azul | - | Tiene audio adjunto |

---

## Agrupación de Notas

| Grupo | Color Header | Orden |
|-------|--------------|-------|
| Hoy | Azul | 1ro |
| Mañana | Violeta | 2do |
| Fechas futuras | Verde | Por fecha cercana |
| Fechas pasadas | Gris | Por fecha reciente |
| Sin fecha | Gris | Último |

---

## Comandos

```bash
npm install      # Instalar dependencias
npm run dev      # Dev server (localhost:3000, accesible en red)
npm run build    # Build producción (dist/)
npm run preview  # Preview build local
```

---

## Deploy

Automático via Vercel al push a `main`:

```bash
git add .
git commit -m "descripcion"
git push
```

Deploy en ~30 segundos.

---

## Limitaciones Conocidas

### Notificaciones Push
- Solo funcionan con la app abierta/visible
- Service Worker se "duerme" cuando está inactivo
- No es posible notificaciones reales en background sin Firebase Cloud Messaging
- Ver `NOTIFICACIONES.md` para detalles técnicos

### Seguridad
- Sin autenticación (acceso anónimo)
- RLS desactivado (proyecto personal)
- API Key pública (anon key, limitada)

### Performance
- Bundle size ~1.3MB (considerar code-splitting)
- Tailwind via CDN (funciona pero no ideal para producción)

---

## Warnings Conocidos (no críticos)

1. **Tailwind CDN** - "should not be used in production" → funciona OK
2. **Multiple GoTrueClient** - warning de Supabase dev → no afecta
3. **Bundle size** - considerar code-splitting en futuro

---

## Backlog Futuro

- [ ] Instalar Tailwind como dependencia (eliminar CDN)
- [ ] Code-splitting para reducir bundle
- [ ] Firebase Cloud Messaging para notificaciones reales
- [ ] Autenticación (para versión pública)
- [ ] Temas de colores custom
- [ ] Transcripción de audio (Web Speech API)
- [ ] Versión pública separada (fork limpio)

---

## Historial de Versiones

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 17 Ene 2026 | 2.1.0 | Reorganización a FERABEN_MARE/nexus, documentación completa |
| 17 Dic 2025 | 2.0.1 | Sync de categorías a Supabase, fix error 406 |
| 16 Dic 2025 | 2.0.0 | Calendario, Recordatorios, Categorías Dinámicas |
| 12 Dic 2025 | 1.0.1 | Fix: Sync de eliminación entre dispositivos |
| 11 Dic 2025 | 1.0.0 | Release inicial: GitHub + Vercel + iconos PWA |

---

## Bugs Resueltos (Referencia Técnica)

### Bug: Notas del calendario no se guardaban (16 Dic 2025)

**Síntoma:** Al crear nota desde calendario, se abría el editor pero al guardar no aparecía.

**Causa:** `handleSaveNote` verificaba `if (editingNote)` para decidir si era edición o creación. Las notas del calendario tenían `editingNote` seteado pero el ID no existía en el array.

**Solución:**
```typescript
const noteExists = notes.some(n => n.id === noteToSave.id);
if (noteExists) {
    updatedNotes = notes.map(...); // Actualizar
} else {
    updatedNotes = [noteToSave, ...notes]; // Agregar
}
```

### Bug: Notas eliminadas reaparecen (12 Dic 2025)

**Síntoma:** Nota eliminada volvía al refrescar.

**Causa:** `syncNotesToCloud()` solo hacía UPSERT, nunca DELETE.

**Solución:** Nueva función `deleteNoteFromCloud()` y lógica de merge mejorada.

### Bug: Categorías no sincronizaban a Supabase (17 Dic 2025)

**Síntoma:** Categoría creada en celular no aparecía en PC.

**Causa:**
1. `handleSaveCategories` no usaba `await`
2. `fetchCategoriesFromCloud()` usaba `.single()` que da error 406 con tabla vacía

**Solución:**
```typescript
// 1. Agregar async/await
const handleSaveCategories = async (newCategories) => {
  await saveCategories(newCategories);
};

// 2. Cambiar .single() por select normal
const { data, error } = await supabase
  .from('categories')
  .select('*')
  .eq('id', 'default');

if (data && data.length > 0 && data[0].data) {
  return data[0].data as CategoryConfig[];
}
```

---

## Sync de Categorías - Flujo Técnico

### Guardar
```
[Usuario edita categoría]
         ↓
[CategoryManager.tsx] → onSave(categories)
         ↓
[App.tsx] → handleSaveCategories(categories)
         ↓
[storageService.ts] → saveCategories(categories)
         ↓
    ┌────┴────┐
    ↓         ↓
[localStorage]  [saveCategoriesToCloud()]
```

### Cargar
```
[App init]
    ↓
[getCategories()]
    ↓
[getCategoriesLocal()] ← localStorage primero
    ↓
[fetchCategoriesFromCloud()] ← Supabase si disponible
    ↓
   ┌──┴──┐
   ↓     ↓
[Cloud OK]     [Cloud vacío/error]
   ↓                 ↓
[Usa cloud]    [Usa local, sube a cloud]
```

### Fallbacks
| Escenario | Comportamiento |
|-----------|---------------|
| Supabase no configurado | Usa localStorage |
| Error de red | Usa localStorage |
| Cloud vacío | Usa localStorage, sube a cloud |
| Todo vacío | DEFAULT_CATEGORIES |

---

## Créditos

- **Desarrollo inicial:** Gemini 2.5 Pro
- **v2.0 (Calendario, Categorías, Recordatorios):** Claude Opus 4.5
- **Documentación y reorganización:** Claude Opus 4.5
- **Uso:** Personal y comercial libre

---

**Última actualización:** 17 Enero 2026
**Versión del documento:** 2.1.0
