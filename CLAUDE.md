# Nexus Notes - Documentacion del Proyecto

> **Ultima actualizacion:** 10 de Diciembre 2025
> **Estado:** Supabase configurado y funcionando. Pendiente: Deploy a Vercel + GitHub

---

## Resumen Ejecutivo

Nexus Notes es una aplicacion de notas personales **offline-first** con sincronizacion cloud opcional. Creada con React 19 + TypeScript. Permite gestionar notas con checklists, grabacion de audio, y categorizacion.

**100% gratuita** - Sin APIs de pago ni costos ocultos.

**BONUS:** Esta app mantiene activa la cuenta de Supabase del Sistema de Compras de FERABEN, evitando que se pause por inactividad.

---

## Estructura Actual del Proyecto

```
C:\Users\Usuario\Omninotes/
│
├── App.tsx                    # Componente principal (estado global, CRUD)
├── index.tsx                  # Entry point de React
├── index.html                 # HTML base con meta tags PWA
├── types.ts                   # Tipos TypeScript (Note, NoteItem, etc.)
├── constants.ts               # Categorias y configuracion
├── package.json               # Dependencias del proyecto
├── tsconfig.json              # Configuracion TypeScript
├── vite.config.ts             # Configuracion Vite (build, dev server)
├── manifest.json              # Manifest PWA para instalacion
├── service-worker.js          # Service Worker para funcionamiento offline
├── CLAUDE.md                  # Este archivo - documentacion del proyecto
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
| Build Tool | Vite | 6.2.0 |
| Estilos | Tailwind CSS | 3.x (via CDN) |
| Iconos | Lucide React | 0.556.0 |
| Backend | Supabase | 2.39.0 |
| Storage Local | IndexedDB | Nativo del navegador |

---

## Funcionalidades Actuales

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
- [x] Configuracion desde modal de Settings
- [x] Sync bidireccional (local <-> cloud)
- [x] Merge inteligente por timestamp
- [x] Funciona offline-first (primero local, luego sync)

### PWA (Progressive Web App)
- [x] Service Worker para cache y offline
- [x] Manifest.json para instalacion
- [x] Meta tags para iOS y Android
- [x] Funciona sin conexion a internet

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

# Iniciar servidor de desarrollo (http://localhost:3000)
npm run dev

# Compilar para produccion (genera carpeta dist/)
npm run build

# Previsualizar build de produccion
npm run preview
```

---

## Historial de Cambios

### Sesion 10 Dic 2025 (tarde) - Configuracion Supabase COMPLETADA

**Contexto:** La app se conecto a la misma cuenta de Supabase que usa el Sistema de Compras de FERABEN. Esto resuelve el problema de que Supabase pausaba el proyecto por inactividad.

**Pasos realizados:**

1. **Reactivacion de Supabase**
   - El proyecto "Sistema-compras-mare" estaba pausado
   - Se reactivo desde el dashboard de Supabase
   - Las API keys se regeneraron (Supabase ahora usa nuevo sistema de keys)

2. **Creacion de tabla `notes`**
   - Se ejecuto en SQL Editor:
   ```sql
   CREATE TABLE notes (
     id TEXT PRIMARY KEY,
     updated_at TIMESTAMP WITH TIME ZONE,
     data JSONB
   );
   ```
   - RLS desactivado (la app no tiene autenticacion por ahora)

3. **Configuracion en la app**
   - URL: `https://qjiovckirghjxamqcfuv.supabase.co`
   - API Key: Se usa la "Legacy anon public key" (formato eyJ...)
   - Nota: Supabase ahora muestra "Publishable key" pero hay que usar las legacy keys

4. **Verificacion**
   - Se creo nota de prueba
   - Se verifico que aparece en Supabase Table Editor
   - Sin errores en consola F12

**Resultado:** Sincronizacion funcionando correctamente.

---

### Sesion 10 Dic 2025 (manana) - Limpieza de Gemini

**Eliminado completamente Google Gemini AI:**
- Borrado `services/geminiService.ts`
- Borrado `.env.local` (contenia GEMINI_API_KEY)
- Limpiado `NoteEditor.tsx`:
  - Removido boton "Mejorar Texto"
  - Removido boton "Transcribir" en audios
  - Removidos estados isProcessingAI, transcribingId
  - Removidos imports de Wand2, Loader2
