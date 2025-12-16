import { CategoryConfig } from './types';

export const APP_TITLE = "Nexus Notes";

// Default categories - used on first load or when no categories exist
export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { id: 'gaming', label: 'Gaming', icon: 'Gamepad2', color: 'purple' },
  { id: 'work', label: 'Trabajo', icon: 'Briefcase', color: 'blue' },
  { id: 'personal', label: 'Personal', icon: 'User', color: 'green' },
];

// Available colors for category customization
export const CATEGORY_COLORS = [
  { id: 'purple', label: 'Morado', class: 'bg-purple-500' },
  { id: 'blue', label: 'Azul', class: 'bg-blue-500' },
  { id: 'green', label: 'Verde', class: 'bg-green-500' },
  { id: 'red', label: 'Rojo', class: 'bg-red-500' },
  { id: 'orange', label: 'Naranja', class: 'bg-orange-500' },
  { id: 'yellow', label: 'Amarillo', class: 'bg-yellow-500' },
  { id: 'pink', label: 'Rosa', class: 'bg-pink-500' },
  { id: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
];

// Available icons for category customization
export const CATEGORY_ICONS = [
  { id: 'Gamepad2', label: 'Gaming' },
  { id: 'Briefcase', label: 'Trabajo' },
  { id: 'User', label: 'Personal' },
  { id: 'Home', label: 'Casa' },
  { id: 'ShoppingCart', label: 'Compras' },
  { id: 'Heart', label: 'Favoritos' },
  { id: 'Star', label: 'Estrella' },
  { id: 'Bookmark', label: 'Marcador' },
  { id: 'Folder', label: 'Carpeta' },
  { id: 'Music', label: 'Musica' },
  { id: 'Camera', label: 'Fotos' },
  { id: 'Car', label: 'Auto' },
];
