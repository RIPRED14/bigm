import React, { useState, useEffect, useMemo } from 'react';
import { format, addDays, differenceInDays, isToday, isBefore, addHours, parseISO, isAfter, isSameDay } from 'date-fns';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import useIsMobile from '@/hooks/useIsMobile';
import { 
  Calendar as CalendarIcon,
  Plus, 
  CalendarX,
  Clock,
  CalendarCheck,
  CalendarDays,
  X, 
  Check,
  AlertTriangle,
  FileText,
  SendHorizontal,
  Info,
  MoreHorizontal,
  Upload,
  ExternalLink
} from 'lucide-react';

// Types pour les absences
interface Absence {
  id: string;
  startDate: Date;
  endDate: Date;
  type: 'maladie' | 'congés payés' | 'congés sans solde' | 'autre';
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  comments?: string;
  submittedAt: Date;
  documents?: AbsenceDocument[];
  responseMessage?: string;
}

interface AbsenceDocument {
  id: string;
  name: string;
  url: string;
  uploadedAt: Date;
}

// Données mockées pour les absences
const mockAbsences: Absence[] = [
  {
    id: 'abs1',
    startDate: addDays(new Date(), 5),
    endDate: addDays(new Date(), 7),
    type: 'congés payés',
    status: 'pending',
    reason: 'Vacances familiales',
    submittedAt: new Date(),
  },
  {
    id: 'abs2',
    startDate: addDays(new Date(), -10),
    endDate: addDays(new Date(), -5),
    type: 'maladie',
    status: 'approved',
    reason: 'Grippe',
    submittedAt: addDays(new Date(), -12),
    documents: [
      {
        id: 'doc1',
        name: 'Certificat_medical.pdf',
        url: '#',
        uploadedAt: addDays(new Date(), -12),
      }
    ],
    responseMessage: 'Bon rétablissement, nous avons bien reçu votre certificat.'
  },
  {
    id: 'abs3',
    startDate: addDays(new Date(), -30),
    endDate: addDays(new Date(), -28),
    type: 'congés sans solde',
    status: 'rejected',
    reason: 'Événement personnel',
    submittedAt: addDays(new Date(), -35),
    responseMessage: 'Nous ne pouvons pas approuver cette demande en raison du manque d\'effectif sur cette période.'
  },
  {
    id: 'abs4',
    startDate: addDays(new Date(), 20),
    endDate: addDays(new Date(), 25),
    type: 'congés payés',
    status: 'approved',
    reason: 'Vacances d\'été',
    submittedAt: addDays(new Date(), -5),
    responseMessage: 'Demande approuvée, bon congé!'
  }
];

// Utilitaires et fonctions
const formatDateRange = (startDate: Date, endDate: Date) => {
  if (isSameDay(startDate, endDate)) {
    return format(startDate, 'dd MMMM yyyy', { locale: fr });
  }
  return `${format(startDate, 'dd MMM', { locale: fr })} - ${format(endDate, 'dd MMM yyyy', { locale: fr })}`;
};

const getDuration = (startDate: Date, endDate: Date) => {
  const days = differenceInDays(endDate, startDate) + 1;
  return `${days} jour${days > 1 ? 's' : ''}`;
};

const getStatusColor = (status: Absence['status']) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200';
    default:
      return '';
  }
};

const getStatusText = (status: Absence['status']) => {
  switch (status) {
    case 'approved':
      return 'Approuvé';
    case 'pending':
      return 'En attente';
    case 'rejected':
      return 'Refusé';
    default:
      return '';
  }
};

const getStatusIcon = (status: Absence['status']) => {
  switch (status) {
    case 'approved':
      return <Check className="h-3.5 w-3.5" />;
    case 'pending':
      return <Clock className="h-3.5 w-3.5" />;
    case 'rejected':
      return <X className="h-3.5 w-3.5" />;
    default:
      return null;
  }
};

const getTypeText = (type: Absence['type']) => {
  switch (type) {
    case 'maladie':
      return 'Arrêt maladie';
    case 'congés payés':
      return 'Congés payés';
    case 'congés sans solde':
      return 'Congés sans solde';
    case 'autre':
      return 'Autre absence';
    default:
      return '';
  }
};

