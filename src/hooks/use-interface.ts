import { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';

/**
 * Hook personnalisé pour gérer l'interface active (admin ou employé)
 * Il fournit des fonctions utilitaires pour déterminer le type d'interface et naviguer entre elles
 */
export function useInterface() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Détecte si le chemin actuel est une route employé
  const isEmployeePath = location.pathname.startsWith('/employee');
  
  // Détermine si l'utilisateur est dans l'interface employé
  const isEmployeeInterface = auth?.interface === 'employee';
  
  // Détermine si l'utilisateur est dans l'interface admin
  const isAdminInterface = auth?.interface === 'admin';
  
  // Fonction pour naviguer vers l'interface employé
  const navigateToEmployee = (path = '/employee/dashboard') => {
    if (auth?.isLoggedIn) {
      console.log(`[useInterface] Navigation vers interface employé: ${path}`);
      auth.setInterface('employee');
      navigate(path);
    } else {
      console.log('[useInterface] Utilisateur non connecté, redirection vers login');
      navigate('/login');
    }
  };
  
  // Fonction pour naviguer vers l'interface admin
  const navigateToAdmin = (path = '/dashboard') => {
    if (auth?.isLoggedIn) {
      console.log(`[useInterface] Navigation vers interface admin: ${path}`);
      
      // Si c'est le chemin /employees, assurons-nous de bien forcer l'interface admin
      if (path === '/employees') {
        console.log('[useInterface] Chemin /employees détecté - Forçage de l\'interface admin');
        auth.setInterface('admin');
        // Court délai pour s'assurer que l'état est mis à jour avant la navigation
        setTimeout(() => navigate(path), 50);
      } else {
        // Navigation normale
        auth.setInterface('admin');
        navigate(path);
      }
    } else {
      console.log('[useInterface] Utilisateur non connecté, redirection vers login');
      navigate('/login');
    }
  };
  
  // Fonction pour naviguer vers la bonne interface en fonction du rôle actuel
  const navigateToCorrectInterface = () => {
    if (isEmployeeInterface) {
      console.log('[useInterface] Redirection vers interface employé (interface courante)');
      navigateToEmployee();
    } else if (isAdminInterface) {
      console.log('[useInterface] Redirection vers interface admin (interface courante)');
      navigateToAdmin();
    } else {
      console.log('[useInterface] Interface non définie, redirection vers login');
      navigate('/login');
    }
  };
  
  // Vérifie si le chemin correspond à l'interface active
  const isPathMatchingInterface = () => {
    if (isEmployeePath && isAdminInterface) {
      return false; // Chemin employé mais interface admin
    }
    if (!isEmployeePath && isEmployeeInterface) {
      return false; // Chemin admin mais interface employé
    }
    return true; // Le chemin correspond à l'interface
  };
  
  // Effet pour synchroniser l'interface et le chemin actuel
  useEffect(() => {
    if (!auth?.isLoggedIn) return;
    
    const publicPages = ['/', '/login', '/mobile-emulator'];
    if (publicPages.includes(location.pathname)) return;
    
    // Cette partie est purement informative pour les logs de débogage
    if (isEmployeePath && !isEmployeeInterface) {
      console.log(`[useInterface] SYNC: Route employé (${location.pathname}) avec interface admin - mise à jour vers employé`);
    } else if (!isEmployeePath && !publicPages.includes(location.pathname) && !isAdminInterface) {
      console.log(`[useInterface] SYNC: Route admin (${location.pathname}) avec interface employé - mise à jour vers admin`);
    }
    
    // Redirection automatique seulement quand explicitly demandé via URL "/employees"
    if (location.pathname === '/employees' && isEmployeeInterface) {
      console.log('[useInterface] Correction automatique: /employees en interface employé -> changement vers admin');
      auth.setInterface('admin');
    }
  }, [auth, isEmployeePath, location.pathname, isEmployeeInterface, isAdminInterface]);
  
  return {
    isEmployeePath,
    isEmployeeInterface,
    isAdminInterface,
    navigateToEmployee,
    navigateToAdmin,
    navigateToCorrectInterface,
    isPathMatchingInterface
  };
} 