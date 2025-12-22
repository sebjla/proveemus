
import React, { useMemo } from 'react';
import { UserRole, OrderStatus, Order } from '../types';
import type { User } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { HomeIcon } from './icons/HomeIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { UsersIcon } from './icons/UsersIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { PlusIcon } from './icons/PlusIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { TruckIcon } from './icons/TruckIcon';
import { BellIcon } from './icons/BellIcon';
import { useNotifications } from '../context/NotificationContext';

interface SidebarProps {
  user: User;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  user, 
  currentView, 
  onNavigate, 
  onLogout,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const { unreadCount, toggleNotificationCenter } = useNotifications();
  
  // Calculate badges based on localStorage data
  const counts = useMemo(() => {
      const allOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
      
      return {
          adminPending: allOrders.filter(o => o.status === OrderStatus.PENDING_APPROVAL).length,
          supplierLogistics: allOrders.filter(o => o.status === OrderStatus.IN_PREPARATION).length,
          // For quotes, simplistic logic: all 'IN_REVIEW' are potential quotes
          supplierQuotes: allOrders.filter(o => o.status === OrderStatus.IN_REVIEW).length
      }
  }, []); // Run once on mount (in real app, this would listen to updates or context)

  const getMenuItems = () => {
    const common = [
      { id: 'SETTINGS', label: 'Configuración', icon: SettingsIcon, count: 0 },
    ];

    switch (user.role) {
      case UserRole.ADMIN:
        return [
          { id: 'HOME', label: 'Panel General', icon: HomeIcon, count: 0 },
          // Unified Lifecycle View
          { id: 'OPERATIONS', label: 'Gestión de Operaciones', icon: ClipboardListIcon, count: counts.adminPending }, 
          { id: 'USERS', label: 'Directorio de Empresas', icon: UsersIcon, count: 0 },
          ...common
        ];
      case UserRole.CLIENT:
        return [
          { id: 'HOME', label: 'Inicio', icon: HomeIcon, count: 0 },
          { id: 'NEW_ORDER', label: 'Nueva Solicitud', icon: PlusIcon, count: 0 },
          { id: 'HISTORY', label: 'Mis Solicitudes', icon: ClipboardListIcon, count: 0 },
          ...common
        ];
      case UserRole.SUPPLIER:
        return [
          { id: 'HOME', label: 'Inicio', icon: HomeIcon, count: 0 },
          { id: 'QUOTES', label: 'Bandeja de Entrada', icon: ClipboardListIcon, count: counts.supplierQuotes }, 
          { id: 'SHIPMENTS', label: 'Logística y Envíos', icon: TruckIcon, count: counts.supplierLogistics },
          ...common
        ];
      default:
        return common;
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-800 bg-opacity-50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-teal-900 text-white transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="p-6 flex items-center gap-3 border-b border-teal-800">
            <BookOpenIcon className="w-8 h-8 text-teal-400" />
            <span className="text-xl font-bold tracking-wide">Proveemus</span>
          </div>

          {/* Quick Action: Notifications */}
          <div className="px-4 py-4 border-b border-teal-800/50">
             <button
               onClick={toggleNotificationCenter}
               className="w-full flex items-center px-4 py-2 bg-teal-800/40 rounded-lg hover:bg-teal-800 transition-colors group relative"
             >
               <BellIcon className="w-5 h-5 text-teal-300 group-hover:text-white" />
               <span className="ml-3 text-sm font-medium text-teal-100 group-hover:text-white">Notificaciones</span>
               {unreadCount > 0 && (
                 <span className="absolute right-3 top-2.5 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-0 bg-red-500 rounded-full">
                   {unreadCount}
                 </span>
               )}
             </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-teal-800 text-white shadow-md' 
                      : 'text-teal-100 hover:bg-teal-800/50 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-teal-400' : 'text-teal-300'}`} />
                    {item.label}
                  </div>
                  {item.count > 0 && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-teal-600 text-white' : 'bg-teal-700 text-teal-200'}`}>
                          {item.count}
                      </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-teal-800 bg-teal-950/30">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="h-8 w-8 rounded-full bg-teal-700 flex items-center justify-center text-xs font-bold">
                {user.schoolName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user.schoolName}</p>
                <p className="text-xs text-teal-400 truncate">{user.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center px-4 py-2 text-sm text-teal-200 hover:text-white hover:bg-teal-800 rounded-lg transition-colors"
            >
              <LogoutIcon className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
