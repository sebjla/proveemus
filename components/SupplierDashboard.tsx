
import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
// import { supabase } from '../lib/supabase'; // Supabase calls commented out
import { PackageIcon } from './icons/PackageIcon';
import { TruckIcon } from './icons/TruckIcon';
import { ClockIcon } from './icons/ClockIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { Order, OrderStatus, User } from '../types';

interface SupplierDashboardProps {
    user: User;
    onNavigate: (view: string) => void;
}

interface QuoteHistoryItem {
    orderId: string;
    schoolName: string;
    totalAmount: number;
    status: 'WON' | 'LOST' | 'PENDING' | 'EXPIRED';
    date: string;
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

export const SupplierDashboard: React.FC<SupplierDashboardProps> = ({ user, onNavigate }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [history, setHistory] = useState<QuoteHistoryItem[]>([]
);
    const [stats, setStats] = useState({
        opportunities: 0,
        pendingReview: 0,
        toDispatch: 0,
        conversionRate: '0%'
    });

    useEffect(() => {
        const fetchSupplierData = async () => {
            setIsLoading(true);
            
            // Supabase Calls commented out:
            // 1. Fetch opportunities (orders in IN_REVIEW)
            // const { count: opportunitiesCount } = await supabase
            //     .from('orders')
            //     .select('*', { count: 'exact', head: true })
            //     .eq('status', OrderStatus.IN_REVIEW);

            // 2. Fetch logistics (orders in IN_PREPARATION where this supplier has a quote)
            // Simplified for demo: fetching all in preparation. 
            // In real app, we would join with chosen_supplier_id.
            // const { count: dispatchCount } = await supabase
            //     .from('orders')
            //     .select('*', { count: 'exact', head: true })
            //     .eq('status', OrderStatus.IN_PREPARATION);

            // 3. Fetch Bidding History
            // const { data: quotesData, error: quotesError } = await supabase
            //     .from('supplier_quotes')
            //     .select(`
            //         *,
            //         orders (id, school_name, status, created_at)
            //     `)
            //     .eq('supplier_id', user.id) // user.id is string
            //     .order('created_at', { ascending: false });

            // if (!quotesError && quotesData) {
            //     const historyItems: QuoteHistoryItem[] = quotesData.map((q: any) => {
            //         const order = q.orders;
            //         const total = q.products.reduce((acc: number, p: any) => acc + (p.price * p.quantity), 0);
                    
            //         let status: QuoteHistoryItem['status'] = 'PENDING';
            //         if (order.status === OrderStatus.IN_REVIEW) status = 'PENDING';
            //         else if ([OrderStatus.IN_PREPARATION, OrderStatus.ON_ITS_WAY, OrderStatus.DELIVERED].includes(order.status)) {
            //             // In this demo logic, if the order progressed and you have a quote, we show it as Won.
            //             // Ideally, we compare with a winner_id.
            //             status = 'WON';
            //         } else if (order.status === OrderStatus.REJECTED) status = 'EXPIRED';
            //         else status = 'LOST';

            //         return {
            //             orderId: order.id.toString(),
            //             schoolName: order.school_name,
            //             totalAmount: total,
            //             status,
            //             date: q.created_at || order.created_at
            //         };
            //     });
                
            //     setHistory(historyItems);

            //     const wonCount = historyItems.filter(h => h.status === 'WON').length;
            //     const pendingCount = historyItems.filter(h => h.status === 'PENDING').length;
            //     const conversion = historyItems.length > 0 
            //         ? Math.round((wonCount / historyItems.length) * 100) 
            //         : 0;

            //     setStats({
            //         opportunities: opportunitiesCount || 0,
            //         pendingReview: pendingCount,
            //         toDispatch: dispatchCount || 0,
            //         conversionRate: `${conversion}%`
            //     });
            // }
            
            // Simulating no data for now without backend
            setHistory([]);
            setStats({
                opportunities: 0,
                pendingReview: 0,
                toDispatch: 0,
                conversionRate: '0%'
            });

            setIsLoading(false);
        };

        fetchSupplierData();
    }, [user.id]);

    const getStatusStyle = (status: QuoteHistoryItem['status']) => {
        switch (status) {
            case 'WON': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'LOST': return 'bg-red-100 text-red-700 border-red-200';
            case 'EXPIRED': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    const getStatusLabel = (status: QuoteHistoryItem['status']) => {
        switch (status) {
            case 'WON': return 'GANADA';
            case 'LOST': return 'PERDIDA';
            case 'EXPIRED': return 'VENCIDA';
            default: return 'EN EVALUACIÓN';
        }
    };

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
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Panel de Proveedor</h2>
                    <p className="text-gray-500 mt-1 font-medium">Resumen de tu actividad comercial y logística.</p>
                </div>
                <div className="bg-teal-50 px-5 py-2.5 rounded-2xl border border-teal-100 flex items-center text-teal-800 text-sm font-black shadow-sm">
                    <TrendingUpIcon className="w-4 h-4 mr-2" />
                    ÉXITO EN LICITACIONES: {stats.conversionRate}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <motion.div 
                    variants={itemVariants} 
                    onClick={() => onNavigate('QUOTES')}
                    className="bg-white rounded-[2rem] shadow-xl p-8 border-l-8 border-blue-500 cursor-pointer hover:shadow-2xl transition-all group"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <ClipboardListIcon className="h-7 w-7"/>
                        </div>
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all">
                            EXPLORAR
                        </span>
                    </div>
                    <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Oportunidades Abiertas</p>
                    <p className="text-4xl font-black text-gray-900">{stats.opportunities}</p>
                </motion.div>

                <motion.div 
                    variants={itemVariants} 
                    className="bg-white rounded-[2rem] shadow-xl p-8 border-l-8 border-amber-500"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                            <ClockIcon className="h-7 w-7"/>
                        </div>
                    </div>
                    <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Cotizaciones en Curso</p>
                    <p className="text-4xl font-black text-gray-900">{stats.pendingReview}</p>
                </motion.div>

                <motion.div 
                    variants={itemVariants} 
                    onClick={() => onNavigate('SHIPMENTS')}
                    className="bg-white rounded-[2rem] shadow-xl p-8 border-l-8 border-emerald-500 cursor-pointer hover:shadow-2xl transition-all group"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <TruckIcon className="h-7 w-7"/>
                        </div>
                         {stats.toDispatch > 0 && (
                             <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full animate-pulse">
                                ACCIÓN REQUERIDA
                            </span>
                         )}
                    </div>
                    <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Órdenes Ganadas</p>
                    <p className="text-4xl font-black text-gray-900">{stats.toDispatch}</p>
                </motion.div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left side: Bidding History */}
                <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <h3 className="text-xl font-black text-gray-900 tracking-tighter">Historial de Licitaciones</h3>
                        <button onClick={() => onNavigate('QUOTES')} className="text-xs font-black text-teal-600 hover:underline uppercase tracking-widest">Ver Todo</button>
                    </div>
                    {isLoading ? (
                        <div className="p-20 flex justify-center"><SpinnerIcon className="w-10 h-10 text-teal-600" /></div>
                    ) : history.length === 0 ? (
                        <div className="p-20 text-center text-gray-400">
                             <ClipboardListIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                             <p className="font-bold">No has enviado cotizaciones todavía.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-400 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-4 font-black uppercase text-[10px] tracking-widest">Orden</th>
                                        <th className="px-8 py-4 font-black uppercase text-[10px] tracking-widest">Institución</th>
                                        <th className="px-8 py-4 font-black uppercase text-[10px] tracking-widest text-right">Monto</th>
                                        <th className="px-8 py-4 font-black uppercase text-[10px] tracking-widest text-right">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {history.slice(0, 6).map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-5 font-black text-gray-900">#{item.orderId.slice(-6)}</td>
                                            <td className="px-8 py-5 font-bold text-gray-600">{item.schoolName}</td>
                                            <td className="px-8 py-5 text-right font-black text-teal-700">${item.totalAmount.toLocaleString()}</td>
                                            <td className="px-8 py-5 text-right">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusStyle(item.status)}`}>
                                                    {getStatusLabel(item.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>

                {/* Right side: Actions & Notifications */}
                <div className="space-y-6">
                    <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8">
                        <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tighter">Acciones Rápidas</h3>
                        <div className="space-y-4">
                            <button 
                                onClick={() => onNavigate('QUOTES')}
                                className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-teal-50 hover:border-teal-200 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-50 p-3 rounded-xl group-hover:bg-white shadow-sm transition-colors">
                                        <ClipboardListIcon className="w-5 h-5 text-gray-500 group-hover:text-teal-600"/>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-gray-800 text-sm tracking-tight">Buscar Licitaciones</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Nuevas Oportunidades</p>
                                    </div>
                                </div>
                                <span className="text-gray-300 group-hover:text-teal-600 transition-transform group-hover:translate-x-1">→</span>
                            </button>
                            
                            <button 
                                onClick={() => onNavigate('SHIPMENTS')}
                                className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-teal-50 hover:border-teal-200 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-50 p-3 rounded-xl group-hover:bg-white shadow-sm transition-colors">
                                        <TruckIcon className="w-5 h-5 text-gray-500 group-hover:text-teal-600"/>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-gray-800 text-sm tracking-tight">Gestión Logística</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Preparar Envíos</p>
                                    </div>
                                </div>
                                <span className="text-gray-300 group-hover:text-teal-600 transition-transform group-hover:translate-x-1">→</span>
                            </button>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-gray-900 rounded-[2.5rem] shadow-xl p-8 text-white">
                         <div className="flex items-center gap-3 mb-6">
                            <TrendingUpIcon className="w-6 h-6 text-teal-400" />
                            <h3 className="text-xl font-black tracking-tighter">Proyección Comercial</h3>
                         </div>
                         <p className="text-sm text-gray-400 leading-relaxed mb-6 font-medium">
                            Has ganado <span className="text-white font-black">{stats.toDispatch}</span> órdenes este mes. Mantén tus precios competitivos para aumentar tu tasa de conversión.
                         </p>
                         <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: stats.conversionRate }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-teal-500"
                            />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-3 text-teal-400">Eficiencia Actual: {stats.conversionRate}</p>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};