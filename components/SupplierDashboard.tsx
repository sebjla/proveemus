
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PackageIcon } from './icons/PackageIcon';
import { TruckIcon } from './icons/TruckIcon';
import { ClockIcon } from './icons/ClockIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { Order, OrderStatus } from '../types';

interface SupplierDashboardProps {
    onNavigate: (view: string) => void;
}

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -20 },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export const SupplierDashboard: React.FC<SupplierDashboardProps> = ({ onNavigate }) => {
    const [stats, setStats] = useState({
        opportunities: 12, // Mock for quoting opportunities
        pendingReview: 5,  // Mock
        toDispatch: 0,     // Real Data
        conversionRate: '24%'
    });

    useEffect(() => {
        // Fetch real order counts for logistics
        const allOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
        // Count orders waiting for dispatch (IN_PREPARATION)
        const dispatchCount = allOrders.filter(o => o.status === OrderStatus.IN_PREPARATION).length;
        
        setStats(prev => ({
            ...prev,
            toDispatch: dispatchCount
        }));
    }, []);

    return (
        <motion.div 
            key="supplier-dashboard" 
            variants={containerVariants} 
            initial="hidden" 
            animate="visible" 
            exit="exit"
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Panel de Proveedor</h2>
                    <p className="text-gray-500 mt-1">Resumen de tu actividad comercial y logística.</p>
                </div>
                <div className="bg-teal-50 px-4 py-2 rounded-lg border border-teal-100 flex items-center text-teal-800 text-sm font-medium">
                    <TrendingUpIcon className="w-4 h-4 mr-2" />
                    Tasa de Conversión: {stats.conversionRate}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Card 1: Opportunities */}
                <motion.div 
                    variants={itemVariants} 
                    onClick={() => onNavigate('QUOTES')}
                    className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-all group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                            <ClipboardListIcon className="h-6 w-6"/>
                        </div>
                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-full group-hover:bg-blue-100 transition-colors">
                            Ver Lista
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm font-medium">Oportunidades Abiertas</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.opportunities}</p>
                    <p className="text-xs text-gray-400 mt-2">Solicitudes esperando tu cotización</p>
                </motion.div>

                {/* Card 2: Pending Review */}
                <motion.div 
                    variants={itemVariants} 
                    className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
                            <ClockIcon className="h-6 w-6"/>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm font-medium">Cotizaciones Enviadas</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingReview}</p>
                    <p className="text-xs text-gray-400 mt-2">Esperando adjudicación del colegio</p>
                </motion.div>

                {/* Card 3: To Dispatch */}
                <motion.div 
                    variants={itemVariants} 
                    onClick={() => onNavigate('SHIPMENTS')}
                    className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500 cursor-pointer hover:shadow-lg transition-all"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                            <TruckIcon className="h-6 w-6"/>
                        </div>
                         {stats.toDispatch > 0 && (
                             <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                Acción Requerida
                            </span>
                         )}
                    </div>
                    <p className="text-gray-600 text-sm font-medium">Pedidos Ganados</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.toDispatch}</p>
                    <p className="text-xs text-gray-400 mt-2">Listos para preparación y despacho</p>
                </motion.div>
            </div>

            {/* Recent Activity / Actions Section */}
            <div className="grid md:grid-cols-2 gap-8">
                <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
                    <div className="space-y-3">
                         <button 
                            onClick={() => onNavigate('QUOTES')}
                            className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-teal-50 hover:border-teal-200 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-100 p-2 rounded-md group-hover:bg-white">
                                    <ClipboardListIcon className="w-5 h-5 text-gray-600 group-hover:text-teal-600"/>
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-800 text-sm">Explorar Solicitudes</p>
                                    <p className="text-xs text-gray-500">Buscar nuevos clientes y oportunidades</p>
                                </div>
                            </div>
                            <span className="text-gray-400">→</span>
                        </button>
                        
                        <button 
                            onClick={() => onNavigate('SHIPMENTS')}
                            className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-teal-50 hover:border-teal-200 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-100 p-2 rounded-md group-hover:bg-white">
                                    <TruckIcon className="w-5 h-5 text-gray-600 group-hover:text-teal-600"/>
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-800 text-sm">Gestionar Envíos</p>
                                    <p className="text-xs text-gray-500">Preparar despachos y asignar choferes</p>
                                </div>
                            </div>
                            <span className="text-gray-400">→</span>
                        </button>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                     <h3 className="text-lg font-bold text-gray-900 mb-4">Últimas Notificaciones</h3>
                     <div className="space-y-4">
                        <div className="flex gap-3 items-start pb-3 border-b border-gray-100">
                            <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-800">¡Ganaste una licitación!</p>
                                <p className="text-xs text-gray-500">Colegio San Martin aceptó tu propuesta para "Material Didáctico Primaria".</p>
                                <p className="text-[10px] text-gray-400 mt-1">Hace 2 horas</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start pb-3 border-b border-gray-100">
                             <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-800">Nueva solicitud urgente</p>
                                <p className="text-xs text-gray-500">Colegio Santa Rosa necesita "Libros de Texto Inglés" en 24hs.</p>
                                <p className="text-[10px] text-gray-400 mt-1">Hace 5 horas</p>
                            </div>
                        </div>
                     </div>
                </motion.div>
            </div>
        </motion.div>
    );
};
