import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface DroppableCellProps {
  day: number;
  employeeId: number;
  onAddClick: (employeeId: number, day: number) => void;
  hasShifts: boolean;
  children: React.ReactNode;
}

const DroppableCell: React.FC<DroppableCellProps> = ({
  day,
  employeeId,
  onAddClick,
  hasShifts,
  children
}) => {
  // Set up droppable attributes with explicit data
  const { isOver, setNodeRef } = useDroppable({
    id: `cell-${employeeId}-${day}`,
    data: {
      type: 'cell',
      employeeId: employeeId,
      day: day
    }
  });

  // Style for when an item is dragged over this cell - make it more obvious
  const dropIndicatorStyle = isOver
    ? 'bg-primary/15 border-primary/40 ring-2 ring-primary/30'
    : '';

  // Get the number of shifts (children)
  const childrenCount = React.Children.count(children);

  // Style for cells with multiple shifts
  const multipleShiftsStyle = childrenCount > 1 
    ? 'bg-muted/5 rounded-md p-1 border border-muted/10' 
    : '';

  return (
    <div
      ref={setNodeRef}
      className={`relative transition-colors duration-200 min-h-[100px] ${dropIndicatorStyle} ${multipleShiftsStyle}`}
      data-day={day}
      data-employee-id={employeeId}
    >
      {/* Shifts container */}
      {hasShifts ? (
        <div className="space-y-2 p-1">
          {children}
        </div>
      ) : (
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full h-12 border border-dashed border-muted-foreground/20 hover:border-muted-foreground/40"
          onClick={() => onAddClick(employeeId, day)}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      )}

      {/* Visual indicator when dragging over - make it more obvious */}
      {isOver && (
        <div className="absolute inset-0 border-2 border-dashed border-primary/60 rounded-md pointer-events-none animate-pulse bg-primary/5 z-10"></div>
      )}
    </div>
  );
};

export default DroppableCell; 