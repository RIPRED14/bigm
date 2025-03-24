import React from 'react';
import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Button } from './button';
import { Clock, Users, ChevronRight } from 'lucide-react';
import { ShiftStatusBadge } from './ShiftCalendarItem';

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

interface ShiftListItemProps {
  shift: Shift;
  onClick: (shiftId: string) => void;
  index?: number;
  isExpanded?: boolean;
}

const ShiftListItem = ({ shift, onClick, index = 0, isExpanded = false }: ShiftListItemProps) => {
  return (
    <motion.div 
      layout
      key={shift.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`
        group p-3 hover:bg-muted/30 transition-all cursor-pointer relative
        ${isToday(shift.date) ? 'bg-primary/5' : ''}
        ${isExpanded ? 'rounded-lg shadow-sm border border-primary/10' : ''}
      `}
      onClick={() => onClick(shift.id)}
    >
      <div className={`
        absolute top-0 left-0 w-1 h-full 
        ${shift.status === 'confirmé' ? 'bg-green-500' : ''}
        ${shift.status === 'en attente' ? 'bg-yellow-500' : ''}
        ${shift.status === 'modifié' ? 'bg-orange-500' : ''}
        ${isToday(shift.date) ? 'opacity-100' : 'opacity-60'}
        ${isExpanded ? 'rounded-l-lg' : ''}
      `} />
                                  
      <div className="grid grid-cols-5 gap-3 pl-2">
        {/* Date */}
        <div className="flex items-center">
          <div className={`
            h-10 w-10 rounded-full flex flex-col items-center justify-center border
            ${isToday(shift.date) ? 'border-primary bg-primary/10 shadow-sm' : 'border-muted'}
          `}>
            <span className={`text-sm font-bold ${isToday(shift.date) ? 'text-primary' : ''}`}>
              {format(shift.date, 'dd')}
            </span>
          </div>
          <div className="ml-2">
            <div className="text-xs font-medium">
              {format(shift.date, 'EEE', { locale: fr })}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(shift.date, 'MMM', { locale: fr })}
            </div>
          </div>
        </div>
                                    
        {/* Horaires */}
        <div className="col-span-2 flex items-center">
          <Clock className="h-4 w-4 text-primary mr-1.5 flex-shrink-0" />
          <div>
            <div className="font-medium text-sm">{shift.startTime} - {shift.endTime}</div>
            {shift.restaurant && (
              <div className="text-xs text-muted-foreground mt-0.5">{shift.restaurant}</div>
            )}
          </div>
        </div>
                                    
        {/* Coworkers */}
        <div className="flex items-center">
          {shift.coworkers && shift.coworkers.length > 0 ? (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{shift.coworkers.length + 1}</span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Solo</div>
          )}
        </div>
                                    
        {/* Statut */}
        <div className="text-right">
          <ShiftStatusBadge status={shift.status} today={isToday(shift.date)} />
        </div>
      </div>
                                  
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-white/80 shadow-sm">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Indicateur de shift actuel */}
      {isToday(shift.date) && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 10,
            delay: 0.3 + index * 0.1
          }}
          className="absolute -right-1 -top-1 w-3 h-3 bg-primary rounded-full border-2 border-white"
        />
      )}
    </motion.div>
  );
};

export default ShiftListItem; 