const getTypeColor = (type: Absence['type']) => {
  switch (type) {
    case 'maladie':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'congés payés':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'congés sans solde':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'autre':
      return 'bg-slate-100 text-slate-800 border-slate-200';
    default:
      return '';
  }
};

// Composant d'affichage des détails d'une absence
interface AbsenceDetailsProps {
  absence: Absence | null;
  onClose: () => void;
}

const AbsenceDetails: React.FC<AbsenceDetailsProps> = ({ absence, onClose }) => {
  if (!absence) return null;
  
  const isPending = absence.status === 'pending';
  const canCancel = isPending && isAfter(absence.startDate, new Date());
  
  return (
    <DialogContent className="sm:max-w-[550px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <span>Détails de l'absence</span>
          <Badge variant="outline" className={cn(getStatusColor(absence.status))}>
            {getStatusIcon(absence.status)}
            <span className="ml-1">{getStatusText(absence.status)}</span>
          </Badge>
        </DialogTitle>
        <DialogDescription>
          Demande soumise le {format(absence.submittedAt, 'dd MMMM yyyy', { locale: fr })}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Type d'absence</Label>
            <Badge variant="outline" className={cn("mt-1", getTypeColor(absence.type))}>
              {getTypeText(absence.type)}
            </Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Durée</Label>
            <div className="font-medium">{getDuration(absence.startDate, absence.endDate)}</div>
          </div>
        </div>
        
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Période</Label>
          <div className="p-3 bg-muted/30 rounded-md">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatDateRange(absence.startDate, absence.endDate)}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Motif</Label>
          <div className="p-3 bg-muted/30 rounded-md">
            {absence.reason}
          </div>
        </div>
        
        {absence.documents && absence.documents.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Documents fournis</Label>
            <div className="space-y-2">
              {absence.documents.map(doc => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-2 border rounded-md bg-primary/5"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm">{doc.name}</span>
                  </div>
                  <Button variant="outline" size="sm" className="h-7">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Voir</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {absence.responseMessage && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Réponse du manager</Label>
            <div className={cn(
              "p-3 rounded-md",
              absence.status === 'approved' ? "bg-green-50 text-green-800" : 
              absence.status === 'rejected' ? "bg-red-50 text-red-800" : "bg-muted/30"
            )}>
              {absence.responseMessage}
            </div>
          </div>
        )}
        
        {isPending && (
          <Alert variant="default" className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-800" />
            <AlertTitle className="text-yellow-800">En attente de validation</AlertTitle>
            <AlertDescription className="text-yellow-800">
              Votre demande d'absence est en cours d'examen par votre manager.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <DialogFooter className="gap-2">
        {canCancel && (
          <Button variant="destructive" size="sm">
            <X className="h-4 w-4 mr-1" />
            Annuler cette demande
          </Button>
        )}
        <DialogClose asChild>
          <Button variant="outline">Fermer</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

// Composant principal
const EmployeeAbsences: React.FC = () => {
  const [newAbsenceDialogOpen, setNewAbsenceDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);
  const [absenceType, setAbsenceType] = useState<Absence['type']>('congés payés');
  const [absenceReason, setAbsenceReason] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [isDocumentProvided, setIsDocumentProvided] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Simuler un temps de chargement
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);
  
  // Filtrer les absences
  const upcomingAbsences = useMemo(() => {
    return mockAbsences.filter(absence => 
      isAfter(absence.endDate, new Date()) || 
      isSameDay(absence.endDate, new Date())
    );
  }, []);
  
  const pastAbsences = useMemo(() => {
    return mockAbsences.filter(absence => 
      isBefore(absence.endDate, new Date()) && 
      !isSameDay(absence.endDate, new Date())
    );
  }, []);
  
  const pendingAbsences = useMemo(() => {
    return mockAbsences.filter(absence => absence.status === 'pending');
  }, []);
  
  // Validation du formulaire
  const isFormValid = Boolean(
    absenceType && 
    dateRange.from && 
    dateRange.to && 
    absenceReason.trim().length > 0 &&
    (absenceType !== 'maladie' || isDocumentProvided)
  );
  
  // Ouverture des détails d'une absence
  const openAbsenceDetails = (absence: Absence) => {
    setSelectedAbsence(absence);
    setDetailsDialogOpen(true);
  };
  
  // Soumission d'une nouvelle demande d'absence
  const handleSubmitAbsence = () => {
    if (!isFormValid || !dateRange.from || !dateRange.to) return;
    
    // En production, on enverrait une requête à l'API
    console.log('Nouvelle demande d\'absence:', {
      type: absenceType,
      startDate: dateRange.from,
      endDate: dateRange.to,
      reason: absenceReason,
      document: isDocumentProvided ? documentName : undefined
    });
    
    // Fermer la boîte de dialogue et réinitialiser le formulaire
    setNewAbsenceDialogOpen(false);
    setAbsenceType('congés payés');
    setDateRange({ from: undefined, to: undefined });
    setAbsenceReason('');
    setIsDocumentProvided(false);
    setDocumentName('');
    
    // Afficher une notification de succès
    toast({
      title: "Demande envoyée",
      description: "Votre demande d'absence a été soumise avec succès.",
    });
  };
  
  // Gestion du téléchargement de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsDocumentProvided(true);
      setDocumentName(e.target.files[0].name);
    }
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
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-32" />
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Mes absences</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Gérez vos demandes de congés et absences
                </p>
              </div>
              
              <Dialog open={newAbsenceDialogOpen} onOpenChange={setNewAbsenceDialogOpen}>
          <DialogTrigger asChild>
                  <Button className="gap-2">
              <Plus className="h-4 w-4" />
                    {isMobile ? 'Demande' : 'Nouvelle demande'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
                    <DialogTitle>Nouvelle demande d'absence</DialogTitle>
              <DialogDescription>
                      Remplissez ce formulaire pour soumettre une demande d'absence
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
                <div className="space-y-2">
                      <Label htmlFor="absence-type">Type d'absence</Label>
                      <Select value={absenceType} onValueChange={(value: Absence['type']) => setAbsenceType(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type d'absence" />
                  </SelectTrigger>
                  <SelectContent>
                          <SelectItem value="congés payés">Congés payés</SelectItem>
                          <SelectItem value="congés sans solde">Congés sans solde</SelectItem>
                          <SelectItem value="maladie">Arrêt maladie</SelectItem>
                          <SelectItem value="autre">Autre absence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
                <div className="space-y-2">
                      <Label>Période d'absence</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateRange.from && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, "dd MMM yyyy", { locale: fr })} - {format(dateRange.to, "dd MMM yyyy", { locale: fr })}
                                </>
                              ) : (
                                format(dateRange.from, "dd MMMM yyyy", { locale: fr })
                              )
                            ) : (
                              "Sélectionner les dates"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange.from}
                            selected={{
                              from: dateRange.from,
                              to: dateRange.to
                            }}
                            onSelect={(range) => {
                              if (range) {
                                setDateRange({ 
                                  from: range.from, 
                                  to: range.to 
                                });
                              }
                            }}
                            numberOfMonths={isMobile ? 1 : 2}
                            disabled={(date) => isBefore(date, new Date()) && !isSameDay(date, new Date())}
                          />
                        </PopoverContent>
                      </Popover>
                      
                      {dateRange.from && dateRange.to && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Durée: {getDuration(dateRange.from, dateRange.to)}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="absence-reason">Motif</Label>
                      <Textarea
                        id="absence-reason"
                        placeholder="Précisez le motif de votre absence"
                        value={absenceReason}
                        onChange={(e) => setAbsenceReason(e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    {absenceType === 'maladie' && (
                      <div className="space-y-2">
                        <Label htmlFor="document-upload">Certificat médical</Label>
                        <div className="flex items-center gap-2">
                          <label htmlFor="document-upload" className="w-full">
                            <div className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-muted transition-colors">
                              <Upload className="h-4 w-4 text-primary" />
                              <span className="text-sm">
                                {isDocumentProvided ? documentName : "Télécharger un justificatif"}
                              </span>
                            </div>
                            <input 
                              type="file"
                              id="document-upload"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleFileChange}
                            />
                          </label>
                  </div>
                        {absenceType === 'maladie' && !isDocumentProvided && (
                          <p className="text-xs text-red-500">* Certificat médical requis pour un arrêt maladie</p>
                        )}
                </div>
              )}
              
                    {dateRange.from && dateRange.to && differenceInDays(dateRange.to, dateRange.from) > 5 && (
                      <Alert className="bg-amber-50 border-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-800">Absence prolongée</AlertTitle>
                        <AlertDescription className="text-amber-700">
                          Les demandes d'absence de plus de 5 jours nécessitent généralement un délai de validation plus long.
                        </AlertDescription>
                      </Alert>
                    )}
            </div>
            
              <DialogFooter>
                <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
                </DialogClose>
              <Button 
                      onClick={handleSubmitAbsence} 
                disabled={!isFormValid}
                className="relative"
              >
                      <SendHorizontal className="h-4 w-4 mr-1" />
                      Soumettre la demande
                      {!isFormValid && absenceReason.trim().length > 0 && (
                  <span className="absolute -bottom-5 left-0 text-xs text-red-500">
                          {absenceType === 'maladie' && !isDocumentProvided 
                            ? "Justificatif requis" 
                            : "Veuillez compléter tous les champs"}
                  </span>
                )}
              </Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
            {/* Section récapitulative */}
            <Card className="border-none shadow-sm bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Congés restants</div>
                    <div className="text-2xl font-bold">15j</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Congés pris</div>
                    <div className="text-2xl font-bold">7j</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">En attente</div>
                    <div className="text-2xl font-bold">
                      {pendingAbsences.length}
                      <span className="text-xs text-muted-foreground font-normal ml-1">demande{pendingAbsences.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Alerte si une absence est en attente */}
            {pendingAbsences.length > 0 && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <Info className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Demande en cours</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  Vous avez {pendingAbsences.length} demande{pendingAbsences.length !== 1 ? 's' : ''} en attente de validation.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Onglets pour les différentes catégories d'absences */}
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="upcoming" className="gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  <span>À venir{upcomingAbsences.length > 0 && ` (${upcomingAbsences.length})`}</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <CalendarX className="h-4 w-4" />
                  <span>Historique{pastAbsences.length > 0 && ` (${pastAbsences.length})`}</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="space-y-4">
                {upcomingAbsences.length > 0 ? (
                  upcomingAbsences.map(absence => (
                    <motion.div
                      key={absence.id}
                      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                      className="rounded-lg bg-card border overflow-hidden"
                      onClick={() => openAbsenceDetails(absence)}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant="outline" className={cn("gap-1", getTypeColor(absence.type))}>
                            {getTypeText(absence.type)}
                          </Badge>
                          <Badge variant="outline" className={cn("gap-1", getStatusColor(absence.status))}>
                            {getStatusIcon(absence.status)}
                            <span className="ml-1">{getStatusText(absence.status)}</span>
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatDateRange(absence.startDate, absence.endDate)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {absence.reason}
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {getDuration(absence.startDate, absence.endDate)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <CalendarCheck className="h-12 w-12 text-muted-foreground/40 mb-2" />
                    <p className="text-muted-foreground">Aucune absence à venir</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setNewAbsenceDialogOpen(true)}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Demander une absence
                    </Button>
              </div>
              )}
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                {pastAbsences.length > 0 ? (
                  pastAbsences.map(absence => (
                    <motion.div
                      key={absence.id}
                      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                      className="rounded-lg bg-card border overflow-hidden"
                      onClick={() => openAbsenceDetails(absence)}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant="outline" className={cn("gap-1", getTypeColor(absence.type))}>
                            {getTypeText(absence.type)}
                          </Badge>
                          <Badge variant="outline" className={cn("gap-1", getStatusColor(absence.status))}>
                            {getStatusIcon(absence.status)}
                            <span className="ml-1">{getStatusText(absence.status)}</span>
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatDateRange(absence.startDate, absence.endDate)}</span>
                        </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {absence.reason}
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {getDuration(absence.startDate, absence.endDate)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <CalendarX className="h-12 w-12 text-muted-foreground/40 mb-2" />
                    <p className="text-muted-foreground">Aucun historique d'absence</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Dialogue de détails d'absence */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <AbsenceDetails 
          absence={selectedAbsence} 
          onClose={() => setDetailsDialogOpen(false)} 
        />
      </Dialog>
    </PageContainer>
  );
};

export default EmployeeAbsences; 