import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import StatsCard from '@/components/ui/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, Calendar, Clock, Bell, ArrowRight, 
  Info, Settings, LogOut, ChevronRight, 
  CalendarRange, Briefcase, UserCircle, CalendarX,
  AlertTriangle, CheckCircle2, MapPin, Phone,
  Coffee, UtensilsCrossed, Edit, Edit2, PlusCircle, X, Check, Share2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useInterface } from '@/hooks/use-interface';
import { AuthContext } from '@/App';
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { format, addHours, isToday, parseISO, isBefore, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('today');
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const { isEmployeeInterface, navigateToAdmin } = useInterface();
  
  // Vérifier que nous sommes bien dans la bonne interface
  useEffect(() => {
    if (isEmployeeInterface) {
      console.log('Correction d\'interface: Redirection vers le dashboard admin');
      navigateToAdmin();
    }
  }, [isEmployeeInterface, navigateToAdmin]);

  // Date actuelle
  const now = new Date();
  const currentTime = format(now, 'HH:mm');
  
  // Données pour les shifts du jour (plus détaillées et avec statut en temps réel)
  const todayShifts = [
    { 
      id: 1, 
      employee: 'John Doe',
      startTime: '08:00', 
      endTime: '16:00', 
      status: currentTime > '08:00' && currentTime < '16:00' ? 'active' : currentTime > '16:00' ? 'completed' : 'upcoming',
      phone: '06 12 34 56 78',
      notes: 'Responsable ouverture',
      avatarUrl: ''
    },
    { 
      id: 2, 
      employee: 'Jane Smith',
      startTime: '10:00', 
      endTime: '18:00', 
      status: currentTime > '10:00' && currentTime < '18:00' ? 'active' : currentTime > '18:00' ? 'completed' : 'upcoming',
      phone: '06 98 76 54 32',
      notes: 'Formation nouveau système',
      avatarUrl: ''
    },
    { 
      id: 3, 
      employee: 'Mike Johnson',
      startTime: '12:00', 
      endTime: '20:00', 
      status: currentTime > '12:00' && currentTime < '20:00' ? 'active' : currentTime > '20:00' ? 'completed' : 'upcoming',
      phone: '07 11 22 33 44',
      notes: '',
      avatarUrl: ''
    },
    { 
      id: 4, 
      employee: 'Sarah Williams',
      startTime: '16:00', 
      endTime: '00:00', 
      status: currentTime > '16:00' && currentTime < '23:59' ? 'active' : 'upcoming',
      phone: '06 55 66 77 88',
      notes: 'Responsable fermeture',
      avatarUrl: ''
    },
  ];

  // Trouver les employés actuellement en service
  const activeEmployees = todayShifts.filter(shift => shift.status === 'active');

  // Adapter les alertes pour qu'elles soient cohérentes avec la plateforme
  const todayAlerts = [
    { 
      id: 1,
      type: 'absence', 
      employee: 'Alex Rodriguez', 
      reason: 'Maladie', 
      severity: 'high',
      time: '08:30',
      isRead: false,
      actions: [
        { label: 'Contacter', icon: Phone, action: 'tel:0612345678' },
        { label: 'Remplacer', icon: UserCircle, action: '/daily-planning?action=replace&id=5' }
      ]
    },
    { 
      id: 2,
      type: 'schedule', 
      employee: 'Mike Johnson', 
      message: 'En retard de 15 minutes', 
      severity: 'medium',
      time: '11:45',
      isRead: true,
      actions: [
        { label: 'Contacter', icon: Phone, action: 'tel:0698765432' },
        { label: 'Ajuster', icon: Edit, action: '/daily-planning?action=edit&id=3' }
      ]
    },
    { 
      id: 3,
      type: 'info', 
      message: 'Livraison de fournitures à 15:00', 
      severity: 'low',
      time: '09:15',
      isRead: false,
      actions: [
        { label: 'Noter', icon: Check, action: 'markAsRead' }
      ]
    },
  ];

  // Données pour les stats rapides
  const quickStats = [
    { 
      title: 'Personnel Prévu', 
      value: todayShifts.length.toString(), 
      icon: Users,
      color: 'blue'
    },
    { 
      title: 'Heures Totales', 
      value: '72', 
      icon: Clock,
      color: 'purple'
    },
    { 
      title: 'En Service', 
      value: activeEmployees.length.toString(), 
      icon: CheckCircle2,
      color: 'green'
    },
    { 
      title: 'Absents', 
      value: todayAlerts.filter(a => a.type === 'absence').length.toString(), 
      icon: CalendarX,
      color: 'amber'
    },
  ];

  // Données pour la semaine (pour l'onglet "Semaine")
  const weekShifts = [
    { day: 'Lundi', date: '24 Juin', totalEmployees: 9, totalHours: 72 },
    { day: 'Mardi', date: '25 Juin', totalEmployees: 8, totalHours: 64 },
    { day: 'Mercredi', date: '26 Juin', totalEmployees: 10, totalHours: 80 },
    { day: 'Jeudi', date: '27 Juin', totalEmployees: 11, totalHours: 88 },
    { day: 'Vendredi', date: '28 Juin', totalEmployees: 12, totalHours: 96 },
    { day: 'Samedi', date: '29 Juin', totalEmployees: 12, totalHours: 96 },
    { day: 'Dimanche', date: '30 Juin', totalEmployees: 8, totalHours: 64 },
  ];

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    auth?.setIsLoggedIn(false);
    auth?.setInterface(null);
    navigate('/login');
  };

  // Fonction pour gérer la navigation
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Fonction pour afficher le statut du shift
  const getShiftStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">En service</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">Terminé</Badge>;
      case 'upcoming':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">À venir</Badge>;
      default:
        return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">{status}</Badge>;
    }
  };

  // Fonction pour afficher la sévérité d'une alerte
  const getAlertSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Important</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Information</Badge>;
      default:
        return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">{severity}</Badge>;
    }
  };

  // Fonction pour calculer le pourcentage d'avancement du shift
  const calculateShiftProgress = (startTime: string, endTime: string) => {
    const start = new Date();
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    start.setHours(startHours, startMinutes, 0, 0);

    const end = new Date();
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    end.setHours(endHours, endMinutes, 0, 0);
    
    // Si le shift se termine le jour suivant
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    const now = new Date();
    
    // Si le shift n'a pas commencé
    if (now < start) return 0;
    
    // Si le shift est terminé
    if (now > end) return 100;
    
    // Calculer le pourcentage d'avancement
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.floor((elapsed / totalDuration) * 100);
  };

  return (
    <PageContainer className={isMobile ? "pt-2 px-2" : "pt-6"}>
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h1 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'} mb-1`}>
              Dashboard Manager
            </h1>
            <p className="text-muted-foreground text-sm">
              {format(now, "EEEE d MMMM", { locale: fr })} - {currentTime}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isMobile && (
              <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4 mr-1" />
                Réglages
              </Button>
            )}
            <Button variant="outline" size="sm" className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              {!isMobile && "Déconnexion"}
            </Button>
          </div>
        </div>
        
        {/* Navigation principale par onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-2 mb-2">
            <TabsTrigger value="today" className="text-sm py-1.5">
              <Calendar className="h-4 w-4 mr-1.5" />
              Aujourd'hui
            </TabsTrigger>
            <TabsTrigger value="week" className="text-sm py-1.5">
              <CalendarRange className="h-4 w-4 mr-1.5" />
              Semaine
            </TabsTrigger>
          </TabsList>
        
          {/* Actions rapides */}
          <div className="flex items-center justify-end gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/daily-planning')} className="h-8">
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Modifier Planning
            </Button>
            <Button size="sm" onClick={() => navigate('/daily-planning?action=add')} className="h-8">
              <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
              Ajouter Shift
            </Button>
          </div>
          
          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {quickStats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              className="h-full"
              compact={true}
            />
          ))}
        </div>

          {/* Contenu principal par onglet */}
          <TabsContent value="today" className="mt-0 pt-0 space-y-4">
            {/* Carte des employés en service maintenant */}
            <Card className="shadow-sm border-green-200">
              <CardHeader className="pb-2 bg-green-50">
                <div className="flex items-center justify-between">
                  <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} flex items-center gap-2`}>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    En Service Maintenant
                  </CardTitle>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    {activeEmployees.length} employés
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {activeEmployees.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activeEmployees.map((employee) => (
                      <div 
                        key={employee.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-green-100 bg-green-50/50"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-green-100 text-green-800">
                            {employee.employee.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{employee.employee}</p>
                            {employee.notes && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                                {employee.notes}
                              </Badge>
                            )}
                          </div>
                          <div className="flex mt-1 justify-between text-sm text-muted-foreground">
                            <span>{employee.startTime} - {employee.endTime}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => window.open(`tel:${employee.phone}`)}>
                              <Phone className="h-3.5 w-3.5" />
                            </Button>
      </div>
              </div>
                  </div>
                ))}
              </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Aucun employé en service actuellement</p>
                    <p className="text-sm">Prochain service prévu à {todayShifts.find(s => s.status === 'upcoming')?.startTime || '--:--'}</p>
            </div>
                )}
            </CardContent>
          </Card>
          
            {/* Tous les shifts du jour */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>Planning du jour</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => navigate('/daily-planning')}>
                    <Calendar className="h-4 w-4 mr-1.5" />
                    Détails
            </Button>
          </div>
                <CardDescription>
                  {todayShifts.length} shifts programmés
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3">
                  {todayShifts.map((shift) => (
                  <div 
                    key={shift.id} 
                      className={`p-3 rounded-lg border ${
                        shift.status === 'active' ? 'border-green-200 bg-green-50/50' : 
                        shift.status === 'completed' ? 'border-slate-200 bg-slate-50/50 opacity-70' : 
                        'border-blue-200 bg-blue-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                          {shift.employee.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                            <p className="font-medium">{shift.employee}</p>
                            {shift.notes && (
                              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                {shift.notes}
                              </span>
                            )}
                          </div>
                        </div>
                        {getShiftStatusBadge(shift.status)}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{shift.startTime} - {shift.endTime}</span>
                          <span className="text-muted-foreground">
                            {shift.status === 'active' && `${calculateShiftProgress(shift.startTime, shift.endTime)}% effectué`}
                          </span>
                    </div>
                        
                        {shift.status === 'active' && (
                          <Progress value={calculateShiftProgress(shift.startTime, shift.endTime)} className="h-1.5" />
                        )}
                        
                        <div className="flex justify-end gap-2 pt-1">
                          <Button variant="ghost" size="sm" className="h-7" onClick={() => window.open(`tel:${shift.phone}`)}>
                            <Phone className="h-3.5 w-3.5 mr-1.5" />
                            <span className={isMobile ? "sr-only" : ""}>Appeler</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7" onClick={() => navigate(`/employees?id=${shift.id}`)}>
                            <UserCircle className="h-3.5 w-3.5 mr-1.5" />
                            <span className={isMobile ? "sr-only" : ""}>Profil</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7" onClick={() => navigate(`/daily-planning?action=edit&id=${shift.id}`)}>
                            <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                            <span className={isMobile ? "sr-only" : ""}>Modifier</span>
                    </Button>
                        </div>
                      </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
            
            {/* Modifier la vue jour pour remplacer la section heures de pointe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Alertes du jour - avec actions */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>
                      Alertes du jour
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                        {todayAlerts.filter(a => !a.isRead).length} non lues
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <Check className="h-3.5 w-3.5" />
              </Button>
            </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {todayAlerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`p-3 rounded-lg border ${
                          alert.isRead ? 'border-muted bg-muted/20' : 'border-muted'
                        }`}
                  >
                    <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {alert.type === 'absence' ? (
                              <CalendarX className="h-4 w-4 text-red-600" />
                            ) : alert.type === 'schedule' ? (
                              <Clock className="h-4 w-4 text-amber-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-blue-600" />
                            )}
                            <span className="font-medium">
                              {alert.type === 'absence' ? 'Absence' : 
                                alert.type === 'schedule' ? 'Retard' : 
                                'Information'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{alert.time}</span>
                            {getAlertSeverityBadge(alert.severity)}
                          </div>
                        </div>
                        <div className="mt-2 mb-2 text-sm">
                          {alert.type === 'absence' && (
                            <span>{alert.employee} - {alert.reason}</span>
                          )}
                          {alert.type === 'schedule' && (
                            <span>{alert.employee} - {alert.message}</span>
                          )}
                          {alert.type === 'info' && (
                            <span>{alert.message}</span>
                          )}
                        </div>
                        <div className="flex justify-end gap-1 pt-1">
                          {alert.actions.map((action, i) => (
                            <Button 
                              key={i}
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-xs"
                              onClick={() => {
                                if (action.action.startsWith('tel:')) {
                                  window.open(action.action);
                                } else if (action.action === 'markAsRead') {
                                  // Logic to mark as read would go here
                                  console.log(`Alerte ${alert.id} marquée comme lue`);
                                } else {
                                  navigate(action.action);
                                }
                              }}
                            >
                              <action.icon className="h-3.5 w-3.5 mr-1" />
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Nouvelle carte pour le partage de planning */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>
                    Partage du Planning
                  </CardTitle>
                  <CardDescription>
                    Publiez le planning pour le rendre visible aux employés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg border bg-muted/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CalendarRange className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">État du planning de la semaine</span>
                        </div>
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                          En attente
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1 mb-3">
                        {weekShifts.map((day, index) => {
                          // Définir si le jour est complet (au moins 5 employés pour cet exemple)
                          const isComplete = day.totalEmployees >= 5;
                          return (
                            <div key={index} className="text-center">
                              <div className="text-xs">{day.day.slice(0, 3)}</div>
                              <div className={`h-2 w-full rounded-full mt-1 ${isComplete ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-4">
                        Les jours en orange ne sont pas suffisamment couverts. Il est recommandé de vérifier ces journées avant de partager le planning.
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full" variant="default">
                            <Share2 className="h-4 w-4 mr-2" />
                            Partager le planning
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirmation de partage</DialogTitle>
                            <DialogDescription>
                              Vous êtes sur le point de partager le planning avec tous les employés.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="py-4">
                            <h3 className="font-medium mb-2">État des journées :</h3>
                            <div className="space-y-2">
                              {weekShifts.map((day, index) => {
                                // Définir si le jour est complet (au moins 5 employés pour cet exemple)
                                const isComplete = day.totalEmployees >= 5;
                                return (
                                  <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {isComplete 
                                        ? <CheckCircle2 className="h-4 w-4 text-green-600" /> 
                                        : <AlertTriangle className="h-4 w-4 text-amber-600" />
                                      }
                                      <span>{day.day} ({day.date})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">{day.totalEmployees} employés</span>
                                      <Badge variant="outline" className={isComplete ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                                        {isComplete ? 'Complet' : 'Incomplet'}
                                      </Badge>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                <p className="text-sm">
                                  Certains jours n'ont pas suffisamment d'employés programmés. Souhaitez-vous tout de même partager le planning ?
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Annuler</Button>
                            </DialogClose>
                            <Button onClick={() => {
                              // Logique pour partager le planning
                              console.log("Planning partagé avec les employés");
                              // Vous pourriez afficher une notification ici
                            }}>
                              Confirmer le partage
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="p-3 rounded-lg border">
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-600" />
                        Historique des partages
                      </h3>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        Dernière publication : <span className="font-medium">22 juin 2023 à 15:45</span>
                      </div>
                      
                      <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/reports/planning-history')}>
                        Voir l'historique complet
                      </Button>
                    </div>
              </div>
            </CardContent>
          </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="week" className="mt-0 pt-0">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>Planning hebdomadaire</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => navigate('/planning')}>
                    <CalendarRange className="h-4 w-4 mr-1.5" />
                    Planning complet
                  </Button>
                </div>
                <CardDescription>
                  Aperçu des shifts pour la semaine
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isMobile ? (
                    // Vue mobile optimisée pour la semaine
                    <div className="space-y-3">
                      {weekShifts.map((day, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border ${
                            format(now, 'EEEE', { locale: fr }) === day.day ? 
                            'border-primary bg-primary/5' : 'border-muted'
                          }`}
                        >
                <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Calendar className={`h-4 w-4 ${
                                format(now, 'EEEE', { locale: fr }) === day.day ?
                                'text-primary' : 'text-muted-foreground'
                              }`} />
                              <div>
                                <span className="font-medium">{day.day}</span>
                                <span className="text-xs text-muted-foreground ml-2">{day.date}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{day.totalEmployees}</div>
                              <div className="text-xs text-muted-foreground">employés</div>
                            </div>
                          </div>
                          
                          <div className="mt-2 flex justify-between items-center">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Total:</span> {day.totalHours}h
                            </div>
                            
                            {format(now, 'EEEE', { locale: fr }) === day.day && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs" 
                                onClick={() => setActiveTab('today')}
                              >
                                Voir détails
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Vue desktop avec grille
                    <>
                      <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground mb-2">
                        <div>Lun</div>
                        <div>Mar</div>
                        <div>Mer</div>
                        <div>Jeu</div>
                        <div>Ven</div>
                        <div>Sam</div>
                        <div>Dim</div>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-2">
                        {weekShifts.map((day, index) => (
                          <Card key={index} className={`border ${format(now, 'EEEE', { locale: fr }) === day.day ? 'border-primary' : 'border-muted'}`}>
                            <CardContent className={`p-3 text-center ${format(now, 'EEEE', { locale: fr }) === day.day ? 'bg-primary/5' : ''}`}>
                              <p className="font-medium">{day.date}</p>
                              <div className="text-2xl font-bold mt-1">{day.totalEmployees}</div>
                              <p className="text-xs text-muted-foreground">employés</p>
                              <div className="mt-2 text-sm font-medium">{day.totalHours}h</div>
                              <p className="text-xs text-muted-foreground">total</p>
                              
                              {format(now, 'EEEE', { locale: fr }) === day.day && (
                                <Button variant="outline" size="sm" className="w-full mt-2 text-xs py-0.5" onClick={() => setActiveTab('today')}>
                                  Aujourd'hui
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                  
                  <div className="mt-4">
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">Bilan hebdomadaire</CardTitle>
                      </CardHeader>
                      <CardContent className="py-0">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary">
                              {weekShifts.reduce((total, day) => total + day.totalEmployees, 0)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Shifts programmés
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">
                              {weekShifts.reduce((total, day) => total + day.totalHours, 0)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Heures totales
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">
                              {Math.round(weekShifts.reduce((total, day) => total + day.totalHours, 0) / weekShifts.reduce((total, day) => total + day.totalEmployees, 0))}
                </div>
                            <div className="text-xs text-muted-foreground">
                              Heures / Employé
                </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="default" 
                  onClick={() => navigate('/daily-planning')}
                  className="w-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier le planning de la semaine
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Actions rapides flottantes pour mobile */}
      {isMobile && (
        <div className="fixed bottom-20 right-4 flex flex-col gap-2">
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
            onClick={() => navigate('/daily-planning?action=add')}
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Ajouter des actions rapides supplémentaires en bas du dashboard */}
      <div className="mt-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 justify-center" onClick={() => navigate('/daily-planning')}>
                <Calendar className="h-5 w-5 mb-1" />
                <span>Planning</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 justify-center" onClick={() => navigate('/employees')}>
                <Users className="h-5 w-5 mb-1" />
                <span>Employés</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 justify-center" onClick={() => navigate('/messages')}>
                <Bell className="h-5 w-5 mb-1" />
                <span>Messages</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 justify-center" onClick={() => navigate('/reports')}>
                <Info className="h-5 w-5 mb-1" />
                <span>Rapports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
