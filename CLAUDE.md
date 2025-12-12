# Nexus Notes v1.0

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

## Estructura del Proyecto

```
C:\Users\Usuario\Omninotes\
├── App.tsx                 # Componente principal, estado global, CRUD
├── index.tsx               # Entry point React
├── index.html              # HTML base + meta PWA
├── types.ts                # Interfaces TypeScript
├── constants.ts            # APP_TITLE, CATEGORIES
├── manifest.json           # Config PWA (root, legacy)
├── service-worker.js       # SW offline (root, legacy)
│
├── components/
│   ├── NoteCard.tsx        # Tarjeta de nota en dashboard
│   ├── NoteEditor.tsx      # Modal editor completo
│   ├── TabNavigation.tsx   # Tabs: Gaming/Trabajo/Personal
│   ├── QuickRecorder.tsx   # Grabador voz (modo conduccion)
│   ├── SettingsModal.tsx   # Config Supabase URL + Key
│   └── ConfirmationModal.tsx
│
├── services/
│   ├── storageService.ts   # IndexedDB + sync Supabase
│   └── supabaseService.ts  # Cliente Supabase
│
└── public/                 # Assets estaticos (Vite los copia a dist/)
    ├── icon-192.png        # Icono PWA
    ├── icon-512.png        # Icono PWA grande
    ├── manifest.json       # PWA manifest
    └── service-worker.js   # Service Worker
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

## Modelo de Datos

```typescript
interface Note {
  id: string;
  category: 'gaming' | 'work' | 'personal';
  subcategory?: string;
  title: string;
  content: string;
  items: NoteItem[];
  attachments: MediaAttachment[];
  isPinned: boolean;
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

## Funcionalidades v1.0

- **Notas:** CRUD completo, 3 categorias con colores, subcategorias/tags
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

---

## Backlog Futuro

- [ ] Instalar Tailwind como dependencia (eliminar CDN)
- [ ] Code-splitting para reducir bundle (1.2MB → menor)
- [ ] Autenticacion opcional
- [ ] Notificaciones/recordatorios
- [ ] Temas de colores custom

---

## Historial

| Fecha | Version | Cambios |
|-------|---------|---------|
| 11 Dic 2025 | 1.0.0 | Release inicial: GitHub + Vercel + iconos PWA |
| 10 Dic 2025 | 0.9 | Config Supabase, limpieza Gemini |

---

## Creditos

- Desarrollo inicial: Gemini 2.5 Pro
- Deploy y optimizacion: Claude (Anthropic)
- Uso: Personal y comercial libre
