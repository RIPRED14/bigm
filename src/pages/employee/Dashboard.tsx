import React, { useState, useEffect, useMemo } from 'react';
import { format, addDays, isToday, isTomorrow, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Clock, 
  Calendar, 
  Bell, 
  AlertTriangle, 
  ArrowRightCircle,
  Clock4,
  MessageSquareText,
  CalendarX,
  User,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Types pour le dashboard
interface Shift {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'confirmé' | 'en attente' | 'modifié';
  restaurant?: string;
  coworkers?: string[];
}

interface Notification {
  id: string;
  type: 'shift' | 'absence' | 'échange' | 'info';
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  actionRequired?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

// Données mockées pour démonstration
const currentUser = {
  id: 1,
  name: 'John Doe',
  avatarUrl: '',
  status: 'Actif',
  restaurant: 'Burger Central',
  position: 'Serveur',
  hoursThisMonth: 76,
  targetHours: 120
};

// Actions rapides pour le tableau de bord mobile
const quickActions = [
  {
    icon: <Calendar className="h-5 w-5 text-primary" />,
    label: 'Planning',
    path: '/employee/shifts',
    color: 'bg-primary/10'
  },
  {
    icon: <ArrowRightCircle className="h-5 w-5 text-emerald-500" />,
    label: 'Échanges',
    path: '/employee/exchanges',
    color: 'bg-emerald-100',
    badge: '2'
  },
  {
    icon: <Clock4 className="h-5 w-5 text-amber-500" />,
    label: 'Heures',
    path: '/employee/profile?tab=stats',
    color: 'bg-amber-100'
  },
  {
    icon: <User className="h-5 w-5 text-blue-500" />,
    label: 'Profil',
    path: '/employee/profile',
    color: 'bg-blue-100'
  }
];

// Données mockées pour démonstration
const mockShifts: Shift[] = [
  {
    id: '1',
    date: new Date(),
    startTime: '15:00',
    endTime: '23:00',
    status: 'confirmé',
    restaurant: 'Burger Central',
    coworkers: ['Emma S.', 'Michael T.']
  },
  {
    id: '2',
    date: addDays(new Date(), 1),
    startTime: '18:00',
    endTime: '00:00',
    status: 'confirmé',
    restaurant: 'Burger Central',
    coworkers: ['Thomas L.', 'Sophie M.']
  },
  {
    id: '3',
    date: addDays(new Date(), 2),
    startTime: '11:00',
    endTime: '19:00',
    status: 'en attente',
    restaurant: 'Burger Central',
    coworkers: ['Marie C.']
  }
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'shift',
    message: 'Votre planning de la semaine a été modifié',
    timestamp: new Date(),
    read: false,
    link: '/employee/shifts',
    actionRequired: false,
    priority: 'medium'
  },
  {
    id: '3',
    type: 'échange',
    message: 'Mike vous a envoyé une demande d\'échange de shift',
    timestamp: new Date(Date.now() - 172800000), // avant-hier
    read: false,
    link: '/employee/exchanges',
    actionRequired: true,
    priority: 'high'
  }
];

const calculateTotalHours = (shifts: Shift[]): number => {
  return shifts.reduce((total, shift) => {
    const start = shift.startTime.split(':').map(Number);
    const end = shift.endTime.split(':').map(Number);
    
    let hours = end[0] - start[0];
    const minutes = end[1] - start[1];
    
    // Gestion du cas où le shift se termine le lendemain
    if (hours < 0) {
      hours += 24;
    }
    
    // Conversion des minutes en heures
    const totalHours = hours + minutes / 60;
    return total + totalHours;
  }, 0);
};

const formatHours = (hours: number): string => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  
  return `${wholeHours}h${minutes}`;
};

const formatShiftDay = (date: Date): string => {
  if (isToday(date)) return 'Aujourd\'hui';
  if (isTomorrow(date)) return 'Demain';
  return format(date, 'EEEE d MMMM', { locale: fr });
};

