
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { QuoteDetail, SupplierQuoteResponse, Order, OrderStatus } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { TruckIcon } from './icons/TruckIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { useToast } from '../context/ToastContext';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { PackageIcon } from './icons/PackageIcon';
import { useNotifications } from '../context/NotificationContext';

interface QuoteComparisonViewProps {
    orderId: string;
    onBack: () => void;
}

export const QuoteComparisonView: React.FC<QuoteComparisonViewProps> = ({ orderId, onBack }) => {
    const [orderDetails, setOrderDetails] = useState<QuoteDetail | null>(null);
    const [supplierResponses, setSupplierResponses] = useState<SupplierQuoteResponse[]>([]);
    const [selections, setSelections] = useState<Record<string, number>>({});
    const [bestPriceMode, setBestPriceMode] = useState(false);
    const { showToast } = useToast();
    const { addNotification } = useNotifications();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Load Data
    useEffect(() => {
        // Prevent infinite loop by checking if we already have data for this ID
        if (orderDetails?.id === orderId) return;

        // 1. Get Real Order
        const allOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
        const foundOrder = allOrders.find(o => o.id.toString() === orderId);

        if (foundOrder) {
            // Map Order to View Model
            const detail: QuoteDetail = {
                id: foundOrder.id.toString(),
                title: `Solicitud de Compra #${foundOrder.id.toString().slice(-6)}`,
                clientName: foundOrder.schoolName,
                clientAddress: 'Dirección Registrada',
                requestedPaymentTerm: 'A convenir',
                requestedDeliveryDays: 7,
                creationDate: new Date(foundOrder.createdAt).toLocaleDateString(),
                expirationDate: foundOrder.expirationDate || '',
                termsAndConditions: foundOrder.termsAndConditions || '',
                products: foundOrder.items.map(i => ({
                    id: `${foundOrder.id}-${i.id}`,
                    sku: `GEN-${i.id}`,
                    name: i.product,
                    quantity: i.quantity,
                    targetBrand: i.brand
                }))
            };
            setOrderDetails(detail);

            // 2. LOAD REAL QUOTES FROM LOCAL STORAGE
            const allQuotes = JSON.parse(localStorage.getItem('supplier_quotes') || '[]');
            // Filter quotes that match this order ID
            const matchingQuotes = allQuotes.filter((q: any) => q.orderId === orderId);

            if (matchingQuotes.length > 0) {
                const mappedResponses: SupplierQuoteResponse[] = matchingQuotes.map((q: any) => ({
                    supplierId: q.supplierId,
                    supplierName: q.supplierName,
                    supplierScore: 5.0, // Default score, logic for history could be added here
                    paymentTerms: q.terms.paymentTerm,
                    deliveryDays: q.terms.deliveryDays,
                    totalAmount: 0, // Calculated dynamically
                    items: q.products.map((p: any) => ({
                        productId: p.id,
                        price: p.quotedPrice || 0,
                        brandOffered: p.quotedBrand || '',
                        notes: p.notes
                    }))
                }));
                setSupplierResponses(mappedResponses);

                // 3. Init selections (default to first supplier if available)
                const initialSelections: Record<string, number> = {};
                if (mappedResponses.length > 0) {
                    detail.products.forEach(p => {
                        initialSelections[p.id] = mappedResponses[0].supplierId;
                    });
                }
                setSelections(initialSelections);
            } else {
                setSupplierResponses([]);
            }

        } else {
            setError(`No se encontró la orden con ID: ${orderId}`);
        }
    }, [orderId]);

    // Helper to find the best price for a specific product ID
    const getBestPriceSupplierId = (productId: string) => {
        let minPrice = Infinity;
        let supplierId = -1;
        supplierResponses.forEach(supplier => {
            const item = supplier.items.find(i => i.productId === productId);
            if (item && item.price > 0 && item.price < minPrice) {
                minPrice = item.price;
                supplierId = supplier.supplierId;
            }
        });
        return supplierId === -1 ? (supplierResponses[0]?.supplierId || -1) : supplierId;
    };

    const handleSmartSelect = () => {
        if (!orderDetails || supplierResponses.length === 0) return;
        const newSelections: Record<string, number> = {};
        orderDetails.products.forEach(p => {
            newSelections[p.id] = getBestPriceSupplierId(p.id);
        });
        setSelections(newSelections);
        setBestPriceMode(true);
        showToast("Se han seleccionado automáticamente los mejores precios por ítem.", "info");
    };

    const handleSelectSupplierForItem = (productId: string, supplierId: number) => {
        setSelections(prev => ({
            ...prev,
            [productId]: supplierId
        }));
        setBestPriceMode(false); // Manual override
    };

    const handleGenerateOrders = async () => {
        setIsProcessing(true);
        
        // 1. Identify Winners (For notification purposes later)
        const winningSupplierIds = new Set(Object.values(selections));
        
        // 2. Update Order Status in LocalStorage
        // In a real app, we would split the order if multiple suppliers won. 
        // For this MVP, we upgrade the status of the main order.
        
        const allOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
        const updatedOrders = allOrders.map(o => {
            if (o.id.toString() === orderId) {
                return { 
                    ...o, 
                    status: OrderStatus.IN_PREPARATION,
                    // Optionally store who won which item here
                };
            }
            return o;
        });

        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        
        // Simulate API call
        await new Promise(res => setTimeout(res, 1000));
        
        showToast(`Orden adjudicada a ${winningSupplierIds.size} proveedor(es).`, "success");
        addNotification(
            "Adjudicación Exitosa", 
            `La orden #${orderId.slice(-6)} ha pasado a etapa de preparación logística.`, 
            "success"
        );
        
        setIsProcessing(false);
        onBack();
    };

    // Calculate Totals based on current selections
    const calculatedTotals = useMemo(() => {
        let total = 0;
        const supplierBreakdown: Record<number, number> = {};

        if (orderDetails && supplierResponses.length > 0) {
            orderDetails.products.forEach(p => {
                const selectedSupplierId = selections[p.id];
                if (selectedSupplierId) {
                    const supplier = supplierResponses.find(s => s.supplierId === selectedSupplierId);
                    const item = supplier?.items.find(i => i.productId === p.id);
                    if (item) {
                        const cost = item.price * p.quantity;
                        total += cost;
                        supplierBreakdown[selectedSupplierId] = (supplierBreakdown[selectedSupplierId] || 0) + cost;
                    }
                }
            });
        }
        return { total, supplierBreakdown };
    }, [selections, orderDetails, supplierResponses]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    };

    if (error) {
         return (
             <div className="p-10 flex flex-col items-center justify-center h-full text-center">
                <p className="text-red-500 font-bold mb-4">{error}</p>
                <button onClick={onBack} className="bg-gray-200 px-4 py-2 rounded text-gray-800">Volver</button>
             </div>
         )
    }

    if (!orderDetails) return <div className="p-10 flex justify-center"><SpinnerIcon className="animate-spin w-8 h-8 text-teal-600"/></div>;

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen bg-slate-50 pb-20"
        >
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                                <ArrowLeftIcon className="w-6 h-6" />
                            </button>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                                        Comparativa de Precios
                                    </span>
                                    <span className="text-gray-400 text-sm">|</span>
                                    <span className="text-sm text-gray-600">{orderDetails.clientName}</span>
                                </div>
                                <h1 className="text-xl font-bold text-gray-900">{orderDetails.title}</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                             <div className="text-right hidden md:block">
                                <p className="text-sm text-gray-500">Total Adjudicado</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculatedTotals.total)}</p>
                            </div>
                            <button 
                                onClick={handleGenerateOrders}
                                disabled={supplierResponses.length === 0 || isProcessing}
                                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                            >
                                {isProcessing && <SpinnerIcon className="w-4 h-4 mr-2" />}
                                {isProcessing ? 'Procesando...' : 'Adjudicar y Generar Orden'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Empty State if no quotes */}
                {supplierResponses.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-200">
                        <PackageIcon className="w-16 h-16 text-gray-200 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">Aún no hay cotizaciones</h3>
                        <p className="text-gray-500 text-center max-w-md mt-2">
                            Los proveedores han sido notificados. Cuando envíen sus ofertas, aparecerán aquí automáticamente para que puedas compararlas.
                        </p>
                    </div>
                )}

                {/* Dashboard Summary Panel (Selection Preview) */}
                {supplierResponses.length > 0 && (
                <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                         <h2 className="text-lg font-bold text-gray-800">Resumen de Adjudicación</h2>
                         <button 
                            onClick={handleSmartSelect}
                            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${bestPriceMode 
                                    ? 'bg-purple-100 text-purple-700 border border-purple-200 shadow-inner' 
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm'
                                }`}
                        >
                            <SparklesIcon className="w-4 h-4 mr-2" />
                            Selección Inteligente (Mejor Precio Global)
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         {supplierResponses.map(supplier => {
                             const total = calculatedTotals.supplierBreakdown[supplier.supplierId] || 0;
                             const count = Object.values(selections).filter(id => id === supplier.supplierId).length;
                             const hasItems = count > 0;
                             
                             return (
                                 <div 
                                    key={supplier.supplierId} 
                                    className={`border rounded-lg p-4 transition-all ${hasItems ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}
                                 >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-900 truncate">{supplier.supplierName}</p>
                                            <p className="text-xs text-gray-500">{supplier.paymentTerms}</p>
                                        </div>
                                        {hasItems && <span className="bg-teal-200 text-teal-800 text-xs px-2 py-0.5 rounded-full font-bold">{count} ítems</span>}
                                    </div>
                                    <div className="mt-4 flex justify-between items-end">
                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</p>
                                    </div>
                                 </div>
                             )
                         })}
                    </div>
                </div>
                )}

                {/* Comparison Table */}
                {supplierResponses.length > 0 && (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 uppercase text-xs">
                                {/* Product Column - Sticky */}
                                <th className="px-6 py-4 font-bold border-b border-r border-gray-200 bg-gray-50 sticky left-0 z-20 w-80 min-w-[300px]">
                                    Producto
                                </th>
                                
                                {/* Dynamic Supplier Columns */}
                                {supplierResponses.map(supplier => (
                                    <th key={supplier.supplierId} className="px-4 py-4 border-b border-r border-gray-200 min-w-[280px]">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-gray-900 text-sm truncate max-w-[180px]" title={supplier.supplierName}>{supplier.supplierName}</span>
                                                <div className="flex items-center bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100">
                                                    <span className="text-yellow-600 text-xs font-bold">★ {supplier.supplierScore}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 font-normal mt-1">
                                                <span className="flex items-center"><CreditCardIcon className="w-3 h-3 mr-1"/> {supplier.paymentTerms}</span>
                                                <span className="flex items-center"><TruckIcon className="w-3 h-3 mr-1"/> {supplier.deliveryDays} días</span>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orderDetails.products.map((product) => {
                                const bestSupplierId = getBestPriceSupplierId(product.id);
                                
                                return (
                                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                        {/* Product Info */}
                                        <td className="px-6 py-4 border-r border-gray-200 bg-white sticky left-0 z-10">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900">{product.name}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                     <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Qty: {product.quantity}</span>
                                                     <span className="text-xs text-gray-500">Pref: {product.targetBrand || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Supplier Cells */}
                                        {supplierResponses.map(supplier => {
                                            const item = supplier.items.find(i => i.productId === product.id);
                                            const isBestPrice = supplier.supplierId === bestSupplierId && (item?.price || 0) > 0;
                                            const isSelected = selections[product.id] === supplier.supplierId;
                                            
                                            if (!item || (item.price === 0)) return <td key={supplier.supplierId} className="border-r border-gray-200 px-4 py-4 bg-gray-50 text-center text-gray-400">Sin Cotizar</td>;

                                            return (
                                                <td 
                                                    key={supplier.supplierId} 
                                                    onClick={() => handleSelectSupplierForItem(product.id, supplier.supplierId)}
                                                    className={`px-4 py-4 border-r border-gray-200 cursor-pointer transition-all relative
                                                        ${isSelected ? 'bg-teal-50/40 ring-2 ring-inset ring-teal-500' : ''}
                                                    `}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-900 text-base">
                                                                {formatCurrency(item.price)}
                                                            </span>
                                                            {isBestPrice && (
                                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full w-fit mt-0.5 border border-emerald-100">
                                                                    Mejor Precio
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Radio Button UI */}
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                                                            ${isSelected ? 'border-teal-600 bg-teal-600' : 'border-gray-300 bg-white'}
                                                        `}>
                                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                                        </div>
                                                    </div>

                                                    <div className="text-xs text-gray-600">
                                                        Marca: <span className="font-medium text-gray-800">{item.brandOffered}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        Subtotal: {formatCurrency(item.price * product.quantity)}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                )}
            </div>
        </motion.div>
    );
};
