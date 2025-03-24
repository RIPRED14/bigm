import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface StatsCardProps {
  title: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  compact?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  className,
  compact = false,
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className={cn("p-6", compact && "p-3")}>
        <div className="flex items-center justify-between">
          <div>
            <p className={cn("text-sm font-medium text-muted-foreground", compact && "text-xs")}>
              {title}
            </p>
            <div className="flex items-center gap-2">
              <h3 className={cn("text-2xl font-bold", compact && "text-xl")}>
                {value}
              </h3>
              {trend && (
                <span className={cn(
                  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
                  trend.isPositive 
                    ? "text-green-700 bg-green-50" 
                    : "text-red-700 bg-red-50",
                  compact && "px-1 py-0.5 text-[10px]"
                )}>
                  {trend.isPositive ? '+' : '-'}{trend.value}%
                </span>
              )}
            </div>
          </div>
          {Icon && (
            <div className={cn(
              "rounded-full p-2 bg-primary/10", 
              compact && "p-1.5"
            )}>
              <Icon className={cn(
                "h-5 w-5 text-primary",
                compact && "h-4 w-4"
              )} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
