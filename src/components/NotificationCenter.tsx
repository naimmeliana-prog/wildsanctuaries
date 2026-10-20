import React, { useState, useEffect } from 'react';
import { FieldNotification } from '../types';
import { Bell, ShieldAlert, Calendar, Check, X, BellRing, Sparkles } from 'lucide-react';

interface NotificationCenterProps {
  notifications: FieldNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onSelectTab: (tab: any) => void;
  language: 'es' | 'en';
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll,
  onSelectTab,
  language
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  const requestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPushPermission(perm);
        if (perm === 'granted') {
          new Notification('WildSanctuaries Push Activo', {
            body: 'Recibirás alertas inmediatas de incidentes de caza furtiva y eventos de concientización.',
            icon: '/favicon.ico'
          });
        }
      } catch (e) {
        console.error('Error requesting notification permission', e);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        aria-label="Abrir centro de notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white font-mono text-[10px] font-bold flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Flyout Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-[2000] p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {language === 'es' ? 'Notificaciones' : 'Notifications'}
              </span>
              <span className="text-[11px] font-mono text-slate-400">({unreadCount})</span>
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-[11px] font-mono text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  {language === 'es' ? 'Marcar leídas' : 'Mark all read'}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Browser Push Permission Banner */}
          {pushPermission !== 'granted' && (
            <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="text-slate-700 dark:text-slate-300">
                {language === 'es' 
                  ? 'Activa notificaciones Push para recibir avisos de emergencia en terreno aunque la pestaña esté minimizada.' 
                  : 'Enable Push notifications to receive emergency field alerts even when minimized.'}
              </div>
              <button
                onClick={requestPushPermission}
                className="py-1 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold uppercase tracking-wider transition-colors w-full"
              >
                {language === 'es' ? 'Permitir Notificaciones Push' : 'Allow Push Alerts'}
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 italic">
                {language === 'es' ? 'Sin notificaciones pendientes.' : 'No pending notifications.'}
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    onMarkAsRead(n.id);
                    if (n.linkTab) {
                      onSelectTab(n.linkTab);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3 border text-xs cursor-pointer transition-colors ${
                    !n.read 
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20' 
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      {n.type === 'incident' ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      ) : (
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                      <span>{n.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{n.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {n.body}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
