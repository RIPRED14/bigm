
import React from 'react';
import { cn } from '@/lib/utils';

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
  return (
    <div className={cn('animate-fade-in px-4 sm:px-6 lg:px-8 pt-24 pb-16 max-w-7xl mx-auto', className)}>
      {(title || description) && (
        <div className="mb-8">
          {title && (
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-2 text-lg text-muted-foreground">
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
