
import React, { useState, useCallback } from 'react';
import type { OrderItem } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { parseOrderFromText } from '../services/geminiService';

interface OrderDetailsData {
    expirationDate: string;
    requestedDeliveryDate: string;
    termsAndConditions: string;
}

interface NewOrderFormProps {
  onSubmit: (items: Omit<OrderItem, 'id'>[], details: OrderDetailsData) => void;
  isSubmitting: boolean;
}

export const NewOrderForm: React.FC<NewOrderFormProps> = ({ onSubmit, isSubmitting }) => {
  const [items, setItems] = useState<Omit<OrderItem, 'id'>[]>([
    { quantity: 1, product: '', brand: '' },
  ]);
  const [details, setDetails] = useState<OrderDetailsData>({
      expirationDate: '',
      requestedDeliveryDate: '',
      termsAndConditions: ''
  });
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleItemChange = (index: number, field: keyof Omit<OrderItem, 'id'>, value: string) => {
    const newItems = [...items];
    const item = newItems[index];
    if (field === 'quantity') {
      (item[field] as number) = Number(value) >= 1 ? Number(value) : 1;
    } else {
      (item[field] as string) = value;
    }
    setItems(newItems);
  };
  
  const addItemRow = () => {
    setItems([...items, { quantity: 1, product: '', brand: '' }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setDetails({
          ...details,
          [e.target.name]: e.target.value
      });
  };

  const handleAiParse = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    setIsParsing(true);
    setAiError(null);
    try {
      const parsedItems = await parseOrderFromText(aiPrompt);
      if (parsedItems.length > 0) {
        setItems(parsedItems);
      } else {
        setAiError("No se encontraron artículos en tu solicitud.");
      }
    } catch (error) {
        if (error instanceof Error) {
            setAiError(error.message);
        } else {
            setAiError("Ocurrió un error desconocido.");
        }
    } finally {
      setIsParsing(false);
    }
  }, [aiPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(item => item.product.trim() !== '' && item.quantity > 0);
    
    if (!details.expirationDate) {
        alert("Por favor, indica una fecha límite para recibir ofertas.");
        return;
    }

    if (validItems.length > 0) {
      onSubmit(validItems, details);
      setItems([{ quantity: 1, product: '', brand: '' }]);
      setDetails({ expirationDate: '', requestedDeliveryDate: '', termsAndConditions: '' });
      setAiPrompt('');
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200">
      
      {/* AI Prompt Section */}
      <div className="mb-8 p-4 border border-teal-200 bg-teal-50 rounded-lg">
        <label htmlFor="ai-prompt" className="flex items-center text-md font-semibold text-teal-800 mb-2">
          <SparklesIcon className="w-6 h-6 mr-2 text-teal-600" />
          Carga Rápida con IA
        </label>
        <p className="text-sm text-teal-700 mb-3">Describe tu necesidad en lenguaje natural. Ej: "Necesito 10 resmas A4, 5 cartuchos de toner HP 85A y 3 sillas de oficina"</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="ai-prompt"
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Escribe aquí los insumos que necesitas..."
            className="flex-grow w-full px-4 py-2 border border-teal-200 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:cursor-wait bg-white text-gray-900 placeholder-gray-500"
            disabled={isParsing}
          />
          <button
            type="button"
            onClick={handleAiParse}
            disabled={isParsing || !aiPrompt}
            className="w-full sm:w-auto flex justify-center items-center px-4 py-2 bg-teal-600 text-white font-semibold rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isParsing ? <SpinnerIcon className="w-5 h-5" /> : 'Procesar Lista'}
          </button>
        </div>
        {aiError && <p className="text-red-500 text-sm mt-2">{aiError}</p>}
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Dates & Terms Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1 text-gray-500" />
                    Fecha Límite para Recibir Ofertas *
                </label>
                <input 
                    type="date" 
                    name="expirationDate"
                    required
                    value={details.expirationDate}
                    onChange={handleDetailsChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1 text-gray-500" />
                    Fecha de Entrega Deseada
                </label>
                <input 
                    type="date" 
                    name="requestedDeliveryDate"
                    value={details.requestedDeliveryDate}
                    onChange={handleDetailsChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FileTextIcon className="w-4 h-4 mr-1 text-gray-500" />
                    Condiciones / Observaciones (Opcional)
                </label>
                <textarea 
                    name="termsAndConditions"
                    rows={3}
                    placeholder="Ej: Solo productos ecológicos. Entregar por puerta trasera de 8 a 12hs."
                    value={details.termsAndConditions}
                    onChange={handleDetailsChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 placeholder-gray-400"
                />
            </div>
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Lista de Artículos</h3>

        {/* Items Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-4 py-3">Cantidad</th>
                <th scope="col" className="px-4 py-3">Producto / Servicio</th>
                <th scope="col" className="px-4 py-3">Marca / Especificación (Opcional)</th>
                <th scope="col" className="px-1 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2 w-28">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-teal-500 focus:border-teal-500"
                      min="1"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.product}
                      onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400"
                      placeholder="Ej: Monitor 24 pulgadas"
                      required
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.brand}
                      onChange={(e) => handleItemChange(index, 'brand', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400"
                      placeholder="Ej: Samsung / LG"
                    />
                  </td>
                  <td className="px-1 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeItemRow(index)}
                      disabled={items.length <= 1}
                      className="text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed p-2 rounded-full"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={addItemRow}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Añadir Fila
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-md shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-gray-300 disabled:text-gray-600 transition-colors"
          >
             {isSubmitting ? <SpinnerIcon className="w-5 h-5"/> : 'Generar Requisición'}
          </button>
        </div>
      </form>
    </div>
  );
};
