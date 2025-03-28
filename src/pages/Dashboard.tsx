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
  Coffee, UtensilsCrossed, Edit, Edit2, PlusCircle, X, Check, Share2, Eye
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
      employee: 'Reda',
      startTime: '08:00', 
      endTime: '16:00', 
      status: currentTime > '08:00' && currentTime < '16:00' ? 'active' : currentTime > '16:00' ? 'completed' : 'upcoming',
      phone: '(+212) 601-234567',
      notes: 'Responsable ouverture',
      avatarUrl: ''
    },
    { 
      id: 2, 
      employee: 'Sami',
      startTime: '10:00', 
      endTime: '18:00', 
      status: currentTime > '10:00' && currentTime < '18:00' ? 'active' : currentTime > '18:00' ? 'completed' : 'upcoming',
      phone: '(+212) 602-345678',
      notes: 'Formation nouveau système',
      avatarUrl: ''
    },
    { 
      id: 3, 
      employee: 'Afif',
      startTime: '12:00', 
      endTime: '20:00', 
      status: currentTime > '12:00' && currentTime < '20:00' ? 'active' : currentTime > '20:00' ? 'completed' : 'upcoming',
      phone: '(+212) 603-456789',
      notes: '',
      avatarUrl: ''
    },
    { 
      id: 4, 
      employee: 'Reda',
      startTime: '16:00', 
      endTime: '00:00', 
      status: currentTime > '16:00' && currentTime < '23:59' ? 'active' : 'upcoming',
      phone: '(+212) 601-234567',
      notes: 'Responsable fermeture',
      avatarUrl: ''
    },
  ];

  // Trouver les employés actuellement en service
  const activeEmployees = todayShifts.filter(shift => shift.status === 'active');

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
    }
  ];

  // Données pour les stats rapides mobile uniquement
  const mobileQuickStats = [
    { 
      title: 'Personnel', 
      value: todayShifts.length.toString(), 
      icon: Users,
      color: 'primary'
    },
    { 
      title: 'Heures', 
      value: '72', 
      icon: Clock,
      color: 'primary'
    },
    { 
      title: 'En Service', 
      value: activeEmployees.length.toString(), 
      icon: CheckCircle2,
      color: 'green'
    },
    { 
      title: 'Prochain', 
      value: todayShifts.find(s => s.status === 'upcoming')?.startTime || '--:--', 
      icon: Calendar,
      color: 'blue'
    }
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
        <div className={`flex items-center justify-between gap-2 ${isMobile ? "mb-2" : "mb-3"}`}>
          <div>
            <h1 className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'} ${isMobile ? "" : "mb-1"}`}>
              Dashboard
            </h1>
            <p className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}>
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
              <LogOut className="h-4 w-4" />
              {!isMobile && "Déconnexion"}
            </Button>
          </div>
        </div>
        
        {/* Navigation principale par onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className={`${isMobile ? "mb-3" : "mb-4"}`}>
          <TabsList className={`grid grid-cols-2 ${isMobile ? "mb-1.5" : "mb-2"}`}>
            <TabsTrigger value="today" className={`text-sm ${isMobile ? "py-1 text-xs" : "py-1.5"}`}>
              <Calendar className={`${isMobile ? "h-3.5 w-3.5 mr-1" : "h-4 w-4 mr-1.5"}`} />
              Aujourd'hui
            </TabsTrigger>
            <TabsTrigger value="week" className={`text-sm ${isMobile ? "py-1 text-xs" : "py-1.5"}`}>
              <CalendarRange className={`${isMobile ? "h-3.5 w-3.5 mr-1" : "h-4 w-4 mr-1.5"}`} />
              Semaine
            </TabsTrigger>
          </TabsList>
        
          {/* Actions rapides - optimisées pour mobile */}
          {isMobile ? (
            <div className="flex items-center gap-1.5 mb-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/planning-viewer')} className="h-8 text-xs flex-1 border-blue-200 bg-blue-50 text-blue-800">
                <Eye className="h-3.5 w-3.5 mr-1" />
                Voir planning
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/daily-planning')} className="h-8 text-xs flex-1 border-green-200 bg-green-50 text-green-800">
                <Edit className="h-3.5 w-3.5 mr-1" />
                Modifier
              </Button>
              <Button size="sm" onClick={() => navigate('/daily-planning?action=add')} className="h-8 text-xs flex-1 bg-primary hover:bg-primary/90">
                <PlusCircle className="h-3.5 w-3.5 mr-1" />
                Ajouter
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/planning-viewer')} className="h-8">
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                Voir Planning
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/daily-planning')} className="h-8">
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                Modifier Planning
              </Button>
              <Button size="sm" onClick={() => navigate('/daily-planning?action=add')} className="h-8">
                <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                Ajouter Shift
              </Button>
            </div>
          )}
          
          {/* Statistiques rapides */}
          {isMobile ? (
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {mobileQuickStats.map((stat, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col items-center justify-center p-2 border rounded-lg ${
                    stat.color === 'green' ? 'bg-green-50 border-green-200' :
                    stat.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                    'bg-primary/5 border-primary/20'
                  }`}
                >
                  <div className="mb-1">
                    <stat.icon className={`h-4 w-4 ${
                      stat.color === 'green' ? 'text-green-600' :
                      stat.color === 'blue' ? 'text-blue-600' :
                      'text-primary'
                    }`} />
                  </div>
                  <div className="text-base font-bold leading-none">{stat.value}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 text-center">{stat.title}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
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
          )}

          {/* Contenu principal par onglet */}
          <TabsContent value="today" className="mt-0 pt-0 space-y-4">
            {/* Tous les shifts du jour - optimisé pour mobile et mis en premier */}
            {isMobile && (
              <Card className="shadow-sm border-primary/30">
                <CardHeader className={`pb-2 ${isMobile ? "py-2 bg-primary/5" : ""}`}>
                  <div className="flex items-center justify-between">
                    <CardTitle className={`${isMobile ? 'text-sm' : 'text-lg'} flex items-center gap-1`}>
                      <Calendar className="h-4 w-4 text-primary" />
                      Planning Aujourd'hui
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => navigate('/daily-planning')} className="h-7 text-xs bg-primary/10 border-primary/20 text-primary">
                      <Edit className="h-3 w-3 mr-1" />
                      Gérer
                    </Button>
                  </div>
                  <CardDescription className="text-xs">
                    {todayShifts.length} shifts programmés • {format(now, "EEEE d MMMM", { locale: fr })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2 px-2">
                  <div className="space-y-3">
                    {todayShifts.map((shift) => (
                      <div 
                        key={shift.id} 
                        className={`p-2.5 rounded-lg border ${
                          shift.status === 'active' ? 'border-green-200 bg-green-50/50' : 
                          shift.status === 'completed' ? 'border-slate-200 bg-slate-50/50 opacity-70' : 
                          'border-blue-200 bg-blue-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className={`${
                                shift.status === 'active' ? 'bg-green-100 text-green-800' : 
                                shift.status === 'completed' ? 'bg-slate-100 text-slate-800' : 
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {shift.employee.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{shift.employee}</p>
                              {shift.notes && (
                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                                  {shift.notes}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="scale-90 -mr-1 origin-right">
                            {getShiftStatusBadge(shift.status)}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-xs font-medium">{shift.startTime} - {shift.endTime}</span>
                            {shift.status === 'active' && (
                              <span className="text-muted-foreground text-xs">
                                {calculateShiftProgress(shift.startTime, shift.endTime)}%
                              </span>
                            )}
                          </div>
                          
                          {shift.status === 'active' && (
                            <Progress value={calculateShiftProgress(shift.startTime, shift.endTime)} className="h-1.5" />
                          )}
                          
                          <div className="flex justify-end gap-1 pt-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-1.5"
                              onClick={() => window.open(`tel:${shift.phone}`)}
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              <span className="sr-only">Appeler</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-1.5"
                              onClick={() => navigate(`/employees?id=${shift.id}`)}
                            >
                              <UserCircle className="h-3 w-3 mr-1" />
                              <span className="sr-only">Profil</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-1.5 text-primary"
                              onClick={() => navigate(`/daily-planning?action=edit&id=${shift.id}`)}
                            >
                              <Edit2 className="h-3 w-3 mr-1" />
                              <span className="sr-only">Modifier</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Carte des employés en service maintenant - optimisée pour mobile */}
            <Card className="shadow-sm border-green-200">
              <CardHeader className={`pb-2 bg-green-50 ${isMobile ? "py-2" : ""}`}>
                <div className="flex items-center justify-between">
                  <CardTitle className={`${isMobile ? 'text-sm' : 'text-lg'} flex items-center gap-1.5`}>
                    <CheckCircle2 className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} text-green-600`} />
                    En Service
                  </CardTitle>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                    {activeEmployees.length} employés
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className={`${isMobile ? "py-2 px-2" : "pt-4"}`}>
                {activeEmployees.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activeEmployees.map((employee) => (
                      <div 
                        key={employee.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border border-green-100 bg-green-50/50 ${isMobile ? "p-2" : ""}`}
                      >
                        <Avatar className={`${isMobile ? "h-8 w-8" : "h-10 w-10"}`}>
                          <AvatarFallback className="bg-green-100 text-green-800">
                            {employee.employee.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`font-medium ${isMobile ? "text-sm" : ""}`}>{employee.employee}</p>
                            {employee.notes && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                                {employee.notes}
                              </Badge>
                            )}
                          </div>
                          <div className="flex mt-1 justify-between text-sm text-muted-foreground">
                            <span className={isMobile ? "text-xs" : ""}>{employee.startTime} - {employee.endTime}</span>
                            <Button variant="ghost" size="icon" className={`${isMobile ? "h-5 w-5" : "h-6 w-6"}`} onClick={() => window.open(`tel:${employee.phone}`)}>
                              <Phone className={`${isMobile ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center ${isMobile ? "py-3" : "py-6"}`}>
                    <p className="text-muted-foreground text-sm">Aucun employé en service actuellement</p>
                    <p className={`${isMobile ? "text-xs" : "text-sm"}`}>Prochain service à {todayShifts.find(s => s.status === 'upcoming')?.startTime || '--:--'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Tous les shifts du jour - optimisé pour mobile
               - Supprimé pour mobile car déjà affiché en haut de page, gardé pour desktop */}
            {!isMobile && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Planning du jour
                    </CardTitle>
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
                        className="p-3 rounded-lg border"
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
                          <div>
                            {getShiftStatusBadge(shift.status)}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{shift.startTime} - {shift.endTime}</span>
                            {shift.status === 'active' && (
                              <span className="text-muted-foreground">
                                {calculateShiftProgress(shift.startTime, shift.endTime)}%
                              </span>
                            )}
                          </div>
                          
                          {shift.status === 'active' && (
                            <Progress value={calculateShiftProgress(shift.startTime, shift.endTime)} className="h-1.5" />
                          )}
                          
                          <div className="flex justify-end gap-1 pt-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7" 
                              onClick={() => window.open(`tel:${shift.phone}`)}
                            >
                              <Phone className="h-3.5 w-3.5 mr-1.5" />
                              <span>Appeler</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7"
                              onClick={() => navigate(`/employees?id=${shift.id}`)}
                            >
                              <UserCircle className="h-3.5 w-3.5 mr-1.5" />
                              <span>Profil</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7"
                              onClick={() => navigate(`/daily-planning?action=edit&id=${shift.id}`)}
                            >
                              <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                              <span>Modifier</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Vue adaptative pour les sections alertes et partage */}
            <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-1 md:grid-cols-1 gap-4"}`}>
              {/* Version mobile du partage de planning */}
              {isMobile && (
                <Card className="shadow-sm border-blue-200 bg-blue-50/30">
                  <CardHeader className="pb-2 pt-3">
                    <CardTitle className="text-sm flex items-center">
                      <Share2 className="h-4 w-4 mr-1.5 text-blue-600" />
                      Partage du Planning
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      Publiez le planning hebdomadaire pour vos employés
                    </p>
                    
                    <div className="flex gap-1 overflow-x-auto pb-1 mb-2 -mx-1 px-1">
                      {weekShifts.map((day, index) => {
                        const isComplete = day.totalEmployees >= 5;
                        return (
                          <div key={index} className="text-center flex-shrink-0 w-12">
                            <div className="text-xs">{day.day.slice(0, 3)}</div>
                            <div className={`h-2 w-full rounded-full mt-1 ${isComplete ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <Button 
                      className="w-full text-xs h-8" 
                      variant="default"
                      onClick={() => navigate('/daily-planning')}
                    >
                      <Share2 className="h-3.5 w-3.5 mr-1.5" />
                      Accéder au partage
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {/* Version desktop du partage de planning */}
              {!isMobile && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
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
                        
                        <div className="space-y-2">
                          <Button 
                            className="w-full" 
                            variant="default"
                            onClick={() => navigate('/daily-planning')}
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Partager le planning
                          </Button>
                          <p className="text-xs text-muted-foreground text-center">
                            Utilisez la fonction complète dans <Link to="/daily-planning" className="text-blue-600 hover:underline">Planning Quotidien</Link> pour plus d'options
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="week" className="mt-0 pt-0">
            <Card>
              <CardHeader className={`pb-2 ${isMobile ? "py-2 bg-primary/5" : ""}`}>
                <div className="flex items-center justify-between">
                  <CardTitle className={`${isMobile ? 'text-sm' : 'text-lg'}`}>
                    {isMobile ? "Planning Semaine" : "Planning hebdomadaire"}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => navigate('/planning')} className={`${isMobile ? "h-7 text-xs bg-primary/10 border-primary/20 text-primary" : ""}`}>
                    <CalendarRange className={`${isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1.5"}`} />
                    {isMobile ? "Gérer" : "Planning complet"}
                  </Button>
                </div>
                <CardDescription className={isMobile ? "text-xs" : ""}>
                  Aperçu des shifts pour la semaine
                </CardDescription>
              </CardHeader>
              <CardContent className={isMobile ? "p-2" : ""}>
                <div className="space-y-4">
                  {/* Vue mobile optimisée pour la semaine */}
                  <div className={`space-y-${isMobile ? "1.5" : "3"}`}>
                    {weekShifts.map((day, index) => (
                      <div 
                        key={index} 
                        className={`${isMobile ? "p-2" : "p-3"} rounded-lg border ${
                          format(now, 'EEEE', { locale: fr }) === day.day ? 
                          'border-primary bg-primary/5' : 'border-muted'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Calendar className={`${isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} ${
                              format(now, 'EEEE', { locale: fr }) === day.day ?
                              'text-primary' : 'text-muted-foreground'
                            }`} />
                            <div>
                              <span className={`font-medium ${isMobile ? "text-sm" : ""}`}>{day.day}</span>
                              <span className={`${isMobile ? "text-[10px]" : "text-xs"} text-muted-foreground ml-2`}>{day.date}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${isMobile ? "text-sm" : ""}`}>{day.totalEmployees}</div>
                            <div className={`${isMobile ? "text-[10px]" : "text-xs"} text-muted-foreground`}>employés</div>
                          </div>
                        </div>
                        
                        <div className={`${isMobile ? "mt-1.5" : "mt-2"} flex justify-between items-center`}>
                          <div className={`${isMobile ? "text-xs" : "text-sm"}`}>
                            <span className="text-muted-foreground">Total:</span> {day.totalHours}h
                          </div>
                          
                          {format(now, 'EEEE', { locale: fr }) === day.day && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className={`${isMobile ? "h-6 text-xs px-2" : "h-7 text-xs"}`}
                              onClick={() => setActiveTab('today')}
                            >
                              Voir détails
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Bilan hebdomadaire simplifié pour mobile */}
                  <div className="mt-3">
                    <Card className={isMobile ? "border border-muted/50" : ""}>
                      <CardHeader className={`${isMobile ? "py-2" : "py-3"}`}>
                        <CardTitle className={`${isMobile ? "text-xs" : "text-sm"}`}>Bilan hebdomadaire</CardTitle>
                      </CardHeader>
                      <CardContent className="py-0">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className={`font-bold text-primary ${isMobile ? "text-xl" : "text-3xl"}`}>
                              {weekShifts.reduce((total, day) => total + day.totalEmployees, 0)}
                            </div>
                            <div className={`${isMobile ? "text-[10px]" : "text-xs"} text-muted-foreground`}>
                              Shifts programmés
                            </div>
                          </div>
                          <div className="text-center">
                            <div className={`font-bold text-green-600 ${isMobile ? "text-xl" : "text-3xl"}`}>
                              {weekShifts.reduce((total, day) => total + day.totalHours, 0)}
                            </div>
                            <div className={`${isMobile ? "text-[10px]" : "text-xs"} text-muted-foreground`}>
                              Heures totales
                            </div>
                          </div>
                          <div className="text-center">
                            <div className={`font-bold text-blue-600 ${isMobile ? "text-xl" : "text-3xl"}`}>
                              {Math.round(weekShifts.reduce((total, day) => total + day.totalHours, 0) / weekShifts.reduce((total, day) => total + day.totalEmployees, 0))}
                            </div>
                            <div className={`${isMobile ? "text-[10px]" : "text-xs"} text-muted-foreground`}>
                              Heures / Employé
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
              {!isMobile && (
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
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Actions rapides flottantes pour mobile - optimisées */}
      {isMobile && (
        <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-10">
          <Button 
            size="icon" 
            className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90"
            onClick={() => navigate('/daily-planning?action=add')}
          >
            <PlusCircle className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Actions rapides en grille simplifiée pour mobile - priorité au planning */}
      {isMobile && (
        <div className="mt-4 mb-14">
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="py-2 bg-primary/5">
              <CardTitle className="text-xs flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Accès Rapides Planning
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3 px-3">
              <div className="grid grid-cols-4 gap-2">
                <Button 
                  variant="outline" 
                  className="h-auto py-3 px-0 flex flex-col gap-1 justify-center bg-primary/5 border-primary/20 text-primary" 
                  onClick={() => navigate('/daily-planning')}
                >
                  <Calendar className="h-5 w-5 mb-0.5" />
                  <span className="text-[10px]">Aujourd'hui</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 px-0 flex flex-col gap-1 justify-center bg-primary/5 border-primary/20 text-primary" 
                  onClick={() => navigate('/planning')}
                >
                  <CalendarRange className="h-5 w-5 mb-0.5" />
                  <span className="text-[10px]">Semaine</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 px-0 flex flex-col gap-1 justify-center" 
                  onClick={() => navigate('/employees')}
                >
                  <Users className="h-5 w-5 mb-0.5" />
                  <span className="text-[10px]">Employés</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 px-0 flex flex-col gap-1 justify-center" 
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-5 w-5 mb-0.5" />
                  <span className="text-[10px]">Réglages</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
};

export default Dashboard;
