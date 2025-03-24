import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScrollArea } from './scroll-area';
import { Button } from './button';
import { ArrowRight, CalendarCheck } from 'lucide-react';
import ShiftListItem from './ShiftListItem';

// Types
interface Shift {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'confirmé' | 'en attente' | 'modifié';
  restaurant?: string;
  coworkers?: string[];
}

export interface UpcomingShiftsListProps {
  shifts: Shift[];
  onShiftClick: (shiftId: string) => void;
  title?: string;
  maxHeight?: string;
  showTitle?: boolean;
  showViewAllButton?: boolean;
  isMobile?: boolean;
}

const UpcomingShiftsList = ({
  shifts,
  onShiftClick,
  title = "Mes prochains shifts",
  maxHeight = "220px",
  showTitle = true,
  showViewAllButton = true,
  isMobile,
}: UpcomingShiftsListProps) => {
  // Trier les shifts par date
  const sortedShifts = [...shifts].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  return (
    <div>
      {showTitle && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-medium flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-primary" />
            {title}
          </h3>
          {showViewAllButton && (
            <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
              <Link to="/employee/shifts">
                Voir tout
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative overflow-hidden rounded-lg border bg-card shadow-sm mb-2`}
        style={{ height: maxHeight }}
      >
        <ScrollArea className="h-full pb-0">
          <div className="space-y-0 divide-y">
            {sortedShifts.length > 0 ? (
              sortedShifts.map((shift, idx) => (
                <ShiftListItem
                  key={shift.id}
                  shift={shift}
                  onClick={onShiftClick}
                  index={idx}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-10 text-muted-foreground">
                <CalendarCheck className="h-8 w-8 mb-2 opacity-50" />
                <p>Aucun shift à venir</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Effet de fondu en bas de la liste */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
      </motion.div>
    </div>
  );
};

export default UpcomingShiftsList; 