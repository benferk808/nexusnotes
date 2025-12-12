import { Category } from './types';

export const APP_TITLE = "Nexus Notes";

export const CATEGORIES: { id: Category; label: string; icon: string; color: string }[] = [
  { id: 'gaming', label: 'Gaming', icon: 'Gamepad2', color: 'text-purple-500' },
  { id: 'work', label: 'Trabajo', icon: 'Briefcase', color: 'text-blue-500' },
  { id: 'personal', label: 'Personal', icon: 'User', color: 'text-green-500' },
];
