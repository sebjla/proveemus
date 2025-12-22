
import React, { useState } from 'react';

interface RegisterPageProps {
  onRegister: () => void; // Simplified for this demo
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    schoolName: '',
    address: '',
    cuit: '',
    taxStatus: 'Responsable Inscripto',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to a server.
    // For this demo, we'll just show a success message and switch to login.
    alert('¡Registro exitoso! Ahora puedes iniciar sesión con las credenciales creadas.');
    onRegister();
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-gray-800">Crear Cuenta Corporativa</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Razón Social / Organización</label>
          <input name="schoolName" placeholder="Ej: Tech Solutions S.A." required onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-teal-500 focus:border-teal-500 focus:outline-none" />
        </div>
        
        <input name="address" placeholder="Dirección Fiscal" required onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-teal-500 focus:border-teal-500 focus:outline-none" />
        <input name="cuit" placeholder="CUIT" required onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-teal-500 focus:border-teal-500 focus:outline-none" />
        
        <select name="taxStatus" value={formData.taxStatus} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-teal-500 focus:border-teal-500 focus:outline-none">
          <option>Responsable Inscripto</option>
          <option>Monotributista</option>
          <option>Exento</option>
          <option>Consumidor Final</option>
        </select>
        
        <input name="email" type="email" placeholder="Email Corporativo" required onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-teal-500 focus:border-teal-500 focus:outline-none" />
        <input name="password" type="password" placeholder="Contraseña" required onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-teal-500 focus:border-teal-500 focus:outline-none" />
        
        <div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors">
            Registrarse
          </button>
        </div>
      </form>
      <p className="text-sm text-center text-gray-600">
        ¿Ya tienen una cuenta?{' '}
        <button onClick={onSwitchToLogin} className="font-medium text-teal-600 hover:text-teal-500">
          Inicia sesión
        </button>
      </p>
    </div>
  );
};
