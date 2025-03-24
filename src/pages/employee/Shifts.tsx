import React, { useState, useEffect, useMemo } from 'react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isToday, isTomorrow, isSameMonth, isWeekend, addMonths, subMonths, startOfMonth, endOfMonth, getDate, isSameDay, parse, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Calendar as CalendarIcon, 
  Clock, 
  ArrowLeftRight, 
  Grid, 
  List, 
  Filter,
  Users,
  CircleCheck,
  Clock4,
  User,
  MapPin,
  Zap,
  CalendarCheck,
  CalendarX,
  CalendarSearch,
  MoreHorizontal,
  Calendar,
  Search,
  Plus,
  Edit
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import WelcomeMessage from '@/components/ui/WelcomeMessage';
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors, DragOverlay, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useIsMobile from '@/hooks/useIsMobile';

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

// Données mockées
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
  {
    id: '5',
    date: addDays(new Date(), 6),
    startTime: '09:00',
    endTime: '17:00',
    status: 'confirmé',
    restaurant: 'Burger Downtown',
    coworkers: ['Paul R.', 'Sandra T.']
  },
  {
    id: '6',
    date: addDays(new Date(), 8),
    startTime: '13:00',
    endTime: '21:00',
    status: 'confirmé',
    restaurant: 'Burger Downtown',
    coworkers: ['François L.', 'Claire B.']
  },
  {
    id: '7',
    date: addDays(new Date(), 10),
    startTime: '10:00',
    endTime: '18:00',
    status: 'en attente',
    restaurant: 'Burger Express',
    coworkers: ['Lucas M.']
  },
  {
    id: '8',
    date: addDays(new Date(), -5),
    startTime: '09:00',
    endTime: '17:00',
    status: 'confirmé',
    restaurant: 'Burger Central',
    coworkers: ['Sophie K.', 'Thomas P.']
  },
  {
    id: '9',
    date: addDays(new Date(), 15),
    startTime: '14:00',
    endTime: '22:00',
    status: 'confirmé',
    restaurant: 'Burger Express',
    coworkers: ['Marie L.', 'Pierre D.']
  },
  {
    id: '10',
    date: addDays(new Date(), 20),
    startTime: '10:00',
    endTime: '18:00',
    status: 'en attente',
    restaurant: 'Burger Downtown',
    coworkers: ['Jean T.']
  },
];

// Liste des restaurants (extraite des shifts)
const restaurants = [...new Set(mockShifts.map(shift => shift.restaurant))].filter(Boolean) as string[];

// Format de date pour l'affichage
const formatWeekRange = (startDate: Date, endDate: Date) => {
  const start = format(startDate, 'd MMM', { locale: fr });
  const end = format(endDate, 'd MMM', { locale: fr });
  return `${start} - ${end}`;
};

// Format de date pour l'affichage du mois
const formatMonthYear = (date: Date) => {
  return format(date, 'MMMM yyyy', { locale: fr });
};

