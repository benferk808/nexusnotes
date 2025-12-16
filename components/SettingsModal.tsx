import React, { useState, useEffect } from 'react';
import { AppSettings, SupabaseConfig } from '../types';
import { getSettings, saveSettings } from '../services/storageService';
import { X, Cloud, Save, CheckCircle, AlertCircle, Database, FolderCog, Bell, BellOff } from 'lucide-react';
import { initSupabase } from '../services/supabaseService';
import { requestNotificationPermission, getNotificationPermission, isNotificationSupported } from '../services/notificationService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCategoryManager: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onOpenCategoryManager }) => {
  const [config, setConfig] = useState<SupabaseConfig>({ url: '', key: '', enabled: false });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [requestingPermission, setRequestingPermission] = useState(false);

  useEffect(() => {
    if (isOpen) {
        const settings = getSettings();
        if (settings.supabaseConfig) {
            setConfig(settings.supabaseConfig);
        }
        // Check notification permission status
        setNotificationStatus(getNotificationPermission());
    }
  }, [isOpen]);

  const handleRequestNotificationPermission = async () => {
    setRequestingPermission(true);
    const granted = await requestNotificationPermission();
    setNotificationStatus(granted ? 'granted' : 'denied');
    setRequestingPermission(false);

    // If granted, tell service worker to start checking reminders
    if (granted && 'serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage('START_REMINDER_CHECK');
    }
  };

  const handleSave = () => {
    // Test connection
    const success = initSupabase(config);
    if (success || !config.enabled) {
        const currentSettings = getSettings();
        const newSettings: AppSettings = {
            ...currentSettings,
            supabaseConfig: config
        };
        saveSettings(newSettings);
        setStatus('success');
        setTimeout(() => {
            setStatus('idle');
            onClose();
            // Force reload to trigger sync
            window.location.reload();
        }, 1000);
    } else {
        setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6">
        
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Database className="text-blue-500"/> Configuración & Sync
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <X size={20} className="text-gray-500" />
            </button>
        </div>

        <div className="space-y-4">
            {/* Category Manager Button */}
            <button
              onClick={() => {
                onClose();
                onOpenCategoryManager();
              }}
              className="w-full p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                    <FolderCog size={20} className="text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-800 dark:text-purple-300">Gestionar Categorias</h3>
                    <p className="text-xs text-purple-600 dark:text-purple-400">Agregar, editar o eliminar categorias</p>
                  </div>
                </div>
                <span className="text-purple-400">&rarr;</span>
              </div>
            </button>

            {/* Notifications Section */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
                    {notificationStatus === 'granted' ? (
                      <Bell size={20} className="text-amber-600 dark:text-amber-300" />
                    ) : (
                      <BellOff size={20} className="text-amber-600 dark:text-amber-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-800 dark:text-amber-300">Notificaciones</h3>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      {notificationStatus === 'unsupported' && 'Tu navegador no soporta notificaciones'}
                      {notificationStatus === 'granted' && 'Notificaciones activadas'}
                      {notificationStatus === 'denied' && 'Notificaciones bloqueadas'}
                      {notificationStatus === 'default' && 'Activa las notificaciones para recordatorios'}
                    </p>
                  </div>
                </div>
                {isNotificationSupported() && notificationStatus !== 'granted' && notificationStatus !== 'denied' && (
                  <button
                    onClick={handleRequestNotificationPermission}
                    disabled={requestingPermission}
                    className="px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    {requestingPermission ? 'Activando...' : 'Activar'}
                  </button>
                )}
                {notificationStatus === 'granted' && (
                  <span className="text-green-500 text-sm font-medium">✓ Activo</span>
                )}
                {notificationStatus === 'denied' && (
                  <span className="text-red-500 text-xs">Desbloquea en config. del navegador</span>
                )}
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Cloud size={16}/> Sincronizacion en la Nube
                </h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                    Conecta tu cuenta de Supabase para sincronizar tus notas entre PC y Celular.
                    Tus datos se guardaran en tu propia base de datos.
                </p>
            </div>

            <div>
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                    <input 
                        type="checkbox" 
                        checked={config.enabled}
                        onChange={(e) => setConfig({...config, enabled: e.target.checked})}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Habilitar Sync con Supabase</span>
                </label>
            </div>

            {config.enabled && (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Project URL</label>
                        <input 
                            type="text" 
                            value={config.url}
                            onChange={(e) => setConfig({...config, url: e.target.value})}
                            placeholder="https://xyz.supabase.co"
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">API Key (Anon/Public)</label>
                        <input 
                            type="password" 
                            value={config.key}
                            onChange={(e) => setConfig({...config, key: e.target.value})}
                            placeholder="eyJhbGciOiJIUzI1..."
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <AlertCircle size={16} /> Error al conectar. Verifica tus datos.
                </div>
            )}
             {status === 'success' && (
                <div className="flex items-center gap-2 text-green-500 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <CheckCircle size={16} /> Conectado y guardado. Reiniciando...
                </div>
            )}

            <button 
                onClick={handleSave}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
                <Save size={18} /> Guardar Configuración
            </button>
        </div>

      </div>
    </div>
  );
};