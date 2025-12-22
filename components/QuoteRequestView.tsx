
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { QuoteDetail, ProductToQuote, Order } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { TruckIcon } from './icons/TruckIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ClockIcon } from './icons/ClockIcon';
import { useToast } from '../context/ToastContext';
import { ConfirmationModal } from './ConfirmationModal';
import { useNotifications } from '../context/NotificationContext';

interface QuoteRequestViewProps {
    orderId: string;
    onBack: () => void;
}

export const QuoteRequestView: React.FC<QuoteRequestViewProps> = ({ orderId, onBack }) => {
    const [requestData, setRequestData] = useState<QuoteDetail | null>(null);
    const [products, setProducts] = useState<ProductToQuote[]>([]);
    const { showToast } = useToast();
    const { addNotification } = useNotifications();
    
    // Modal State
    const [showRejectModal, setShowRejectModal] = useState(false);
    
    // Form State
    const [supplierPaymentTerm, setSupplierPaymentTerm] = useState('30_DAYS');
    const [offerValidity, setOfferValidity] = useState('');
    const [deliveryDays, setDeliveryDays] = useState<number>(5);
    const [includesShipping, setIncludesShipping] = useState(true);
    const [supplierNotes, setSupplierNotes] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        // Load Real Order from LocalStorage
        const allOrders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
        const foundOrder = allOrders.find(o => o.id.toString() === orderId);

        if (foundOrder) {
            // Check if this supplier has already quoted
            const savedQuotes = JSON.parse(localStorage.getItem('supplier_quotes') || '[]');
            const mySupplierId = 3; // Hardcoded ID for current supplier
            const existingQuote = savedQuotes.find((q: any) => q.orderId === orderId && q.supplierId === mySupplierId);

            // Map Order (Client Domain) to QuoteDetail (Supplier Domain)
            const details: QuoteDetail = {
                id: foundOrder.id.toString(),
                title: `Solicitud de Compra #${foundOrder.id.toString().slice(-6)}`,
                clientName: foundOrder.schoolName,
                clientAddress: 'Dirección Registrada en Cuenta', 
                requestedPaymentTerm: 'A convenir', 
                requestedDeliveryDays: foundOrder.requestedDeliveryDate 
                    ? Math.ceil((new Date(foundOrder.requestedDeliveryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) 
                    : 7,
                creationDate: new Date(foundOrder.createdAt).toLocaleDateString(),
                expirationDate: foundOrder.expirationDate ? new Date(foundOrder.expirationDate).toLocaleDateString() : 'Sin fecha',
                termsAndConditions: foundOrder.termsAndConditions || 'Sin condiciones específicas.',
                products: foundOrder.items.map(item => ({
                    id: `${foundOrder.id}-${item.id}`,
                    sku: `GEN-${item.id}`, // Mock SKU
                    name: item.product,
                    quantity: item.quantity,
                    targetBrand: item.brand,
                    quotedPrice: 0,
                    quotedBrand: ''
                }))
            };

            setRequestData(details);

            // IF EDITING: Load existing data
            if (existingQuote) {
                setIsEditing(true);
                setProducts(existingQuote.products);
                setSupplierPaymentTerm(existingQuote.terms.paymentTerm);
                setOfferValidity(existingQuote.terms.offerValidity);
                setDeliveryDays(existingQuote.terms.deliveryDays);
                setIncludesShipping(existingQuote.terms.includesShipping);
                setSupplierNotes(existingQuote.terms.notes);
            } else {
                setProducts(details.products);
            }

        } else {
            showToast("No se encontró la solicitud", "error");
        }
    }, [orderId]);

    const handleProductChange = (id: string, field: keyof ProductToQuote, value: string | number) => {
        setProducts(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, [field]: value };
            }
            return p;
        }));
    };

    const totalQuoted = useMemo(() => {
        return products.reduce((acc, curr) => acc + ((curr.quotedPrice || 0) * curr.quantity), 0);
    }, [products]);

    const isFormValid = useMemo(() => {
        // Simple validation: Ensure at least one item has a price > 0
        const hasPrices = products.some(p => (p.quotedPrice || 0) > 0);
        return hasPrices && offerValidity !== '';
    }, [products, offerValidity]);

    const handleSubmit = () => {
        if (!isFormValid) return;
        
        // SAVE QUOTE TO LOCAL STORAGE
        const mySupplierId = 3;
        const newQuote = {
            orderId,
            supplierId: mySupplierId,
            supplierName: 'Distribuidora Escolar', // Hardcoded for now
            products,
            terms: {
                paymentTerm: supplierPaymentTerm,
                offerValidity,
                deliveryDays,
                includesShipping,
                notes: supplierNotes
            },
            submittedAt: new Date().toISOString()
        };

        const existingQuotes = JSON.parse(localStorage.getItem('supplier_quotes') || '[]');
        // Remove old quote if updating
        const otherQuotes = existingQuotes.filter((q: any) => !(q.orderId === orderId && q.supplierId === mySupplierId));
        const updatedQuotes = [...otherQuotes, newQuote];
        
        localStorage.setItem('supplier_quotes', JSON.stringify(updatedQuotes));
        
        showToast(isEditing ? "Cotización actualizada correctamente" : "Cotización enviada con éxito.", "success");
        addNotification("Oferta Enviada", `Has ${isEditing ? 'actualizado' : 'enviado'} tu oferta para la solicitud ${orderId}`, "success");
        setTimeout(onBack, 1000);
    };

    const handleReject = () => {
        showToast("Has rechazado la solicitud de cotización.", "info");
        setShowRejectModal(false);
        setTimeout(onBack, 500);
    };

    if (!requestData) return <div className="p-10 text-center flex items-center justify-center"><ClockIcon className="animate-spin w-6 h-6 mr-2"/> Cargando detalles...</div>;

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen bg-slate-50 pb-20"
        >
            <ConfirmationModal 
                isOpen={showRejectModal}
                title="Rechazar Solicitud"
                message="¿Estás seguro de que deseas rechazar esta oportunidad de cotización? Esta acción no se puede deshacer y desaparecerá de tu bandeja."
                isDestructive={true}
                confirmText="Rechazar Solicitud"
                onClose={() => setShowRejectModal(false)}
                onConfirm={handleReject}
            />

            {/* 1. Sticky Header */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                        title="Volver a la bandeja"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                             <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                                 #{requestData.id.slice(-6)}
                             </span>
                             <h1 className="text-xl font-bold text-gray-900 truncate max-w-md">{requestData.title}</h1>
                             {isEditing && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded ml-2">Editando</span>}
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm transition-all transform
                        ${isFormValid 
                            ? 'bg-teal-600 hover:bg-teal-700 hover:-translate-y-0.5 shadow-teal-500/30' 
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                >
                    {isEditing ? 'Actualizar Oferta' : 'Enviar Cotización'}
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                
                {/* 2. Request Details (Read-Only) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                            <FileTextIcon className="w-5 h-5 mr-2 text-teal-600" />
                            Detalles de la Solicitud
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {/* Col 1: Client */}
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <MapPinIcon className="w-5 h-5 mt-0.5 text-gray-400 mr-2 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Institución</p>
                                        <p className="font-medium text-gray-900">{requestData.clientName}</p>
                                        <p className="text-sm text-gray-500">{requestData.clientAddress}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Col 2: Dates */}
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <CalendarIcon className="w-5 h-5 mt-0.5 text-gray-400 mr-2 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fechas</p>
                                        <div className="flex flex-col text-sm">
                                            <span className="text-gray-600">Creada: <span className="font-medium text-gray-900">{requestData.creationDate}</span></span>
                                            <span className="text-red-600 font-medium">Vence: {requestData.expirationDate}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                             {/* Col 3: Terms */}
                             <div className="space-y-3">
                                <div className="flex items-start">
                                    <CreditCardIcon className="w-5 h-5 mt-0.5 text-gray-400 mr-2 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Condiciones Solicitadas</p>
                                        <p className="text-sm text-gray-900 font-medium">{requestData.requestedPaymentTerm}</p>
                                        <div className="flex items-center text-sm text-gray-600 mt-1">
                                            <TruckIcon className="w-4 h-4 mr-1 text-gray-400" />
                                            Entrega máx: {requestData.requestedDeliveryDays} días (aprox)
                                        </div>
                                    </div>
                                </div>
                            </div>

                             {/* Col 4: Actions */}
                            <div className="flex flex-col gap-3 justify-center">
                                <button className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                    <DownloadIcon className="w-4 h-4 mr-2" />
                                    Ver Adjuntos
                                </button>
                                <button 
                                    onClick={() => setShowRejectModal(true)}
                                    className="w-full px-4 py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    Rechazar Solicitud
                                </button>
                            </div>
                        </div>

                        {/* Observations */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Observaciones del Cliente</p>
                             <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 italic border border-gray-200">
                                "{requestData.termsAndConditions}"
                             </div>
                        </div>
                    </div>
                </div>

                {/* 3. Supplier Offer Terms (Form) */}
                <div className="bg-teal-50 rounded-xl shadow-sm border border-teal-200 p-6">
                    <h2 className="text-lg font-bold text-teal-900 mb-6 flex items-center">
                        <ClockIcon className="w-5 h-5 mr-2 text-teal-700" />
                        Definir Términos de la Oferta
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-teal-800 mb-1">Forma de Pago Ofrecida</label>
                            <select 
                                value={supplierPaymentTerm}
                                onChange={(e) => setSupplierPaymentTerm(e.target.value)}
                                className="block w-full border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-sm p-2.5 bg-white text-gray-900 shadow-sm"
                            >
                                <option value="30_DAYS">30 Días Fecha Factura</option>
                                <option value="60_DAYS">60 Días Fecha Factura</option>
                                <option value="CASH">Contado / Transferencia</option>
                                <option value="CHECK">Cheque 15 Días</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-teal-800 mb-1">Validez de la Oferta *</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    value={offerValidity}
                                    onChange={(e) => setOfferValidity(e.target.value)}
                                    className="block w-full border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-sm p-2.5 bg-white text-gray-900 shadow-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-teal-800 mb-1">Días de Entrega</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <TruckIcon className="h-4 w-4 text-gray-500" />
                                </div>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={deliveryDays}
                                    onChange={(e) => setDeliveryDays(Number(e.target.value))}
                                    className="block w-full pl-10 border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-sm p-2.5 bg-white text-gray-900 shadow-sm"
                                />
                            </div>
                        </div>

                         <div className="flex items-center pt-6">
                            <input
                                id="shipping"
                                type="checkbox"
                                checked={includesShipping}
                                onChange={(e) => setIncludesShipping(e.target.checked)}
                                className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                            />
                            <label htmlFor="shipping" className="ml-2 text-sm font-medium text-teal-900">Incluye costo de envío</label>
                        </div>
                    </div>
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-teal-800 mb-1">Notas de la Oferta (Opcional)</label>
                        <textarea 
                            rows={2}
                            maxLength={250}
                            value={supplierNotes}
                            onChange={(e) => setSupplierNotes(e.target.value)}
                            className="block w-full border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-sm p-2.5 bg-white text-gray-900 shadow-sm"
                            placeholder="Comentarios adicionales sobre stock, entregas parciales, etc."
                        />
                        <div className="text-xs text-teal-600 text-right mt-1">{supplierNotes.length}/250</div>
                    </div>
                </div>

                {/* 4. Products Table (Inline Editing) */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                         <h2 className="text-lg font-bold text-gray-900">Productos a Cotizar</h2>
                         <span className="text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded border border-gray-200">
                            {products.length} ítems
                         </span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {/* Adjusted widths for better balance */}
                                    <th scope="col" className="px-6 py-3 w-[25%] min-w-[200px]">Producto</th>
                                    <th scope="col" className="px-6 py-3 w-16 text-center">Cant.</th>
                                    <th scope="col" className="px-6 py-3 w-[15%] min-w-[120px]">Marca Sugerida</th>
                                    <th scope="col" className="px-6 py-3 w-[20%] min-w-[180px]">Marca Ofertada</th>
                                    {/* Reduced from w-64 to w-48, still min-w-160px for visibility */}
                                    <th scope="col" className="px-6 py-3 w-48 min-w-[160px]">Precio Unit. (ARS)</th>
                                    <th scope="col" className="px-6 py-3 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">{product.name}</p>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">SKU: {product.sku}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-md">{product.quantity}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {product.targetBrand || <span className="text-gray-400 italic">Indistinto</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <input 
                                                type="text"
                                                className="w-full border border-gray-300 rounded px-2 py-1.5 focus:ring-teal-500 focus:border-teal-500 text-sm bg-white text-gray-900"
                                                placeholder={product.targetBrand || "Marca..."}
                                                value={product.quotedBrand || ''}
                                                onChange={(e) => handleProductChange(product.id, 'quotedBrand', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 text-xs">$</span>
                                                </div>
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    className={`w-full border rounded pl-5 pr-2 py-1.5 font-medium text-right focus:ring-2 focus:outline-none transition-shadow
                                                        ${(product.quotedPrice || 0) > 0 
                                                            ? 'border-teal-500 text-teal-900 bg-teal-50/50 focus:ring-teal-500' 
                                                            : 'border-gray-300 focus:border-teal-500 text-gray-900 bg-white'
                                                        }`}
                                                    placeholder="0.00"
                                                    value={product.quotedPrice || ''}
                                                    onChange={(e) => handleProductChange(product.id, 'quotedPrice', parseFloat(e.target.value))}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                                            ${((product.quotedPrice || 0) * product.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Summary */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <div className="flex justify-end items-center gap-4">
                            <span className="text-gray-600 font-medium">Total Cotizado (Neto):</span>
                            <span className="text-2xl font-bold text-teal-700">
                                ${totalQuoted.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};
