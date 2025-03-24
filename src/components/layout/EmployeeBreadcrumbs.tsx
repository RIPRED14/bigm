import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home, User, Calendar, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Type pour les props du composant
interface EmployeeBreadcrumbsProps {
  className?: string;
}

// Configuration des chemins pour les breadcrumbs
const routes: Record<string, { label: string; icon?: React.ReactNode }> = {
  'employee': { label: 'Espace employé', icon: <User className="h-4 w-4" /> },
  'employee/dashboard': { label: 'Tableau de bord', icon: <Home className="h-4 w-4" /> },
  'employee/shifts': { label: 'Mon planning', icon: <Calendar className="h-4 w-4" /> },
  'employee/exchanges': { label: 'Échanges de shifts', icon: <ArrowLeftRight className="h-4 w-4" /> },
  'employee/profile': { label: 'Mon profil', icon: <User className="h-4 w-4" /> },
};

// Fonction pour obtenir les breadcrumbs en fonction du chemin actuel
const getEmployeeBreadcrumbs = (pathname: string) => {
  const parts = pathname.split('/').filter(Boolean);
  
  // Si ce n'est pas une route employé, ne pas afficher de breadcrumbs
  if (parts[0] !== 'employee') return [];
  
  // Récupérer le nom de la page actuelle (dernier segment du chemin)
  const currentPage = parts[parts.length - 1];
  
  // Définir les noms lisibles pour chaque route
  const routeNames: Record<string, string> = {
    dashboard: 'Tableau de bord',
    shifts: 'Mon planning',
    absences: 'Absences & Échanges',
    profile: 'Mon profil',
    notifications: 'Notifications',
    exchange: 'Échange de shift',
    'absence/new': 'Nouvelle absence',
  };
  
  // Créer les breadcrumbs
  const breadcrumbs = [
    {
      name: 'Accueil',
      path: '/employee/dashboard',
      current: currentPage === 'dashboard',
    }
  ];
  
  // Ajouter la page actuelle (sauf si c'est le dashboard)
  if (currentPage !== 'dashboard') {
    // Gérer les cas spéciaux (sous-pages)
    const pathForBreadcrumb = parts.slice(1).join('/');
    
    breadcrumbs.push({
      name: routeNames[pathForBreadcrumb] || 'Page',
      path: pathname,
      current: true,
    });
  }
  
  return breadcrumbs;
};

const EmployeeBreadcrumbs: React.FC<EmployeeBreadcrumbsProps> = ({ className }) => {
  const location = useLocation();
  const breadcrumbs = getEmployeeBreadcrumbs(location.pathname);
  
  // Ne pas afficher de breadcrumbs si ce n'est pas une route employé
  if (breadcrumbs.length === 0) return null;
  
  return (
    <nav className={cn('flex', className)} aria-label="Breadcrumbs">
      <ol className="flex items-center space-x-1 text-sm text-muted-foreground">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground/50" />
            )}
            
            <Link
              to={breadcrumb.path}
              className={cn(
                'flex items-center hover:text-foreground transition-colors',
                breadcrumb.current ? 'font-medium text-foreground' : ''
              )}
              aria-current={breadcrumb.current ? 'page' : undefined}
            >
              {index === 0 && <Home className="mr-1 h-3.5 w-3.5" />}
              {breadcrumb.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default EmployeeBreadcrumbs; 