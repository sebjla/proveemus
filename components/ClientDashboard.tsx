
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { supabase } from '../lib/supabase'; // Supabase calls commented out
import type { Order, OrderItem, User } from '../types';
import { OrderStatus, UserRole } from '../types';
import { NewOrderForm } from './NewOrderForm';
import { OrderStatusBadge } from './OrderStatusBadge';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { PackageIcon } from './icons/PackageIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { PlusIcon } from './icons/PlusIcon';
import { ListIcon } from './icons/ListIcon';
import { OrderDetailsPanel } from './OrderDetailsPanel';
import { useNotifications } from '../context/NotificationContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheckIcon as ConfirmationIcon } from './icons/ShieldCheckIcon';

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
    const { addNotification } = useNotifications();
    const { showToast } = useToast();

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        // Supabase Call commented out:
        // const { data, error } = await supabase
        //     .from('orders')
        //     .select(`
        //         *,
        //         order_items (*)
        //     `)
        //     .eq('user_id', user.id) // user.id is string
        //     .order('created_at', { ascending: false });

        // if (!error && data) {
        //     setOrders(data.map(o => ({
        //         ...o,
        //         items: o.order_items,
        //         schoolName: o.school_name,
        //         createdAt: o.created_at,
        //         expirationDate: o.expiration_date,
        //         requestedDeliveryDate: o.requested_delivery_date,
        //         termsAndConditions: o.terms_and_conditions,
        //         userId: o.user_id // Ensure userId is correctly mapped
        //     })));
        // }
        
        // Simulating no orders for now without backend
        setOrders([]); 
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
        
        // Supabase Call commented out:
        // const { data: order, error: orderError } = await supabase
        //     .from('orders')
        //     .insert({
        //         user_id: user.id, // user.id is string
        //         school_name: user.schoolName,
        //         status: OrderStatus.PENDING_APPROVAL,
        //         expiration_date: details.expirationDate,
        //         requested_delivery_date: details.requestedDeliveryDate,
        //         terms_and_conditions: details.termsAndConditions
        //     })
        //     .select()
        //     .single();

        // if (orderError) {
        //     showToast("Error al crear la solicitud", "error");
        //     setIsSubmitting(false);
        //     return;
        // }

        // const { error: itemsError } = await supabase
        //     .from('order_items')
        //     .insert(items.map(item => ({
        //         order_id: order.id,
        //         quantity: item.quantity,
        //         product: item.product,
        //         brand: item.brand
        //     })));

        // if (itemsError) {
        //     showToast("Error al cargar los artículos", "error");
        // } else {
            showToast("Solicitud enviada con éxito (simulado)", "success");
            addNotification(
                "Nueva Solicitud Recibida (simulado)", 
                `${user.schoolName} ha creado una nueva solicitud de cotización. (simulado)`, 
                "info", 
                UserRole.ADMIN // Target ADMIN role
            );
            await fetchOrders(); // Re-fetch, but will still be empty without backend
            if (onNavigate) onNavigate('HISTORY');
        // }
        
        setIsSubmitting(false);
    };

    const handleUpdateOrder = async (updatedOrder: Order) => {
        // Supabase Call commented out:
        // const { error } = await supabase
        //     .from('orders')
        //     .update({ status: updatedOrder.status })
        //     .eq('id', updatedOrder.id);
        
        // if (!error) {
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
            setSelectedOrder(updatedOrder);
        // }
    };

    const handleConfirmReception = async (orderId: number) => {
        // Supabase Call commented out:
        // const { error } = await supabase
        //     .from('orders')
        //     .update({ status: OrderStatus.DELIVERED })
        //     .eq('id', orderId);

        // if (!error) {
            showToast("¡Recepción confirmada! (simulado)", "success");
            addNotification(
                "Entrega Confirmada (simulado)", 
                `El cliente ${user.schoolName} ha confirmado la recepción de los materiales. (simulado)`, 
                "success", 
                UserRole.SUPPLIER,
                // You would typically get the chosen supplier's ID from the order.
                // For this demo, let's assume a generic supplier notification for now.
                // If a chosen_supplier_id column existed in 'orders', you would use:
                // order.chosen_supplier_id as string
            );
            await fetchOrders(); // Re-fetch, but will still be empty without backend
        // }
    };
    
    const renderContent = () => {
        switch(activeView) {
            case 'NEW_ORDER':
                return (
                    <motion.div key="newOrder" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
                        <h2 className="text-4xl font-black text-gray-900 mb-8 tracking-tighter">Nueva Solicitud de Compras</h2>
                        <NewOrderForm onSubmit={handleOrderSubmit} isSubmitting={isSubmitting} />
                    </motion.div>
                );
            case 'HISTORY':
                return (
                     <div className="space-y-6">
                        <h2 className="text-4xl font-black text-gray-900 mb-8 tracking-tighter">Mis Solicitudes de Abastecimiento</h2>
                         <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-md border border-gray-200">
                            {isLoading ? (
                                <div className="flex justify-center items-center p-8">
                                    <SpinnerIcon className="w-8 h-8 text-teal-600" />
                                </div>
                            ) : orders.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">Aún no se han registrado órdenes de compra.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-gray-100 text-gray-900 border-b border-gray-300">
                                            <tr>
                                                <th scope="col" className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">ID Orden</th>
                                                <th scope="col" className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Fecha</th>
                                                <th scope="col" className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Ítems</th>
                                                <th scope="col" className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Estado</th>
                                                <th scope="col" className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-right">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white">
                                            {orders.map((order) => (
                                                <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
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
                                                    <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                                                        {order.status === OrderStatus.ON_ITS_WAY && (
                                                            <button 
                                                                onClick={() => handleConfirmReception(order.id)}
                                                                className="flex items-center px-4 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl shadow-lg hover:bg-emerald-700 transition-colors"
                                                            >
                                                                <ConfirmationIcon className="w-3 h-3 mr-1" />
                                                                Confirmar
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => setSelectedOrder(order)}
                                                            className="text-teal-700 hover:text-teal-900 font-black hover:underline"
                                                        >
                                                            Detalles
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
                         <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter leading-none">Centro de Compras</h2>
                        <motion.div className="grid md:grid-cols-3 gap-6" variants={containerVariants}>
                            <motion.div variants={itemVariants} className="bg-white rounded-[2rem] shadow-xl p-8 border-l-8 border-teal-500">
                                <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20"><PackageIcon className="h-7 w-7 text-white"/></div>
                                <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Solicitudes Activas</p>
                                <p className="text-4xl font-black text-gray-900">{stats.active}</p>
                            </motion.div>
                            <motion.div variants={itemVariants} className="bg-white rounded-[2rem] shadow-xl p-8 border-l-8 border-amber-500">
                                <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20"><SpinnerIcon className="h-7 w-7 text-white"/></div>
                                <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">En Proceso</p>
                                <p className="text-4xl font-black text-gray-900">{stats.inPreparation}</p>
                            </motion.div>
                            <motion.div variants={itemVariants} className="bg-white rounded-[2rem] shadow-xl p-8 border-l-8 border-emerald-500">
                                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20"><ShieldCheckIcon className="h-7 w-7 text-white"/></div>
                                <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Entregados</p>
                                <p className="text-4xl font-black text-gray-900">{stats.completed}</p>
                            </motion.div>
                        </motion.div>
                        
                        <motion.div className="grid md:grid-cols-2 gap-10" variants={containerVariants}>
                            <motion.div variants={itemVariants} onClick={() => onNavigate && onNavigate('NEW_ORDER')} whileHover={{ y: -8 }} className="bg-white rounded-[3rem] shadow-2xl p-10 cursor-pointer border border-teal-50 hover:border-teal-100 transition-all group">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">Nueva <br/>Solicitud</h2>
                                    <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center group-hover:bg-teal-600 transition-colors">
                                        <PlusIcon className="h-8 w-8 text-teal-600 group-hover:text-white" />
                                    </div>
                                </div>
                                <p className="text-gray-500 text-lg font-medium mb-10 leading-relaxed">Genera una nueva requisición de insumos o equipamiento escolar de forma rápida.</p>
                                <motion.button whileHover={{ scale: 1.02 }} className="w-full px-8 py-5 bg-teal-600 text-white text-xl font-black rounded-[1.5rem] shadow-xl shadow-teal-600/20">
                                    Solicitar Insumos
                                </motion.button>
                            </motion.div>
                            <motion.div variants={itemVariants} onClick={() => onNavigate && onNavigate('HISTORY')} whileHover={{ y: -8 }} className="bg-white rounded-[3rem] shadow-2xl p-10 cursor-pointer border border-teal-50 hover:border-teal-100 transition-all group">
                                 <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">Mis <br/>Órdenes</h2>
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                                        <ListIcon className="h-8 w-8 text-gray-400 group-hover:text-white" />
                                    </div>
                                </div>
                                <p className="text-gray-500 text-lg font-medium mb-10 leading-relaxed">Consulta el historial de tus compras pasadas y monitorea el estado de entrega en tiempo real.</p>
                                <motion.button whileHover={{ scale: 1.02 }} className="w-full px-8 py-5 bg-gray-100 text-gray-800 text-xl font-black rounded-[1.5rem] border border-gray-300 hover:bg-gray-200">
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