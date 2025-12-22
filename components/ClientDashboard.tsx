
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Order, OrderItem, User } from '../types';
import { OrderStatus } from '../types';
import { NewOrderForm } from './NewOrderForm';
import { OrderStatusBadge } from './OrderStatusBadge';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { PackageIcon } from './icons/PackageIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { PlusIcon } from './icons/PlusIcon';
import { ListIcon } from './icons/ListIcon';
import { OrderDetailsPanel } from './OrderDetailsPanel';


const getClientOrders = async (userId: number): Promise<Order[]> => {
    const allOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
    return allOrders.filter(order => order.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const createNewOrder = async (
    userId: number, 
    schoolName: string, 
    items: Omit<OrderItem, 'id'>[], 
    details: { expirationDate: string; requestedDeliveryDate: string; termsAndConditions: string; }
): Promise<Order> => {
    const allOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
    const newOrder: Order = {
        id: Date.now(),
        userId,
        schoolName,
        items: items.map((item, index) => ({ ...item, id: index })),
        status: OrderStatus.PENDING_APPROVAL,
        createdAt: new Date().toISOString(),
        expirationDate: details.expirationDate,
        requestedDeliveryDate: details.requestedDeliveryDate,
        termsAndConditions: details.termsAndConditions,
        comments: [] 
    };
    const updatedOrders = [...allOrders, newOrder];
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    return newOrder;
};

interface ClientDashboardProps {
    user: User;
    activeView?: string;
    onNavigate?: (view: string) => void;
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

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, activeView = 'HOME', onNavigate }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        // Simulate network delay for better UX on fast devices
        await new Promise(res => setTimeout(res, 300));
        const userOrders = await getClientOrders(user.id);
        setOrders(userOrders);
        setIsLoading(false);
    }, [user.id]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
    
    const stats = useMemo(() => {
        const active = orders.filter(o => 
            o.status === OrderStatus.IN_REVIEW || 
            o.status === OrderStatus.PENDING_APPROVAL || 
            o.status === OrderStatus.IN_PREPARATION || 
            o.status === OrderStatus.ON_ITS_WAY
        ).length;
        const inPreparation = orders.filter(o => o.status === OrderStatus.IN_PREPARATION).length;
        const completed = orders.filter(o => o.status === OrderStatus.DELIVERED).length;
        return { active, inPreparation, completed };
    }, [orders]);


    const handleOrderSubmit = async (items: Omit<OrderItem, 'id'>[], details: { expirationDate: string; requestedDeliveryDate: string; termsAndConditions: string; }) => {
        setIsSubmitting(true);
        await createNewOrder(user.id, user.schoolName, items, details);
        await fetchOrders(); 
        setIsSubmitting(false);
        if (onNavigate) onNavigate('HISTORY');
    };

    const handleUpdateOrder = (updatedOrder: Order) => {
        // Update local state
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        setSelectedOrder(updatedOrder);

        // Update persistence
        const allOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
        const newAllOrders = allOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
        localStorage.setItem('orders', JSON.stringify(newAllOrders));
    };
    
    const renderContent = () => {
        switch(activeView) {
            case 'NEW_ORDER':
                return (
                    <motion.div key="newOrder" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Nueva Solicitud de Compras</h2>
                        <NewOrderForm onSubmit={handleOrderSubmit} isSubmitting={isSubmitting} />
                    </motion.div>
                );
            case 'HISTORY':
                return (
                     <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Historial de Compras</h2>
                         <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200">
                            {isLoading ? (
                                <div className="flex justify-center items-center p-8">
                                    <SpinnerIcon className="w-8 h-8 text-teal-600" />
                                </div>
                            ) : orders.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">Aún no se han registrado órdenes de compra.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    {/* Simplified Table Structure to ensure visibility */}
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-gray-100 text-gray-900 border-b border-gray-300">
                                            <tr>
                                                <th scope="col" className="px-6 py-4 font-bold">ID Orden</th>
                                                <th scope="col" className="px-6 py-4 font-bold">Fecha</th>
                                                <th scope="col" className="px-6 py-4 font-bold">Ítems</th>
                                                <th scope="col" className="px-6 py-4 font-bold">Estado</th>
                                                <th scope="col" className="px-6 py-4 font-bold text-right">Detalles</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white">
                                            {orders.map((order) => (
                                                <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-bold text-gray-900">
                                                        #{order.id.toString().slice(-6)}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-900 font-medium">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-900 font-medium">
                                                        {order.items.length}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <OrderStatusBadge status={order.status} />
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button 
                                                            onClick={() => setSelectedOrder(order)}
                                                            className="text-teal-700 hover:text-teal-900 font-bold hover:underline"
                                                        >
                                                            Ver Orden
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
            case 'HOME':
            default:
                 return (
                    <motion.div key="dashboard" className="space-y-12" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
                         <h2 className="text-3xl font-bold text-gray-900 mb-4">Centro de Compras</h2>
                        <motion.div className="grid md:grid-cols-3 gap-6" variants={containerVariants}>
                            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
                                <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center mb-4"><PackageIcon className="h-6 w-6 text-white"/></div>
                                <p className="text-gray-600 text-sm">Solicitudes Activas</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
                            </motion.div>
                            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-500">
                                <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mb-4"><SpinnerIcon className="h-6 w-6 text-white"/></div>
                                <p className="text-gray-600 text-sm">En Proceso</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.inPreparation}</p>
                            </motion.div>
                            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
                                <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mb-4"><ShieldCheckIcon className="h-6 w-6 text-white"/></div>
                                <p className="text-gray-600 text-sm">Entregados</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
                            </motion.div>
                        </motion.div>
                        
                        <motion.div className="grid md:grid-cols-2 gap-6" variants={containerVariants}>
                            <motion.div variants={itemVariants} onClick={() => onNavigate && onNavigate('NEW_ORDER')} whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }} className="bg-white rounded-xl shadow-md p-8 cursor-pointer border border-teal-50 hover:border-teal-100 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">Nueva Solicitud</h2>
                                    <PlusIcon className="h-8 w-8 text-teal-600" />
                                </div>
                                <p className="text-gray-600 mb-6">Genera una nueva requisición de insumos o equipamiento para tu empresa.</p>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full px-4 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 transition-colors">
                                    Solicitar Insumos
                                </motion.button>
                            </motion.div>
                            <motion.div variants={itemVariants} onClick={() => onNavigate && onNavigate('HISTORY')} whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }} className="bg-white rounded-xl shadow-md p-8 cursor-pointer border border-teal-50 hover:border-teal-100 transition-colors">
                                 <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">Mis Órdenes</h2>
                                    <ListIcon className="h-8 w-8 text-teal-600" />
                                </div>
                                <p className="text-gray-600 mb-6">Consulta el historial de compras y el estado de entrega.</p>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-md border border-gray-300 hover:bg-gray-200 transition-colors">
                                    Ver Historial
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                );
        }
    }
    
    return (
        <>
            <OrderDetailsPanel 
                order={selectedOrder} 
                currentUser={user} 
                onClose={() => setSelectedOrder(null)}
                onUpdateOrder={handleUpdateOrder}
            />
            <AnimatePresence mode="wait">
                {renderContent()}
            </AnimatePresence>
        </>
    );
};
