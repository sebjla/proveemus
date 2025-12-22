
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SupplierOrder, Order, OrderStatus } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { FilterIcon } from './icons/FilterIcon';
import { ClockIcon } from './icons/ClockIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface SupplierOrdersListProps {
    onSelectOrder?: (orderId: string) => void;
}

const formatRemainingTime = (seconds: number): string => {
  if (seconds <= 0) return '0h 0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
  }
  
  return `${hours}h ${minutes}m`;
};

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
};

const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
};

export const SupplierOrdersList: React.FC<SupplierOrdersListProps> = ({ onSelectOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load Real Orders from LocalStorage
  useEffect(() => {
    const fetchOrders = async () => {
        setIsLoading(true);
        // Simulate network delay
        await new Promise(res => setTimeout(res, 400));
        
        const allOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
        // Load quotes to check which orders have been quoted by this supplier
        const savedQuotes = JSON.parse(localStorage.getItem('supplier_quotes') || '[]');
        const mySupplierId = 3; // Hardcoded ID for the supplier user

        // Filter only orders that are approved by admin (IN_REVIEW)
        const relevantOrders = allOrders.filter(o => 
            o.status === OrderStatus.IN_REVIEW || 
            o.status === OrderStatus.IN_PREPARATION 
        );

        // Map domain Order to View Model SupplierOrder
        const mappedOrders: SupplierOrder[] = relevantOrders.map(o => {
            // Check if THIS supplier has already quoted this order
            const hasQuoted = savedQuotes.some((q: any) => q.orderId === o.id.toString() && q.supplierId === mySupplierId);

            // Calculate a fake expiry date 7 days after creation
            const createdDate = new Date(o.createdAt);
            const expiryDate = new Date(createdDate.getTime() + (7 * 24 * 60 * 60 * 1000));
            const now = new Date();
            const remainingSeconds = Math.max(0, Math.floor((expiryDate.getTime() - now.getTime()) / 1000));
            
            let status: SupplierOrder['status'] = 'PENDIENTE';
            
            if (hasQuoted) status = 'COTIZADA';
            if (o.status === OrderStatus.IN_PREPARATION) status = 'COTIZADA'; // Or "ADJUDICADA" if specific logic exists
            if (remainingSeconds === 0) status = 'VENCIDA';

            return {
                id: o.id.toString(),
                schoolName: o.schoolName,
                title: `Solicitud de Materiales (${o.items.length} ítems)`, 
                itemsTotal: o.items.length,
                itemsQuoted: 0, 
                status: status,
                remainingTimeSeconds: remainingSeconds,
                province: 'Buenos Aires', 
                createdAt: o.createdAt
            };
        });

        setOrders(mappedOrders.sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
        setIsLoading(false);
    };

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search Text
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.title.toLowerCase().includes(searchTerm.toLowerCase());

      // Status Filter
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

      // Urgency Filter
      let matchesUrgency = true;
      if (urgencyFilter === 'URGENT') {
          matchesUrgency = order.remainingTimeSeconds > 0 && order.remainingTimeSeconds < 86400; // < 24 hours
      } else if (urgencyFilter === 'NORMAL') {
          matchesUrgency = order.remainingTimeSeconds >= 86400;
      }

      return matchesSearch && matchesStatus && matchesUrgency;
    });
  }, [searchTerm, statusFilter, urgencyFilter, orders]);

  const clearFilters = () => {
      setSearchTerm('');
      setStatusFilter('ALL');
      setUrgencyFilter('ALL');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h2 className="text-3xl font-bold text-gray-900">Bandeja de Cotizaciones</h2>
           <p className="text-gray-500 mt-1">Gestiona las solicitudes de abastecimiento abiertas por las empresas.</p>
        </div>
        <div className="flex gap-2">
             <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Exportar Reporte
            </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Global Search */}
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-gray-900"
              placeholder="Buscar por Código, Cliente o Título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FilterIcon className="h-4 w-4 text-gray-500" />
                </div>
                <select 
                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white text-gray-900"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">Estado: Todos</option>
                    <option value="PENDIENTE">Pendientes</option>
                    <option value="COTIZADA">Cotizadas</option>
                    <option value="VENCIDA">Vencidas</option>
                </select>
            </div>

             <div className="relative w-full sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ClockIcon className="h-4 w-4 text-gray-500" />
                </div>
                <select 
                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white text-gray-900"
                    value={urgencyFilter}
                    onChange={(e) => setUrgencyFilter(e.target.value)}
                >
                    <option value="ALL">Urgencia: Todas</option>
                    <option value="URGENT">Urgente ({'<'} 24h)</option>
                    <option value="NORMAL">Normal ({'>'} 24h)</option>
                </select>
            </div>

            <button 
                onClick={clearFilters}
                className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Limpiar Filtros"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden min-h-[400px]">
        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <SpinnerIcon className="w-8 h-8 text-teal-600" />
            </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold text-gray-800">Código</th>
                <th scope="col" className="px-6 py-4 font-bold text-gray-800">Tiempo Restante</th>
                <th scope="col" className="px-6 py-4 font-bold text-gray-800">Estado</th>
                <th scope="col" className="px-6 py-4 font-bold text-gray-800">Título</th>
                <th scope="col" className="px-6 py-4 font-bold text-gray-800">Organización / Cliente</th>
                <th scope="col" className="px-6 py-4 font-bold text-gray-800 text-center">Ítems</th>
                <th scope="col" className="px-6 py-4 font-bold text-gray-800">Provincia</th>
                <th scope="col" className="px-6 py-4 font-bold text-gray-800 text-right">Acción</th>
              </tr>
            </thead>
            <motion.tbody 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
              {filteredOrders.length === 0 ? (
                  <tr>
                      <td colSpan={8} className="px-6 py-16 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                              <SearchIcon className="w-10 h-10 text-gray-300 mb-2"/>
                              <p>No se encontraron solicitudes activas.</p>
                              <p className="text-xs text-gray-400 mt-1">Espera a que los administradores aprueben nuevas licitaciones.</p>
                          </div>
                      </td>
                  </tr>
              ) : (
                filteredOrders.map((order) => {
                  // Logic for styling based on urgency/status
                  const isUrgent = order.remainingTimeSeconds > 0 && order.remainingTimeSeconds < 86400; // 24 hours
                  const isExpired = order.status === 'VENCIDA';
                  const isQuoted = order.status === 'COTIZADA';
                  
                  // Row background
                  let rowClass = "border-b hover:bg-gray-50 transition-colors group";
                  if (isUrgent) rowClass += " bg-red-50/30 hover:bg-red-50";
                  if (isExpired) rowClass += " bg-gray-50 text-gray-400";
                  if (isQuoted) rowClass += " bg-blue-50/30";

                  // Time Badge color
                  let timeBadgeClass = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
                  if (isExpired) timeBadgeClass += " bg-gray-200 text-gray-600";
                  else if (isUrgent) timeBadgeClass += " bg-red-100 text-red-700 animate-pulse";
                  else timeBadgeClass += " bg-emerald-100 text-emerald-800";

                  // Status Badge color
                  let statusBadgeClass = "px-2 py-1 text-xs font-medium rounded-md border";
                  if (order.status === 'PENDIENTE') statusBadgeClass += " bg-yellow-50 text-yellow-700 border-yellow-200";
                  if (order.status === 'COTIZADA') statusBadgeClass += " bg-blue-50 text-blue-700 border-blue-200";
                  if (order.status === 'VENCIDA') statusBadgeClass += " bg-gray-100 text-gray-600 border-gray-200";

                  return (
                    <motion.tr key={order.id} variants={rowVariants} className={rowClass}>
                      <td className={`px-6 py-4 font-medium ${isExpired ? '' : 'text-teal-700 group-hover:text-teal-900 group-hover:underline cursor-pointer'}`} onClick={() => !isExpired && onSelectOrder && onSelectOrder(order.id)}>
                        #{order.id.slice(-6)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={timeBadgeClass}>
                            <ClockIcon className="w-3 h-3 mr-1" />
                            {formatRemainingTime(order.remainingTimeSeconds)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={statusBadgeClass}>{order.status}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                          {order.title}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                          {order.schoolName}
                      </td>
                      <td className="px-6 py-4 text-center">
                          <span className="font-semibold text-gray-900">{order.itemsQuoted}</span>
                          <span className="text-gray-400 mx-1">/</span>
                          <span className="text-gray-600">{order.itemsTotal}</span>
                      </td>
                      <td className="px-6 py-4">
                          <div className="flex items-center text-gray-700">
                             <MapPinIcon className="w-4 h-4 mr-1 text-gray-400" />
                             {order.province}
                          </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                          <button 
                            disabled={isExpired}
                            onClick={() => onSelectOrder && onSelectOrder(order.id)}
                            className={`px-4 py-2 rounded-md text-xs font-bold shadow-sm transition-all transform hover:-translate-y-0.5
                                ${isExpired 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : isQuoted 
                                        ? 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-50' 
                                        : 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-md'
                                }`}
                          >
                              {isQuoted ? 'EDITAR OFERTA' : 'COTIZAR'}
                          </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </motion.tbody>
          </table>
        </div>
        )}
        {/* Pagination mock */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-xs text-gray-500">Mostrando {filteredOrders.length} resultados</span>
            <div className="flex gap-1">
                <button className="px-3 py-1 border border-gray-300 rounded bg-white text-xs text-gray-600 disabled:opacity-50" disabled>Anterior</button>
                <button className="px-3 py-1 border border-gray-300 rounded bg-white text-xs text-gray-600 hover:bg-gray-50">Siguiente</button>
            </div>
        </div>
      </div>
    </div>
  );
};
