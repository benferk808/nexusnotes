import React from 'react';
import { Category, CategoryConfig } from '../types';
import * as Icons from 'lucide-react';

// Color mappings for Tailwind (classes must be complete for purge to work)
const colorStyles: Record<string, { bg: string; shadow: string; text: string }> = {
  purple: { bg: 'bg-purple-600', shadow: 'shadow-purple-900/30', text: 'text-purple-500' },
  blue: { bg: 'bg-blue-600', shadow: 'shadow-blue-900/30', text: 'text-blue-500' },
  green: { bg: 'bg-green-600', shadow: 'shadow-green-900/30', text: 'text-green-500' },
  red: { bg: 'bg-red-600', shadow: 'shadow-red-900/30', text: 'text-red-500' },
  orange: { bg: 'bg-orange-600', shadow: 'shadow-orange-900/30', text: 'text-orange-500' },
  yellow: { bg: 'bg-yellow-600', shadow: 'shadow-yellow-900/30', text: 'text-yellow-500' },
  pink: { bg: 'bg-pink-600', shadow: 'shadow-pink-900/30', text: 'text-pink-500' },
  cyan: { bg: 'bg-cyan-600', shadow: 'shadow-cyan-900/30', text: 'text-cyan-500' },
};

interface TabNavigationProps {
  categories: CategoryConfig[];
  activeCategory: Category;
  onChange: (cat: Category) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ categories, activeCategory, onChange }) => {
  return (
    <div className="flex p-1 bg-gray-200 dark:bg-black/20 backdrop-blur-sm rounded-2xl mb-6 border border-white/5">
      {categories.map((cat) => {
        const IconComponent = (Icons as any)[cat.icon];
        const isActive = activeCategory === cat.id;
        const colors = colorStyles[cat.color] || colorStyles.blue;

        const activeClass = isActive
          ? `${colors.bg} text-white shadow-lg ${colors.shadow}`
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5";

        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeClass}`}
          >
            {IconComponent && <IconComponent size={18} className={isActive ? 'text-white' : colors.text} />}
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};