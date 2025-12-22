
import React from 'react';
import { motion } from 'framer-motion';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { PackageIcon } from './icons/PackageIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin, onNavigateToRegister }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-gradient-to-br from-teal-50 via-white to-slate-50 w-full"
    >
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <BookOpenIcon className="h-8 w-8 text-teal-600" />
              <span className="text-2xl font-bold text-gray-900">Proveemus</span>
            </div>
            <div className="flex space-x-4">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onNavigateToLogin} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors">
                Iniciar Sesión
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onNavigateToRegister} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors shadow-sm">
                Registrarse
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div 
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-block mb-4 px-4 py-1.5 bg-teal-100 text-teal-800 rounded-full text-sm font-semibold tracking-wide">
            SOLUCIONES DE ABASTECIMIENTO B2B
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Proveemus <br/><span className="text-teal-600">Compras Corporativas Inteligentes</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Centraliza las compras de tu organización. Desde insumos de oficina hasta equipamiento industrial, conectamos tu empresa con los mejores proveedores.
          </motion.p>
          <motion.div variants={itemVariants} className="flex justify-center space-x-4">
            <motion.button whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }} onClick={onNavigateToRegister} className="px-8 py-3 text-lg font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-all shadow-lg shadow-teal-600/20">
              Crear Cuenta Empresa
            </motion.button>
            <motion.button whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }} onClick={onNavigateToLogin} className="px-8 py-3 text-lg font-medium text-teal-700 bg-white border border-teal-200 hover:bg-teal-50 rounded-md transition-all shadow-sm">
              Acceder al Portal
            </motion.button>
          </motion.div>
        </motion.div>
        <motion.div 
          className="mt-20 relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="absolute inset-0 bg-teal-600 blur-3xl opacity-10 rounded-full transform scale-90 translate-y-10"></div>
          {/* Changed image to a more corporate/logistics one */}
          <img 
            className="relative rounded-2xl shadow-2xl w-full max-w-5xl mx-auto border border-gray-100 object-cover max-h-[600px]" 
            alt="Dashboard de gestión de compras corporativas" 
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" 
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Optimiza tu Cadena de Suministro</h2>
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl hover:shadow-lg transition-shadow border border-teal-100">
              <PackageIcon className="h-12 w-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Solicitudes con IA</h3>
              <p className="text-gray-600">Genera órdenes de compra complejas en segundos utilizando nuestro asistente de lenguaje natural.</p>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl hover:shadow-lg transition-shadow border border-teal-100">
              <TrendingUpIcon className="h-12 w-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Control de Gastos</h3>
              <p className="text-gray-600">Visualiza presupuestos, compara cotizaciones y elige la mejor opción costo-beneficio.</p>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl hover:shadow-lg transition-shadow border border-teal-100">
              <ShieldCheckIcon className="h-12 w-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Proveedores Verificados</h3>
              <p className="text-gray-600">Accede a una red confiable de proveedores certificados y calificados por la comunidad.</p>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl hover:shadow-lg transition-shadow border border-teal-100">
              <BookOpenIcon className="h-12 w-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trazabilidad Total</h3>
              <p className="text-gray-600">Seguimiento en tiempo real desde la aprobación del presupuesto hasta la entrega en tus instalaciones.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Moderniza tus procesos de compra hoy</h2>
          <p className="text-xl text-teal-100 mb-8">Únete a cientos de empresas que ya optimizan su abastecimiento con Proveemus.</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onNavigateToRegister} className="px-8 py-3 text-lg font-medium bg-white text-teal-700 hover:bg-teal-50 rounded-md shadow-lg transition-transform transform">
            Registrar mi Empresa
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
             <BookOpenIcon className="h-6 w-6 text-teal-400" />
             <span className="text-xl font-bold">Proveemus</span>
          </div>
          <p className="text-slate-400">© 2025 Proveemus. Plataforma de Abastecimiento Inteligente.</p>
        </div>
      </footer>
    </motion.div>
  );
};
