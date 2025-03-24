import { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { Shift, ShiftFormValues, ScheduleConflict, DaySummary } from '../types';
import { useShifts } from './useShifts';
import { generateTimeOptions, getDayIndex } from '../utils/time';
import { detectScheduleConflicts, isShiftInConflict } from '../utils/shifts';
import { mockEmployees, mockShifts, scheduleRules } from '../data/mockData';

// Type qui représente les conflits retournés par detectScheduleConflicts
interface ShiftConflict {
  employeeId: number;
  shifts: Shift[];
}

interface UseDailyPlanningResult {
  // États
  currentDate: Date;
  selectedTimeSlot: string | null;
  selectedEmployeeIds: number[];
  selectedEndTime: string | null;
  isEditMode: boolean;
  isAddShiftOpen: boolean;
  
  // Données dérivées
  dayIndex: number;
  shifts: Shift[];
  timeSlots: string[];
  dayConflicts: ShiftConflict[];
  hasDayConflicts: boolean;
  conflicts: ScheduleConflict[];
  weekSummary: DaySummary[];
  
  // Gestionnaires d'événements
  handlePreviousDay: () => void;
  handleNextDay: () => void;
  handleToday: () => void;
  handleTimeSlotSelect: (time: string) => void;
  handleAddShift: (formValues: ShiftFormValues) => void;
  handleGenerateSchedule: () => void;
  handleSharePlanning: () => void;
  closeShiftDrawer: () => void;
  openShiftDrawer: () => void;
  
  // Utilitaires
  getShiftsForDay: (dayIndex: number) => Shift[];
  isTimeSlotInConflict: (timeSlot: string) => boolean;
  timeToMinutes: (time: string) => number;
}

export const useDailyPlanning = (): UseDailyPlanningResult => {
  // États
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isAddShiftOpen, setIsAddShiftOpen] = useState<boolean>(false);
  
  // Récupérer l'index du jour (0 = Lundi, 6 = Dimanche)
  const dayIndex = getDayIndex(currentDate);
  
  // Hook personnalisé pour gérer les shifts
  const { 
    shifts, 
    addShift,
    deleteShift,
    updateShift,
    conflicts,
    weekSummary,
    generateSchedule
  } = useShifts({
    initialShifts: mockShifts,
    employees: mockEmployees,
    scheduleRules: scheduleRules
  });
  
  // Fonction pour récupérer les shifts d'un jour spécifique
  const getShiftsForDay = (dayIndex: number) => {
    return shifts.filter(shift => shift.day === dayIndex);
  };
  
  // Créneaux horaires pour la journée
  const timeSlots = generateTimeOptions(
    dayIndex === 3 || dayIndex === 4 || dayIndex === 5 // Jeudi, Vendredi, Samedi
  );
  
  // Détecter les conflits pour ce jour
  const dayConflicts = detectScheduleConflicts(shifts, mockEmployees, dayIndex);
  
  // Vérifier s'il y a des conflits pour le jour actuel
  const hasDayConflicts = dayConflicts.length > 0;
  
  // Gestionnaires d'événements
  const handlePreviousDay = () => setCurrentDate(prev => subDays(prev, 1));
  const handleNextDay = () => setCurrentDate(prev => addDays(prev, 1));
  const handleToday = () => setCurrentDate(new Date());
  
  const handleTimeSlotSelect = (time: string) => {
    setSelectedTimeSlot(time);
    setIsAddShiftOpen(true);
  };
  
  const handleAddShift = (formValues: ShiftFormValues) => {
    const newShift: Omit<Shift, 'id' | 'status'> = {
      employeeIds: formValues.employeeIds,
      day: formValues.day,
      startTime: formValues.startTime,
      endTime: formValues.endTime
    };
    
    // Vérifier s'il y a des conflits
    if (isShiftInConflict(shifts, mockEmployees, newShift)) {
      window.alert("Ce shift crée un conflit d'horaire pour un ou plusieurs employés");
    }
    
    addShift(newShift);
    setIsAddShiftOpen(false);
    setSelectedTimeSlot(null);
  };
  
  const handleGenerateSchedule = () => {
    generateSchedule(dayIndex);
    window.alert("Planning généré avec succès pour ce jour!");
  };
  
  const handleSharePlanning = () => {
    // Vérifier si les jours sont complets avant de partager
    const incompleteDays = [0, 1, 2, 3, 4, 5, 6].filter(day => {
      const shifts = getShiftsForDay(day);
      return shifts.length < 2; // Considérer un jour comme incomplet s'il a moins de 2 shifts
    });
    
    if (incompleteDays.length > 0) {
      const daysNames = incompleteDays.map(day => 
        ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][day]
      ).join(', ');
      
      // Afficher un message d'avertissement
      if (window.confirm(`Attention: les jours suivants sont incomplets: ${daysNames}. Voulez-vous quand même partager le planning?`)) {
        // Logique de partage si confirmé
        window.alert("Le planning a été partagé malgré les jours incomplets");
      }
    } else {
      // Tous les jours sont complets, partager directement
      window.alert("Le planning a été partagé avec succès");
    }
  };
  
  // Ouvrir/fermer le tiroir d'ajout de shift
  const openShiftDrawer = () => setIsAddShiftOpen(true);
  const closeShiftDrawer = () => setIsAddShiftOpen(false);
  
  // Vérifier si un créneau est en conflit
  const isTimeSlotInConflict = (timeSlot: string): boolean => {
    // Vérifier si le conflit a les propriétés requises
    const validConflicts = dayConflicts.filter(
      (conflict): conflict is ScheduleConflict & { startTime: string; endTime: string } => 
        'startTime' in conflict && 'endTime' in conflict && 
        typeof conflict.startTime === 'string' && 
        typeof conflict.endTime === 'string'
    );
    
    return validConflicts.some(conflict => {
      const startMinutes = timeToMinutes(conflict.startTime);
      const endMinutes = timeToMinutes(conflict.endTime);
      const slotMinutes = timeToMinutes(timeSlot);
      
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });
  };
  
  // Convertir un temps en minutes (pour les comparaisons)
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  return {
    // États
    currentDate,
    selectedTimeSlot,
    selectedEmployeeIds,
    selectedEndTime,
    isEditMode,
    isAddShiftOpen,
    
    // Données dérivées
    dayIndex,
    shifts,
    timeSlots,
    dayConflicts,
    hasDayConflicts,
    conflicts,
    weekSummary,
    
    // Gestionnaires d'événements
    handlePreviousDay,
    handleNextDay,
    handleToday,
    handleTimeSlotSelect,
    handleAddShift,
    handleGenerateSchedule,
    handleSharePlanning,
    closeShiftDrawer,
    openShiftDrawer,
    
    // Utilitaires
    getShiftsForDay,
    isTimeSlotInConflict,
    timeToMinutes
  };
}; 