# Nexus Notes

App de notas personales **offline-first** con sincronizacion cloud opcional.

## Funcionalidades

- **3 categorias**: Gaming, Trabajo, Personal (con colores distintivos)
- **Checklists**: Crear tareas y marcarlas completadas desde el dashboard
- **Grabacion de voz**: Modo conduccion con boton grande para grabar notas rapidas
- **Imagenes**: Adjuntar imagenes a las notas
- **Busqueda**: Filtrado en tiempo real por titulo y contenido
- **Tema oscuro/claro**: Toggle en el header
- **PWA**: Instalable en PC, Android, iOS
- **Offline-first**: Funciona sin internet, sincroniza cuando hay conexion
- **Backup**: Export/Import de notas en formato JSON

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- IndexedDB (almacenamiento local)
- Supabase (sync cloud opcional)

## Desarrollo local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Licencia

Uso personal y comercial libre.
