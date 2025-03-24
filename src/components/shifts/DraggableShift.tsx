import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Edit, Copy } from 'lucide-react';

// Types
interface Shift {
  id: number;
  employeeIds: number[];
  day: number;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'conflict' | 'absence';
}

interface Employee {
  id: number;
  name: string;
  avatarUrl?: string;
}

interface DraggableShiftProps {
  shift: Shift;
  currentEmployee: Employee;
  colorClass: string;
  employees: Employee[];
  onClick: (shift: Shift) => void;
  getEmployeesForShift: (employeeIds: number[]) => string;
}

const DraggableShift: React.FC<DraggableShiftProps> = ({
  shift,
  currentEmployee,
  colorClass,
  employees,
  onClick,
  getEmployeesForShift
}) => {
  // Set up draggable attributes with explicit data fields
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `shift-${shift.id}`,
    data: {
      shift: shift,
      type: 'shift',
      currentEmployeeId: currentEmployee.id,
      shiftId: shift.id,
      day: shift.day,
      employeeIds: shift.employeeIds
    }
  });

  // Calculate style based on drag state
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1
  };

  // Check if CTRL key is pressed
  const [isCtrlPressed, setIsCtrlPressed] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control') setIsCtrlPressed(true);
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') setIsCtrlPressed(false);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-2 rounded-md border ${colorClass} relative group hover:shadow-md transition-shadow cursor-pointer ${isCtrlPressed ? 'cursor-copy' : ''}`}
      onClick={(e) => {
        // Prevent click when dragging ends
        if (!isDragging) {
          onClick(shift);
        }
      }}
    >
      <div className="font-medium">{shift.startTime} - {shift.endTime}</div>
      {shift.employeeIds.length > 1 && (
        <div className="text-xs mt-1">
          With: {getEmployeesForShift(shift.employeeIds.filter(id => id !== currentEmployee.id))}
        </div>
      )}
      <Badge variant="outline" className="mt-1 text-xs">
        {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
      </Badge>
      
      {/* Hover effect with edit icon */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
        <div className="bg-white p-1 rounded-full shadow-sm">
          {isCtrlPressed ? (
            <Copy className="h-4 w-4 text-primary" />
          ) : (
            <Edit className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {/* Drag handles and visual indicators */}
      <div className="absolute top-0 right-0 w-4 h-4 bg-primary/20 rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 bg-primary/20 rounded-tr-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
};

export default DraggableShift; 