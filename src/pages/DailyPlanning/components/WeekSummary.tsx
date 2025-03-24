import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { DaySummary, Shift, Employee } from '../types';
import { 
  Calendar, 
  Users, 
  Clock, 
  Check, 
  X, 
  Share2, 
  Copy, 
  Send, 
  ChevronRight, 
  AlertTriangle, 
  Printer, 
  ScrollText,
  CheckCircle2,
  ArrowRight,
  CalendarDays,
  FileSpreadsheet,
  FileCheck,
  Phone,
  Mail
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface WeekSummaryProps {
  summary: DaySummary[];
  shifts: Shift[];
  employees: Employee[];
  isMobile: boolean;
  currentDate: Date;
}

const WeekSummary: React.FC<WeekSummaryProps> = ({ summary, shifts, employees, isMobile, currentDate }) => {
  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const shortenedDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [planningPublished, setPlanningPublished] = useState<boolean>(false);
  const [notifyEmployees, setNotifyEmployees] = useState<boolean>(true);
  const [printMode, setPrintMode] = useState<boolean>(false);
  const { toast } = useToast();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'critical':
      case 'incomplete':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'good':
      case 'valid':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };
  
  const handleDayClick = (dayIndex: number) => {
    setSelectedDay(dayIndex);
    setDrawerOpen(true);
  };
  
  const getShiftsForDay = (dayIndex: number) => {
    return shifts.filter(shift => shift.day === dayIndex);
  };
  
  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };
  
  const getEmployeesForShift = (employeeIds: number[]) => {
    return employees.filter(employee => employeeIds.includes(employee.id));
  };
  
  const handlePublishPlanning = () => {
    // Ici, vous implémenteriez la logique pour rendre le planning visible aux employés
    setPlanningPublished(true);
    
    // Notification aux employés si l'option est activée
    if (notifyEmployees) {
      toast({
        title: "Planning publié",
        description: "Les employés ont été notifiés du nouveau planning",
        variant: "default"
      });
    } else {
      toast({
        title: "Planning publié",
        description: "Le planning est maintenant visible par les employés",
        variant: "default"
      });
    }
    
    setShareModalOpen(false);
  };

  const getTotalHours = () => {
    let total = 0;
    summary.forEach(day => {
      total += day.totalHours;
    });
    return total.toFixed(1);
  };

  const getTotalShifts = () => {
    return shifts.length;
  };
  
  const getTotalEmployees = () => {
    const uniqueEmployeeIds = new Set();
    shifts.forEach(shift => {
      shift.employeeIds.forEach(id => uniqueEmployeeIds.add(id));
    });
    return uniqueEmployeeIds.size;
  };
  
  const handleShareClick = () => {
    setShareModalOpen(true);
  };
  
  const handleCopyToClipboard = () => {
    const startDate = currentDate;
    const endDate = addDays(startDate, 6);
    
    let planningText = `Planning du ${format(startDate, 'dd/MM/yyyy')} au ${format(endDate, 'dd/MM/yyyy')}\n\n`;
    
    // Générer un résumé texte pour chaque jour
    summary.forEach((day, index) => {
      const dayDate = addDays(startDate, index);
      const dayShifts = getShiftsForDay(day.dayIndex);
      
      planningText += `${format(dayDate, 'EEEE dd/MM', { locale: fr })}: ${day.employeeCount} employés, ${day.totalHours}h\n`;
      
      dayShifts.forEach(shift => {
        const shiftEmployees = getEmployeesForShift(shift.employeeIds)
          .map(emp => emp.name)
          .join(', ');
          
        planningText += `  ${formatTimeRange(shift.startTime, shift.endTime)}: ${shiftEmployees}\n`;
      });
      
      planningText += '\n';
    });
    
    navigator.clipboard.writeText(planningText);
    
    toast({
      title: "Planning copié",
      description: "Le planning a été copié dans le presse-papier",
      variant: "default"
    });
  };
  
  const formatDay = (dayIndex: number) => {
    const date = addDays(currentDate, dayIndex);
    return format(date, 'dd/MM', { locale: fr });
  };
  
  const calculateShiftsPerDay = (dayIndex: number) => {
    return getShiftsForDay(dayIndex).length;
  };
  
  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 100);
  };
  
  const handleShareByEmail = () => {
    // En conditions réelles, cela pourrait ouvrir un client mail avec le planning
    toast({
      title: "Partage par email",
      description: "Fonctionnalité à implémenter avec le serveur de mail",
      variant: "default"
    });
  };
  
  const handleShareByWhatsApp = () => {
    const startDate = currentDate;
    const endDate = addDays(startDate, 6);
    
    const text = `Planning du ${format(startDate, 'dd/MM/yyyy')} au ${format(endDate, 'dd/MM/yyyy')} - ${getTotalShifts()} shifts, ${getTotalHours()}h, ${getTotalEmployees()} employés`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    
    window.open(url, '_blank');
  };
  
  return (
    <>
      <Card className={cn("shadow-md", isMobile ? "p-0" : "")}>
        <CardHeader className={cn("bg-primary/5", isMobile && "px-3 py-2")}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className={isMobile ? "text-base" : "text-xl"}>
                <div className="flex items-center gap-2">
                  <Calendar className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
                  {isMobile ? "Planning" : "Vue d'ensemble de la semaine"}
                </div>
              </CardTitle>
              <CardDescription className={isMobile ? "text-xs" : ""}>
                {format(currentDate, 'dd MMMM', { locale: fr })} - {format(addDays(currentDate, 6), 'dd MMMM yyyy', { locale: fr })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={planningPublished ? "outline" : "default"} 
                size={isMobile ? "sm" : "default"}
                className={cn(
                  planningPublished ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100" : "",
                  "gap-2"
                )}
                onClick={handleShareClick}
              >
                {planningPublished ? <CheckCircle2 className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                <span className={isMobile ? "" : ""}>
                  {planningPublished ? "Publié" : "Partager"}
                </span>
              </Button>
            </div>
          </div>
          
          {/* Badge de statut de publication global */}
          <Badge 
            variant="outline"
            className={cn(
              "w-full text-center mt-2 py-1",
              planningPublished 
                ? "bg-green-50 text-green-700 border-green-200" 
                : "bg-slate-100 text-slate-600 border-slate-200"
            )}
          >
            {planningPublished 
              ? "Planning publié - Visible par les employés" 
              : "Planning non publié - Visible uniquement par les managers"
            }
          </Badge>
        </CardHeader>
        
        <CardContent className={isMobile ? "p-2" : "p-5"}>
          <div className="space-y-4">
            {/* Statistiques résumées en haut */}
            <div className={cn(
              "grid gap-3 mb-4",
              isMobile ? "grid-cols-2" : "grid-cols-3"
            )}>
              <div className="bg-primary/5 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="flex items-center gap-1 mt-1">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-bold">{getTotalEmployees()}</span>
                  <span className="text-xs text-muted-foreground">employés</span>
                </div>
              </div>
              
              <div className="bg-primary/5 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Shifts</div>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-bold">{getTotalShifts()}</span>
                  <span className="text-xs text-muted-foreground">planifiés</span>
                </div>
              </div>
              
              {!isMobile && (
                <div className="bg-primary/5 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground">Heures</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-bold">{getTotalHours()}</span>
                    <span className="text-xs text-muted-foreground">heures</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Grille des jours de la semaine */}
            <div className={cn("grid gap-2", isMobile ? "grid-cols-1" : "grid-cols-7")}>
              {summary.map((day, index) => (
                <Card 
                  key={index} 
                  className={cn(
                    "cursor-pointer transition-transform hover:scale-[1.02] relative overflow-hidden border",
                    getStatusColor(day.status).split(' ')[0]
                  )}
                  onClick={() => handleDayClick(day.dayIndex)}
                >
                  <CardHeader className={cn("px-3 py-2", isMobile && "flex-row justify-between items-center")}>
                    <div className={isMobile ? "flex items-center justify-between w-full" : ""}>
                      <div>
                        <CardTitle className={cn("flex items-center", isMobile ? "text-sm" : "text-base")}>
                          {isMobile ? shortenedDays[day.dayIndex] : daysOfWeek[day.dayIndex]}
                          <span className="ml-1 text-muted-foreground text-xs">
                            {formatDay(day.dayIndex)}
                          </span>
                        </CardTitle>
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "font-medium text-xs mt-1",
                          day.status === 'good' ? 'bg-green-50 text-green-700 border-green-200' :
                          day.status === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        )}
                      >
                        {day.fillingPercentage}%
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="px-3 pb-3 pt-0">
                    <div className={cn(
                      "flex items-center justify-between mb-2",
                      isMobile && "flex-row gap-4"
                    )}>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{day.employeeCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{day.totalHours}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ScrollText className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{calculateShiftsPerDay(day.dayIndex)}</span>
                      </div>
                    </div>
                    
                    <Progress 
                      value={day.fillingPercentage} 
                      className={cn(
                        "h-1.5",
                        day.status === 'good' ? 'bg-green-100' :
                        day.status === 'warning' ? 'bg-amber-100' :
                        'bg-red-100'
                      )}
                    />
                    
                    {isMobile && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-2 justify-center text-xs gap-1"
                      >
                        Voir détails 
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className={cn("flex justify-between flex-wrap gap-2", isMobile && "px-3 py-2")}>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
              <Copy className="h-4 w-4 mr-1.5" />
              <span className={isMobile ? "sr-only" : ""}>Copier</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1.5" />
              <span className={isMobile ? "sr-only" : ""}>Imprimer</span>
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShareByWhatsApp}>
              <Phone className="h-4 w-4 mr-1.5" />
              <span className={isMobile ? "sr-only" : ""}>WhatsApp</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleShareByEmail}>
              <Mail className="h-4 w-4 mr-1.5" />
              <span className={isMobile ? "sr-only" : ""}>Email</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Modal de détails du jour */}
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDay !== null && (
                <>
                  {daysOfWeek[selectedDay]} - {formatDay(selectedDay)}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Détails et planning pour cette journée
            </DialogDescription>
          </DialogHeader>
          
          {selectedDay !== null && (
            <>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Employés</div>
                  <div className="text-lg font-bold">{summary[selectedDay].employeeCount}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Heures</div>
                  <div className="text-lg font-bold">{summary[selectedDay].totalHours}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Shifts</div>
                  <div className="text-lg font-bold">{calculateShiftsPerDay(selectedDay)}</div>
                </div>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {getShiftsForDay(selectedDay).length > 0 ? (
                  getShiftsForDay(selectedDay).map((shift, idx) => (
                    <div key={idx} className="border rounded-lg p-3 bg-muted/30">
                      <div className="flex justify-between mb-2">
                        <Badge variant="outline" className="font-medium">
                          {formatTimeRange(shift.startTime, shift.endTime)}
                        </Badge>
                        <Badge variant="outline" className={shift.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                          {shift.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {getEmployeesForShift(shift.employeeIds).map((employee) => (
                          <div key={employee.id} className="flex items-center gap-2 bg-background rounded-full px-2 py-1">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">
                                {employee.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">{employee.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <Alert variant="default" className="border-green-200 text-green-700 bg-green-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Aucun shift programmé</AlertTitle>
                    <AlertDescription>
                      Aucun employé n'est programmé pour cette journée.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setDrawerOpen(false)}>
                  Fermer
                </Button>
                <Button onClick={() => window.location.href = `/daily-planning?day=${selectedDay}`}>
                  <FileSpreadsheet className="h-4 w-4 mr-1.5" />
                  Éditer ce jour
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Modal de publication */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className={cn("max-w-md", isMobile && "w-[95vw] max-h-[90vh] overflow-y-auto p-3")}>
          <DialogHeader>
            <DialogTitle className={isMobile ? "text-lg" : "text-xl"}>Partager le planning</DialogTitle>
            <DialogDescription>
              Vérifiez que tous les jours sont correctement couverts avant de publier.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-3 space-y-4">
            {/* Status général du planning */}
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-800">Vérification requise</span>
              </div>
              <p className="text-sm text-amber-700">
                Certains jours n'ont pas le nombre minimum d'employés requis. Vérifiez chaque jour avant de publier.
              </p>
            </div>
            
            {/* Affichage de chaque jour avec son statut */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">État des journées :</h3>
              
              {summary.map((day, index) => {
                const date = addDays(currentDate, index);
                const formattedDate = format(date, 'EEEE dd/MM', { locale: fr });
                const isComplete = day.employeeCount >= 3 && day.totalHours >= 10;
                
                return (
                  <div 
                    key={index} 
                    className={cn(
                      "p-3 rounded-lg border",
                      isComplete 
                        ? "border-green-200 bg-green-50" 
                        : "border-amber-200 bg-amber-50"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {isComplete 
                          ? <CheckCircle2 className="h-4 w-4 text-green-600" /> 
                          : <AlertTriangle className="h-4 w-4 text-amber-600" />
                        }
                        <span className="font-medium">
                          {formattedDate}
                        </span>
                      </div>
                      
                      <Badge variant="outline" className={cn(
                        isComplete 
                          ? "bg-green-100 text-green-800 border-green-200" 
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      )}>
                        {isComplete ? "Complet" : "Incomplet"}
                      </Badge>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Employés:</span>{" "}
                        <span className="font-medium">{day.employeeCount}</span>
                        {day.employeeCount < 3 && (
                          <span className="text-xs text-red-600 ml-1">(min: 3)</span>
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Heures:</span>{" "}
                        <span className="font-medium">{day.totalHours}h</span>
                        {day.totalHours < 10 && (
                          <span className="text-xs text-red-600 ml-1">(min: 10h)</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <Separator />
            
            {/* Options de notification */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="notify-employees"
                  checked={notifyEmployees}
                  onCheckedChange={setNotifyEmployees}
                />
                <Label htmlFor="notify-employees">Notifier les employés</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Envoyer une notification par SMS et email à tous les employés concernés.
              </p>
            </div>
          </div>
          
          <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
            <Button
              variant="outline"
              onClick={() => setShareModalOpen(false)}
              className={isMobile ? "w-full" : ""}
            >
              Annuler
            </Button>
            <Button 
              onClick={handlePublishPlanning}
              className={cn(isMobile ? "w-full" : "", "gap-2")}
            >
              <Share2 className="h-4 w-4" />
              Publier le planning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WeekSummary; 