
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from './types';
import { UserRole, OrderStatus } from './types';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { ClientDashboard } from './components/ClientDashboard';
import AdminDashboard from './components/AdminDashboard';
import { SupplierOrdersList } from './components/SupplierOrdersList';
import { SupplierDashboard } from './components/SupplierDashboard';
import { SupplierShipments } from './components/SupplierShipments';
import { QuoteRequestView } from './components/QuoteRequestView';
import { QuoteComparisonView } from './components/QuoteComparisonView';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { SettingsPage } from './components/SettingsPage';
import { NotificationCenter } from './components/NotificationCenter';

// Mock user data - Updated to simple users without passwords
const MOCK_USERS: User[] = [
    {
        id: 1,
        email: 'admin',
        password: '', // No password required
        role: UserRole.ADMIN,
        schoolName: 'Administración Central',
        address: 'Oficina Central 101',
        cuit: '30-00000000-1',
        taxStatus: 'Responsable Inscripto'
    },
    {
        id: 2,
        email: 'colegio',
        password: '', // No password required
        role: UserRole.CLIENT,
        schoolName: 'Colegio Demo',
        address: 'Av. Educación 123',
        cuit: '30-12345678-9',
        taxStatus: 'Exento'
    },
    {
        id: 3,
        email: 'proveedor',
        password: '', // No password required
        role: UserRole.SUPPLIER,
        schoolName: 'Distribuidora Escolar',
        address: 'Calle Industrial 555',
        cuit: '30-99999999-1',
        taxStatus: 'Responsable Inscripto'
    }
];

// Initialize localStorage with mock users only
const initializeLocalStorage = () => {
  // Ensure users exist
  const existingUsers = localStorage.getItem('users');
  if (!existingUsers) {
      localStorage.setItem('users', JSON.stringify(MOCK_USERS));
  }
  
  // Ensure orders array exists but is empty if not present
  const existingOrders = localStorage.getItem('orders');
  if (!existingOrders) {
    localStorage.setItem('orders', JSON.stringify([]));
  }

  // Ensure quotes array exists
  const existingQuotes = localStorage.getItem('supplier_quotes');
  if (!existingQuotes) {
      localStorage.setItem('supplier_quotes', JSON.stringify([]));
  }
};

type Page = 'landing' | 'login' | 'register';
type DashboardView = 'HOME' | 'SETTINGS' | 'QUOTES' | 'NEW_ORDER' | 'HISTORY' | 'OPERATIONS' | 'USERS' | 'QUOTE_DETAIL' | 'QUOTE_COMPARISON' | 'SHIPMENTS';

const pageVariants = {
    initial: { opacity: 0, x: -50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 50 },
};

