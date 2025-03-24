import React from 'react';
import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Avatar, AvatarFallback } from './avatar';
import { 
  Clock, 
  Calendar, 
  ChevronRight, 
  ArrowUpRight, 
  User, 
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShiftStatusBadge, calculateHours, formatHours } from './ShiftCalendarItem';

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

interface ShiftDetailCardProps {
  shift: Shift;
  onClose: () => void;
  currentUser: {
    id: number | string;
    name: string;
    avatarUrl?: string;
  };
}

// Formatage des jours
const formatShiftDay = (date: Date): string => {
  if (isToday(date)) return 'Aujourd\'hui';
  return format(date, 'EEEE dd MMMM', { locale: fr });
};

const ShiftDetailCard = ({ shift, onClose, currentUser }: ShiftDetailCardProps) => {
  const hours = calculateHours(shift.startTime, shift.endTime);
  
  return (
    <Card className="shadow-md border-primary/20">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={onClose} className="mb-2">
            <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
            Retour
          </Button>
          <ShiftStatusBadge status={shift.status} today={isToday(shift.date)} />
        </div>
        <CardTitle className="text-xl flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Détails du shift
        </CardTitle>
        <CardDescription>
          {formatShiftDay(shift.date)} • {format(shift.date, 'dd/MM/yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Informations</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-secondary/10 p-3 rounded-lg">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">Horaires</div>
                  <div className="text-lg font-bold">{shift.startTime} - {shift.endTime}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatHours(hours)}
                  </div>
                </div>
              </div>
                
              {shift.restaurant && (
                <div className="flex items-center gap-3 bg-secondary/10 p-3 rounded-lg">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Restaurant</div>
                    <div className="text-lg font-bold">{shift.restaurant}</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Timeline visuelle du shift */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Durée du shift</h3>
              <div className="bg-secondary/10 p-3 rounded-lg">
                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium text-primary">{shift.startTime}</div>
                    <div className="text-xs font-medium text-primary">{shift.endTime}</div>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded-full bg-secondary/30">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`
                        shadow-none flex flex-col text-center whitespace-nowrap justify-center
                        ${shift.status === 'confirmé' ? 'bg-green-500' : ''}
                        ${shift.status === 'en attente' ? 'bg-yellow-500' : ''}
                        ${shift.status === 'modifié' ? 'bg-orange-500' : ''}
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Équipe</h3>
            <div className="bg-secondary/10 p-3 rounded-lg h-[calc(100%-24px)]">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">{shift.coworkers?.length ? shift.coworkers.length + 1 : 1} personnes</span>
              </div>
              
              {shift.coworkers && shift.coworkers.length > 0 ? (
                <div className="space-y-2 mt-2">
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-2 p-2 bg-white/50 rounded-md"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-primary/30">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {currentUser.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{currentUser.name} <span className="text-xs font-normal text-muted-foreground">(Vous)</span></div>
                    </div>
                  </motion.div>
                  {shift.coworkers.map((coworker, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                      className="flex items-center gap-2 p-2 bg-white/50 rounded-md hover:bg-white/80 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                          {coworker.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm">{coworker}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
                  <span>Vous travaillez seul(e) ce jour</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex flex-wrap gap-3 justify-between">
        <Button variant="outline" size="sm" className="gap-1">
          <ArrowUpRight className="h-4 w-4" />
          Demander un échange
        </Button>
        <Button variant="default" size="sm" className="gap-1" asChild>
          <Link to="/employee/shifts">
            <Calendar className="h-4 w-4 mr-1" />
            Voir mon planning complet
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ShiftDetailCard; 