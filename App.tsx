
import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion'; // Temporarily commented out for diagnostics
// import { supabase } from './lib/supabase'; // Temporarily commented out for diagnostics
// import type { User } from './types'; // Temporarily commented out for diagnostics
// import { UserRole } from './types'; // Temporarily commented out for diagnostics
// import { LoginPage } from './components/LoginPage'; // Temporarily commented out for diagnostics
// import { RegisterPage } from './components/RegisterPage'; // Temporarily commented out for diagnostics
// import { ClientDashboard } from './components/ClientDashboard'; // Temporarily commented out for diagnostics
// import AdminDashboard from './components/AdminDashboard'; // Temporarily commented out for diagnostics
// import { SupplierOrdersList } from './components/SupplierOrdersList'; // Temporarily commented out for diagnostics
// import { SupplierDashboard } from './components/SupplierDashboard'; // Temporarily commented out for diagnostics
// import { SupplierShipments } from './components/SupplierShipments'; // Temporarily commented out for diagnostics
// import { QuoteRequestView } from './components/QuoteRequestView'; // Temporarily commented out for diagnostics
// import { QuoteComparisonView } from './components/QuoteComparisonView'; // Temporarily commented out for diagnostics
import { BookOpenIcon } from './components/icons/BookOpenIcon';
// import { LandingPage } from './components/LandingPage'; // Temporarily commented out for diagnostics
// import { Sidebar } from './components/Sidebar'; // Temporarily commented out for diagnostics
// import { SettingsPage } from './components/SettingsPage'; // Temporarily commented out for diagnostics
// import { NotificationCenter } from './components/NotificationCenter'; // Temporarily commented out for diagnostics

// type Page = 'landing' | 'login' | 'register'; // Temporarily commented out for diagnostics
// type DashboardView = 'HOME' | 'SETTINGS' | 'QUOTES' | 'NEW_ORDER' | 'HISTORY' | 'OPERATIONS' | 'USERS' | 'QUOTE_DETAIL' | 'QUOTE_COMPARISON' | 'SHIPMENTS'; // Temporarily commented out for diagnostics

// const pageVariants = { // Temporarily commented out for diagnostics
//     initial: { opacity: 0, x: -50 },
//     in: { opacity: 1, x: 0 },
//     out: { opacity: 0, x: 50 },
// };

// const pageTransition = { // Temporarily commented out for diagnostics
//     type: 'tween',
//     ease: 'anticipate',
//     duration: 0.5,
// } as const;

