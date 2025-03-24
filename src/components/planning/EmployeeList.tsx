import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EmployeeWithPerformance } from "@/types/planning";

interface EmployeeListProps {
  employees: EmployeeWithPerformance[];
  onDragStart: (employeeId: number) => void;
  onDragMove: (e: React.TouchEvent) => void;
  onDragEnd: () => void;
  dragActive: boolean;
  currentDragEmployeeId?: number;
}

export const EmployeeList = ({
  employees,
  onDragStart,
  onDragMove,
  onDragEnd,
  dragActive,
  currentDragEmployeeId
}: EmployeeListProps) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-medium text-sm flex items-center">
          Équipe ({employees.length})
        </h2>
        {/* Badge montrant le nombre d'employés assignés */}
        <Badge variant="outline" className="h-5 text-[10px]">
          {employees.filter(emp => emp.isAssigned).length} assignés
        </Badge>
      </div>
      
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 snap-x">
        {employees.map(emp => (
          <div 
            key={emp.id}
            className="snap-start min-w-[105px] flex-shrink-0"
            onTouchStart={(e) => onDragStart(emp.id)}
            onTouchMove={onDragMove}
            onTouchEnd={onDragEnd}
          >
            <div className={cn(
              "rounded-md p-2 border border-slate-200 transition-all",
              emp.isAssigned ? "opacity-70" : emp.performance.color,
              dragActive && currentDragEmployeeId === emp.id && "ring-2 ring-primary shadow-sm"
            )}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[8px]">
                    {emp.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs font-medium truncate">{emp.name}</div>
              </div>
              
              <div className="flex justify-between items-center text-[10px]">
                <div>
                  {emp.isAssigned ? (
                    <span className="text-muted-foreground">{emp.dailyHours}h aujourd'hui</span>
                  ) : (
                    <Badge 
                      variant="outline" 
                      className={cn("h-4 px-1 text-[9px]", emp.performance.text)}
                    >
                      {emp.performance.label}
                    </Badge>
                  )}
                </div>
                <div className="text-muted-foreground">{emp.weeklyHours}h</div>
              </div>
              
              {/* Barre de progression des heures hebdomadaires */}
              <div className="mt-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all",
                    emp.performance.color.replace("text-", "bg-")
                  )}
                  style={{ width: `${Math.min(100, Math.round((emp.weeklyHours / 40) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 