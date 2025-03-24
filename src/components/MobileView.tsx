import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import DeviceEmulator from './DeviceEmulator';
import DailyPlanning from '@/pages/DailyPlanning';
import Employees from '@/pages/Employees';
import Dashboard from '@/pages/Dashboard';

// Force l'utilisation du mode mobile pour les tests
const MobileViewWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Remplace la valeur de retour de useIsMobile par true
  useEffect(() => {
    // Sauvegarde l'implémentation originale de matchMedia
    const originalMatchMedia = window.matchMedia;
    
    // Remplace matchMedia pour simuler un appareil mobile
    window.matchMedia = (query: string): MediaQueryList => {
      if (query.includes('max-width: 640px')) {
        return {
          matches: true,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        } as MediaQueryList;
      }
      
      // Pour les autres requêtes, utilise l'implémentation originale
      return originalMatchMedia(query);
    };
    
    return () => {
      // Restaure l'implémentation originale à la destruction du composant
      window.matchMedia = originalMatchMedia;
    };
  }, []);
  
  return <>{children}</>;
};

const MobileView: React.FC = () => {
  const location = useLocation();
  const [path, setPath] = useState<string>('/daily-planning');
  
  // Change la page en fonction du chemin sélectionné
  const handlePathChange = (newPath: string) => {
    setPath(newPath);
  };
  
  return (
    <DeviceEmulator>
      <MobileViewWrapper>
        <div className="bg-background text-foreground">
          <div className="p-2 border-b flex items-center justify-between">
            <div className="font-medium">Pages</div>
            <div className="flex gap-2">
              <select 
                value={path} 
                onChange={(e) => handlePathChange(e.target.value)}
                className="text-xs p-1 border rounded"
              >
                <option value="/daily-planning">Planning Journalier</option>
                <option value="/employees">Employés</option>
                <option value="/dashboard">Dashboard</option>
              </select>
            </div>
          </div>
          
          {path === '/daily-planning' && <DailyPlanning />}
          {path === '/employees' && <Employees />}
          {path === '/dashboard' && <Dashboard />}
        </div>
      </MobileViewWrapper>
    </DeviceEmulator>
  );
};

export default MobileView; 