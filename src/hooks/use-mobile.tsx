import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Utiliser null comme valeur initiale pour éviter les conflits hydration/SSR
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Fonction pour vérifier si on est sur mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Vérifier immédiatement au chargement
    checkMobile()

    // Utiliser addEventListener au lieu de MediaQueryList pour une meilleure compatibilité
    window.addEventListener('resize', checkMobile)
    
    // Nettoyer
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Forcer la vérification directement pour éviter le décalage lors du rendu initial
  // Cette vérification directe aide à résoudre les problèmes lors du premier rendu
  const forcedCheck = React.useMemo(() => 
    typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT, 
    [isMobile]
  )

  return forcedCheck || isMobile
}
