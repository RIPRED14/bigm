import React, { useState, useContext } from 'react';
import { Link, useLocation, NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Home,
  Calendar,
  Clock,
  User,
  Bell,
  Menu,
  LogOut,
  Settings,
  HelpCircle,
  ArrowLeftRight,
  CalendarDays,
  ChevronLeft,
  MessageSquare,
  Server,
  ExternalLink,
  Utensils,
} from 'lucide-react';
import { AuthContext } from "@/App";
import { useIsMobile } from '@/hooks/use-mobile';
import { useInterface } from '@/hooks/use-interface';
import { motion, AnimatePresence } from 'framer-motion';

// Type pour les liens de navigation
interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: number | null;
}

// Configuration des liens de navigation pour les employés
const navItems: NavItem[] = [
  {
    title: 'Tableau de bord',
    href: '/employee/dashboard',
    icon: <Home className="w-5 h-5" />,
  },
  {
    title: 'Mon planning',
    href: '/employee/shifts',
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    title: 'Échanges de shifts',
    href: '/employee/exchanges',
    icon: <ArrowLeftRight className="w-5 h-5" />,
    badge: 2, // Example badge for demonstration
  },
  {
    title: 'Recettes',
    href: '/employee/recipes',
    icon: <Utensils className="w-5 h-5" />,
  },
  {
    title: 'Mon profil',
    href: '/employee/profile',
    icon: <User className="w-5 h-5" />,
  },
];

// Données mockées pour l'utilisateur connecté
const currentUser = {
  name: 'Reda',
  avatarUrl: '',
  role: 'Employé', // Pour différencier d'un manager
};

