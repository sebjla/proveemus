import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserRole, OrderStatus } from '../types';
import type { User } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { HomeIcon } from './icons/HomeIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { UsersIcon } from './icons/UsersIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { PlusIcon } from './icons/PlusIcon';
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
  const [counts, setCounts] = useState({ adminPending: 0, supplierQuotes: 0, supplierLogistics: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
        if (user.role === UserRole.ADMIN) {
            const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', OrderStatus.PENDING_APPROVAL);
            setCounts(prev => ({ ...prev, adminPending: count || 0 }));
        } else if (user.role === UserRole.SUPPLIER) {
            // Supplier quotes count: orders in IN_REVIEW
            const { count: quotesCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', OrderStatus.IN_REVIEW);
            // Supplier logistics count: orders in IN_PREPARATION where supplier is involved
            // This would ideally join with supplier_quotes and check 'chosen_supplier_id' on orders if implemented.
            // For now, it counts all in_preparation for simplicity of demo
            const { count: logisticsCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', OrderStatus.IN_PREPARATION);
            setCounts(prev => ({ ...prev, supplierQuotes: quotesCount || 0, supplierLogistics: logisticsCount || 0 }));
        }
    };
    fetchCounts();
  }, [user.role]);

  const menuItems = (() => {
    const common = [{ id: 'SETTINGS', label: 'Configuración', icon: SettingsIcon, count: 0 }];
    switch (user.role) {
      case UserRole.ADMIN:
        return [
          { id: 'HOME', label: 'Panel General', icon: HomeIcon, count: 0 },
          { id: 'OPERATIONS', label: 'Operaciones', icon: ClipboardListIcon, count: counts.adminPending }, 
          { id: 'USERS', label: 'Directorio', icon: UsersIcon, count: 0 },
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
          { id: 'QUOTES', label: 'Licitaciones', icon: ClipboardListIcon, count: counts.supplierQuotes }, 
          { id: 'SHIPMENTS', label: 'Logística', icon: TruckIcon, count: counts.supplierLogistics },
          ...common
        ];
      default: return common;
    }
  })();

  return (
    <>
      {isMobileOpen && <div className="fixed inset-0 z-40 bg-gray-800/50 md:hidden" onClick={() => setIsMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-teal-900 text-white transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3 border-b border-teal-800">
            <BookOpenIcon className="w-8 h-8 text-teal-400" />
            <span className="text-xl font-bold tracking-wide">Proveemus</span>
          </div>
          <div className="px-4 py-4 border-b border-teal-800/50">
             <button onClick={toggleNotificationCenter} className="w-full flex items-center px-4 py-2 bg-teal-800/40 rounded-lg hover:bg-teal-800 transition-colors group relative">
               <BellIcon className="w-5 h-5 text-teal-300" />
               <span className="ml-3 text-sm font-medium">Notificaciones</span>
               {unreadCount > 0 && <span className="absolute right-3 top-2.5 px-2 py-1 text-[10px] font-black bg-red-500 rounded-full">{unreadCount}</span>}
             </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
                <button key={item.id} onClick={() => { onNavigate(item.id); setIsMobileOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium ${currentView === item.id ? 'bg-teal-800 text-white shadow-md' : 'text-teal-100 hover:bg-teal-800/50'}`}>
                  <div className="flex items-center">
                    <item.icon className={`w-5 h-5 mr-3 ${currentView === item.id ? 'text-teal-400' : 'text-teal-300'}`} />
                    {item.label}
                  </div>
                  {item.count > 0 && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-700 text-teal-200">{item.count}</span>}
                </button>
            ))}
          </nav>
          <div className="p-4 border-t border-teal-800 bg-teal-950/30">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="h-8 w-8 rounded-full bg-teal-700 flex items-center justify-center text-xs font-bold">{user.schoolName.charAt(0)}</div>
              <p className="text-sm font-medium truncate">{user.schoolName}</p>
            </div>
            <button onClick={onLogout} className="w-full flex items-center justify-center px-4 py-2 text-sm text-teal-200 hover:text-white hover:bg-teal-800 rounded-lg"><LogoutIcon className="w-4 h-4 mr-2" /> Cerrar Sesión</button>
          </div>
        </div>
      </aside>
    </>
  );
};