const App: React.FC = () => {
    // const [user, setUser] = useState<User | null>(null); // Temporarily commented out for diagnostics
    // const [page, setPage] = useState<Page>('landing'); // Temporarily commented out for diagnostics
    // const [authError, setAuthError] = useState<string | null>(null); // Temporarily commented out for diagnostics
    // const [registerRole, setRegisterRole] = useState<UserRole>(UserRole.CLIENT); // Temporarily commented out for diagnostics
    const [isLoading, setIsLoading] = useState(true);
    const [apiKeyStatus, setApiKeyStatus] = useState<string>('Verificando...');

    // // Dashboard Navigation State // Temporarily commented out for diagnostics
    // const [currentDashboardView, setCurrentDashboardView] = useState<DashboardView>('HOME');
    // const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null); // Order IDs from routes/UI are handled as strings
    // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Diagnostic: Check API Key presence
        const apiKey = process.env.API_KEY;
        if (apiKey && apiKey.length > 0) {
            setApiKeyStatus('API_KEY cargada correctamente.');
            console.log('API_KEY está presente.');
        } else {
            setApiKeyStatus('ADVERTENCIA: API_KEY NO está configurada. La funcionalidad de Gemini no estará disponible. Por favor, configura la variable de entorno API_KEY en tu hosting (Hostinger).');
            console.error('API_KEY no encontrada. Por favor, asegúrate de que la variable de entorno API_KEY esté configurada.');
        }
        setIsLoading(false);

        // // Original logic (commented out for diagnostic purposes)
        // const checkSession = async () => {
        //     const { data: { session } } = await supabase.auth.getSession();
        //     if (session) {
        //         const { data: profile } = await supabase
        //             .from('profiles')
        //             .select('*')
        //             .eq('id', session.user.id)
        //             .single();
                
        //         if (profile) {
        //             setUser({
        //                 id: profile.id, // profile.id is string (UUID)
        //                 email: profile.email,
        //                 role: profile.role as UserRole,
        //                 schoolName: profile.school_name,
        //                 address: profile.address,
        //                 cuit: profile.cuit,
        //                 taxStatus: profile.tax_status
        //             });
        //         }
        //     }
        //     setIsLoading(false);
        // };

        // checkSession();

        // const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        //     if (event === 'SIGNED_IN' && session) {
        //         const { data: profile } = await supabase
        //             .from('profiles')
        //             .select('*')
        //             .eq('id', session.user.id)
        //             .single();
                
        //         if (profile) {
        //             setUser({
        //                 id: profile.id, // profile.id is string (UUID)
        //                 email: profile.email,
        //                 role: profile.role as UserRole,
        //                 schoolName: profile.school_name,
        //                 address: profile.address,
        //                 cuit: profile.cuit,
        //                 taxStatus: profile.tax_status
        //             });
        //         }
        //     } else if (event === 'SIGNED_OUT') {
        //         setUser(null);
        //         setPage('landing');
        //     }
        // });

        // return () => subscription.unsubscribe();
    }, []);

    // const handleLogin = async (email: string, pass: string) => { // Temporarily commented out for diagnostics
    //     setAuthError(null);
    //     const { error } = await supabase.auth.signInWithPassword({
    //         email,
    //         password: pass,
    //     });
        
    //     if (error) {
    //         setAuthError(error.message);
    //     } else {
    //         setCurrentDashboardView('HOME'); 
    //     }
    // };
    
    // const handleLogout = async () => { // Temporarily commented out for diagnostics
    //     await supabase.auth.signOut();
    // };

    // const handleNavigateToRegister = (role?: UserRole) => { // Temporarily commented out for diagnostics
    //     if (role) setRegisterRole(role);
    //     setPage('register');
    // };

    // const handleSupplierSelectOrder = (orderId: string) => { // Temporarily commented out for diagnostics
    //     setSelectedOrderId(orderId);
    //     setCurrentDashboardView('QUOTE_DETAIL');
    // };

    // const handleDashboardNavigate = (view: string, orderId?: string) => { // Temporarily commented out for diagnostics
    //     if (orderId) setSelectedOrderId(orderId);
    //     setCurrentDashboardView(view as DashboardView);
    // };
    
    // const renderDashboardContent = () => { // Temporarily commented out for diagnostics
    //     if (!user) return null;

    //     if (currentDashboardView === 'SETTINGS') {
    //          return <SettingsPage user={user} />;
    //     }

    //     switch (user.role) {
    //         case UserRole.ADMIN:
    //             if (currentDashboardView === 'QUOTES') {
    //                 return <SupplierOrdersList onSelectOrder={handleSupplierSelectOrder} />;
    //             }
    //             if (currentDashboardView === 'QUOTE_DETAIL' && selectedOrderId) {
    //                  return <QuoteRequestView orderId={selectedOrderId} onBack={() => setCurrentDashboardView('OPERATIONS')} />;
    //             }
    //             if (currentDashboardView === 'QUOTE_COMPARISON' && selectedOrderId) {
    //                 return <QuoteComparisonView orderId={selectedOrderId} onBack={() => setCurrentDashboardView('OPERATIONS')} />;
    //             }
    //             return <AdminDashboard activeView={currentDashboardView} onNavigate={handleDashboardNavigate} />;
            
    //         case UserRole.SUPPLIER:
    //             if (currentDashboardView === 'QUOTE_DETAIL' && selectedOrderId) {
    //                 return <QuoteRequestView orderId={selectedOrderId} onBack={() => setCurrentDashboardView('QUOTES')} />;
    //             }
    //             if (currentDashboardView === 'HOME') {
    //                 return <SupplierDashboard user={user} onNavigate={(v) => setCurrentDashboardView(v as DashboardView)} />;
    //             }
    //             if (currentDashboardView === 'SHIPMENTS') {
    //                 return <SupplierShipments onBack={() => setCurrentDashboardView('HOME')} />;
    //             }
    //             if (currentDashboardView === 'QUOTES') {
    //                return <SupplierOrdersList onSelectOrder={handleSupplierSelectOrder} />;
    //             }
    //             return <SupplierDashboard user={user} onNavigate={(v) => setCurrentDashboardView(v as DashboardView)} />; 
            
    //         case UserRole.CLIENT:
    //         default:
    //             return <ClientDashboard user={user} activeView={currentDashboardView} onNavigate={(v) => setCurrentDashboardView(v as DashboardView)} />;
    //     }
    // };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                    <p className="text-teal-900 font-black tracking-widest uppercase text-xs">Cargando...</p>
                </div>
            </div>
        );
    }

    // Diagnostic UI
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="flex items-center space-x-2 mb-6">
                <BookOpenIcon className="h-10 w-10 text-teal-600" />
                <h1 className="text-4xl font-black text-gray-900">Proveemus</h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Hola Mundo - Diagnóstico de Despliegue</h2>
            <p className="text-lg text-gray-600 mb-6">Este es un componente de prueba para verificar la carga de tu aplicación React.</p>
            
            <div className={`p-4 rounded-lg shadow-md max-w-lg ${
                apiKeyStatus.includes('ADVERTENCIA') ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-green-100 text-green-800 border border-green-300'
            }`}>
                <p className="font-semibold">{apiKeyStatus}</p>
                {apiKeyStatus.includes('ADVERTENCIA') && (
                    <p className="mt-2 text-sm">Asegúrate de configurar la variable de entorno `API_KEY` en la sección de configuración de tu hosting para que Gemini funcione.</p>
                )}
            </div>

            <p className="mt-8 text-sm text-gray-500">Si ves este mensaje, React y Vite están funcionando correctamente.</p>
            <p className="text-sm text-gray-500">Por favor, revisa el estado de la API_KEY arriba.</p>
        </div>
    );
};

export default App;