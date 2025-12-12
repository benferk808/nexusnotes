# Nexus Notes - Documentacion del Proyecto

> **Version:** 1.0.0
> **Ultima actualizacion:** 11 de Diciembre 2025
> **Estado:** PRODUCCION - Deploy completo en Vercel

---

## Links Importantes

| Recurso | URL |
|---------|-----|
| **App en Produccion** | https://nexusnotes-steel.vercel.app/ |
| **Repositorio GitHub** | https://github.com/benferk808/nexusnotes |
| **Vercel Dashboard** | https://vercel.com (cuenta fnosieski@hotmail.com) |
| **Supabase Dashboard** | https://supabase.com/dashboard (proyecto Sistema-compras-mare) |

---

## Cuentas y Accesos

### GitHub (proyectos personales)
- **Email:** fnosieski@hotmail.com
- **Usuario:** benferk808
- **Repo:** nexusnotes

### Vercel
- **Email:** fnosieski@hotmail.com
- **Proyecto:** nexusnotes
- **URL:** https://nexusnotes-steel.vercel.app/

### Supabase (compartido con FERABEN)
- **Proyecto:** Sistema-compras-mare
- **URL:** `https://qjiovckirghjxamqcfuv.supabase.co`
- **API Key (Legacy anon public):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqaW92Y2tpcmdoanhhbXFjZnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjEwOTEsImV4cCI6MjA2OTkzNzA5MX0.5GhcsREBY_nnfCiTjuwogWlT6fBzv2lT3xljWQISU1s
```
- **Tabla:** `notes` (id TEXT, updated_at TIMESTAMP, data JSONB)
- **RLS:** Desactivado

---

## Resumen Ejecutivo

Nexus Notes es una aplicacion de notas personales **offline-first** con sincronizacion cloud opcional. Creada con React 19 + TypeScript. Permite gestionar notas con checklists, grabacion de audio, y categorizacion.

**100% gratuita** - Sin APIs de pago ni costos ocultos.

**BONUS:** Esta app mantiene activa la cuenta de Supabase del Sistema de Compras de FERABEN, evitando que se pause por inactividad.

---

## Estructura del Proyecto

```
C:\Users\Usuario\Omninotes/
│
├── App.tsx                    # Componente principal (estado global, CRUD)
├── index.tsx                  # Entry point de React
├── index.html                 # HTML base con meta tags PWA
├── types.ts                   # Tipos TypeScript (Note, NoteItem, etc.)
├── constants.ts               # Categorias y configuracion (APP_TITLE)
├── package.json               # Dependencias del proyecto
├── tsconfig.json              # Configuracion TypeScript
├── vite.config.ts             # Configuracion Vite (build, dev server)
├── manifest.json              # Manifest PWA para instalacion
├── service-worker.js          # Service Worker para funcionamiento offline
├── CLAUDE.md                  # Este archivo - documentacion del proyecto
├── README.md                  # README para GitHub
├── .gitignore                 # Archivos excluidos de git
│
├── components/
│   ├── NoteCard.tsx           # Tarjeta de nota en el dashboard
│   ├── NoteEditor.tsx         # Modal editor de notas completo
│   ├── TabNavigation.tsx      # Tabs de categorias (Gaming/Trabajo/Personal)
│   ├── QuickRecorder.tsx      # Grabador de voz rapido (modo conduccion)
│   ├── SettingsModal.tsx      # Modal de configuracion Supabase
│   └── ConfirmationModal.tsx  # Modal de confirmacion para eliminar
│
└── services/
    ├── storageService.ts      # IndexedDB local + sync con Supabase
    └── supabaseService.ts     # Cliente y funciones de Supabase
```

**Total:** ~1,100 lineas de codigo TypeScript

---

## Stack Tecnologico

| Area | Tecnologia | Version |
|------|------------|---------|
| Framework | React | 19.2.1 |
| Lenguaje | TypeScript | 5.8.2 |
| Build Tool | Vite | 6.4.1 |
| Estilos | Tailwind CSS | 3.x (via CDN) |
| Iconos | Lucide React | 0.556.0 |
| Backend | Supabase | 2.39.0 |
| Storage Local | IndexedDB | Nativo del navegador |
| Hosting | Vercel | - |
| Repositorio | GitHub | - |

---

## Funcionalidades v1.0

### Gestion de Notas
- [x] Crear, editar y eliminar notas
- [x] 3 categorias con colores: Gaming (purpura), Trabajo (azul), Personal (verde)
- [x] Subcategorias/etiquetas manuales personalizables
- [x] Busqueda en tiempo real por titulo y contenido
- [x] Ordenamiento automatico por fecha de actualizacion

### Checklists / Tareas
- [x] Agregar items de checklist dentro de cada nota
- [x] Marcar/desmarcar completados desde el dashboard (sin abrir la nota)
- [x] Marcar/desmarcar desde el editor
- [x] Vista previa de items en las tarjetas

### Audio
- [x] Grabar notas de voz (formato WebM)
- [x] Modo conduccion: pantalla completa con boton grande STOP
- [x] Almacenamiento del audio en base64
- [x] Reproduccion inline en el editor

### Imagenes
- [x] Adjuntar imagenes a las notas
- [x] Vista previa en el editor
- [x] Eliminar adjuntos individualmente

### Almacenamiento
- [x] IndexedDB para almacenamiento local (funciona offline)
- [x] Migracion automatica desde localStorage antiguo
- [x] Export de todas las notas a archivo JSON
- [x] Import de notas desde archivo JSON (fusionar o reemplazar)

### Sincronizacion Cloud (Supabase)
- [x] Configuracion desde modal de Settings (URL + API Key)
- [x] Sync bidireccional (local <-> cloud)
- [x] Merge inteligente por timestamp
- [x] Funciona offline-first (primero local, luego sync)
- [x] Configuracion persistente en localStorage

### PWA (Progressive Web App)
- [x] Service Worker para cache y offline
- [x] Manifest.json para instalacion
- [x] Meta tags para iOS y Android
- [x] Funciona sin conexion a internet
- [x] HTTPS via Vercel

### Interfaz
- [x] Tema oscuro y claro (toggle en header)
- [x] Colores dinamicos segun categoria activa
- [x] Diseno responsive (mobile-first)
- [x] Botones FAB: microfono rojo (grabar) y + azul (nueva nota)

---

## Modelo de Datos

```typescript
interface Note {
  id: string;                    // UUID unico
  category: 'gaming' | 'work' | 'personal';
  subcategory?: string;          // Etiqueta opcional (ej: "Minecraft", "Urgente")
  title: string;
  content: string;               // Texto libre
  items: NoteItem[];             // Array de checklist items
  attachments: MediaAttachment[]; // Imagenes y audios
  isPinned: boolean;
  createdAt: string;             // ISO date
  updatedAt: string;             // ISO date
}

