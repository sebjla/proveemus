
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { XIcon } from './icons/XIcon';
import { BellIcon } from './icons/BellIcon';
import { PackageIcon } from './icons/PackageIcon';
import { TruckIcon } from './icons/TruckIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

const getIconForType = (type: string) => {
  switch (type) {
    case 'success': return <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />;
    case 'warning': return <div className="w-5 h-5 rounded-full border-2 border-amber-500 text-amber-500 font-bold flex items-center justify-center text-xs">!</div>;
    case 'alert': return <div className="w-5 h-5 rounded-full border-2 border-red-500 text-red-500 font-bold flex items-center justify-center text-xs">X</div>;
    default: return <PackageIcon className="w-5 h-5 text-blue-500" />;
  }
};

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Hace un momento';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
  // If more than 24 hours, display date
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const NotificationCenter: React.FC = () => {
  const { 
    isOpen, 
    toggleNotificationCenter, 
    notifications, 
    markAsRead, 
    markAllAsRead,
    clearAll 
  } = useNotifications();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleNotificationCenter}
            className="fixed inset-0 bg-gray-900/20 backdrop-blur-[1px] z-[55]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[60] w-full max-w-sm bg-white shadow-2xl border-l border-gray-200 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <BellIcon className="w-5 h-5 text-teal-600" />
                <h2 className="font-bold text-gray-800">Notificaciones</h2>
                <span className="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded-full font-bold">
                  {notifications.length}
                </span>
              </div>
              <button onClick={toggleNotificationCenter} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center text-xs">
               <button onClick={markAllAsRead} className="text-teal-600 hover:text-teal-800 font-medium">
                 Marcar todas leídas
               </button>
               <button onClick={clearAll} className="text-gray-400 hover:text-red-500 transition-colors">
                 Borrar todo
               </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                  <BellIcon className="w-12 h-12 opacity-20" />
                  <p>No tienes notificaciones nuevas</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((note) => (
                    <div 
                      key={note.id} 
                      onClick={() => markAsRead(note.id)}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${!note.read ? 'bg-teal-50/30' : ''}`}
                    >
                      {!note.read && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500" />
                      )}
                      <div className="flex gap-3">
                        <div className="mt-1 flex-shrink-0">
                          {getIconForType(note.type)}
                        </div>
                        <div>
                          <p className={`text-sm ${!note.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {note.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {note.message}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-2 font-medium">
                            {formatTime(note.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};