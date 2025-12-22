
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Order, User, OrderItem } from '../types';
import { OrderStatus, UserRole } from '../types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { PackageIcon } from './icons/PackageIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { NewOrderForm } from './NewOrderForm';
import { PlusIcon } from './icons/PlusIcon';
import { UsersIcon } from './icons/UsersIcon';
import { EllipsisVerticalIcon } from './icons/EllipsisVerticalIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ClockIcon } from './icons/ClockIcon';
import { TruckIcon } from './icons/TruckIcon';
import { ConfirmationModal } from './ConfirmationModal';
import { useNotifications } from '../context/NotificationContext';
import { useToast } from '../context/ToastContext';
import { OrderDetailsPanel } from './OrderDetailsPanel';
import { FilterIcon } from './icons/FilterIcon';
import { CheckIcon } from './icons/CheckIcon';

interface AdminDashboardProps {
  activeView?: string;
  onNavigate?: (view: string, orderId?: string) => void;
}

// Icon helper locally if needed, or import
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const getAllOrders = async (): Promise<Order[]> => {
    const allOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
    return allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const updateOrderStatus = async (orderId: number, status: OrderStatus): Promise<Order> => {
    let allOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
    let updatedOrder: Order | undefined;
    allOrders = allOrders.map(order => {
        if (order.id === orderId) {
            updatedOrder = { ...order, status };
            return updatedOrder;
        }
        return order;
    });
    localStorage.setItem('orders', JSON.stringify(allOrders));
    if (!updatedOrder) throw new Error("Order not found");
    return updatedOrder;
};

const getAllClients = async (): Promise<User[]> => {
    const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    return allUsers.filter(user => user.role === UserRole.CLIENT);
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
        // Admin creations might default to Pending Approval or In Review. Let's stick to Pending for consistency.
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
    
    // Tab State for OPERATIONS view: 'pending', 'bidding', 'logistics', 'history'
    const [activeOpsTab, setActiveOpsTab] = useState<'pending' | 'bidding' | 'logistics' | 'history'>('pending');
    
    // Filter State
    const [clientFilter, setClientFilter] = useState<string>('ALL'); // Filter by Client ID

    const [actionsMenuOpen, setActionsMenuOpen] = useState<number | null>(null);
    const actionsMenuRef = useRef<HTMLDivElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clients, setClients] = useState<User[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Modal State
    const [orderToCancel, setOrderToCancel] = useState<number | null>(null);
    const { addNotification } = useNotifications();
    const { showToast } = useToast();

    // Mock User for Admin
    const adminUser: User = {
        id: 1,
        email: 'admin',
        role: UserRole.ADMIN,
        schoolName: 'Administrador',
        address: '',
        cuit: '',
        taxStatus: ''
    };

    const fetchOrdersAndClients = useCallback(async () => {
        setIsLoading(true);
        await new Promise(res => setTimeout(res, 300));
        const allOrders = await getAllOrders();
        setOrders(allOrders);
        const clientList = await getAllClients();
        setClients(clientList);
        if (clientList.length > 0 && !selectedClientId) {
            setSelectedClientId(clientList[0].id.toString());
        }
        setIsLoading(false);
    }, [selectedClientId]);

    useEffect(() => {
        fetchOrdersAndClients();
    }, [fetchOrdersAndClients]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
                setActionsMenuOpen(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [actionsMenuRef]);
    
    const stats = useMemo(() => {
        const total = orders.length;
        const pending = orders.filter(o => o.status === OrderStatus.PENDING_APPROVAL).length;
        const inReview = orders.filter(o => o.status === OrderStatus.IN_REVIEW).length;
        const completed = orders.filter(o => o.status === OrderStatus.DELIVERED).length;
        return { total, pending, inReview, completed };
    }, [orders]);
    
    const handleUpdateStatus = async (orderId: number, status: OrderStatus) => {
        try {
            await updateOrderStatus(orderId, status);
            setActionsMenuOpen(null);
            await fetchOrdersAndClients(); 
            addNotification("Estado Actualizado", `El pedido ${orderId} ahora está: ${status}`, "info");
            showToast(`Solicitud actualizada a ${status}`, "success");
        } catch (error) {
            console.error(error);
            showToast("Error al actualizar la solicitud", "error");
        }
    };

    const confirmCancellation = async () => {
        if (orderToCancel) {
            await handleUpdateStatus(orderToCancel, OrderStatus.REJECTED);
            setOrderToCancel(null);
            showToast("Solicitud cancelada correctamente.", "error");
        }
    };
    
    const handleOrderSubmit = async (items: Omit<OrderItem, 'id'>[], details: { expirationDate: string; requestedDeliveryDate: string; termsAndConditions: string; }) => {
        const selectedClient = clients.find(c => c.id === Number(selectedClientId));
        if (!selectedClient) {
            alert("Por favor, selecciona un cliente.");
            return;
        }
        setIsSubmitting(true);
        await createNewOrder(selectedClient.id, selectedClient.schoolName, items, details);
        await fetchOrdersAndClients(); 
        setIsSubmitting(false);
        addNotification("Solicitud Creada", `Nueva solicitud creada para ${selectedClient.schoolName}`, "success");
        if (onNavigate) onNavigate('OPERATIONS');
    };

    const handleCompareQuotes = (orderId: number) => {
        // FIX: Pass the real orderId string instead of hardcoded REQ ID
        if (onNavigate) onNavigate('QUOTE_COMPARISON', orderId.toString()); 
        setActionsMenuOpen(null);
    }

    const handleUpdateOrder = (updatedOrder: Order) => {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        setSelectedOrder(updatedOrder);
        const allOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
        const newAllOrders = allOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
        localStorage.setItem('orders', JSON.stringify(newAllOrders));
    };

    // --- LOGIC FOR UNIFIED OPERATIONS VIEW ---
    const getFilteredOrdersForTab = () => {
        return orders.filter(order => {
            // 1. Client Filter
            if (clientFilter !== 'ALL' && order.userId !== Number(clientFilter)) {
                return false;
            }

            // 2. Tab Stage Filter
            if (activeOpsTab === 'pending') {
                return order.status === OrderStatus.PENDING_APPROVAL;
            } else if (activeOpsTab === 'bidding') {
                return order.status === OrderStatus.IN_REVIEW;
            } else if (activeOpsTab === 'logistics') {
                return order.status === OrderStatus.IN_PREPARATION || order.status === OrderStatus.ON_ITS_WAY;
            } else if (activeOpsTab === 'history') {
                return order.status === OrderStatus.DELIVERED || order.status === OrderStatus.REJECTED;
            }
            return false;
        });
    };

    const opsOrders = getFilteredOrdersForTab();

    const renderContent = () => {
        switch (activeView) {
            case 'NEW_ORDER':
                return (
                    <motion.div key="newOrder" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Nueva Solicitud de Cotización</h2>
                        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200 mb-6">
                            <label htmlFor="client-select" className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Cliente/Empresa</label>
                            <select
                                id="client-select"
                                value={selectedClientId}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5"
                                disabled={clients.length === 0}
                            >
                                {clients.length > 0 ? clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.schoolName} ({client.email})</option>
                                )) : (
                                    <option>No hay clientes disponibles</option>
                                )}
                            </select>
                        </div>
                        <NewOrderForm onSubmit={handleOrderSubmit} isSubmitting={isSubmitting} />
                    </motion.div>
                );

            case 'OPERATIONS':
                return (
                    <motion.div key="operations" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Gestión de Operaciones</h2>
                                <p className="text-gray-500 mt-2">
                                    Control unificado de solicitudes, licitaciones y envíos.
                                </p>
                            </div>
                             {/* Global Filter for the View */}
                             <div className="w-full md:w-64">
                                <div className="relative">
                                    <UsersIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <select
                                        value={clientFilter}
                                        onChange={(e) => setClientFilter(e.target.value)}
                                        className="w-full pl-9 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 shadow-sm"
                                    >
                                        <option value="ALL">Todas las Organizaciones</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id.toString()}>{client.schoolName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* TABS */}
                        <div className="flex flex-wrap border-b border-gray-200 mb-6 bg-white rounded-t-lg px-2">
                             <button
                                onClick={() => setActiveOpsTab('pending')}
                                className={`flex items-center px-4 md:px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeOpsTab === 'pending' ? 'border-amber-500 text-amber-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <ClockIcon className="w-4 h-4 mr-2" />
                                Pendientes ({orders.filter(o => o.status === OrderStatus.PENDING_APPROVAL).length})
                            </button>
                            <button
                                onClick={() => setActiveOpsTab('bidding')}
                                className={`flex items-center px-4 md:px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeOpsTab === 'bidding' ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <ChartBarIcon className="w-4 h-4 mr-2" />
                                Licitación ({orders.filter(o => o.status === OrderStatus.IN_REVIEW).length})
                            </button>
                            <button
                                onClick={() => setActiveOpsTab('logistics')}
                                className={`flex items-center px-4 md:px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeOpsTab === 'logistics' ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <TruckIcon className="w-4 h-4 mr-2" />
                                Logística ({orders.filter(o => o.status === OrderStatus.IN_PREPARATION || o.status === OrderStatus.ON_ITS_WAY).length})
                            </button>
                            <button
                                onClick={() => setActiveOpsTab('history')}
                                className={`flex items-center px-4 md:px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeOpsTab === 'history' ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <ClipboardListIcon className="w-4 h-4 mr-2" />
                                Historial
                            </button>
                        </div>

                        {/* TABLE */}
                        <div className="bg-white rounded-b-xl rounded-tr-xl shadow-md border border-gray-200 border-t-0 overflow-hidden min-h-[400px]">
                             {isLoading ? ( <div className="flex justify-center items-center p-12"> <SpinnerIcon className="w-8 h-8 text-teal-600" /> </div>
                                ) : opsOrders.length === 0 ? ( 
                                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                        <PackageIcon className="w-12 h-12 mb-3 text-gray-300" />
                                        <p>No hay operaciones en esta etapa para el filtro seleccionado.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left text-gray-500">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th scope="col" className="px-6 py-4">Solicitud</th>
                                                    <th scope="col" className="px-6 py-4">Organización</th>
                                                    <th scope="col" className="px-6 py-4">Fecha</th>
                                                    <th scope="col" className="px-6 py-4">Estado</th>
                                                    <th scope="col" className="px-6 py-4">Detalle</th>
                                                    <th scope="col" className="px-6 py-4 text-right">Acción Requerida</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {opsOrders.map(order => (
                                                    <tr key={order.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-gray-900">#{order.id.toString().slice(-6)}</td>
                                                        <td className="px-6 py-4">{order.schoolName}</td>
                                                        <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                                                        <td className="px-6 py-4">
                                                            <button onClick={() => setSelectedOrder(order)} className="text-teal-600 hover:text-teal-800 font-medium underline">
                                                                Ver {order.items.length} ítems
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {/* Action Buttons based on Active Tab */}
                                                            {activeOpsTab === 'pending' && (
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(order.id, OrderStatus.IN_REVIEW)}
                                                                    className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm"
                                                                    title="Hacer visible para proveedores"
                                                                >
                                                                    <CheckIcon className="w-3 h-3 mr-2" />
                                                                    Publicar Licitación
                                                                </button>
                                                            )}
                                                            {activeOpsTab === 'bidding' && (
                                                                <div className="flex gap-2 justify-end">
                                                                    <button 
                                                                        onClick={() => handleCompareQuotes(order.id)}
                                                                        className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg shadow-sm"
                                                                        title="Comparar Cotizaciones"
                                                                    >
                                                                        <ChartBarIcon className="w-3 h-3 mr-1" />
                                                                        Comparar
                                                                    </button>
                                                                    {/* This button is technically redundant if comparison view does the job, but good for manual bypass */}
                                                                    <button 
                                                                        onClick={() => handleUpdateStatus(order.id, OrderStatus.IN_PREPARATION)}
                                                                        className="inline-flex items-center px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm"
                                                                        title="Aprobar y pasar a Logística"
                                                                    >
                                                                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                                                                        Adjudicar
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {activeOpsTab === 'logistics' && order.status === OrderStatus.IN_PREPARATION && (
                                                                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">Esperando Despacho</span>
                                                            )}
                                                            {activeOpsTab === 'logistics' && order.status === OrderStatus.ON_ITS_WAY && (
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(order.id, OrderStatus.DELIVERED)}
                                                                    className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
                                                                >
                                                                    <ShieldCheckIcon className="w-3 h-3 mr-2" />
                                                                    Confirmar Recepción
                                                                </button>
                                                            )}
                                                            {activeOpsTab === 'history' && (
                                                                <span className="text-gray-400 italic text-xs">Finalizado</span>
                                                            )}
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
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Directorio de Empresas</h2>
                        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200">
                            {isLoading ? ( <div className="flex justify-center items-center p-8"> <SpinnerIcon className="w-8 h-8 text-teal-600" /> </div>
                            ) : clients.length === 0 ? ( <p className="text-gray-500 text-center py-4">No hay clientes registrados.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-500">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3">Organización / Empresa</th>
                                                <th scope="col" className="px-6 py-3">Email</th>
                                                <th scope="col" className="px-6 py-3">CUIT</th>
                                                <th scope="col" className="px-6 py-3">Dirección</th>
                                            </tr>
                                        </thead>
                                        <motion.tbody variants={containerVariants}>
                                            {clients.map(client => (
                                                <motion.tr key={client.id} variants={itemVariants} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-gray-900">{client.schoolName}</td>
                                                    <td className="px-6 py-4">{client.email}</td>
                                                    <td className="px-6 py-4">{client.cuit}</td>
                                                    <td className="px-6 py-4">{client.address}</td>
                                                </motion.tr>
                                            ))}
                                        </motion.tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            case 'HOME':
            default:
                return (
                    <motion.div key="dashboard" className="space-y-12" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
                         <ConfirmationModal 
                            isOpen={orderToCancel !== null}
                            title="Cancelar Solicitud"
                            message="¿Está seguro de que desea cancelar esta solicitud? Esto notificará a la organización y detendrá cualquier proceso de cotización activo."
                            isDestructive={true}
                            confirmText="Sí, Cancelar Solicitud"
                            onClose={() => setOrderToCancel(null)}
                            onConfirm={confirmCancellation}
                        />

                         <h2 className="text-3xl font-bold text-gray-900 mb-4">Panel de Control</h2>
                        <motion.div className="grid md:grid-cols-4 gap-6" variants={containerVariants}>
                            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500"> <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center mb-4"><PackageIcon className="h-6 w-6 text-white"/></div> <p className="text-gray-600 text-sm">Total Solicitudes</p> <p className="text-3xl font-bold text-gray-900">{stats.total}</p> </motion.div>
                            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-500"> <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mb-4"><ClockIcon className="h-6 w-6 text-white"/></div> <p className="text-gray-600 text-sm">Pendientes Aprobación</p> <p className="text-3xl font-bold text-gray-900">{stats.pending}</p> </motion.div>
                            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500"> <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4"><SpinnerIcon className="h-6 w-6 text-white"/></div> <p className="text-gray-600 text-sm">En Licitación</p> <p className="text-3xl font-bold text-gray-900">{stats.inReview}</p> </motion.div>
                            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500"> <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mb-4"><ShieldCheckIcon className="h-6 w-6 text-white"/></div> <p className="text-gray-600 text-sm">Completadas</p> <p className="text-3xl font-bold text-gray-900">{stats.completed}</p> </motion.div>
                        </motion.div>
                        <motion.div className="grid md:grid-cols-3 gap-6" variants={containerVariants}>
                            <motion.div variants={itemVariants} onClick={() => onNavigate && onNavigate('NEW_ORDER')} whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }} className="bg-white rounded-xl shadow-md p-8 cursor-pointer border border-teal-50 hover:border-teal-100 transition-colors"> <div className="flex items-center justify-between mb-4"> <h2 className="text-2xl font-bold text-gray-900">Crear Solicitud</h2> <PlusIcon className="h-8 w-8 text-teal-600" /> </div> <p className="text-gray-600 mb-6">Iniciar una nueva solicitud de abastecimiento para un cliente.</p> <motion.button whileHover={{scale: 1.02}} whileTap={{scale: 0.98}} className="w-full px-4 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 transition-colors"> Crear </motion.button> </motion.div>
                            <motion.div variants={itemVariants} onClick={() => onNavigate && onNavigate('OPERATIONS')} whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }} className="bg-white rounded-xl shadow-md p-8 cursor-pointer border border-teal-50 hover:border-teal-100 transition-colors"> <div className="flex items-center justify-between mb-4"> <h2 className="text-2xl font-bold text-gray-900">Gestión Operativa</h2> <ChartBarIcon className="h-8 w-8 text-teal-600" /> </div> <p className="text-gray-600 mb-6">Aprobar solicitudes, gestionar licitaciones y logística.</p> <motion.button whileHover={{scale: 1.02}} whileTap={{scale: 0.98}} className="w-full px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 font-semibold rounded-md hover:bg-teal-100 transition-colors"> Gestionar </motion.button> </motion.div>
                            <motion.div variants={itemVariants} onClick={() => onNavigate && onNavigate('USERS')} whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }} className="bg-white rounded-xl shadow-md p-8 cursor-pointer border border-teal-50 hover:border-teal-100 transition-colors"> <div className="flex items-center justify-between mb-4"> <h2 className="text-2xl font-bold text-gray-900">Empresas</h2> <UsersIcon className="h-8 w-8 text-teal-600" /> </div> <p className="text-gray-600 mb-6">Administrar cuentas corporativas.</p> <motion.button whileHover={{scale: 1.02}} whileTap={{scale: 0.98}} className="w-full px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-md border border-gray-300 hover:bg-gray-200 transition-colors"> Directorio </motion.button> </motion.div>
                        </motion.div>
                    </motion.div>
                );
        }
    }
    
    return (
        <>
            <OrderDetailsPanel 
                order={selectedOrder} 
                currentUser={adminUser} 
                onClose={() => setSelectedOrder(null)}
                onUpdateOrder={handleUpdateOrder}
            />
            <AnimatePresence mode="wait">
                {renderContent()}
            </AnimatePresence>
        </>
    );
}

export default AdminDashboard;
