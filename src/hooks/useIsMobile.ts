import { useState, useEffect } from 'react';

// Hook personnalisé pour détecter les appareils mobiles
const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Vérifier la taille d'écran lors du chargement
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Vérifier initialement
    checkIsMobile();

    // Ajouter un écouteur pour les changements de taille d'écran
    window.addEventListener('resize', checkIsMobile);

    // Nettoyer l'écouteur lors du démontage
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
};

export default useIsMobile; 