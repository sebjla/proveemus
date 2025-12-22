
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order, OrderStatus, User, UserRole } from '../types';
import { TruckIcon } from './icons/TruckIcon';
import { PackageIcon } from './icons/PackageIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { OrderStatusBadge } from './OrderStatusBadge';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { XIcon } from './icons/XIcon';
import { OrderDetailsPanel } from './OrderDetailsPanel';

interface SupplierShipmentsProps {
    onBack: () => void;
}

export const SupplierShipments: React.FC<SupplierShipmentsProps> = ({ onBack }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<Order | null>(null); // For dispatch modal
    const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null); // For side panel
    const [dispatchForm, setDispatchForm] = useState({ driverName: '', vehiclePlate: '' });
    
    const { showToast } = useToast();
    const { addNotification } = useNotifications();

    // Mock Supplier User for the Chat Panel
    const supplierUser: User = {
        id: 3,
        email: 'proveedor',
        role: UserRole.SUPPLIER,
        schoolName: 'Distribuidora Escolar',
        address: '',
        cuit: '',
        taxStatus: ''
    };

    // Fetch orders relevant to logistics (In Preparation or On Its Way)
    useEffect(() => {
        const fetchLogistics = async () => {
            setIsLoading(true);
            await new Promise(res => setTimeout(res, 500)); // Sim delay
            
            const allOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
            // In a real app, filter by Supplier ID. Here we assume all IN_PREPARATION are for this supplier.
            const logisticsOrders = allOrders.filter(o => 
                o.status === OrderStatus.IN_PREPARATION || 
                o.status === OrderStatus.ON_ITS_WAY
            ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            setOrders(logisticsOrders);
            setIsLoading(false);
        };
        fetchLogistics();
    }, []);

    const handleOpenDispatch = (order: Order, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening details panel
        setSelectedOrderForDispatch(order);
        setDispatchForm({ driverName: '', vehiclePlate: '' });
    };

    const handleConfirmDispatch = () => {
        if (!selectedOrderForDispatch) return;

        const updatedOrder: Order = {
            ...selectedOrderForDispatch,
            status: OrderStatus.ON_ITS_WAY,
            dispatchDetails: {
                driverName: dispatchForm.driverName,
                vehiclePlate: dispatchForm.vehiclePlate,
                dispatchedAt: new Date().toISOString(),
                trackingNumber: `TRK-${Math.floor(Math.random() * 100000)}`
            }
        };

        // Update persistence
        const allOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
        const newAllOrders = allOrders.map(o => o.id === selectedOrderForDispatch.id ? updatedOrder : o);
        localStorage.setItem('orders', JSON.stringify(newAllOrders));

        // Update local state
        setOrders(prev => prev.map(o => o.id === selectedOrderForDispatch.id ? updatedOrder : o));

        // Notifications
        showToast("Pedido despachado correctamente", "success");
        addNotification(
            "Envío en Camino", 
            `Has despachado el pedido #${selectedOrderForDispatch.id} con ${dispatchForm.driverName}`, 
            "success"
        );

        setSelectedOrderForDispatch(null);
    };

    const handleUpdateOrder = (updatedOrder: Order) => {
        // Handle chat updates from the panel
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        setSelectedOrderForDetails(updatedOrder);

        const allOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
        const newAllOrders = allOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
        localStorage.setItem('orders', JSON.stringify(newAllOrders));
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="space-y-6 relative">
            <OrderDetailsPanel 
                order={selectedOrderForDetails}
                currentUser={supplierUser}
                onClose={() => setSelectedOrderForDetails(null)}
                onUpdateOrder={handleUpdateOrder}
            />

            {/* Dispatch Modal */}
            <AnimatePresence>
                {selectedOrderForDispatch && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
                            onClick={() => setSelectedOrderForDispatch(null)}
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden z-[80]"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-900">Despachar Pedido #{selectedOrderForDispatch.id.toString().slice(-6)}</h3>
                                <button onClick={() => setSelectedOrderForDispatch(null)} className="text-gray-400 hover:text-gray-600">
                                    <XIcon className="w-5 h-5"/>
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-sm text-gray-600">Ingresa los datos del transporte para notificar al colegio <strong>{selectedOrderForDispatch.schoolName}</strong>.</p>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Chofer / Empresa</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 placeholder-gray-400"
                                        placeholder="Ej: Juan Pérez / Andreani"
                                        value={dispatchForm.driverName}
                                        onChange={e => setDispatchForm({...dispatchForm, driverName: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Patente / ID Rastreo</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 placeholder-gray-400"
                                        placeholder="Ej: AB 123 CD"
                                        value={dispatchForm.vehiclePlate}
                                        onChange={e => setDispatchForm({...dispatchForm, vehiclePlate: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <button 
                                    onClick={() => setSelectedOrderForDispatch(null)}
                                    className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleConfirmDispatch}
                                    disabled={!dispatchForm.driverName || !dispatchForm.vehiclePlate}
                                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center"
                                >
                                    <TruckIcon className="w-4 h-4 mr-2" />
                                    Confirmar Despacho
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Gestión de Envíos</h2>
                    <p className="text-gray-500 mt-1">Administra la logística de tus pedidos ganados.</p>
                </div>
            </div>

            {/* Logistics Status Board */}
            <div className="grid md:grid-cols-2 gap-8">
                
                {/* Column: To Dispatch */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800 flex items-center">
                            <PackageIcon className="w-5 h-5 mr-2 text-amber-500"/>
                            A Preparar / Despachar
                        </h3>
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                            {orders.filter(o => o.status === OrderStatus.IN_PREPARATION).length}
                        </span>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] p-1">
                        {isLoading ? <SpinnerIcon className="w-6 h-6 mx-auto text-gray-400 mt-10"/> :
                         orders.filter(o => o.status === OrderStatus.IN_PREPARATION).length === 0 ? 
                            <p className="text-center text-gray-400 text-sm mt-10">No tienes pedidos pendientes de despacho.</p>
                         : orders.filter(o => o.status === OrderStatus.IN_PREPARATION).map(order => (
                             <motion.div 
                                key={order.id} 
                                variants={itemVariants}
                                initial="hidden" animate="visible"
                                onClick={() => setSelectedOrderForDetails(order)}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-amber-50/30 cursor-pointer"
                             >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-gray-800">#{order.id.toString().slice(-6)}</span>
                                    <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900 mb-1">{order.schoolName}</p>
                                <div className="flex items-center text-xs text-gray-500 mb-4">
                                    <PackageIcon className="w-3 h-3 mr-1"/>
                                    {order.items.length} bultos/ítems - <span className="text-teal-600 ml-1 font-semibold">Ver listado</span>
                                </div>
                                <button 
                                    onClick={(e) => handleOpenDispatch(order, e)}
                                    className="w-full py-2 bg-indigo-600 text-white text-sm font-bold rounded hover:bg-indigo-700 transition-colors flex justify-center items-center"
                                >
                                    <TruckIcon className="w-4 h-4 mr-2"/>
                                    Despachar Ahora
                                </button>
                             </motion.div>
                         ))}
                    </div>
                </div>

                {/* Column: On Its Way */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
                     <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800 flex items-center">
                            <TruckIcon className="w-5 h-5 mr-2 text-indigo-500"/>
                            En Tránsito
                        </h3>
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full">
                            {orders.filter(o => o.status === OrderStatus.ON_ITS_WAY).length}
                        </span>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] p-1">
                        {isLoading ? <SpinnerIcon className="w-6 h-6 mx-auto text-gray-400 mt-10"/> :
                         orders.filter(o => o.status === OrderStatus.ON_ITS_WAY).length === 0 ? 
                            <p className="text-center text-gray-400 text-sm mt-10">No hay envíos en curso.</p>
                         : orders.filter(o => o.status === OrderStatus.ON_ITS_WAY).map(order => (
                             <motion.div 
                                key={order.id} 
                                variants={itemVariants}
                                initial="hidden" animate="visible"
                                onClick={() => setSelectedOrderForDetails(order)}
                                className="border border-gray-200 rounded-lg p-4 bg-white cursor-pointer hover:shadow-sm"
                             >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-gray-800">#{order.id.toString().slice(-6)}</span>
                                    <OrderStatusBadge status={order.status} />
                                </div>
                                <p className="text-sm font-medium text-gray-900 mb-3">{order.schoolName}</p>
                                
                                <div className="bg-gray-50 p-2 rounded text-xs space-y-1 mb-2 border border-gray-100">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Chofer:</span>
                                        <span className="font-medium text-gray-800">{order.dispatchDetails?.driverName || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Patente/ID:</span>
                                        <span className="font-medium text-gray-800">{order.dispatchDetails?.vehiclePlate || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Salida:</span>
                                        <span className="font-medium text-gray-800">
                                            {order.dispatchDetails?.dispatchedAt ? new Date(order.dispatchDetails.dispatchedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                             </motion.div>
                         ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
