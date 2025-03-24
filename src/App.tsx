import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { NavBar } from "./components/layout/NavBar";
import EmployeeNavBar from "./components/layout/EmployeeNavBar";
import BottomTabBar from "./components/layout/BottomTabBar";
import Breadcrumbs from "./components/layout/Breadcrumbs";
import EmployeeBreadcrumbs from "./components/layout/EmployeeBreadcrumbs";
import { useIsMobile } from "@/hooks/use-mobile";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Planning from "./pages/Planning";
import Absences from "./pages/Absences";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Home from "./pages/Home";
import DailyPlanning from "./pages/DailyPlanning";
import MobileView from '@/components/MobileView';

// Import des pages employé
import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeShifts from "./pages/employee/Shifts";
import ShiftExchanges from "./pages/employee/ShiftExchanges";
import EmployeeProfile from "./pages/employee/Profile";

const queryClient = new QueryClient();

// Définir les interfaces pour le contexte d'authentification
interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  interface: 'admin' | 'employee' | null;
  setInterface: React.Dispatch<React.SetStateAction<'admin' | 'employee' | null>>;
}

// Créer le contexte d'authentification
export const AuthContext = React.createContext<AuthContextType | null>(null);

// Composant racine de l'application
const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // État local pour l'authentification (à remplacer par un vrai système d'auth)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    // Utilisation du localStorage pour conserver l'état de connexion
    localStorage.getItem('isLoggedIn') === 'true'
  );
  
  // Interface actuelle (admin ou employee)
  const [userInterface, setUserInterface] = useState<'admin' | 'employee' | null>(() => {
    // Initialisation plus stricte de l'interface
    const storedInterface = localStorage.getItem('interface') as 'admin' | 'employee' | null;
    
    // Si l'utilisateur est connecté mais qu'aucune interface n'est définie,
    // définir une interface par défaut en fonction du chemin actuel
    if (localStorage.getItem('isLoggedIn') === 'true' && !storedInterface) {
      if (window.location.pathname.startsWith('/employee')) {
        return 'employee';
      } else if (window.location.pathname !== '/' && 
                window.location.pathname !== '/login' && 
                window.location.pathname !== '/mobile-emulator') {
        return 'admin';
      }
    }
    
    return storedInterface;
  });
  
  // Enregistrer les changements dans localStorage
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      localStorage.removeItem('isLoggedIn');
    }
    
    if (userInterface) {
      localStorage.setItem('interface', userInterface);
    } else {
      localStorage.removeItem('interface');
    }
  }, [isLoggedIn, userInterface]);
  
  // Protection contre les redirections accidentelles entre les interfaces
  useEffect(() => {
    // Si nous sommes sur la page d'accueil, login ou émulateur mobile, pas de protection
    const publicPages = ['/', '/login', '/mobile-emulator'];
    if (publicPages.includes(location.pathname)) {
      return;
    }
    
    // Si l'utilisateur n'est pas connecté, rediriger vers login
    if (!isLoggedIn) {
      console.log('Utilisateur non connecté, redirection vers login');
      navigate('/login');
      return;
    }
    
    const currentPath = location.pathname;
    const isEmployeePath = currentPath.startsWith('/employee');
    
    // Protection renforcée pour les chemins spécifiques
    // Spécifiquement pour le chemin /employees, forcer l'interface admin
    if (currentPath === '/employees') {
      if (userInterface !== 'admin') {
        console.log('Route /employees: forçage interface admin');
        setUserInterface('admin');
      }
    }
    // Pour tous les autres chemins, synchroniser l'interface avec le chemin
    else if (isEmployeePath && userInterface !== 'employee') {
      console.log('Route employé: forçage interface employé');
      setUserInterface('employee');
    }
    else if (!isEmployeePath && !publicPages.includes(currentPath) && userInterface !== 'admin') {
      console.log('Route admin: forçage interface admin');
      setUserInterface('admin');
    }
    
  }, [location, navigate, isLoggedIn, userInterface]);
  
  // Route spécifique pour les employés, forcer l'interface admin
  useEffect(() => {
    // Ne s'exécute que si l'utilisateur est connecté
    if (!isLoggedIn) return;
    
    // Vérification spécifique pour la route /employees
    if (location.pathname === '/employees') {
      console.log('App.tsx: Route spécifique /employees détectée');
      
      // Si l'interface n'est pas déjà admin, la forcer
      if (userInterface !== 'admin') {
        console.log('App.tsx: Forçage explicite de l\'interface admin pour /employees');
        setUserInterface('admin');
      }
    }
  }, [location.pathname, isLoggedIn, userInterface, setUserInterface]);
  
  // Fonction pour déterminer si on affiche la navbar et les breadcrumbs
  const isAppRoute = (pathname: string): boolean => {
    return pathname !== '/' && pathname !== '/login' && pathname !== '/mobile-emulator';
  };

  // Fonction pour déterminer si c'est une route employé ou manager
  const isEmployeeRoute = (pathname: string): boolean => {
    return pathname === '/employee' || 
           pathname.startsWith('/employee/');
  };

  // Ajout de padding au bas de la page si la barre d'onglets est affichée
  const shouldAddBottomPadding = isAppRoute(location.pathname) && isMobile;

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      setIsLoggedIn, 
      interface: userInterface, 
      setInterface: setUserInterface 
    }}>
      <div className="min-h-screen">
        {isAppRoute(location.pathname) && !isMobile && (
          <>
            {/* Afficher NavBar uniquement pour les routes manager */}
            {!isEmployeeRoute(location.pathname) && <NavBar />}
            
            {/* Afficher EmployeeNavBar uniquement pour les routes employé */}
            {isEmployeeRoute(location.pathname) && <EmployeeNavBar />}
          </>
        )}
        
        <main className={`${isAppRoute(location.pathname) ? (isMobile ? "pt-4" : "pb-12 pt-16") : ""} ${shouldAddBottomPadding ? "pb-20" : ""}`}>
          <div className={isAppRoute(location.pathname) ? (isMobile ? "px-4" : "max-w-7xl mx-auto") : ""}>
            {isAppRoute(location.pathname) && !isMobile && (
              <>
                {/* Afficher Breadcrumbs uniquement pour les routes manager */}
                {!isEmployeeRoute(location.pathname) && (
                  <Breadcrumbs className="mx-4 sm:mx-6 lg:mx-8" />
                )}
                
                {/* Afficher EmployeeBreadcrumbs uniquement pour les routes employé */}
                {isEmployeeRoute(location.pathname) && (
                  <EmployeeBreadcrumbs className="mx-4 sm:mx-6 lg:mx-8" />
                )}
              </>
            )}
            
            {/* Afficher un en-tête adapté au mobile */}
            {isAppRoute(location.pathname) && isMobile && (
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">
                  {!isEmployeeRoute(location.pathname) ? 'BurgerSync' : 'BurgerSync Employee'}
                </h1>
              </div>
            )}
            
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/mobile-emulator" element={<MobileView />} />
              
              {/* Routes admin protégées */}
              <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />} />
              <Route path="/employees" element={isLoggedIn ? <Employees /> : <Navigate to="/login" replace />} />
              <Route path="/planning" element={isLoggedIn ? <Planning /> : <Navigate to="/login" replace />} />
              <Route path="/daily-planning" element={isLoggedIn ? <DailyPlanning /> : <Navigate to="/login" replace />} />
              <Route path="/absences" element={isLoggedIn ? <Absences /> : <Navigate to="/login" replace />} />
              <Route path="/notifications" element={isLoggedIn ? <Notifications /> : <Navigate to="/login" replace />} />
              <Route path="/settings" element={isLoggedIn ? <Settings /> : <Navigate to="/login" replace />} />
              
              {/* Routes employé protégées */}
              <Route path="/employee" element={isLoggedIn ? <Navigate to="/employee/dashboard" replace /> : <Navigate to="/login" replace />} />
              <Route path="/employee/dashboard" element={isLoggedIn ? <EmployeeDashboard /> : <Navigate to="/login" replace />} />
              <Route path="/employee/shifts" element={isLoggedIn ? <EmployeeShifts /> : <Navigate to="/login" replace />} />
              <Route path="/employee/exchanges" element={isLoggedIn ? <ShiftExchanges /> : <Navigate to="/login" replace />} />
              <Route path="/employee/profile" element={isLoggedIn ? <EmployeeProfile /> : <Navigate to="/login" replace />} />
              
              {/* Redirections pour les routes obsolètes */}
              <Route path="/employee/absences" element={<Navigate to="/employee/exchanges" replace />} />
              <Route path="/employee/notifications" element={<Navigate to="/employee/dashboard" replace />} />
              <Route path="/employee/exchange" element={<Navigate to="/employee/exchanges" replace />} />
              
              {/* Route 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
        
        {/* Barre d'onglets inférieure pour mobile */}
        <BottomTabBar />
      </div>
    </AuthContext.Provider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
