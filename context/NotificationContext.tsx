
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
// import { supabase } from '../lib/supabase'; // No longer directly used
import { UserRole } from '../types';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
  target_role?: UserRole;
  target_user_id?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isOpen: boolean;
  toggleNotificationCenter: () => void;
  addNotification: (title: string, message: string, type?: AppNotification['type'], targetRole?: UserRole, targetUserId?: string) => void;
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

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Effect to set current user ID from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUserId(user.id);
      } catch (e) {
        console.error("Failed to parse user from localStorage in NotificationContext", e);
        setCurrentUserId(null);
      }
    } else {
      setCurrentUserId(null);
    }
  }, []);

  const fetchNotifications = useCallback(() => {
    if (!currentUserId) {
      setNotifications([]);
      return;
    }
    const storedNotifications: AppNotification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
    // Filter notifications for the current user or global notifications
    const userNotifications = storedNotifications.filter(n => 
      n.target_user_id === currentUserId || n.target_user_id === undefined || n.target_user_id === null
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort by newest first
    
    setNotifications(userNotifications);
  }, [currentUserId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleNotificationCenter = () => setIsOpen(prev => !prev);

  const addNotification = useCallback((
    title: string, 
    message: string, 
    type: AppNotification['type'] = 'info',
    targetRole?: UserRole,
    targetUserId?: string
  ) => {
    const newNotification: AppNotification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      target_role: targetRole,
      target_user_id: targetUserId,
    };

    const storedNotifications: AppNotification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
    storedNotifications.push(newNotification);
    localStorage.setItem('notifications', JSON.stringify(storedNotifications));
    
    if (newNotification.target_user_id === currentUserId || newNotification.target_user_id === undefined || newNotification.target_user_id === null) {
      setNotifications(prev => [newNotification, ...prev]);
    }
  }, [currentUserId]);

  const markAsRead = (id: string) => {
    const storedNotifications: AppNotification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = storedNotifications.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    fetchNotifications(); // Re-fetch to update state
  };

  const markAllAsRead = () => {
    if (!currentUserId) return;
    const storedNotifications: AppNotification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = storedNotifications.map(n => 
      (n.target_user_id === currentUserId || n.target_user_id === undefined || n.target_user_id === null)
        ? { ...n, read: true } 
        : n
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    fetchNotifications(); // Re-fetch to update state
  };

  const clearAll = () => {
    if (!currentUserId) return;
    const storedNotifications: AppNotification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
    const remainingNotifications = storedNotifications.filter(n => 
      n.target_user_id !== currentUserId && n.target_user_id !== undefined && n.target_user_id !== null
    );
    localStorage.setItem('notifications', JSON.stringify(remainingNotifications));
    setNotifications([]); // Clear local state immediately
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