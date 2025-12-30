import { GoogleGenAI, Type } from "@google/genai";
import type { OrderItem } from '../types';

// FIX: Initialize GoogleGenAI with { apiKey: process.env.API_KEY }.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY! });

const orderSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      quantity: {
        type: Type.INTEGER,
        description: 'La cantidad de unidades para el producto.',
      },
      product: {
        type: Type.STRING,
        description: 'El nombre del producto. Ej: "cuaderno", "bolígrafo azul", "regla".',
      },
      brand: {
        type: Type.STRING,
        description: 'La marca del producto, si se especifica. De lo contrario, dejarlo vacío.',
      },
    },
    required: ['quantity', 'product'],
  },
};

export const parseOrderFromText = async (text: string): Promise<Omit<OrderItem, 'id'>[]> => {
  try {
    const response = await ai.models.generateContent({
      // FIX: Use gemini-3-flash-preview instead of gemini-2.5-flash
      model: "gemini-3-flash-preview",
      contents: `Analiza el siguiente pedido de útiles escolares y conviértelo en una lista estructurada. La marca es opcional. Pedido: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: orderSchema,
      },
    });

    // FIX: Extract text output from response.text property
    const jsonString = response.text!.trim();
    const parsedData = JSON.parse(jsonString);

    if (Array.isArray(parsedData)) {
      return parsedData.map(item => ({
        quantity: item.quantity || 1,
        product: item.product || 'Desconocido',
        brand: item.brand || '',
      }));
    }
    return [];
  } catch (error) {
    console.error("Error parsing order with Gemini API:", error);
    throw new Error("No se pudo entender el pedido. Por favor, intenta reformularlo o ingresa los artículos manualmente.");
  }
};