const EmployeeNavBar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { navigateToAdmin } = useInterface();
  
  // Vérifier si le lien est actif
  const isActive = (path: string): boolean => 
    path === location.pathname || 
    (path !== '/employee' && 
     location.pathname.startsWith(path)) || 
    (path === '/employee' && 
     location.pathname.startsWith('/employee/'));
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const handleLogout = () => {
    if (auth) {
      auth.setIsLoggedIn(false);
      auth.setInterface(null);
    }
    navigate('/login');
  };
  
  // Composant pour les notifications
  const NotificationIndicator = () => {
    // 3 notifications non lues (mock)
    const unreadCount = 3;
    
    // Définition de mock notifications avec priorité
    const notifications = [
      {
        id: '1',
        title: 'Modification de planning',
        description: 'Votre shift du 12 juin a été modifié.',
        time: 'Il y a 20 minutes',
        icon: <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />,
        priority: 'medium',
        link: '/employee/shifts'
      },
      {
        id: '2',
        title: 'Demande d\'échange',
        description: 'Marie C. vous propose un échange pour le 15 juin.',
        time: 'Il y a 1 heure',
        icon: <ArrowLeftRight className="h-5 w-5 text-orange-500 mt-0.5" />,
        priority: 'high',
        link: '/employee/exchanges'
      },
      {
        id: '3',
        title: 'Nouveau message du manager',
        description: 'Concernant votre prochaine formation.',
        time: 'Hier',
        icon: <Bell className="h-5 w-5 text-primary mt-0.5" />,
        priority: 'low',
        link: '/employee/dashboard'
      },
    ];
    
    const getPriorityClass = (priority: string) => {
      switch(priority) {
        case 'high': return 'border-l-4 border-l-red-500';
        case 'medium': return 'border-l-4 border-l-orange-400';
        case 'low': return 'border-l-4 border-l-blue-400';
        default: return '';
      }
    };
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>
              {unreadCount > 0 
                ? `Vous avez ${unreadCount} nouvelle${unreadCount > 1 ? 's' : ''} notification${unreadCount > 1 ? 's' : ''}.` 
                : 'Aucune nouvelle notification.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 max-h-[60vh] overflow-auto py-1">
            {notifications.map(notification => (
              <Link 
                key={notification.id} 
                to={notification.link} 
                className={cn(
                  "flex items-start gap-3 p-3 rounded-md hover:bg-primary/5 transition-colors",
                  getPriorityClass(notification.priority)
                )}
              >
                <div className="flex-shrink-0 rounded-full bg-muted p-2">
                  {notification.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground">{notification.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Composant pour la navigation desktop
  const DesktopNav = () => (
    <div className="hidden md:flex h-16 items-center justify-between px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="flex items-center">
        <Link to="/employee/dashboard" className="mr-6 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            B
          </div>
          <span className="font-bold">BurgerStaff</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={isActive(item.href) ? "default" : "ghost"}
              className={cn(
                "text-sm gap-1 relative h-9",
                isActive(item.href) 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-primary/10 hover:text-primary"
              )}
              asChild
            >
              <Link to={item.href}>
                {item.icon}
                <span>{item.title}</span>
                {item.badge && (
                  <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <NotificationIndicator />
        <UserMenu />
      </div>
    </div>
  );
  
  // Composant pour la navigation mobile (header seulement, bottom bar est séparée)
  const MobileNav = () => (
    <div className="md:hidden flex h-14 items-center justify-between px-4 border-b shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/50 fixed top-0 left-0 right-0 z-40">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[250px] sm:w-[300px]">
          <SheetHeader className="border-b pb-4 mb-4">
            <SheetTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                B
              </div>
              <span>BurgerStaff</span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 py-2">
            {navItems.map((item) => (
              <SheetClose asChild key={item.href}>
                <Button
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  className={cn(
                    "justify-start text-base gap-3 h-11 rounded-lg",
                    isActive(item.href) ? "bg-secondary" : ""
                  )}
                  asChild
                >
                  <Link to={item.href}>
                    <div className={cn(
                      "rounded-md p-1.5",
                      isActive(item.href) ? "bg-primary/15 text-primary" : "text-muted-foreground"
                    )}>
                      {item.icon}
                    </div>
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </Button>
              </SheetClose>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex flex-col gap-1">
            <Button 
              variant="ghost" 
              className="justify-start text-base gap-3 h-11 rounded-lg"
              onClick={() => {
                setMenuOpen(false);
                navigateToAdmin();
              }}
            >
              <div className="rounded-md p-1.5 text-muted-foreground">
                <Server className="h-5 w-5" />
              </div>
              <span>Passer en mode Admin</span>
              <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
            </Button>
            
            <Button 
              variant="ghost" 
              className="justify-start text-base gap-3 h-11 rounded-lg"
              onClick={() => {
                setMenuOpen(false);
                navigate('/employee/settings');
              }}
            >
              <div className="rounded-md p-1.5 text-muted-foreground">
                <Settings className="h-5 w-5" />
              </div>
              <span>Paramètres</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="justify-start text-base gap-3 h-11 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
            >
              <div className="rounded-md p-1.5">
                <LogOut className="h-5 w-5" />
              </div>
              <span>Déconnexion</span>
            </Button>
          </div>
          
          <SheetFooter className="absolute bottom-4 left-0 right-0 px-4">
            <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
              <div>BurgerStaff v1.0</div>
              <div>© 2023 BurgerSync</div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      <div className="flex items-center">
        <div className="text-lg font-semibold tracking-tight">
          {getCurrentTitle()}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <AnimatePresence>
          {getBackButton()}
        </AnimatePresence>
        <NotificationIndicator />
      </div>
    </div>
  );
  
  // Fonction pour obtenir le titre de la page courante
  const getCurrentTitle = (): string => {
    const path = location.pathname;
    
    if (path.startsWith('/employee/dashboard')) return 'Tableau de bord';
    if (path.startsWith('/employee/shifts')) return 'Mon planning';
    if (path.startsWith('/employee/exchanges')) return 'Échanges';
    if (path.startsWith('/employee/profile')) return 'Profil';
    if (path.startsWith('/employee/absences')) return 'Absences';
    if (path.startsWith('/employee/recipes')) return 'Recettes';
    
    return 'BurgerStaff';
  };
  
  // Obtenir le bouton retour pour certaines pages
  const getBackButton = () => {
    const path = location.pathname;
    let backPath = '';
    
    if (path.includes('/details')) {
      backPath = path.split('/details')[0];
    }
    
    if (!backPath) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-1"
          onClick={() => navigate(backPath)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </motion.div>
    );
  };
  
  // Composant pour le menu utilisateur
  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{currentUser.name}</span>
            <span className="text-xs text-muted-foreground">{currentUser.role}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/employee/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Mon profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/employee/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigateToAdmin()}>
          <Server className="mr-2 h-4 w-4" />
          <span>Mode Admin</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  
  return (
    <>
      <DesktopNav />
      <MobileNav />
      {/* Ajouter un espaceur pour le header mobile fixe */}
      {isMobile && <div className="h-14" />}
    </>
  );
};

export default EmployeeNavBar; 