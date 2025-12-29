
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Order, UserRole } from '../types';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface QuoteRequestViewProps {
  orderId: string;
  onBack: () => void;
}

export const QuoteRequestView: React.FC<QuoteRequestViewProps> = ({ orderId, onBack }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { addNotification } = useNotifications();
  const [products, setProducts] = useState<any[]>([]);
  const [supplierPaymentTerm, setSupplierPaymentTerm] = useState('Contado');
  const [deliveryDays, setDeliveryDays] = useState(5);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: orderData } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', orderId)
            .single();

        if (orderData) {
            setOrder({ ...orderData, items: orderData.order_items });
            
            const { data: quoteData } = await supabase
                .from('supplier_quotes')
                .select('*')
                .eq('order_id', orderId)
                .eq('supplier_id', session.user.id)
                .single();
            
            if (quoteData) {
                setIsEditing(true);
                setProducts(quoteData.products);
                setSupplierPaymentTerm(quoteData.terms.paymentTerm);
                setDeliveryDays(quoteData.terms.deliveryDays);
            } else {
                setProducts(orderData.order_items.map((i: any) => ({
                    productId: i.id.toString(),
                    productName: i.product,
                    quantity: i.quantity,
                    price: 0,
                    brandOffered: i.brand || ''
                })));
            }
        }
        setLoading(false);
    };
    loadData();
  }, [orderId]);

  const handleSubmit = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !order) return;

    const quoteData = {
        order_id: orderId,
        supplier_id: session.user.id,
        supplier_name: 'Distribuidora Proveemus',
        products,
        terms: { paymentTerm: supplierPaymentTerm, deliveryDays }
    };

    let error;
    if (isEditing) {
        ({ error } = await supabase.from('supplier_quotes').update(quoteData).eq('order_id', orderId).eq('supplier_id', session.user.id));
    } else {
        ({ error } = await supabase.from('supplier_quotes').insert(quoteData));
    }

    if (!error) {
        showToast("Cotización enviada", "success");
        addNotification("Nueva Cotización", `Un proveedor ha cotizado tu orden #${orderId.slice(-6)}`, "info", UserRole.CLIENT, order.user_id as any);
        onBack();
    }
  };

  if (loading) return <div className="flex justify-center p-24"><SpinnerIcon className="w-10 h-10 text-teal-600" /></div>;
  if (!order) return <div className="p-8">Orden no encontrada</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button onClick={onBack} className="flex items-center text-teal-600 font-black text-sm uppercase tracking-widest"><ArrowLeftIcon className="w-4 h-4 mr-2"/> Volver</button>
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-8">Cotizar Solicitud #{orderId.slice(-6)}</h2>
        <div className="space-y-6">
            {products.map((p, i) => (
                <div key={i} className="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl">
                    <div className="flex-grow">
                        <p className="font-black text-gray-900">{p.productName}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase">Cant: {p.quantity}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <input 
                            type="text" 
                            placeholder="Marca" 
                            value={p.brandOffered} 
                            onChange={(e) => {
                                const up = [...products];
                                up[i].brandOffered = e.target.value;
                                setProducts(up);
                            }}
                            className="w-40 p-2 border border-gray-200 rounded-lg text-sm" 
                        />
                        <input 
                            type="number" 
                            placeholder="Precio" 
                            value={p.price || ''}
                            onChange={(e) => {
                                const up = [...products];
                                up[i].price = parseFloat(e.target.value);
                                setProducts(up);
                            }}
                            className="w-32 p-2 border border-gray-200 rounded-lg text-sm font-bold text-right" 
                        />
                    </div>
                </div>
            ))}
        </div>
        <div className="mt-12 flex justify-end gap-4">
            <button onClick={onBack} className="px-8 py-3 font-black text-gray-400">Cancelar</button>
            <button onClick={handleSubmit} className="px-12 py-3 bg-teal-600 text-white font-black rounded-2xl shadow-xl shadow-teal-600/20">Enviar Cotización</button>
        </div>
      </div>
    </div>
  );
};
