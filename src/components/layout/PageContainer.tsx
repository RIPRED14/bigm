import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  description,
  className,
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div
      className={cn(
        "container px-4 py-6 mx-auto", 
        isMobile ? "pt-2 px-2 max-w-full" : "max-w-7xl",
        className
      )}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-1 text-base text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default PageContainer;
