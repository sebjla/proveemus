
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { SupplierOrder, Order, OrderStatus } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { FilterIcon } from './icons/FilterIcon';
import { ClockIcon } from './icons/ClockIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface SupplierOrdersListProps {
    onSelectOrder?: (orderId: string) => void;
}

const formatRemainingTime = (seconds: number): string => {
  if (seconds <= 0) return 'Vencida';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${minutes}m`;
};

export const SupplierOrdersList: React.FC<SupplierOrdersListProps> = ({ onSelectOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: allOrders } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .in('status', [OrderStatus.IN_REVIEW, OrderStatus.IN_PREPARATION]);

        const { data: myQuotes } = await supabase
            .from('supplier_quotes')
            .select('order_id')
            .eq('supplier_id', session.user.id);

        if (allOrders) {
            const mapped = allOrders.map(o => {
                const quotedIds = myQuotes?.map(q => q.order_id.toString()) || [];
                const hasQuoted = quotedIds.includes(o.id.toString());
                
                const createdDate = new Date(o.created_at);
                const expiryDate = new Date(createdDate.getTime() + (7 * 24 * 60 * 60 * 1000));
                const remaining = Math.max(0, Math.floor((expiryDate.getTime() - Date.now()) / 1000));

                return {
                    id: o.id.toString(),
                    schoolName: o.school_name,
                    title: `Pedido de Materiales`,
                    itemsTotal: o.order_items.length,
                    itemsQuoted: 0,
                    status: remaining === 0 ? 'VENCIDA' : (hasQuoted ? 'COTIZADA' : 'PENDIENTE'),
                    remainingTimeSeconds: remaining,
                    province: 'Buenos Aires',
                    createdAt: o.created_at
                } as SupplierOrder;
            });
            setOrders(mapped);
        }
        setIsLoading(false);
    };

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.schoolName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, orders]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Bandeja de Licitaciones</h2>
           <p className="text-gray-500 font-medium mt-1">Oportunidades de venta disponibles actualmente.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <SearchIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-300" />
            <input
              type="text"
              placeholder="Buscar por cliente..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-teal-500 focus:border-teal-500 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-64 relative">
             <FilterIcon className="absolute left-4 top-3.5 h-4 w-4 text-gray-300" />
             <select 
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
             >
                <option value="ALL">Todos los Estados</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="COTIZADA">Cotizadas</option>
             </select>
          </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl border border-gray-50 overflow-hidden min-h-[400px]">
        {isLoading ? (
            <div className="flex justify-center items-center py-24"><SpinnerIcon className="w-10 h-10 text-teal-600" /></div>
        ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-6 font-black uppercase text-[10px] tracking-widest">Código</th>
                    <th className="px-8 py-6 font-black uppercase text-[10px] tracking-widest">Tiempo</th>
                    <th className="px-8 py-6 font-black uppercase text-[10px] tracking-widest">Estado</th>
                    <th className="px-8 py-6 font-black uppercase text-[10px] tracking-widest">Organización</th>
                    <th className="px-8 py-6 font-black uppercase text-[10px] tracking-widest text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 font-black text-gray-900">#{o.id.slice(-6)}</td>
                      <td className="px-8 py-6 font-bold text-teal-600 flex items-center gap-2">
                        <ClockIcon className="w-4 h-4" /> {formatRemainingTime(o.remainingTimeSeconds)}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                            o.status === 'PENDIENTE' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                        }`}>{o.status}</span>
                      </td>
                      <td className="px-8 py-6 font-black text-gray-700">{o.schoolName}</td>
                      <td className="px-8 py-6 text-right">
                        <button 
                            onClick={() => onSelectOrder && onSelectOrder(o.id)}
                            className="px-6 py-2 bg-teal-600 text-white font-black text-xs rounded-xl shadow-lg shadow-teal-600/20"
                        >
                            {o.status === 'COTIZADA' ? 'REVISAR' : 'COTIZAR'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        )}
      </div>
    </div>
  );
};
