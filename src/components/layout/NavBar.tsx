import React, { useContext } from "react";
import { Link, NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePathname } from "@/hooks/use-path";
import { useInterface } from "@/hooks/use-interface";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { 
  CalendarDays, 
  LayoutDashboard, 
  Users, 
  Settings,
  Menu,
  Smartphone,
  LogOut
} from "lucide-react";
import { AuthContext } from "@/App";

// Utility function for class names
const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

export const NavBar: React.FC = () => {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

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

  return (
    <nav className={cn(
      "bg-background border-b border-border sticky top-0 z-50",
      isMobile ? "px-2 py-2" : "px-4 py-3"
    )}>
      <div className={cn(
        "flex items-center",
        isMobile ? "justify-between" : "justify-between"
      )}>
        <div className="flex items-center">
          <Logo className="mr-2" />
          <h1 className={cn(
            "font-bold text-foreground",
            isMobile ? "text-lg" : "text-xl"
          )}>
            BurgerSync
          </h1>
        </div>

        {isMobile ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="ml-auto"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open('/mobile-emulator', '_blank')}
              className="h-8 w-8" 
              title="Voir en mode mobile"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <MainLinks pathname={pathname} />
            <div className="flex items-center gap-2 ml-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/mobile-emulator', '_blank')}
              >
                <Smartphone className="h-4 w-4 mr-1" />
                Vue mobile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Déconnexion
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div className="pt-2 pb-3 space-y-1">
          <MainLinks pathname={pathname} isMobile={true} />
          <div className="pt-2 pb-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start px-3 py-2 text-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  isMobile?: boolean;
}

const NavLinkItem: React.FC<NavLinkProps> = ({
  to,
  icon,
  label,
  active,
  isMobile
}) => {
  const { navigateToAdmin } = useInterface();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Traitement spécial pour la route "/employees"
    if (to === "/employees") {
      console.log('NavBar: Clic sur Employés - forçage interface admin');
      navigateToAdmin(to);
      return;
    }
    
    // Utiliser navigateToAdmin pour rester dans l'interface admin
    navigateToAdmin(to);
  };
  
  return (
    <div onClick={handleClick} className="block cursor-pointer">
      <div
        className={cn(
          "flex items-center px-3 py-2 rounded-md transition-colors",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          isMobile ? "text-sm" : "text-base"
        )}
      >
        {icon}
        <span className={isMobile ? "ml-2" : "ml-3"}>{label}</span>
      </div>
    </div>
  );
};

interface MainLinksProps {
  pathname: string;
  isMobile?: boolean;
}

const MainLinks: React.FC<MainLinksProps> = ({ pathname, isMobile = false }) => {
  const links = [
    {
      to: "/dashboard",
      icon: <LayoutDashboard className={isMobile ? "h-4 w-4" : "h-5 w-5"} />,
      label: "Dashboard",
      active: pathname === "/dashboard"
    },
    {
      to: "/employees",
      icon: <Users className={isMobile ? "h-4 w-4" : "h-5 w-5"} />,
      label: "Employés",
      active: pathname === "/employees"
    },
    {
      to: "/planning",
      icon: <CalendarDays className={isMobile ? "h-4 w-4" : "h-5 w-5"} />,
      label: "Planning",
      active: pathname === "/planning"
    },
    {
      to: "/daily-planning",
      icon: <CalendarDays className={isMobile ? "h-4 w-4" : "h-5 w-5"} />,
      label: "Planning Jour",
      active: pathname === "/daily-planning"
    },
    {
      to: "/settings",
      icon: <Settings className={isMobile ? "h-4 w-4" : "h-5 w-5"} />,
      label: "Réglages",
      active: pathname === "/settings"
    }
  ];

  return (
    <div className={isMobile ? "space-y-1" : "flex items-center space-x-2"}>
      {links.map((link, index) => (
        <NavLinkItem
          key={index}
          to={link.to}
          icon={link.icon}
          label={link.label}
          active={link.active}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
};
