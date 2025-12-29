
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Order, OrderStatus, UserRole } from '../types';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { TruckIcon } from './icons/TruckIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface SupplierShipmentsProps {
  onBack: () => void;
}

export const SupplierShipments: React.FC<SupplierShipmentsProps> = ({ onBack }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<Order | null>(null);
  const [dispatchForm, setDispatchForm] = useState({
    driverName: '',
    vehiclePlate: ''
  });
  
  const { showToast } = useToast();
  const { addNotification } = useNotifications();

  const fetchLogistics = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .in('status', [OrderStatus.IN_PREPARATION, OrderStatus.ON_ITS_WAY]);
    
    if (!error && data) {
        setOrders(data.map(o => ({
            ...o,
            items: o.order_items,
            createdAt: o.created_at,
            schoolName: o.school_name,
            dispatchDetails: o.dispatch_details
        })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogistics();
  }, [fetchLogistics]);

  const handleConfirmDispatch = async () => {
    if (!selectedOrderForDispatch) return;

    const dispatchInfo = {
        driverName: dispatchForm.driverName,
        vehiclePlate: dispatchForm.vehiclePlate,
        dispatchedAt: new Date().toISOString(),
        trackingNumber: `TRK-${Math.floor(Math.random() * 100000)}`
    };

    const { error } = await supabase
        .from('orders')
        .update({ 
            status: OrderStatus.ON_ITS_WAY,
            dispatch_details: dispatchInfo
        })
        .eq('id', selectedOrderForDispatch.id);

    if (!error) {
        showToast("Pedido despachado correctamente", "success");
        addNotification(
            "Pedido en Camino", 
            `Tu pedido #${selectedOrderForDispatch.id.toString().slice(-6)} ha sido despachado y está en viaje.`, 
            "info", 
            UserRole.CLIENT,
            selectedOrderForDispatch.userId as any
        );
        setSelectedOrderForDispatch(null);
        setDispatchForm({ driverName: '', vehiclePlate: '' });
        fetchLogistics();
    } else {
        showToast("Error al despachar el pedido", "error");
    }
  };

  if (loading) return <div className="flex justify-center p-12"><SpinnerIcon className="w-8 h-8 text-teal-600 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center text-teal-600 hover:underline mb-6 font-bold">
        <ArrowLeftIcon className="w-4 h-4 mr-2" /> Volver al Inicio
      </button>

      <div className="flex items-center gap-3 mb-8">
        <TruckIcon className="w-10 h-10 text-teal-600" />
        <h2 className="text-3xl font-bold text-gray-900">Control de Logística y Envíos</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
            Órdenes en Preparación
          </h3>
          <div className="space-y-4">
            {orders.filter(o => o.status === OrderStatus.IN_PREPARATION).map(order => (
              <div key={order.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:border-teal-200 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-black text-xl text-gray-900">#{order.id.toString().slice(-6)}</h4>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-tight">{order.schoolName}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedOrderForDispatch(order)}
                    className="px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-black hover:bg-teal-700 shadow-lg shadow-teal-600/10 transition-all"
                  >
                    Despachar Pedido
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-gray-600">
                  <span className="px-2 py-1 bg-gray-100 rounded">{order.items.length} ARTÍCULOS</span>
                  <span className="text-gray-400">Adjudicado el {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {orders.filter(o => o.status === OrderStatus.IN_PREPARATION).length === 0 && (
              <div className="bg-gray-50 p-8 text-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                No hay envíos pendientes de preparación.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
           <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              En Tránsito (Viaje activo)
           </h3>
           <div className="space-y-4">
            {orders.filter(o => o.status === OrderStatus.ON_ITS_WAY).map(order => (
              <div key={order.id} className="bg-blue-50/50 p-6 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-black text-blue-900">ORDEN #{order.id.toString().slice(-6)}</h4>
                  <span className="text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest animate-pulse">En Tránsito</span>
                </div>
                <p className="text-sm font-bold text-blue-800 mb-4">{order.schoolName}</p>
                <div className="bg-white/80 p-4 rounded-lg text-xs space-y-2 text-blue-900 shadow-inner">
                  <p className="flex justify-between"><strong>Chofer Asignado:</strong> {order.dispatchDetails?.driverName}</p>
                  <p className="flex justify-between"><strong>Matrícula:</strong> {order.dispatchDetails?.vehiclePlate}</p>
                  <p className="flex justify-between border-t border-blue-100 pt-2 font-bold"><strong>Nro. Seguimiento:</strong> {order.dispatchDetails?.trackingNumber}</p>
                </div>
              </div>
            ))}
            {orders.filter(o => o.status === OrderStatus.ON_ITS_WAY).length === 0 && (
              <div className="bg-gray-50 p-8 text-center rounded-xl border border-gray-100 text-gray-400 italic">
                No hay transportes en camino actualmente.
              </div>
            )}
           </div>
        </div>
      </div>

      {selectedOrderForDispatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md overflow-hidden transform transition-all">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Información de Despacho</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">Asigna un chofer y vehículo para la orden #{selectedOrderForDispatch.id.toString().slice(-6)}</p>
            <div className="space-y-5">
              <input 
                type="text" 
                value={dispatchForm.driverName} 
                onChange={(e) => setDispatchForm({...dispatchForm, driverName: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none"
                placeholder="Nombre del Chofer"
              />
              <input 
                type="text" 
                value={dispatchForm.vehiclePlate} 
                onChange={(e) => setDispatchForm({...dispatchForm, vehiclePlate: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none"
                placeholder="Patente del Vehículo"
              />
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={() => setSelectedOrderForDispatch(null)} className="flex-1 py-3 text-gray-500 font-bold">Cerrar</button>
              <button onClick={handleConfirmDispatch} disabled={!dispatchForm.driverName || !dispatchForm.vehiclePlate} className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-black disabled:opacity-50">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