interface NoteItem {
  id: string;
  text: string;
  completed: boolean;
}

interface MediaAttachment {
  id: string;
  type: 'image' | 'audio';
  data: string;                  // base64 encoded
  mimeType: string;
  createdAt: string;
}
```

---

## Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (http://localhost:5173)
npm run dev

# Compilar para produccion (genera carpeta dist/)
npm run build

# Previsualizar build de produccion
npm run preview
```

---

## Deploy Automatico

El proyecto esta configurado con **deploy automatico**:

1. Hacer cambios en el codigo local
2. Commit y push a GitHub:
   ```bash
   git add .
   git commit -m "descripcion del cambio"
   git push
   ```
3. Vercel detecta el push y hace deploy automaticamente
4. En ~30 segundos la app esta actualizada en produccion

---

## Historial de Cambios

### v1.0.0 - 11 Dic 2025 - RELEASE INICIAL

**Sesion 11 Dic 2025 - Deploy a Produccion**

Completado el ciclo completo de deployment:

1. **GitHub**
   - Creada cuenta nueva para proyectos personales (fnosieski@hotmail.com)
   - Usuario: benferk808
   - Repositorio: nexusnotes
   - Commit inicial con toda la app

2. **Vercel**
   - Conectado con GitHub
   - Deploy automatico configurado
   - URL: https://nexusnotes-steel.vercel.app/

3. **Rebranding**
   - Nombre cambiado de "OmniNotes" a "Nexus Notes"
   - Actualizado en: constants.ts, index.html, manifest.json, App.tsx, CLAUDE.md, README.md

4. **Verificacion**
   - App funcionando en PC y celular
   - Supabase sync operativo entre dispositivos
   - PWA lista para instalar (pendiente iconos propios)

**Build Info:**
- Bundle size: 1,286 KB (281 KB gzip)
- Build time: ~4 segundos
- Warning de chunk size (no critico, optimizable en futuro)

---

### Sesion 10 Dic 2025 (tarde) - Configuracion Supabase

- Reactivacion del proyecto Supabase (estaba pausado)
- Creacion de tabla `notes`
- Configuracion de sync bidireccional
- Verificacion de funcionamiento

---

### Sesion 10 Dic 2025 (manana) - Limpieza de Gemini

- Eliminado completamente Google Gemini AI
- App 100% gratuita sin APIs de pago

---

## Proximas Mejoras (Backlog)

### Prioridad Alta
- [ ] Crear iconos PWA propios (192x192 y 512x512)
- [ ] Instalar Tailwind como dependencia (eliminar CDN warning)

### Prioridad Media
- [ ] Code-splitting para reducir bundle size
- [ ] Autenticacion opcional (proteger notas con password)
- [ ] Notificaciones para recordatorios

### Prioridad Baja
- [ ] Modo offline mejorado con indicador de estado
- [ ] Exportar notas individuales
- [ ] Temas de colores personalizables
- [ ] Busqueda por tags/etiquetas

---

## Warnings Conocidos (no criticos)

1. **Tailwind CDN warning** - "should not be used in production"
   - Funciona correctamente, es solo recomendacion

2. **Chunk size warning** - Bundle > 500KB
   - Optimizable con code-splitting en futuro

3. **apple-mobile-web-app-capable deprecated**
   - Meta tag antiguo pero funcional

---

## Notas Tecnicas

### Arquitectura
- **Offline-first:** IndexedDB es la fuente de verdad local
- **Sync opcional:** Supabase sincroniza cuando hay conexion
- **Sin backend propio:** Todo es estatico + Supabase

### Seguridad
- Datos locales en IndexedDB (privado del navegador)
- Sync via Supabase (RLS desactivado por ahora)
- Sin tracking, analytics ni publicidad
- HTTPS obligatorio (Vercel lo provee)

### PWA
- Service Worker cachea assets para offline
- Manifest permite instalacion nativa
- Funciona como app standalone

---

## Objetivo del Proyecto

App de notas personal para:
- Apuntes rapidos mientras juegas
- Tareas y recordatorios de trabajo
- Notas personales y listas de compras
- Grabar ideas de voz mientras conduces

**Meta alcanzada:** Usar la misma app en PC, celular y tablet, con todas las notas sincronizadas.

**Bonus:** Mantener activa la cuenta de Supabase del Sistema de Compras FERABEN.

---

## Creditos

- **Desarrollo inicial:** Gemini 2.5 Pro
- **Optimizacion, limpieza y deploy:** Claude (Anthropic) - Dic 2025
- **Configuracion Supabase:** Claude (Anthropic) - 10 Dic 2025
- **Uso:** Personal y comercial libre
