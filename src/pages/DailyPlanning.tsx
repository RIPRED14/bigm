import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Edit,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Wand2,
  ShieldAlert,
  Trash2,
  Copy,
  Bell,
  X,
  Info,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Types simplifiés
type Shift = {
  id: number;
  employeeIds: number[];
  day: number;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'conflict';
};

type Employee = {
  id: number;
  name: string;
  weeklyHours: number;
  preferredTimes?: string[];
};

type Notification = {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
};

// Données mockées simplifiées
const mockEmployees: Employee[] = [
  { id: 1, name: 'Reda', weeklyHours: 35, preferredTimes: ['morning', 'evening'] },
  { id: 2, name: 'Sami', weeklyHours: 30, preferredTimes: ['evening'] },
  { id: 3, name: 'Afif', weeklyHours: 25, preferredTimes: ['morning'] }
];

const mockShifts: Shift[] = [
  { id: 1, employeeIds: [1], day: 0, startTime: '11:00', endTime: '15:00', status: 'confirmed' },
  { id: 2, employeeIds: [2], day: 0, startTime: '14:00', endTime: '22:00', status: 'confirmed' },
  { id: 3, employeeIds: [3], day: 1, startTime: '11:00', endTime: '17:00', status: 'confirmed' }
];

// Règles pour le planning
const scheduleRules = {
  minHoursPerDay: 16,
  minEmployeesPerTimeSlot: 2,
  maxEmployeesPerTimeSlot: 3,
  maxEmployeesPerDay: 5,
  minEmployeesAfter18h: 2,
  maxWeeklyHoursPerEmployee: 40,
  timeSlots: ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00']
};

