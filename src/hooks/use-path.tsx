import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export function usePathname() {
  const location = useLocation();
  
  const pathname = useMemo(() => {
    return location.pathname;
  }, [location.pathname]);
  
  return pathname;
} 