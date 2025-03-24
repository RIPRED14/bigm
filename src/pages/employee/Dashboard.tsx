import React, { useState, useEffect, useMemo } from 'react';
import { format, addDays, isToday, isTomorrow, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Bell, 
  AlertTriangle, 
  ArrowRight, 
  ChevronRight,
  ArrowUpRight,
  User,
  UserPlus,
  Coffee,
  CalendarCheck,
  CalendarX,
  Users,
  BarChart,
  ChevronLeft,
  Heart,
  DollarSign,
  Award,
  Clock4,
  MessageSquareText,
  ArrowRightCircle,
  ThumbsUp,
  Sparkles
} from 'lucide-react';
import ShiftCalendarItem from '@/components/ui/ShiftCalendarItem';
import ShiftDetailCard from '@/components/ui/ShiftDetailCard';
import ShiftListItem from '@/components/ui/ShiftListItem';
import { ShiftStatusBadge, calculateHours } from '@/components/ui/ShiftCalendarItem';
import UpcomingShiftsList from '@/components/ui/UpcomingShiftsList';
import { useToast } from '@/components/ui/use-toast';
import useIsMobile from '@/hooks/useIsMobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import WelcomeMessage from '@/components/ui/WelcomeMessage';
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

interface WeeklyStats {
  totalHours: number;
  averageHoursPerDay: number;
  mostFrequentShift: string;
  shiftsCount: number;
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
    icon: <Calendar className="h-4 w-4 text-primary" />,
    label: 'Mon planning',
    path: '/employee/shifts',
    color: 'bg-primary/10'
  },
  {
    icon: <ArrowRightCircle className="h-4 w-4 text-emerald-500" />,
    label: 'Échanges',
    path: '/employee/exchanges',
    color: 'bg-emerald-100',
    badge: '2'
  },
  {
    icon: <Clock4 className="h-4 w-4 text-amber-500" />,
    label: 'Heures',
    path: '/employee/profile?tab=stats',
    color: 'bg-amber-100'
  },
  {
    icon: <MessageSquareText className="h-4 w-4 text-blue-500" />,
    label: 'Messages',
    path: '/employee/dashboard?tab=messages',
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
  },
  {
    id: '4',
    date: addDays(new Date(), 4),
    startTime: '18:00',
    endTime: '02:00',
    status: 'modifié',
    restaurant: 'Burger Central',
    coworkers: ['Alex D.', 'Julie B.', 'Thomas L.']
  },
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
    id: '2',
    type: 'absence',
    message: 'Votre demande d\'absence a été acceptée',
    timestamp: new Date(Date.now() - 86400000), // hier
    read: true,
    link: '/employee/exchanges',
    actionRequired: false,
    priority: 'low'
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
  },
  {
    id: '4',
    type: 'info',
    message: 'Nouvelle formation disponible: "Service client avancé"',
    timestamp: new Date(Date.now() - 259200000), // 3 jours
    read: false,
    link: '/employee/profile',
    actionRequired: false,
    priority: 'low'
  },
];

