
import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (email: string, pass: string) => void;
  onSwitchToRegister: () => void;
  error: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToRegister, error }) => {
  const [email, setEmail] = useState('colegio');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-gray-800">Bienvenido a Proveemus</h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Usuario o Email
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="text"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password"className="block text-sm font-medium text-gray-700">
            Contraseña (Opcional)
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </form>
      <p className="text-sm text-center text-gray-600">
        ¿No tienes una cuenta?{' '}
        <button onClick={onSwitchToRegister} className="font-medium text-teal-600 hover:text-teal-500">
          Regístrate aquí
        </button>
      </p>
    </div>
  );
};