- Limpiado `package.json`: removida dependencia `@google/genai`
- Limpiado `vite.config.ts`: removidas referencias a GEMINI_API_KEY
- Limpiado `constants.ts`: removido GEMINI_MODEL

**Resultado:** App 100% gratuita sin APIs de pago.

---

## CONFIGURACION ACTUAL DE SUPABASE

### Proyecto
- **Nombre:** Sistema-compras-mare (compartido con Sistema de Compras FERABEN)
- **URL:** `https://qjiovckirghjxamqcfuv.supabase.co`

### API Key (Legacy anon public)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqaW92Y2tpcmdoanhhbXFjZnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjEwOTEsImV4cCI6MjA2OTkzNzA5MX0.5GhcsREBY_nnfCiTjuwogWlT6fBzv2lT3xljWQISU1s
```

### Tabla
```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  data JSONB
);
```

### Notas importantes
- RLS esta desactivado (cualquiera con la key puede leer/escribir)
- Los audios e imagenes se guardan como base64 dentro del campo `data` (JSONB)
- No se usa Supabase Storage, todo va en la tabla

---

## PROXIMOS PASOS (Pendientes)

### 1. Subir a GitHub
- [ ] Crear repositorio en GitHub (cuenta fnosieski@gmail.com o ferabensrl@gmail.com)
- [ ] Inicializar git en el proyecto
- [ ] Crear .gitignore (node_modules, dist, .env, etc.)
- [ ] Hacer commit inicial
- [ ] Push a GitHub

### 2. Deploy a Vercel
- [ ] Conectar Vercel con el repositorio de GitHub
- [ ] Configurar build command: `npm run build`
- [ ] Configurar output directory: `dist`
- [ ] Obtener URL publica con HTTPS (ej: nexusnotes.vercel.app)
- [ ] Verificar que la app carga correctamente

### 3. Crear Iconos PWA Profesionales
- [ ] Disenar o generar icono de Nexus Notes
- [ ] Crear versiones 192x192 y 512x512 pixeles
- [ ] Reemplazar placeholders en manifest.json
- [ ] Probar instalacion en dispositivos

### Resultado Final
Una vez completados estos 3 pasos:
- Podras abrir la app desde cualquier navegador con la URL de Vercel
- Podras "Instalar" la app en PC, Android, iOS, tablet
- Las notas se sincronizaran automaticamente entre dispositivos
- Funcionara offline y sincronizara cuando haya conexion
- El Sistema de Compras nunca mas se pausara por inactividad

---

## Warnings conocidos (no criticos)

Estos warnings aparecen en F12 pero no afectan el funcionamiento:

1. **Tailwind CDN warning** - "should not be used in production"
   - Solucion futura: instalar Tailwind como dependencia

2. **Multiple GoTrueClient** - "Multiple instances detected"
   - Es un warning de desarrollo, no afecta

3. **apple-mobile-web-app-capable deprecated**
   - Meta tag antiguo, funciona pero hay uno nuevo

4. **picsum.photos 503** - Error cargando iconos placeholder
   - Se resuelve al crear iconos propios

---

## Notas Tecnicas

### PWA - Requisitos
- HTTPS obligatorio (Vercel lo incluye gratis)
- Service Worker registrado
- Manifest.json con iconos validos

### Seguridad
- Los datos se guardan localmente en IndexedDB (privado del navegador)
- Supabase sincroniza en la nube
- No hay tracking, analytics ni publicidad
- Sin autenticacion por ahora (cualquiera con el link puede usar la app)

---

## Objetivo del Proyecto

App de notas personal para:
- Apuntes rapidos mientras juegas
- Tareas y recordatorios de trabajo
- Notas personales y listas de compras
- Grabar ideas de voz mientras conduces

**Meta:** Poder usar la misma app en PC, celular y tablet, con todas las notas sincronizadas.

**Bonus:** Mantener activa la cuenta de Supabase del Sistema de Compras.

---

## Creditos

- **Desarrollo inicial:** Gemini 2.5 Pro
- **Optimizacion y limpieza:** Claude (Anthropic)
- **Configuracion Supabase:** Claude (Anthropic) - 10 Dic 2025
- **Uso:** Personal y comercial libre
