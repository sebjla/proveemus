
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { supabase } from '../lib/supabase'; // Supabase calls commented out
import type { Order, User, OrderItem } from '../types';
import { OrderStatus, UserRole } from '../types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { PackageIcon } from './icons/PackageIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { NewOrderForm } from './NewOrderForm';
import { PlusIcon } from './icons/PlusIcon';
import { UsersIcon } from './icons/UsersIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ClockIcon } from './icons/ClockIcon';
import { TruckIcon } from './icons/TruckIcon';
import { ConfirmationModal } from './ConfirmationModal';
import { useNotifications } from '../context/NotificationContext';
import { useToast } from '../context/ToastContext';
import { OrderDetailsPanel } from './OrderDetailsPanel';
import { CheckIcon } from './icons/CheckIcon';

interface AdminDashboardProps {
  activeView?: string;
  onNavigate?: (view: string, orderId?: string) => void;
}

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -20 },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeView = 'HOME', onNavigate }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeOpsTab, setActiveOpsTab] = useState<'pending' | 'bidding' | 'logistics' | 'history'>('pending');
    const [clientFilter, setClientFilter] = useState<string>('ALL'); // Filter is string (UUID)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clients, setClients] = useState<User[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>(''); // Client ID is string (UUID)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const { addNotification } = useNotifications();
    const { showToast } = useToast();

    const fetchOrdersAndClients = useCallback(async () => {
        setIsLoading(true);
        
        // Supabase Calls commented out:
        // const { data: ordersData } = await supabase
        //     .from('orders')
        //     .select('*, order_items(*)')
        //     .order('created_at', { ascending: false });

        // if (ordersData) {
        //     setOrders(ordersData.map(o => ({
        //         ...o,
        //         items: o.order_items,
        //         createdAt: o.created_at,
        //         schoolName: o.school_name,
        //         expirationDate: o.expiration_date,
        //         requestedDeliveryDate: o.requested_delivery_date,
        //         termsAndConditions: o.terms_and_conditions,
        //         userId: o.user_id // Ensure userId is correctly mapped
        //     })));
        // }

        // const { data: profilesData } = await supabase
        //     .from('profiles')
        //     .select('*')
        //     .eq('role', UserRole.CLIENT);

        // if (profilesData) {
        //     setClients(profilesData.map(p => ({
        //         id: p.id,
        //         email: p.email,
        //         role: p.role as UserRole,
        //         schoolName: p.school_name,
        //         address: p.address,
        //         cuit: p.cuit,
        //         taxStatus: p.tax_status
        //     })));
        //     if (profilesData.length > 0 && !selectedClientId) {
        //         setSelectedClientId(profilesData[0].id);
        //     }
        // }
        
        // Simulating no orders/clients for now without backend
        setOrders([]);
        const dummyClients: User[] = [
            { id: 'client-1', email: 'client1@test.com', role: UserRole.CLIENT, schoolName: 'Colegio Dummy 1', address: 'Calle Falsa 123', cuit: '20-12345678-9', taxStatus: 'Responsable Inscripto' },
            { id: 'client-2', email: 'client2@test.com', role: UserRole.CLIENT, schoolName: 'Escuela Prueba 2', address: 'Avenida Imaginaria 456', cuit: '30-98765432-1', taxStatus: 'Monotributista' },
        ];
        setClients(dummyClients);
        if (dummyClients.length > 0 && !selectedClientId) {
            setSelectedClientId(dummyClients[0].id);
        }

        setIsLoading(false);
    }, [selectedClientId]);

    useEffect(() => {
        fetchOrdersAndClients();
    }, [fetchOrdersAndClients]);

    const stats = useMemo(() => {
        const total = orders.length;
        const pending = orders.filter(o => o.status === OrderStatus.PENDING_APPROVAL).length;
        const inReview = orders.filter(o => o.status === OrderStatus.IN_REVIEW).length;
        const completed = orders.filter(o => o.status === OrderStatus.DELIVERED).length;
        return { total, pending, inReview, completed };
    }, [orders]);
    
    const handleUpdateStatus = async (orderId: number, status: OrderStatus) => {
        // Supabase Call commented out:
        // const { error } = await supabase
        //     .from('orders')
        //     .update({ status })
        //     .eq('id', orderId);

        // if (!error) {
            // Fetch updated orders and clients
            await fetchOrdersAndClients(); // This will re-fetch dummy data or empty arrays
            showToast(`Solicitud actualizada a ${status} (simulado)`, "success");

            // Get the updated order to find the client for notification
            const updatedOrder = orders.find(o => o.id === orderId);
            if (updatedOrder && updatedOrder.userId) {
                // Notify the client of the status change
                addNotification(
                    "Actualización de Pedido (simulado)",
                    `El estado de tu pedido #${orderId.toString().slice(-6)} ha cambiado a: ${status} (simulado)`,
                    "info",
                    UserRole.CLIENT,
                    updatedOrder.userId // userId is already string
                );
            }
             // Admin internal notification
             addNotification("Estado Actualizado (simulado)", `El pedido ${orderId.toString().slice(-6)} ahora está: ${status} (simulado)`, "info", UserRole.ADMIN);

        // } else {
        //     showToast("Error al actualizar la solicitud (simulado)", "error");
        // }
    };
    
    const handleOrderSubmit = async (items: Omit<OrderItem, 'id'>[], details: { expirationDate: string; requestedDeliveryDate: string; termsAndConditions: string; }) => {
        const selectedClient = clients.find(c => c.id === selectedClientId);
        if (!selectedClient) {
            showToast("Error: Cliente no seleccionado.", "error");
            return;
        }
        
        setIsSubmitting(true);
        // Supabase Call commented out:
        // const { data: order, error: orderError } = await supabase
        //     .from('orders')
        //     .insert({
        //         user_id: selectedClient.id, // selectedClient.id is string
        //         school_name: selectedClient.schoolName,
        //         status: OrderStatus.PENDING_APPROVAL,
        //         expiration_date: details.expirationDate,
        //         requested_delivery_date: details.requestedDeliveryDate,
        //         terms_and_conditions: details.termsAndConditions
        //     })
        //     .select().single();

        // if (order) {
        //     await supabase.from('order_items').insert(items.map(i => ({
        //         order_id: order.id,
        //         quantity: i.quantity,
        //         product: i.product,
        //         brand: i.brand
        //     })));
            await fetchOrdersAndClients(); // This will re-fetch dummy data or empty arrays
            addNotification("Solicitud Creada (simulado)", `Nueva solicitud creada para ${selectedClient.schoolName} (simulado)`, "success", UserRole.CLIENT, selectedClient.id); // selectedClient.id is string
            if (onNavigate) onNavigate('OPERATIONS');
        // }
        setIsSubmitting(false);
    };

    const opsOrders = useMemo(() => {
        return orders.filter(order => {
            // clientFilter is string (UUID), order.userId is string (UUID)
            if (clientFilter !== 'ALL' && order.userId !== clientFilter) return false;
            if (activeOpsTab === 'pending') return order.status === OrderStatus.PENDING_APPROVAL;
            if (activeOpsTab === 'bidding') return order.status === OrderStatus.IN_REVIEW;
            if (activeOpsTab === 'logistics') return order.status === OrderStatus.IN_PREPARATION || order.status === OrderStatus.ON_ITS_WAY;
            if (activeOpsTab === 'history') return order.status === OrderStatus.DELIVERED || order.status === OrderStatus.REJECTED;
            return false;
        });
    }, [orders, activeOpsTab, clientFilter]);

    const renderContent = () => {
        switch (activeView) {
            case 'NEW_ORDER':
                return (
                    <motion.div key="newOrder" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
                        <h2 className="text-4xl font-black text-gray-900 mb-8 tracking-tighter">Nueva Solicitud de Cotización</h2>
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-200 mb-8">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Seleccionar Organización</label>
                            <select
                                value={selectedClientId}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-lg font-bold rounded-xl p-4 focus:ring-teal-500 focus:border-teal-500"
                            >
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.schoolName}</option>
                                ))}
                            </select>
                        </div>
                        <NewOrderForm onSubmit={handleOrderSubmit} isSubmitting={isSubmitting} />
                    </motion.div>
                );

            case 'OPERATIONS':
                return (
                    <motion.div key="operations" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                            <div>
                                <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Gestión de Operaciones</h2>
                                <p className="text-gray-500 mt-2 font-medium">Control unificado de solicitudes, licitaciones y envíos.</p>
                            </div>
                             <div className="w-full md:w-80">
                                <select
                                    value={clientFilter}
                                    onChange={(e) => setClientFilter(e.target.value)}
                                    className="w-full bg-white border border-gray-200 text-gray-900 font-bold rounded-xl p-3 shadow-sm"
                                >
                                    <option value="ALL">Todas las Organizaciones</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.schoolName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap border-b border-gray-200 mb-8 px-2">
                             {['pending', 'bidding', 'logistics', 'history'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveOpsTab(tab as any)}
                                    className={`px-8 py-4 text-sm font-black uppercase tracking-widest border-b-4 transition-all ${
                                        activeOpsTab === tab ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {tab === 'pending' && 'Pendientes'}
                                    {tab === 'bidding' && 'Licitación'}
                                    {tab === 'logistics' && 'Logística'}
                                    {tab === 'history' && 'Historial'}
                                </button>
                             ))}
                        </div>

                        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden min-h-[400px]">
                             {isLoading ? ( <div className="flex justify-center items-center p-12"> <SpinnerIcon className="w-10 h-10 text-teal-600" /> </div>
                                ) : opsOrders.length === 0 ? ( 
                                    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                                        <PackageIcon className="w-16 h-16 mb-4 opacity-20" />
                                        <p className="font-bold">No hay registros en esta etapa.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.2em]">ID</th>
                                                    <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.2em]">Organización</th>
                                                    <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.2em]">Fecha</th>
                                                    <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.2em]">Estado</th>
                                                    <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.2em] text-right">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {opsOrders.map(order => (
                                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-8 py-6 font-black text-gray-900">#{order.id.toString().slice(-6)}</td>
                                                        <td className="px-8 py-6 font-bold text-gray-700">{order.schoolName}</td>
                                                        <td className="px-8 py-6 font-medium text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-8 py-6"><OrderStatusBadge status={order.status} /></td>
                                                        <td className="px-8 py-6 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => setSelectedOrder(order)} className="px-4 py-2 text-teal-600 font-black text-xs hover:bg-teal-50 rounded-lg">Detalles</button>
                                                                {order.status === OrderStatus.PENDING_APPROVAL && (
                                                                    <button onClick={() => handleUpdateStatus(order.id, OrderStatus.IN_REVIEW)} className="px-4 py-2 bg-teal-600 text-white font-black text-xs rounded-lg shadow-lg shadow-teal-600/20">Publicar</button>
                                                                )}
                                                                {order.status === OrderStatus.IN_REVIEW && (
                                                                    <button onClick={() => onNavigate && onNavigate('QUOTE_COMPARISON', order.id.toString())} className="px-4 py-2 bg-indigo-600 text-white font-black text-xs rounded-lg shadow-lg shadow-indigo-600/20">Comparar</button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                        </div>
                    </motion.div>
                );

             case 'USERS':
                return (
                    <motion.div key="manageUsers" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
                        <h2 className="text-4xl font-black text-gray-900 mb-12 tracking-tighter">Directorio Corporativo</h2>
                        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.2em]">Razón Social</th>
                                        <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.2em]">CUIT</th>
                                        <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.2em]">Contacto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {clients.map(client => (
                                        <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-8 py-6">
                                                <p className="font-black text-gray-900">{client.schoolName}</p>
                                                <p className="text-xs text-gray-400">{client.address}</p>
                                            </td>
                                            <td className="px-8 py-6 font-bold text-gray-600">{client.cuit}</td>
                                            <td className="px-8 py-6 font-medium text-gray-500">{client.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                );
            case 'HOME':
            default:
                return (
                    <motion.div key="dashboard" className="space-y-12" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
                         <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">Panel Maestro</h2>
                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-[2rem] shadow-xl p-8 border-l-8 border-teal-500">
                                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-1">Total Órdenes</p>
                                <p className="text-4xl font-black text-gray-900">{stats.total}</p>
                            </div>
                            <div className="bg-white rounded-[2rem] shadow-xl p-8 border-l-8 border-amber-500">
                                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-1">Pendientes</p>
                                <p className="text-4xl font-black text-gray-900">{stats.pending}</p>
                            </div>
                            <div className="bg-white rounded-[2rem] shadow-xl p-8 border-l-8 border-blue-500">
                                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-1">En Licitación</p>
                                <p className="text-4xl font-black text-gray-900">{stats.inReview}</p>
                            </div>
                            <div className="bg-white rounded-[2rem] shadow-xl p-8 border-l-8 border-emerald-500">
                                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-1">Completadas</p>
                                <p className="text-4xl font-black text-gray-900">{stats.completed}</p>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <motion.div onClick={() => onNavigate && onNavigate('NEW_ORDER')} whileHover={{ y: -8 }} className="bg-white rounded-[3rem] shadow-2xl p-10 cursor-pointer border border-teal-50 hover:border-teal-100 transition-all group">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">Nueva <br/>Solicitud</h2>
                                    <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center group-hover:bg-teal-600 transition-colors">
                                        <PlusIcon className="h-8 w-8 text-teal-600 group-hover:text-white" />
                                    </div>
                                </div>
                                <button className="w-full py-5 bg-teal-600 text-white text-xl font-black rounded-2xl shadow-xl shadow-teal-600/20">Crear</button>
                            </motion.div>
                            <motion.div onClick={() => onNavigate && onNavigate('OPERATIONS')} whileHover={{ y: -8 }} className="bg-white rounded-[3rem] shadow-2xl p-10 cursor-pointer border border-indigo-50 hover:border-indigo-100 transition-all group">
                                 <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">Gestión <br/>Operativa</h2>
                                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                        <ChartBarIcon className="h-8 w-8 text-indigo-600 group-hover:text-white" />
                                    </div>
                                </div>
                                <button className="w-full py-5 bg-indigo-600 text-white text-xl font-black rounded-2xl shadow-xl shadow-indigo-600/20">Gestionar</button>
                            </motion.div>
                            <motion.div onClick={() => onNavigate && onNavigate('USERS')} whileHover={{ y: -8 }} className="bg-white rounded-[3rem] shadow-2xl p-10 cursor-pointer border border-gray-50 hover:border-gray-100 transition-all group">
                                 <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">Empresas <br/>Registradas</h2>
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                                        <UsersIcon className="h-8 w-8 text-gray-400 group-hover:text-white" />
                                    </div>
                                </div>
                                <button className="w-full py-5 bg-gray-900 text-white text-xl font-black rounded-2xl shadow-xl shadow-gray-900/20">Directorio</button>
                            </motion.div>
                        </div>
                    </motion.div>
                );
        }
    }
    
    return (
        <>
            {/* The currentUser prop here is a dummy for display as the actual current user comes from localStorage in App.tsx */}
            <OrderDetailsPanel 
                order={selectedOrder} 
                currentUser={{ id: 'admin-proveemus', email: 'admin@proveemus.com', role: UserRole.ADMIN, schoolName: 'Admin Proveemus', address: 'Calle Ficticia 123', cuit: 'XX-XXXXXXXX-X', taxStatus: 'Responsable Inscripto' }}
                onClose={() => setSelectedOrder(null)}
                onUpdateOrder={fetchOrdersAndClients} // This will re-fetch dummy data
            />
            <AnimatePresence mode="wait">
                {renderContent()}
            </AnimatePresence>
        </>
    );
}

export default AdminDashboard;