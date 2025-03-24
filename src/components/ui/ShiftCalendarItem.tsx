import React from 'react';
import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Badge } from './badge';
import { Clock, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from './avatar';

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

export interface ShiftCalendarItemProps {
  day: Date;
  shifts: Shift[];
  isSelected: boolean;
  onClick: (date: Date) => void;
  onShiftClick: (shiftId: string) => void;
  animationDelay?: number;
  isMobile?: boolean;
}

// Badge de statut pour les shifts
export const ShiftStatusBadge = ({ status, today = false }: { status: Shift['status']; today?: boolean }) => {
  // Définition du type correspondant aux variantes de badge supportées
  type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';
  
  const variants: Record<Shift['status'], { variant: BadgeVariant; label: string; className?: string }> = {
    'confirmé': { 
      variant: 'default', 
      label: 'Confirmé', 
      className: `bg-green-100 text-green-800 hover:bg-green-200 ${today ? 'animate-pulse' : ''}` 
    },
    'en attente': { 
      variant: 'secondary', 
      label: 'En attente',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    'modifié': { 
      variant: 'outline', 
      label: 'Modifié', 
      className: 'border-orange-200 bg-orange-100 text-orange-800' 
    },
  };
  
  const { variant, label, className } = variants[status];
  
  return <Badge variant={variant} className={className}>{label}</Badge>;
};

// Composant pour le mini-timeline visuel des shifts
export const ShiftTimeline = ({ shift }: { shift: Shift }) => {
  const startHour = parseInt(shift.startTime.split(':')[0]);
  const endHour = parseInt(shift.endTime.split(':')[0]);
  
  // Créer une barre de progression pour visualiser la durée
  const hours = Array.from({ length: 24 }).map((_, i) => ({
    hour: i,
    isActive: 
      (endHour > startHour) 
        ? (i >= startHour && i < endHour) 
        : (i >= startHour || i < endHour) // Pour les shifts qui passent minuit
  }));
  
  const statusColors = {
    'confirmé': 'bg-green-500',
    'en attente': 'bg-yellow-500',
    'modifié': 'bg-orange-500'
  };
  
  return (
    <div className="h-2 flex rounded-full overflow-hidden mt-1 relative">
      {hours.map((block, blockIdx) => (
        <motion.div 
          key={blockIdx} 
          className={`flex-1 ${block.isActive ? statusColors[shift.status] : 'bg-secondary/20'}`}
          initial={block.isActive ? { scaleX: 0 } : { opacity: 0 }}
          animate={block.isActive ? { scaleX: 1 } : { opacity: 1 }}
          transition={{ 
            duration: 0.5, 
            delay: block.isActive ? 0.2 + blockIdx * 0.02 : 0.1
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-40"></div>
    </div>
  );
};

// Calcul des heures de travail
export const calculateHours = (startTime: string, endTime: string): number => {
  const [startHourStr, startMinStr] = startTime.split(':');
  const [endHourStr, endMinStr] = endTime.split(':');
  
  const startHour = parseInt(startHourStr);
  const startMinute = parseInt(startMinStr);
  const startTotalMinutes = startHour * 60 + startMinute;
  
  let endHour = parseInt(endHourStr);
  const endMinute = parseInt(endMinStr);
  
  // Gestion du changement de jour
  if (endHour < startHour) {
    endHour += 24;
  }
  
  const endTotalMinutes = endHour * 60 + endMinute;
  
  // Renvoyer la durée en heures avec décimales (précision à 2 décimales)
  return Math.round((endTotalMinutes - startTotalMinutes) / 60 * 100) / 100;
};

// Format pour afficher les heures avec précision
export const formatHours = (hours: number): string => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  
  return `${wholeHours}h${minutes}m`;
};

const ShiftCalendarItem = ({ day, shifts, isSelected, onClick, onShiftClick, animationDelay = 0, isMobile = false }: ShiftCalendarItemProps) => {
  const isActiveDay = isToday(day);
  const hasShifts = shifts.length > 0;
  
  // Calculer le total des heures pour les shifts du jour
  const totalHours = shifts.reduce((total, shift) => {
    return total + calculateHours(shift.startTime, shift.endTime);
  }, 0);
  
  return (
    <motion.div 
      key={day.toISOString()} 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.3 }}
      whileHover={{ 
        backgroundColor: hasShifts ? 'rgba(var(--primary), 0.08)' : 'rgba(var(--muted), 0.12)',
        scale: 1.01,
        zIndex: 1
      }}
      className={`
        p-3 transition-all cursor-pointer border-r last:border-r-0 border-b
        ${isActiveDay ? 'bg-primary/5' : ''}
        ${isSelected ? 'ring-2 ring-primary/30 ring-inset' : ''}
        ${hasShifts ? 'hover:shadow-md' : ''}
      `}
      onClick={() => onClick(day)}
    >
      <div className="flex flex-col items-center">
        <div className="text-xs font-medium uppercase text-muted-foreground">
          {format(day, 'EEE', { locale: fr })}
        </div>
        <div className={`
          text-lg font-bold mt-1.5 w-9 h-9 flex items-center justify-center rounded-full
          ${isActiveDay ? 'bg-primary text-primary-foreground shadow-sm' : hasShifts ? 'text-foreground' : 'text-muted-foreground'}
          ${isSelected && !isActiveDay ? 'border-2 border-primary/50' : ''}
          ${hasShifts && !isActiveDay ? 'bg-primary/10' : ''}
        `}>
          {format(day, 'dd')}
        </div>
              
        {/* Indicateur de shift avec animation */}
        <div className="w-full mt-3 flex justify-center">
          {hasShifts ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 15,
                delay: 0.1
              }}
            >
              <Badge 
                variant={isActiveDay ? "default" : "outline"} 
                className={`${isActiveDay ? 'animate-pulse' : 'border-primary/40 text-primary/80'} px-2`}
              >
                {shifts.length} shift{shifts.length > 1 ? 's' : ''}
              </Badge>
            </motion.div>
          ) : (
            <Badge variant="outline" className="opacity-40 border-dashed px-2">
              Libre
            </Badge>
          )}
        </div>
              
        {/* Mini timeline visuelle */}
        {hasShifts && (
          <motion.div 
            className="w-full mt-3 px-1"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {shifts.map((shift, shiftIdx) => (
              <ShiftTimeline key={shiftIdx} shift={shift} />
            ))}
          </motion.div>
        )}
      </div>
        
      {/* Détails du shift améliorés */}
      {hasShifts && (
        <div className="mt-3 space-y-1.5">
          {shifts.map((shift, shiftIdx) => (
            <motion.div 
              key={shiftIdx} 
              className={`
                text-xs p-2 rounded-md transition-all cursor-pointer
                ${isActiveDay ? 'bg-primary/20 hover:bg-primary/30' : 'bg-secondary/20 hover:bg-primary/10'}
                ${isToday(shift.date) && shift.status === 'confirmé' ? 'border-l-2 border-green-500' : ''}
                ${shift.status === 'en attente' ? 'border-l-2 border-yellow-500' : ''}
                ${shift.status === 'modifié' ? 'border-l-2 border-orange-500' : ''}
              `}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
              onClick={(e) => {
                e.stopPropagation();
                onShiftClick(shift.id);
              }}
            >
              <div className="font-medium text-center flex items-center justify-center gap-1.5">
                <Clock className="h-3 w-3 text-primary" />
                {shift.startTime} - {shift.endTime}
              </div>
              <div className="text-muted-foreground text-center mt-1 flex flex-col items-center justify-center">
                <div className="text-xs opacity-75">
                  {formatHours(calculateHours(shift.startTime, shift.endTime))}
                </div>
                {shift.coworkers && shift.coworkers.length > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Users className="h-3 w-3" />
                    <span>{shift.coworkers.length + 1}</span>
                  </div>
                )}
                <div className="mt-1">
                  <ShiftStatusBadge status={shift.status} today={isToday(shift.date)} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Total des heures pour le jour */}
      {hasShifts && (
        <div className="mt-2 text-center">
          <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/10">
            Total: {formatHours(totalHours)}
          </Badge>
        </div>
      )}
      
      {/* Mini avatars des collègues (version condensée) */}
      {hasShifts && shifts.some(s => s.coworkers && s.coworkers.length > 0) && (
        <div className="mt-3 flex justify-center">
          <div className="flex -space-x-2 overflow-hidden">
            {Array.from(new Set(shifts.flatMap(s => s.coworkers || []))).slice(0, 3).map((coworker, idx) => (
              <Avatar key={idx} className="h-6 w-6 border-2 border-background">
                <AvatarFallback className="text-[10px] bg-secondary">
                  {coworker.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            {Array.from(new Set(shifts.flatMap(s => s.coworkers || []))).length > 3 && (
              <Avatar className="h-6 w-6 border-2 border-background">
                <AvatarFallback className="text-[10px] bg-muted-foreground text-primary-foreground">
                  +{Array.from(new Set(shifts.flatMap(s => s.coworkers || []))).length - 3}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ShiftCalendarItem; 