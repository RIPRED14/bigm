import React, { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useInterface } from '@/hooks/use-interface';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Settings,
  Home,
  Bell,
  ArrowLeftRight,
  User,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { AuthContext } from '@/App';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface TabItem {
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
  path: string;
  notification?: number;
}

// Configuration des onglets pour l'interface manager
const managerTabs: TabItem[] = [
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    activeIcon: <LayoutDashboard className="h-5 w-5" />,
    label: 'Dashboard',
    path: '/dashboard'
  },
  {
    icon: <Users className="h-5 w-5" />,
    activeIcon: <Users className="h-5 w-5" />,
    label: 'Employés',
    path: '/employees'
  },
  {
    icon: <CalendarDays className="h-5 w-5" />,
    activeIcon: <CalendarDays className="h-5 w-5" />,
    label: 'Planning',
    path: '/daily-planning'
  },
  {
    icon: <Settings className="h-5 w-5" />,
    activeIcon: <Settings className="h-5 w-5" />,
    label: 'Réglages',
    path: '/settings'
  }
];

// Configuration des onglets pour l'interface employé
const employeeTabs: TabItem[] = [
  {
    icon: <Home className="h-5 w-5" />,
    activeIcon: <Home className="h-5 w-5 text-primary" />,
    label: 'Accueil',
    path: '/employee/dashboard'
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    activeIcon: <Calendar className="h-5 w-5 text-primary" />,
    label: 'Planning',
    path: '/employee/shifts'
  },
  {
    icon: <ArrowLeftRight className="h-5 w-5" />,
    activeIcon: <ArrowLeftRight className="h-5 w-5 text-primary" />,
    label: 'Échanges',
    path: '/employee/exchanges',
    notification: 2  // Exemple de notification
  },
  {
    icon: <User className="h-5 w-5" />,
    activeIcon: <User className="h-5 w-5 text-primary" />,
    label: 'Profil',
    path: '/employee/profile'
  }
];

export const BottomTabBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const auth = useContext(AuthContext);
  const { isAdminInterface, navigateToAdmin, navigateToEmployee } = useInterface();
  
  // Si nous ne sommes pas sur mobile, ne pas afficher la barre d'onglets
  if (!isMobile) return null;
  
  // Si nous sommes sur la page d'accueil ou de connexion, ne pas afficher la barre d'onglets
  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/mobile-emulator') {
    return null;
  }
  
  // Si l'utilisateur n'est pas connecté, ne pas afficher la barre d'onglets
  if (!auth?.isLoggedIn) {
    return null;
  }
  
  // Sélectionner les onglets en fonction de l'interface active, pas du chemin
  const tabs = isAdminInterface ? managerTabs : employeeTabs;
  
  // Fonction pour gérer la navigation tout en préservant l'interface
  const handleNavigation = (path: string) => {
    // Cas particulier pour le chemin "employees" - forcer l'interface admin
    if (path === '/employees') {
      console.log('BottomTabBar: Navigation forcée vers interface admin pour /employees');
      if (auth) {
        auth.setInterface('admin');
        // Donner un court délai avant la navigation pour s'assurer que l'état est bien mis à jour
        setTimeout(() => navigate(path), 50);
      } else {
        navigate(path);
      }
      return;
    }
    
    // Si le chemin commence par /employee mais que nous sommes en interface admin
    if (path.startsWith('/employee') && isAdminInterface) {
      navigateToEmployee(path);
    } 
    // Si le chemin ne commence pas par /employee mais que nous sommes en interface employé
    else if (!path.startsWith('/employee') && !isAdminInterface) {
      navigateToAdmin(path);
    }
    // Navigation normale dans la même interface
    else {
      navigate(path);
    }
  };
  
  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 shadow-md"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 20 }}
    >
      <div className="grid grid-cols-4 h-14 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || 
                         (tab.path !== '/' && location.pathname.startsWith(tab.path));
          
          return (
            <motion.button
              key={tab.path}
              onClick={() => handleNavigation(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center relative py-1.5",
                "transition-all duration-200 ease-in-out",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              whileTap={{ scale: 0.9 }}
            >
              <div className="relative">
                <AnimatePresence mode="wait">
                  {isActive ? (
                    <motion.div
                      key="active"
                      className="absolute -inset-1.5 bg-primary/10 rounded-full"
                      layoutId="tabHighlight"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", damping: 15 }}
                    />
                  ) : null}
                </AnimatePresence>
                <div className="relative z-10">
                  {isActive ? 
                    <div className="text-primary">{tab.activeIcon}</div> : 
                    <div>{tab.icon}</div>}
                  {tab.notification && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 p-0 flex items-center justify-center text-[9px] font-bold"
                    >
                      {tab.notification}
                    </Badge>
                  )}
                </div>
              </div>
              <span className={cn(
                "text-[10px] mt-0.5 font-medium transition-all",
                isActive ? "opacity-100 font-semibold" : "opacity-80"
              )}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div 
                  className="absolute bottom-0 h-0.5 w-8 bg-primary rounded-full" 
                  layoutId="activeIndicator"
                  transition={{ type: "spring", damping: 15 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BottomTabBar; 