// Composant principal
const DailyPlanning: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // États principaux
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [shifts, setShifts] = useState<Shift[]>(mockShifts);
  const [employees] = useState<Employee[]>(mockEmployees);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [conflicts, setConflicts] = useState<{employeeId: number, shifts: Shift[]}[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [isScheduleShared, setIsScheduleShared] = useState<boolean>(false);
  const [showShareDialog, setShowShareDialog] = useState<boolean>(false);
  
  // État pour le nouveau shift dans le modal
  const [newShift, setNewShift] = useState({
    startTime: '11:00',
    endTime: '15:00',
    employeeIds: [] as number[],
    selectedDays: [] as number[]
  });
  
  // État pour le shift en cours d'édition
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Créneaux horaires simplifiés
  const timeSlots = scheduleRules.timeSlots;
  
  // Obtenir l'index du jour (0 = Lundi, 6 = Dimanche)
  const getDayIndex = (date: Date): number => {
    const day = date.getDay();
    return day === 0 ? 6 : day - 1;
  };
  
  // Obtenir les shifts pour un jour spécifique
  const getShiftsForDay = (dayIndex: number): Shift[] => {
    return shifts.filter(shift => shift.day === dayIndex);
  };

  // Obtenir les employés uniques pour un jour donné
  const getUniqueEmployeesForDay = (dayIndex: number): number[] => {
    const uniqueIds = new Set<number>();
    getShiftsForDay(dayIndex).forEach(shift => {
      shift.employeeIds.forEach(id => uniqueIds.add(id));
    });
    return Array.from(uniqueIds);
  };
  
  // Calculer les heures totales pour un jour donné
  const getDayTotalHours = (dayIndex: number): number => {
    return getShiftsForDay(dayIndex).reduce((total, shift) => {
      const startHour = parseInt(shift.startTime.split(':')[0]);
      const endHour = parseInt(shift.endTime.split(':')[0]);
      return total + (endHour - startHour);
    }, 0);
  };
  
  // Noms des jours de la semaine
  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  
  // Navigation
  const goToPreviousDay = () => setCurrentDate(subDays(currentDate, 1));
  const goToNextDay = () => setCurrentDate(addDays(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());
  
  // Ajouter une notification
  const addNotification = (type: 'info' | 'success' | 'warning' | 'error', message: string, details?: string, action?: { label: string, handler: () => void }) => {
    const newNotification: Notification = {
      id: Date.now(),
      type,
      message,
      details,
      timestamp: new Date(),
      read: false,
      action
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Afficher le toast correspondant
    if (type === 'success') {
      toast.success(message, { description: details });
    } else if (type === 'error') {
      toast.error(message, { description: details });
    } else if (type === 'warning') {
      toast.warning(message, { description: details });
    } else {
      toast.info(message, { description: details });
    }
    
    return newNotification.id;
  };
  
  // Marquer une notification comme lue
  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };
  
  // Supprimer une notification
  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };
  
  // Obtenir les notifications non lues
  const getUnreadNotifications = () => {
    return notifications.filter(notif => !notif.read);
  };
  
  // Détecter les conflits avec notification
  const detectConflicts = () => {
    const newConflicts: {employeeId: number, shifts: Shift[]}[] = [];
    
    employees.forEach(employee => {
      // Vérification par jour
      for (let day = 0; day < 7; day++) {
        const employeeShifts = shifts.filter(
          shift => shift.day === day && shift.employeeIds.includes(employee.id)
        );
        
        if (employeeShifts.length <= 1) continue;
        
        const conflictingShifts: Shift[] = [];
        
        for (let i = 0; i < employeeShifts.length; i++) {
          for (let j = i + 1; j < employeeShifts.length; j++) {
            const shift1 = employeeShifts[i];
            const shift2 = employeeShifts[j];
            
            // Vérifier que ce sont bien des shifts différents
            // et pas juste le même shift avec plusieurs employés
            if (shift1.id === shift2.id) continue;
            
            // Convertir en nombres pour la comparaison
            const start1 = convertTimeToNumber(shift1.startTime);
            const end1 = convertTimeToNumber(shift1.endTime);
            const start2 = convertTimeToNumber(shift2.startTime);
            const end2 = convertTimeToNumber(shift2.endTime);
            
            let hasConflict = false;
            
            // Gestion des shifts qui passent minuit
            if (start1 < end1 && start2 < end2) {
              // Les deux shifts sont dans la même journée
              hasConflict = (start1 < end2 && start2 < end1);
            } else if (start1 > end1 && start2 > end2) {
              // Les deux shifts passent minuit
              hasConflict = true; // Ils sont forcément en conflit quelque part
            } else if (start1 > end1) {
              // Shift 1 passe minuit, shift 2 dans la même journée
              hasConflict = (start2 < end1 || start2 >= start1);
            } else if (start2 > end2) {
              // Shift 2 passe minuit, shift 1 dans la même journée
              hasConflict = (start1 < end2 || start1 >= start2);
            }
            
            if (hasConflict) {
              if (!conflictingShifts.includes(shift1)) conflictingShifts.push(shift1);
              if (!conflictingShifts.includes(shift2)) conflictingShifts.push(shift2);
            }
          }
        }
        
        if (conflictingShifts.length > 0) {
          // Vérifier si un conflit pour cet employé existe déjà
          const existingConflictIndex = newConflicts.findIndex(c => c.employeeId === employee.id);
          
          if (existingConflictIndex >= 0) {
            // Ajouter uniquement les nouveaux shifts en conflit
            conflictingShifts.forEach(shift => {
              if (!newConflicts[existingConflictIndex].shifts.some(s => s.id === shift.id)) {
                newConflicts[existingConflictIndex].shifts.push(shift);
              }
            });
          } else {
            // Créer un nouveau conflit
            newConflicts.push({
              employeeId: employee.id,
              shifts: conflictingShifts
            });
          }
        }
      }
    });
    
    // Notifier l'utilisateur si des conflits sont détectés
    if (newConflicts.length > 0 && newConflicts.length !== conflicts.length) {
      // Nouveaux conflits détectés
      toast.error("Conflits d'horaires détectés", {
        description: `${newConflicts.length} employé(s) ont des shifts qui se chevauchent`
      });
    } else if (conflicts.length > 0 && newConflicts.length === 0) {
      // Tous les conflits ont été résolus
      toast.success("Tous les conflits sont résolus", {
        description: "Le planning ne contient plus aucun conflit d'horaires"
      });
    }
    
    setConflicts(newConflicts);
    return newConflicts;
  };
  
  // Convertir une heure au format "HH:MM" en nombre pour faciliter les comparaisons
  const convertTimeToNumber = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + (minutes / 60);
  };

  // Vérifier si un créneau horaire est couvert par un shift
  const isTimeInShift = (timeSlot: string, shift: Shift): boolean => {
    // Convertir le créneau et les heures de shift en valeurs numériques pour faciliter la comparaison
    const slotHour = convertTimeToNumber(timeSlot);
    const startHour = convertTimeToNumber(shift.startTime);
    const endHour = convertTimeToNumber(shift.endTime);
    
    // Gestion du cas où le shift passe minuit
    if (startHour > endHour) {
      // Le shift commence avant minuit et se termine après
      return slotHour >= startHour || slotHour < endHour;
    } else {
      // Cas normal: le shift est sur la même journée
      return slotHour >= startHour && slotHour < endHour;
    }
  };

  // Formatter le temps pour l'affichage
  const formatTimeDisplay = (time: string): string => {
    const hour = parseInt(time.split(':')[0]);
    return `${hour}h`;
  };

  // Ajouter un shift - Étape 1 : Ouvrir le modal
  const handleOpenAddDialog = (startHour?: string) => {
    // Initialiser les valeurs par défaut
    const defaultStartTime = startHour || '11:00';
    const startHourNum = parseInt(defaultStartTime);
    const endHourNum = (startHourNum + 4) % 24;
    const endTime = `${endHourNum.toString().padStart(2, '0')}:00`;
    
    setNewShift({
      startTime: defaultStartTime,
      endTime: endTime,
      employeeIds: [],
      selectedDays: [getDayIndex(currentDate)]
    });
    
    setShowAddDialog(true);
  };
  
  // Gérer la sélection/déselection d'un jour
  const handleDaySelection = (dayIndex: number) => {
    const updatedDays = [...newShift.selectedDays];
    
    if (updatedDays.includes(dayIndex)) {
      // Retirer le jour s'il est déjà sélectionné
      const index = updatedDays.indexOf(dayIndex);
      updatedDays.splice(index, 1);
      } else {
      // Ajouter le jour à la sélection
      updatedDays.push(dayIndex);
    }
    
    setNewShift({
      ...newShift,
      selectedDays: updatedDays
    });
  };
  
  // Ajouter un shift - Étape 2 : Valider et créer le shift
  const handleAddShift = () => {
    try {
      // Vérifier qu'au moins un jour est sélectionné
      if (newShift.selectedDays.length === 0) {
        toast.error("Aucun jour sélectionné", {
          description: "Veuillez sélectionner au moins un jour pour ce shift"
        });
        return;
      }
      
      // Générer un identifiant unique pour le nouveau shift
      let maxId = shifts.length > 0 ? Math.max(...shifts.map(s => s.id)) : 0;
      
      // Créer un shift pour chaque jour sélectionné
      const newShifts = newShift.selectedDays.map(dayIndex => {
        maxId += 1;
        return {
          id: maxId,
          employeeIds: newShift.employeeIds.length > 0 ? newShift.employeeIds : [1], // John Doe par défaut si aucun employé sélectionné
          day: dayIndex,
          startTime: newShift.startTime,
          endTime: newShift.endTime,
          status: 'confirmed' as const
        };
      });
      
      setShifts(prevShifts => [...prevShifts, ...newShifts]);
      
      toast.success(`${newShifts.length} shift(s) ajouté(s)`, {
        description: `Pour ${newShifts.length === 1 ? dayNames[newShift.selectedDays[0]] : newShifts.length + ' jours'}`
      });
      
      // Fermer le modal
      setShowAddDialog(false);
      
      // Détecter les conflits après l'ajout
      detectConflicts();
    } catch (error) {
      console.error("Erreur lors de l'ajout du shift:", error);
      toast.error("Erreur lors de l'ajout du shift", {
        description: "Veuillez réessayer"
      });
    }
  };
  
  // Gérer le changement d'heure de début
  const handleStartTimeChange = (value: string) => {
    const startHourNum = parseInt(value);
    const endHourNum = (startHourNum + 4) % 24;
    
    // Si les heures passent minuit, on conserve déjà la valeur calculée
    
    const endTime = `${endHourNum.toString().padStart(2, '0')}:00`;
    
    setNewShift({
      ...newShift,
      startTime: value,
      endTime: endTime
    });
  };

  // Gérer le changement d'heure de fin
  const handleEndTimeChange = (value: string) => {
    setNewShift({
      ...newShift,
      endTime: value
    });
  };
  
  // Gérer le changement d'employés
  const handleEmployeeChange = (employeeId: number) => {
    const empId = Number(employeeId);
    let updatedEmployeeIds = [...newShift.employeeIds];
    
    if (updatedEmployeeIds.includes(empId)) {
      // Retirer l'employé s'il est déjà sélectionné
      updatedEmployeeIds = updatedEmployeeIds.filter(id => id !== empId);
    } else {
      // Ajouter l'employé à la sélection
      updatedEmployeeIds.push(empId);
    }
    
    setNewShift({
      ...newShift,
      employeeIds: updatedEmployeeIds
    });
  };

  // Éditer un shift existant
  const handleEditShift = (shiftId: number) => {
    try {
      // Dans une application réelle, ouvrir un modal d'édition
      // Pour cette démo, simuler une modification
      const updatedShifts = shifts.map(shift => {
        if (shift.id === shiftId) {
          // Si le shift est vide, ajouter l'employé 1
          // Sinon, alterner entre les employés 1, 2 et 3 à chaque clic
          let employeeIds = [...shift.employeeIds];
          
          if (employeeIds.length === 0) {
            employeeIds = [1];
          } else if (employeeIds.includes(1) && !employeeIds.includes(2)) {
            employeeIds = [1, 2];
          } else if (employeeIds.includes(1) && employeeIds.includes(2) && !employeeIds.includes(3)) {
            employeeIds = [1, 2, 3];
          } else if (employeeIds.includes(2)) {
            employeeIds = [3];
          } else {
            employeeIds = [1];
          }
          
          return {
            ...shift,
            employeeIds: [...new Set(employeeIds)] // Utiliser un Set pour éliminer les doublons
          };
        }
        return shift;
      });
      
      setShifts(updatedShifts);
      toast.success("Shift modifié", {
        description: "Les employés ont été mis à jour"
      });
      
      detectConflicts();
    } catch (error) {
      console.error("Erreur lors de la modification du shift:", error);
      toast.error("Erreur lors de la modification du shift", {
        description: "Veuillez réessayer"
      });
    }
  };
  
  // Remplissage automatique du planning
  const generateOptimalSchedule = () => {
    const dayIndex = getDayIndex(currentDate);
    
    // Supprimer les shifts existants pour ce jour
    const existingShifts = shifts.filter(shift => shift.day === dayIndex);
    const updatedShifts = shifts.filter(shift => shift.day !== dayIndex);
    
    // Si des shifts existent déjà pour ce jour, demander confirmation
    if (existingShifts.length > 0) {
      if (!window.confirm(`Cette action va remplacer ${existingShifts.length} shift(s) existant(s) pour ${dayNames[dayIndex]}. Voulez-vous continuer?`)) {
        return;
      }
    }
    
    // Créneaux horaires à couvrir - adapter selon les heures d'ouverture
    const timeSlotsToCover = [
      { start: "11:00", end: "15:00", priority: "high", description: "Service midi" },
      { start: "14:00", end: "18:00", priority: "medium", description: "Transition" },
      { start: "17:00", end: "21:00", priority: "high", description: "Service soir" },
      { start: "20:00", end: "00:00", priority: "medium", description: "Fermeture" }
    ];
    
    let nextId = shifts.length > 0 ? Math.max(...shifts.map(s => s.id)) + 1 : 1;
    const newShifts: Shift[] = [];
    
    // Calculer les heures hebdomadaires actuelles pour chaque employé
    const weeklyHours: Record<number, number> = {};
    employees.forEach(emp => {
      weeklyHours[emp.id] = 0;
      updatedShifts.forEach(shift => {
        if (shift.employeeIds.includes(emp.id)) {
          const startHour = parseInt(shift.startTime.split(':')[0]);
          const endHour = parseInt(shift.endTime.split(':')[0]);
          let hours = 0;
          
          if (endHour > startHour) {
            hours = endHour - startHour;
          } else {
            // Passage minuit
            hours = (24 - startHour) + endHour;
          }
          
          weeklyHours[emp.id] += hours;
        }
      });
    });
    
    // Trier les employés par nombre d'heures déjà travaillées
    const sortedEmployees = [...employees].sort((a, b) => {
      return weeklyHours[a.id] - weeklyHours[b.id];
    });
    
    // Créer un shift pour chaque créneau
    timeSlotsToCover.forEach(slot => {
      // Déterminer combien d'employés sont nécessaires selon la priorité
      const requiredEmployees = slot.priority === "high" ? 2 : 1;
      
      // Trouver les employés qui correspondent le mieux
      const suitableEmployees = sortedEmployees.filter(employee => {
        // Vérifier si l'employé est déjà assigné à ce créneau dans les nouveaux shifts
        const alreadyAssigned = newShifts.some(shift => 
          shift.employeeIds.includes(employee.id) &&
          ((parseInt(shift.startTime) <= parseInt(slot.start) && 
            parseInt(shift.endTime) > parseInt(slot.start)) ||
           (parseInt(shift.startTime) < parseInt(slot.end) && 
            parseInt(shift.endTime) >= parseInt(slot.end)))
        );
        
        if (alreadyAssigned) return false;
        
        // Vérifier si l'employé dépasse les heures hebdomadaires maximales
        const slotHoursDuration = calculateDuration(slot.start, slot.end);
        if (weeklyHours[employee.id] + slotHoursDuration > scheduleRules.maxWeeklyHoursPerEmployee) {
          return false;
        }
        
        // Vérifier les préférences si définies
        if (employee.preferredTimes && employee.preferredTimes.length > 0) {
          const hour = parseInt(slot.start);
          const isMorning = hour < 15;
          const isEvening = hour >= 15;
          
          if (isMorning && !employee.preferredTimes.includes('morning')) return false;
          if (isEvening && !employee.preferredTimes.includes('evening')) return false;
        }
        
        return true;
      }).slice(0, requiredEmployees);
      
      // Si nous avons des employés appropriés, créer le shift
      if (suitableEmployees.length > 0) {
        const newShift: Shift = {
          id: nextId++,
          employeeIds: suitableEmployees.map(emp => emp.id),
          day: dayIndex,
          startTime: slot.start,
          endTime: slot.end,
          status: 'confirmed'
        };
        
        // Mettre à jour les heures hebdomadaires
        suitableEmployees.forEach(emp => {
          const slotHoursDuration = calculateDuration(slot.start, slot.end);
          weeklyHours[emp.id] += slotHoursDuration;
        });
        
        newShifts.push(newShift);
      }
    });
    
    // Mettre à jour le planning
    setShifts([...updatedShifts, ...newShifts]);
    
    // Notification enrichie
    if (newShifts.length > 0) {
      addNotification(
        'success',
        `Planning optimisé pour ${dayNames[dayIndex]}`,
        `${existingShifts.length} shift(s) existant(s) remplacés par ${newShifts.length} nouveaux shifts. Créneaux couverts: ${newShifts.map(s => `${s.startTime}-${s.endTime}`).join(', ')}`,
        {
          label: 'Valider',
          handler: validateSchedule
        }
      );
    } else {
      addNotification(
        'warning',
        `Aucun shift n'a pu être généré`,
        `Tous les employés ont atteint leur quota d'heures ou aucun n'est disponible pour les créneaux requis.`,
        {
          label: 'Ajouter manuellement',
          handler: () => handleOpenAddDialog()
        }
      );
    }
    
    // Vérifier les conflits potentiels
    detectConflicts();
  };
  
  // Fonction utilitaire pour calculer la durée entre deux heures
  const calculateDuration = (startTime: string, endTime: string) => {
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    
    if (endHour >= startHour) {
      return endHour - startHour;
    } else {
      // Passage minuit
      return (24 - startHour) + endHour;
    }
  };
  
  // Générer un résumé hebdomadaire simplifié
  const generateWeekSummary = () => {
    return [0, 1, 2, 3, 4, 5, 6].map(dayIndex => ({
      dayIndex,
      employeeCount: getUniqueEmployeesForDay(dayIndex).length,
      totalHours: getDayTotalHours(dayIndex),
      status: getDayTotalHours(dayIndex) >= scheduleRules.minHoursPerDay ? 'valid' : 'incomplete'
    }));
  };
  
  // Générer un résumé des heures couvertes pour le jour actuel
  const getHoursCoverage = (dayIndex: number): {hour: string, employees: number}[] => {
    const coverage: {hour: string, employees: number}[] = [];
    
    // Pour chaque créneau horaire
    scheduleRules.timeSlots.forEach(timeSlot => {
      const shiftsForTime = getShiftsForDay(dayIndex)
        .filter(shift => isTimeInShift(timeSlot, shift));
      
      const employeeCount = shiftsForTime.reduce((count, shift) => 
        count + shift.employeeIds.length, 0);
      
      coverage.push({
        hour: timeSlot,
        employees: employeeCount
      });
    });
    
    return coverage;
  };
  
  // Vérifier si le planning contient des alertes
  const getAlerts = () => {
    const dayIndex = getDayIndex(currentDate);
    const alerts = [];
    
    // Vérifier les conflits
    if (conflicts.length > 0) {
      const conflictedEmployees = conflicts.map(c => employees.find(e => e.id === c.employeeId)?.name || `Employé ${c.employeeId}`).join(', ');
      alerts.push({
        type: 'error',
        title: 'Conflits d\'horaires détectés',
        description: `${conflicts.length} employé(s) ont des shifts qui se chevauchent: ${conflictedEmployees}`,
        action: {
          label: 'Résoudre',
          handler: () => {
            // Accéder au premier conflit
            if (conflicts.length > 0) {
              const firstConflict = conflicts[0];
              if (firstConflict.shifts.length > 0) {
                handleOpenEditDialog(firstConflict.shifts[0].id);
              }
            }
          }
        }
      });
    }
    
    // ALERTES CRITIQUES (ROUGE)
    
    // 1. Vérifier si la journée est complète (tous les créneaux d'ouverture ont au moins un employé)
    const shiftsForDay = getShiftsForDay(dayIndex);
    const emptyTimeSlots = scheduleRules.timeSlots.filter(timeSlot => {
      // Vérifier si un créneau n'a aucun employé assigné
      return !shiftsForDay.some(shift => isTimeInShift(timeSlot, shift));
    });
    
    if (emptyTimeSlots.length > 0) {
      const formattedTimeSlots = emptyTimeSlots.map(slot => formatTimeDisplay(slot)).join(', ');
      alerts.push({
        type: 'error',
        title: 'Journée incomplète',
        description: `Créneaux sans employé: ${formattedTimeSlots}`,
        action: {
          label: 'Ajouter un shift',
          handler: () => {
            // Suggérer le premier créneau vide comme heure de début
            if (emptyTimeSlots.length > 0) {
              handleOpenAddDialog(emptyTimeSlots[0]);
            } else {
              handleOpenAddDialog();
            }
          }
        }
      });
    }
    
    // 2. Vérifier les shifts vides
    const emptyShifts = shiftsForDay.filter(shift => shift.employeeIds.length === 0);
    if (emptyShifts.length > 0) {
      const formattedShifts = emptyShifts.map(s => `${formatTimeDisplay(s.startTime)}-${formatTimeDisplay(s.endTime)}`).join(', ');
      alerts.push({
        type: 'error',
        title: 'Shift(s) vide(s)',
        description: `Shifts sans employé: ${formattedShifts}`,
        action: {
          label: 'Corriger',
          handler: () => {
            // Éditer le premier shift vide
            if (emptyShifts.length > 0) {
              handleOpenEditDialog(emptyShifts[0].id);
            }
          }
        }
      });
    }
    
    // ALERTES DE MISE EN GARDE (JAUNE)
    
    // 1. Vérifier l'effectif insuffisant après 18h
    const eveningTimeSlots = scheduleRules.timeSlots.filter(slot => {
      const hour = parseInt(slot.split(':')[0]);
      return hour >= 18 && hour <= 7;
    });
    
    // Compter le nombre unique d'employés après 18h
    const employeesAfter18h = new Set();
    const eveningShifts = [];
    
    eveningTimeSlots.forEach(timeSlot => {
      shiftsForDay
        .filter(shift => isTimeInShift(timeSlot, shift))
        .forEach(shift => {
          eveningShifts.push(shift);
          shift.employeeIds.forEach(empId => {
            employeesAfter18h.add(empId);
          });
        });
    });
    
    const uniqueEveningShifts = [...new Set(eveningShifts.map(s => s.id))];
    const insufficientEveningStaffing = employeesAfter18h.size < scheduleRules.minEmployeesAfter18h;
    
    if (insufficientEveningStaffing) {
      alerts.push({
        type: 'warning',
        title: 'Effectif insuffisant en soirée',
        description: `${employeesAfter18h.size}/${scheduleRules.minEmployeesAfter18h} employés requis après 18h`,
        action: {
          label: 'Ajouter employé',
          handler: () => {
            // Éditer le premier shift du soir s'il existe, sinon créer un nouveau
            if (uniqueEveningShifts.length > 0) {
              handleOpenEditDialog(uniqueEveningShifts[0]);
            } else {
              // Créer un nouveau shift pour la soirée (18h-22h)
              setNewShift({
                startTime: '18:00',
                endTime: '22:00',
                employeeIds: [],
                selectedDays: [dayIndex]
              });
              setShowAddDialog(true);
            }
          }
        }
      });
    }
    
    // 2. Vérifier l'effectif excessif par créneau
    const excessiveStaffingSlots = scheduleRules.timeSlots.filter(timeSlot => {
      const employeesForSlot = shiftsForDay
        .filter(shift => isTimeInShift(timeSlot, shift))
        .reduce((count, shift) => count + shift.employeeIds.length, 0);
      
      return employeesForSlot > scheduleRules.maxEmployeesPerTimeSlot;
    });
    
    if (excessiveStaffingSlots.length > 0) {
      const formattedSlots = excessiveStaffingSlots.map(slot => formatTimeDisplay(slot)).join(', ');
      
      alerts.push({
        type: 'warning',
        title: 'Effectif excessif',
        description: `Créneaux surchargés: ${formattedSlots}`,
        action: {
          label: 'Optimiser',
          handler: () => {
            // Trouver les shifts concernés
            const shiftsToCheck = shiftsForDay.filter(shift => 
              excessiveStaffingSlots.some(slot => isTimeInShift(slot, shift))
            );
            
            if (shiftsToCheck.length > 0) {
              handleOpenEditDialog(shiftsToCheck[0].id);
            }
          }
        }
      });
    }
    
    // 3. Vérifier les heures hebdomadaires élevées par employé
    const employeeWeeklyHours: Record<number, number> = {};
    
    // Calculer les heures pour chaque employé sur toute la semaine en utilisant calculateDuration
    for (let day = 0; day < 7; day++) {
      const dayShifts = shifts.filter(shift => shift.day === day);
      
      dayShifts.forEach(shift => {
        const shiftHours = calculateDuration(shift.startTime, shift.endTime);
        
        shift.employeeIds.forEach(empId => {
          if (!employeeWeeklyHours[empId]) {
            employeeWeeklyHours[empId] = 0;
          }
          employeeWeeklyHours[empId] += shiftHours;
        });
      });
    }
    
    // Trouver les employés qui dépassent le seuil
    const overworkedEmployees = Object.entries(employeeWeeklyHours)
      .filter(([_, hours]) => Number(hours) > scheduleRules.maxWeeklyHoursPerEmployee)
      .map(([empId, hours]) => ({
        id: parseInt(empId),
        name: employees.find(e => e.id === parseInt(empId))?.name || `Employé ${empId}`,
        hours: Number(hours)
      }));
    
    if (overworkedEmployees.length > 0) {
      const employeesList = overworkedEmployees.map(e => `${e.name} (${e.hours.toFixed(1)}h)`).join(', ');
      
      alerts.push({
        type: 'warning',
        title: 'Heures hebdomadaires excessives',
        description: `${employeesList} > ${scheduleRules.maxWeeklyHoursPerEmployee}h/semaine`,
        action: {
          label: 'Voir employés',
          handler: () => {
            // Afficher les shifts de l'employé qui travaille le plus
            const mostOverworked = overworkedEmployees.reduce((prev, curr) => 
              prev.hours > curr.hours ? prev : curr
            );
            
            // Trouver le premier shift de cet employé aujourd'hui
            const employeeShift = shiftsForDay.find(shift => 
              shift.employeeIds.includes(mostOverworked.id)
            );
            
            if (employeeShift) {
              handleOpenEditDialog(employeeShift.id);
            } else {
              // Si pas de shift aujourd'hui, afficher un message
              addNotification(
                'info',
                'Heures excessives',
                `${mostOverworked.name} a ${mostOverworked.hours.toFixed(1)}h programmées cette semaine (maximum: ${scheduleRules.maxWeeklyHoursPerEmployee}h)`
              );
            }
          }
        }
      });
    }
    
    // ALERTE DE VALIDATION (VERT)
    const hasCriticalIssues = alerts.some(alert => alert.type === 'error');
    if (!hasCriticalIssues && emptyTimeSlots.length === 0) {
      alerts.push({
        type: 'success',
        title: 'Planning validé',
        description: 'Tous les créneaux sont couverts et aucune alerte critique n\'est active'
      });
    }
    
    // Vérifier la couverture minimale
    const totalHours = getDayTotalHours(dayIndex);
    if (totalHours < scheduleRules.minHoursPerDay) {
      const missingHours = scheduleRules.minHoursPerDay - totalHours;
      
      alerts.push({
        type: 'warning',
        title: 'Couverture insuffisante',
        description: `Il manque ${missingHours.toFixed(1)}h pour atteindre le minimum (${totalHours.toFixed(1)}/${scheduleRules.minHoursPerDay}h)`,
        action: {
          label: 'Ajouter shift',
          handler: () => handleOpenAddDialog()
        }
      });
    }
    
    // Vérifier le nombre d'employés
    const uniqueEmployees = getUniqueEmployeesForDay(dayIndex).length;
    if (uniqueEmployees > scheduleRules.maxEmployeesPerDay) {
      alerts.push({
        type: 'warning',
        title: 'Trop d\'employés programmés',
        description: `${uniqueEmployees}/${scheduleRules.maxEmployeesPerDay} employés recommandés`,
        action: {
          label: 'Optimiser',
          handler: () => {
            // Afficher le planning pour permettre de réorganiser
            addNotification(
              'info',
              'Optimisation recommandée',
              `Vous pouvez réduire le nombre d'employés en optimisant les shifts ou en allongeant les horaires de travail`
            );
          }
        }
      });
    }
    
    return alerts;
  };
  
  // Vérifier si le planning peut être validé avec notification
  const validateSchedule = () => {
    const alerts = getAlerts();
    const hasCriticalIssues = alerts.some(alert => alert.type === 'error');
    
    if (hasCriticalIssues) {
      const criticalAlerts = alerts.filter(alert => alert.type === 'error');
      
      addNotification(
        'error',
        'Le planning ne peut pas être validé',
        `${criticalAlerts.length} problème(s) critique(s) à résoudre: ${criticalAlerts.map(a => a.title).join(', ')}`,
        {
          label: 'Voir les problèmes',
          handler: () => {
            // S'assurer que l'onglet "Aujourd'hui" est actif pour voir les alertes
            const tab = document.querySelector('[data-state="inactive"][value="today"]') as HTMLElement;
            if (tab) tab.click();
            
            // Scroll jusqu'aux alertes
            document.querySelector('.space-y-2.mb-4')?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      );
      return false;
    }
    
    const hasWarnings = alerts.some(alert => alert.type === 'warning');
    
    if (hasWarnings) {
      // Demander confirmation à l'utilisateur
      if (window.confirm("Le planning contient des alertes de mise en garde. Voulez-vous quand même le valider ?")) {
        const warningAlerts = alerts.filter(alert => alert.type === 'warning');
        
        addNotification(
          'success',
          'Planning validé malgré les alertes',
          `${warningAlerts.length} alerte(s) ignorée(s): ${warningAlerts.map(a => a.title).join(', ')}`
        );
        return true;
      }
      return false;
    }
    
    addNotification(
      'success',
      'Planning validé avec succès',
      'Toutes les vérifications ont été passées avec succès'
    );
    return true;
  };
  
  // Function pour obtenir les alertes d'un jour spécifique (pour le résumé hebdomadaire)
  const getDayAlerts = (dayIndex: number) => {
    // Implémentation complète des alertes pour chaque jour, similaire à getAlerts
    const dayShifts = shifts.filter(shift => shift.day === dayIndex);
    
    // Vérifier les créneaux vides
    const emptyTimeSlots = scheduleRules.timeSlots.filter(timeSlot => 
      !dayShifts.some(shift => isTimeInShift(timeSlot, shift))
    );
    
    const alerts = [];
    
    // ALERTES CRITIQUES (ROUGE)
    
    // 1. Vérifier si la journée est complète
    if (emptyTimeSlots.length > 0) {
      alerts.push({ 
        type: 'error', 
        title: 'Journée incomplète',
        details: `${emptyTimeSlots.length} créneaux non couverts` 
      });
    }
    
    // 2. Vérifier les shifts vides
    const emptyShifts = dayShifts.filter(shift => shift.employeeIds.length === 0);
    if (emptyShifts.length > 0) {
      alerts.push({ 
        type: 'error', 
        title: 'Shift(s) vide(s)',
        details: `${emptyShifts.length} shift(s) sans employé` 
      });
    }
    
    // 3. Vérifier les conflits pour ce jour
    const dayConflicts = conflicts.filter(conflict => 
      conflict.shifts.some(shift => shift.day === dayIndex)
    );
    
    if (dayConflicts.length > 0) {
      alerts.push({ 
        type: 'error', 
        title: 'Conflits d\'horaires',
        details: `${dayConflicts.length} employé(s) en conflit` 
      });
    }
    
    // ALERTES DE MISE EN GARDE (JAUNE)
    
    // 1. Vérifier la couverture minimale
    const totalHours = getDayTotalHours(dayIndex);
    if (totalHours < scheduleRules.minHoursPerDay) {
      alerts.push({ 
        type: 'warning', 
        title: 'Couverture insuffisante',
        details: `${totalHours.toFixed(1)}/${scheduleRules.minHoursPerDay}h minimum` 
      });
    }
    
    // 2. Vérifier l'effectif insuffisant après 18h
    const eveningTimeSlots = scheduleRules.timeSlots.filter(slot => {
      const hour = parseInt(slot.split(':')[0]);
      return hour >= 18 && hour <= 7;
    });
    
    // Compter le nombre unique d'employés après 18h
    const employeesAfter18h = new Set();
    
    eveningTimeSlots.forEach(timeSlot => {
      dayShifts
        .filter(shift => isTimeInShift(timeSlot, shift))
        .forEach(shift => {
          shift.employeeIds.forEach(empId => {
            employeesAfter18h.add(empId);
          });
        });
    });
    
    if (employeesAfter18h.size < scheduleRules.minEmployeesAfter18h && eveningTimeSlots.length > 0) {
      alerts.push({ 
        type: 'warning', 
        title: 'Effectif insuffisant en soirée',
        details: `${employeesAfter18h.size}/${scheduleRules.minEmployeesAfter18h} employés requis` 
      });
    }
    
    // 3. Vérifier l'effectif excessif par créneau
    const excessiveStaffingSlots = scheduleRules.timeSlots.filter(timeSlot => {
      const employeesForSlot = dayShifts
        .filter(shift => isTimeInShift(timeSlot, shift))
        .reduce((count, shift) => count + shift.employeeIds.length, 0);
      
      return employeesForSlot > scheduleRules.maxEmployeesPerTimeSlot;
    });
    
    if (excessiveStaffingSlots.length > 0) {
      alerts.push({ 
        type: 'warning', 
        title: 'Effectif excessif',
        details: `${excessiveStaffingSlots.length} créneau(x) surchargé(s)` 
      });
    }
    
    // 4. Vérifier le nombre d'employés
    const uniqueEmployees = new Set(dayShifts.flatMap(shift => shift.employeeIds)).size;
    if (uniqueEmployees > scheduleRules.maxEmployeesPerDay) {
      alerts.push({ 
        type: 'warning', 
        title: 'Trop d\'employés programmés',
        details: `${uniqueEmployees}/${scheduleRules.maxEmployeesPerDay} recommandés`
      });
    }
    
    // ALERTE DE VALIDATION (VERT)
    const hasCriticalIssues = alerts.some(alert => alert.type === 'error');
    const hasWarnings = alerts.some(alert => alert.type === 'warning');
    
    if (!hasCriticalIssues && !hasWarnings && emptyTimeSlots.length === 0) {
      alerts.push({ 
        type: 'success', 
        title: 'Jour validé',
        details: `${totalHours.toFixed(1)}h avec ${uniqueEmployees} employé(s)` 
      });
    }
    
    return alerts;
  };
  
  // Ouvrir le modal d'édition d'un shift existant
  const handleOpenEditDialog = (shiftId: number) => {
    const shiftToEdit = shifts.find(shift => shift.id === shiftId);
    if (!shiftToEdit) return;
    
    setEditingShift(shiftToEdit);
    setIsEditing(true);
    
    setNewShift({
      startTime: shiftToEdit.startTime,
      endTime: shiftToEdit.endTime,
      employeeIds: [...new Set(shiftToEdit.employeeIds)], // Utiliser un Set pour éliminer les doublons
      selectedDays: [] // Non utilisé en mode édition
    });
    
    setShowAddDialog(true);
  };

  // Sauvegarder les modifications d'un shift avec notifications améliorées
  const handleSaveShift = () => {
    try {
      // Vérifier si l'heure de fin est après l'heure de début (sauf si passage minuit)
      const startHour = convertTimeToNumber(newShift.startTime);
      const endHour = convertTimeToNumber(newShift.endTime);
      
      if (startHour === endHour) {
        addNotification(
          'error',
          'Heures invalides',
          'L\'heure de début et de fin ne peuvent pas être identiques'
        );
        return;
      }
      
      // Vérifier que la durée du shift n'est pas trop longue (max 12h)
      let duration = 0;
      if (endHour > startHour) {
        duration = endHour - startHour;
      } else {
        // Passage minuit
        duration = (24 - startHour) + endHour;
      }
      
      if (duration > 12) {
        addNotification(
          'error',
          'Durée excessive',
          'Un shift ne peut pas dépasser 12 heures'
        );
        return;
      }
      
      if (isEditing && editingShift) {
        // Modifier un shift existant
        const updatedShifts = shifts.map(shift => {
          if (shift.id === editingShift.id) {
            // Utiliser un Set pour éliminer les doublons d'employés
            const uniqueEmployeeIds = [...new Set(newShift.employeeIds.length > 0 ? newShift.employeeIds : [1])];
            
            return {
              ...shift,
              startTime: newShift.startTime,
              endTime: newShift.endTime,
              employeeIds: uniqueEmployeeIds
            };
          }
          return shift;
        });
        
        setShifts(updatedShifts);
        
        const employees = newShift.employeeIds.map(id => 
          mockEmployees.find(e => e.id === id)?.name || `Employé ${id}`
        ).join(', ');
        
        addNotification(
          'success',
          'Shift modifié',
          `Le shift de ${formatTimeDisplay(newShift.startTime)} à ${formatTimeDisplay(newShift.endTime)} a été mis à jour avec ${employees || 'Reda'}`
        );
      } else {
        // Vérifier qu'au moins un jour est sélectionné
        if (newShift.selectedDays.length === 0) {
          addNotification(
            'error',
            'Aucun jour sélectionné',
            'Veuillez sélectionner au moins un jour pour ce shift'
          );
          return;
        }
        
        // Ajouter un nouveau shift pour chaque jour sélectionné
        let maxId = shifts.length > 0 ? Math.max(...shifts.map(s => s.id)) : 0;
        // Utiliser un Set pour éliminer les doublons d'employés
        const uniqueEmployeeIds = [...new Set(newShift.employeeIds.length > 0 ? newShift.employeeIds : [1])]; // Reda par défaut si aucun employé sélectionné
        
        // Avertir si certains employés ont déjà beaucoup d'heures cette semaine
        const employeesWithManyHours: string[] = [];
        
        uniqueEmployeeIds.forEach(empId => {
          let totalHours = 0;
          for (let day = 0; day < 7; day++) {
            const dayShifts = shifts.filter(shift => 
              shift.day === day && shift.employeeIds.includes(empId)
            );
            
            dayShifts.forEach(shift => {
              const shiftStartHour = convertTimeToNumber(shift.startTime);
              const shiftEndHour = convertTimeToNumber(shift.endTime);
              let shiftHours = 0;
              
              if (shiftEndHour > shiftStartHour) {
                shiftHours = shiftEndHour - shiftStartHour;
              } else {
                // Passage minuit
                shiftHours = (24 - shiftStartHour) + shiftEndHour;
              }
              
              totalHours += shiftHours;
            });
          }
          
          // Ajouter la durée du nouveau shift pour chaque jour sélectionné
          totalHours += duration * newShift.selectedDays.length;
          
          if (totalHours > scheduleRules.maxWeeklyHoursPerEmployee) {
            const employee = employees.find(e => e.id === empId);
            if (employee) {
              employeesWithManyHours.push(employee.name);
            }
          }
        });
        
        if (employeesWithManyHours.length > 0 && !window.confirm(
          `Attention: ${employeesWithManyHours.join(', ')} ${employeesWithManyHours.length > 1 ? 'dépasseront' : 'dépassera'} ${scheduleRules.maxWeeklyHoursPerEmployee}h/semaine. Continuer quand même ?`
        )) {
          return;
        }
        
        // Créer un shift pour chaque jour sélectionné
        const newShifts = newShift.selectedDays.map(dayIndex => {
          maxId += 1;
          return {
            id: maxId,
            employeeIds: uniqueEmployeeIds,
            day: dayIndex,
            startTime: newShift.startTime,
            endTime: newShift.endTime,
            status: 'confirmed' as const
          };
        });
        
        setShifts(prevShifts => [...prevShifts, ...newShifts]);
        
        const daysList = newShift.selectedDays.length === 1 
          ? dayNames[newShift.selectedDays[0]] 
          : `${newShift.selectedDays.length} jours`;
          
        const employeesList = uniqueEmployeeIds.map(id => 
          mockEmployees.find(e => e.id === id)?.name || `Employé ${id}`
        ).join(', ');
        
        addNotification(
          'success',
          `${newShifts.length} shift(s) ajouté(s)`,
          `${daysList} de ${formatTimeDisplay(newShift.startTime)} à ${formatTimeDisplay(newShift.endTime)} avec ${employeesList || 'Reda'}`,
          {
            label: 'Voir dans le planning',
            handler: () => {
              // Action pour aller au jour du premier shift ajouté
              const newDate = new Date(currentDate);
              const diff = newShift.selectedDays[0] - getDayIndex(currentDate);
              newDate.setDate(currentDate.getDate() + diff);
              setCurrentDate(newDate);
              
              // S'assurer que l'onglet "Aujourd'hui" est actif
              const tab = document.querySelector('[data-state="inactive"][value="today"]') as HTMLElement;
              if (tab) tab.click();
            }
          }
        );
      }
      
      // Fermer le modal
      setShowAddDialog(false);
      setIsEditing(false);
      setEditingShift(null);
      
      // Détecter les conflits après l'ajout/modification
      setTimeout(() => detectConflicts(), 100);
    } catch (error) {
      console.error("Erreur lors de l'opération sur le shift:", error);
      addNotification(
        'error',
        `Erreur lors de l'${isEditing ? 'édition' : 'ajout'} du shift`,
        'Une erreur inattendue s\'est produite. Veuillez réessayer.'
      );
    }
  };

  // Supprimer un shift avec notification
  const handleDeleteShift = (shiftId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce shift ?")) {
      const shiftToDelete = shifts.find(s => s.id === shiftId);
      if (!shiftToDelete) return;
      
      const updatedShifts = shifts.filter(shift => shift.id !== shiftId);
      setShifts(updatedShifts);
      
      const employeesList = shiftToDelete.employeeIds.map(id => 
        mockEmployees.find(e => e.id === id)?.name || `Employé ${id}`
      ).join(', ');
      
      const dayName = dayNames[shiftToDelete.day];
      
      addNotification(
        'info',
        'Shift supprimé',
        `Le shift de ${formatTimeDisplay(shiftToDelete.startTime)} à ${formatTimeDisplay(shiftToDelete.endTime)} le ${dayName} avec ${employeesList} a été supprimé`,
        {
          label: 'Annuler',
          handler: () => {
            // Annuler la suppression
            setShifts(prev => [...prev, shiftToDelete]);
            addNotification('success', 'Suppression annulée', 'Le shift a été restauré');
          }
        }
      );
      
      detectConflicts();
    }
  };

  // Dupliquer un shift vers le jour suivant
  const handleDuplicateShift = (shiftId: number) => {
    const shiftToDuplicate = shifts.find(s => s.id === shiftId);
    if (!shiftToDuplicate) return;
    
    // Calculer le jour suivant
    const nextDay = (shiftToDuplicate.day + 1) % 7;
    
    // Générer un ID unique
    const maxId = shifts.length > 0 ? Math.max(...shifts.map(s => s.id)) : 0;
    const newId = maxId + 1;
    
    const duplicatedShift = {
      ...shiftToDuplicate,
      id: newId,
      day: nextDay
    };
    
    setShifts([...shifts, duplicatedShift]);
    
    toast.success("Shift dupliqué", {
      description: `Shift copié vers ${dayNames[nextDay]}`
    });
    
    detectConflicts();
  };
    
    // Calculer les heures hebdomadaires pour un employé
    const getEmployeeWeeklyHours = (employeeId: number): number => {
      let totalHours = 0;
      for (let day = 0; day < 7; day++) {
        const dayShifts = shifts.filter(shift => 
          shift.day === day && shift.employeeIds.includes(employeeId)
        );
        
        dayShifts.forEach(shift => {
          const startHour = convertTimeToNumber(shift.startTime);
          const endHour = convertTimeToNumber(shift.endTime);
          
          // Gestion du passage de minuit
          let shiftHours = 0;
          if (endHour > startHour) {
            shiftHours = endHour - startHour;
          } else {
            // Shift qui passe minuit
            shiftHours = (24 - startHour) + endHour;
          }
          
          totalHours += shiftHours;
        });
      }
      
      return Math.round(totalHours * 10) / 10; // Arrondi à 1 décimale
    };
    
    // Fonction pour partager le planning avec les employés
    const handleShareSchedule = () => {
      // Vérifier si le planning a des alertes
      const alerts = getAlerts();
      const hasCriticalIssues = alerts.some(alert => alert.type === 'error');
      const hasWarnings = alerts.some(alert => alert.type === 'warning');
      
      let warningMessage = "";
      
      // Plutôt que de bloquer, afficher une confirmation
      if (hasCriticalIssues) {
        const criticalAlerts = alerts.filter(alert => alert.type === 'error');
        warningMessage = `Attention: Le planning contient ${criticalAlerts.length} problème(s) critique(s): ${criticalAlerts.map(a => a.title).join(', ')}.\n\n`;
      }
      
      if (hasWarnings) {
        const warningAlerts = alerts.filter(alert => alert.type === 'warning');
        warningMessage += `Le planning contient également ${warningAlerts.length} alerte(s) de mise en garde.\n\n`;
      }
      
      // Vérifier la couverture minimale pour chaque jour
      const incompleteDays = [0, 1, 2, 3, 4, 5, 6].filter(day => {
        const dayShifts = getShiftsForDay(day);
        const totalHours = getDayTotalHours(day);
        return totalHours < scheduleRules.minHoursPerDay;
      });
      
      if (incompleteDays.length > 0) {
        const daysNames = incompleteDays.map(day => dayNames[day]).join(', ');
        warningMessage += `Les jours suivants n'ont pas le nombre minimum d'heures requis (${scheduleRules.minHoursPerDay}h): ${daysNames}.\n\n`;
      }
      
      // Si des alertes existent, demander confirmation
      if (warningMessage !== "") {
        warningMessage += "Voulez-vous quand même partager le planning?";
        if (!window.confirm(warningMessage)) {
          return;
        }
        
        // Notification pour informer l'utilisateur que le planning a été partagé malgré les problèmes
        addNotification(
          'warning',
          'Planning partagé avec alertes',
          'Le planning a été partagé malgré la présence de problèmes ou d\'alertes.'
        );
      }
      
      // Partager le planning sans condition de validation
      setIsScheduleShared(true);
      setShowShareDialog(false);
      
      // Afficher une notification de succès
      addNotification(
        'success',
        'Planning partagé avec succès',
        'Les employés peuvent maintenant voir leur planning pour la semaine',
        {
          label: 'Voir Planning',
          handler: () => navigate('/planning-viewer')
        }
      );
    };
    
    return (
    <PageContainer>
      <div className="space-y-4">
        {/* En-tête avec navigation entre les jours - adaptation mobile */}
        <div className="bg-white dark:bg-background p-3 rounded-md border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold">
                {dayNames[getDayIndex(currentDate)]} {format(currentDate, 'd MMMM', { locale: fr })}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  <span>{getUniqueEmployeesForDay(getDayIndex(currentDate)).length} employés</span>
          </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{getDayTotalHours(getDayIndex(currentDate))} heures</span>
                </div>
              </div>
        </div>
        
            {/* Bouton de notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-4 w-4" />
                {getUnreadNotifications().length > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                )}
              </Button>
              
              {/* Panneau de notifications */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-md z-50 max-h-96 overflow-y-auto">
                  <div className="p-2 border-b flex items-center justify-between">
                    <h3 className="text-sm font-medium">Notifications</h3>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => {
                      setNotifications([]);
                      setShowNotifications(false);
                    }}>
                      Tout effacer
                    </Button>
          </div>
          
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      Aucune notification
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-2 text-xs hover:bg-gray-50 ${notif.read ? '' : 'bg-blue-50'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className={`font-medium flex items-center ${
                              notif.type === 'error' ? 'text-red-600' : 
                              notif.type === 'warning' ? 'text-amber-600' :
                              notif.type === 'success' ? 'text-green-600' : 'text-blue-600'
                            }`}>
                              {notif.type === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                              {notif.type === 'warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {notif.type === 'success' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {notif.type === 'info' && <Info className="h-3 w-3 mr-1" />}
                              {notif.message}
                            </div>
          <Button 
            variant="ghost" 
            size="icon"
                              className="h-4 w-4"
                              onClick={() => removeNotification(notif.id)}
                            >
                              <X className="h-3 w-3" />
          </Button>
        </div>
                          {notif.details && (
                            <div className="text-muted-foreground mt-1">
                              {notif.details}
                            </div>
                          )}
                          <div className="flex justify-between items-center mt-1 pt-1">
                            <span className="text-[10px] text-muted-foreground">
                              {format(notif.timestamp, 'HH:mm')}
                            </span>
                            {notif.action && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-xs"
                  onClick={() => {
                                  notif.action?.handler();
                                  markNotificationAsRead(notif.id);
                                  setShowNotifications(false);
                                }}
                              >
                                {notif.action.label}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation adaptée pour mobile */}
          {isMobile ? (
            <>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <Button variant="outline" size="sm" onClick={goToPreviousDay}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  <Calendar className="h-4 w-4 mr-1" />
                  Aujourd'hui
                </Button>
                <Button variant="outline" size="sm" onClick={goToNextDay}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={generateOptimalSchedule}>
                  <Wand2 className="h-4 w-4 mr-1" />
                  Auto-fill
                </Button>
                <Button 
                  variant={isScheduleShared ? "secondary" : "outline"} 
                  size="sm" 
                  onClick={() => {
                    setShowShareDialog(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white focus:ring-2 focus:ring-blue-300"
                >
                  {isScheduleShared ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Partagé
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 mr-1" />
                      Partager
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                <Calendar className="h-4 w-4 mr-1" />
                Aujourd'hui
              </Button>
              <Button variant="outline" size="sm" onClick={goToPreviousDay}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextDay}>
                <span>Suivant</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
              <Button variant="outline" size="sm" onClick={generateOptimalSchedule}>
                <Wand2 className="h-4 w-4 mr-1" />
                Auto-fill
              </Button>
              <Button 
                variant={isScheduleShared ? "secondary" : "outline"} 
                size="sm" 
                onClick={() => setShowShareDialog(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white focus:ring-2 focus:ring-blue-300"
              >
                {isScheduleShared ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Partagé
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-1" />
                    Partager
                  </>
                )}
              </Button>
            </div>
          )}
                    </div>
                    
        {/* Barre de notification contextuelle */}
        {getUnreadNotifications().length > 0 && (
          <div 
            className="bg-blue-50 rounded-md border border-blue-200 p-2 text-xs text-blue-700 flex items-center justify-between"
            onClick={() => setShowNotifications(true)}
          >
            <div className="flex items-center">
              <Bell className="h-3 w-3 mr-1" />
              <span>{getUnreadNotifications().length} nouvelle(s) notification(s)</span>
            </div>
          <Button 
                        variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
            >
              Voir
                      </Button>
          </div>
        )}
        
        <Tabs defaultValue="today">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today">Aujourd'hui</TabsTrigger>
            <TabsTrigger value="week">Semaine</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today">
            {/* Résumé des employés - Version compacte */}
            <div className="bg-white rounded-md border p-3 mb-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Personnel du jour ({getUniqueEmployeesForDay(getDayIndex(currentDate)).length})
                </h3>
                      <Button 
                  variant="secondary" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => handleOpenAddDialog()}
                >
                  <Plus className="h-3 w-3 mr-1" />
          </Button>
      </div>

              <div className="flex flex-wrap gap-1">
                {getUniqueEmployeesForDay(getDayIndex(currentDate)).map(empId => {
                  const employee = employees.find(e => e.id === empId);
                  if (!employee) return null;
                  
                  return (
                    <Badge key={empId} variant="outline" className="bg-blue-50">
                          {employee.name}
                        </Badge>
              );
            })}
                
                {getUniqueEmployeesForDay(getDayIndex(currentDate)).length === 0 && (
                  <div className="text-xs text-gray-500 italic">
                    Aucun employé assigné ce jour
                  </div>
                )}
            </div>
              
              {/* Indicateur visuel de la couverture des heures */}
              <div className="mt-3 pt-2 border-t">
                <div className="text-xs font-medium mb-1">Couverture des heures</div>
                <div className="flex overflow-x-auto pb-1">
                  {getHoursCoverage(getDayIndex(currentDate)).map((slot, index) => {
                    const isNightShift = parseInt(slot.hour) >= 22 || parseInt(slot.hour) < 7;
                    const isPeakHour = parseInt(slot.hour) >= 18 && parseInt(slot.hour) <= 21;
                    
                    let bgColor = "bg-gray-100";
                    if (slot.employees === 0) bgColor = "bg-red-100";
                    else if (slot.employees < scheduleRules.minEmployeesPerTimeSlot) bgColor = "bg-amber-100";
                    else if (slot.employees > scheduleRules.maxEmployeesPerTimeSlot) bgColor = "bg-amber-100";
                    else if (isPeakHour && slot.employees >= scheduleRules.minEmployeesPerTimeSlot) bgColor = "bg-green-100";
                    else bgColor = "bg-blue-50";
                    
    return (
                      <div 
                        key={index} 
                        className={`flex-shrink-0 text-center px-1 py-0.5 text-[9px] border-r ${bgColor} w-8 ${isNightShift ? 'text-gray-600' : ''}`}
                      >
                        {formatTimeDisplay(slot.hour)}
                        <div className={`font-medium ${slot.employees === 0 ? 'text-red-600' : ''}`}>
                          {slot.employees}
              </div>
              </div>
                    );
                  })}
              </div>
            </div>
        </div>
        
            {/* Grille des créneaux horaires - Adaptation mobile */}
            <div className="bg-white rounded-md border overflow-hidden shadow-sm">
              <div className="p-2 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Planning horaire
                </h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7"
                  onClick={() => handleOpenAddDialog()}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  <span className={isMobile ? "sr-only" : ""}>Nouveau shift</span>
                </Button>
              </div>
              
              {/* Légende des états */}
              <div className="px-2 py-1 border-b bg-gray-50 flex gap-3 text-[10px] text-muted-foreground">
            <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-50 border border-red-200 rounded-full mr-1"></div>
                  Problème
              </div>
          <div className="flex items-center">
                  <div className="w-2 h-2 bg-amber-50 border border-amber-200 rounded-full mr-1"></div>
                  Attention
              </div>
          <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-50 border border-blue-100 rounded-full mr-1"></div>
                  OK
            </div>
      </div>

              <div className="grid grid-cols-1 divide-y">
                {scheduleRules.timeSlots.map((timeSlot, index) => {
                  const slotHour = parseInt(timeSlot);
                  const isNightShift = slotHour >= 0 && slotHour < 7;
                  
                  const shiftsForTime = getShiftsForDay(getDayIndex(currentDate))
                    .filter(shift => isTimeInShift(timeSlot, shift));
                  
                  // Vérification pour coloration du créneau
                  const isEvening = parseInt(timeSlot) >= 18 || (parseInt(timeSlot) >= 0 && parseInt(timeSlot) <= 7);
                  const employeeCount = shiftsForTime.reduce((count, shift) => count + shift.employeeIds.length, 0);
                  
                  // Calcul des employés uniques pour ce créneau
                  const uniqueEmployeesForTimeSlot = new Set();
                  shiftsForTime.forEach(shift => {
                    shift.employeeIds.forEach(empId => {
                      uniqueEmployeesForTimeSlot.add(empId);
                    });
                  });
                  
                  const hasInsufficientStaff = isEvening && uniqueEmployeesForTimeSlot.size < scheduleRules.minEmployeesAfter18h;
                  const hasExcessiveStaff = employeeCount > scheduleRules.maxEmployeesPerTimeSlot;
                  const isEmpty = shiftsForTime.length === 0;
                  
                  return (
                    <div 
                      key={timeSlot} 
                      className={`p-2 ${
                        isEmpty ? 'bg-red-50' : 
                        hasInsufficientStaff ? 'bg-amber-50' :
                        hasExcessiveStaff ? 'bg-amber-50' : 
                        isNightShift ? 'bg-blue-50' : ''
                      }`}
            >
              <div className="flex justify-between items-center mb-1">
                        <div className="text-xs font-medium flex items-center">
                          {formatTimeDisplay(timeSlot)}
                          {isEmpty && <AlertCircle className="h-3 w-3 ml-1 text-red-500" />}
                          {hasInsufficientStaff && <AlertTriangle className="h-3 w-3 ml-1 text-amber-500" />}
                          {hasExcessiveStaff && <AlertTriangle className="h-3 w-3 ml-1 text-amber-500" />}
                          {isNightShift && !isEmpty && <span className="ml-1 text-[10px] text-blue-600">Nuit</span>}
        </div>
          <Button
            variant="ghost"
            size="sm"
                          className="h-6 px-2"
                          onClick={() => handleOpenAddDialog(timeSlot)}
          >
            <Plus className="h-3 w-3" />
          </Button>
                    </div>
        
                      <div className="space-y-1">
                        {shiftsForTime.map(shift => {
                          // Vérifier si ce shift est en conflit
                          const isConflict = conflicts.some(conflict => 
                            conflict.shifts.some(s => s.id === shift.id)
                          );
                          
                          // Vérifier s'il y a trop d'employés
                          const hasExcessiveEmployees = shift.employeeIds.length > scheduleRules.maxEmployeesPerTimeSlot;
                          
                          // Vérifier si c'est un shift de nuit
                          const shiftStartHour = parseInt(shift.startTime);
                          const shiftEndHour = parseInt(shift.endTime);
                          const isNightShift = shiftEndHour < shiftStartHour || shiftStartHour >= 22 || shiftEndHour <= 7;
            
  return (
                            <div 
                              key={shift.id}
                              className={`rounded border p-1.5 text-xs ${
                                isConflict ? 'bg-red-50 border-red-200' : 
                                hasExcessiveEmployees ? 'bg-amber-50 border-amber-200' :
                                isNightShift ? 'bg-indigo-50 border-indigo-100' :
                                'bg-blue-50 border-blue-100'
                              }`}
                            >
                              <div className="flex justify-between">
                                <span className="font-medium">
                                  {formatTimeDisplay(shift.startTime)} - {formatTimeDisplay(shift.endTime)}
                                  {isNightShift && shiftEndHour < shiftStartHour && <span className="text-[9px] ml-1 text-indigo-600">+1j</span>}
                                </span>
          <div className="flex">
          <Button 
              variant="ghost"
              size="icon" 
              className="h-4 w-4"
              onClick={() => handleDuplicateShift(shift.id)}
              title="Dupliquer vers le jour suivant"
            >
              <Copy className="h-3 w-3" />
          </Button>
          <Button 
              variant="ghost" 
              size="icon"
              className="h-4 w-4 ml-1"
              onClick={() => handleOpenEditDialog(shift.id)}
            >
              <Edit className="h-3 w-3" />
          </Button>
          <Button 
              variant="ghost" 
              size="icon"
              className="h-4 w-4 ml-1 text-red-500"
              onClick={() => handleDeleteShift(shift.id)}
              title="Supprimer le shift"
            >
              <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

                              {shift.employeeIds.length > 0 ? (
                                <div className="text-[10px] text-muted-foreground mt-1">
                                  {shift.employeeIds.map(id => 
                                    employees.find(e => e.id === id)?.name
                                  ).join(', ')}
              </div>
                              ) : (
                                <div className="text-[10px] text-red-500 mt-1 italic">
                                  Aucun employé assigné
              </div>
                              )}
                              
                              <div className="flex flex-wrap gap-1 mt-1">
                                {isConflict && (
                                  <Badge variant="destructive" className="text-[8px] h-4">
                                    Conflit
                                  </Badge>
                                )}
                                {hasExcessiveEmployees && (
                                  <Badge variant="outline" className="text-[8px] h-4 bg-amber-50 text-amber-700 border-amber-200">
                                    Trop d'employés
                                  </Badge>
                                )}
                                {isEvening && hasInsufficientStaff && (
                                  <Badge variant="outline" className="text-[8px] h-4 bg-amber-50 text-amber-700 border-amber-200">
                                    Effectif insuffisant
                                  </Badge>
                                )}
                                {isNightShift && (
                                  <Badge variant="outline" className="text-[8px] h-4 bg-indigo-50 text-indigo-700 border-indigo-200">
                                    Service nuit
                </Badge>
              )}
            </div>
                  </div>
                          );
                        })}
                        
                        {shiftsForTime.length === 0 && (
                          <div className="text-center text-[10px] text-red-500 py-1 font-medium">
                            Aucun employé assigné
            </div>
                        )}
      </div>
                </div>
                  );
                })}
              </div>
                    </div>
          </TabsContent>
          
          <TabsContent value="week">
            {/* Vue de la semaine - Adaptation mobile */}
            <div className="bg-white rounded-md border p-3 mb-4 shadow-sm">
              <h3 className="text-sm font-medium mb-2">Vue hebdomadaire</h3>
              <div className="grid grid-cols-7 gap-1 overflow-x-auto pb-2">
                {generateWeekSummary().map((day) => {
                  // Vérifier si ce jour a des alertes critiques
                  const dayAlerts = getDayAlerts(day.dayIndex);
                  const hasCriticalAlerts = dayAlerts.some(alert => alert.type === 'error');
                  const hasWarningAlerts = !hasCriticalAlerts && dayAlerts.some(alert => alert.type === 'warning');
                  const isValid = !hasCriticalAlerts && !hasWarningAlerts;
                  
  return (
                    <div
                      key={day.dayIndex}
                      className={`text-center p-2 rounded cursor-pointer min-w-[45px] ${
                        hasCriticalAlerts ? 'bg-red-50 border border-red-200' : 
                        hasWarningAlerts ? 'bg-amber-50 border border-amber-200' : 
                        isValid ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                      } ${getDayIndex(currentDate) === day.dayIndex ? 'ring-2 ring-primary' : ''}`}
              onClick={() => {
                        const newDate = new Date(currentDate);
                        const diff = day.dayIndex - getDayIndex(currentDate);
                        newDate.setDate(currentDate.getDate() + diff);
                        setCurrentDate(newDate);
                      }}
                    >
                      <div className="text-xs font-medium">{isMobile ? dayNames[day.dayIndex].substring(0, 3) : dayNames[day.dayIndex]}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {day.totalHours}h / {day.employeeCount} emp.
        </div>
      </div>
                  );
                })}
                        </div>
                      </div>
              
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-3 shadow-sm">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Résumé de la semaine
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total heures:</span>
              <span className="font-medium">
                      {[0, 1, 2, 3, 4, 5, 6].reduce((sum, day) => sum + getDayTotalHours(day), 0)}h
              </span>
                    </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jours complets:</span>
                    <span className="font-medium">
                      {[0, 1, 2, 3, 4, 5, 6].filter(day => getDayTotalHours(day) >= scheduleRules.minHoursPerDay).length}/7
                    </span>
                    </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conflits détectés:</span>
                    <span className={`font-medium ${conflicts.length > 0 ? 'text-red-500' : ''}`}>
                      {conflicts.length}
                    </span>
                    </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Personnel total:</span>
                    <span className="font-medium">
                      {new Set([0, 1, 2, 3, 4, 5, 6].flatMap(day => getUniqueEmployeesForDay(day))).size}
                    </span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3 shadow-sm">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Heures par employé
                </h3>
                <div className="space-y-2 text-xs max-h-[120px] overflow-y-auto">
                  {employees.map(emp => {
                    // Calculer les heures hebdomadaires pour cet employé
                    let totalHours = 0;
                    for (let day = 0; day < 7; day++) {
                      const dayShifts = shifts.filter(shift => 
                        shift.day === day && shift.employeeIds.includes(emp.id)
                      );
                      
                      dayShifts.forEach(shift => {
                        const shiftHours = parseInt(shift.endTime) - parseInt(shift.startTime);
                        totalHours += shiftHours;
                      });
                    }
                    
                    return (
                      <div key={emp.id} className="flex justify-between">
                        <span className="text-muted-foreground truncate">{emp.name}:</span>
                        <span className={`font-medium ${totalHours > scheduleRules.maxWeeklyHoursPerEmployee ? 'text-amber-500' : ''}`}>
                          {totalHours}h
                        </span>
            </div>
                    );
                  })}
          </div>
              </Card>
        </div>
          </TabsContent>
        </Tabs>
        
        {/* Modal pour ajouter/éditer un shift */}
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) {
            setIsEditing(false);
            setEditingShift(null);
          }
        }}>
          <DialogContent className={`sm:max-w-md ${isMobile ? 'w-[95vw] px-3 py-4 max-h-[90vh] overflow-y-auto' : ''}`}>
            <DialogHeader>
              <DialogTitle className={isMobile ? 'text-lg' : ''}>{isEditing ? 'Modifier le shift' : 'Ajouter un nouveau shift'}</DialogTitle>
              <DialogDescription className={isMobile ? 'text-sm' : ''}>
                {isEditing ? 'Modifiez les détails du shift' : 'Définissez les horaires et les employés assignés'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 my-2">
              {/* Horaires de début et de fin */}
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-4'}`}>
                <div className="space-y-1">
                  <Label htmlFor="startTime">Heure de début</Label>
                  <Select
                    value={newShift.startTime}
                    onValueChange={handleStartTimeChange}
                  >
                    <SelectTrigger className={isMobile ? 'h-9' : ''}>
                      <SelectValue placeholder="Sélectionner une heure" />
                    </SelectTrigger>
                    <SelectContent className={`${isMobile ? 'max-h-[30vh]' : ''}`}>
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>
                          {formatTimeDisplay(time)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="endTime">Heure de fin</Label>
                  <Select
                    value={newShift.endTime}
                    onValueChange={handleEndTimeChange}
                  >
                    <SelectTrigger className={isMobile ? 'h-9' : ''}>
                      <SelectValue placeholder="Sélectionner une heure" />
                    </SelectTrigger>
                    <SelectContent className={`${isMobile ? 'max-h-[30vh]' : ''}`}>
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>
                          {formatTimeDisplay(time)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Jours concernés - visible uniquement en mode ajout */}
              {!isEditing && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label className={isMobile ? 'text-sm font-medium' : ''}>Jours concernés</Label>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setNewShift({ ...newShift, selectedDays: [0, 1, 2, 3, 4, 5, 6] })}
                    >
                      Tous sélectionner
                    </Button>
                  </div>
                  <div className={`grid ${isMobile ? 'grid-cols-4 gap-2' : 'grid-cols-7 gap-1'}`}>
                    {dayNames.map((name, index) => (
                      <div 
                        key={index} 
                        className={`
                          border rounded-md px-2 py-2 text-center cursor-pointer text-xs
                          ${newShift.selectedDays.includes(index) 
                            ? 'bg-primary text-primary-foreground font-semibold' 
                            : 'bg-background hover:bg-muted'}
                          ${isMobile ? 'mb-1' : ''}
                        `}
                        onClick={() => handleDaySelection(index)}
                      >
                        {isMobile ? name.substring(0, 3) : name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Employés assignés */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label className={isMobile ? 'text-sm font-medium' : ''}>Employés assignés</Label>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setNewShift({ ...newShift, employeeIds: [], selectedDays: newShift.selectedDays })}
                  >
                    Tout désélectionner
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  Les heures déjà travaillées cette semaine sont indiquées pour chaque employé.
                </div>
                <div className="border rounded-md p-3 overflow-y-auto" style={{ maxHeight: isMobile ? '35vh' : '150px' }}>
                  {employees.map(employee => {
                    // Vérifier si l'employé est déjà occupé sur cette plage horaire
                    const isOccupied = !isEditing && shifts.some(shift => 
                      // Vérifier si c'est un shift pour l'un des jours sélectionnés
                      newShift.selectedDays.includes(shift.day) && 
                      // Vérifier si l'employé est dans ce shift
                      shift.employeeIds.includes(employee.id) &&
                      // Vérifier si les horaires se chevauchent - le shift doit avoir au moins une minute de chevauchement
                      ((convertTimeToNumber(newShift.startTime) < convertTimeToNumber(shift.endTime) && 
                        convertTimeToNumber(shift.startTime) < convertTimeToNumber(newShift.endTime)) ||
                       // Gestion des shifts qui passent minuit
                       (convertTimeToNumber(newShift.startTime) > convertTimeToNumber(newShift.endTime) && 
                        (convertTimeToNumber(shift.startTime) < convertTimeToNumber(newShift.endTime) || 
                         convertTimeToNumber(shift.startTime) >= convertTimeToNumber(newShift.startTime))) ||
                       (convertTimeToNumber(shift.startTime) > convertTimeToNumber(shift.endTime) &&
                        (convertTimeToNumber(newShift.startTime) < convertTimeToNumber(shift.endTime) || 
                         convertTimeToNumber(newShift.startTime) >= convertTimeToNumber(shift.startTime))))
                    );
                    
                    // En mode édition, ne pas considérer comme occupé si c'est le shift en cours d'édition
                    const isOccupiedInEdit = isEditing && editingShift && shifts.some(shift => 
                      shift.id !== editingShift.id &&
                      shift.day === editingShift.day && 
                      shift.employeeIds.includes(employee.id) &&
                      ((convertTimeToNumber(newShift.startTime) < convertTimeToNumber(shift.endTime) && 
                        convertTimeToNumber(shift.startTime) < convertTimeToNumber(newShift.endTime)) ||
                       // Gestion des shifts qui passent minuit
                       (convertTimeToNumber(newShift.startTime) > convertTimeToNumber(newShift.endTime) && 
                        (convertTimeToNumber(shift.startTime) < convertTimeToNumber(newShift.endTime) || 
                         convertTimeToNumber(shift.startTime) >= convertTimeToNumber(newShift.startTime))) ||
                       (convertTimeToNumber(shift.startTime) > convertTimeToNumber(shift.endTime) &&
                        (convertTimeToNumber(newShift.startTime) < convertTimeToNumber(shift.endTime) || 
                         convertTimeToNumber(newShift.startTime) >= convertTimeToNumber(shift.startTime))))
                    );
                    
                    // Afficher le statut de l'employé pour le débogage (à commenter en production)
                    // console.log(`Employé ${employee.name}: ${isEditing ? isOccupiedInEdit : isOccupied ? 'occupé' : 'disponible'}`);
                    
                    const isDisabled = isEditing ? isOccupiedInEdit : isOccupied;
                    
                    return (
                      <div key={employee.id} className={`flex items-center ${isDisabled ? 'opacity-60' : ''} ${isMobile ? 'py-3 mb-1 border-b last:border-b-0 border-gray-100' : 'mb-1'}`}>
                        <div className="flex items-center w-full">
                          <input
                            type="checkbox"
                            id={`employee-${employee.id}`}
                            checked={newShift.employeeIds.includes(employee.id)}
                            onChange={() => handleEmployeeChange(employee.id)}
                            disabled={isDisabled}
                            className={`rounded-sm ${isMobile ? 'w-5 h-5 mr-3' : 'mr-2'}`}
                          />
                          <label htmlFor={`employee-${employee.id}`} className={`text-sm cursor-pointer flex-1 ${isDisabled ? 'line-through text-gray-400' : ''}`}>
                            <div className="flex flex-col">
                              <div>{employee.name}</div>
                              <div className="flex flex-wrap gap-1 items-center">
                                {!isMobile && <span className="text-xs text-gray-500">{employee.weeklyHours}h/sem.</span>}
                                <span className="text-xs text-blue-600">
                                  {getEmployeeWeeklyHours(employee.id)}h cette sem.
                                </span>
                                {isDisabled && (
                                  <span className="text-xs text-red-500">
                                    (déjà occupé)
                                  </span>
                                )}
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {newShift.employeeIds.length === 0 && (
                  <div className="text-[11px] text-amber-500 flex items-center mt-2">
                    <ShieldAlert className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span>Si aucun employé n'est sélectionné, John Doe sera assigné par défaut</span>
                  </div>
                )}
                
                {/* Message d'avertissement pour les employés désactivés */}
                {employees.some(employee => {
                  // Vérifier si l'employé est déjà occupé sur cette plage horaire (même logique que plus haut)
                  const isOccupied = !isEditing && shifts.some(shift => 
                    newShift.selectedDays.includes(shift.day) && 
                    shift.employeeIds.includes(employee.id) &&
                    ((convertTimeToNumber(newShift.startTime) < convertTimeToNumber(shift.endTime) && 
                      convertTimeToNumber(shift.startTime) < convertTimeToNumber(newShift.endTime)) ||
                     (convertTimeToNumber(newShift.startTime) > convertTimeToNumber(newShift.endTime) && 
                      (convertTimeToNumber(shift.startTime) < convertTimeToNumber(newShift.endTime) || 
                       convertTimeToNumber(shift.startTime) >= convertTimeToNumber(newShift.startTime))) ||
                     (convertTimeToNumber(shift.startTime) > convertTimeToNumber(shift.endTime) &&
                      (convertTimeToNumber(newShift.startTime) < convertTimeToNumber(shift.endTime) || 
                       convertTimeToNumber(newShift.startTime) >= convertTimeToNumber(shift.startTime))))
                  );
                  
                  const isOccupiedInEdit = isEditing && editingShift && shifts.some(shift => 
                    shift.id !== editingShift.id &&
                    shift.day === editingShift.day && 
                    shift.employeeIds.includes(employee.id) &&
                    ((convertTimeToNumber(newShift.startTime) < convertTimeToNumber(shift.endTime) && 
                      convertTimeToNumber(shift.startTime) < convertTimeToNumber(newShift.endTime)) ||
                     (convertTimeToNumber(newShift.startTime) > convertTimeToNumber(newShift.endTime) && 
                      (convertTimeToNumber(shift.startTime) < convertTimeToNumber(newShift.endTime) || 
                       convertTimeToNumber(shift.startTime) >= convertTimeToNumber(newShift.startTime))) ||
                     (convertTimeToNumber(shift.startTime) > convertTimeToNumber(shift.endTime) &&
                      (convertTimeToNumber(newShift.startTime) < convertTimeToNumber(shift.endTime) || 
                       convertTimeToNumber(newShift.startTime) >= convertTimeToNumber(shift.startTime))))
                  );
                  
                  return isEditing ? isOccupiedInEdit : isOccupied;
                }) && (
                  <div className="text-[11px] text-amber-500 flex items-center mt-2">
                    <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span>Certains employés ne sont pas disponibles car ils sont déjà programmés sur ce créneau</span>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter className={`${isMobile ? 'mt-4 flex flex-col gap-3' : ''}`}>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddDialog(false);
                  setIsEditing(false);
                  setEditingShift(null);
                }}
                className={isMobile ? 'w-full py-2.5 mb-1' : ''}
              >
                Annuler
              </Button>
              <Button onClick={handleSaveShift} className={isMobile ? 'w-full py-2.5' : ''}>
                {isEditing ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Bouton d'action flottant pour mobile */}
        {isMobile && (
          <div className="fixed bottom-4 right-4 z-10">
            <Button 
              size="icon" 
              className="h-12 w-12 rounded-full shadow-lg"
              onClick={() => handleOpenAddDialog()}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        )}
        
        {/* Popup de partage du planning - Version optimisée pour mobile */}
        {showShareDialog && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 touch-none animate-in fade-in duration-200" 
               onClick={() => setShowShareDialog(false)}>
            <div className="bg-white dark:bg-background rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-auto animate-in slide-in-from-bottom-10 duration-300"
                 onClick={(e) => e.stopPropagation()}>
              {/* Header fixe avec dégradé */}
              <div className="sticky top-0 z-10 bg-gradient-to-b from-white to-white/95 dark:from-background dark:to-background/95 backdrop-blur-sm pt-5 pb-4 px-5 rounded-t-xl border-b">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-xl font-bold">Partager le planning</h2>
                  <button 
                    className="rounded-full p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowShareDialog(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Vérifiez l'état de chaque jour avant de partager
                </p>
              </div>
              
              <div className="p-5 space-y-5">
                {/* Status général du planning */}
                <div className="p-4 rounded-xl border-2 border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                  <div className="flex items-center gap-2.5 mb-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                    <span className="font-medium text-amber-800 dark:text-amber-400 text-[15px]">Vérification du planning</span>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300 ml-[30px]">
                    Vérifiez l'état de chaque jour avant de partager.
                  </p>
                </div>
                
                {/* Liste des jours avec statut - Style cards avec ombres */}
                <div className="space-y-3 pb-1">
                  {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
                    const totalHours = getDayTotalHours(dayIndex);
                    const employeeCount = getUniqueEmployeesForDay(dayIndex).length;
                    const dayAlerts = getDayAlerts(dayIndex);
                    const hasCriticalAlerts = dayAlerts.some(alert => alert.type === 'error');
                    const hasWarningAlerts = dayAlerts.some(alert => alert.type === 'warning');
                    const isValid = !hasCriticalAlerts && !hasWarningAlerts;
                    
                    // Calculer la date du jour
                    const dateOfDay = new Date(currentDate);
                    const currentDayOfWeek = getDayIndex(currentDate);
                    const daysToAdd = dayIndex - currentDayOfWeek;
                    dateOfDay.setDate(dateOfDay.getDate() + daysToAdd);
                    
                    // Statut visuel
                    let statusColor = "bg-gray-400";
                    let statusText = "Non vérifié";
                    let cardBg = "bg-gray-50 border-gray-200 dark:border-gray-700";
                    
                    if (hasCriticalAlerts) {
                      statusColor = "bg-red-500";
                      statusText = "À corriger";
                      cardBg = "bg-gradient-to-br from-red-50 to-red-50/70 dark:from-red-900/20 dark:to-red-900/10 border-red-200 dark:border-red-800";
                    } else if (hasWarningAlerts) {
                      statusColor = "bg-amber-500";
                      statusText = "À vérifier";
                      cardBg = "bg-gradient-to-br from-amber-50 to-amber-50/70 dark:from-amber-900/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-800";
                    } else if (isValid) {
                      statusColor = "bg-green-500";
                      statusText = "Validé";
                      cardBg = "bg-gradient-to-br from-green-50 to-green-50/70 dark:from-green-900/20 dark:to-green-900/10 border-green-200 dark:border-green-800";
                    }
                    
                    return (
                      <div 
                        key={dayIndex}
                        className={`p-4 rounded-xl border shadow-sm ${cardBg}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                              <span className="font-semibold text-[15px]">{dayNames[dayIndex]}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(dateOfDay, 'd MMMM', { locale: fr })}
                              </span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor} text-white font-medium ml-1`}>
                              {statusText}
                            </span>
                          </div>
                          <div className="text-sm font-medium">
                            {totalHours.toFixed(1)}h
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            <span>{employeeCount} employés</span>
                          </div>
                        </div>
                        
                        {/* Liste des alertes pour ce jour */}
                        {dayAlerts.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                            {dayAlerts
                              .filter(alert => alert.type !== 'success')
                              .map((alert, idx) => (
                                <div 
                                  key={idx}
                                  className={`text-xs flex items-start gap-1.5 ${
                                    alert.type === 'error' ? 'text-red-600 dark:text-red-400' :
                                    alert.type === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                                    'text-muted-foreground'
                                  }`}
                                >
                                  {alert.type === 'error' && <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                                  {alert.type === 'warning' && <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                                  <div>
                                    <span className="font-medium">{alert.title}</span>
                                    {alert.details && (
                                      <span className="ml-1 opacity-80">{alert.details}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Récapitulatif général */}
                <div className="p-3 rounded-xl border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-800 dark:text-blue-400">Récapitulatif</span>
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 pl-6 space-y-1">
                    <p>Total: {(() => {
                      let total = 0;
                      for (let i = 0; i < 7; i++) {
                        total += getDayTotalHours(i);
                      }
                      return total.toFixed(1);
                    })()}h sur la semaine</p>
                    <p>Employés: {(() => {
                      const uniqueEmployees = new Set();
                      shifts.forEach(shift => {
                        shift.employeeIds.forEach(id => uniqueEmployees.add(id));
                      });
                      return uniqueEmployees.size;
                    })()} au total</p>
                  </div>
                </div>
              </div>
              
              {/* Footer fixe avec dégradé */}
              <div className="sticky bottom-0 z-10 p-5 border-t bg-gradient-to-t from-white to-white/95 dark:from-background dark:to-background/95 backdrop-blur-sm rounded-b-xl">
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <button 
                    className="py-3 px-5 border rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setShowShareDialog(false)}
                  >
                    Annuler
                  </button>
                  <button 
                    className="py-3 px-5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors flex justify-center items-center gap-2"
                    onClick={() => {
                      handleShareSchedule();
                      setShowShareDialog(false);
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    Partager le planning
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default DailyPlanning; 