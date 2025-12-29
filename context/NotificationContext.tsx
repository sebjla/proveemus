
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
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

  useEffect(() => {
    const fetchSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) setCurrentUserId(session.user.id);
    };
    fetchSession();
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!currentUserId) return;
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`target_user_id.eq.${currentUserId},target_user_id.is.null`)
        .order('timestamp', { ascending: false });
    
    if (!error && data) {
      setNotifications(data);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleNotificationCenter = () => setIsOpen(prev => !prev);

  const addNotification = useCallback(async (
    title: string, 
    message: string, 
    type: AppNotification['type'] = 'info',
    targetRole?: UserRole,
    targetUserId?: string
  ) => {
    const { error } = await supabase.from('notifications').insert({
      title,
      message,
      type,
      target_role: targetRole,
      target_user_id: targetUserId
    });
    
    if (!error) fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
    
    if (!error) fetchNotifications();
  };

  const markAllAsRead = async () => {
    if (!currentUserId) return;
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('target_user_id', currentUserId);
    
    if (!error) fetchNotifications();
  };

  const clearAll = async () => {
    if (!currentUserId) return;
    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('target_user_id', currentUserId);
    
    if (!error) fetchNotifications();
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
