
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Order, OrderStatus, UserRole } from '../types';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface QuoteComparisonViewProps {
  orderId: string;
  onBack: () => void;
}

export const QuoteComparisonView: React.FC<QuoteComparisonViewProps> = ({ orderId, onBack }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdjudicating, setIsAdjudicating] = useState(false);
  const { showToast } = useToast();
  const { addNotification } = useNotifications();

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        const { data: orderData } = await supabase.from('orders').select('*, order_items(*)').eq('id', orderId).single();
        const { data: quotesData } = await supabase.from('supplier_quotes').select('*').eq('order_id', orderId);
        
        if (orderData) setOrder({ ...orderData, items: orderData.order_items });
        if (quotesData) setQuotes(quotesData);
        setLoading(false);
    };
    fetchData();
  }, [orderId]);

  const handleAdjudicate = async () => {
    setIsAdjudicating(true);
    const { error } = await supabase.from('orders').update({ status: OrderStatus.IN_PREPARATION }).eq('id', orderId);
    
    if (!error) {
        showToast("Licitación Adjudicada", "success");
        addNotification("Orden Adjudicada", "Tu solicitud ha sido adjudicada y está en preparación.", "success", UserRole.CLIENT, order?.user_id as any);
        onBack();
    }
    setIsAdjudicating(false);
  };

  if (loading) return <div className="flex justify-center p-24"><SpinnerIcon className="w-10 h-10 text-teal-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
        <button onClick={onBack} className="flex items-center text-teal-600 font-black text-sm uppercase tracking-widest"><ArrowLeftIcon className="w-4 h-4 mr-2"/> Volver</button>
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-50">
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-8">Comparativa de Precios</h2>
            <div className="overflow-x-auto rounded-[2rem] border border-gray-100">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-400">
                        <tr>
                            <th className="px-8 py-6 font-black uppercase text-[10px]">Artículo</th>
                            {quotes.map(q => (
                                <th key={q.id} className="px-8 py-6 font-black uppercase text-[10px] text-center border-l">{q.supplier_name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {order?.items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="px-8 py-6 font-black text-gray-900">{item.product}</td>
                                {quotes.map(q => {
                                    const pq = q.products.find((p: any) => p.productName === item.product);
                                    return (
                                        <td key={q.id} className="px-8 py-6 text-center border-l font-bold text-teal-600">
                                            {pq ? `$${pq.price}` : '--'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-12 flex justify-end">
                <button 
                    onClick={handleAdjudicate}
                    disabled={isAdjudicating || quotes.length === 0}
                    className="px-12 py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl shadow-gray-900/20 disabled:opacity-50"
                >
                    {isAdjudicating ? 'Procesando...' : 'Adjudicar al Mejor Oferente'}
                </button>
            </div>
        </div>
    </div>
  );
};
