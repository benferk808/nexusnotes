import React, { useState } from 'react';
import { CategoryConfig, Note } from '../types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants';
import { Plus, Trash2, Check, X, AlertTriangle } from 'lucide-react';
import * as Icons from 'lucide-react';

// Color mappings for Tailwind
const colorStyles: Record<string, { text: string; bgLight: string; bgDark: string; ring: string }> = {
  purple: { text: 'text-purple-500', bgLight: 'bg-purple-100', bgDark: 'bg-purple-900/30', ring: 'ring-purple-500' },
  blue: { text: 'text-blue-500', bgLight: 'bg-blue-100', bgDark: 'bg-blue-900/30', ring: 'ring-blue-500' },
  green: { text: 'text-green-500', bgLight: 'bg-green-100', bgDark: 'bg-green-900/30', ring: 'ring-green-500' },
  red: { text: 'text-red-500', bgLight: 'bg-red-100', bgDark: 'bg-red-900/30', ring: 'ring-red-500' },
  orange: { text: 'text-orange-500', bgLight: 'bg-orange-100', bgDark: 'bg-orange-900/30', ring: 'ring-orange-500' },
  yellow: { text: 'text-yellow-500', bgLight: 'bg-yellow-100', bgDark: 'bg-yellow-900/30', ring: 'ring-yellow-500' },
  pink: { text: 'text-pink-500', bgLight: 'bg-pink-100', bgDark: 'bg-pink-900/30', ring: 'ring-pink-500' },
  cyan: { text: 'text-cyan-500', bgLight: 'bg-cyan-100', bgDark: 'bg-cyan-900/30', ring: 'ring-cyan-500' },
};

interface CategoryManagerProps {
  categories: CategoryConfig[];
  notes: Note[];
  onSave: (categories: CategoryConfig[]) => void;
  onClose: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  notes,
  onSave,
  onClose
}) => {
  const [localCategories, setLocalCategories] = useState<CategoryConfig[]>(categories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<{ id: string; count: number } | null>(null);

  const getNotesCount = (categoryId: string) => {
    return notes.filter(n => n.category === categoryId).length;
  };

  const handleAddCategory = () => {
    const newId = `cat_${Date.now()}`;
    const newCategory: CategoryConfig = {
      id: newId,
      label: 'Nueva',
      icon: 'Folder',
      color: 'blue'
    };
    setLocalCategories([...localCategories, newCategory]);
    setEditingId(newId);
  };

  const handleUpdateCategory = (id: string, updates: Partial<CategoryConfig>) => {
    setLocalCategories(localCategories.map(cat =>
      cat.id === id ? { ...cat, ...updates } : cat
    ));
  };

  const handleDeleteCategory = (id: string) => {
    const notesInCategory = getNotesCount(id);
    if (notesInCategory > 0) {
      setDeleteWarning({ id, count: notesInCategory });
    } else {
      setLocalCategories(localCategories.filter(cat => cat.id !== id));
    }
  };

  const confirmDelete = () => {
    if (deleteWarning) {
      setLocalCategories(localCategories.filter(cat => cat.id !== deleteWarning.id));
      setDeleteWarning(null);
    }
  };

  const handleSave = () => {
    if (localCategories.length === 0) {
      alert('Debe haber al menos una categoria');
      return;
    }
    onSave(localCategories);
    onClose();
  };

  const renderIconPreview = (iconName: string, color: string) => {
    const IconComponent = (Icons as any)[iconName];
    if (!IconComponent) return null;
    const colors = colorStyles[color] || colorStyles.blue;
    return <IconComponent size={20} className={colors.text} />;
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Gestionar Categorias
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {localCategories.map((cat) => {
            const isEditing = editingId === cat.id;
            const notesCount = getNotesCount(cat.id);

            return (
              <div
                key={cat.id}
                className={`p-3 rounded-xl border transition-all ${
                  isEditing
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                }`}
              >
                {isEditing ? (
                  // Edit Mode
                  <div className="space-y-3">
                    {/* Name Input */}
                    <input
                      type="text"
                      value={cat.label}
                      onChange={(e) => handleUpdateCategory(cat.id, { label: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Nombre de categoria"
                      autoFocus
                    />

                    {/* Color Picker */}
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Color</label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORY_COLORS.map(color => (
                          <button
                            key={color.id}
                            onClick={() => handleUpdateCategory(cat.id, { color: color.id })}
                            className={`w-8 h-8 rounded-full ${color.class} transition-transform ${
                              cat.color === color.id ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                            }`}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Icon Picker */}
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Icono</label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORY_ICONS.map(icon => {
                          const IconComp = (Icons as any)[icon.id];
                          const catColors = colorStyles[cat.color] || colorStyles.blue;
                          const isSelected = cat.icon === icon.id;
                          return (
                            <button
                              key={icon.id}
                              onClick={() => handleUpdateCategory(cat.id, { icon: icon.id })}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                isSelected
                                  ? `${catColors.bgLight} dark:${catColors.bgDark} ring-2 ${catColors.ring}`
                                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                              title={icon.label}
                            >
                              {IconComp && <IconComp size={18} className={isSelected ? catColors.text : 'text-gray-500'} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Done Button */}
                    <button
                      onClick={() => setEditingId(null)}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Check size={18} /> Listo
                    </button>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const catColors = colorStyles[cat.color] || colorStyles.blue;
                        return (
                          <div className={`w-10 h-10 rounded-xl ${catColors.bgLight} dark:${catColors.bgDark} flex items-center justify-center`}>
                            {renderIconPreview(cat.icon, cat.color)}
                          </div>
                        );
                      })()}
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{cat.label}</p>
                        <p className="text-xs text-gray-500">{notesCount} notas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingId(cat.id)}
                        className="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium"
                      >
                        Editar
                      </button>
                      {localCategories.length > 1 && (
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Category Button */}
          <button
            onClick={handleAddCategory}
            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus size={20} /> Agregar Categoria
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
          >
            Guardar Cambios
          </button>
        </div>

        {/* Delete Warning Modal */}
        {deleteWarning && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-xl">
              <div className="flex items-center gap-3 text-yellow-600 mb-4">
                <AlertTriangle size={24} />
                <h3 className="font-bold text-lg">Atencion</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Esta categoria tiene <strong>{deleteWarning.count} notas</strong>.
                Si la eliminas, las notas quedaran huerfanas y no se mostraran.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteWarning(null)}
                  className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
