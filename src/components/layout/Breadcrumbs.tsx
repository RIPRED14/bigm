
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbsProps {
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ className }) => {
  const location = useLocation();
  
  // Skip rendering breadcrumbs on dashboard
  if (location.pathname === '/dashboard' || location.pathname === '/') {
    return null;
  }

  // Create breadcrumb segments
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Map segment to readable name
  const getReadableName = (segment: string) => {
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <nav className={cn('flex py-3 text-sm text-muted-foreground', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li className="flex items-center">
          <Link
            to="/dashboard"
            className="hover:text-primary transition-colors duration-200"
          >
            Dashboard
          </Link>
        </li>
        
        {pathSegments.map((segment, index) => {
          const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;
          
          return (
            <li key={path} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
              {isLast ? (
                <span className="font-medium text-foreground">
                  {getReadableName(segment)}
                </span>
              ) : (
                <Link
                  to={path}
                  className="hover:text-primary transition-colors duration-200"
                >
                  {getReadableName(segment)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
