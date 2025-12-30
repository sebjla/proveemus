
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { supabase } from './lib/supabase'; // No longer directly used for auth
import type { User } from './types';
import { UserRole } from './types';
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
    const [registerRole, setRegisterRole] = useState<UserRole>(UserRole.CLIENT);
    const [isLoading, setIsLoading] = useState(true); // Keep isLoading for initial app load
    
    // Dashboard Navigation State
    const [currentDashboardView, setCurrentDashboardView] = useState<DashboardView>('HOME');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null); // Order IDs from routes/UI are handled as strings
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        // LocalStorage-based session check
        const checkLocalSession = () => {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                try {
                    const parsedUser: User = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setPage('login'); // Assume if user is logged in, they are past landing
                } catch (e) {
                    console.error("Failed to parse user from localStorage", e);
                    localStorage.removeItem('currentUser');
                }
            }
            setIsLoading(false);
        };

        checkLocalSession();

        // Simulate auth state change listener (can be extended if needed for real-time local storage changes)
        const handleStorageChange = () => {
            checkLocalSession();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleLogin = (loggedUser: User) => {
        setUser(loggedUser);
        setAuthError(null);
        setCurrentDashboardView('HOME'); 
    };
    
    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        setUser(null);
        setPage('landing');
        setCurrentDashboardView('HOME'); // Reset view on logout
    };

    const handleNavigateToRegister = (role?: UserRole) => {
        if (role) setRegisterRole(role);
        setPage('register');
    };

    const handleSupplierSelectOrder = (orderId: string) => {
        setSelectedOrderId(orderId);
        setCurrentDashboardView('QUOTE_DETAIL');
    };

    const handleDashboardNavigate = (view: string, orderId?: string) => {
        if (orderId) setSelectedOrderId(orderId);
        setCurrentDashboardView(view as DashboardView);
    };
    
    const renderDashboardContent = () => {
        if (!user) return null;

        if (currentDashboardView === 'SETTINGS') {
             return <SettingsPage user={user} />;
        }

        switch (user.role) {
            case UserRole.ADMIN:
                if (currentDashboardView === 'QUOTES') {
                    // This section would typically list orders for suppliers to quote
                    // For Admin, it might be a different view, or this is a placeholder
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
                    return <SupplierDashboard user={user} onNavigate={(v) => setCurrentDashboardView(v as DashboardView)} />;
                }
                if (currentDashboardView === 'SHIPMENTS') {
                    return <SupplierShipments onBack={() => setCurrentDashboardView('HOME')} />;
                }
                if (currentDashboardView === 'QUOTES') {
                   return <SupplierOrdersList onSelectOrder={handleSupplierSelectOrder} />;
                }
                return <SupplierDashboard user={user} onNavigate={(v) => setCurrentDashboardView(v as DashboardView)} />; 
            
            case UserRole.CLIENT:
            default:
                return <ClientDashboard user={user} activeView={currentDashboardView} onNavigate={(v) => setCurrentDashboardView(v as DashboardView)} />;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                    <p className="text-teal-900 font-black tracking-widest uppercase text-xs">Cargando aplicación...</p>
                </div>
            </div>
        );
    }

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
                           <RegisterPage 
                            initialRole={registerRole}
                            onRegister={() => setPage('login')} 
                            onSwitchToLogin={() => setPage('login')} 
                           />
                        </div>
                    </AuthPageLayout>
               );
            case 'landing':
            default:
                return (
                    <LandingPage 
                        onNavigateToLogin={() => setPage('login')} 
                        onNavigateToRegister={handleNavigateToRegister} 
                    />
                );
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