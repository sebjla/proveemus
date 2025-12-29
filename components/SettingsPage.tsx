import React, { useState } from 'react';
import type { User } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { useToast } from '../context/ToastContext';

interface SettingsPageProps {
  user: User;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    schoolName: user.schoolName,
    email: user.email,
    address: user.address,
    cuit: user.cuit,
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      showToast("Configuración actualizada correctamente", "success");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Configuración de Cuenta</h2>
      
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-2xl font-bold">
              {user.schoolName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{user.schoolName}</h3>
              <p className="text-sm text-gray-500">{user.role}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Institución/Usuario</label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CUIT</label>
              <input
                type="text"
                name="cuit"
                value={formData.cuit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-gray-50 text-gray-700"
                readOnly // CUIT is usually not editable after initial registration
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña (Dejar en blanco para mantener)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors flex items-center"
            >
              {isSaving && <SpinnerIcon className="w-4 h-4 mr-2" />}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};