// Badge de statut pour les shifts
export const ShiftStatusBadge = ({ status }: { status: Shift['status'] }) => {
  const variants: Record<Shift['status'], { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string }> = {
    'confirmé': { 
      variant: 'default', 
      label: 'Confirmé',
      className: 'bg-green-100 text-green-800 hover:bg-green-100'
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

// Calculer la durée d'un shift
export const calculateHours = (startTime: string, endTime: string): number => {
  const [startHourStr, startMinStr] = startTime.split(':');
  const [endHourStr, endMinStr] = endTime.split(':');
  
  const startHour = parseInt(startHourStr);
  const startMinute = parseInt(startMinStr);
  const startTotalMinutes = startHour * 60 + startMinute;
  
  let endHour = parseInt(endHourStr);
  const endMinute = parseInt(endMinStr);
  
  // Gestion du passage à minuit
  if (endHour < startHour) {
    endHour += 24;
  }
  
  const endTotalMinutes = endHour * 60 + endMinute;
  
  // Calculer la différence en heures avec précision décimale
  return Math.round((endTotalMinutes - startTotalMinutes) / 60 * 100) / 100;
};

// Format pour afficher la durée
const formatDuration = (duration: number): string => {
  const hours = Math.floor(duration);
  const minutes = Math.round((duration - hours) * 60);
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h${minutes}m`;
};

// Fonction pour formater les heures avec précision
const formatHours = (hours: number): string => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  
  return `${wholeHours}h${minutes}`;
};

// Formater le jour du shift
const formatShiftDay = (date: Date): string => {
  if (isToday(date)) return 'Aujourd\'hui';
  if (isTomorrow(date)) return 'Demain';
  return format(date, 'EEEE d MMMM', { locale: fr });
};

// Ajout pour le planning interactif
interface ShiftDetails {
  isOpen: boolean;
  shiftId: string | null;
}

// Composant pour un shift sortable (draggable)
const SortableShiftItem = ({ 
  shift, 
  onClick 
}: { 
  shift: Shift, 
  onClick: (id: string) => void 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: shift.id,
    data: { shift }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex justify-between items-center p-3 mb-2 border rounded-md bg-card hover:bg-muted/40 touch-manipulation ${isDragging ? 'shadow-lg' : ''}`}
      onClick={() => onClick(shift.id)}
    >
      <div className="flex items-center">
        <div className="mr-3 p-1.5 bg-primary/10 rounded-md">
          <Clock4 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="font-medium">{shift.startTime} - {shift.endTime}</div>
          <div className="text-xs text-muted-foreground">{shift.restaurant}</div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <ShiftStatusBadge status={shift.status} />
        {shift.coworkers && shift.coworkers.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{shift.coworkers.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant pour afficher un service dans l'overlay de drag
const DragShiftOverlay = ({ shift }: { shift: Shift }) => {
  return (
    <div className="flex justify-between items-center p-3 mb-2 border rounded-md bg-card shadow-xl w-[90vw] max-w-[380px]">
      <div className="flex items-center">
        <div className="mr-3 p-1.5 bg-primary/10 rounded-md">
          <Clock4 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="font-medium">{shift.startTime} - {shift.endTime}</div>
          <div className="text-xs text-muted-foreground">{shift.restaurant}</div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <ShiftStatusBadge status={shift.status} />
        {shift.coworkers && shift.coworkers.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{shift.coworkers.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Nouvelle version plus simple pour le mode planning journalier avec drag-and-drop
// Ajout d'une nouvelle vue spécifique pour la création simplifiée
const EmployeeShifts: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'list' | 'day' | 'month' | 'simple'>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [shiftDetails, setShiftDetails] = useState<ShiftDetails>({ isOpen: false, shiftId: null });
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showPastShifts, setShowPastShifts] = useState(false);
  const [draggedShift, setDraggedShift] = useState<Shift | null>(null);
  const [dailyShifts, setDailyShifts] = useState<Shift[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [newShift, setNewShift] = useState<Partial<Shift>>({
    startTime: '09:00',
    endTime: '17:00',
    status: 'en attente'
  });
  const isMobile = useIsMobile();
  
  // Initialiser les senseurs pour le drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    })
  );
  
  // Calculer les dates pour l'affichage de la semaine
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Commence le lundi
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 }); // Finit le dimanche
  const daysOfWeek = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Filtrer les shifts selon les critères
  const filteredShifts = useMemo(() => {
    let result = [...mockShifts];
    
    // Filtrer par date passée si nécessaire
    if (!showPastShifts) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter(shift => shift.date >= today);
    }
    
    // Filtre par restaurant
    if (selectedRestaurant !== 'all') {
      result = result.filter(shift => shift.restaurant === selectedRestaurant);
    }
    
    // Filtre par recherche
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(shift => 
        shift.restaurant?.toLowerCase().includes(query) ||
        shift.coworkers?.some(coworker => coworker.toLowerCase().includes(query)) ||
        shift.status.toLowerCase().includes(query)
      );
    }
    
    // Trier par date
    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [mockShifts, selectedRestaurant, searchQuery, showPastShifts]);
  
  // Shifts par jour pour la semaine en cours
  const shiftsForWeek = useMemo(() => {
    return daysOfWeek.map(day => ({
      date: day,
      shifts: filteredShifts.filter(
        shift => isSameDay(new Date(shift.date), day)
      ),
    }));
  }, [daysOfWeek, filteredShifts]);
  
  // Shifts pour la journée sélectionnée
  useEffect(() => {
    const shiftsForSelectedDate = filteredShifts.filter(
      shift => isSameDay(new Date(shift.date), selectedDate)
    );
    
    setDailyShifts(shiftsForSelectedDate);
  }, [selectedDate, filteredShifts]);
  
  // Prochain shift
  const nextShift = useMemo(() => {
    const now = new Date();
    return filteredShifts.find(shift => {
      const shiftDate = new Date(shift.date);
      return (
        shiftDate >= now || 
        (isToday(shiftDate) && shift.startTime > format(now, 'HH:mm'))
      );
    });
  }, [filteredShifts]);
  
  // Statistiques
  const stats = useMemo(() => {
    // Total des heures pour les shifts filtrés
    const totalHours = filteredShifts.reduce(
      (total, shift) => total + calculateHours(shift.startTime, shift.endTime),
      0
    );
    
    // Heures cette semaine
    const hoursThisWeek = filteredShifts
      .filter(shift => {
      const shiftDate = new Date(shift.date);
        return shiftDate >= startDate && shiftDate <= endDate;
      })
      .reduce((total, shift) => total + calculateHours(shift.startTime, shift.endTime), 0);
    
    // Nombre de services
    const shiftsCount = filteredShifts.length;
    
    // Nombre de services cette semaine
    const shiftsThisWeek = filteredShifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= startDate && shiftDate <= endDate;
    }).length;
    
    return {
      totalHours,
      hoursThisWeek,
      shiftsCount,
      shiftsThisWeek
    };
  }, [filteredShifts, startDate, endDate]);
  
  // Navigation entre les semaines
  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'next' 
      ? addWeeks(currentDate, 1) 
      : subWeeks(currentDate, 1));
  };
  
  // Revenir à la semaine actuelle
  const goToCurrentWeek = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };
  
  // Ouvrir les détails d'un shift
  const openShiftDetails = (shiftId: string) => {
    setShiftDetails({ isOpen: true, shiftId });
  };

  // Fermer les détails d'un shift
  const closeShiftDetails = () => {
    setShiftDetails({ isOpen: false, shiftId: null });
  };

  // Appliquer les filtres et fermer le panneau
  const applyFilters = () => {
    setShowFilterPanel(false);
  };
  
  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSelectedRestaurant('all');
    setSearchQuery('');
    setShowPastShifts(false);
  };
  
  // Handlers pour drag and drop
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const shift = filteredShifts.find(s => s.id === active.id);
    if (shift) {
      setDraggedShift(shift);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setDailyShifts(items => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        
        // En production, on mettrait à jour le backend ici
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    
    setDraggedShift(null);
  };

  // Fonction pour changer de jour
  const changeDay = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + offset);
    setSelectedDate(newDate);
  };

  // Fonction pour ajouter un nouveau service
  const handleAddShift = () => {
    // En production, envoi au backend
    // Pour la démo, ajout au state local
    const id = `new-${Math.random().toString(36).substr(2, 9)}`;
    const shift: Shift = {
      id,
      date: selectedDate,
      startTime: newShift.startTime || '09:00',
      endTime: newShift.endTime || '17:00',
      status: 'en attente',
      restaurant: newShift.restaurant || 'Burger Central',
      coworkers: []
    };
    
    setDailyShifts(prev => [...prev, shift]);
    setCreateMode(false);
    setNewShift({
      startTime: '09:00',
      endTime: '17:00',
      status: 'en attente'
    });
  };
    
    return (
    <PageContainer>
      <div className="space-y-5 pb-16">
        {!isMobile && showWelcome ? (
          <WelcomeMessage 
            userName="John Doe"
            onClose={() => setShowWelcome(false)}
            nextShift={nextShift ? {
              day: formatShiftDay(nextShift.date),
              time: `${nextShift.startTime} - ${nextShift.endTime}`
            } : null}
          />
        ) : (
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6 pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Mon planning</h1>
                  {viewMode !== 'simple' && (
                    <p className="text-sm text-muted-foreground">
                      {formatWeekRange(startDate, endDate)}
                    </p>
                  )}
        </div>
                
                {isMobile && !isEditing && (
                  <Button 
                    variant={viewMode === 'simple' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => {
                      setViewMode(viewMode === 'simple' ? 'week' : 'simple');
                      if (viewMode !== 'simple') {
                        setSelectedDate(new Date());
                      }
                    }}
                  >
                    {viewMode === 'simple' ? "Planning classique" : "Mode simple"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Vue ultra-simplifiée pour mobile */}
        {viewMode === 'simple' ? (
          <div className="space-y-4">
            {/* Header simple */}
            <div className="flex items-center justify-between mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-10 p-0" 
                onClick={() => changeDay(-1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  setSelectedDate(today);
                }}
                className="h-auto py-1 px-3 font-normal"
              >
                <span className="text-base font-medium">
                  {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
                </span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-10 p-0" 
                onClick={() => changeDay(1)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Conteneur principal pour le mode simple */}
            <Card className="border shadow-sm overflow-hidden">
              <CardContent className={cn(
                "p-3 relative min-h-[60vh]",
                isEditing ? "bg-muted/20" : ""
              )}>
                <div className="absolute inset-0 flex flex-col">
                  {/* Indications des heures */}
                  <div className="grid grid-cols-[40px_1fr] h-full">
                    <div className="space-y-6 pt-2 text-muted-foreground text-xs text-right pr-2">
                      {Array.from({ length: 16 }, (_, i) => i + 7).map(hour => (
                        <div key={hour} className="h-6">
                          {hour}:00
                        </div>
                      ))}
                    </div>
                    
                    <div className="relative border-l">
                      {/* Lignes d'heures */}
                      {Array.from({ length: 16 }, (_, i) => i + 7).map(hour => (
                        <div 
                          key={hour} 
                          className="absolute left-0 right-3 border-t border-dashed border-muted-foreground/20"
                          style={{ top: `${(hour - 7) * 36}px` }}
              />
            ))}
                      
                      {/* Zones de services */}
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext 
                          items={dailyShifts.map(shift => shift.id)} 
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="relative h-full">
                            {dailyShifts.map((shift) => {
                              // Calculer la position du shift dans la journée
                              const [startHour, startMin] = shift.startTime.split(':').map(Number);
                              const [endHour, endMin] = shift.endTime.split(':').map(Number);
                              
                              // Convertir en positions
                              const startPosition = (startHour - 7) * 36 + (startMin / 60) * 36;
                              const endPosition = (endHour - 7) * 36 + (endMin / 60) * 36;
                              const height = endPosition - startPosition;
                              
                              return (
                                <div
                                  key={shift.id}
                                  className={cn(
                                    "absolute left-2 right-2 bg-primary/10 border border-primary/20 rounded-md shadow-sm",
                                    shift.status === 'confirmé' ? "bg-green-100 border-green-200" :
                                    shift.status === 'en attente' ? "bg-yellow-100 border-yellow-200" :
                                    "bg-orange-100 border-orange-200"
                                  )}
                                  style={{
                                    top: `${startPosition}px`,
                                    height: `${height}px`
                                  }}
                                  onClick={() => !isEditing && openShiftDetails(shift.id)}
                                >
                                  <div className="p-2 h-full flex flex-col justify-between overflow-hidden">
                                    <div className="font-medium text-sm truncate">
                                      {shift.startTime} - {shift.endTime}
                    </div>
                                    {height > 50 && (
                                      <div className="text-xs truncate">
                                        {shift.restaurant}
                    </div>
                                    )}
                                    {height > 70 && shift.coworkers && shift.coworkers.length > 0 && (
                                      <div className="mt-1 text-xs flex items-center gap-1">
                                        <Users className="h-3 w-3 opacity-70" /> 
                                        {shift.coworkers.length}
                        </div>
            )}
          </div>
                                  {isEditing && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDailyShifts(prev => prev.filter(s => s.id !== shift.id));
                                      }}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center shadow-sm"
                                    >
                                      ×
                                    </button>
        )}
      </div>
    );
                            })}
                          </div>
                        </SortableContext>
                        
                        <DragOverlay>
                          {draggedShift ? (
                            <div 
                              className={cn(
                                "bg-primary/10 border border-primary/20 rounded-md shadow-md w-full max-w-[300px]",
                                draggedShift.status === 'confirmé' ? "bg-green-100 border-green-200" :
                                draggedShift.status === 'en attente' ? "bg-yellow-100 border-yellow-200" :
                                "bg-orange-100 border-orange-200"
                              )}
                            >
                              <div className="p-2">
                                <div className="font-medium text-sm">
                                  {draggedShift.startTime} - {draggedShift.endTime}
                                </div>
                                <div className="text-xs mt-1">
                                  {draggedShift.restaurant}
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </DragOverlay>
                      </DndContext>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              {/* Actions */}
              <div className="border-t p-3 bg-muted/5 flex justify-center gap-2">
                {!isEditing ? (
                  <>
          <Button 
            variant="outline" 
            size="sm" 
                      className="w-full"
                      onClick={() => setIsEditing(true)}
          >
                      <Edit className="h-4 w-4 mr-1" />
                      Éditer
          </Button>
                  
            <Button
              variant="default"
              size="sm"
                      className="w-full"
                      onClick={() => setCreateMode(true)}
            >
                      <Plus className="h-4 w-4 mr-1" />
                      Nouveau
            </Button>
                  </>
                ) : (
          <Button 
            variant="outline" 
            size="sm" 
                    className="w-full"
                    onClick={() => setIsEditing(false)}
          >
                    Terminer
          </Button>
                )}
        </div>
            </Card>
            
            {/* Statistiques pour le jour */}
            {dailyShifts.length > 0 && (
              <div className="flex justify-between bg-muted/10 text-center rounded-md p-2">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Services</div>
                  <div className="font-bold">{dailyShifts.length}</div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Heures</div>
                  <div className="font-bold">
                    {formatHours(dailyShifts.reduce(
                      (total, shift) => total + calculateHours(shift.startTime, shift.endTime),
                      0
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Collègues</div>
                  <div className="font-bold">
                    {new Set(dailyShifts.flatMap(s => s.coworkers || [])).size}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Interfaces classiques existantes */}
            {/* Barre de recherche et filtres */}
      <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
        <Button 
          variant="outline" 
                size="icon" 
                onClick={() => setShowFilterPanel(true)}
                className={cn(
                  "relative",
                  (selectedRestaurant !== 'all' || showPastShifts) && "bg-primary/10 text-primary border-primary/20"
                )}
              >
                <Filter className="h-4 w-4" />
                {(selectedRestaurant !== 'all' || showPastShifts) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                )}
        </Button>
            </div>
            
            {/* Sélection du mode d'affichage (sur mobile) */}
            {isMobile && viewMode !== 'simple' && (
              <div className="flex items-center justify-center mb-4">
                <Tabs 
                  value={viewMode as 'week' | 'list' | 'month' | 'day'}
                  onValueChange={(val) => setViewMode(val as 'week' | 'list' | 'month' | 'day')}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="day" className="text-xs">
                      <CalendarSearch className="h-4 w-4 mr-1" /> Jour
                    </TabsTrigger>
                    <TabsTrigger value="week" className="text-xs">
                      <Calendar className="h-4 w-4 mr-1" /> Semaine
                    </TabsTrigger>
                    <TabsTrigger value="month" className="text-xs">
                      <CalendarCheck className="h-4 w-4 mr-1" /> Mois
                    </TabsTrigger>
                    <TabsTrigger value="list" className="text-xs">
                      <List className="h-4 w-4 mr-1" /> Liste
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}
            
            {/* Statistiques en card */}
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs">Heures cette semaine</div>
                    <div className="text-xl font-bold">{formatHours(stats.hoursThisWeek)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs">Services cette semaine</div>
                    <div className="text-xl font-bold">{stats.shiftsThisWeek}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Navigation entre les jours (pour le mode journalier) */}
            {viewMode === 'day' && (
              <div className="space-y-3">
                {/* Affichage du jour sélectionné avec navigation */}
                <Card className="shadow-sm overflow-hidden bg-muted/5">
                  <div className="flex flex-col">
                    {/* Navigation entre jours */}
                    <div className="p-3 flex items-center justify-between border-b">
                      <Button variant="ghost" size="sm" onClick={() => changeDay(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDate(new Date())}
                          className={cn(
                            "font-medium px-3",
                            isToday(selectedDate) ? "text-primary" : ""
                          )}
                        >
                          {isToday(selectedDate) ? "Aujourd'hui" : (
                            isTomorrow(selectedDate) ? "Demain" : (
                              format(selectedDate, 'EEEE d MMMM', { locale: fr })
                            )
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="size-7 ml-1"
                        >
                          <CalendarIcon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      
                      <Button variant="ghost" size="sm" onClick={() => changeDay(1)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Affichage des shifts du jour */}
                    <ScrollArea className="h-[calc(100vh-380px)] min-h-[300px]">
                      <div className="p-3 space-y-2">
                        {dailyShifts.length > 0 ? (
                          dailyShifts.map((shift) => (
                            <div 
                              key={shift.id}
                              className={cn(
                                "flex flex-col p-3 rounded-lg border cursor-pointer hover:bg-muted/10 transition-colors",
                                shift.status === 'confirmé' ? "bg-green-50 border-green-200" : 
                                shift.status === 'en attente' ? "bg-amber-50 border-amber-200" :
                                "bg-orange-50 border-orange-200"
                              )}
                              onClick={() => openShiftDetails(shift.id)}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center">
                                  <div className="flex items-center p-1.5 mr-3 rounded-full bg-primary/10">
                                    <Clock4 className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{shift.startTime} - {shift.endTime}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      {shift.restaurant}
                                    </div>
                                  </div>
                                </div>
                                <ShiftStatusBadge status={shift.status} />
                              </div>
                              
                              {shift.coworkers && shift.coworkers.length > 0 && (
                                <div className="flex items-center ml-10 pl-3 mt-1">
                                  <div className="flex -space-x-2 mr-2">
                                    {shift.coworkers.slice(0, 3).map((coworker, i) => (
                                      <div 
                                        key={i}
                                        className="size-7 rounded-full bg-muted flex items-center justify-center border border-background text-xs font-medium"
                                      >
                                        {coworker.charAt(0)}
                                      </div>
                                    ))}
                                    {shift.coworkers.length > 3 && (
                                      <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center border border-background text-xs font-medium">
                                        +{shift.coworkers.length - 3}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {shift.coworkers.length} collègue{shift.coworkers.length > 1 ? 's' : ''}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/30">
                                <div className="text-xs text-muted-foreground">
                                  Durée: {formatHours(calculateHours(shift.startTime, shift.endTime))}
                                </div>
                                <Button variant="ghost" size="sm" className="h-7 px-2">
                                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center h-48 text-center">
                            <div className="bg-muted/20 p-3 rounded-full mb-3">
                              <CalendarX className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-base font-medium">Pas de service ce jour</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Aucun service n'est prévu pour cette journée
                            </p>
                            {isEditing && (
                              <Button 
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => setCreateMode(true)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Ajouter un service
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                    
                    {/* Statistiques du jour */}
                    {dailyShifts.length > 0 && (
                      <div className="border-t">
                        <div className="grid grid-cols-3 divide-x">
                          <div className="p-3 text-center">
                            <div className="text-xs text-muted-foreground">Services</div>
                            <div className="font-bold text-base">{dailyShifts.length}</div>
                          </div>
                          <div className="p-3 text-center">
                            <div className="text-xs text-muted-foreground">Heures</div>
                            <div className="font-bold text-base">
                              {formatHours(dailyShifts.reduce(
                                (total, shift) => total + calculateHours(shift.startTime, shift.endTime),
                                0
                              ))}
                            </div>
                          </div>
                          <div className="p-3 text-center">
                            <div className="text-xs text-muted-foreground">Collègues</div>
                            <div className="font-bold text-base">
                              {new Set(dailyShifts.flatMap(s => s.coworkers || [])).size}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
                
                {/* Actions rapides */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate(-1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Retour
                  </Button>
                  
                  {!isEditing ? (
                    <Button 
                      variant="default" 
                      className="flex-1"
                      onClick={() => setCreateMode(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Nouveau service
                    </Button>
                  ) : (
                    <Button 
                      variant="default"
                      className="flex-1"
                      onClick={() => setIsEditing(false)}
                    >
                      Terminer
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {/* Navigation entre les semaines (pour le mode hebdomadaire) */}
            {viewMode === 'week' && (
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Semaine préc.
                </Button>
        <Button 
          variant="outline" 
          size="sm" 
                  onClick={goToCurrentWeek}
                  className={cn(
                    isToday(startDate) || (startDate < new Date() && endDate > new Date())
                      ? "bg-primary/10 text-primary border-primary/20"
                      : ""
                  )}
                >
                  Aujourd'hui
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                  Semaine suiv. <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
            )}
            
            {/* Affichage du planning hebdomadaire (existant) */}
            {viewMode === 'week' && (
              <div className="space-y-2">
                {shiftsForWeek.map(({ date, shifts }) => (
                  <Card 
                    key={date.toString()} 
                    className={cn(
                      "border shadow-sm",
                      isToday(date) ? "border-primary bg-primary/5" : ""
                    )}
                  >
                    <CardHeader className="py-2 px-4">
                      <CardTitle className="text-sm flex justify-between items-center">
                        <span className={isToday(date) ? "text-primary font-medium" : ""}>
                          {format(date, 'EEEE d', { locale: fr })}
                        </span>
                        {shifts.length > 0 && (
                          <Badge variant="outline" className="ml-2">
                            {shifts.length} {shifts.length === 1 ? 'service' : 'services'}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    
                    {shifts.length > 0 ? (
                      <CardContent className="py-2 px-4">
                        {shifts.map((shift) => (
                          <div 
                            key={shift.id}
                            className="flex justify-between items-center py-2 cursor-pointer hover:bg-muted/50 rounded-md px-2 transition-colors"
                            onClick={() => openShiftDetails(shift.id)}
                          >
                            <div className="flex items-center">
                              <Clock4 className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="font-medium">{shift.startTime} - {shift.endTime}</span>
              </div>
                            <div className="flex items-center gap-2">
                              <ShiftStatusBadge status={shift.status} />
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      </div>
                        ))}
                  </CardContent>
                    ) : (
                      <CardContent className="py-2 px-4 text-center text-muted-foreground text-sm">
                        Pas de service prévu
                      </CardContent>
                    )}
                </Card>
                ))}
              </div>
            )}
            
            {/* Liste complète des shifts filtrés (existant) */}
            {viewMode === 'list' && filteredShifts.length > 0 && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Tous les services
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <ScrollArea className="h-[300px] pr-3">
                    <div className="space-y-2">
                      {filteredShifts.map(shift => (
                        <div 
                          key={shift.id}
                          className="flex flex-col p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => openShiftDetails(shift.id)}
                        >
                          <div className="flex justify-between items-start">
                      <div>
                              <div className="font-medium">{formatShiftDay(shift.date)}</div>
                              <div className="flex items-center text-sm gap-1">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{shift.startTime} - {shift.endTime}</span>
                                <span className="text-muted-foreground">
                                  ({formatHours(calculateHours(shift.startTime, shift.endTime))})
                                </span>
                      </div>
                      </div>
                            <ShiftStatusBadge status={shift.status} />
                    </div>
                          
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{shift.restaurant}</span>
                      </div>
                            {shift.coworkers && shift.coworkers.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{shift.coworkers.length} collègue{shift.coworkers.length > 1 ? 's' : ''}</span>
                      </div>
                            )}
                    </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  </CardContent>
                </Card>
            )}
          </>
        )}
              </div>
              
      {/* Dialog Filtres */}
      <Dialog open={showFilterPanel} onOpenChange={setShowFilterPanel}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filtres</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-3">
              <Label>Restaurant</Label>
                  <Select
                    value={selectedRestaurant}
                    onValueChange={setSelectedRestaurant}
                  >
                <SelectTrigger>
                      <SelectValue placeholder="Tous les restaurants" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les restaurants</SelectItem>
                  {restaurants.map(restaurant => (
                        <SelectItem key={restaurant} value={restaurant}>
                          {restaurant}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-past">Afficher les services passés</Label>
                <div className="text-xs text-muted-foreground">
                  Inclure les services antérieurs à aujourd'hui
                        </div>
                      </div>
              <Switch 
                id="show-past" 
                checked={showPastShifts}
                onCheckedChange={setShowPastShifts}
              />
                      </div>
            
            <div className="flex justify-between gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={resetFilters}>
                Réinitialiser
              </Button>
              <Button className="flex-1" onClick={applyFilters}>
                Appliquer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal détails d'un shift */}
      {shiftDetails.isOpen && shiftDetails.shiftId && (
        <Dialog open={shiftDetails.isOpen} onOpenChange={closeShiftDetails}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Détails du service</DialogTitle>
            </DialogHeader>
            {(() => {
              const shift = filteredShifts.find(s => s.id === shiftDetails.shiftId);
              if (!shift) return null;
              
              return (
                <div className="space-y-4">
                      <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{formatShiftDay(shift.date)}</h3>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{shift.startTime} - {shift.endTime}</span>
                        </div>
                      </div>
                    <ShiftStatusBadge status={shift.status} />
                          </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Restaurant</h4>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      <p>{shift.restaurant}</p>
                    </div>
                      </div>
                      
                  <div>
                    <h4 className="text-sm font-medium mb-1">Durée</h4>
                    <div className="flex items-center">
                      <Clock4 className="h-4 w-4 mr-1 text-muted-foreground" />
                      <p>{formatHours(calculateHours(shift.startTime, shift.endTime))}</p>
                    </div>
                  </div>
                  
                  {shift.coworkers && shift.coworkers.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Collègues</h4>
                      <div className="flex flex-wrap gap-2">
                        {shift.coworkers.map((coworker, i) => (
                          <Badge key={i} variant="outline" className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {coworker}
                                  </Badge>
                        ))}
                      </div>
                                </div>
                              )}
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={closeShiftDetails}>Fermer</Button>
                    <Link to="/employee/exchanges">
                      <Button variant="secondary">
                        <ArrowLeftRight className="h-4 w-4 mr-1" />
                        Proposer un échange
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}
      
      {/* Dialog création de service simplifié */}
      <Dialog open={createMode} onOpenChange={setCreateMode}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nouveau service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="shift-day">Jour</Label>
              <div className="flex items-center border rounded-md px-3 py-2">
                <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{format(selectedDate, 'EEEE d MMMM', { locale: fr })}</span>
                        </div>
                        </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Début</Label>
                <Select
                  value={newShift.startTime}
                  onValueChange={(val) => setNewShift(prev => ({ ...prev, startTime: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Heure de début" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                      <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                        {hour.toString().padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                        </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-time">Fin</Label>
                <Select
                  value={newShift.endTime}
                  onValueChange={(val) => setNewShift(prev => ({ ...prev, endTime: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Heure de fin" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                      <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                        {hour.toString().padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                      </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="restaurant">Restaurant</Label>
              <Select
                value={newShift.restaurant || 'Burger Central'}
                onValueChange={(val) => setNewShift(prev => ({ ...prev, restaurant: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map(restaurant => (
                    <SelectItem key={restaurant} value={restaurant}>
                      {restaurant}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setCreateMode(false)}>
                Annuler
                        </Button>
              <Button className="flex-1" onClick={handleAddShift}>
                Ajouter
                        </Button>
                      </div>
      </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default EmployeeShifts; 