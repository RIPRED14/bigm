import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Search,
  CalendarDays,
  Users,
  Filter,
  User,
  X,
  ArrowLeft
} from 'lucide-react';
import { format, addDays, subDays, parseISO, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";

// Types pour les shifts et les employés
type Shift = {
  id: number;
  employeeIds: number[];
  day: Date;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'conflict';
};

type Employee = {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
};

// Données mockées pour les employés
const mockEmployees: Employee[] = [
  { id: 1, name: 'Reda', email: 'reda@burger-staff.com', phone: '(+212) 601-234567', avatarUrl: '' },
  { id: 2, name: 'Sami', email: 'sami@burger-staff.com', phone: '(+212) 602-345678', avatarUrl: '' },
  { id: 3, name: 'Afif', email: 'afif@burger-staff.com', phone: '(+212) 603-456789', avatarUrl: '' }
];

// Données mockées pour les shifts sur plusieurs jours
const generateMockShifts = (): Shift[] => {
  const shifts: Shift[] = [];
  const today = new Date();
  
  // Générer des shifts pour les 14 derniers jours jusqu'aux 14 prochains jours
  for (let i = -14; i <= 14; i++) {
    const currentDay = addDays(today, i);
    
    // Entre 3 et 6 shifts par jour
    const shiftsCount = Math.floor(Math.random() * 4) + 3;
    
    for (let j = 0; j < shiftsCount; j++) {
      // Utiliser seulement les ID 1, 2, 3 pour Reda, Sami et Afif
      const employeeId = Math.floor(Math.random() * 3) + 1;
      
      // Horaires différents pour diversifier
      const startHours = [
        '08:00', '09:00', '10:00', '11:00', '12:00', 
        '14:00', '15:00', '16:00', '17:00', '18:00'
      ];
      const shiftDurations = [4, 6, 8]; // Durées en heures
      
      const startTimeIndex = Math.floor(Math.random() * startHours.length);
      const startTime = startHours[startTimeIndex];
      const startHour = parseInt(startTime.split(':')[0]);
      
      const durationIndex = Math.floor(Math.random() * shiftDurations.length);
      const duration = shiftDurations[durationIndex];
      
      const endHour = startHour + duration;
      const endTime = `${endHour.toString().padStart(2, '0')}:00`;
      
      shifts.push({
        id: shifts.length + 1,
        employeeIds: [employeeId],
        day: currentDay,
        startTime,
        endTime,
        status: 'confirmed'
      });
    }
  }
  
  return shifts;
};

const mockShifts = generateMockShifts();

const PlanningViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // État pour la date sélectionnée
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // État pour le filtrage par employé
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Extraire l'ID d'employé des paramètres de l'URL si présent
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const employeeId = params.get('employeeId');
    
    if (employeeId) {
      setSelectedEmployeeId(parseInt(employeeId));
    }
  }, [location]);
  
  // Filtrer les shifts pour la date sélectionnée
  const shiftsForSelectedDate = mockShifts.filter(shift => 
    isSameDay(shift.day, selectedDate) && 
    (selectedEmployeeId === null || shift.employeeIds.includes(selectedEmployeeId))
  );
  
  // Trier les shifts par heure de début
  const sortedShifts = [...shiftsForSelectedDate].sort((a, b) => {
    const aTime = parseInt(a.startTime.replace(':', ''));
    const bTime = parseInt(b.startTime.replace(':', ''));
    return aTime - bTime;
  });
  
  // Fonction pour changer de jour
  const changeDay = (increment: number) => {
    if (increment > 0) {
      setSelectedDate(addDays(selectedDate, increment));
    } else {
      setSelectedDate(subDays(selectedDate, Math.abs(increment)));
    }
  };
  
  // Récupérer les informations d'un employé par son ID
  const getEmployeeById = (id: number) => {
    return mockEmployees.find(emp => emp.id === id) || null;
  };
  
  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setSelectedEmployeeId(null);
    // Mettre à jour l'URL pour enlever le paramètre employeeId
    navigate('/planning-viewer');
  };
  
  return (
    <PageContainer className={isMobile ? "pt-2 px-1" : "pt-6"}>
      {/* En-tête avec navigation de date */}
      <div className={`flex flex-col ${isMobile ? 'gap-2' : 'md:flex-row md:items-center md:justify-between gap-3'} mb-4`}>
        <div className={`flex items-center ${isMobile ? 'bg-gradient-to-r from-primary/10 to-primary/5 p-2 rounded-lg -mx-1' : ''}`}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className={`${isMobile ? 'h-8 w-8 p-0' : 'mr-2'}`}
          >
            <ArrowLeft className="h-4 w-4" />
            {!isMobile && <span className="ml-1">Retour</span>}
          </Button>
          <h1 className={`font-bold ${isMobile ? 'text-lg ml-2' : 'text-2xl'}`}>
            {isMobile ? 'Planning' : 'Visualisation du Planning'}
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {selectedEmployeeId && (
            <Badge variant="outline" className="flex items-center gap-1 bg-primary/10">
              <User className="h-3 w-3" />
              {getEmployeeById(selectedEmployeeId)?.name}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 ml-1 p-0" 
                onClick={resetFilters}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          <Select 
            value={selectedEmployeeId?.toString() || ""} 
            onValueChange={(value) => {
              if (value && value !== "all") {
                setSelectedEmployeeId(parseInt(value));
                navigate(`/planning-viewer?employeeId=${value}`);
              } else {
                resetFilters();
              }
            }}
          >
            <SelectTrigger className={`${isMobile ? 'w-full h-9 text-sm' : 'w-[180px] h-9'}`}>
              <SelectValue placeholder="Filtrer par employé" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les employés</SelectItem>
              {mockEmployees.map(employee => (
                <SelectItem key={employee.id} value={employee.id.toString()}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Navigation du calendrier */}
      <Card className={`mb-4 ${isMobile ? 'shadow-sm' : ''}`}>
        <CardContent className={`${isMobile ? 'p-2' : 'p-3'}`}>
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "icon"} 
              onClick={() => changeDay(-1)}
              className={isMobile ? "h-9 w-9 p-0" : ""}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`${isMobile ? 'text-xs px-2 h-9' : ''} font-medium`}
                >
                  <Calendar className={`${isMobile ? 'h-3.5 w-3.5 mr-1' : 'h-4 w-4 mr-2'}`} />
                  {isMobile 
                    ? format(selectedDate, "EEE d MMM", { locale: fr }) 
                    : format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className={`w-auto p-0 ${isMobile ? 'max-w-[300px]' : ''}`} align="center">
                <CalendarPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }
                  }}
                  initialFocus
                  className={isMobile ? "scale-90 transform origin-top" : ""}
                />
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "icon"} 
              onClick={() => changeDay(1)}
              className={isMobile ? "h-9 w-9 p-0" : ""}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Boutons de navigation rapide pour mobile - placés avant la liste des shifts */}
      {isMobile && (
        <div className="flex justify-between gap-1 mb-3 -mx-1 px-1 overflow-x-auto no-scrollbar">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedDate(new Date())}
            className="text-xs px-2.5 whitespace-nowrap h-8"
          >
            Aujourd'hui
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => changeDay(-1)}
            className="text-xs px-2.5 whitespace-nowrap h-8"
          >
            Hier
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => changeDay(1)}
            className="text-xs px-2.5 whitespace-nowrap h-8"
          >
            Demain
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => changeDay(-7)}
            className="text-xs px-2.5 whitespace-nowrap h-8"
          >
            -7 jours
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => changeDay(7)}
            className="text-xs px-2.5 whitespace-nowrap h-8"
          >
            +7 jours
          </Button>
        </div>
      )}
      
      {/* Liste des shifts */}
      <div className="space-y-3">
        {sortedShifts.length === 0 ? (
          <Card className={`${isMobile ? 'py-6' : 'py-8'}`}>
            <div className="flex flex-col items-center justify-center text-center px-4">
              <CalendarDays className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} text-muted-foreground/30 mb-3`} />
              <h3 className={`font-medium ${isMobile ? 'text-base' : 'text-lg'}`}>Aucun shift planifié</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {selectedEmployeeId 
                  ? `Aucun shift pour cet employé le ${format(selectedDate, "d MMMM", { locale: fr })}`
                  : `Aucun shift planifié pour le ${format(selectedDate, "d MMMM", { locale: fr })}`
                }
              </p>
            </div>
          </Card>
        ) : (
          sortedShifts.map((shift) => {
            // Récupérer l'information de l'employé pour ce shift
            const employee = getEmployeeById(shift.employeeIds[0]);
            
            return (
              <Card key={shift.id} className={`overflow-hidden border-muted ${isMobile ? 'shadow-sm' : ''}`}>
                <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
                  <div className="flex items-center gap-3">
                    <Avatar className={`${isMobile ? 'h-9 w-9' : 'h-10 w-10'} border-2 border-primary/10`}>
                      <AvatarImage src={employee?.avatarUrl} />
                      <AvatarFallback className="bg-primary/5">
                        {employee?.name.substring(0, 2).toUpperCase() || 'NA'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className={`font-medium ${isMobile ? 'text-sm' : 'text-base'} truncate max-w-[180px]`}>
                          {employee?.name || 'Employé inconnu'}
                        </h3>
                        <Badge variant="outline" className="font-medium text-xs">
                          {shift.startTime} - {shift.endTime}
                        </Badge>
                      </div>
                      
                      <div className="mt-1.5 flex items-center text-xs text-muted-foreground gap-3">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {calculateShiftDuration(shift.startTime, shift.endTime)}h
                        </span>
                        {!isMobile && employee && (
                          <span className="text-xs truncate max-w-[200px]">{employee.email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      
      {/* Boutons de navigation rapide - seulement sur desktop */}
      {!isMobile && (
        <div className="flex justify-center gap-2 mt-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedDate(new Date())}
          >
            Aujourd'hui
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => changeDay(-7)}
          >
            Semaine précédente
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => changeDay(7)}
          >
            Semaine suivante
          </Button>
        </div>
      )}
    </PageContainer>
  );
};

// Fonction pour calculer la durée d'un shift
const calculateShiftDuration = (startTime: string, endTime: string): number => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  let duration = (endHour - startHour) + (endMinute - startMinute) / 60;
  
  // Gestion du cas où le shift passe minuit
  if (duration < 0) {
    duration += 24;
  }
  
  return duration;
};

export default PlanningViewer; 