// Composant principal
const EmployeeDashboard: React.FC = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [notifications] = useState<Notification[]>(mockNotifications);

  // Simuler un chargement initial
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);
  
  // Trouver le prochain shift
  const nextShift = useMemo(() => {
    const now = new Date();
    
    // Trouver le prochain shift (aujourd'hui ou plus tard)
    const upcoming = mockShifts
      .filter(shift => {
        const shiftDate = new Date(shift.date);
        // Aujourd'hui mais plus tard dans la journée ou des jours futurs
        if (isToday(shiftDate)) {
          const [hours, minutes] = shift.startTime.split(':').map(Number);
          const shiftDateTime = new Date(shiftDate);
          shiftDateTime.setHours(hours, minutes);
          return shiftDateTime > now;
        }
        return shiftDate > now;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return upcoming.length > 0 ? upcoming[0] : null;
  }, []);

  // Calculer les heures totales des shifts
  const totalHours = useMemo(() => {
    return calculateTotalHours(mockShifts);
  }, []);

  // Filtrer les notifications urgentes
  const urgentNotifications = useMemo(() => {
    return notifications.filter(notification => 
      !notification.read && notification.priority === 'high'
    );
  }, [notifications]);

  return (
    <PageContainer className={isMobile ? "p-3" : "p-6"}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Skeleton className="h-28 w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-36 w-full rounded-lg" />
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* En-tête avec profil */}
            <Card className="border-none shadow-sm bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">Bonjour, {currentUser.name}</h1>
                    <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE d MMMM', { locale: fr })}</p>
                  </div>
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>
            
            {/* Prochain shift */}
            {nextShift && (
              <Card className="shadow-sm border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <h3 className="font-semibold text-sm text-green-700">Prochain service</h3>
                      </div>
                      <p className="text-green-800 mt-1 font-medium">
                        {formatShiftDay(nextShift.date)}
                      </p>
                      <div className="flex items-center mt-1 text-sm text-green-700">
                        <Clock4 className="h-3 w-3 mr-1" />
                        <span>{nextShift.startTime} - {nextShift.endTime}</span>
                        <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 border-green-200">
                          {nextShift.restaurant}
                        </Badge>
                      </div>
                    </div>
                    <Link to="/employee/shifts">
                      <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-100">
                        <Calendar className="h-3.5 w-3.5 mr-1" /> Voir planning
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Notifications urgentes */}
            {urgentNotifications.length > 0 && (
              <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertTitle className="text-red-700">Action requise</AlertTitle>
                <AlertDescription className="text-red-600">
                  {urgentNotifications[0].message}
                  <Link to={urgentNotifications[0].link || "#"}>
                    <Button size="sm" variant="destructive" className="mt-2 w-full">
                      Voir maintenant
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Actions rapides */}
            <div>
              <h2 className="text-sm font-medium mb-2 px-1">Accès rapides</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Link to={action.path} key={action.label}>
                    <motion.div 
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex items-center p-3 rounded-lg",
                        "border border-border/50 relative",
                        action.color
                      )}
                    >
                      <div className="relative mr-3">
                        {action.icon}
                        {action.badge && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                          >
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <span className="font-medium">{action.label}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Résumé de la semaine */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  <span>Résumé de mes heures</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs">Cette semaine</div>
                    <div className="text-2xl font-bold flex items-center">
                      {formatHours(totalHours)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs">Ce mois</div>
                    <div className="text-2xl font-bold flex items-center">
                      {currentUser.hoursThisMonth}h
                      <span className="text-xs text-muted-foreground font-normal ml-1">/ {currentUser.targetHours}h</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link to="/employee/shifts">
                    <Button variant="outline" className="w-full" size="sm">
                      <Calendar className="h-3.5 w-3.5 mr-1" /> Voir mon planning complet
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            {/* Prochains services */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <span>Mes prochains services</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {mockShifts.map((shift) => (
                    <div 
                      key={shift.id} 
                      className="p-3 rounded-lg border border-muted flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {formatShiftDay(shift.date)}
                        </p>
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                          <Clock4 className="h-3 w-3 mr-1" />
                          <span>{shift.startTime} - {shift.endTime}</span>
                        </div>
                      </div>
                      <Badge variant={
                        shift.status === 'confirmé' ? 'default' : 
                        shift.status === 'en attente' ? 'outline' : 
                        'secondary'
                      }>
                        {shift.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default EmployeeDashboard; 