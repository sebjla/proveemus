
import React from 'react';
import { motion } from 'framer-motion';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { TruckIcon } from './icons/TruckIcon';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';
import { UserRole } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ListIcon } from './icons/ListIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CheckIcon } from './icons/CheckIcon';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: (role?: UserRole) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25 } },
};

const AnimatedLine = () => (
  <div className="relative w-full h-px bg-gray-100 overflow-hidden">
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: '100%' }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-40"
    />
  </div>
);

const WorkflowStep = ({ icon: Icon, title, description, stepNumber, delay }: { icon: any, title: string, description: string, stepNumber: string, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="relative group p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500"
  >
    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black text-sm rotate-12 group-hover:rotate-0 transition-transform shadow-xl">
      {stepNumber}
    </div>
    
    <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-600 group-hover:scale-110 transition-all duration-500">
      <Icon className="w-8 h-8 text-teal-600 group-hover:text-white transition-colors" />
    </div>
    
    <h4 className="text-xl font-black text-gray-900 mb-3 tracking-tighter">{title}</h4>
    <p className="text-sm text-gray-500 font-medium leading-relaxed">{description}</p>
  </motion.div>
);

const BenefitCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="p-10 bg-gray-50/50 rounded-[3rem] border border-white hover:bg-white hover:shadow-2xl transition-all duration-500 group"
  >
    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
      <Icon className="w-7 h-7 text-teal-600" />
    </div>
    <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tighter">{title}</h3>
    <p className="text-base text-gray-500 font-medium leading-relaxed">{description}</p>
  </motion.div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin, onNavigateToRegister }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white w-full min-h-screen font-sans selection:bg-teal-100 selection:text-teal-900"
    >
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-teal-600 p-1.5 rounded-xl shadow-lg shadow-teal-600/20">
                <BookOpenIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tighter">Proveemus</span>
            </div>
            <div className="flex items-center space-x-6">
              <button 
                onClick={onNavigateToLogin} 
                className="text-sm font-black text-gray-400 hover:text-teal-600 transition-colors uppercase tracking-widest"
              >
                Acceder
              </button>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => onNavigateToRegister(UserRole.CLIENT)} 
                className="px-6 py-2.5 text-xs font-black text-white bg-gray-900 hover:bg-black rounded-full transition-all shadow-xl uppercase tracking-widest"
              >
                Registrarse
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Tall text, tight padding */}
      <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-teal-50/50 rounded-full blur-[120px] opacity-40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 bg-white rounded-full border border-gray-100 shadow-sm">
               <SparklesIcon className="w-4 h-4 text-teal-600" />
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Abastecimiento Inteligente</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black text-gray-900 mb-8 tracking-tighter leading-[0.92]">
              Suministros para colegios <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-teal-500 to-indigo-600">sin complicaciones.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              La plataforma líder para conectar instituciones con proveedores verificados. Optimiza tus compras con tecnología y transparencia.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-8">
              <motion.button 
                whileHover={{ scale: 1.05, y: -4 }} 
                whileTap={{ scale: 0.98 }} 
                onClick={() => onNavigateToRegister(UserRole.CLIENT)} 
                className="w-full sm:w-auto px-12 py-5 text-xl font-black text-white bg-teal-600 hover:bg-teal-700 rounded-[2rem] transition-all shadow-[0_20px_40px_-10px_rgba(13,148,136,0.4)]"
              >
                Crear Cuenta
              </motion.button>
              
              <button 
                onClick={onNavigateToLogin}
                className="text-gray-900 font-black text-lg hover:text-teal-600 transition-all flex items-center group relative py-2"
              >
                Acceso Usuarios
                <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <AnimatedLine />

      {/* Profile Cards - Strong text, tight padding */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 bg-slate-50/20">
        <div className="grid lg:grid-cols-2 gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            className="bg-white rounded-[3.5rem] p-12 shadow-2xl border border-gray-50 flex flex-col justify-between transition-all duration-500 group"
          >
            <div>
              <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-[2.2rem] flex items-center justify-center mb-10 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-inner">
                <BuildingOfficeIcon className="w-10 h-10" />
              </div>
              <h3 className="text-5xl font-black text-gray-900 mb-6 tracking-tighter leading-none">Soy una <span className="text-teal-600">Institución</span></h3>
              <p className="text-gray-500 text-xl font-medium leading-relaxed mb-10">Ahorra hasta un 20% en suministros mediante licitaciones transparentes.</p>
              <div className="space-y-4 mb-10">
                {["Licitaciones rápidas", "Control de presupuesto", "Trazabilidad completa"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                    <CheckIcon className="w-5 h-5 text-teal-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => onNavigateToRegister(UserRole.CLIENT)} className="w-full py-6 bg-teal-600 text-white font-black text-xl rounded-[2rem] hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20">Comenzar como Empresa</button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            className="bg-white rounded-[3.5rem] p-12 shadow-2xl border border-gray-50 flex flex-col justify-between transition-all duration-500 group"
          >
            <div>
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2.2rem] flex items-center justify-center mb-10 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                <TruckIcon className="w-10 h-10" />
              </div>
              <h3 className="text-5xl font-black text-gray-900 mb-6 tracking-tighter leading-none">Soy un <span className="text-indigo-600">Proveedor</span></h3>
              <p className="text-gray-500 text-xl font-medium leading-relaxed mb-10">Accede a una red masiva de clientes y escala tus ventas directamente.</p>
              <div className="space-y-4 mb-10">
                {["Nuevos canales de venta", "Pagos garantizados", "Logística integrada"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                    <CheckIcon className="w-5 h-5 text-indigo-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => onNavigateToRegister(UserRole.SUPPLIER)} className="w-full py-6 bg-indigo-600 text-white font-black text-xl rounded-[2rem] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20">Comenzar como Proveedor</button>
          </motion.div>
        </div>
      </section>

      {/* Workflow Section - Strong text, tight padding */}
      <section className="py-24 relative bg-white overflow-hidden border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
           <div className="text-center mb-16">
              <span className="text-teal-600 font-black text-sm uppercase tracking-[0.3em] mb-4 block">Workflow</span>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter">¿Cómo funciona Proveemus?</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              <WorkflowStep stepNumber="01" icon={ListIcon} title="Requisición" description="Carga tus productos o utiliza nuestra IA para digitalizar tus pedidos de forma automática." delay={0.1} />
              <WorkflowStep stepNumber="02" icon={TrendingUpIcon} title="Licitación" description="Tu solicitud se publica en nuestra red y los proveedores compiten por precio." delay={0.2} />
              <WorkflowStep stepNumber="03" icon={ShieldCheckIcon} title="Adjudicación" description="Los administradores analizan y seleccionan al proveedor óptimo para ti." delay={0.3} />
              <WorkflowStep stepNumber="04" icon={TruckIcon} title="Logística" description="Recibe tus insumos con seguimiento en tiempo real hasta tu puerta." delay={0.4} />
           </div>
        </div>
      </section>

      {/* Why Choose Us - Strong text, tight padding */}
      <section className="py-24 bg-gray-50 overflow-hidden border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-5">
                 <span className="text-teal-600 font-black text-sm uppercase tracking-[0.3em] mb-6 block">Valor Diferencial</span>
                 <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter mb-8 leading-[0.95]">¿Por qué elegir <span className="text-teal-600">Proveemus?</span></h2>
                 <p className="text-xl text-gray-500 font-medium leading-relaxed mb-10">Creamos un ecosistema de confianza, eficiencia y ahorro real para instituciones educativas.</p>
                 <button onClick={() => onNavigateToRegister(UserRole.CLIENT)} className="px-10 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl">Saber más</button>
              </div>

              <div className="lg:col-span-7 grid sm:grid-cols-2 gap-8">
                 <BenefitCard icon={ChartBarIcon} title="Ahorro del 18%" description="Nuestros clientes reportan un ahorro promedio significativo en sus presupuestos anuales." />
                 <BenefitCard icon={ShieldCheckIcon} title="Red Verificada" description="Auditamos a cada proveedor para asegurar cumplimiento fiscal y calidad de servicio." />
                 <BenefitCard icon={SparklesIcon} title="Tecnología IA" description="Olvídate de las hojas de cálculo. Nuestra inteligencia digitaliza tus pedidos en segundos." />
                 <BenefitCard icon={CheckIcon} title="Cero Comisiones" description="Modelo transparente enfocado en maximizar el valor para las instituciones." />
              </div>
           </div>
        </div>
      </section>

      {/* Footer - Tight padding */}
      <footer className="bg-white pt-20 pb-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center space-x-2">
              <div className="bg-teal-600 p-1.5 rounded-lg">
                <BookOpenIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-gray-900">Proveemus</span>
            </div>
            <div className="flex gap-8 text-sm font-bold text-gray-400">
               <a href="#" className="hover:text-teal-600 transition-colors">Ayuda</a>
               <a href="#" className="hover:text-teal-600 transition-colors">Privacidad</a>
               <a href="#" className="hover:text-teal-600 transition-colors">Contacto</a>
            </div>
            <p className="text-xs font-black text-gray-300 uppercase tracking-widest">© 2025 Proveemus Tech. Abastecimiento Corporativo.</p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};
