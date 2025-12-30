
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order, User, Comment, OrderStatus, UserRole } from '../types';
import { XIcon } from './icons/XIcon';
import { OrderStatusBadge } from './OrderStatusBadge';
import { PackageIcon } from './icons/PackageIcon';
import { UsersIcon } from './icons/UsersIcon';
// import { supabase } from '../lib/supabase'; // Supabase calls commented out

interface OrderDetailsPanelProps {
  order: Order | null;
  currentUser: User;
  onClose: () => void;
  onUpdateOrder: (updatedOrder: Order) => void;
}

export const OrderDetailsPanel: React.FC<OrderDetailsPanelProps> = ({ 
  order, 
  currentUser, 
  onClose,
  onUpdateOrder
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'chat'>('details');
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [localOrder, setLocalOrder] = useState<Order | null>(order);

  useEffect(() => {
    setLocalOrder(order);
  }, [order]);

  // Scroll to bottom of chat when messages change or tab opens
  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localOrder?.comments, activeTab]);

  if (!localOrder) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      userId: currentUser.id, // currentUser.id is string
      userName: currentUser.schoolName, // Using schoolName as display name
      text: newMessage,
      timestamp: new Date().toISOString(),
      isAdmin: currentUser.role === UserRole.ADMIN,
    };

    const updatedOrder = {
      ...localOrder,
      comments: [...(localOrder.comments || []), newComment]
    };
    
    // Optimistic update locally
    setLocalOrder(updatedOrder);
    setNewMessage('');

    // Supabase Call commented out:
    // This would typically involve an update to Supabase
    // await supabase.from('orders').update({ comments: updatedOrder.comments }).eq('id', updatedOrder.id);
    // onUpdateOrder(updatedOrder); // Propagate update if needed for parent component
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {localOrder && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-[60]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Solicitud #{localOrder.id.toString().slice(-6)}</h2>
                <p className="text-xs text-gray-500">{localOrder.schoolName}</p>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === 'details' 
                    ? 'border-teal-600 text-teal-700 bg-teal-50/50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Detalles e Ítems
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-2 ${
                  activeTab === 'chat' 
                    ? 'border-teal-600 text-teal-700 bg-teal-50/50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Actividad y Mensajes
                {(localOrder.comments?.length || 0) > 0 && (
                  <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-xs font-bold">
                    {localOrder.comments?.length}
                  </span>
                )}
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50">
              {activeTab === 'details' ? (
                <div className="p-6 space-y-6">
                  {/* Status Card */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Estado Actual</span>
                      <span className="text-xs text-gray-400">{formatDate(localOrder.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={localOrder.status} />
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                      <PackageIcon className="w-4 h-4 text-gray-500" />
                      <h3 className="text-sm font-semibold text-gray-700">Artículos Solicitados ({localOrder.items.length})</h3>
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {localOrder.items.map((item, idx) => (
                        <li key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{item.product}</p>
                              {item.brand && (
                                <p className="text-xs text-gray-500 mt-0.5">Marca pref: <span className="text-teal-600">{item.brand}</span></p>
                              )}
                            </div>
                            <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-sm font-bold">
                              x{item.quantity}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Info Card */}
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                    <p className="font-semibold mb-1">Nota del Sistema:</p>
                    <p>Los tiempos de entrega pueden variar según la disponibilidad de los proveedores asignados.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  {/* Messages List */}
                  <div className="flex-1 p-4 space-y-4">
                    {(!localOrder.comments || localOrder.comments.length === 0) ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                         <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                           <UsersIcon className="w-8 h-8" />
                         </div>
                         <p className="text-sm">No hay mensajes aún.</p>
                         <p className="text-xs">Inicia la conversación sobre este pedido.</p>
                      </div>
                    ) : (
                      localOrder.comments.map((msg) => {
                        const isMe = msg.userId === currentUser.id; // msg.userId and currentUser.id are string
                        return (
                          <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                             <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                <span className="text-xs font-bold text-gray-700">{msg.userName}</span>
                                <span className="text-[10px] text-gray-400">{formatDate(msg.timestamp).split(',')[1]}</span>
                             </div>
                             <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                               isMe 
                                ? 'bg-teal-600 text-white rounded-tr-none' 
                                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                             }`}>
                               {msg.text}
                             </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 bg-white border-t border-gray-200">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje o consulta..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Enviar
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};