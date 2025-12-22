
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isOpen: boolean;
  toggleNotificationCenter: () => void;
  addNotification: (title: string, message: string, type?: AppNotification['type']) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Initial Mock Data to populate the center
const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    title: 'Cotización Recibida',
    message: 'Distribuidora Escolar ha enviado una oferta para el pedido #258901.',
    type: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    read: false,
  },
  {
    id: '2',
    title: 'Pedido Entregado',
    message: 'El pedido #258850 ha sido marcado como entregado por el transportista.',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: true,
  },
  {
    id: '3',
    title: 'Alerta de Stock',
    message: 'Uno de los proveedores reportó falta de stock en "Resma A4".',
    type: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
  }
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load from local storage or use mock
  useEffect(() => {
    const stored = localStorage.getItem('app_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      setNotifications(MOCK_NOTIFICATIONS);
    }
  }, []);

  // Save to local storage whenever changes
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('app_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleNotificationCenter = () => setIsOpen(prev => !prev);

  const addNotification = (title: string, message: string, type: AppNotification['type'] = 'info') => {
    const newNote: AppNotification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNote, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem('app_notifications');
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isOpen,
      toggleNotificationCenter,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