// Messages de l'équipe
const teamMessages = [
  {
    id: 1,
    author: 'Sophie (Manager)',
    message: 'Bonjour à tous! N\'oubliez pas la réunion demain à 14h.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
  },
  {
    id: 2,
    author: 'Alex',
    message: 'Quelqu\'un pourrait échanger son shift de vendredi soir?',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
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

const calculateWeeklyStats = (shifts: Shift[]): WeeklyStats => {
  const totalHours = calculateTotalHours(shifts);
  const shiftsCount = shifts.length;
  
  return {
    totalHours,
    averageHoursPerDay: shiftsCount > 0 ? totalHours / shiftsCount : 0,
    mostFrequentShift: 'Après-midi',
    shiftsCount,
  };
};

const getWeekTimeline = (currentDate: Date = new Date()) => {
  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

const NotificationIcon = ({ type, priority }: { type: Notification['type']; priority?: Notification['priority'] }) => {
  const getPriorityClass = () => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  switch (type) {
    case 'shift':
      return <Calendar className={`h-5 w-5 ${getPriorityClass()}`} />;
    case 'absence':
      return <CalendarX className={`h-5 w-5 ${getPriorityClass()}`} />;
    case 'échange':
      return <ArrowUpRight className={`h-5 w-5 ${getPriorityClass()}`} />;
    case 'info':
      return <Bell className={`h-5 w-5 ${getPriorityClass()}`} />;
    default:
      return <Bell className={`h-5 w-5 ${getPriorityClass()}`} />;
  }
};

interface ShiftDetails {
  isOpen: boolean;
  shiftId: string | null;
}

// Composant principal
const EmployeeDashboard: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [shiftDetails, setShiftDetails] = useState<ShiftDetails>({ isOpen: false, shiftId: null });
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Simuler un chargement initial
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);
  
  // Récupérer les shifts pour la semaine en cours
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const endOfCurrentWeek = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Filtrer les shifts pour cette semaine
  const currentWeekShifts = useMemo(() => {
    return mockShifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= startOfCurrentWeek && shiftDate <= endOfCurrentWeek;
    });
  }, [mockShifts, startOfCurrentWeek, endOfCurrentWeek]);
  
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
  }, [mockShifts]);

  // Calculer les statistiques de la semaine
  const weeklyStats = useMemo(() => {
    return calculateWeeklyStats(currentWeekShifts);
  }, [currentWeekShifts]);
  
  // Obtenir la timeline de la semaine
  const weekTimeline = useMemo(() => getWeekTimeline(currentDate), [currentDate]);
  
  // Filtrer les notifications non lues
  const unreadNotifications = mockNotifications.filter(notification => !notification.read);
  const urgentNotifications = mockNotifications.filter(notification => 
    !notification.read && notification.priority === 'high'
  );
  
  // Marquer une notification comme lue
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Navigation entre les semaines
  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  // Ouvrir les détails d'un shift
  const openShiftDetails = (shiftId: string) => {
    setShiftDetails({ isOpen: true, shiftId });
  };

  // Fermer les détails d'un shift
  const closeShiftDetails = () => {
    setShiftDetails({ isOpen: false, shiftId: null });
  };
    
    return (
    <PageContainer>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 pb-16"
          >
            <Skeleton className="h-40 w-full rounded-lg" />
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </motion.div>
        ) : (
      <motion.div 
            key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 pb-16"
          >
            {showWelcome ? (
              <WelcomeMessage 
                userName={currentUser.name}
                onClose={() => setShowWelcome(false)}
                nextShift={nextShift ? {
                  day: formatShiftDay(nextShift.date),
                  time: `${nextShift.startTime} - ${nextShift.endTime}`
                } : null}
              />
            ) : (
              <Card className="border-none shadow-sm bg-gradient-to-r from-primary/10 to-primary/5">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">Bonjour, {currentUser.name}</h1>
                      <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE d MMMM', { locale: fr })}</p>
                    </div>
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                      <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                  </div>
                </CardContent>
              </Card>
            )}
          
            {/* Actions rapides */}
            <div className="grid grid-cols-4 gap-2">
              {quickActions.map((action) => (
                <Link to={action.path} key={action.label}>
                  <motion.div 
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex flex-col items-center justify-center py-3 px-1 rounded-lg",
                      "border border-border/50 relative",
                      action.color
                    )}
                  >
                    <div className="relative">
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
                    <span className="text-xs mt-1 font-medium">{action.label}</span>
                  </motion.div>
                  </Link>
              ))}
          </div>
          
            {/* Prochain shift - seulement si pas déjà affiché dans le WelcomeMessage */}
            {!showWelcome && nextShift && (
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
            
            {/* Statistiques de la semaine */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base flex items-center">
                    <BarChart className="h-4 w-4 mr-2 text-primary" />
                    <span>Ma semaine</span>
                  </CardTitle>
                  <Badge variant="outline" className="font-normal">
                    Semaine du {format(startOfCurrentWeek, 'd MMM', { locale: fr })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs">Heures de travail</div>
                    <div className="text-2xl font-bold flex items-center">
                      {formatHours(weeklyStats.totalHours)}
                      <span className="text-xs text-muted-foreground font-normal ml-1">/ semaine</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs">Services</div>
                    <div className="text-2xl font-bold flex items-center">
                      {weeklyStats.shiftsCount}
                      <span className="text-xs text-muted-foreground font-normal ml-1">cette semaine</span>
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
            
            {/* Tabs pour les différentes sections */}
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="overview" className="text-xs">
                  <Sparkles className="h-3.5 w-3.5 mr-1" /> Aperçu
                </TabsTrigger>
                <TabsTrigger value="activity" className="text-xs">
                  <Clock className="h-3.5 w-3.5 mr-1" /> Activité
                </TabsTrigger>
                <TabsTrigger value="messages" className="text-xs relative">
                  <Bell className="h-3.5 w-3.5 mr-1" /> Messages
                  {unreadNotifications.length > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                      {unreadNotifications.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            
              {/* Contenu des onglets reste similaire à l'existant */}
              
        </Tabs>
      </motion.div>
        )}
      </AnimatePresence>
      
      {/* Le reste du composant reste identique */}
      
    </PageContainer>
  );
};

export default EmployeeDashboard; 