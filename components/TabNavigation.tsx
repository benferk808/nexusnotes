import React from 'react';
import { CATEGORIES } from '../constants';
import { Category } from '../types';
import * as Icons from 'lucide-react';

interface TabNavigationProps {
  activeCategory: Category;
  onChange: (cat: Category) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeCategory, onChange }) => {
  return (
    <div className="flex p-1 bg-gray-200 dark:bg-black/20 backdrop-blur-sm rounded-2xl mb-6 border border-white/5">
      {CATEGORIES.map((cat) => {
        // Dynamic Icon Component
        const IconComponent = (Icons as any)[cat.icon];
        const isActive = activeCategory === cat.id;
        
        // Dynamic active styling
        let activeClass = "bg-white text-gray-900 shadow-md";
        if (isActive) {
            if (cat.id === 'gaming') activeClass = "bg-purple-600 text-white shadow-lg shadow-purple-900/30";
            if (cat.id === 'work') activeClass = "bg-blue-600 text-white shadow-lg shadow-blue-900/30";
            if (cat.id === 'personal') activeClass = "bg-green-600 text-white shadow-lg shadow-green-900/30";
        } else {
            activeClass = "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5";
        }

        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeClass}`}
          >
            {IconComponent && <IconComponent size={18} className={isActive ? 'text-white' : cat.color} />}
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};