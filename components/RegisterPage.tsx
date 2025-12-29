
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';
import { useToast } from '../context/ToastContext'; // Import useToast

interface RegisterPageProps {
  initialRole?: UserRole;
  onRegister: () => void; 
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ initialRole = UserRole.CLIENT, onRegister, onSwitchToLogin }) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast(); // Use the toast context

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (signUpError) {
      console.error("Supabase SignUp Error:", signUpError); // Log detailed error
      setError(signUpError.message);
      showToast(`Error al registrar: ${signUpError.message}`, "error"); // Use toast for error
      setIsLoading(false);
      return;
    }

    if (data.user) {
      // Create user profile in the 'profiles' table
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: formData.email,
        role: role,
        school_name: formData.schoolName,
        address: formData.address,
        cuit: formData.cuit,
        tax_status: formData.taxStatus,
      });

      if (profileError) {
        console.error("Supabase Profile Insert Error:", profileError); // Log detailed error
        setError(profileError.message);
        showToast(`Error al crear perfil: ${profileError.message}`, "error"); // Use toast for error
        // Optionally, you might want to delete the auth.user here if profile creation fails,
        // but for now, we just report the error.
        setIsLoading(false);
        return;
      }

      // Use toast for success message
      showToast(`¡Registro exitoso! Por favor, verifica tu email y inicia sesión.`, "success");
      onRegister();
    } else {
      // This case should theoretically not happen if signUpError is handled, but as a fallback
      setError("Ocurrió un error inesperado durante el registro. Por favor, intenta de nuevo.");
      showToast("Ocurrió un error inesperado durante el registro.", "error");
    }
    setIsLoading(false); // Ensure loading state is reset even in unexpected paths
  };

  const isClient = role === UserRole.CLIENT;

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Crear Cuenta</h2>
        <p className="text-sm text-gray-500 mt-1">
          {isClient ? 'Para instituciones y empresas compradoras' : 'Para proveedores y distribuidores'}
        </p>
      </div>

      <div className="flex p-1 bg-gray-100 rounded-lg">
        <button 
          onClick={() => setRole(UserRole.CLIENT)}
          className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${isClient ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          CLIENTE
        </button>
        <button 
          onClick={() => setRole(UserRole.SUPPLIER)}
          className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${!isClient ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          PROVEEDOR
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded">{error}</p>}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            {isClient ? 'Nombre de la Institución / Empresa' : 'Razón Social'}
          </label>
          <input 
            name="schoolName" 
            placeholder={isClient ? "Ej: Colegio San José" : "Ej: Distribuidora Escolar S.R.L."} 
            required 
            onChange={handleChange} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" 
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Dirección Fiscal</label>
          <input name="address" placeholder="Ej: Av. Rivadavia 1234, CABA" required onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">CUIT</label>
          <input name="cuit" placeholder="XX-XXXXXXXX-X" required onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Situación IVA</label>
          <select name="taxStatus" value={formData.taxStatus} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all">
            <option>Responsable Inscripto</option>
            <option>Monotributista</option>
            <option>Exento</option>
            <option>Consumidor Final</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email de Acceso</label>
          <input name="email" type="email" placeholder="email@empresa.com" required onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Contraseña</label>
          <input name="password" type="password" placeholder="••••••••" required onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
        </div>
        
        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all transform hover:-translate-y-0.5 disabled:opacity-50
              ${isClient ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'}
            `}
          >
            {isLoading ? 'Registrando...' : 'Registrar mi Cuenta'}
          </button>
        </div>
      </form>
      <p className="text-sm text-center text-gray-600">
        ¿Ya tienen una cuenta?{' '}
        <button onClick={onSwitchToLogin} className={`font-bold hover:underline ${isClient ? 'text-teal-600' : 'text-indigo-600'}`}>
          Inicia sesión
        </button>
      </p>
    </div>
  );
};