const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
} as const;

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [page, setPage] = useState<Page>('landing');
    const [authError, setAuthError] = useState<string | null>(null);
    
    // Dashboard Navigation State
    const [currentDashboardView, setCurrentDashboardView] = useState<DashboardView>('HOME');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        initializeLocalStorage();
        const loggedInUser = sessionStorage.getItem('user');
        if (loggedInUser) {
            setUser(JSON.parse(loggedInUser));
        }
    }, []);

    const handleLogin = (email: string, pass: string) => {
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        // Check exact match for email, and match password (empty string matches empty string)
        const foundUser = users.find(u => u.email === email && u.password === pass);
        
        if (foundUser) {
            setUser(foundUser);
            sessionStorage.setItem('user', JSON.stringify(foundUser));
            setAuthError(null);
            setCurrentDashboardView('HOME'); // Reset view on login
        } else {
            setAuthError('Usuario no encontrado o credenciales incorrectas.');
        }
    };
    
    const handleLogout = () => {
        setUser(null);
        sessionStorage.removeItem('user');
        setPage('landing');
        setCurrentDashboardView('HOME');
        setSelectedOrderId(null);
    };

    const handleSupplierSelectOrder = (orderId: string) => {
        setSelectedOrderId(orderId);
        setCurrentDashboardView('QUOTE_DETAIL');
    };

    // Modified to accept optional order ID for comparison view
    const handleDashboardNavigate = (view: string, orderId?: string) => {
        if (orderId) setSelectedOrderId(orderId);
        setCurrentDashboardView(view as DashboardView);
    };
    
    // Router logic for dashboard content
    const renderDashboardContent = () => {
        if (!user) return null;

        // Settings is common for all
        if (currentDashboardView === 'SETTINGS') {
             return <SettingsPage user={user} />;
        }

        switch (user.role) {
            case UserRole.ADMIN:
                if (currentDashboardView === 'QUOTES') {
                    // This is technically unused by admin now but kept for safety
                    return <SupplierOrdersList onSelectOrder={handleSupplierSelectOrder} />;
                }
                if (currentDashboardView === 'QUOTE_DETAIL' && selectedOrderId) {
                     return <QuoteRequestView orderId={selectedOrderId} onBack={() => setCurrentDashboardView('OPERATIONS')} />;
                }
                if (currentDashboardView === 'QUOTE_COMPARISON' && selectedOrderId) {
                    return <QuoteComparisonView orderId={selectedOrderId} onBack={() => setCurrentDashboardView('OPERATIONS')} />;
                }
                return <AdminDashboard activeView={currentDashboardView} onNavigate={handleDashboardNavigate} />;
            
            case UserRole.SUPPLIER:
                if (currentDashboardView === 'QUOTE_DETAIL' && selectedOrderId) {
                    return <QuoteRequestView orderId={selectedOrderId} onBack={() => setCurrentDashboardView('QUOTES')} />;
                }
                if (currentDashboardView === 'HOME') {
                    return <SupplierDashboard onNavigate={(v) => setCurrentDashboardView(v as DashboardView)} />;
                }
                if (currentDashboardView === 'SHIPMENTS') {
                    return <SupplierShipments onBack={() => setCurrentDashboardView('HOME')} />;
                }
                if (currentDashboardView === 'QUOTES') {
                   return <SupplierOrdersList onSelectOrder={handleSupplierSelectOrder} />;
                }
                return <SupplierDashboard onNavigate={(v) => setCurrentDashboardView(v as DashboardView)} />; // Default
            
            case UserRole.CLIENT:
            default:
                return <ClientDashboard user={user} activeView={currentDashboardView} onNavigate={(v) => setCurrentDashboardView(v as DashboardView)} />;
        }
    };

    // If user is logged in, show the Dashboard with Sidebar
    if (user) {
        return (
            <div className="flex min-h-screen bg-slate-50 font-sans">
                <NotificationCenter />
                <Sidebar 
                    user={user} 
                    currentView={currentDashboardView} 
                    onNavigate={(view) => setCurrentDashboardView(view as DashboardView)} 
                    onLogout={handleLogout}
                    isMobileOpen={isMobileMenuOpen}
                    setIsMobileOpen={setIsMobileMenuOpen}
                />

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Mobile Header */}
                    <header className="md:hidden bg-white shadow-sm border-b border-gray-200 flex items-center justify-between p-4">
                        <div className="flex items-center gap-2">
                            <BookOpenIcon className="w-6 h-6 text-teal-600"/>
                            <span className="font-bold text-gray-900">Proveemus</span>
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                    </header>

                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                         <motion.div 
                            key={currentDashboardView}
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.3 }}
                         >
                            {renderDashboardContent()}
                        </motion.div>
                    </main>
                </div>
            </div>
        );
    }
    
    // Auth & Landing Pages
    const AuthPageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <nav className="bg-white shadow-sm border-b border-teal-100">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                   <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setPage('landing')}>
                     <BookOpenIcon className="h-8 w-8 text-teal-600" />
                     <span className="text-2xl font-bold text-gray-900">Proveemus</span>
                   </div>
                </div>
            </nav>
            <div className="flex-grow flex items-center justify-center p-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={page}
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        className="w-full"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </div>
         </div>
    );
    
    const renderPage = () => {
        switch (page) {
            case 'login':
                return (
                    <AuthPageLayout>
                        <div className="flex justify-center w-full">
                           <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setPage('register')} error={authError} />
                        </div>
                    </AuthPageLayout>
                );
            case 'register':
                return (
                    <AuthPageLayout>
                         <div className="flex justify-center w-full">
                           <RegisterPage onRegister={() => setPage('login')} onSwitchToLogin={() => setPage('login')} />
                        </div>
                    </AuthPageLayout>
               );
            case 'landing':
            default:
                return <LandingPage onNavigateToLogin={() => setPage('login')} onNavigateToRegister={() => setPage('register')} />;
        }
    }

    return (
         <AnimatePresence mode="wait">
            <motion.div
                key={page}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                {renderPage()}
            </motion.div>
        </AnimatePresence>
    );
};

export default App;
