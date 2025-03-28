import React, { useState, useEffect, useMemo } from 'react';
import { format, addDays, differenceInDays, isToday, isBefore, addHours, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Clock, 
  Calendar as CalendarIcon,
  ArrowLeftRight, 
  Plus, 
  X, 
  Check,
  Info,
  User,
  Users,
  AlertTriangle,
  FilterX,
  Search,
  RefreshCcw,
  ChevronRight,
  UserCheck,
  UserX,
  HelpCircle,
  Calendar as CalendarTimeIcon,
  CalendarCheck,
  CalendarX,
  MessageSquareText
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useIsMobile from '@/hooks/useIsMobile';

// Types pour les échanges de shifts
interface Shift {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  restaurant?: string;
}

interface ShiftExchange {
  id: string;
  myShift: Shift;
  targetShift: Shift;
  targetEmployee: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  response?: string;
}

interface Employee {
  id: string;
  name: string;
  avatarUrl?: string;
  shifts: Shift[];
}

// Données mockées pour démonstration
const myShifts: Shift[] = [
  {
    id: '1',
    date: new Date(),
    startTime: '15:00',
    endTime: '23:00',
    restaurant: 'Burger Staff Sync'
  },
  {
    id: '2',
    date: addDays(new Date(), 3),
    startTime: '10:00',
    endTime: '18:00',
    restaurant: 'Burger Staff Sync'
  },
  {
    id: '3',
    date: addDays(new Date(), 5),
    startTime: '18:00',
    endTime: '02:00',
    restaurant: 'Burger Staff Sync'
  },
  {
    id: '4',
    date: addDays(new Date(), 7),
    startTime: '09:00',
    endTime: '17:00',
    restaurant: 'Burger Staff Sync'
  }
];

// Collègues mockés
const colleagues: Employee[] = [
  {
    id: '1',
    name: 'Sami',
    avatarUrl: '',
    shifts: [
      {
        id: 'c1-1',
        date: addDays(new Date(), 1),
        startTime: '12:00',
        endTime: '20:00',
        restaurant: 'Burger Staff Sync'
      },
      {
        id: 'c1-2',
        date: addDays(new Date(), 4),
        startTime: '09:00',
        endTime: '17:00',
        restaurant: 'Burger Staff Sync'
      }
    ]
  },
  {
    id: '2',
    name: 'Afif',
    avatarUrl: '',
    shifts: [
      {
        id: 'c2-1',
        date: addDays(new Date(), 2),
        startTime: '15:00',
        endTime: '23:00',
        restaurant: 'Burger Staff Sync'
      },
      {
        id: 'c2-2',
        date: addDays(new Date(), 6),
        startTime: '18:00',
        endTime: '02:00',
        restaurant: 'Burger Staff Sync'
      }
    ]
  }
];

// Échanges mockés
const mockExchanges: ShiftExchange[] = [
  {
    id: 'ex1',
    myShift: {
      id: '2',
      date: addDays(new Date(), 3),
      startTime: '10:00',
      endTime: '18:00',
      restaurant: 'Burger Staff Sync'
    },
    targetShift: {
      id: 'c1-1',
      date: addDays(new Date(), 1),
      startTime: '12:00',
      endTime: '20:00',
      restaurant: 'Burger Staff Sync'
    },
    targetEmployee: {
      id: '1',
      name: 'Sami',
      avatarUrl: ''
    },
    reason: 'Je dois participer à un événement familial ce jour-là.',
    status: 'pending',
    createdAt: addHours(new Date(), -5)
  },
  {
    id: 'ex2',
    myShift: {
      id: '1',
      date: new Date(),
      startTime: '15:00',
      endTime: '23:00',
      restaurant: 'Burger Staff Sync'
    },
    targetShift: {
      id: 'c2-2',
      date: addDays(new Date(), 6),
      startTime: '18:00',
      endTime: '02:00',
      restaurant: 'Burger Staff Sync'
    },
    targetEmployee: {
      id: '2',
      name: 'Afif',
      avatarUrl: ''
    },
    reason: 'Rendez-vous médical important.',
    status: 'approved',
    createdAt: addHours(new Date(), -28),
    response: 'Pas de problème, je peux faire ton service. Bon courage pour ton rendez-vous !'
  },
  {
    id: 'ex3',
    myShift: {
      id: '3',
      date: addDays(new Date(), 5),
      startTime: '18:00',
      endTime: '02:00',
      restaurant: 'Burger Staff Sync'
    },
    targetShift: {
      id: 'c3-1',
      date: addDays(new Date(), 3),
      startTime: '11:00',
      endTime: '19:00',
      restaurant: 'Burger Downtown'
    },
    targetEmployee: {
      id: '3',
      name: 'Sophie Martin',
      avatarUrl: ''
    },
    reason: 'Besoin de changer mon shift du soir pour un shift de jour.',
    status: 'rejected',
    createdAt: addHours(new Date(), -48),
    response: 'Désolée, je ne peux pas faire ton service ce jour-là, j\'ai un autre engagement.'
  }
];

// Formats d'affichage
const formatShiftDate = (date: Date) => {
  if (isToday(date)) return 'Aujourd\'hui';
  return format(date, 'EEEE d MMMM', { locale: fr });
};

const formatShiftTime = (shift: Shift) => {
  return `${shift.startTime} - ${shift.endTime}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return '';
  }
};

const getStatusText = (status: ShiftExchange['status']) => {
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'approved':
      return 'Approuvé';
    case 'rejected':
      return 'Refusé';
    default:
      return '';
  }
};

const getStatusIcon = (status: ShiftExchange['status']) => {
  switch (status) {
    case 'pending':
      return <RefreshCcw className="h-4 w-4 text-yellow-500" />;
    case 'approved':
      return <UserCheck className="h-4 w-4 text-green-500" />;
    case 'rejected':
      return <UserX className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

// Calculer la durée d'un shift
const calculateShiftDuration = (shift: Shift): number => {
  const [startHourStr, startMinStr] = shift.startTime.split(':');
  const [endHourStr, endMinStr] = shift.endTime.split(':');
  
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
const formatHours = (hours: number): string => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  
  return `${wholeHours}h${minutes}`;
};

const ShiftExchanges = () => {
  const [tab, setTab] = useState('my');
  const [exchanges, setExchanges] = useState<ShiftExchange[]>(mockExchanges);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [targetShift, setTargetShift] = useState<Shift | null>(null);
  const [targetEmployee, setTargetEmployee] = useState<Employee | null>(null);
  const [reason, setReason] = useState('');
  const [exchangeDetails, setExchangeDetails] = useState<ShiftExchange | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExchangeDialog, setShowExchangeDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShiftExchange['status'] | 'all'>('all');
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Simuler un temps de chargement
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);
  
  // Filtrer les échanges selon le critère sélectionné
  const filteredExchanges = useMemo(() => {
    return exchanges.filter(exchange => {
      const matchesStatus = statusFilter === 'all' || exchange.status === statusFilter;
      const matchesSearch = !searchQuery || 
        exchange.targetEmployee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exchange.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exchange.response?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      
      return matchesStatus && matchesSearch;
    });
  }, [exchanges, statusFilter, searchQuery]);
  
  const getColleagueShifts = (colleagueId: string) => {
    const colleague = colleagues.find(c => c.id === colleagueId);
    return colleague ? colleague.shifts : [];
  };
  
  const handleSubmitExchange = () => {
    if (!selectedShift || !targetShift || !targetEmployee || !reason.trim()) {
      toast({
        title: "Données manquantes",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simuler un temps de traitement
    setTimeout(() => {
      const newExchange: ShiftExchange = {
        id: `ex${exchanges.length + 1}`,
        myShift: selectedShift,
        targetShift,
        targetEmployee,
        reason,
        status: 'pending',
        createdAt: new Date()
      };
      
      setExchanges([newExchange, ...exchanges]);
      setSelectedShift(null);
      setTargetShift(null);
      setTargetEmployee(null);
      setReason('');
      setShowExchangeDialog(false);
      setIsSubmitting(false);
      
    toast({
        title: "Demande envoyée",
        description: "Votre demande d'échange a été envoyée avec succès.",
      });
    }, 1500);
  };
  
  const openExchangeDetails = (exchange: ShiftExchange) => {
    setExchangeDetails(exchange);
  };
  
  const handleCancelExchange = (exchangeId: string) => {
    setExchanges(exchanges.filter(exchange => exchange.id !== exchangeId));
    setExchangeDetails(null);
    
    toast({
      title: "Demande annulée",
      description: "Votre demande d'échange a été annulée."
    });
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
            <Skeleton className="h-16 w-full rounded-lg" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 pb-16"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Échanges de services</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Gérez vos demandes d'échanges de services avec vos collègues
                </p>
              </div>
              <Button 
                onClick={() => setShowExchangeDialog(true)}
                className="w-full md:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" /> Nouvelle demande
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher un échange..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ShiftExchange['status'] | 'all')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvés</SelectItem>
                  <SelectItem value="rejected">Refusés</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {filteredExchanges.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <FilterX className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="font-medium text-lg">Aucun échange trouvé</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {statusFilter !== 'all' || searchQuery 
                      ? "Essayez de modifier vos critères de filtrage"
                      : "Vous n'avez pas encore de demandes d'échanges"}
                  </p>
                  {(statusFilter !== 'all' || searchQuery) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => {
                        setStatusFilter('all');
                        setSearchQuery('');
                      }}
                    >
                      <FilterX className="h-4 w-4 mr-2" /> Réinitialiser les filtres
            </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredExchanges.map(exchange => (
                  <motion.div
                    key={exchange.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Card 
                      className={cn(
                        "shadow-sm cursor-pointer overflow-hidden",
                        exchange.status === 'pending' && "border-yellow-200",
                        exchange.status === 'approved' && "border-green-200",
                        exchange.status === 'rejected' && "border-red-200"
                      )}
                      onClick={() => openExchangeDetails(exchange)}
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col">
                          {/* Barre de statut */}
                          <div className={cn(
                            "py-1.5 px-4 flex items-center justify-between",
                            exchange.status === 'pending' && "bg-yellow-50",
                            exchange.status === 'approved' && "bg-green-50",
                            exchange.status === 'rejected' && "bg-red-50"
                          )}>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(exchange.status)}
                              <span className={cn(
                                "text-sm font-medium",
                                exchange.status === 'pending' && "text-yellow-700",
                                exchange.status === 'approved' && "text-green-700",
                                exchange.status === 'rejected' && "text-red-700"
                              )}>
                                {getStatusText(exchange.status)}
                              </span>
                            </div>
                            <Badge variant="outline" className={cn(
                              "font-normal text-xs",
                              getStatusColor(exchange.status)
                            )}>
                              {format(exchange.createdAt, 'dd/MM/yyyy')}
                            </Badge>
                          </div>
                          
                          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Mon service */}
                            <div className="space-y-2">
                              <h3 className="text-sm font-medium flex items-center">
                                <CalendarCheck className="h-4 w-4 mr-1 text-primary" />
                                Mon service
                              </h3>
                              <div className="bg-background rounded-md p-2 border">
                                <div className="font-medium">
                                  {formatShiftDate(exchange.myShift.date)}
                                </div>
                                <div className="text-sm flex items-center text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  {formatShiftTime(exchange.myShift)}
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {exchange.myShift.restaurant}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            {/* Service demandé */}
                            <div className="space-y-2">
                              <h3 className="text-sm font-medium flex items-center">
                                <ArrowLeftRight className="h-4 w-4 mr-1 text-primary" />
                                Service demandé
                              </h3>
                              <div className="bg-background rounded-md p-2 border">
                                <div className="font-medium">
                                  {formatShiftDate(exchange.targetShift.date)}
                                </div>
                                <div className="text-sm flex items-center text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  {formatShiftTime(exchange.targetShift)}
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {exchange.targetShift.restaurant}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="px-4 pb-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <Avatar className="h-7 w-7 mr-2">
                                <AvatarFallback>{exchange.targetEmployee.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{exchange.targetEmployee.name}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* Nouvelle demande d'échange */}
            <Dialog open={showExchangeDialog} onOpenChange={setShowExchangeDialog}>
              <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nouvelle demande d'échange</DialogTitle>
              <DialogDescription>
                    Créez une demande d'échange de service avec un collègue
              </DialogDescription>
            </DialogHeader>
            
                <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="myShift">Mon service à échanger</Label>
                    <Select 
                      value={selectedShift?.id || ''} 
                      onValueChange={(value) => {
                        const shift = myShifts.find(s => s.id === value);
                        setSelectedShift(shift || null);
                      }}
                    >
                      <SelectTrigger id="myShift">
                        <SelectValue placeholder="Sélectionner un service" />
                  </SelectTrigger>
                  <SelectContent>
                        {myShifts.map(shift => (
                      <SelectItem key={shift.id} value={shift.id}>
                            {formatShiftDate(shift.date)} ({formatShiftTime(shift)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
                <div className="space-y-2">
                    <Label htmlFor="colleague">Collègue</Label>
                <Select 
                      value={targetEmployee?.id || ''} 
                  onValueChange={(value) => {
                        const employee = colleagues.find(c => c.id === value);
                        setTargetEmployee(employee || null);
                        setTargetShift(null); // Réinitialiser le service cible
                  }}
                      disabled={!selectedShift}
                >
                      <SelectTrigger id="colleague">
                        <SelectValue placeholder="Sélectionner un collègue" />
                    </SelectTrigger>
                    <SelectContent>
                        {colleagues.map(colleague => (
                      <SelectItem key={colleague.id} value={colleague.id}>
                            {colleague.name}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                </div>
              
                <div className="space-y-2">
                    <Label htmlFor="targetShift">Service souhaité</Label>
                  <Select
                      value={targetShift?.id || ''} 
                      onValueChange={(value) => {
                        const shifts = targetEmployee ? getColleagueShifts(targetEmployee.id) : [];
                        const shift = shifts.find(s => s.id === value);
                        setTargetShift(shift || null);
                      }}
                      disabled={!targetEmployee}
                    >
                      <SelectTrigger id="targetShift">
                        <SelectValue placeholder="Sélectionner un service" />
                    </SelectTrigger>
                    <SelectContent>
                        {targetEmployee && getColleagueShifts(targetEmployee.id).map(shift => (
                        <SelectItem key={shift.id} value={shift.id}>
                            {formatShiftDate(shift.date)} ({formatShiftTime(shift)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              
              <div className="space-y-2">
                    <Label htmlFor="reason">Raison de l'échange</Label>
                <Textarea
                  id="reason"
                      placeholder="Expliquez pourquoi vous souhaitez échanger ce service..." 
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>
            
              <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowExchangeDialog(false)}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
              <Button 
                onClick={handleSubmitExchange} 
                    disabled={!selectedShift || !targetShift || !targetEmployee || !reason.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCcw className="h-4 w-4 mr-2 animate-spin" /> Envoi en cours...
                      </>
                    ) : (
                      <>
                        <ArrowLeftRight className="h-4 w-4 mr-2" /> Proposer l'échange
                      </>
                )}
              </Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>
            
            {/* Détails d'un échange */}
            {exchangeDetails && (
              <Dialog open={!!exchangeDetails} onOpenChange={() => setExchangeDetails(null)}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {getStatusIcon(exchangeDetails.status)}
                      <span>Détails de l'échange</span>
                    </DialogTitle>
                    <Badge variant="outline" className={cn(
                      "font-normal mt-2",
                      getStatusColor(exchangeDetails.status)
                    )}>
                      {getStatusText(exchangeDetails.status)}
                </Badge>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-2">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Mon service */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium flex items-center">
                            <CalendarCheck className="h-4 w-4 mr-1 text-primary" />
                            Mon service
                          </h3>
                          <Card>
                            <CardContent className="p-3">
                              <div className="font-medium">
                                {formatShiftDate(exchangeDetails.myShift.date)}
                          </div>
                              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {formatShiftTime(exchangeDetails.myShift)}
                          </div>
                              <Badge variant="outline" className="mt-2">
                                {exchangeDetails.myShift.restaurant}
                              </Badge>
            </CardContent>
          </Card>
                        </div>
                        
                        {/* Service demandé */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium flex items-center">
                            <ArrowLeftRight className="h-4 w-4 mr-1 text-primary" />
                            Service demandé
                          </h3>
          <Card>
                            <CardContent className="p-3">
                              <div className="font-medium">
                                {formatShiftDate(exchangeDetails.targetShift.date)}
            </div>
                              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {formatShiftTime(exchangeDetails.targetShift)}
                          </div>
                              <Badge variant="outline" className="mt-2">
                                {exchangeDetails.targetShift.restaurant}
                              </Badge>
            </CardContent>
          </Card>
                  </div>
                </div>
                
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <User className="h-4 w-4 mr-1 text-primary" />
                          Collègue concerné
                        </h3>
                        <div className="flex items-center bg-muted p-3 rounded-md">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>{exchangeDetails.targetEmployee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                          <span className="font-medium">{exchangeDetails.targetEmployee.name}</span>
                </div>
              </div>
              
              <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <Info className="h-4 w-4 mr-1 text-primary" />
                          Raison de l'échange
                        </h3>
                        <div className="bg-muted p-3 rounded-md text-sm">
                          {exchangeDetails.reason}
                </div>
              </div>
              
                      {exchangeDetails.response && (
                <div>
                          <h3 className="text-sm font-medium mb-2 flex items-center">
                            <MessageSquareText className="h-4 w-4 mr-1 text-primary" />
                            Réponse
                          </h3>
                          <div className="bg-muted p-3 rounded-md text-sm">
                            {exchangeDetails.response}
                  </div>
                </div>
              )}
              
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <CalendarTimeIcon className="h-4 w-4 mr-1 text-primary" />
                          Informations
                        </h3>
                        <div className="bg-muted p-3 rounded-md">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Date de création:</span>
                            <span>{format(exchangeDetails.createdAt, 'dd/MM/yyyy à HH:mm')}</span>
                          </div>
                        </div>
                      </div>
            </div>
            
            <DialogFooter>
                      {exchangeDetails.status === 'pending' && (
                <Button 
                  variant="destructive" 
                          onClick={() => handleCancelExchange(exchangeDetails.id)}
                >
                          <X className="h-4 w-4 mr-2" /> Annuler cette demande
                </Button>
              )}
                      <Button variant="outline" onClick={() => setExchangeDetails(null)}>
                        Fermer
                      </Button>
            </DialogFooter>
                  </div>
          </DialogContent>
      </Dialog>
            )}
            
            {/* Aide sur le fonctionnement des échanges */}
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium mb-1">Comment fonctionnent les échanges ?</h3>
                    <p className="text-sm text-muted-foreground">
                      Proposez à un collègue d'échanger un service. Une fois la demande envoyée, votre collègue recevra une notification et pourra accepter ou refuser l'échange. Les responsables seront automatiquement informés des échanges validés.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default ShiftExchanges; 